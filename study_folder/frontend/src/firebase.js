import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDHZV9N3MYxbQh-rPjGB3WYr8SvVTwv03I",
  authDomain: "study-flow-49f47.firebaseapp.com",
  projectId: "study-flow-49f47",
  storageBucket: "study-flow-49f47.firebasestorage.app",
  messagingSenderId: "254785817793",
  appId: "1:254785817793:web:c2089536e7a31f2b9b9840"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
