import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const subscribeToAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const saveProgressToCloud = async (userId, words) => {
  try {
    const userProgressRef = doc(db, 'userProgress', userId);
    await setDoc(userProgressRef, {
      words,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving progress:', error);
    return false;
  }
};

export const loadProgressFromCloud = async (userId) => {
  try {
    const userProgressRef = doc(db, 'userProgress', userId);
    const docSnap = await getDoc(userProgressRef);
    
    if (docSnap.exists()) {
      return docSnap.data().words;
    }
    return null;
  } catch (error) {
    console.error('Error loading progress:', error);
    return null;
  }
};

export { db, doc, collection };