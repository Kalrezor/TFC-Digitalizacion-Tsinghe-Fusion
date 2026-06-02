// lib/email.js
// Transporter de Gmail (Nodemailer) y plantillas HTML de correo compartidas.

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

const EMAIL_STYLES = `
  body {
    margin: 0;
    padding: 32px;
    background-color: #ffffff;
    color: #050505;
    font-family: Inter, Helvetica Neue, Arial, sans-serif;
    line-height: 1.6;
    letter-spacing: 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border: 1px solid #050505;
    border-radius: 0;
    overflow: hidden;
  }
  .header {
    background: #ffffff;
    padding: 38px 32px 30px;
    text-align: left;
    border-bottom: 1px solid #050505;
  }
  .header h1 {
    color: #050505;
    margin: 0;
    font-family: Georgia, Times New Roman, serif;
    font-size: 34px;
    line-height: 0.96;
    font-weight: 400;
    letter-spacing: 0;
  }
  .content {
    padding: 30px;
    background: #ffffff;
  }
  .content h1,
  .content h2,
  .content h3 {
    color: #050505;
    margin-top: 0;
    letter-spacing: 0;
  }
  .content h2 {
    font-family: Georgia, Times New Roman, serif;
    font-size: 28px;
    line-height: 1.05;
    font-weight: 400;
  }
  .content p,
  .content li {
    color: #050505;
    font-size: 14px;
  }
  .content ul,
  .content ol {
    padding-left: 22px;
  }
  a {
    color: #050505 !important;
    text-decoration: none !important;
  }
  a:hover {
    opacity: 0.65;
  }
  .button,
  .btn {
    display: inline-block;
    min-height: 44px;
    background: #ffffff;
    color: #050505 !important;
    padding: 12px 18px;
    text-decoration: none;
    border: 1px solid #050505;
    border-radius: 0;
    margin-top: 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  .button:hover,
  .btn:hover {
    background: #050505;
    color: #ffffff !important;
    border-color: #050505;
  }
  .info-box,
  .reservation-details {
    background: #ffffff;
    border: 1px solid #050505;
    border-radius: 0;
    padding: 18px;
    margin: 20px 0;
  }
  .muted {
    color: #18181b !important;
    font-size: 12px !important;
  }
  .link-copy {
    word-break: break-all;
  }
  .footer {
    background: #050505;
    padding: 20px;
    text-align: center;
    color: #ffffff;
    font-size: 12px;
    letter-spacing: 0.08em;
  }
  .footer p {
    color: #ffffff;
    margin: 0;
  }
`;

const EMAIL_INLINE = {
  body: "margin: 0; padding: 32px; background: #ffffff; color: #050505; font-family: Inter, Helvetica Neue, Arial, sans-serif; line-height: 1.6; letter-spacing: 0;",
  container:
    "max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #050505; border-radius: 0; overflow: hidden;",
  header:
    "background: #ffffff; padding: 38px 32px 30px; text-align: left; border-bottom: 1px solid #050505;",
  title:
    "color: #050505; margin: 0; font-family: Georgia, Times New Roman, serif; font-size: 34px; line-height: 0.96; font-weight: 400; letter-spacing: 0;",
  subtitle:
    "color: #050505; margin: 0 0 18px; font-family: Georgia, Times New Roman, serif; font-size: 28px; line-height: 1.05; font-weight: 400; letter-spacing: 0;",
  content: "padding: 30px; background: #ffffff; color: #050505;",
  paragraph: "color: #050505; font-size: 14px; line-height: 1.6;",
  button:
    "display: inline-block; min-height: 20px; background: #ffffff; color: #050505 !important; padding: 12px 18px; text-decoration: none; border: 1px solid #050505; border-radius: 0; margin-top: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase;",
  panel:
    "background: #ffffff; border: 1px solid #050505; border-radius: 0; padding: 18px; margin: 20px 0; color: #050505;",
  muted: "color: #18181b; font-size: 12px; line-height: 1.5;",
  footer:
    "background: #050505; padding: 20px; text-align: center; color: #ffffff; font-size: 12px; letter-spacing: 0.08em;",
  footerText: "color: #ffffff; margin: 0;",
};

