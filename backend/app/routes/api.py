from fastapi import APIRouter, HTTPException, UploadFile, File, status
from dotenv import load_dotenv
from deepgram import DeepgramClient, PrerecordedOptions
from supabase import create_client, Client
from pydantic import BaseModel
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
        return {
             "transcript": transcript,
             "full_response": response.to_dict()
         }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Transcription error: {str(e)}"
        )


class saveTranscription(BaseModel):
    patientId: str
    transcript: str
    title: str


@router.post("/save-transcription")
def saveTranscription(transcription: saveTranscription):
    try:
        data = {
            "patient_id": transcription.patientId,
            "transcript": transcription.transcript,
            "title": transcription.title,
        }
        # Insert the data into the transcriptions table.
        result = supabase.table("transcriptions").insert(data).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    

@router.get("/get-patient-data")
def getPatientData(patient_id: str):
    try:
        response = supabase.table("transcriptions")\
            .select("*")\
            .eq("patient_id", patient_id)\
            .order("time_completed", desc=True)\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
class SaveFormDataInput(BaseModel):
    patient_id: str
    visit_id: str
    forms: dict  # JSON data from the frontend

@router.post("/save-form-data")
def save_form_data(input_data: SaveFormDataInput):
    try:
        result = supabase.table("transcriptions")\
            .update({"forms": input_data.forms})\
            .eq("id", input_data.visit_id)\
            .eq("patient_id", input_data.patient_id)\
            .execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Visit not found")
        return {"message": "Form data saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
@router.get("/get-form-data")
def get_form_data(patient_id: str, visit_id: str):
    try:
        response = supabase.table("transcriptions")\
            .select("forms")\
            .eq("id", visit_id)\
            .eq("patient_id", patient_id)\
            .single()\
            .execute()
        if not response.data or "forms" not in response.data:
            raise HTTPException(status_code=404, detail="Form data not found")
        return response.data["forms"]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
@router.get("/search-transcriptions")
def search_transcriptions(q: str):
    try:
        response = supabase.table("transcriptions")\
            .select("patient_id")\
            .ilike("patient_id", f"%{q}%")\
            .limit(10)\
            .execute()
        
        # Deduplicate in case patient_id appears multiple times
        patient_ids = list({item['patient_id'] for item in response.data})
        return patient_ids
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))