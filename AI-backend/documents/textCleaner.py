import re


class TextCleaner:
    def clean(self, documents):
        """
        Clean text inside LangChain Document objects.
        """
        for doc in documents:
            text = doc.page_content

            # Remove extra whitespace
            text = re.sub(r"\s+", " ", text)

            # Remove unwanted special characters (optional)
            text = re.sub(r"[^\w\s.,!?;:()\-]", "", text)

            doc.page_content = text.strip()

        return documents