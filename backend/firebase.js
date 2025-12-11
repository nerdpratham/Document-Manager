// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpeKRuf0M5Dc_mxGR_ozlf3D0xzUAAaf8",
  authDomain: "project-management-b8a35.firebaseapp.com",
  projectId: "project-management-b8a35",
  storageBucket: "project-management-b8a35.firebasestorage.app",
  messagingSenderId: "875798890219",
  appId: "1:875798890219:web:066d6a9730d99bb202e0ae",
  measurementId: "G-4F31ZX1NLL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);