"""
Seed the Supabase `transcriptions` table with demo data so the app is
browsable without a microphone or a live recording.

Run from the backend directory:
    poetry run python seed_demo.py

Idempotent: it deletes any existing rows whose patient_id starts with "DEMO-"
before inserting a fresh set.

Demo patient DEMO-1001 gets two visits:
  1. A completed encounter with a fully generated note (instant "View Note").
  2. An encounter with no note yet, so a reviewer can click "Generate" and
     watch Claude produce the structured note live.
"""

from datetime import datetime, timedelta, timezone
import os

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise SystemExit("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

PATIENT_ID = "DEMO-1001"

now = datetime.now(timezone.utc)

# --- Visit 1: completed encounter with a generated note ----------------------

# Note: mirrors what Deepgram (nova-2, smart_format, diarize=True) returns —
# a speaker-labeled transcript. Deepgram emits speaker *indices*, so turns are
# labeled "Speaker 0" / "Speaker 1" rather than "Doctor" / "Patient".
VISIT_1_TRANSCRIPT = "\n".join([
    "Speaker 0: Good morning, what brings you in today?",
    "Speaker 1: I've had a really sore throat for about three days now, and a dry "
    "cough that keeps me up at night.",
    "Speaker 0: Any fever, chills, or trouble swallowing?",
    "Speaker 1: No fever that I've measured, but swallowing is pretty painful. No "
    "chills.",
    "Speaker 0: Any known allergies or medications you're currently taking?",
    "Speaker 1: I'm allergic to penicillin, it gives me hives. I take lisinopril "
    "10 milligrams daily for blood pressure, nothing else.",
    "Speaker 0: Let me take a look. Your throat is red with some swelling, no pus "
    "on the tonsils. Lungs are clear. Blood pressure today is 128 over 80, "
    "temperature 98.9, heart rate 76. This looks like acute viral pharyngitis. "
    "I'd recommend rest, warm fluids, and ibuprofen 400 milligrams every six "
    "hours as needed for the pain. Since you're allergic to penicillin we'll "
    "avoid that entirely. If it isn't improving in a week, or you develop a fever "
    "above 101, come back in.",
    "Speaker 1: Sounds good, thank you.",
])

# Each field carries its provenance: `value` is the structured text, `source`
# is the verbatim transcript span that supports it (null when inferred), and
# `confidence` reflects how directly the transcript backs the value. This is the
# shape /ai/extract_form_data now returns, and what the note screen renders.
VISIT_1_FORMS = {
    "reason_for_visit": {
        "value": "Sore throat and dry nocturnal cough for three days.",
        "source": (
            "Speaker 1: I've had a really sore throat for about three days now, "
            "and a dry cough that keeps me up at night."
        ),
        "confidence": "high",
    },
    "history_of_present_illness": {
        "value": (
            "3-day history of sore throat with painful swallowing and a dry cough "
            "that disrupts sleep. Denies measured fever or chills."
        ),
        "source": (
            "Speaker 1: No fever that I've measured, but swallowing is pretty "
            "painful. No chills."
        ),
        "confidence": "high",
    },
    "current_medications": {
        "value": "Lisinopril 10 mg PO daily.",
        "source": (
            "Speaker 1: I take lisinopril 10 milligrams daily for blood pressure, "
            "nothing else."
        ),
        "confidence": "high",
    },
    "allergies": {
        "value": "Penicillin (hives).",
        "source": "Speaker 1: I'm allergic to penicillin, it gives me hives.",
        "confidence": "high",
    },
    "review_of_systems": {
        "value": (
            "Positive for sore throat, odynophagia, and dry cough. Denies fever, "
            "chills, shortness of breath."
        ),
        "source": (
            "Speaker 1: No fever that I've measured, but swallowing is pretty "
            "painful. No chills."
        ),
        "confidence": "medium",
    },
    "vital_signs": {
        "value": "BP 128/80, HR 76, Temp 98.9F.",
        "source": (
            "Speaker 0: Blood pressure today is 128 over 80, temperature 98.9, "
            "heart rate 76."
        ),
        "confidence": "high",
    },
    "examination": {
        "value": (
            "Oropharynx erythematous with mild tonsillar swelling, no exudate. "
            "Lungs clear to auscultation bilaterally."
        ),
        "source": (
            "Speaker 0: Your throat is red with some swelling, no pus on the "
            "tonsils. Lungs are clear."
        ),
        "confidence": "high",
    },
    "assessments": {
        "value": "Acute viral pharyngitis (J02.9).",
        "source": "Speaker 0: This looks like acute viral pharyngitis.",
        # The ICD-10 code J02.9 was supplied by the model, not stated aloud.
        "confidence": "low",
    },
    "treatment_plan": {
        "value": (
            "Supportive care: rest, warm fluids, ibuprofen 400 mg PO q6h PRN pain. "
            "Antibiotics withheld given viral presentation and penicillin allergy."
        ),
        "source": (
            "Speaker 0: I'd recommend rest, warm fluids, and ibuprofen 400 "
            "milligrams every six hours as needed for the pain. Since you're "
            "allergic to penicillin we'll avoid that entirely."
        ),
        "confidence": "high",
    },
    "follow_up_short": {
        "value": "Return in 1 week if not improving, or sooner if fever >101F.",
        "source": (
            "Speaker 0: If it isn't improving in a week, or you develop a fever "
            "above 101, come back in."
        ),
        "confidence": "high",
    },
    "visit_codes": {
        "value": "99213",
        # E/M level inferred from visit complexity, never stated in the room.
        "source": None,
        "confidence": "low",
    },
    "other_notes": {
        "value": "Penicillin allergy reviewed with patient and avoided.",
        "source": (
            "Speaker 0: Since you're allergic to penicillin we'll avoid that "
            "entirely."
        ),
        "confidence": "medium",
    },
}

# --- Visit 2: encounter with no note yet (reviewer can generate it live) ------

VISIT_2_TRANSCRIPT = "\n".join([
    "Speaker 0: Welcome back, how have things been since the last visit?",
    "Speaker 1: The throat cleared up completely, thanks. I'm actually here for "
    "my blood pressure follow-up.",
    "Speaker 0: Great. Any dizziness, headaches, or swelling in your ankles?",
    "Speaker 1: No dizziness, no headaches. Ankles are fine.",
    "Speaker 0: Have you been taking the lisinopril consistently?",
    "Speaker 1: Every morning, yes.",
    "Speaker 0: Your blood pressure today is 122 over 78, which is right where we "
    "want it. Heart rate 72, and your weight is stable at 180 pounds. Lungs are "
    "clear and heart sounds are normal. Everything looks well controlled. Let's "
    "continue the lisinopril at 10 milligrams daily and recheck in three months. "
    "Keep up the low-sodium diet and the walking.",
    "Speaker 1: Will do, thank you.",
])

rows = [
    {
        "patient_id": PATIENT_ID,
        "title": "Acute pharyngitis — initial visit",
        "transcript": VISIT_1_TRANSCRIPT,
        "forms": VISIT_1_FORMS,
        "time_completed": (now - timedelta(days=8)).isoformat(),
    },
    {
        "patient_id": PATIENT_ID,
        "title": "Hypertension follow-up (note not yet generated)",
        "transcript": VISIT_2_TRANSCRIPT,
        "forms": None,
        "time_completed": now.isoformat(),
    },
]


def main() -> None:
    # Clear prior demo data so re-running is safe.
    supabase.table("transcriptions").delete().like("patient_id", "DEMO-%").execute()

    result = supabase.table("transcriptions").insert(rows).execute()
    print(f"Seeded {len(result.data)} demo visits under patient_id '{PATIENT_ID}'.")
    print("Open the app, search that patient ID, and explore the visits.")


if __name__ == "__main__":
    main()
