// Inizializzazione Firebase condivisa da index.html e login.html.
// Funziona sia come web app (GitHub Pages) sia dentro l'app iOS (Capacitor).
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, initializeAuth, indexedDBLocalPersistence }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

// Dentro l'app iOS il "ponte" di Capacitor definisce window.Capacitor prima della pagina.
export const isNative = !!window.Capacitor?.isNativePlatform?.();

export const app = initializeApp(firebaseConfig);

// Nell'app nativa getAuth() può bloccarsi (cerca popup/iframe che in iOS non esistono):
// usiamo initializeAuth con la sola persistenza IndexedDB.
export const auth = isNative
  ? initializeAuth(app, { persistence: indexedDBLocalPersistence })
  : getAuth(app);

export const db = getFirestore(app);

// Plugin nativi (solo nell'app iOS). Sul web restano null.
let FirebaseAuthentication = null, LocalNotifications = null;
if (isNative) {
  const { registerPlugin } = await import('./vendor/capacitor-core.js');
  FirebaseAuthentication = registerPlugin('FirebaseAuthentication');
  LocalNotifications = registerPlugin('LocalNotifications');
}
export { FirebaseAuthentication, LocalNotifications };
