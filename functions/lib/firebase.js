// lib/firebase.js
// Inicialización compartida de Firebase Admin y opciones globales.
// Se importa desde index.js antes que cualquier handler para garantizar
// que initializeApp() y setGlobalOptions() se ejecuten una sola vez.

const { setGlobalOptions } = require("firebase-functions");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ maxInstances: 10, region: "us-central1" });

module.exports = { admin, db, logger };
