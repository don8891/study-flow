import requests
import json

def test_ai():
    url = "http://127.0.0.1:5000/ai-assistant"
    payload = {
        "task": "summary",
        "content": "Calculus 1 Syllabus: Limits, Derivatives, Integrals, Applications of Derivatives, Fundamental Theorem of Calculus."
    }
    try:
        print("Checking health...")
        health_res = requests.get("http://127.0.0.1:5000/health", timeout=5)
        print(f"Health Status: {health_res.status_code}")
        print(f"Health Response: {health_res.text}")
    except Exception as e:
        print(f"Health check failed: {e}")

    try:
        print("\nSending request to /ai-assistant...")
        response = requests.post(url, json=payload, timeout=60)
        print(f"Status Code: {response.status_code}")
        print("Response:")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_ai()
