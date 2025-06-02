import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { toast } from 'sonner';
import { initializePadrinhoChecklist, setPadrinhoRole } from './initializeFirestore';

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
  login: (email: string, password: string) => Promise<{ isAdmin: boolean; isPadrinho: boolean }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isMainAdmin: boolean;
  isPadrinho: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const processUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      let userData;

      if (userDoc.exists()) {
        userData = userDoc.data();
        console.log('Dados do usuário encontrados:', userData);
      } else {
        console.log('Documento do usuário não existe, criando como padrinho');
        // Se o usuário não existe, cria como padrinho
        await setPadrinhoRole(firebaseUser.uid, firebaseUser.email || '');
        userData = {
          isAdmin: false,
          isMainAdmin: false,
          role: 'padrinho' as UserRole,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || ''
        };
      }

      // Se for padrinho, garante que o checklist existe
      if (userData.role === 'padrinho') {
        await initializePadrinhoChecklist(firebaseUser.uid);
      }

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        isAdmin: userData.isAdmin || false,
        isMainAdmin: userData.isMainAdmin || false,
        role: userData.role || 'padrinho',
        name: userData.name || firebaseUser.displayName || ''
      };
    } catch (error) {
      console.error('Erro ao processar dados do usuário:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userData = await processUserData(firebaseUser);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        toast.error('Erro ao verificar autenticação');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await processUserData(userCredential.user);
      setUser(userData);

      const isAdmin = Boolean(userData.isAdmin || userData.isMainAdmin);
      const isPadrinho = userData.role === 'padrinho' && !isAdmin;

      console.log('Login bem-sucedido:', {
        email: userData.email,
        role: userData.role,
        isAdmin,
        isPadrinho
      });

      return { isAdmin, isPadrinho };

    } catch (error: any) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('user');
      sessionStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  const isAdmin = Boolean(user?.isAdmin || user?.isMainAdmin);
  const isMainAdmin = Boolean(user?.isMainAdmin);
  const isPadrinho = user?.role === 'padrinho' && !isAdmin;

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isMainAdmin,
    isPadrinho
  };

  return (
    <AuthContext.Provider value={value}>
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
