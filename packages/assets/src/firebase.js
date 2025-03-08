import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase configuration from environment variables
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

console.log('Firebase Config:', { ...firebaseConfig, apiKey: 'HIDDEN' });

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

/**
 * Signs in user with Google authentication
 * @returns {Promise<Object>} Authentication result
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      user: result.user
    };
  } catch (error) {
    console.error("Error signing in with Google", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Returns current authenticated user
 * @returns {Object|null} Current user or null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Checks if email belongs to an admin user
 * @param {string} email - User email to check
 * @returns {boolean} True if admin
 */
export const isAdminEmail = (email) => {
  const adminEmails = [
    'linhnguyenvan1902@gmail.com',
    'admin@ecoprint.com'
  ];
  return adminEmails.includes(email);
}; 