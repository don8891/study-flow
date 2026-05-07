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

export async function uploadSyllabus(file, uid) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("uid", uid);

  const res = await fetch(`${BACKEND_URL}/upload-syllabus`, {
    method: "POST",
    body: formData
  });

  return res.json();
}

export async function callAI(task, content, syllabusContext = "") {
  const res = await fetch(`${BACKEND_URL}/ai-assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, content, syllabusContext })
  });

  return res.json();
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
