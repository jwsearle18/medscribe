from fastapi import APIRouter, HTTPException, status, Depends, Header
from dotenv import load_dotenv



load_dotenv()

router = APIRouter(
    prefix = "/api",
    tags=["record"]
)

recording = "recording will be stored here"

@router.post("/transcribe")
def transcribe(recording):


