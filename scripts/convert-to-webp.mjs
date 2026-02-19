/**
 * Converte todas as imagens JPG e PNG da pasta public para WebP.
 * Gera arquivos .webp ao lado dos originais (ex: Foto2.jpg → Foto2.webp).
 * Execute: npm run convert-images
 */
import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const WEBP_QUALITY = 85;

async function convertToWebP(inputPath, outputPath) {
  await sharp(inputPath)
    .rotate() // aplica orientação EXIF (corrige fotos tiradas de celular)
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPath);
}

async function main() {
  const files = await readdir(publicDir);
  const toConvert = files.filter((f) => EXTENSIONS.includes(extname(f).toLowerCase()));

  if (toConvert.length === 0) {
    console.log('Nenhum arquivo JPG ou PNG encontrado em public/');
    return;
  }

  console.log(`Convertendo ${toConvert.length} arquivo(s) para WebP...`);
  let ok = 0;
  let err = 0;

  for (const file of toConvert) {
    const base = file.replace(/\.[^.]+$/i, '');
    const inputPath = join(publicDir, file);
    const outputPath = join(publicDir, `${base}.webp`);

    try {
      await convertToWebP(inputPath, outputPath);
      console.log(`  ✓ ${file} → ${base}.webp`);
      ok++;
    } catch (e) {
      console.error(`  ✗ ${file}:`, e.message);
      err++;
    }
  }

  console.log(`\nConcluído: ${ok} convertidos, ${err} erro(s).`);
  if (ok > 0) {
    console.log('Atualize o componente PhotoGallery para usar as URLs .webp.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
