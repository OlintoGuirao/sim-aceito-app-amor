import { db, auth } from './firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export const testFirebaseConnection = async () => {
  console.log('🔍 Iniciando teste de conectividade com Firebase...');
  
  try {
    // Teste 1: Verificar se o Firebase está inicializado
    console.log('✅ Firebase inicializado:', !!db);
    console.log('✅ Auth inicializado:', !!auth);
    
    // Teste 2: Tentar acessar uma coleção
    console.log('📊 Testando acesso às coleções...');
    
    const collections = ['guests', 'gifts', 'users', 'messages'];
    
    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        console.log(`✅ Coleção ${collectionName}: ${snapshot.size} documentos encontrados`);
      } catch (error: any) {
        console.error(`❌ Erro ao acessar coleção ${collectionName}:`, error.message);
        
        if (error.code === 'permission-denied') {
          console.log('🔒 Problema de permissão - verificar regras do Firestore');
        } else if (error.code === 'unavailable') {
          console.log('🌐 Problema de conectividade - verificar conexão com internet');
        } else if (error.code === 'not-found') {
          console.log('📁 Coleção não encontrada - pode ser normal se ainda não foi criada');
        }
      }
    }
    
    // Teste 3: Verificar autenticação
    console.log('🔐 Testando autenticação...');
    
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log('✅ Usuário autenticado:', user.email);
        } else {
          console.log('ℹ️ Nenhum usuário autenticado (normal)');
        }
        unsubscribe();
        resolve(true);
      });
    });
    
  } catch (error: any) {
    console.error('❌ Erro geral no teste de conectividade:', error);
    console.log('🔧 Possíveis soluções:');
    console.log('1. Verificar se as credenciais do Firebase estão corretas');
    console.log('2. Verificar se o projeto está ativo no Firebase Console');
    console.log('3. Verificar se as regras do Firestore permitem acesso');
    console.log('4. Verificar conexão com internet');
    console.log('5. Verificar se o domínio está autorizado no Firebase');
    
    throw error;
  }
};

export const testSpecificCollection = async (collectionName: string) => {
  try {
    console.log(`🔍 Testando coleção específica: ${collectionName}`);
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    console.log(`✅ ${collectionName}: ${snapshot.size} documentos`);
    
    if (snapshot.size > 0) {
      const firstDoc = snapshot.docs[0];
      console.log('📄 Exemplo de documento:', firstDoc.data());
    }
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.error(`❌ Erro ao testar ${collectionName}:`, error);
    throw error;
  }
}; 