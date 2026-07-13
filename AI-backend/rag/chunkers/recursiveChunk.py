
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document


def chunk_document(
    text,
    metadata=None,
    chunk_size=1000,
    chunk_overlap=200,
    separators=None,
):
    if metadata is None:
        metadata = {}

    if separators is None:
        separators = [
            "\n\n",
            "\n",
            ". ",
            "! ",
            "? ",
            "; ",
            ", ",
            " ",
            "",
        ]

    if not isinstance(text, str) or not text.strip():
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=separators,
    )

    document = Document(page_content=text, metadata=metadata)
    return splitter.split_documents([document])


if __name__ == "__main__":
    sample_text = "Paragraph one.\n\nParagraph two with more detail here. And another sentence."
    chunks = chunk_document(sample_text, {"source": "test.pdf"}, chunk_size=50, chunk_overlap=10)

    for i, c in enumerate(chunks, start=1):
        print(f"--- Chunk {i} ---")
        print(c.page_content)
        print(c.metadata)
        print()