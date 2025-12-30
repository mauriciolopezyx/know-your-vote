from typing import TypedDict, Literal
from pydantic import BaseModel

class QuestionResponse(BaseModel):
    question_id: int
    response_text: str

class AssessmentRequest(BaseModel):
    user_id: str
    responses: list[QuestionResponse]

class ExtractedConcepts(BaseModel):
    key_concepts: list[str]
    misconceptions: list[str]
    confidence_level: Literal["high", "medium", "low"]

class DomainEvaluation(BaseModel):
    domain: Literal["government_structure", "elections", "lawmaking", "media_literacy"]
    score: float
    gaps_identified: list[str]
    priority: Literal[1, 2, 3]

class AssessmentClassification(BaseModel):
    classification: Literal["needs_foundations", "partial", "strong"]
    confidence_score: float
    reasoning: str

class GraphState(TypedDict):
    user_id: str
    responses: list[QuestionResponse]
    extracted_data: dict[int, ExtractedConcepts]
    domain_evaluations: list[DomainEvaluation]
    final_classification: AssessmentClassification | None
    assessment_id: str | None