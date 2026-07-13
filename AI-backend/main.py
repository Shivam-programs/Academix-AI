from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from config.db import SessionLocal
from rag.embeddings.giminiEmbeddings import generate_embedding
from rag.pipeline.IngestionPipeline import ingest_document
from rag.storage.QdrantVS import search_chunks

app = FastAPI(title="Academix AI Backend")


class IngestRequest(BaseModel):
    pdf_path: str
    metadata: dict | None = None


class QueryRequest(BaseModel):
    query: str
    top_k: int = 5


@app.get("/")
def home():
    if SessionLocal is None:
        return {"message": "Database is disabled for now. Set DATABASE_URL when you want DB checks enabled."}

    db = SessionLocal()
    try:
        return {"message": "Connected to database"}
    finally:
        db.close()


@app.post("/rag/ingest")
async def rag_ingest(payload: IngestRequest):
    if not payload.pdf_path or not payload.pdf_path.strip():
        raise HTTPException(status_code=400, detail="pdf_path is required")

    try:
        return await ingest_document(payload.pdf_path, metadata=payload.metadata or {})
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/rag/query")
def rag_query(payload: QueryRequest):
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="query is required")

    try:
        query_vector = generate_embedding(payload.query)
        results = search_chunks(query_vector, top_k=payload.top_k)
        return {"query": payload.query, "results": results}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)