from fastapi import APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from deepgram import DeepgramClient, PrerecordedOptions
from supabase import create_client, Client
import os


load_dotenv()

router = APIRouter(
    prefix = "/api",
    tags=["record"]
)

# Load environment variables
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not DEEPGRAM_API_KEY or not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing required environment variables")

# Initialize clients
deepgram = DeepgramClient(DEEPGRAM_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

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

        # Store transcription in Supabase
        data = {
            "transcript": transcript,
            "file_name": file.filename
            # Add "user_id" here if you implement authentication
        }

        supabase_response = supabase.table("transcriptions").insert(data).execute()

        if not supabase_response.data:
            raise HTTPException(status_code=500, detail="Failed to store transcription in Supabase")
        
        return {
            "transcript": transcript,
            "id": supabase_response.data[0]["id"],
            "full_response": response.to_dict()
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Transcription error: {str(e)}"
        )
    
@router.get("/transcriptions/{transcription_id}")
async def get_transcription(transcription_id: str):
    """
    Retrieve a transcription by ID from Supabase
    """
    try:
        response = supabase.table("transcriptions").select("*").eq("id", transcription_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Transcription not found")
        
        return response.data[0]
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving transcription: {str(e)}"
        )
    
@router.get("/transcriptions")
async def list_transcriptions():
    """
    List all transcriptions from Supabase
    """
    try:
        response = supabase.table("transcriptions").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error listing transcriptions: {str(e)}"
        )