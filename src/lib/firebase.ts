import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase config — these are PUBLIC client-side keys.
// Security is enforced by Firebase Security Rules on the backend.
const firebaseConfig = {
  apiKey: "AIzaSyBd_Hi3-PwBdJhQn-Gm4WyOfHyIv2nlZ1A",
  authDomain: "boltek-701f4.firebaseapp.com",
  projectId: "boltek-701f4",
  storageBucket: "boltek-701f4.firebasestorage.app",
  messagingSenderId: "1097791611151",
  appId: "1:1097791611151:web:b3addd251e1ebba5071e7a",
  measurementId: "G-1H56SSGCD0",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
