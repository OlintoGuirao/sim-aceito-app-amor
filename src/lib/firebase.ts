import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

// Suas configurações do Firebase aqui
const firebaseConfig = {
  apiKey: "AIzaSyBgbRSSWbMSrHAT7Gn5xAXHiA1X-SwjrbY",
  authDomain: "simaceito.firebaseapp.com",
  projectId: "simaceito",
  storageBucket: "profit-5dd3c.firebasestorage.app",
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

// Inicializa o Storage
export const storage = getStorage(app);

// Configuração para desenvolvimento local
if (window.location.hostname === 'localhost') {
  // Configurações específicas para desenvolvimento
  const storageRef = getStorage(app);
  // Adiciona headers CORS para desenvolvimento
  storageRef.app.options.storageBucket = 'simaceito.appspot.com';
}

export { analytics };
export default app; 