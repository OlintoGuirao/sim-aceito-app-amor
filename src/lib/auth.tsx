
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

type UserRole = 'admin' | 'padrinho';

interface User {
  uid: string;
  email: string;
  isAdmin: boolean;
  isMainAdmin: boolean;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isMainAdmin: boolean;
  isPadrinho: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({ 
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            ...userData 
          } as User);
        } else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            isAdmin: false,
            isMainAdmin: false,
            role: 'padrinho',
            name: firebaseUser.displayName || ''
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({ 
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
          ...userData 
        } as User);
      } else {
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
          isAdmin: false,
          isMainAdmin: false,
          role: 'padrinho',
          name: userCredential.user.displayName || ''
        });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  const isAdmin = user?.isAdmin === true || user?.isMainAdmin === true;
  const isMainAdmin = user?.isMainAdmin === true;
  const isPadrinho = user?.role === 'padrinho';

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      isAdmin, 
      isMainAdmin,
      isPadrinho
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 
