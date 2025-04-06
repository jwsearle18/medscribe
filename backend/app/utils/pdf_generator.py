from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
import os

def normalize_text(text: str) -> str:
    """
    Replace smart quotes and other unsupported characters with plain ASCII equivalents.
    """
    replacements = {
        "’": "'",
        "‘": "'",
        "“": '"',
        "”": '"',
        "–": "-",
        "—": "-",
        "…": "..."
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text

def wrap_text(text: str, max_width: float, c: canvas.Canvas, font_name="Helvetica", font_size=12) -> list:
    """
    Splits a string into lines that fit within the max_width using the specified font.
    """
    words = text.split()
    lines = []
    current_line = ""
    for word in words:
        test_line = current_line + (" " if current_line else "") + word
        if pdfmetrics.stringWidth(test_line, font_name, font_size) <= max_width:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line)
            current_line = word
    if current_line:
        lines.append(current_line)
    return lines

def draw_header(c: canvas.Canvas, width: float, height: float):
    """
    Draws a header with company title and logo on the top of each page.
    """
    header_text = "Patient Note"
    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, height - 40, header_text)
    
    # Build the absolute path to the logo.
    current_dir = os.path.dirname(os.path.abspath(__file__))
    logo_path = os.path.join(current_dir, "assets", "logo.png")
    
    if os.path.exists(logo_path):
        c.drawImage(logo_path, width - 110, height - 55, width=60, height=60, preserveAspectRatio=True)
    else:
        print("Logo not found at", logo_path)
        
    c.setStrokeColor(colors.grey)
    c.setLineWidth(1)
    c.line(50, height - 45, width - 50, height - 45)
    c.setStrokeColor(colors.black)

def generate_pdf(form_data: dict, filename: str):
    """
    Generate a static (non-editable) PDF with pre-filled text from form_data.
    Long text will wrap within the page margin, and a header is added on each page.
    """
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter

    # Draw header on the first page.
    draw_header(c, width, height)
    
    # Define fields (key and label).
    field_definitions = [
        ("reason_for_visit", "Reason for Visit"),
        ("history_of_present_illness", "History of Present Illness"),
        ("current_medications", "Current Medications"),
        ("past_medical_history", "Past Medical History"),
        ("surgical_history", "Surgical History"),
        ("family_history", "Family History"),
        ("allergies", "Allergies"),
        ("hospitalizations_major_diagnostics", "Hospitalizations / Diagnostics"),
        ("review_of_systems", "Review of Systems"),
        ("vital_signs", "Vital Signs"),
        ("examination", "Examination"),
        ("assessments", "Assessments"),
        ("procedures", "Procedures"),
        ("treatment_plan", "Treatment Plan"),
        ("follow_up_detailed", "Follow-Up (Detailed)"),
        ("preventive_medicine", "Preventive Medicine"),
        ("visit_codes", "Visit Codes"),
        ("procedure_codes", "Procedure Codes"),
        ("follow_up_short", "Follow-Up (Short)"),
        ("other_notes", "Other Notes")
    ]
    
    # Starting y position below title.
    current_y = height - 60

    for field_key, field_label in field_definitions:
        # If we run out of vertical space, add a new page.
        if current_y < 100:
            c.showPage()
            draw_header(c, width, height)
            c.setFont("Helvetica", 12)
            current_y = height - 60

        # Draw the label.
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, current_y, field_label + ":")
        current_y -= 20

        # Get text, normalize, and wrap.
        text = normalize_text(str(form_data.get(field_key, "")))
        lines = wrap_text(text, max_width=500, c=c, font_name="Helvetica", font_size=12)
        
        c.setFont("Helvetica", 12)
        for line in lines:
            c.drawString(50, current_y, line)
            current_y -= 15
        # Extra spacing.
        current_y -= 15

    c.save()

if __name__ == '__main__':
    sample_form_data = {
        "reason_for_visit": "Sprained ankle after basketball",
        "history_of_present_illness": "Patient jumped, landed awkwardly causing lateral ankle pain with swelling and bruising. It happened about 7 p.m. last night. Noticed swelling and bruising, initially pain was around a 7, now it is a 5 or 6. Icing helped, putting weight on it makes it worse.",
        "current_medications": "Ibuprofen 400mg as needed",
        "past_medical_history": "None",
        "surgical_history": "Wisdom teeth extraction at age 20",
        "family_history": "Non-contributory",
        "allergies": "None",
        "hospitalizations_major_diagnostics": "None",
        "review_of_systems": "Denies fever or chills; reports localized pain and swelling",
        "vital_signs": "BP 120/80, HR 72, Temp 98.6°F",
        "examination": "Tenderness and swelling over lateral ankle, limited range of motion",
        "assessments": "Lateral ankle sprain",
        "procedures": "X-ray ordered",
        "treatment_plan": "RICE, NSAIDs, possible physical therapy",
        "follow_up_detailed": "Follow up in 1 week if pain persists",
        "preventive_medicine": "None",
        "visit_codes": "99213",
        "procedure_codes": "",
        "follow_up_short": "1 week",
        "other_notes": "Patient advised to minimize weight-bearing and rest"
    }
    generate_pdf(sample_form_data, "generated_medical_form.pdf")
