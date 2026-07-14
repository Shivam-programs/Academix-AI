from langchain_text_splitters import RecursiveCharacterTextSplitter


class TextChunker:
    def __init__(self, chunk_size=1000, chunk_overlap=200):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )

    def chunk(self, documents):
        """
        Split documents into smaller chunks.
        """
        return self.splitter.split_documents(documents)