import JSZip from 'jszip';
import { storage } from './firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  type StorageReference,
} from 'firebase/storage';

const FIREBASE_STORAGE_ORIGIN = 'https://firebasestorage.googleapis.com';

/** Usa proxy same-origin (/storage) para evitar CORS no fetch (Vite dev + Netlify prod). */
function toSameOriginStorageUrl(downloadUrl: string): string {
  if (typeof window === 'undefined') return downloadUrl;
  if (!downloadUrl.startsWith(FIREBASE_STORAGE_ORIGIN)) return downloadUrl;
  return `${window.location.origin}/storage${downloadUrl.slice(FIREBASE_STORAGE_ORIGIN.length)}`;
}

async function fetchStorageBlob(file: StorageImageFile): Promise<Blob> {
  const downloadUrl = await getDownloadURL(file.storageRef);
  const response = await fetch(toSameOriginStorageUrl(downloadUrl));

  if (!response.ok) {
    throw new Error(`Falha ao baixar ${file.fullPath}`);
  }

  return response.blob();
}

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|bmp|heic|avif)$/i;

export interface StorageImageFile {
  fullPath: string;
  name: string;
  storageRef: StorageReference;
}

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

/** Lista recursivamente todas as imagens no Firebase Storage. */
export async function listAllStorageImages(path = ''): Promise<StorageImageFile[]> {
  const folderRef = ref(storage, path);
  const result = await listAll(folderRef);
  const files: StorageImageFile[] = result.items
    .filter((itemRef) => IMAGE_EXTENSIONS.test(itemRef.name))
    .map((itemRef) => ({
      fullPath: itemRef.fullPath,
      name: itemRef.name,
      storageRef: itemRef,
    }));

  for (const prefixRef of result.prefixes) {
    const nested = await listAllStorageImages(prefixRef.fullPath);
    files.push(...nested);
  }

  return files.sort((a, b) => a.fullPath.localeCompare(b.fullPath));
}

/** Baixa todas as imagens do Storage em um único arquivo ZIP. */
export async function downloadAllStorageImagesAsZip(
  onProgress?: (current: number, total: number, filePath: string) => void
): Promise<{ count: number }> {
  const files = await listAllStorageImages();
  if (files.length === 0) {
    return { count: 0 };
  }

  const zip = new JSZip();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(i + 1, files.length, file.fullPath);

    const blob = await fetchStorageBlob(file);
    zip.file(file.fullPath, blob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `firebase-imagens-${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { count: files.length };
}