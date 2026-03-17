import os
import re
from PyPDF2 import PdfReader
from PIL import Image
import pytesseract

# Config
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def clean_syllabus_text(text):
    lines = text.split("\n")
    cleaned = []
    blacklist_keywords = ["mark", "score", "credit", "weightage", "hour", "exam", "internal", "external", "total", "pattern", "duration", "question paper", "allotment", "time", "minute", "mins", "hrs", "maximum", "minimum", "sec", "section"]
    for line in lines:
        line = line.strip()
        if len(line) < 4: continue
        if any(kw in line.lower() for kw in blacklist_keywords): continue
        line = re.sub(r"^[0-9.\-\s]+", "", line)
        if len(line) > 3: cleaned.append(line)
    return "\n".join(cleaned)

def parse_topics_from_text(text):
    forbidden = ["mark", "score", "credit", "weightage", "hour", "exam", "internal", "external", "total", "time", "hrs", "mins", "duration", "pattern"]
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    topics = []
    current_topic = None
    def is_main_topic(line):
        if len(line) > 80: return False
        if line.endswith(".") and len(line.split()) > 8: return False
        if re.match(r"^(unit|chapter|module|part|section)\s*[0-9ivxlIVXL]+", line, re.IGNORECASE): return True
        if len(line) < 50 and line[0].isupper() and len(line.split()) <= 6: return True
        return False
    for line in lines:
        if any(f in line.lower() for f in forbidden): continue
        if len(line) < 5: continue
        if is_main_topic(line):
            if current_topic: topics.append(current_topic)
            current_topic = {"topic": line, "subtopics": []}
        else:
            if current_topic:
                parts = [p.strip() for p in re.split(r"[,;]", line) if len(p.strip()) > 4]
                current_topic["subtopics"].extend(parts[:6])
            else:
                current_topic = {"topic": line, "subtopics": []}
    if current_topic: topics.append(current_topic)
    if len(topics) < 3:
        topics = [{"topic": l, "subtopics": []} for l in lines if len(l) > 5 and not any(f in l.lower() for f in forbidden)]
    return topics

def test_extraction(filename):
    filepath = os.path.join("uploads", filename)
    print(f"Testing {filepath}...")
    extracted_text = ""
    try:
        if filename.endswith(".pdf"):
            reader = PdfReader(filepath)
            for page in reader.pages:
                extracted_text += page.extract_text() or ""
        else:
            image = Image.open(filepath)
            extracted_text = pytesseract.image_to_string(image)
        
        print(f"Extracted length: {len(extracted_text)}")
        if len(extracted_text) == 0:
            print("FAILED: No text extracted.")
            return

        cleaned_text = clean_syllabus_text(extracted_text)
        print(f"Cleaned length: {len(cleaned_text)}")
        
        topics = parse_topics_from_text(cleaned_text)
        print(f"Found {len(topics)} topics.")
        for t in topics[:3]:
            print(f" - {t['topic']} ({len(t['subtopics'])} subtopics)")
            
    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    files = ["maths_syllabus.jpg", "sample_syllabus.png"]
    for f in files:
        if os.path.exists(os.path.join("uploads", f)):
            test_extraction(f)
        else:
            print(f"File {f} not found.")
