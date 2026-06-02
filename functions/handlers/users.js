// handlers/users.js
// Funciones relacionadas con usuarios: bienvenida, verificación y listado admin.

const { onRequest } = require("firebase-functions/https");
const { onDocumentCreated } = require("firebase-functions/firestore");
const { admin, db, logger } = require("../lib/firebase");
const {
  transporter,
  EMAIL_STYLES,
  EMAIL_INLINE,
  buildWelcomeEmailHtml,
} = require("../lib/email");

// Trigger: enviar email de bienvenida cuando se crea un documento en 'users/{uid}'
const onUserCreated = onDocumentCreated(
  {
    document: "users/{userId}",
    region: "us-central1",
  },
  async (event) => {
    try {
      const data = event.data?.data() || {};
      const email = data.email;
      if (!email) {
        logger.warn(
          "Nuevo usuario sin email en Firestore, saltando welcome email",
          { id: event.params.userId },
        );
        return null;
      }

      const name = data.name || String(email).split("@")[0];

      const info = await transporter.sendMail({
        from: '"Tsinghe Cocina Fusión" <tsinghecocinafusion@gmail.com>',
        to: email,
        subject: "Bienvenido a Tsinghe Cocina Fusion",
        html: buildWelcomeEmailHtml(name),
      });

      logger.info("EMAIL DE BIENVENIDA (trigger Firestore) enviado:", {
        to: email,
        name,
        messageId: info && info.messageId,
      });
      return null;
    } catch (err) {
      logger.error(
        "Error enviando welcome email desde trigger Firestore:",
        err,
      );
      return null;
    }
  },
);

const sendWelcomeEmail = onRequest(
  {
    region: "us-central1",
    cors: "*",
    invoker: "public",
  },
  async (req, res) => {
    // Habilitar CORS para llamadas desde el navegador
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Metodo no permitido" });
      return;
    }

    try {
      const { email, displayName } = req.body;

      if (!email) {
        res.status(400).json({ error: "Email es obligatorio" });
        return;
      }

      const name = displayName || email.split("@")[0];

      const info = await transporter.sendMail({
        from: '"Tsinghe Cocina Fusión" <tsinghecocinafusion@gmail.com>',
        to: email,
        subject: "Bienvenido a Tsinghe Cocina Fusion",
        html: buildWelcomeEmailHtml(name),
      });

      logger.info("EMAIL DE BIENVENIDA (real) enviado:", {
        to: email,
        name: name,
        messageId: info.messageId,
      });

      res.status(200).json({
        success: true,
        message: "Email enviado a " + email,
        messageId: info.messageId,
      });
    } catch (error) {
      logger.error("Error enviando email:", error);
      res
        .status(500)
        .json({ error: "Error interno al enviar el email: " + error.message });
    }
  },
);

