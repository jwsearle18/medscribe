from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from anthropic import Anthropic
from typing import Optional, Literal
import os

router = APIRouter(prefix="/ai", tags=["ai"])

# Initialize Anthropic client (reads ANTHROPIC_API_KEY from the environment)
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# The clinical note is a fixed set of fields. Each pairs a machine key with the
# instruction the model uses to fill it. Defining them once keeps the tool
# schema, the response model, and the PDF/note renderers in agreement.
FIELDS: list[tuple[str, str]] = [
    ("reason_for_visit",
     "A concise statement describing the patient's main concern or symptom that prompted the visit."),
    ("history_of_present_illness",
     "Detailed description of the current condition: onset, progression, treatment tried, and associated/absent symptoms."),
    ("current_medications",
     "List of medications (name, dose, route, frequency, PRN instructions). Indicate if reviewed with patient."),
    ("past_medical_history",
     "List of chronic or significant past illnesses, including resolved conditions."),
    ("surgical_history",
     "Chronological list of past surgeries/invasive procedures, with year and context."),
    ("family_history",
     "Relevant family history of chronic or genetic diseases, with affected relatives."),
    ("allergies",
     "Known allergies with reactions and severity."),
    ("hospitalizations_major_diagnostics",
     "Summary of significant hospital stays or diagnostic procedures, with reasons/outcomes."),
    ("review_of_systems",
     "Checklist of reported or denied symptoms across body systems."),
    ("vital_signs",
     "BP, HR, RR, Temp, SpO2, pain score — include repeated values if available."),
    ("examination",
     "Objective findings from physical exam, by system."),
    ("assessments",
     "List of active diagnoses and ICD-10 codes where applicable."),
    ("procedures",
     "Documentation of procedures, techniques, response, and post-care instructions."),
    ("treatment_plan",
     "Plan for managing the condition: meds, referrals, PT, surgery, etc."),
    ("follow_up_detailed",
     "Detailed instructions for return visits and early follow-up triggers."),
    ("preventive_medicine",
     "Preventive interventions or screenings (e.g., fall risk, vaccines)."),
    ("visit_codes",
     "E/M code that reflects today's visit complexity (e.g., 99213)."),
    ("procedure_codes",
     "CPT codes for procedures performed (e.g., 98928)."),
    ("follow_up_short",
     "Quick reference for when/why patient should return (e.g., '2 weeks - suture removal')."),
    ("other_notes",
     "Misc notes: consent, scribe name, post-procedure tolerance, education, etc."),
]


class TranscriptionInput(BaseModel):
    transcription: str = Field(..., description="The raw transcription of the patient-doctor interaction")
    model: str = Field(default="claude-opus-4-8", description="Anthropic model to use for analysis")


class FieldExtraction(BaseModel):
    """A single note field plus its provenance.

    `source` is the verbatim span from the transcript that supports the value,
    so the clinician can trace any claim back to what was actually said. It is
    None when the value was inferred or synthesized rather than stated outright.
    `confidence` reflects how directly the transcript supports the value.
    """
    value: str
    source: Optional[str] = None
    confidence: Literal["high", "medium", "low"] = "high"


class FormOutput(BaseModel):
    reason_for_visit: Optional[FieldExtraction] = None
    history_of_present_illness: Optional[FieldExtraction] = None
    current_medications: Optional[FieldExtraction] = None
    past_medical_history: Optional[FieldExtraction] = None
    surgical_history: Optional[FieldExtraction] = None
    family_history: Optional[FieldExtraction] = None
    allergies: Optional[FieldExtraction] = None
    hospitalizations_major_diagnostics: Optional[FieldExtraction] = None
    review_of_systems: Optional[FieldExtraction] = None
    vital_signs: Optional[FieldExtraction] = None
    examination: Optional[FieldExtraction] = None
    assessments: Optional[FieldExtraction] = None
    procedures: Optional[FieldExtraction] = None
    treatment_plan: Optional[FieldExtraction] = None
    follow_up_detailed: Optional[FieldExtraction] = None
    preventive_medicine: Optional[FieldExtraction] = None
    visit_codes: Optional[FieldExtraction] = None
    procedure_codes: Optional[FieldExtraction] = None
    follow_up_short: Optional[FieldExtraction] = None
    other_notes: Optional[FieldExtraction] = None


def _field_schema(description: str) -> dict:
    """Tool schema for one note field: the value plus its provenance."""
    return {
        "type": "object",
        "properties": {
            "value": {
                "type": "string",
                "description": description,
            },
            "source": {
                "type": ["string", "null"],
                "description": (
                    "The exact span from the transcript that supports this value, "
                    "quoted verbatim (including the speaker label if present). Use null "
                    "only when the value is inferred or synthesized rather than stated."
                ),
            },
            "confidence": {
                "type": "string",
                "enum": ["high", "medium", "low"],
                "description": (
                    "high = explicitly stated in the transcript; "
                    "medium = a reasonable inference from what was said; "
                    "low = a weak inference or clinical assumption not directly supported."
                ),
            },
        },
        "required": ["value", "confidence"],
    }


TOOL = {
    "name": "extract_medical_information",
    "description": (
        "Extract structured documentation from a physician-patient encounter. "
        "Include only fields for which the transcript actually provides information; "
        "omit the rest entirely. For every field you do include, quote the exact "
        "supporting text from the transcript in `source` and rate how directly the "
        "transcript supports it in `confidence`. Never invent clinical facts."
    ),
    "input_schema": {
        "type": "object",
        "properties": {name: _field_schema(desc) for name, desc in FIELDS},
        "required": [],
    },
}


@router.post("/extract_form_data", response_model=FormOutput, response_model_exclude_none=True)
async def extract_form_data(input_data: TranscriptionInput):
    try:
        response = client.messages.create(
            model=input_data.model,
            max_tokens=4096,
            messages=[
                {
                    "role": "user",
                    "content": f"Extract structured information from this medical transcription:\n\n{input_data.transcription}",
                }
            ],
            tools=[TOOL],
            tool_choice={"type": "tool", "name": "extract_medical_information"},
        )

        # Find the tool_use block Claude returned; its `input` is already a dict.
        tool_use = next(
            (block for block in response.content if block.type == "tool_use"),
            None,
        )
        if tool_use is None:
            raise HTTPException(status_code=500, detail="Model did not return structured form data")
        return FormOutput(**tool_use.input)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
