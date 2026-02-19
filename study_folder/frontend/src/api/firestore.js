import { db } from "../firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  orderBy
} from "firebase/firestore";

/* Create user profile */
export async function createUserProfile(user, username) {
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    username: username || "",
    streak: 0,
    maxStreak: 0,
    badges: [],
    lastActivityDate: null,
    totalXp: 0,
    createdAt: new Date()
  });
}

/* Update username */
export async function updateUsername(uid, username) {
  const ref = doc(db, "users", uid);
  await setDoc(ref, { username }, { merge: true });
}

/* Update user activity and streak */
export async function recordActivity(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const today = new Date().toISOString().split('T')[0];
  const lastDate = data.lastActivityDate;

  let newStreak = data.streak || 0;
  
  if (!lastDate) {
    newStreak = 1;
  } else {
    const last = new Date(lastDate);
    const curr = new Date(today);
    const diff = (curr - last) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      newStreak += 1;
    } else if (diff > 1) {
      newStreak = 1;
    }
  }

  await updateDoc(ref, {
    lastActivityDate: today,
    streak: newStreak,
    maxStreak: Math.max(newStreak, data.maxStreak || 0),
    totalXp: (data.totalXp || 0) + 10 // Increment XP whenever activity is recorded
  });
}

/* Increment XP directly */
export async function incrementXp(uid, amount) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  await updateDoc(ref, {
    totalXp: (data.totalXp || 0) + amount
  });
}

/* Get user profile */
export async function getUserProfile(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/* Save study plan into sub-collection */
export async function saveStudyPlan(uid, tasks, name, examDate) {
  const planId = name.replace(/\s+/g, '-').toLowerCase(); // Slugify name
  const ref = doc(db, "users", uid, "studyPlans", planId);
  await setDoc(ref, {
    name,
    tasks,
    examDate,
    createdAt: new Date()
  });
  return planId;
}

/* Load specific study plan */
export async function getStudyPlan(uid, planId) {
  if (!planId) return null;
  const ref = doc(db, "users", uid, "studyPlans", planId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/* Get all plans for a user */
export async function getStudyPlansList(uid) {
  const ref = collection(db, "users", uid, "studyPlans");
  const q = query(ref, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* Delete a plan */
export async function deleteStudyPlan(uid, planId) {
  await deleteDoc(doc(db, "users", uid, "studyPlans", planId));
}

/* Support for updating tasks in a specific plan */
export async function updatePlanTasks(uid, planId, tasks) {
  const ref = doc(db, "users", uid, "studyPlans", planId);
  await updateDoc(ref, { tasks });
}
