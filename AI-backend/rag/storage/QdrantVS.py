import os
import uuid
from dotenv import load_dotenv

load_dotenv()

try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import PointStruct, VectorParams, Distance
except ImportError as exc:
    raise ImportError("Install qdrant-client to use the RAG storage layer.") from exc

COLLECTION_NAME = "rag_chunks"
VECTOR_SIZE = 768  # must match your embedding model's output_dimensionality

client = QdrantClient(
    url=os.environ.get("QDRANT_URL", "http://localhost:6333"),
    check_compatibility=False,
)


def ensure_collection():
    try:
        existing = [c.name for c in client.get_collections().collections]
    except Exception as exc:
        raise RuntimeError(
            f"Could not connect to Qdrant at {os.environ.get('QDRANT_URL', 'http://localhost:6333')}. Start Qdrant or update QDRANT_URL. Details: {exc}"
        ) from exc

    if COLLECTION_NAME not in existing:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )

    return True


def save_chunks(records):
    """
    records: list of dicts like
        {"pageContent": str, "metadata": dict, "embedding": list[float]}
    """
    ensure_collection()
    points = []
    for record in records:
        points.append(
            PointStruct(
                id=str(uuid.uuid4()),
                vector=record["embedding"],
                payload={
                    "pageContent": record["pageContent"],
                    "metadata": record.get("metadata", {}),
                },
            )
        )

    client.upsert(collection_name=COLLECTION_NAME, points=points)
    return {"stored": len(points)}


def search_chunks(query_vector, top_k=5):
    ensure_collection()
    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=top_k,
    ).points

    return [
        {
            "pageContent": r.payload.get("pageContent"),
            "metadata": r.payload.get("metadata"),
            "score": r.score,
        }
        for r in results
    ]