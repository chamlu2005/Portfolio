importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCOAvlgN85ds6w5szScoPBtBSVUjyDmc9Q",
  authDomain: "dani-s-portfolio.firebaseapp.com",
  projectId: "dani-s-portfolio",
  storageBucket: "dani-s-portfolio.firebasestorage.app",
  messagingSenderId: "514506706251",
  appId: "1:514506706251:web:d7a35c361254fb4c3a6cce"
});

const messaging = firebase.messaging();