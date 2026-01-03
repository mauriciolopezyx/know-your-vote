import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from typing import Generator
import json

load_dotenv()

@contextmanager
def get_db_connection() -> Generator[psycopg2.extensions.connection, None, None]:
    conn = psycopg2.connect(os.environ.get("DATABASE_URL"))
    try:
        yield conn
    finally:
        conn.close()

def create_assessment(user_id: str, classification: str, confidence_score: float) -> str:
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO user_assessments (user_id, classification, confidence_score)
                VALUES (%s, %s, %s)
                RETURNING id
                """,
                (user_id, classification, confidence_score)
            )
            result = cur.fetchone()
            conn.commit()
            return str(result["id"])

def create_assessment_response(
    assessment_id: str,
    question_id: int,
    response_text: str,
    extracted_concepts: dict
) -> None:
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO assessment_responses 
                (assessment_id, question_id, response_text, extracted_concepts)
                VALUES (%s, %s, %s, %s)
                """,
                (assessment_id, question_id, response_text, json.dumps(extracted_concepts))
            )
            conn.commit()

def create_knowledge_gap(
    assessment_id: str,
    domain: str,
    domain_score: float,
    gaps_identified: list[str],
    priority: int
) -> None:
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO user_knowledge_gaps 
                (assessment_id, domain, domain_score, gaps_identified, priority)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (assessment_id, domain, domain_score, json.dumps(gaps_identified), priority)
            )
            conn.commit()

def get_question_domains() -> dict[int, str]:
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, domain 
                FROM assessment_questions 
                ORDER BY question_order
                """
            )
            results = cur.fetchall()
            return {row["id"]: row["domain"] for row in results}
        
def assign_lessons_to_user(user_id: str, gap_domains: list[str]) -> None:
    """
    Assigns lessons to user based on their knowledge gaps.
    - All users get Tier 1 (core) lessons
    - Users get Tier 2 (targeted) lessons based on their gap domains
    - Tier 3 (optional) lessons are not assigned automatically
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Get all Tier 1 (core) lessons
            cur.execute(
                """
                SELECT id FROM lessons WHERE tier = 'core'
                """
            )
            core_lessons = [row["id"] for row in cur.fetchall()]
            
            # Get Tier 2 (targeted) lessons that match gap domains
            cur.execute(
                """
                SELECT id, target_domains FROM lessons WHERE tier = 'targeted'
                """
            )
            targeted_lessons = cur.fetchall()
            
            lessons_to_assign = []
            
            # Assign all core lessons
            for lesson_id in core_lessons:
                lessons_to_assign.append((user_id, lesson_id, "core"))
            
            # Assign targeted lessons if any target domain matches user's gaps
            for lesson in targeted_lessons:
                lesson_domains = lesson["target_domains"] or []
                if any(domain in gap_domains for domain in lesson_domains):
                    lessons_to_assign.append((user_id, lesson["id"], "gap_targeted"))
            
            # Bulk insert assignments
            if lessons_to_assign:
                cur.executemany(
                    """
                    INSERT INTO user_lesson_assignments (user_id, lesson_id, assignment_reason)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (user_id, lesson_id) DO NOTHING
                    """,
                    lessons_to_assign
                )
                
                # Initialize progress tracking for each assigned lesson
                progress_entries = [(user_id, lesson_id) for user_id, lesson_id, _ in lessons_to_assign]
                cur.executemany(
                    """
                    INSERT INTO user_lesson_progress (user_id, lesson_id, status)
                    VALUES (%s, %s, 'not_started')
                    ON CONFLICT (user_id, lesson_id) DO NOTHING
                    """,
                    progress_entries
                )
                
            conn.commit()