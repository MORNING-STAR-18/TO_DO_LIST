import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDWvgY1gBgZulKssrzAqFbq0U_j7ucnVuo",
  authDomain: "to-do-611f9.firebaseapp.com",
  projectId: "to-do-611f9",
  storageBucket: "to-do-611f9.firebasestorage.app",
  messagingSenderId: "682234876980",
  appId: "1:682234876980:web:5aacdaeb1da1784a6d6661",
  measurementId: "G-4Q8ML1VTZH"
};

let app;
let db;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
} else {
  app = getApp();
  db = getFirestore(app);
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
