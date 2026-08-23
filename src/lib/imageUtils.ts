/**
 * Utilitários de imagem para galeria da festa.
 * Otimizado para celular (fotos grandes / iPhone).
 */

export const PREVIEW_MAX_WIDTH = 1200;
export const PREVIEW_QUALITY = 0.78;
export const FULL_MAX_WIDTH = 1920;
export const FULL_QUALITY = 0.85;

const THUMB_MAX_WIDTH = 400;
const THUMB_QUALITY = 0.8;

type SourceImage = {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  close?: () => void;
};

async function loadSourceImage(file: File | Blob): Promise<SourceImage> {
  // createImageBitmap é mais leve em memória no mobile
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        width: bitmap.width,
        height: bitmap.height,
        draw: (ctx, w, h) => ctx.drawImage(bitmap, 0, 0, w, h),
        close: () => bitmap.close(),
      };
    } catch {
      // segue para fallback com Image
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error(
          'Não foi possível ler a imagem. No iPhone, tente "Mais recentes" ou converter HEIC para JPEG.'
        )
      );
    };
    img.src = url;
  });
}

function scaledSize(width: number, height: number, maxWidth: number) {
  if (width <= maxWidth) return { width, height };
  return {
    width: maxWidth,
    height: Math.round((height * maxWidth) / width),
  };
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  const tryType = async (type: string) =>
    new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), type, quality);
    });

  const webp = await tryType('image/webp');
  if (webp) return webp;

  const jpeg = await tryType('image/jpeg');
  if (jpeg) return jpeg;

  throw new Error('Falha ao gerar a imagem comprimida');
}

async function encodeFromSource(
  source: SourceImage,
  maxWidth: number,
  quality: number
): Promise<Blob> {
  const { width, height } = scaledSize(source.width, source.height, maxWidth);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2d não disponível');
  source.draw(ctx, width, height);
  return canvasToBlob(canvas, quality);
}

/**
 * Converte imagem para WebP no cliente (fallback JPEG).
 */
export async function convertToWebP(
  file: File | Blob,
  quality = 0.85
): Promise<Blob> {
  const source = await loadSourceImage(file);
  try {
    return await encodeFromSource(source, source.width, quality);
  } finally {
    source.close?.();
  }
}

/**
 * Redimensiona imagem para largura máxima e exporta em WebP/JPEG.
 */
export async function resizeToWebP(
  file: File | Blob,
  maxWidth: number,
  quality: number
): Promise<Blob> {
  const source = await loadSourceImage(file);
  try {
    return await encodeFromSource(source, maxWidth, quality);
  } finally {
    source.close?.();
  }
}

/**
 * Gera preview + full a partir do mesmo decode (mais estável no celular).
 */
export async function resizePartyVariants(
  file: File | Blob
): Promise<{ previewBlob: Blob; fullBlob: Blob }> {
  const source = await loadSourceImage(file);
  try {
    // Sequencial: evita estourar memória no mobile com 2 canvases grandes
    const previewBlob = await encodeFromSource(
      source,
      PREVIEW_MAX_WIDTH,
      PREVIEW_QUALITY
    );
    const fullBlob = await encodeFromSource(source, FULL_MAX_WIDTH, FULL_QUALITY);
    return { previewBlob, fullBlob };
  } finally {
    source.close?.();
  }
}

export async function createThumbnail(file: File | Blob): Promise<Blob> {
  return resizeToWebP(file, THUMB_MAX_WIDTH, THUMB_QUALITY);
}
