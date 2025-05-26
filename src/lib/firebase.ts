import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Suas configurações do Firebase aqui
const firebaseConfig = {
  apiKey: "AIzaSyBgbRSSWbMSrHAT7Gn5xAXHiA1X-SwjrbY",
  authDomain: "simaceito.firebaseapp.com",
  projectId: "simaceito",
  storageBucket: "simaceito.firebasestorage.app",
  messagingSenderId: "379590526506",
  appId: "1:379590526506:web:60cc7d7698552742aea553",
  measurementId: "G-R7WRC0ENST"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Analytics
const analytics = getAnalytics(app);

// Inicializa o Firestore
export const db = getFirestore(app);

// Inicializa o Auth
export const auth = getAuth(app);

export { analytics };
export default app; 