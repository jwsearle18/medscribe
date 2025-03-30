from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from openai import OpenAI
from typing import Optional
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
    reason_for_visit: Optional[str] = None
    history_of_present_illness: Optional[str] = None
    current_medications: Optional[str] = None
    past_medical_history: Optional[str] = None
    surgical_history: Optional[str] = None
    family_history: Optional[str] = None
    allergies: Optional[str] = None
    hospitalizations_major_diagnostics: Optional[str] = None
    review_of_systems: Optional[str] = None
    vital_signs: Optional[str] = None
    examination: Optional[str] = None
    assessments: Optional[str] = None
    procedures: Optional[str] = None
    treatment_plan: Optional[str] = None
    follow_up_detailed: Optional[str] = None
    preventive_medicine: Optional[str] = None
    visit_codes: Optional[str] = None
    procedure_codes: Optional[str] = None
    follow_up_short: Optional[str] = None
    other_notes: Optional[str] = None

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
                    "description": "Extract structured documentation from a physician-patient encounter. Return only information relevant to each section.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "reason_for_visit": {
                                "type": "string",
                                "description": "A concise statement describing the patient’s main concern or symptom that prompted the visit."
                            },
                            "history_of_present_illness": {
                                "type": "string",
                                "description": "Detailed description of the current condition: onset, progression, treatment tried, and associated/absent symptoms."
                            },
                            "current_medications": {
                                "type": "string",
                                "description": "List of medications (name, dose, route, frequency, PRN instructions). Indicate if reviewed with patient."
                            },
                            "past_medical_history": {
                                "type": "string",
                                "description": "List of chronic or significant past illnesses, including resolved conditions."
                            },
                            "surgical_history": {
                                "type": "string",
                                "description": "Chronological list of past surgeries/invasive procedures, with year and context."
                            },
                            "family_history": {
                                "type": "string",
                                "description": "Relevant family history of chronic or genetic diseases, with affected relatives."
                            },
                            "allergies": {
                                "type": "string",
                                "description": "Known allergies with reactions and severity."
                            },
                            "hospitalizations_major_diagnostics": {
                                "type": "string",
                                "description": "Summary of significant hospital stays or diagnostic procedures, with reasons/outcomes."
                            },
                            "review_of_systems": {
                                "type": "string",
                                "description": "Checklist of reported or denied symptoms across body systems."
                            },
                            "vital_signs": {
                                "type": "string",
                                "description": "BP, HR, RR, Temp, SpO2, pain score — include repeated values if available."
                            },
                            "examination": {
                                "type": "string",
                                "description": "Objective findings from physical exam, by system."
                            },
                            "assessments": {
                                "type": "string",
                                "description": "List of active diagnoses and ICD-10 codes where applicable."
                            },
                            "procedures": {
                                "type": "string",
                                "description": "Documentation of procedures, techniques, response, and post-care instructions."
                            },
                            "treatment_plan": {
                                "type": "string",
                                "description": "Plan for managing the condition: meds, referrals, PT, surgery, etc."
                            },
                            "follow_up_detailed": {
                                "type": "string",
                                "description": "Detailed instructions for return visits and early follow-up triggers."
                            },
                            "preventive_medicine": {
                                "type": "string",
                                "description": "Preventive interventions or screenings (e.g., fall risk, vaccines)."
                            },
                            "visit_codes": {
                                "type": "string",
                                "description": "E/M code that reflects today's visit complexity (e.g., 99213, 25)."
                            },
                            "procedure_codes": {
                                "type": "string",
                                "description": "CPT codes for procedures performed (e.g., 98928)."
                            },
                            "follow_up_short": {
                                "type": "string",
                                "description": "Quick reference for when/why patient should return (e.g., '2 weeks – suture removal')."
                            },
                            "other_notes": {
                                "type": "string",
                                "description": "Misc notes: consent, scribe name, post-procedure tolerance, education, etc."
                            }
                        },
                        "required": []
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