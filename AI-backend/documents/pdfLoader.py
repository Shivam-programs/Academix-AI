from langchain_community.document_loaders import PyPDFLoader


class PDFLoader:
    def load(self, pdf_path: str):
        """
        Load PDF and return LangChain Document objects.
        """
        loader = PyPDFLoader(pdf_path)
        documents = loader.load()
        return documents