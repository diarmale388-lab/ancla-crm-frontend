import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const distDir = path.join(__dirname, 'dist');
const rootDir = __dirname;
const publicDir = path.join(__dirname, 'public');

// 1. Sincronizar dist/index.source.html a dist/index.html y root index.html
let htmlContent = '';
if (fs.existsSync(path.join(distDir, 'index.source.html'))) {
  htmlContent = fs.readFileSync(path.join(distDir, 'index.source.html'), 'utf-8');
  fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);
  fs.writeFileSync(path.join(rootDir, 'index.html'), htmlContent);
} else if (fs.existsSync(path.join(distDir, 'index.html'))) {
  htmlContent = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
  fs.writeFileSync(path.join(rootDir, 'index.html'), htmlContent);
}

// 2. Sincronizar dist/assets a root assets
const distAssets = path.join(distDir, 'assets');
const rootAssets = path.join(rootDir, 'assets');
if (fs.existsSync(distAssets)) {
  if (!fs.existsSync(rootAssets)) {
    fs.mkdirSync(rootAssets, { recursive: true });
  }
  fs.cpSync(distAssets, rootAssets, { recursive: true });
}

// 3. Sincronizar archivos estáticos y PWA de public/ y dist/ a la raíz
const pwaFiles = [
  'manifest.webmanifest',
  'manifest.json',
  'sw.js',
  'icon-192x192.png',
  'icon-512x512.png',
  'apple-touch-icon-180x180.png',
  'apple-touch-icon.png',
  'favicon.png',
  'favicon.ico',
  'ancla_medallion.png',
  '.htaccess'
];

pwaFiles.forEach((file) => {
  const fromPublic = path.join(publicDir, file);
  const fromDist = path.join(distDir, file);
  const toRoot = path.join(rootDir, file);

  if (fs.existsSync(fromDist)) {
    fs.copyFileSync(fromDist, toRoot);
  } else if (fs.existsSync(fromPublic)) {
    fs.copyFileSync(fromPublic, toRoot);
  }
});

console.log('✅ Sincronización completa de PWA & Hostinger LiteSpeed (index.html, assets, manifest e íconos actualizados)');
