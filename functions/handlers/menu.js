// handlers/menu.js
// Función HTTP para inicializar el menú básico con platos de ejemplo.

const { onRequest } = require("firebase-functions/https");
const { admin, db, logger } = require("../lib/firebase");

const initMenuBasic = onRequest(
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

module.exports = { initMenuBasic };
