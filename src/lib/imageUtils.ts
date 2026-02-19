/**
 * Converte imagem para WebP no cliente (reduz tamanho e melhora carregamento).
 * Fallback para JPEG se o navegador não suportar WebP.
 */
export async function convertToWebP(
  file: File | Blob,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2d não disponível'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) return resolve(blob);
          canvas.toBlob(
            (jpegBlob) => (jpegBlob ? resolve(jpegBlob) : reject(new Error('Falha ao gerar blob'))),
            'image/jpeg',
            quality
          );
        },
        'image/webp',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Falha ao carregar imagem'));
    };
    img.src = url;
  });
}

const THUMB_MAX_WIDTH = 400;
const THUMB_QUALITY = 0.8;

/**
 * Redimensiona imagem para largura máxima e exporta em WebP (compressão automática).
 * Usado para preview (1200px) e versão “full” limitada (1920px) para reduzir custo de Storage.
 */
export async function resizeToWebP(
  file: File | Blob,
  maxWidth: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2d não disponível'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) return resolve(blob);
          canvas.toBlob(
            (jpegBlob) =>
              jpegBlob ? resolve(jpegBlob) : reject(new Error('Falha ao gerar blob')),
            'image/jpeg',
            quality
          );
        },
        'image/webp',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Falha ao carregar imagem'));
    };
    img.src = url;
  });
}

/** Preview para carrossel: 1200px, qualidade 0.78 (menos tráfego pago). */
export const PREVIEW_MAX_WIDTH = 1200;
export const PREVIEW_QUALITY = 0.78;

/** Versão “original” limitada: 1920px, 0.85 (só baixada ao abrir no lightbox). */
export const FULL_MAX_WIDTH = 1920;
export const FULL_QUALITY = 0.85;

/**
 * Gera thumbnail em WebP (largura máxima 400px) para uso no carrossel.
 */
export async function createThumbnail(file: File | Blob): Promise<Blob> {
  return resizeToWebP(file, THUMB_MAX_WIDTH, THUMB_QUALITY);
}
