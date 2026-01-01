from typing import TypedDict, Literal
from pydantic import BaseModel, field_validator, Field

class QuestionResponse(BaseModel):
    question_id: int = Field(..., gt=0, description="Question ID must be a positive integer")
    response_text: str = Field(..., min_length=1, description="Response text cannot be empty")
    
    @field_validator("response_text")
    @classmethod
    def validate_response_text(cls, v: str) -> str:
        if not v or v.strip() == "":
            raise ValueError("Response text cannot be empty or whitespace only")
        return v.strip()

class AssessmentRequest(BaseModel):
    user_id: str = Field(..., min_length=1, description="User ID cannot be empty")
    responses: list[QuestionResponse] = Field(..., min_length=6, max_length=6, description="Must provide exactly 6 responses")
    
    @field_validator("user_id")
    @classmethod
    def validate_user_id(cls, v: str) -> str:
        if not v or v.strip() == "":
            raise ValueError("User ID cannot be empty or whitespace only")
        return v.strip()

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