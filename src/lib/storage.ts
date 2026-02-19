import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const CORS_METADATA = {
  customMetadata: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }
};

/** Cache 1 ano: CDN e navegador evitam re-download (reduz tráfego pago). */
const CACHE_CONTROL = 'public, max-age=31536000';

/** Faz upload de File ou Blob para um path; retorna a URL de download. */
export async function uploadBlob(
  blob: Blob | File,
  pathPrefix: string,
  options?: { contentType?: string; fileName?: string }
): Promise<string> {
  const timestamp = Date.now();
  const name = options?.fileName ?? (blob instanceof File ? blob.name : 'image.webp');
  const baseName = name.replace(/\.[^.]+$/, '') || 'image';
  const uniquePath = `${pathPrefix}/${timestamp}_${baseName}.webp`;
  const storageRef = ref(storage, uniquePath);
  const contentType = options?.contentType ?? 'image/webp';
  const metadata = { contentType, ...CORS_METADATA };
  const snapshot = await uploadBytes(storageRef, blob, metadata);
  return getDownloadURL(snapshot.ref);
}

/** Upload legado: File direto (sem conversão). Mantido para compatibilidade. */
export const uploadFile = async (file: File, pathPrefix: string): Promise<string> => {
  const timestamp = Date.now();
  const uniquePath = `${pathPrefix}/${timestamp}_${file.name}`;
  const storageRef = ref(storage, uniquePath);
  const metadata = { contentType: file.type, ...CORS_METADATA };
  const snapshot = await uploadBytes(storageRef, file, metadata);
  return getDownloadURL(snapshot.ref);
};

/**
 * Upload de foto da festa: preview (1200px) + full (1920px), com cache longo.
 * Carrossel usa preview; original só ao clicar (lightbox). Reduz tráfego e custo.
 */
export async function uploadPartyPhoto(
  previewBlob: Blob,
  fullBlob: Blob,
  index: number
): Promise<{ url: string; previewUrl: string }> {
  const t = Date.now();
  const base = `party_photos/${t}_${index}`;
  const meta = {
    contentType: 'image/webp',
    cacheControl: CACHE_CONTROL,
    ...CORS_METADATA
  };
  const previewRef = ref(storage, `${base}_preview.webp`);
  const fullRef = ref(storage, `${base}.webp`);
  const [previewSnap, fullSnap] = await Promise.all([
    uploadBytes(previewRef, previewBlob, meta),
    uploadBytes(fullRef, fullBlob, meta)
  ]);
  const [previewUrl, url] = await Promise.all([
    getDownloadURL(previewSnap.ref),
    getDownloadURL(fullSnap.ref)
  ]);
  return { url, previewUrl };
}

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