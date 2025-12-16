// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // apiKey: "AIzaSyBe1eht1U6D57V6HGMmRQadqwHAXJO8qYY",
  apiKey : process.env.GOOGLE_API_KEY,
  authDomain: "notice-4eb36.firebaseapp.com",
  projectId: "notice-4eb36",
  storageBucket: "notice-4eb36.firebasestorage.app",
  messagingSenderId: "988442713064",
  appId: "1:988442713064:web:9153f44cd417bc08f0e25d",
  measurementId: "G-8LSXZCTJT3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);