// Listar usuarios de Firebase Auth para administradores.
const listUsersAdmin = onRequest(
  {
    region: "us-central1",
    cors: "*",
    invoker: "public",
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "GET") {
      res.status(405).json({ error: "Solo GET" });
      return;
    }

    try {
      const authHeader = req.get("Authorization") || "";
      const match = authHeader.match(/^Bearer (.+)$/);
      if (!match) {
        res.status(401).json({ error: "Token requerido" });
        return;
      }

      const decodedToken = await admin.auth().verifyIdToken(match[1]);
      const adminDoc = await db.collection("users").doc(decodedToken.uid).get();
      if (!adminDoc.exists || adminDoc.data().role !== "admin") {
        res.status(403).json({ error: "Solo administradores" });
        return;
      }

      const [authUsers, firestoreUsers] = await Promise.all([
        admin.auth().listUsers(1000),
        db.collection("users").get(),
      ]);

      const firestoreById = new Map();
      const firestoreByEmail = new Map();
      firestoreUsers.forEach((doc) => {
        const data = doc.data();
        firestoreById.set(doc.id, { id: doc.id, ...data });
        if (data.email) {
          firestoreByEmail.set(String(data.email).toLowerCase(), {
            id: doc.id,
            ...data,
          });
        }
      });

      const users = authUsers.users
        .filter((userRecord) => userRecord.email)
        .map((userRecord) => {
          const firestoreUser =
            firestoreById.get(userRecord.uid) ||
            firestoreByEmail.get(String(userRecord.email).toLowerCase()) ||
            {};
          return {
            id: userRecord.uid,
            email: userRecord.email,
            name:
              firestoreUser.name ||
              userRecord.displayName ||
              userRecord.email.split("@")[0],
            displayName:
              userRecord.displayName || firestoreUser.displayName || "",
            role: firestoreUser.role || "comensal",
            emailVerified:
              firestoreUser.emailVerified ?? userRecord.emailVerified ?? false,
          };
        })
        .sort((a, b) => a.email.localeCompare(b.email));

      res.status(200).json({ success: true, users });
    } catch (error) {
      logger.error("Error listando usuarios:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

const sendVerificationEmail = onRequest(
  {
    region: "us-central1",
    cors: "*",
    invoker: "public",
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Metodo no permitido" });
      return;
    }

    try {
      const { email, name } = req.body;

      if (!email) {
        res.status(400).json({ error: "Email es obligatorio" });
        return;
      }

      const displayName = name || email.split("@")[0];

      // Enviar email de verificación
      const info = await transporter.sendMail({
        from: '"Tsinghe Cocina Fusión" <tsinghecocinafusion@gmail.com>',
        to: email,
        subject: "Verificar tu cuenta - Tsinghe Cocina Fusión 🔐",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            ${EMAIL_STYLES}
          </style>
        </head>
        <body style="${EMAIL_INLINE.body}">
          <div class="container" style="${EMAIL_INLINE.container}">
            <div class="header" style="${EMAIL_INLINE.header}">
              <h1 style="${EMAIL_INLINE.title}">🍜 Tsinghe Cocina Fusión</h1>
            </div>
            <div class="content" style="${EMAIL_INLINE.content}">
              <h2 style="${EMAIL_INLINE.subtitle}">¡Hola ${displayName}!</h2>
              <p>Tu cuenta ha sido creada por el administrador de <strong>Tsinghe Cocina Fusión</strong>.</p>

              <div class="info-box" style="${EMAIL_INLINE.panel}">
                <strong>📋 Tu reserva está pendiente de confirmación</strong>
                <p>Se ha creado una reserva a tu nombre. Para que sea válida, necesitas:</p>
                <ul>
                  <li>Verificar este correo (haciendo clic en el botón de abajo)</li>
                  <li>Crear una contraseña segura en tu cuenta</li>
                </ul>
              </div>

              <p>Una vez completes estos pasos, tu reserva será confirmada automáticamente.</p>

              <a href="https://digitalizacion-tsinge-fusion.web.app/login" class="button" style="${EMAIL_INLINE.button}">Confirmar mi cuenta</a>

              <p class="muted" style="${EMAIL_INLINE.muted} margin-top: 30px;">
                Si no fuiste tú quien creó esta cuenta, puedes ignorar este mensaje.
              </p>
            </div>
            <div class="footer" style="${EMAIL_INLINE.footer}">
              <p style="${EMAIL_INLINE.footerText}">© 2024 Tsinghe Cocina Fusión. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      });

      logger.info("EMAIL DE VERIFICACIÓN enviado:", {
        to: email,
        name: displayName,
        messageId: info.messageId,
      });

      res.status(200).json({
        success: true,
        message: "Email de verificación enviado a " + email,
        messageId: info.messageId,
      });
    } catch (error) {
      logger.error("Error enviando email de verificación:", error);
      res.status(500).json({
        error: "Error al enviar el email: " + error.message,
      });
    }
  },
);

module.exports = {
  onUserCreated,
  sendWelcomeEmail,
  listUsersAdmin,
  sendVerificationEmail,
};
