from flask import Flask, request, jsonify
from dotenv import load_dotenv
from types_module import AssessmentRequest
from assessment_graph import create_assessment_graph

load_dotenv()

app = Flask(__name__)
assessment_graph = create_assessment_graph()

@app.route("/assess", methods=["POST"])
def assess():
    data = request.get_json()
    assessment_request = AssessmentRequest(**data)
    
    initial_state = {
        "user_id": assessment_request.user_id,
        "responses": assessment_request.responses,
        "extracted_data": {},
        "domain_evaluations": [],
        "final_classification": None,
        "assessment_id": None
    }
    
    final_state = assessment_graph.invoke(initial_state)
    
    return jsonify({
        "assessment_id": final_state["assessment_id"],
        "classification": final_state["final_classification"].classification,
        "confidence_score": final_state["final_classification"].confidence_score,
        "reasoning": final_state["final_classification"].reasoning,
        "domain_evaluations": [
            {
                "domain": de.domain,
                "score": de.score,
                "gaps_identified": de.gaps_identified,
                "priority": de.priority
            }
            for de in final_state["domain_evaluations"]
        ]
    }), 200

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200

if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=5000)