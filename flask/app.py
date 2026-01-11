from flask import Flask, request, jsonify, make_response
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
from pydantic import ValidationError
from types_module import AssessmentRequest
from assessment_graph import create_assessment_graph

load_dotenv()

app = Flask(__name__)
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["100 per hour"],
    storage_uri="memory://"
)
assessment_graph = create_assessment_graph()

@app.route("/assess", methods=["POST", "OPTIONS"])
@limiter.limit("2 per minute")
def assess():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    try:
        assessment_request = AssessmentRequest(**data)
    except ValidationError as e:
        return jsonify({"error": "Invalid request data", "details": e.errors()}), 400
    
    initial_state = {
        "user_id": assessment_request.user_id,
        "responses": assessment_request.responses,
        "extracted_data": {},
        "domain_evaluations": [],
        "final_classification": None,
        "assessment_id": None
    }
    
    final_state = assessment_graph.invoke(initial_state)
    
    return _corsify_actual_response(jsonify({
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
    })), 200

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200

@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "ok"}), 200

def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response

def _corsify_actual_response(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=5000)