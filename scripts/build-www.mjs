// Copia i file della web app in www/, la cartella che Capacitor mette dentro l'app iOS.
import { rmSync, mkdirSync, copyFileSync } from 'node:fs';

const files = ['index.html', 'login.html', 'firebase-config.js', 'firebase-init.js',
  'manifest.json', 'icon-192.png', 'icon-512.png'];

rmSync('www', { recursive: true, force: true });
mkdirSync('www/vendor', { recursive: true });
for (const f of files) copyFileSync(f, `www/${f}`);
// Il core di Capacitor serve per registrare i plugin nativi senza un bundler.
copyFileSync('node_modules/@capacitor/core/dist/index.js', 'www/vendor/capacitor-core.js');
console.log('www/ pronta:', files.length + 1, 'file');
