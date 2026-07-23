# Bench2Bedside: Doctor-Patient Appointment Recorder & Note Generator

**Live demo:** https://medscribe-sigma.vercel.app — no microphone needed: open patient **DEMO-1001**, or use "Load a sample conversation" to run the full record → transcribe → AI note → PDF pipeline.

## Overview
Welcome to our project for the **Bench2Bedside Competition**! This software is designed to streamline the workflow of healthcare professionals by recording doctor-patient appointments and automatically generating detailed, accurate notes based on the conversation. Our goal is to save doctors time, reduce administrative burden, and improve the quality of patient care documentation.

## Features
- **Audio Recording**: Captures the full doctor-patient conversation with high-quality audio.
- **Speech-to-Text Conversion**: Transcribes the recorded audio into text using advanced speech recognition technology.
- **Note Generation**: Automatically creates structured medical notes, including key details like symptoms, diagnoses, treatment plans, and follow-ups.
- **Customizable Templates**: Allows doctors to tailor note formats to their specific needs or specialties.
- **Secure Storage**: Ensures all recordings and notes are stored securely, adhering to healthcare privacy standards (e.g., HIPAA compliance in progress).
- **User-Friendly Interface**: Simple and intuitive design for ease of use during busy schedules.
- **Web-Based Access**: Accessible from any device with a browser, no installation required.

## Purpose
This project aims to address the common pain point of time-consuming documentation in healthcare. By automating the note-taking process, doctors can focus more on patient interaction and less on paperwork, ultimately enhancing both efficiency and patient satisfaction.

## Tech Stack
- **Frontend**: [Next.js, TypeScript]
- **Backend**: [FastAPI]
- **Speech-to-Text Transcription**: [DeepGram]
- **Database**: [SupaBase]
- **Deployment**: [Vercel, Railway]

## Usage
1. Start a new recording session during a doctor-patient appointment.
2. Once the session ends, the software will process the audio and generate a draft note.
3. Review and edit the note as needed before saving or exporting it.

## Acknowledgments
- Thanks to the Beach2Bedside competition organizers for this opportunity.

---
