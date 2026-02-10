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
