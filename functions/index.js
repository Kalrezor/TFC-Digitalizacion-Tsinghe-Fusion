/**
 * Tsinghe Cocina Fusión - Cloud Functions
 * Punto de entrada que reexporta las funciones modularizadas por dominio.
 *
 * La lógica vive en:
 *   - handlers/users.js         (bienvenida, verificación, listado admin)
 *   - handlers/passwords.js     (recuperación y reseteo de contraseña)
 *   - handlers/reservations.js  (notificaciones, triggers, confirmación, no-shows)
 *   - handlers/tables.js        (inicialización de mesas)
 *   - handlers/menu.js          (inicialización del menú básico)
 *   - lib/firebase.js           (admin/db/logger y setGlobalOptions)
 *   - lib/email.js              (transporter y plantillas de correo)
 *
 * IMPORTANTE: mantener exactamente los mismos nombres de export para no romper
 * el despliegue de las Cloud Functions.
 *
 * DEPLOY: firebase deploy --only functions
 */

// Inicializa Firebase Admin y las opciones globales una sola vez.
require("./lib/firebase");

const users = require("./handlers/users");
const passwords = require("./handlers/passwords");
const reservations = require("./handlers/reservations");
const tables = require("./handlers/tables");
const menu = require("./handlers/menu");

// Usuarios
exports.onUserCreated = users.onUserCreated;
exports.sendWelcomeEmail = users.sendWelcomeEmail;
exports.listUsersAdmin = users.listUsersAdmin;
exports.sendVerificationEmail = users.sendVerificationEmail;

// Contraseñas
exports.sendPasswordResetEmail = passwords.sendPasswordResetEmail;
exports.resetPasswordWithToken = passwords.resetPasswordWithToken;

// Reservas
exports.sendReservationStatusNotification =
  reservations.sendReservationStatusNotification;
exports.onReservationWrite = reservations.onReservationWrite;
exports.sendReservationConfirmation = reservations.sendReservationConfirmation;
exports.confirmReservationToken = reservations.confirmReservationToken;
exports.checkNoShows = reservations.checkNoShows;

// Mesas
exports.initTables = tables.initTables;

// Menú
exports.initMenuBasic = menu.initMenuBasic;
