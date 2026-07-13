
from rag.loaders.pdfloader import load_pdf
from rag.utils.cleantxt import clean_text
from rag.chunkers.recursiveChunk import chunk_document
from rag.embeddings.giminiEmbeddings import generate_embedding
from rag.storage.QdrantVS import save_chunks


async def ingest_document(pdf_path, metadata=None):
    if metadata is None:
        metadata = {}

    try:
        pdf = await load_pdf(pdf_path)
        cleaned_text = clean_text(pdf["text"])

        document_metadata = {**metadata, "pages": pdf["pages"]}

        chunks = chunk_document(cleaned_text, document_metadata)

        records = []
        for chunk in chunks:
            embedding = generate_embedding(chunk.page_content)

            # drop the "loc" field langchain adds, keep the rest
            chunk_metadata = {k: v for k, v in chunk.metadata.items() if k != "loc"}

            records.append(
                {
                    "pageContent": chunk.page_content,
                    "metadata": chunk_metadata,
                    "embedding": embedding,
                }
            )
            print(f"Embedding {len(records)}/{len(chunks)}")

        save_chunks(records)

        return {
            "document": metadata.get("source", pdf_path),
            "pages": pdf["pages"],
            "chunksCreated": len(chunks),
            "chunksStored": len(records),
            "status": "success",
        }

    except Exception as error:
        raise RuntimeError(f"Failed to ingest document: {error}")


if __name__ == "__main__":
    import sys
    import asyncio

    if len(sys.argv) < 2:
        print("Usage: python ingest_pipeline.py <path_to_pdf>")
    else:
        result = asyncio.run(ingest_document(sys.argv[1], {"source": sys.argv[1]}))
        print(result)