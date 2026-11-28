// Prepara il progetto iOS prima di aprirlo in Xcode:
// 1. controlla che ci sia GoogleService-Info.plist (scaricato dalla Console Firebase);
// 2. registra l'URL scheme REVERSED_CLIENT_ID in Info.plist, necessario per l'accesso con Google.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const gsPath = 'ios/App/App/GoogleService-Info.plist';
const infoPath = 'ios/App/App/Info.plist';

if (!existsSync(gsPath)) {
  console.error(`\n✗ Manca ${gsPath}\n  Scaricalo dalla Console Firebase (Impostazioni progetto → app iOS)` +
    `\n  e copialo in quella cartella, poi rilancia: npm run ios\n`);
  process.exit(1);
}
const gs = readFileSync(gsPath, 'utf8');
const m = gs.match(/<key>REVERSED_CLIENT_ID<\/key>\s*<string>([^<]+)<\/string>/);
if (!m) {
  console.error('\n✗ GoogleService-Info.plist non contiene REVERSED_CLIENT_ID.' +
    '\n  Attiva l\'accesso Google in Firebase (Authentication → Metodo di accesso) e riscarica il file.\n');
  process.exit(1);
}
const scheme = m[1];
let info = readFileSync(infoPath, 'utf8');
const block = `\t<key>CFBundleURLTypes</key>\n\t<array>\n\t\t<dict>\n\t\t\t<key>CFBundleURLSchemes</key>\n\t\t\t<array>\n\t\t\t\t<string>${scheme}</string>\n\t\t\t</array>\n\t\t</dict>\n\t</array>\n`;
if (info.includes('<key>CFBundleURLTypes</key>')) {
  info = info.replace(/\t<key>CFBundleURLTypes<\/key>\n\t<array>[\s\S]*?\n\t<\/array>\n/, block);
} else {
  info = info.replace(/<\/dict>\s*<\/plist>\s*$/, `${block}</dict>\n</plist>\n`);
}
writeFileSync(infoPath, info);
console.log('✓ URL scheme Google registrato:', scheme);
