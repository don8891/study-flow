import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth } from "../firebase";

export async function registerUser(email, password) {
  await createUserWithEmailAndPassword(auth, email, password);
  return { success: true };
}

export async function loginUser(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
  return { success: true };
}

export async function logoutUser() {
  await signOut(auth);
}

const BACKEND_URL = "https://studyflow-backend-n0um.onrender.com";

/**
 * Enhanced fetch that automatically retries if the backend is waking up.
 */
async function fetchWithRetry(url, options, retries = 3, delay = 10000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      const contentType = res.headers.get("content-type");

      // If it's JSON, return it
      if (contentType && contentType.includes("application/json")) {
        return await res.json();
      }

      // If not JSON, it's likely Render waking up (returns HTML)
      console.warn(`Attempt ${i + 1}: Backend is waking up... retrying in ${delay / 1000}s`);
    } catch (err) {
      console.error(`Attempt ${i + 1} failed:`, err);
    }

    if (i < retries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Backend failed to start in time. Please refresh and try again.");
}

export async function uploadSyllabus(file, uid) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("uid", uid);

  return fetchWithRetry(`${BACKEND_URL}/upload-syllabus`, {
    method: "POST",
    body: formData
  });
}

export async function callAI(task, content, syllabusContext = "") {
  return fetchWithRetry(`${BACKEND_URL}/ai-assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, content, syllabusContext })
  });
}

export async function generateConceptImage(concept, context = "") {
  try {
    const res = await fetch(`${BACKEND_URL}/generate-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concept, context })
    });
    return res.json();
  } catch (err) {
    console.error("Image generation failed:", err);
    return { success: false };
  }
}
