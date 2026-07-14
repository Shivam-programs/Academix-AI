from services.quizService import create_quiz

from llms.gemini import GeminiClient

from prompts.quizPrompt import PromptBuilder

from utils.jsonParser import ResponseParser

from documents.pdfLoader import PDFLoader
from documents.textCleaner import TextCleaner
from documents.textChunker import TextChunker

from models.quizModel import Quiz  # Your Pydantic Quiz model


pdf_loader = PDFLoader()
text_cleaner = TextCleaner()
text_chunker = TextChunker()

prompt_builder = PromptBuilder()
gemini = GeminiClient()


def generateQuiz(path):
    # Load PDF
    documents = pdf_loader.load(path)

    # Clean text
    cleaned = text_cleaner.clean(documents)

    # Split into chunks
    chunks = text_chunker.chunk(cleaned)

    # Build prompt
    prompt = prompt_builder.build(chunks)

    # Generate quiz
    response = gemini.generate(prompt)

    # Parse JSON
    quiz_data = ResponseParser.parse_json(response)

    # Build Quiz model
    quiz = Quiz(
        resourceId=str(path),
        createdBy=str(path),
        title=path,
        difficulty="Medium",
        totalQuestions=len(quiz_data["questions"]),
        questions=quiz_data["questions"],
    )

    # Validate
    quiz.model_validate(quiz)

    # Save
    return create_quiz(quiz)