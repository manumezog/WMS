// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCWe_NT3o52Fy5WCEnShYWAnXj6n4dYaEY",
  authDomain: "mezwms-2a876.firebaseapp.com",
  projectId: "mezwms-2a876",
  storageBucket: "mezwms-2a876.firebasestorage.app",
  messagingSenderId: "525975806362",
  appId: "1:525975806362:web:9261f0cb5f0dab93e19a23",
  measurementId: "G-52TR9BEKXL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore persistence not available in this browser');
  }
});

// Initialize Auth (for future use)
export const auth = getAuth(app);

export default app;
