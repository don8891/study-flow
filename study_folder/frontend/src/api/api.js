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

export async function uploadSyllabus(file, uid) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("uid", uid);

  const res = await fetch("http://127.0.0.1:5000/upload-syllabus", {
    method: "POST",
    body: formData
  });

  return res.json();
}
