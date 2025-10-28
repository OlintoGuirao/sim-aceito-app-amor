import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Função para inicializar o checklist de um padrinho
export const initializePadrinhoChecklist = async (userId: string) => {
  const checklistRef = doc(db, 'padrinhosChecklist', userId);
  
  const defaultChecklist = {
    items: [
      { id: '1', label: 'Roupa/vestido comprado', checked: false },
      { id: '2', label: 'Presença confirmada', checked: false },
      { id: '3', label: 'Música enviada', checked: false },
      { id: '4', label: 'Acessórios escolhidos', checked: false }
    ]
  };

  try {
    await setDoc(checklistRef, defaultChecklist);
    console.log('Checklist inicializado para o padrinho:', userId);
  } catch (error) {
    console.error('Erro ao inicializar checklist:', error);
  }
};

// Função para verificar e criar as coleções necessárias
export const initializeCollections = async () => {
  try {
    // Verificar se já existem documentos nas coleções
    const chatRef = collection(db, 'padrinhosChat');
    const musicsRef = collection(db, 'suggestedMusics');
    const checklistRef = collection(db, 'padrinhosChecklist');

    const chatDocs = await getDocs(chatRef);
    const musicsDocs = await getDocs(musicsRef);
    const checklistDocs = await getDocs(checklistRef);

    // Se não houver documentos, as coleções serão criadas automaticamente
    // quando o primeiro documento for adicionado
    console.log('Status das coleções:');
    console.log('Chat dos Padrinhos:', chatDocs.size, 'mensagens');
    console.log('Sugestões de Música:', musicsDocs.size, 'sugestões');
    console.log('Checklists:', checklistDocs.size, 'padrinhos');

  } catch (error) {
    console.error('Erro ao inicializar coleções:', error);
  }
};

// Função para atualizar o papel de um usuário para padrinho
export const setPadrinhoRole = async (userId: string, email: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      email,
      role: 'padrinho',
      isAdmin: false,
      isMainAdmin: false,
      name: email.split('@')[0] // Nome temporário baseado no email
    }, { merge: true });

    // Inicializar o checklist do padrinho
    await initializePadrinhoChecklist(userId);
    
    console.log('Usuário definido como padrinho:', email);
  } catch (error) {
    console.error('Erro ao definir papel de padrinho:', error);
  }
}; 