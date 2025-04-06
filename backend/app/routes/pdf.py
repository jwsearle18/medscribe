from fastapi import APIRouter, HTTPException
from app.utils.pdf_generator import generate_pdf
from fastapi.responses import FileResponse

router = APIRouter(
    prefix="/pdf",
    tags=["pdf"]
)

@router.post("/generate")
async def create_pdf(data: dict):
    try:
        filename = "generated_medical_form.pdf"
        generate_pdf(data, filename)
        return FileResponse(path=filename, filename=filename, media_type='application/pdf')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
