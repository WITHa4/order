// Initialize Firebase (Compat mode for file:/// support without CORS issues)
const firebaseConfig = {
  apiKey: "AIzaSyBnANWVjb5_y_yFQVCoA7snJsIRBiu9BgA",
  authDomain: "orderwitha4-shop.firebaseapp.com",
  projectId: "orderwitha4-shop",
  storageBucket: "orderwitha4-shop.firebasestorage.app",
  messagingSenderId: "251101721975",
  appId: "1:251101721975:web:dd17880d38efaf0f299d72",
  // Set the EXACT database URL from the console
  databaseURL: "https://orderwitha4-shop-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase App
firebase.initializeApp(firebaseConfig);

// Get a reference to the Realtime Database
const db = firebase.database();
window.firebaseDB = db;

console.log("🔥 Firebase Initialized!");
