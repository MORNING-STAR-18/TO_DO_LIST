import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let app;
let db;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, firebaseConfig.firestoreDatabaseId);
} else {
  app = getApp();
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
