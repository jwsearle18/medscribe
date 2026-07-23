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

VISIT_1_FORMS = {
    "reason_for_visit": "Sore throat and dry nocturnal cough for three days.",
    "history_of_present_illness": (
        "3-day history of sore throat with painful swallowing and a dry cough that "
        "disrupts sleep. Denies measured fever or chills."
    ),
    "current_medications": "Lisinopril 10 mg PO daily.",
    "allergies": "Penicillin (hives).",
    "review_of_systems": (
        "Positive for sore throat, odynophagia, and dry cough. Denies fever, "
        "chills, shortness of breath."
    ),
    "vital_signs": "BP 128/80, HR 76, Temp 98.9F.",
    "examination": (
        "Oropharynx erythematous with mild tonsillar swelling, no exudate. Lungs "
        "clear to auscultation bilaterally."
    ),
    "assessments": "Acute viral pharyngitis (J02.9).",
    "treatment_plan": (
        "Supportive care: rest, warm fluids, ibuprofen 400 mg PO q6h PRN pain. "
        "Antibiotics withheld given viral presentation and penicillin allergy."
    ),
    "follow_up_short": "Return in 1 week if not improving, or sooner if fever >101F.",
    "visit_codes": "99213",
    "other_notes": "Penicillin allergy reviewed with patient and avoided.",
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
