from datetime import datetime
from typing import Optional
from uuid import uuid4

from config.db import db
from schemas.quizSchema import QuizCreate, QuizResponse, QuizUpdate
print(db)
print(type(db))
collection = db["quizzes"]


def create_quiz(payload: QuizCreate) -> QuizResponse:
    now = datetime.utcnow()

    quiz = QuizResponse(
        id=str(uuid4()),
        createdAt=now,
        updatedAt=now,
        **payload.model_dump()
    )

    collection.insert_one(quiz.model_dump())

    return quiz


def get_quizzes() -> list[QuizResponse]:
    quizzes = []

    for doc in collection.find({}, {"_id": 0}):
        quizzes.append(QuizResponse(**doc))

    return quizzes


def get_quiz(quiz_id: str) -> Optional[QuizResponse]:
    doc = collection.find_one({"id": quiz_id}, {"_id": 0})

    if doc is None:
        return None

    return QuizResponse(**doc)


def update_quiz(quiz_id: str, payload: QuizUpdate) -> Optional[QuizResponse]:
    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        return get_quiz(quiz_id)

    update_data["updatedAt"] = datetime.utcnow()

    result = collection.update_one(
        {"id": quiz_id},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        return None

    return get_quiz(quiz_id)


def delete_quiz(quiz_id: str) -> bool:
    result = collection.delete_one({"id": quiz_id})
    return result.deleted_count > 0