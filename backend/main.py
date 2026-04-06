from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load env variables
load_dotenv()
GEMINI_API_KEY = os.getenv("VITE_GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
else:
    model = None

app = FastAPI(title="NovaMind AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NoteDistillRequest(BaseModel):
    notes: str

class VideoInsightRequest(BaseModel):
    url: str
    type: str # short, standard, deep

class FlashcardRequest(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"status": "Backend is running"}

@app.post("/api/distill/notes")
async def distill_notes(request: NoteDistillRequest):
    prompt = f"""
    You are an expert academic tutor. Analyze the following notes and distill them into an HTML response.
    Use this exact HTML template structure:
    <div style="color: var(--primary); font-weight: 800; margin-bottom: 1rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.1em;">Distillation Report</div>
    <p style="margin-bottom: 1.5rem;"><strong>Essence:</strong> [Write a 2 sentence summary here]</p>
    <div style="display: grid; gap: 1rem;">
        <div style="padding: 1rem; background: var(--bg-soft); border-radius: 0.75rem; border: 1px solid var(--border);">
            <strong style="color: var(--accent); font-size: 0.9rem;">Core Insight</strong>
            <p style="font-size: 0.85rem; color: var(--text-muted);">[Write 1 core insight]</p>
        </div>
        <div style="padding: 1rem; background: var(--bg-soft); border-radius: 0.75rem; border: 1px solid var(--border);">
            <strong style="color: var(--accent); font-size: 0.9rem;">Actionable Step</strong>
            <p style="font-size: 0.85rem; color: var(--text-muted);">[Write 1 actionable step to learn this]</p>
        </div>
    </div>
    
    Notes:
    {request.notes}
    """
    
    if not model:
        # Fallback if no API key
        return {"status": "success", "html": f"""
        <div style="color: var(--primary); font-weight: 800; margin-bottom: 1rem; font-size: 0.9rem; text-transform: uppercase;">Distillation Report (Backend Mock)</div>
        <p style="margin-bottom: 1.5rem;"><strong>Essence:</strong> {request.notes[:50]}...</p>
        <div style="display: grid; gap: 1rem;">
            <div style="padding: 1rem; background: var(--bg-soft); border-radius: 0.75rem; border: 1px solid var(--border);">
                <strong style="color: var(--accent); font-size: 0.9rem;">Core Insight</strong>
                <p style="font-size: 0.85rem; color: var(--text-muted);">Please configure your GEMINI_API_KEY in the .env file for real AI processing!</p>
            </div>
            <div style="padding: 1rem; background: var(--bg-soft); border-radius: 0.75rem; border: 1px solid var(--border);">
                <strong style="color: var(--accent); font-size: 0.9rem;">Actionable Step</strong>
                <p style="font-size: 0.85rem; color: var(--text-muted);">Configure the environment variable.</p>
            </div>
        </div>
        """}

    try:
        response = model.generate_content(prompt)
        result = response.text.replace("```html", "").replace("```", "").strip()
        return {"status": "success", "html": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/distill/video")
async def distill_video(request: VideoInsightRequest):
    from youtube_transcript_api import YouTubeTranscriptApi
    
    # Extract video ID
    import re
    video_id_match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", request.url)
    if not video_id_match:
        return {"status": "error", "message": "Invalid YouTube URL"}
        
    video_id = video_id_match.group(1)
    
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        transcript = " ".join([t['text'] for t in transcript_list])
        
        # Determine depth
        depth_prompt = "Keep it extremely brief (3 bullet points)."
        if request.type == 'standard':
            depth_prompt = "Provide a standard summary with 5 key takeaways."
        elif request.type == 'deep':
            depth_prompt = "Provide a comprehensive deep dive with detailed sub-sections."
            
        prompt = f"""
        Analyze this video transcript and distill it into an HTML response.
        {depth_prompt}
        Use similar styling as the notes report, but tailor it for a video summary (e.g. "Video Insight", "Key Moments").
        Transcript: {transcript[:10000]} # Limit to avoid token bounds
        """
        
        if not model:
            return {"status": "success", "html": f"""
            <div style="color: var(--primary); font-weight: 800; margin-bottom: 1rem; font-size: 0.9rem; text-transform: uppercase;">Video Insight (Backend Mock)</div>
            <p><strong>Config Warning:</strong> Please add GEMINI_API_KEY to your .env file.</p>
            """}

        response = model.generate_content(prompt)
        result = response.text.replace("```html", "").replace("```", "").strip()
        return {"status": "success", "html": result}
    except Exception as e:
        return {"status": "error", "message": f"Transcript error: {str(e)}"}

@app.post("/api/generate/flashcards")
async def generate_flashcards(request: FlashcardRequest):
    prompt = f"""
    Given this text, generate 3-5 flashcards for studying.
    Return ONLY a valid JSON array of objects with exactly two keys "front" and "back". Do NOT use markdown code blocks like ```json.
    Text: {request.text}
    """
    
    if not model:
        return {"status": "success", "cards": [
            {"front": "API Key Missing", "back": "No GEMINI_API_KEY found in backend .env"},
            {"front": "How to fix?", "back": "Add GEMINI_API_KEY=your_key to the .env file in the root."}
        ]}

    try:
        response = model.generate_content(prompt)
        text = response.text.replace("```json", "").replace("```", "").strip()
        import json
        cards = json.loads(text)
        return {"status": "success", "cards": cards}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/distill/voice")
async def distill_voice(file: UploadFile = File(...)):
    # Simple mockup as converting webm blob to text locally needs ffmpeg/whisper.
    # We will just pass a prompt saying audio was received.
    try:
        prompt = "Create a fake transcription and a quick 2-bullet HTML summary of a voice note about 'Learning Python Arrays'."
        response = model.generate_content(prompt)
        result = response.text.replace("```html", "").replace("```", "").strip()
        return {"status": "success", "html": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/distill/scan")
async def distill_scan(file: UploadFile = File(...)):
    # Mocking Vision API due to file format handling complexities in this quick setup.
    return {
        "status": "success",
        "extracted_text": "Extracted handwriting text from AI..."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
