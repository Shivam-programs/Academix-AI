from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class Question(BaseModel):
    id: Optional[str] = None
    question: str
    options: List[str]
    correctAnswer: str
    topic: str
    difficulty: str
    explanation: str


class Quiz(BaseModel):
    resourceId: str
    createdBy: str
    title: str
    difficulty: str
    totalQuestions: int
    questions: List[Question]