const buildWelcomeEmailHtml = (name) => `
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
              <p style="margin: 0 0 14px; color: #050505; font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase;">Cocina fusion · Madrid</p>
              <h1 style="${EMAIL_INLINE.title}">Tsinghe Cocina Fusion</h1>
            </div>
            <div class="content" style="${EMAIL_INLINE.content}">
              <h2 style="${EMAIL_INLINE.subtitle}">Hola ${name}</h2>
              <p style="${EMAIL_INLINE.paragraph}">Gracias por registrarte en <strong style="color: #050505;">Tsinghe Cocina Fusion</strong>.</p>
              <p style="${EMAIL_INLINE.paragraph}">Estamos muy felices de tenerte con nosotros. Ahora puedes:</p>
              <ul style="${EMAIL_INLINE.paragraph} padding-left: 22px;">
                <li style="margin-bottom: 8px;">Explorar nuestro menú</li>
                <li style="margin-bottom: 8px;">Hacer reservas de mesa</li>
                <li>Ver tus reservas anteriores</li>
              </ul>
              <p style="${EMAIL_INLINE.paragraph}">Te esperamos para vivir una experiencia de mesa serena, precisa y contemporanea.</p>
              <a href="https://digitalizacion-tsinge-fusion.web.app/" style="${EMAIL_INLINE.button}">Visitar restaurante</a>
            </div>
            <div class="footer" style="${EMAIL_INLINE.footer}">
              <p style="${EMAIL_INLINE.footerText}">© 2026 Tsinghe Cocina Fusion. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `;

const buildReservationStatusEmailHtml = ({
  name,
  status,
  reservationDetails,
}) => {
  const title =
    status === "confirmada"
      ? "✅ Tu reserva ha sido confirmada"
      : "❌ Tu reserva ha sido cancelada";

  const statusCopy =
    status === "confirmada"
      ? "Tu reserva en Tsinghe Cocina Fusión ha sido confirmada."
      : "Tu reserva en Tsinghe Cocina Fusión ha sido cancelada.";

  const tableInfo = Array.isArray(reservationDetails.tableIds)
    ? reservationDetails.tableIds.join(", ")
    : reservationDetails.tableNumber || "Por asignar";

  return `
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
              <p style="margin: 0 0 14px; color: #050505; font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase;">Cocina fusion · Madrid</p>
              <h1 style="${EMAIL_INLINE.title}">${title}</h1>
            </div>
            <div class="content" style="${EMAIL_INLINE.content}">
              <h2 style="${EMAIL_INLINE.subtitle}">Hola ${name}</h2>
              <p style="${EMAIL_INLINE.paragraph}">${statusCopy}</p>

              <div class="reservation-details" style="${EMAIL_INLINE.panel}">
                <h3 style="margin: 0 0 12px; color: #050505; font-size: 17px;">Detalles de la reserva</h3>
                <p style="${EMAIL_INLINE.paragraph}"><strong>Fecha:</strong> ${reservationDetails.date || reservationDetails.reservationDate || "Sin fecha"}</p>
                <p style="${EMAIL_INLINE.paragraph}"><strong>Hora:</strong> ${reservationDetails.time || reservationDetails.reservationTime || "Sin hora"}</p>
                <p style="${EMAIL_INLINE.paragraph}"><strong>Personas:</strong> ${reservationDetails.numberOfPeople ?? reservationDetails.peopleCount ?? "Por confirmar"}</p>
                <p style="${EMAIL_INLINE.paragraph}"><strong>Mesa:</strong> ${tableInfo}</p>
                ${reservationDetails.specialRequests ? `<p style="${EMAIL_INLINE.paragraph}"><strong>Solicitudes especiales:</strong> ${reservationDetails.specialRequests}</p>` : ""}
              </div>

              <p style="${EMAIL_INLINE.paragraph}">Si tienes alguna duda, escríbenos y te ayudaremos.</p>
              <a href="https://digitalizacion-tsinge-fusion.web.app/" style="${EMAIL_INLINE.button}">Visitar restaurante</a>
            </div>
            <div class="footer" style="${EMAIL_INLINE.footer}">
              <p style="${EMAIL_INLINE.footerText}">© 2026 Tsinghe Cocina Fusion. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `;
};

module.exports = {
  transporter,
  EMAIL_STYLES,
  EMAIL_INLINE,
  buildWelcomeEmailHtml,
  buildReservationStatusEmailHtml,
};
