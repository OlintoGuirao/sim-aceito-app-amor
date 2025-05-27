import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Interface para o tipo Convidado
export interface Guest {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  status: 'pending' | 'confirmed' | 'declined';
  qrCode?: string;
  companions?: number;
  message?: string;
  confirmedAt?: string;
  declinedAt?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Coleção de convidados
const guestsCollection = collection(db, 'guests');

// Adicionar novo convidado
export const addGuest = async (guestData: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = Timestamp.now();
  const newGuest = {
    ...guestData,
    createdAt: now,
    updatedAt: now
  };
  
  const docRef = await addDoc(guestsCollection, newGuest);
  return { id: docRef.id, ...newGuest };
};

// Buscar todos os convidados
export const getGuests = async () => {
  const querySnapshot = await getDocs(guestsCollection);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Guest[];
};

// Buscar convidados por status
export const getGuestsByStatus = async (status: Guest['status']) => {
  const q = query(guestsCollection, where('status', '==', status));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Guest[];
};

// Atualizar status do convidado
export const updateGuestStatus = async (guestId: string, status: Guest['status']) => {
  const guestRef = doc(db, 'guests', guestId);
  await updateDoc(guestRef, {
    status,
    updatedAt: Timestamp.now()
  });
};

// Atualizar QR Code do convidado
export const updateGuestQRCode = async (guestId: string, qrCode: string) => {
  const guestRef = doc(db, 'guests', guestId);
  await updateDoc(guestRef, {
    qrCode,
    updatedAt: Timestamp.now()
  });
};

// Deletar convidado
export const deleteGuest = async (guestId: string) => {
  const guestRef = doc(db, 'guests', guestId);
  await deleteDoc(guestRef);
};
