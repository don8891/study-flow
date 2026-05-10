import os
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Create a dummy image
img = Image.new('RGB', (100, 100), color = 'white')
img.save('dummy.png')

try:
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content([
        "Extract all text from this syllabus image. Return ONLY the raw text content, no formatting.",
        img
    ])
    print("SUCCESS!")
    print(f"Response length: {len(response.text)}")
    print(f"Response text: {repr(response.text)}")
except Exception as e:
    print(f"ERROR: {e}")
