import os
from dotenv import load_dotenv
from google import genai

load_dotenv()


class GeminiClient:
    def __init__(
        self,
        api_key: str | None = None,
        model: str = "gemini-2.5-flash",
    ):
        api_key = api_key or os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set.")

        self.client = genai.Client(api_key=api_key)
        self.model = model

    def generate(self, prompt: str) -> str:
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config={
                "temperature": 0.3,
                "response_mime_type": "application/json",
            },
        )

        return response.text.strip()