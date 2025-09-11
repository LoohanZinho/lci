"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "studio-324918385-59672",
  "appId": "1:315068066482:web:f17a0ae92d4a0b1100f7ab",
  "storageBucket": "studio-324918385-59672.firebasestorage.app",
  "apiKey": "AIzaSyA9sRKoMAT9ySFBoqF83j01XILP8cQIXtc",
  "authDomain": "studio-324918385-59672.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "315068066482"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
