import os
from dotenv import load_dotenv
from langgraph.graph import StateGraph, END
from google import genai
from types_module import (
    GraphState,
    ExtractedConcepts,
    DomainEvaluation,
    AssessmentClassification,
    QuestionResponse
)
from db import (
    create_assessment,
    create_assessment_response,
    create_knowledge_gap,
    get_question_domains
)
import json

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

def extract_concepts_node(state: GraphState) -> GraphState:
    extracted_data: dict[int, ExtractedConcepts] = {}
    
    for response in state["responses"]:
        prompt = f"""Analyze this civic knowledge response and extract:
1. Key concepts mentioned (e.g., "federalism", "supremacy clause", "judicial review")
2. Any misconceptions present (e.g., confusing House/Senate roles, misunderstanding checks and balances)
3. Confidence level of the responder (high/medium/low based on clarity and accuracy)

Question ID: {response.question_id}
Response: {response.response_text}

Respond ONLY with valid JSON in this exact format:
{{
  "key_concepts": ["concept1", "concept2"],
  "misconceptions": ["misconception1"],
  "confidence_level": "high"
}}"""
        
        result = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt,
            config={"temperature": 0.3}
        )
        
        content = result.text.strip()
        
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        parsed = json.loads(content)
        extracted_data[response.question_id] = ExtractedConcepts(**parsed)
    
    state["extracted_data"] = extracted_data
    return state

def evaluate_domains_node(state: GraphState) -> GraphState:
    question_domains = get_question_domains()
    domain_responses: dict[str, list[tuple[int, QuestionResponse, ExtractedConcepts]]] = {
        "government_structure": [],
        "elections": [],
        "lawmaking": [],
        "media_literacy": []
    }
    
    for response in state["responses"]:
        domain = question_domains[response.question_id]
        extracted = state["extracted_data"][response.question_id]
        domain_responses[domain].append((response.question_id, response, extracted))
    
    domain_evaluations: list[DomainEvaluation] = []
    
    rubrics = {
        "government_structure": [
            "Understands three branches of government",
            "Knows separation of powers",
            "Understands federalism and state vs federal authority",
            "Recognizes role of judicial review"
        ],
        "elections": [
            "Understands representative democracy",
            "Knows ways to engage with representatives",
            "Understands voting and civic participation"
        ],
        "lawmaking": [
            "Can explain basic bill-to-law process",
            "Understands role of Congress",
            "Knows about presidential veto and override"
        ],
        "media_literacy": [
            "Can distinguish news from opinion",
            "Understands bias and sourcing",
            "Recognizes importance of critical reading"
        ]
    }
    
    for domain, responses_list in domain_responses.items():
        if not responses_list:
            continue
        
        responses_text = "\n\n".join([
            f"Q{qid}: {resp.response_text}\nExtracted: {ext.model_dump_json()}"
            for qid, resp, ext in responses_list
        ])
        
        prompt = f"""Evaluate this domain: {domain}

Rubric criteria:
{chr(10).join(f"- {criterion}" for criterion in rubrics[domain])}

User responses:
{responses_text}

Provide:
1. Score (0.0-1.0): How well they understand this domain
2. Specific gaps (e.g., "federalism_misunderstanding", "bill_process_incomplete")
3. Priority (1=critical gap, 2=moderate gap, 3=minor gap)

Respond ONLY with valid JSON. Example:
{{
  "score": 0.75,
  "gaps_identified": ["gap1", "gap2"],
  "priority": 2
}}"""
        
        result = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={"temperature": 0.3}
        )
        
        content = result.text.strip()
        
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        parsed = json.loads(content)
        domain_evaluations.append(
            DomainEvaluation(
                domain=domain,
                score=parsed["score"],
                gaps_identified=parsed["gaps_identified"],
                priority=parsed["priority"]
            )
        )
    
    state["domain_evaluations"] = domain_evaluations
    return state

def classify_user_node(state: GraphState) -> GraphState:
    domain_scores = {de.domain: de.score for de in state["domain_evaluations"]}
    avg_score = sum(domain_scores.values()) / len(domain_scores) if domain_scores else 0
    
    all_gaps = []
    for de in state["domain_evaluations"]:
        all_gaps.extend(de.gaps_identified)
    
    prompt = f"""Classify this user's civic knowledge level.

Domain scores: {json.dumps(domain_scores)}
Average score: {avg_score:.2f}
Identified gaps: {json.dumps(all_gaps)}

Classification rules:
- "needs_foundations": avg_score < 0.4 OR major gaps in 3+ domains
- "partial": avg_score 0.4-0.7 OR significant gaps in 1-2 domains
- "strong": avg_score > 0.7 AND minimal gaps

Respond ONLY with valid JSON:
{{
  "classification": "partial",
  "confidence_score": 0.85,
  "reasoning": "User shows understanding of X but struggles with Y..."
}}"""
    
    result = client.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents=prompt,
        config={"temperature": 0.3}
    )
    
    content = result.text.strip()
    
    if content.startswith("```json"):
        content = content[7:]
    if content.endswith("```"):
        content = content[:-3]
    content = content.strip()
    
    parsed = json.loads(content)
    state["final_classification"] = AssessmentClassification(**parsed)
    return state

def persist_results_node(state: GraphState) -> GraphState:
    classification = state["final_classification"]
    
    assessment_id = create_assessment(
        state["user_id"],
        classification.classification,
        classification.confidence_score
    )
    
    state["assessment_id"] = assessment_id
    
    for response in state["responses"]:
        extracted = state["extracted_data"][response.question_id]
        create_assessment_response(
            assessment_id,
            response.question_id,
            response.response_text,
            extracted.model_dump()
        )
    
    for domain_eval in state["domain_evaluations"]:
        create_knowledge_gap(
            assessment_id,
            domain_eval.domain,
            domain_eval.score,
            domain_eval.gaps_identified,
            domain_eval.priority
        )
    
    return state

def create_assessment_graph() -> StateGraph:
    workflow = StateGraph(GraphState)
    
    workflow.add_node("extract_concepts", extract_concepts_node)
    workflow.add_node("evaluate_domains", evaluate_domains_node)
    workflow.add_node("classify_user", classify_user_node)
    workflow.add_node("persist_results", persist_results_node)
    
    workflow.set_entry_point("extract_concepts")
    workflow.add_edge("extract_concepts", "evaluate_domains")
    workflow.add_edge("evaluate_domains", "classify_user")
    workflow.add_edge("classify_user", "persist_results")
    workflow.add_edge("persist_results", END)
    
    return workflow.compile()