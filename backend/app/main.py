from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.recording import router as transcribe_router
from app.routes.ai import router as ai_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "This is the root"}

app.include_router(transcribe_router)
app.include_router(ai_router)