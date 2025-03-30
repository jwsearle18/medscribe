from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from openai import OpenAI
import json
import os
from textwrap import dedent

router = APIRouter(prefix="/ai", tags=["ai"])

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class TranscriptionInput(BaseModel):
    transcription: str = Field(..., description="The raw transcription of the patient-doctor interaction")
    model: str = Field(default="gpt-4-turbo-preview", description="OpenAI model to use for analysis")

class FormOutput(BaseModel):
    # We'll add the specific form fields here based on your requirements
    pass

@router.post("/extract_form_data", response_model=FormOutput)
async def extract_form_data(input_data: TranscriptionInput):
    try:
        response = client.chat.completions.create(
            model=input_data.model,
            messages=[
                {
                    "role": "user",
                    "content": f"Extract structured information from this medical transcription:\n\n{input_data.transcription}"
                }
            ],
            tools=[{
                "type": "function",
                "function": {
                    "name": "extract_medical_information",
                    "description": "Extract structured information from medical transcription",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            # We'll add the specific fields you want to extract here
                            # For example:
                            # "patient_name": {
                            #     "type": "string",
                            #     "description": "The patient's full name"
                            # }
                        },
                        "required": []  # We'll add required fields here
                    }
                }
            }],
            tool_choice={"type": "function", "function": {"name": "extract_medical_information"}}
        )
        
        # Get the function call response
        function_response = response.choices[0].message.tool_calls[0].function
        # Parse the JSON response
        form_data = json.loads(function_response.arguments)
        return FormOutput(**form_data)
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail="Failed to parse AI response as JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 