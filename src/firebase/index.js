/*
 * Archivo: src/firebase/index.js
 * Proposito: Inicializa Firebase en el cliente y exporta servicios compartidos como Auth, Firestore y Storage.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

// ConfiguraciÃ³n de Firebase
// AquÃ­ debes colocar tu configuraciÃ³n de Firebase obtenida desde la consola de Firebase.
// Ve a https://console.firebase.google.com/, selecciona tu proyecto, y en "ConfiguraciÃ³n del proyecto" > "General" > "Tus apps" > "ConfiguraciÃ³n del SDK".
// Copia el objeto de configuraciÃ³n aquÃ­.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Agregado para Firestore
import { getStorage } from 'firebase/storage'; // Agregado para Storage

const firebaseConfig = {
  apiKey: "AIzaSyAJlw0_SqfqQgVW6-uh3CqVezbEHgXuUeU",
  authDomain: "digitalizacion-tsinge-fusion.firebaseapp.com",
  databaseURL: "https://digitalizacion-tsinge-fusion-default-rtdb.firebaseio.com",
  projectId: "digitalizacion-tsinge-fusion",
  storageBucket: "digitalizacion-tsinge-fusion.firebasestorage.app",
  messagingSenderId: "887873128698",
  appId: "1:887873128698:web:d6712b585b72abd05fa143",
  measurementId: "G-YVD5CX2BMV"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener la instancia de Auth
export const auth = getAuth(app);

// Obtener la instancia de Firestore
export const db = getFirestore(app); // Exportado para usar en modelos

// Obtener la instancia de Storage
export const storage = getStorage(app); // Exportado para usar en uploads

// Nota: Para autenticaciÃ³n de doble factor (MFA), Firebase Auth lo maneja automÃ¡ticamente.
// Puedes configurar MFA en la consola de Firebase bajo "Authentication" > "Sign-in method" > "Multi-factor authentication".
// Para pruebas, puedes usar cuentas de prueba en Firebase Auth.
