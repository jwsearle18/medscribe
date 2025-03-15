from fastapi import APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from deepgram import DeepgramClient, PrerecordedOptions
import os


load_dotenv()

router = APIRouter(
    prefix = "/api",
    tags=["record"]
)

# Get Deepgram API key from environment variables
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
if not DEEPGRAM_API_KEY:
    raise ValueError("DEEPGRAM_API_KEY not found in environment variables")

# Initialize Deepgram client
deepgram = DeepgramClient(DEEPGRAM_API_KEY)

@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    """
    Transcribe an uploaded WebM audio file using Deepgram
    """
    try:
        # Check if file is WebM
        if not file.filename.endswith('.webm'):
            raise HTTPException(
                status_code=400,
                detail="Only WebM files are supported"
            )

        # Read the file contents
        audio_data = await file.read()

        # Configure Deepgram options
        options = PrerecordedOptions(
            smart_format=True,
            model="nova-2",
            language="en-US"
        )

        # Prepare the audio buffer
        source = {
            'buffer': audio_data,
            'mimetype': 'audio/webm'
        }

        # Send to Deepgram for transcription
        response = deepgram.listen.prerecorded.v('1').transcribe_file(
            source,
            options
        )

        # Extract the transcript from the response
        transcript = response['results']['channels'][0]['alternatives'][0]['transcript']
        
        return {
            "transcript": transcript,
            "full_response": response.to_dict()
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Transcription error: {str(e)}"
        )