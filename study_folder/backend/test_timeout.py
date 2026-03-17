import requests
import json
import time

def test_endpoint_timeout():
    url = "http://127.0.0.1:5000/upload-syllabus"
    
    # We can't easily force a timeout on the real HF API without changing the code to point to a fake slow server
    # But we can verify that the /upload-syllabus endpoint returns a response (even if it's an error from HF)
    # and doesn't hang indefinitely if the internal call fails.
    
    print("Testing /upload-syllabus with a dummy file...")
    
    # Use a real image from the uploads folder
    img_path = r"c:\Users\YOGA\OneDrive\Documents\study_flow\study_folder\backend\uploads\sample_syllabus.png"
    with open(img_path, "rb") as f:
        img_data = f.read()

    files = {
        'file': ('sample_syllabus.png', img_data)
    }
    
    try:
        start_time = time.time()
        # The frontend calls upload-syllabus with FormData including 'uid'
        # but the backend app.py only reads request.files['file']
        response = requests.post(url, files=files, timeout=40) 
        duration = time.time() - start_time
        
        print(f"Status Code: {response.status_code}")
        print(f"Duration: {duration:.2f} seconds")
        
        if response.status_code == 200:
            result = response.json()
            print("Success:", result.get("success"))
            if "topics" in result:
                print(f"Topics found: {len(result['topics'])}")
        else:
            print(f"Error Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("Test Failed: The backend endpoint itself timed out (exceeded 40s)")
    except Exception as e:
        print(f"Test Error: {e}")

if __name__ == "__main__":
    test_endpoint_timeout()
