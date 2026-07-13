
import fitz  


async def load_pdf(pdf_path):
    doc = fitz.open(pdf_path)

    pages_text = []
    for page in doc:
        pages_text.append(page.get_text())

    text = "\n".join(pages_text)
    pages = doc.page_count

    doc.close()

    return {"text": text, "pages": pages}


def load_pdf_sync(pdf_path):
    """Non-async version, in case you don't need to await it."""
    doc = fitz.open(pdf_path)

    pages_text = [page.get_text() for page in doc]
    text = "\n".join(pages_text)
    pages = doc.page_count

    doc.close()
    return {"text": text, "pages": pages}


if __name__ == "__main__":
    import sys
    import asyncio

    if len(sys.argv) < 2:
        print("Usage: python pdf_loader.py <path_to_pdf>")
    else:
        result = asyncio.run(load_pdf(sys.argv[1]))
        print(f"Pages: {result['pages']}")
        print(f"First 300 chars:\n{result['text'][:300]}")