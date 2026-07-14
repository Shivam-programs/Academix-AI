from services.quizGenerationService import generateQuiz



def main():
    # Replace with an actual resource ID from your database
    resource = "2607.08892v1.pdf"

    try:
        quiz = generateQuiz(resource)

        print("Quiz generated successfully!")
        print(f"Title: {quiz.title}")
        print(f"Total Questions: {quiz.totalQuestions}")

        for i, question in enumerate(quiz.questions, start=1):
            print(f"\nQuestion {i}")
            print(question.question)
            print("Options:")
            for option in question.options:
                print(f" - {option}")
            print(f"Answer: {question.correctAnswer}")

    except Exception as e:
        print(f"Error generating quiz: {e}")


if __name__ == "__main__":
    main()