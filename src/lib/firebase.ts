import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, RecaptchaVerifier } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let app;
let db;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
}, firebaseConfig.firestoreDatabaseId);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const setupRecaptcha = (containerId: string) => {
  if (!(window as any).recaptchaVerifier) {
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
    });
  }
};

export { app, auth, db, googleProvider };
