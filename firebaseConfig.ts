
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6jFSrNIXyMHc3kNA2aBJA9ZVFZz4ehRc",
  authDomain: "web-sticky-notes-6b430.firebaseapp.com",
  projectId: "web-sticky-notes-6b430",
  storageBucket: "web-sticky-notes-6b430.firebasestorage.app",
  messagingSenderId: "427262076950",
  appId: "1:427262076950:web:675d17a4de59a1d4292d37"
};

// Initialize Firebase
// Check if apps are already initialized to prevent duplicate initialization errors
const app = firebase.apps.length > 0 ? firebase.app() : firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = app.firestore();

export { db };
