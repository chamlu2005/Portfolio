// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOAvlgN85ds6w5szScoPBtBSVUjyDmc9Q",
  authDomain: "dani-s-portfolio.firebaseapp.com",
  projectId: "dani-s-portfolio",
  storageBucket: "dani-s-portfolio.firebasestorage.app",
  messagingSenderId: "514506706251",
  appId: "1:514506706251:web:d7a35c361254fb4c3a6cce",
  measurementId: "G-PB8LPJ0T71"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);