// handlers/tables.js
// Funciones relacionadas con mesas.

const { onRequest } = require("firebase-functions/https");

// HTTP: inicializacion de mesas desactivada.
// Firestore es la fuente de verdad y no se crean mesas automaticamente.
const initTables = onRequest(
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

    res.status(200).json({
      success: true,
      message: "Inicializacion automatica de mesas desactivada.",
    });
  },
);

module.exports = { initTables };
