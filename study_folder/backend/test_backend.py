import os
import requests
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from PIL import Image
import pytesseract
import json

# Setup environment similar to app.py
load_dotenv(override=True)
HF_TOKEN = os.getenv("HF_TOKEN")
print(f"DEBUG: Token found: {HF_TOKEN[:5] if HF_TOKEN else 'None'}...")
HF_API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-large"
headers = {"Authorization": f"Bearer {HF_TOKEN}"}

def clean_syllabus_text(text):
    lines = text.split("\n")
    cleaned = []
    for line in lines:
        line = line.strip()
        if len(line) < 5: continue
        if any(char.isdigit() for char in line[:2]): line = line.lstrip("0123456789. ")
        cleaned.append(line)
    return "\n".join(cleaned)

def generate_structured_topics(text):
    prompt = f"Extract study topics from this syllabus: {text}"
    response = requests.post(HF_API_URL, headers=headers, json={"inputs": prompt})
    result = response.json()
    print(f"Raw AI Result: {result}")
    if isinstance(result, list) and len(result) > 0:
        return result[0].get("generated_text", "")
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
