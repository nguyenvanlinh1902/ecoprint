import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPMwCGc2uC7REOAE1aaPWsiFeSoV3lOMQ",
  authDomain: "ecoprint-28dd2.firebaseapp.com",
  projectId: "ecoprint-28dd2",
  storageBucket: "ecoprint-28dd2.firebasestorage.app",
  messagingSenderId: "442978360666",
  appId: "1:442978360666:web:feff9caa361f21aeb5e763",
  measurementId: "G-G8BW1P91S2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app; 