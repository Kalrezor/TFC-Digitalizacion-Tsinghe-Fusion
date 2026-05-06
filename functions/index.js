/**
 * Tsinghe Cocina Fusión - Cloud Functions
 * Funciones del servidor para el restaurante.
 *
 * FUNCIONES:
 * 1. sendWelcomeEmail   - HTTP: enviar email de bienvenida 
 * 2. sendVerificationEmail - HTTP: crear usuario y enviar email de verificación
 * 3. onReservationWrite - Trigger: cuando se crea/cancela una reserva, actualiza la mesa
 * 4. initTables         - HTTP: inicializa las 20 mesas en Firestore (llamar UNA sola vez)
 *
 * DEPLOY: firebase deploy --only functions
 */

const functions = require("firebase-functions");
const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const {
  onDocumentWritten,
} = require("firebase-functions/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ maxInstances: 10, region: "us-central1" });

// ════════════════════════════════════════════════════════════════════════════
// NOTA: El trigger onUserCreated de Auth se maneja mejor desde Firestore
// Se crean usuarios directamente en Firestore desde el cliente al registrarse
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// 2. HTTP: enviar email de bienvenida con Gmail/Nodemailer
// ════════════════════════════════════════════════════════════════════════════
const nodemailer = require("nodemailer");

// Configurar transporter de Gmail con opciones adicionales
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tsinghecocinafusion@gmail.com",
    pass: "rpywbmhczebdkcht",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.sendWelcomeEmail = onRequest(
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

      // Enviar email real con Gmail/Nodemailer
      const info = await transporter.sendMail({
        from: '"Tsinghe Cocina Fusión" <tsinghecocinafusion@gmail.com>',
        to: email,
        subject: "¡Bienvenido a Tsinghe Cocina Fusión! 🍜",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5dc; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #dc143c 0%, #8b0000 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .content h2 { color: #dc143c; margin-top: 0; }
            .content p { color: #333; line-height: 1.6; }
            .button { display: inline-block; background: #dc143c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { background: #1a1a1a; padding: 20px; text-align: center; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍜 Tsinghe Cocina Fusión</h1>
            </div>
            <div class="content">
              <h2>¡Hola ${name}!</h2>
              <p>Gracias por registrarte en <strong>Tsinghe Cocina Fusión</strong>.</p>
              <p>Estamos muy felices de tenerte con nosotros. Ahora puedes:</p>
              <ul>
                <li>Explorar nuestro menú</li>
                <li>Hacer reservas de mesa</li>
                <li>Ver tus reservas anteriores</li>
              </ul>
              <p>¡Te esperamos para vivir una experiencia culinaria única!</p>
              <a href="https://digitalizacion-tsinge-fusion.web.app/" class="button">Visitar nuestro restaurante</a>
            </div>
            <div class="footer">
              <p>© 2024 Tsinghe Cocina Fusión. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
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

// ════════════════════════════════════════════════════════════════════════════
// 3. TRIGGER: cuando se escribe una reserva → actualizar campo reservationCount
exports.onReservationWrite = onDocumentWritten(
  "reservations/{reservationId}",
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();

    // Determinar que mesa(s) afectar
    const tableIdBefore = before?.tableId || null;
    const tableIdAfter = after?.tableId || null;

    // Funcion para recalcular el numero de reservas activas de una mesa
    const updateTableCount = async (tableId) => {
      if (!tableId) return;
      try {
        const snap = await db
          .collection("reservations")
          .where("tableId", "==", tableId)
          .where("status", "!=", "cancelada")
          .get();

        await db.collection("tables").doc(tableId).update({
          reservationCount: snap.size,
        });

        logger.info("Mesa actualizada:", {
          tableId,
          reservationCount: snap.size,
        });
      } catch (err) {
        logger.error("Error actualizando mesa:", { tableId, err: err.message });
      }
    };

    // Actualizar la mesa anterior (si cambio de mesa)
    if (tableIdBefore && tableIdBefore !== tableIdAfter) {
      await updateTableCount(tableIdBefore);
    }
    // Actualizar la mesa nueva/actual
    if (tableIdAfter) {
      await updateTableCount(tableIdAfter);
    }
  },
);

// ════════════════════════════════════════════════════════════════════════════
// 4. HTTP: inicializar las 20 mesas en Firestore
//    Llamar UNA SOLA VEZ desde el navegador o con curl:
//    curl -X POST https://us-central1-<proyecto>.cloudfunctions.net/initTables
//    Una vez ejecutada, las mesas quedan en Firestore y esta funcion
//    ya no hace falta volver a llamarla.
// ════════════════════════════════════════════════════════════════════════════
exports.initTables = onRequest(
  {
    region: "us-central1",
    cors: "*",
    invoker: "public",
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");

    if (req.method !== "POST") {
      res.status(405).json({ error: "Solo POST" });
      return;
    }

    try {
      // Capacidades de las 20 mesas (ajusta a tu gusto)
      const capacities = [
        2,
        2,
        4,
        4,
        4, // Mesas 1-5
        4,
        4,
        6,
        6,
        6, // Mesas 6-10
        6,
        4,
        4,
        4,
        4, // Mesas 11-15
        8,
        8,
        2,
        2,
        10, // Mesas 16-20
      ];

      const batch = db.batch();

      for (let i = 1; i <= 20; i++) {
        const tableRef = db.collection("tables").doc("mesa-" + i);

        // Si ya existe, no sobreescribir (merge: false evita borrar datos)
        const existing = await tableRef.get();
        if (existing.exists) {
          logger.info("Mesa ya existe, saltando:", i);
          continue;
        }

        batch.set(tableRef, {
          tableNumber: i,
          number: i,
          capacity: capacities[i - 1] || 4,
          active: true,
          available: true,
          reservationCount: 0,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      await batch.commit();
      logger.info("20 mesas inicializadas correctamente.");

      res.status(200).json({
        success: true,
        message: "Mesas inicializadas. Revisa Firestore > coleccion 'tables'.",
      });
    } catch (error) {
      logger.error("Error inicializando mesas:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// ════════════════════════════════════════════════════════════════════════════
// 5. HTTP: enviar email de verificación para usuarios creados por admin
// ════════════════════════════════════════════════════════════════════════════
exports.sendVerificationEmail = onRequest(
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
            body { font-family: Arial, sans-serif; background-color: #f5f5dc; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #dc143c 0%, #8b0000 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .content h2 { color: #dc143c; margin-top: 0; }
            .content p { color: #333; line-height: 1.6; }
            .button { display: inline-block; background: #dc143c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
            .info-box { background: #fffacd; border-left: 4px solid #dc143c; padding: 15px; margin: 20px 0; }
            .footer { background: #1a1a1a; padding: 20px; text-align: center; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍜 Tsinghe Cocina Fusión</h1>
            </div>
            <div class="content">
              <h2>¡Hola ${displayName}!</h2>
              <p>Tu cuenta ha sido creada por el administrador de <strong>Tsinghe Cocina Fusión</strong>.</p>
              
              <div class="info-box">
                <strong>📋 Tu reserva está pendiente de confirmación</strong>
                <p>Se ha creado una reserva a tu nombre. Para que sea válida, necesitas:</p>
                <ul>
                  <li>Verificar este correo (haciendo clic en el botón de abajo)</li>
                  <li>Crear una contraseña segura en tu cuenta</li>
                </ul>
              </div>

              <p>Una vez completes estos pasos, tu reserva será confirmada automáticamente.</p>

              <a href="https://digitalizacion-tsinge-fusion.web.app/login" class="button">Confirmar mi cuenta</a>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                Si no fuiste tú quien creó esta cuenta, puedes ignorar este mensaje.
              </p>
            </div>
            <div class="footer">
              <p>© 2024 Tsinghe Cocina Fusión. Todos los derechos reservados.</p>
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
  /*            
              <div class="token-box">
                <div class="label">Tu Token:</div>
                <div class="token">${token}</div>
              </div>

              <p><strong>Instrucciones:</strong></p>
              <ol>
                <li>Accede a la página de recuperación de contraseña</li>
                <li>Ingresa este token: <strong>${token}</strong></li>
                <li>Establece tu nueva contraseña</li>
                <li>¡Listo! Ya podrás acceder con tu nueva contraseña</li>
              </ol>

              <div class="warning">
                ⚠️ <strong>Este token expira en 15 minutos.</strong> Si no lo usas, tendrás que solicitar uno nuevo.
              </div>

              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                Si no solicitaste esta recuperación, ignora este email.
              </p>
            </div>
            <div class="footer">
              <p>© 2024 Tsinghe Cocina Fusión. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      });

      logger.info("Email de reset de contraseña enviado:", {
        to: email,
        token: token,
        messageId: info.messageId,
      });

      res.status(200).json({
        success: true,
        message: "Email de recuperación enviado a " + email,
      });
    } catch (error) {
      logger.error("Error enviando email de reset:", error);
      res.status(500).json({
        error: "Error al enviar el email: " + error.message,
      });
    }
  },
);*/

// ════════════════════════════════════════════════════════════════════════════
// 6. HTTP: validar token y resetear contraseña
// ════════════════════════════════════════════════════════════════════════════
exports.resetPasswordWithToken = onRequest(
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
              body { font-family: Arial, sans-serif; background-color: #f5f5dc; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #dc143c 0%, #8b0000 100%); padding: 30px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; }
              .content { padding: 30px; }
              .content p { color: #333; line-height: 1.6; }
              .btn { display: inline-block; padding: 12px 24px; background: #dc143c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { background: #1a1a1a; padding: 20px; text-align: center; color: #888; font-size: 12px; }
            </style></head>
            <body>
              <div class="container">
                <div class="header"><h1>🔐 Establece tu Contraseña</h1></div>
                <div class="content">
                  <p>Has solicitado recuperar tu contraseña.</p>
                  <p>Como te registraste con Google, necesitas crear una contraseña para poder acceder con email y contraseña.</p>
                  <p>Haz clic en el siguiente botón para establecer tu contraseña:</p>
                  <a href="${resetLink}" class="btn">Establecer Contraseña</a>
                  <p style="color: #666; font-size: 12px; margin-top: 20px;">
                    Si no solicitaste esto, ignora este email.
                  </p>
                </div>
                <div class="footer"><p>© 2024 Tsinghe Cocina Fusión.</p></div>
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
              body { font-family: Arial, sans-serif; background-color: #f5f5dc; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; }
              .content { padding: 30px; }
              .footer { background: #1a1a1a; padding: 20px; text-align: center; color: #888; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Contraseña Actualizada</h1>
              </div>
              <div class="content">
                <p>Tu contraseña ha sido actualizada exitosamente.</p>
                <p>Ya puedes iniciar sesión con tu nueva contraseña en Tsinghe Cocina Fusión.</p>
                <p style="color: #666; font-size: 12px;">Si no realizaste este cambio, contacta a soporte inmediatamente.</p>
              </div>
              <div class="footer">
                <p>© 2024 Tsinghe Cocina Fusión. Todos los derechos reservados.</p>
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

// ════════════════════════════════════════════════════════════════════════════
// 7. HTTP: inicializar menú básico con platos
//    Llamar UNA SOLA VEZ desde el navegador o con curl
// ════════════════════════════════════════════════════════════════════════════
exports.initMenuBasic = onRequest(
  {
    region: "us-central1",
    cors: "*",
    invoker: "public",
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");

    if (req.method !== "POST") {
      res.status(405).json({ error: "Solo POST" });
      return;
    }

    try {
      const menuItems = [
        // ENTRANTES
        {
          name: "Rollitos de Primavera",
          description: "Crujientes rollitos rellenos de verduras y camarones",
          category: "Entrantes",
          price: 6.5,
          available: true,
          active: true,
        },
        {
          name: "Tabla de Embutidos",
          description: "Selección de embutidos ibéricos y quesos variados",
          category: "Entrantes",
          price: 12.0,
          available: true,
          active: true,
        },
        {
          name: "Bruschettas Variadas",
          description: "Pan tostado con tomate, queso y hierbas aromáticas",
          category: "Entrantes",
          price: 8.0,
          available: true,
          active: true,
        },
        {
          name: "Tabla de Quesos",
          description: "Selección de quesos nacionales e internacionales",
          category: "Entrantes",
          price: 14.0,
          available: true,
          active: true,
        },

        // PRINCIPALES - CARNES
        {
          name: "Filete Mignon a la Pimienta",
          description: "Filete de carne con salsa de pimienta negra y hierbas",
          category: "Principales - Carnes",
          price: 22.0,
          available: true,
          active: true,
        },
        {
          name: "Carne Asada al Carbón",
          description: "Trozos de carne premium a la parrilla con chimichurri",
          category: "Principales - Carnes",
          price: 24.0,
          available: true,
          active: true,
        },
        {
          name: "Pollo a la Naranja",
          description:
            "Pechuga de pollo glaseada con salsa de naranja y jengibre",
          category: "Principales - Carnes",
          price: 18.0,
          available: true,
          active: true,
        },

        // PRINCIPALES - PESCADOS
        {
          name: "Salmón a la Mantequilla",
          description:
            "Filete de salmón fresco con salsa de mantequilla y limón",
          category: "Principales - Pescados",
          price: 20.0,
          available: true,
          active: true,
        },
        {
          name: "Lubina al Horno",
          description: "Lubina entera con verduras asadas y aceite de oliva",
          category: "Principales - Pescados",
          price: 21.0,
          available: true,
          active: true,
        },
        {
          name: "Camarones al Ajillo",
          description: "Camarones frescos salteados con ajo, limón y perejil",
          category: "Principales - Pescados",
          price: 19.0,
          available: true,
          active: true,
        },

        // PRINCIPALES - VEGETARIANOS
        {
          name: "Risotto de Champiñones",
          description: "Arroz cremoso con champiñones variados y parmesano",
          category: "Principales - Vegetarianos",
          price: 15.0,
          available: true,
          active: true,
        },
        {
          name: "Pasta a la Trufa",
          description:
            "Pasta fresca con salsa de trufa negra y hongos silvestres",
          category: "Principales - Vegetarianos",
          price: 16.0,
          available: true,
          active: true,
        },
        {
          name: "Berenjena a la Parmesana",
          description:
            "Capas de berenjena, tomate y queso mozzarella gratinado",
          category: "Principales - Vegetarianos",
          price: 14.0,
          available: true,
          active: true,
        },

        // BEBIDAS
        {
          name: "Vino Tinto Reserva",
          description: "Vino tinto español de excelente calidad",
          category: "Bebidas",
          price: 10.0,
          available: true,
          active: true,
        },
        {
          name: "Vino Blanco Sauvignon",
          description: "Vino blanco fresco con notas cítricas",
          category: "Bebidas",
          price: 9.5,
          available: true,
          active: true,
        },
        {
          name: "Cerveza Artesanal",
          description: "Cerveza artesanal local de 330ml",
          category: "Bebidas",
          price: 4.5,
          available: true,
          active: true,
        },
        {
          name: "Jugo Natural de Frutas",
          description: "Jugo fresco de frutas variadas",
          category: "Bebidas",
          price: 5.0,
          available: true,
          active: true,
        },

        // POSTRES
        {
          name: "Tiramisú Clásico",
          description:
            "Postre italiano con capas de bizcochos, café y mascarpone",
          category: "Postres",
          price: 7.0,
          available: true,
          active: true,
        },
        {
          name: "Flan de Caramelo",
          description: "Flan casero con salsa de caramelo",
          category: "Postres",
          price: 6.0,
          available: true,
          active: true,
        },
        {
          name: "Mousse de Chocolate",
          description: "Mousse de chocolate belga con galleta de canela",
          category: "Postres",
          price: 7.5,
          available: true,
          active: true,
        },
        {
          name: "Fresas con Crema",
          description: "Fresas frescas con crema batida y merengue",
          category: "Postres",
          price: 8.0,
          available: true,
          active: true,
        },
      ];

      const batch = db.batch();
      const timestamp = admin.firestore.FieldValue.serverTimestamp();

      for (const item of menuItems) {
        const docRef = db.collection("menus").doc();
        batch.set(docRef, {
          ...item,
          createdAt: timestamp,
        });
      }

      await batch.commit();
      logger.info("Menú básico inicializado con", menuItems.length, "platos");

      res.status(200).json({
        success: true,
        message: `Menú inicializado con ${menuItems.length} platos`,
      });
    } catch (error) {
      logger.error("Error inicializando menú:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// ════════════════════════════════════════════════════════════════════════════
// 8. HTTP: enviar confirmación de reserva por email
//    Llamado desde el cliente cuando se crea una reserva
// ════════════════════════════════════════════════════════════════════════════
exports.sendReservationConfirmation = onRequest(
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
      res.status(405).json({ error: "Solo POST" });
      return;
    }

    try {
      const nodemailer = require("nodemailer");
      const { email, reservationDetails, confirmationToken } = req.body;

      if (!email || !reservationDetails) {
        res.status(400).json({
          error: "Email y detalles de reserva son obligatorios",
        });
        return;
      }

      // Configurar Nodemailer con Gmail
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER || "tsinghecocinafusion@gmail.com",
          pass: process.env.GMAIL_PASS,
        },
      });

      // Generar HTML del email
      const confirmationLink = `https://digitalizacion-tsinge-fusion.web.app/confirm-reservation?token=${confirmationToken}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px; border-radius: 8px;">
          <div style="background: white; padding: 30px; border-radius: 8px; border-left: 4px solid #DC143C;">
            <h1 style="color: #DC143C; margin-top: 0;">¡Reserva Confirmada! 📅</h1>
            <p>Hola ${reservationDetails.userName},</p>
            <p>Tu reserva en <strong>Tsinghe Cocina Fusión</strong> ha sido registrada.</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Detalles de tu Reserva:</h3>
              <p><strong>Fecha:</strong> ${reservationDetails.date}</p>
              <p><strong>Hora:</strong> ${reservationDetails.time}</p>
              <p><strong>Personas:</strong> ${reservationDetails.numberOfPeople}</p>
              <p><strong>Mesa:</strong> ${reservationDetails.tableNumber || "Por asignar"}</p>
              ${reservationDetails.specialRequests ? `<p><strong>Solicitudes especiales:</strong> ${reservationDetails.specialRequests}</p>` : ""}
            </div>

            <p>Para confirmar tu reserva, haz clic en el botón de abajo:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationLink}" style="background: #DC143C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Confirmar Reserva</a>
            </div>

            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              O copia este enlace en tu navegador:<br>
              <small>${confirmationLink}</small>
            </p>

            <p style="color: #666;">
              Si no realizaste esta reserva, ignora este email.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Tsinghe Cocina Fusión - Auténtica Cocina China<br>
              © 2024 Todos los derechos reservados
            </p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: "Tsinghe Cocina Fusión <tsinghecocinafusion@gmail.com>",
        to: email,
        subject: "📅 Confirmación de tu Reserva en Tsinghe Cocina Fusión",
        html: emailHtml,
      });

      logger.info("Email de confirmación de reserva enviado a:", email);

      res.status(200).json({
        success: true,
        message: "Email de confirmación enviado",
      });
    } catch (error) {
      logger.error("Error enviando email de confirmación:", error);
      res.status(500).json({
        error: "Error enviando email: " + error.message,
      });
    }
  },
);

// ════════════════════════════════════════════════════════════════════════════
// 9. HTTP: confirmar token de reserva
//    Llamado desde el link en el email de confirmación
// ════════════════════════════════════════════════════════════════════════════
exports.confirmReservationToken = onRequest(
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
      res.status(405).json({ error: "Solo POST" });
      return;
    }

    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ error: "Token es obligatorio" });
        return;
      }

      // Buscar el token en la colección reservationConfirmations
      const snapshot = await db
        .collection("reservationConfirmations")
        .where("token", "==", token)
        .where("used", "==", false)
        .limit(1)
        .get();

      if (snapshot.empty) {
        res.status(400).json({ error: "Token no válido o ya fue usado" });
        return;
      }

      const tokenDoc = snapshot.docs[0];
      const tokenData = tokenDoc.data();

      // Verificar que no haya expirado (24 horas)
      const expiryTime = new Date(tokenData.createdAt.toDate());
      expiryTime.setHours(expiryTime.getHours() + 24);

      if (new Date() > expiryTime) {
        res.status(400).json({ error: "El token ha expirado" });
        return;
      }

      // Marcar el token como usado
      await tokenDoc.ref.update({
        used: true,
        usedAt: admin.firestore.Timestamp.now(),
      });

      // Actualizar la reserva a "confirmada"
      const reservationRef = db
        .collection("reservations")
        .doc(tokenData.reservationId);
      await reservationRef.update({
        status: "confirmada",
        confirmedAt: admin.firestore.Timestamp.now(),
      });

      // Verificar si el usuario existe en Firestore
      const userQuery = await db
        .collection("users")
        .where("email", "==", tokenData.email)
        .limit(1)
        .get();

      const userExists = !userQuery.empty;

      // Si el usuario no existe, generar URL de registro pre-llenado
      let registerUrl = null;
      if (!userExists) {
        registerUrl = `https://digitalizacion-tsinge-fusion.web.app/register?email=${encodeURIComponent(tokenData.email)}`;
      }

      logger.info("Reserva confirmada con token para:", tokenData.email);

      res.status(200).json({
        success: true,
        email: tokenData.email,
        userExists,
        registerUrl,
        message: userExists
          ? "Reserva confirmada exitosamente"
          : "Reserva confirmada. Crea tu perfil para gestionar tus reservas",
      });
    } catch (error) {
      logger.error("Error confirmando token de reserva:", error);
      res.status(500).json({
        error: "Error interno: " + error.message,
      });
    }
  },
);

// ════════════════════════════════════════════════════════════════════════════
// 10. SCHEDULED: verificar No-Show cada 15 minutos
//    Se ejecuta cada 15 minutos via Pub/Sub
//    Marca como "no-asistió" las reservas confirmadas cuya hora pasó
//    sin que el usuario confirmara en persona
// ════════════════════════════════════════════════════════════════════════════
const { onSchedule } = require("firebase-functions/scheduler");

exports.checkNoShows = onSchedule(
  {
    schedule: "every 15 minutes",
    region: "us-central1",
    timeout: "60s",
  },
  async (event) => {
    logger.info("Iniciando verificación de No-Shows...");

    try {
      const now = admin.firestore.Timestamp.now();

      // Buscar reservas confirmadas cuya hora ya pasó
      const snapshot = await db
        .collection("reservations")
        .where("status", "==", "confirmada")
        .get();

      let noShowCount = 0;
      const noShowReservations = [];

      for (const doc of snapshot.docs) {
        const reservation = doc.data();

        // Convertir la fecha de la reserva a objeto Date
        const reservationDate = reservation.date.toDate
          ? reservation.date.toDate()
          : new Date(reservation.date);

        // Combinar fecha + hora de la reserva
        const [hours, minutes] = (reservation.time || "20:00").split(":");
        reservationDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Añadir 15 minutos de gracia
        const graceTime = new Date(reservationDate.getTime() + 15 * 60 * 1000);

        // Si pasó la hora + 15 min de gracia, marcar como no-asistió
        if (now.toDate() > graceTime) {
          await doc.ref.update({
            status: "no-asistio",
            noShowAt: admin.firestore.Timestamp.now(),
            noShowReason:
              "No confirmado en persona dentro de los 15 minutos de gracia",
          });

          noShowCount++;
          noShowReservations.push({
            reservationId: doc.id,
            email: reservation.email,
            tableId: reservation.tableId,
            date: reservation.date,
            time: reservation.time,
          });

          logger.info("Reserva marcada como no-asistió:", {
            reservationId: doc.id,
            email: reservation.email,
          });
        }
      }

      logger.info("Verificación de No-Shows completada:", {
        totalCheck: snapshot.size,
        noShowsFound: noShowCount,
      });

      return {
        success: true,
        checked: snapshot.size,
        noShowsMarked: noShowCount,
        noShowReservations,
      };
    } catch (error) {
      logger.error("Error en verificación de No-Shows:", error);
      throw error;
    }
  },
);
