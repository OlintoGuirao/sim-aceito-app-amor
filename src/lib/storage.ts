import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Função para fazer upload de arquivo
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    // Criar uma referência única para o arquivo
    const timestamp = Date.now();
    const uniquePath = `party_photos/${timestamp}_${file.name}`;
    const storageRef = ref(storage, uniquePath);
    
    // Configurar metadados
    const metadata = {
      contentType: file.type,
      customMetadata: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    };
    
    // Fazer o upload do arquivo com metadados
    const snapshot = await uploadBytes(storageRef, file, metadata);
    
    // Obter a URL de download
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Upload concluído:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo:', error);
    throw error;
  }
};

// Função para deletar arquivo
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    throw error;
  }
};

// Função para obter URL de download
export const getFileURL = async (path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Erro ao obter URL do arquivo:', error);
    throw error;
  }
}; 