import os
from dotenv import load_dotenv
from groq import Groq
import google.generativeai as genai

load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("Testing Groq...")
try:
    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": "Hello"}],
        max_tokens=10
    )
    print("Groq success:", response.choices[0].message.content)
except Exception as e:
    print(f"Groq failed: {e}")

print("Testing Gemini...")
try:
    model = genai.GenerativeModel("gemini-pro")
    response = model.generate_content("Hello")
    print("Gemini success:", response.text)
except Exception as e:
    print(f"Gemini failed: {e}")
