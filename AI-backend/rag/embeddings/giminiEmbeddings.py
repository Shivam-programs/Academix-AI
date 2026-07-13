import os
from dotenv import load_dotenv

load_dotenv()

try:
    from google import genai
    from google.genai import types
except ImportError as exc:
    genai = None
    types = None
    _IMPORT_ERROR = exc
else:
    _IMPORT_ERROR = None


def _get_client():
    if genai is None or types is None:
        raise ImportError("Install the google-genai package to use Gemini embeddings.") from _IMPORT_ERROR

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set. Add it to your environment before using embeddings.")

    return genai.Client(api_key=api_key)


def generate_embedding(text):
    if not isinstance(text, str) or not text.strip():
        raise ValueError("Text must be a non-empty string.")

    client = _get_client()
    response = client.models.embed_content(
        model="gemini-embedding-2",
        contents=text,
        config=types.EmbedContentConfig(output_dimensionality=768),
    )

    if not response.embeddings:
        raise ValueError("No embedding returned by Gemini.")

    return response.embeddings[0].values


if __name__ == "__main__":
    vector = generate_embedding("This is a test sentence.")
    print(f"Vector length: {len(vector)}")
    print(f"First 5 values: {vector[:5]}")