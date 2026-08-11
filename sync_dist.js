import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const distDir = path.join(__dirname, 'dist');
const rootDir = __dirname;

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

// 3. Sincronizar .htaccess si existe
if (fs.existsSync(path.join(distDir, '.htaccess'))) {
  fs.copyFileSync(path.join(distDir, '.htaccess'), path.join(rootDir, '.htaccess'));
}

console.log('✅ Sincronización exitosa para Hostinger LiteSpeed (index.html y assets actualizados)');
