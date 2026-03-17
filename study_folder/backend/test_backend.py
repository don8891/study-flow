import os
import requests
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from PIL import Image
import pytesseract
import json

# Setup environment similar to app.py
load_dotenv(override=True)

def clean_syllabus_text(text):
    lines = text.split("\n")
    cleaned = []
    for line in lines:
        line = line.strip()
        if len(line) < 5: continue
        # Strip leading numbers/bullets
        import re
        line = re.sub(r"^[0-9.\-\s]+", "", line)
        cleaned.append(line)
    return "\n".join(cleaned)

def generate_structured_topics(text):
    print(f"DEBUG: Attempting AI extraction for topics (Text length: {len(text)})")
    
    prompt = f"""
    Extract study topics from this syllabus text. 
    Return ONLY a list of topics, one per line.
    
    Syllabus Content:
    {text[:2000]}
    """

    try:
        # Using local Ollama (Llama 3) just like in app.py
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            },
            timeout=40
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get("response", "")
    except Exception as e:
        print(f"DEBUG: AI extraction failed: {e}")
        
    return ""

def test_extraction(filepath):
    print(f"Testing extraction for: {filepath}")
    extracted_text = ""
    if filepath.endswith(".pdf"):
        reader = PdfReader(filepath)
        for page in reader.pages:
            extracted_text += page.extract_text() or ""
    else:
        image = Image.open(filepath)
        extracted_text = pytesseract.image_to_string(image)
    
    print(f"Extracted raw text length: {len(extracted_text)}")
    cleaned_text = clean_syllabus_text(extracted_text)
    print(f"Cleaned text length: {len(cleaned_text)}")
    
    topics_raw = generate_structured_topics(cleaned_text)
    print(f"AI response: {topics_raw}")
    
    topics = [line.strip() for line in topics_raw.split("\n") if line.strip()]
    print(f"Final topics ({len(topics)}): {topics}")

if __name__ == "__main__":
    sample_pdf = r"c:\Users\YOGA\OneDrive\Documents\study_flow\study_folder\backend\uploads\Syllabus_Programming in Python.pdf"
    sample_img = r"c:\Users\YOGA\OneDrive\Documents\study_flow\study_folder\backend\uploads\sample_syllabus.png"
    
    if os.path.exists(sample_pdf):
        test_extraction(sample_pdf)
    
    print("\n" + "="*20 + "\n")
    
    if os.path.exists(sample_img):
        test_extraction(sample_img)
