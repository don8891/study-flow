import { db } from "../firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "firebase/firestore";

/* Create user profile */
export async function createUserProfile(user) {
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    streak: 0,
    totalHours: 0,
    createdAt: new Date()
  });
}

/* Get user profile */
export async function getUserProfile(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/* Save study plan */
export async function saveStudyPlan(uid, tasks) {
  await setDoc(doc(db, "studyPlans", uid), {
    tasks
  });
}

/* Load study plan */
export async function getStudyPlan(uid) {
  const ref = doc(db, "studyPlans", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().tasks : [];
}
