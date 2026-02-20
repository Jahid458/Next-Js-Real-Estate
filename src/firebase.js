// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "next-estate-99f43.firebaseapp.com",
  projectId: "next-estate-99f43",
  storageBucket: "next-estate-99f43.firebasestorage.app",
  messagingSenderId: "586889823419",
  appId: "1:586889823419:web:0cdfe4d464ce680da1d59e"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);