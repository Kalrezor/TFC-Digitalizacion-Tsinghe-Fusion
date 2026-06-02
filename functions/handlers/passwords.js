// handlers/passwords.js
// Funciones de recuperación y restablecimiento de contraseña.

const { onRequest } = require("firebase-functions/https");
const { admin, db, logger } = require("../lib/firebase");
const { transporter, EMAIL_STYLES, EMAIL_INLINE } = require("../lib/email");

const sendPasswordResetEmail = onRequest(
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
      const { email, token, displayName } = req.body;

      if (!email || !token) {
        res.status(400).json({ error: "Email y token son obligatorios" });
        return;
      }

      const name = displayName || String(email).split("@")[0];

      const emailHtml = `
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
              <h1 style="${EMAIL_INLINE.title}">Tsinghe Cocina Fusión</h1>
            </div>
            <div class="content" style="${EMAIL_INLINE.content}">
              <h2 style="${EMAIL_INLINE.subtitle}">Recuperación de contraseña</h2>
              <p style="${EMAIL_INLINE.paragraph}">Hola ${name},</p>
              <p style="${EMAIL_INLINE.paragraph}">Hemos recibido una solicitud para restablecer tu contraseña.</p>

              <div class="info-box" style="${EMAIL_INLINE.panel}">
                <p style="${EMAIL_INLINE.paragraph}"><strong>Tu token de recuperación es:</strong></p>
                <p style="${EMAIL_INLINE.paragraph} font-size: 18px; letter-spacing: 0.15em;"><strong>${token}</strong></p>
              </div>

              <p style="${EMAIL_INLINE.paragraph}">Copia este token y pégalo en la página de recuperación de contraseña. El token expira en 15 minutos.</p>

              <p class="muted" style="${EMAIL_INLINE.muted} margin-top: 24px;">
                Si no solicitaste este cambio, puedes ignorar este mensaje.
              </p>
            </div>
            <div class="footer" style="${EMAIL_INLINE.footer}">
              <p style="${EMAIL_INLINE.footerText}">© 2026 Tsinghe Cocina Fusión. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: '"Tsinghe Cocina Fusión" <tsinghecocinafusion@gmail.com>',
        to: email,
        subject: "Recuperación de contraseña - Tsinghe Cocina Fusión",
        html: emailHtml,
      });

      logger.info("EMAIL DE RECUPERACIÓN enviado:", { to: email, name, token });

      res.status(200).json({
        success: true,
        message: "Token de recuperación enviado a " + email,
      });
    } catch (error) {
      logger.error("Error enviando email de recuperación:", error);
      res.status(500).json({
        error: "Error al enviar el email: " + error.message,
      });
    }
  },
);

const resetPasswordWithToken = onRequest(
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
      const { email, newPassword, token } = req.body;

      if (!email || !newPassword || !token) {
        res.status(400).json({
          error: "Email, token y newPassword son obligatorios",
        });
        return;
      }

      // Validar token en Firestore
      const resetDoc = await db.collection("passwordResets").doc(email).get();

      if (!resetDoc.exists) {
        res.status(400).json({
          error: "No hay solicitud de reset activa para este email",
        });
        return;
      }

      const resetData = resetDoc.data();

      // Validar token
      if (resetData.token !== token.toUpperCase()) {
        res.status(400).json({ error: "Token incorrecto" });
        return;
      }

      // Validar que no haya expirado
      if (new Date() > new Date(resetData.expiresAt.toDate())) {
        await db.collection("passwordResets").doc(email).delete();
        res.status(400).json({ error: "El token ha expirado" });
        return;
      }

      // Obtener usuario por email desde Firestore
      const userQuery = await db
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (userQuery.empty) {
        res.status(400).json({ error: "Usuario no encontrado" });
        return;
      }

      const userId = userQuery.docs[0].id;

      // Cambiar contraseña en Firebase Auth
      // Primero verificar si el usuario existe en Auth
      try {
        // Intentar obtener el usuario por email
        const userRecord = await admin.auth().getUserByEmail(email);

        // Actualizar contraseña
        await admin.auth().updateUser(userRecord.uid, {
          password: newPassword,
        });

        logger.info("Contraseña actualizada para usuario:", { email, userId });
      } catch (authError) {
        // Si el usuario no existe en Auth (cuenta federada como Google)
        // Crear un enlace de verificación de email
        if (authError.code === "auth/user-not-found") {
          logger.warn("Usuario no existe en Auth (cuenta federada):", email);

          // Enviar email con enlace para establecer contraseña
          const resetLink = await admin.auth().generatePasswordResetLink(email);

          await transporter.sendMail({
            from: '"Tsinghe Cocina Fusión" <tsinghecocinafusion@gmail.com>',
            to: email,
            subject: "Establece tu contraseña - Tsinghe Cocina Fusión",
            html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><style>
              ${EMAIL_STYLES}
            </style></head>
            <body style="${EMAIL_INLINE.body}">
              <div class="container" style="${EMAIL_INLINE.container}">
                <div class="header" style="${EMAIL_INLINE.header}"><h1 style="${EMAIL_INLINE.title}">🔐 Establece tu Contraseña</h1></div>
                <div class="content" style="${EMAIL_INLINE.content}">
                  <p>Has solicitado recuperar tu contraseña.</p>
                  <p>Como te registraste con Google, necesitas crear una contraseña para poder acceder con email y contraseña.</p>
                  <p>Haz clic en el siguiente botón para establecer tu contraseña:</p>
                  <a href="${resetLink}" class="btn" style="${EMAIL_INLINE.button}">Establecer Contraseña</a>
                  <p class="muted" style="${EMAIL_INLINE.muted} margin-top: 20px;">
                    Si no solicitaste esto, ignora este email.
                  </p>
                </div>
                <div class="footer" style="${EMAIL_INLINE.footer}"><p style="${EMAIL_INLINE.footerText}">© 2024 Tsinghe Cocina Fusión.</p></div>
              </div>
            </body>
            </html>
            `,
          });

          res.status(200).json({
            success: true,
            message:
              "Se ha enviado un enlace a tu email para establecer la contraseña",
          });
          return;
        }

        logger.error("Error actualizando contraseña en Auth:", authError);
        res.status(500).json({
          error: "Error al actualizar la contraseña: " + authError.message,
        });
        return;
      }

      // Eliminar token de reset después de usarlo
      await db.collection("passwordResets").doc(email).delete();

      // Enviar email de confirmación
      try {
        await transporter.sendMail({
          from: '"Tsinghe Cocina Fusión" <tsinghecocinafusion@gmail.com>',
          to: email,
          subject: "Tu contraseña ha sido actualizada - Tsinghe Cocina Fusión",
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
                <h1 style="${EMAIL_INLINE.title}">✅ Contraseña Actualizada</h1>
              </div>
              <div class="content" style="${EMAIL_INLINE.content}">
                <p>Tu contraseña ha sido actualizada exitosamente.</p>
                <p>Ya puedes iniciar sesión con tu nueva contraseña en Tsinghe Cocina Fusión.</p>
                <p class="muted" style="${EMAIL_INLINE.muted}">Si no realizaste este cambio, contacta a soporte inmediatamente.</p>
              </div>
              <div class="footer" style="${EMAIL_INLINE.footer}">
                <p style="${EMAIL_INLINE.footerText}">© 2024 Tsinghe Cocina Fusión. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        });
      } catch (emailError) {
        logger.warn("Email de confirmación no enviado:", emailError);
        // No fallar si el email de confirmación no se envía
      }

      res.status(200).json({
        success: true,
        message: "Contraseña actualizada exitosamente",
      });
    } catch (error) {
      logger.error("Error en resetPasswordWithToken:", error);
      res.status(500).json({
        error: "Error interno: " + error.message,
      });
    }
  },
);

module.exports = {
  sendPasswordResetEmail,
  resetPasswordWithToken,
};
