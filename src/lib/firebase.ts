// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBqBkYcruQXEwVuA0GPvSurH9wXZr7xQY0",
    authDomain: "cxt-pannel.firebaseapp.com",
    databaseURL: "https://cxt-pannel-default-rtdb.firebaseio.com",
    projectId: "cxt-pannel",
    storageBucket: "cxt-pannel.firebasestorage.app",
    messagingSenderId: "700831987817",
    appId: "1:700831987817:web:bb34def86953c4db258af8",
    measurementId: "G-7ZXRHV73S7"
  };

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export { app, db };
