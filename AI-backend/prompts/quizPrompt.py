from typing import List
from langchain_core.documents import Document


class PromptBuilder:
    def __init__(self, num_questions: int = 20):
        self.num_questions = num_questions

    def build(self, chunks: List[Document]) -> str:
        """
        Build a prompt for quiz generation.
        """

        context = "\n\n".join(
            chunk.page_content for chunk in chunks
        )

        prompt = f"""
You are an expert educator and assessment designer.

Your task is to generate EXACTLY {self.num_questions} high-quality multiple-choice questions based ONLY on the provided context.

## Rules

- Generate EXACTLY {self.num_questions} questions.
- Do NOT use any outside knowledge.
- Cover as many different topics from the context as possible.
- Avoid duplicate or very similar questions.
- Questions should test understanding rather than simple memorization.
- Each question must have exactly 4 options.
- Only ONE option must be correct.
- The correctAnswer MUST exactly match one of the options.
- explanation should briefly explain why the answer is correct.
- topic should be a short topic name.
- difficulty must be one of:
  - Easy
  - Medium
  - Hard

Return ONLY valid JSON.

The JSON must follow this schema exactly:

{{
  "questions": [
    {{
      "question": "string",
      "options": [
        "option1",
        "option2",
        "option3",
        "option4"
      ],
      "correctAnswer": "string",
      "topic": "string",
      "difficulty": "Easy | Medium | Hard",
      "explanation": "string"
    }}
  ]
}}

Do NOT include:

- markdown
- ```json
- comments
- additional text
- notes
- explanations outside the JSON

Context:

{context}
"""

        return prompt.strip()