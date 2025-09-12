"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  "projectId": "studio-324918385-59672",
  "appId": "1:315068066482:web:f17a0ae92d4a0b1100f7ab",
  "storageBucket": "studio-324918385-59672.appspot.com",
  "apiKey": "AIzaSyA9sRKoMAT9ySFBoqF83j01XILP8cQIXtc",
  "authDomain": "studio-324918385-59672.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "315068066482"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
