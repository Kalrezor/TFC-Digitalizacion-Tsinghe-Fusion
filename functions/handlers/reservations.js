// handlers/reservations.js
// Funciones relacionadas con reservas: notificaciones, triggers, confirmación
// por token y verificación de No-Shows.

const { onRequest } = require("firebase-functions/https");
const { onDocumentWritten } = require("firebase-functions/firestore");
const { onSchedule } = require("firebase-functions/scheduler");
const { admin, db, logger } = require("../lib/firebase");
const {
  transporter,
  EMAIL_STYLES,
  EMAIL_INLINE,
  buildReservationStatusEmailHtml,
} = require("../lib/email");

const sendReservationStatusNotification = onRequest(
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
      const { email, reservationDetails, newStatus } = req.body;

      if (!email || !reservationDetails || !newStatus) {
        res.status(400).json({
          error: "Email, detalles de reserva y nuevo estado son obligatorios",
        });
        return;
      }

      if (!["confirmada", "cancelada"].includes(newStatus)) {
        res.status(400).json({
          error: "El estado debe ser confirmada o cancelada",
        });
        return;
      }

      const name = reservationDetails.userName || email.split("@")[0];
      const info = await transporter.sendMail({
        from: '"Tsinghe Cocina Fusión" <tsinghecocinafusion@gmail.com>',
        to: email,
        subject:
          newStatus === "confirmada"
            ? "✅ Tu reserva ha sido confirmada"
            : "❌ Tu reserva ha sido cancelada",
        html: buildReservationStatusEmailHtml({
          name,
          status: newStatus,
          reservationDetails,
        }),
      });

      logger.info("EMAIL DE ESTADO DE RESERVA enviado:", {
        to: email,
        status: newStatus,
        messageId: info.messageId,
      });

      res.status(200).json({
        success: true,
        message: "Email enviado a " + email,
        messageId: info.messageId,
      });
    } catch (error) {
      logger.error("Error enviando email de estado de reserva:", error);
      res.status(500).json({
        error: "Error interno al enviar el email: " + error.message,
      });
    }
  },
);

// TRIGGER: cuando se escribe una reserva → actualizar campo reservationCount
const onReservationWrite = onDocumentWritten(
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

const sendReservationConfirmation = onRequest(
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
              <h1 style="${EMAIL_INLINE.title}">¡Reserva Confirmada! 📅</h1>
            </div>
            <div class="content" style="${EMAIL_INLINE.content}">
            <p>Hola ${reservationDetails.userName},</p>
            <p>Tu reserva en <strong>Tsinghe Cocina Fusión</strong> ha sido registrada.</p>

            <div class="reservation-details" style="${EMAIL_INLINE.panel}">
              <h3>Detalles de tu Reserva:</h3>
              <p><strong>Fecha:</strong> ${reservationDetails.date}</p>
              <p><strong>Hora:</strong> ${reservationDetails.time}</p>
              <p><strong>Personas:</strong> ${reservationDetails.numberOfPeople}</p>
              <p><strong>Mesa:</strong> ${reservationDetails.tableNumber || "Por asignar"}</p>
              ${reservationDetails.specialRequests ? `<p><strong>Solicitudes especiales:</strong> ${reservationDetails.specialRequests}</p>` : ""}
            </div>

            <p>Para confirmar tu reserva, haz clic en el botón de abajo:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationLink}" class="button" style="${EMAIL_INLINE.button}">Confirmar Reserva</a>
            </div>

            <p class="muted" style="${EMAIL_INLINE.muted} margin-top: 30px;">
              O copia este enlace en tu navegador:<br>
              <small class="link-copy">${confirmationLink}</small>
            </p>

            <p class="muted" style="${EMAIL_INLINE.muted}">
              Si no realizaste esta reserva, ignora este email.
            </p>

            </div>
            <div class="footer" style="${EMAIL_INLINE.footer}">
              <p style="${EMAIL_INLINE.footerText}">
                Tsinghe Cocina Fusión - Auténtica Cocina China<br>
                © 2024 Todos los derechos reservados
              </p>
            </div>
          </div>
        </body>
        </html>
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

const confirmReservationToken = onRequest(
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

// SCHEDULED: verificar No-Show cada 15 minutos
// Se ejecuta cada 15 minutos via Pub/Sub
// Marca como "no-asistió" las reservas confirmadas cuya hora pasó
// sin que el usuario confirmara en persona
const checkNoShows = onSchedule(
  {
    schedule: "every 15 minutes",
    region: "us-central1",
    timeout: "60s",
  },
  async () => {
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

module.exports = {
  sendReservationStatusNotification,
  onReservationWrite,
  sendReservationConfirmation,
  confirmReservationToken,
  checkNoShows,
};
