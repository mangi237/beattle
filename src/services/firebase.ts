// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAQZCYxoSn8kxYhZfAw8HmyI5mESqChSNU",
  authDomain: "beattle.firebaseapp.com",
  projectId: "beattle",
  storageBucket: "beattle.firebasestorage.app",
  messagingSenderId: "441988832314",
  appId: "1:441988832314:web:fa336810409c7ba900e903",
  measurementId: "G-3SH4HQHJ53"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

import { getFirestore } from "firebase/firestore";

// Initialize Firebase
export const auth = getAuth(app); // <-- Get the auth instance by calling the function
export const db = getFirestore(app);
export const storage = getStorage(app);