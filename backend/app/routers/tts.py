from fastapi import APIRouter, Body
from fastapi.responses import FileResponse
from app.ai_manager import convert_text_to_audio


router = APIRouter()

@router.post("/tts/")
async def tts(text: str = Body(...), voice: str = Body("alloy")):
    return await convert_text_to_audio(text, voice)