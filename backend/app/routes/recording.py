from fastapi import APIRouter, HTTPException, status, Depends, Header
from dotenv import load_dotenv



load_dotenv()

transcribe_router = APIRouter(
    prefix = "/transcribe",
    tags=["record"]
)

recording = "recording will be stored here"

@router.post("/transcribe")
def transcribe(recording):


