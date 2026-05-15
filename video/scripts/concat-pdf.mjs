// video/scripts/concat-pdf.mjs
// Concat 8 PNG (1080×1350) → 1 PDF multi-pages pour upload LinkedIn document.
//
// Usage: node scripts/concat-pdf.mjs <input-dir> <output.pdf>
// Exemple: node scripts/concat-pdf.mjs out/cycle-template/ out/cycle-template/carousel.pdf

import { PDFDocument } from 'pdf-lib';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const [, , inputDir, outputPath] = process.argv;

if (!inputDir || !outputPath) {
  console.error('Usage: node scripts/concat-pdf.mjs <input-dir> <output.pdf>');
  process.exit(1);
}

const files = (await readdir(inputDir))
  .filter((f) => f.match(/^slide-(\d+)\.png$/))
  .sort((a, b) => {
    const numA = Number(a.match(/^slide-(\d+)\.png$/)[1]);
    const numB = Number(b.match(/^slide-(\d+)\.png$/)[1]);
    return numA - numB;
  });

if (files.length === 0) {
  console.error(`Aucun slide-*.png trouvé dans ${inputDir}`);
  process.exit(1);
}

console.log(`Concaténation de ${files.length} slides depuis ${inputDir}`);

const pdf = await PDFDocument.create();

for (const file of files) {
  const pngBytes = await readFile(join(inputDir, file));
  const png = await pdf.embedPng(pngBytes);
  // 1080×1350 → page 1080×1350 (PDF unit = 1pt = 1/72 inch ; ici on garde la
  // résolution native, LinkedIn redimensionne côté upload).
  const page = pdf.addPage([png.width, png.height]);
  page.drawImage(png, {
    x: 0,
    y: 0,
    width: png.width,
    height: png.height,
  });
  console.log(`  + ${file} (${png.width}×${png.height})`);
}

const pdfBytes = await pdf.save();
await writeFile(outputPath, pdfBytes);
console.log(`\nPDF écrit : ${outputPath} (${pdfBytes.length} bytes)`);
