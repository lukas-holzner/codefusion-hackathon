from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
async def test_endpoint():
    return {
        "meeting-description": "dummy",
        "chat": ["message1", "message2"]
    }

# ... existing code (if any) ...
