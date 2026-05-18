import chatbotContextService from "./ChatbotContextService";

const GEMINI_MODEL =
  process.env.REACT_APP_GEMINI_MODEL || "gemini-2.5-flash";

const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const RESTAURANT_KEYWORDS = [
  "alergeno",
  "alergenos",
  "carta",
  "comida",
  "menu",
  "mesa",
  "mesas",
  "oferta",
  "ofertas",
  "plato",
  "platos",
  "precio",
  "precios",
  "reserva",
  "reservas",
  "restaurante",
  "tsinghe",
  "usuario",
  "usuarios",
];

const EXTERNAL_KEYWORDS = [
  "clima",
  "tiempo",
  "noticias",
  "futbol",
  "bolsa",
  "bitcoin",
  "pelicula",
  "musica",
  "capital de",
  "presidente",
];

const ADMIN_KEYWORDS = [
  "base de datos",
  "bd",
  "libres ahora",
  "mesa libre",
  "mesas libres",
  "reservas del dia",
  "todas las reservas",
  "usuarios",
];

const GREETING_KEYWORDS = ["hola", "buenas", "buenos dias", "buenas tardes"];

const normalizeText = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const containsAny = (message, keywords) => {
  const normalized = normalizeText(message);
  return keywords.some((keyword) => normalized.includes(normalizeText(keyword)));
};

const buildSystemInstruction = ({ role, userName, userEmail, locationPath, firebaseContext }) => {
  const baseRules = [
    "Eres el chatbot interno de Tsinghe Cocina Fusion.",
    "Responde siempre en espanol claro, breve y util.",
    "Solo puedes responder temas del restaurante: carta, platos, alergenos, reservas, mesas, ofertas, usuarios o navegacion por la web.",
    "Si el usuario pregunta algo externo, responde que solo ayudas con temas de Tsinghe.",
    "No inventes datos concretos si no estan en el contexto.",
    "No reveles ni solicites secretos, claves API, tokens ni informacion sensible.",
    "No respondas preguntas de clima, politica, noticias, deporte, programacion general u otros temas externos.",
    "No realices acciones de escritura: no creas, modifica ni cancela reservas; solo informa y guia.",
    `Usuario actual: ${userName || "sin nombre"} (${userEmail || "sin email"}).`,
    `Ruta actual: ${locationPath || "/"}.`,
    "Usa exclusivamente el contexto de Firebase proporcionado para datos concretos.",
    "Si el contexto no contiene la informacion solicitada, dilo con honestidad y guia al usuario a la seccion correcta.",
    `Contexto Firebase disponible:\n${firebaseContext || "Sin contexto especifico disponible."}`,
  ];

  if (role === "admin") {
    return [
      ...baseRules,
      "Rol: administrador.",
      "Puede recibir orientacion sobre consultas internas, reservas, mesas, usuarios y datos operativos.",
      "Aun siendo admin, no reveles claves, tokens ni configuracion sensible.",
      "Si faltan datos reales, indica que necesitas conectarte a la base de datos o consultar la pantalla correspondiente.",
    ].join("\n");
  }

  return [
    ...baseRules,
    "Rol: comensal.",
    "Puede recibir ayuda sobre carta, alergenos, reservas, ofertas y navegacion.",
    "No respondas consultas internas de base de datos, usuarios, reservas globales o mesas libres internas.",
    "Nunca reveles reservas de otros usuarios ni informacion operativa interna.",
  ].join("\n");
};

const extractGeminiText = (data) => {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((part) => part.text).filter(Boolean).join("\n").trim();
  return text || "No he podido generar una respuesta clara ahora mismo.";
};

class ChatbotService {
  getApiKey() {
    return process.env.REACT_APP_GEMINI_API_KEY || "";
  }

  validateMessage(message, role) {
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      return {
        allowed: false,
        reason: "Escribe una pregunta sobre el restaurante para ayudarte.",
      };
    }

    if (containsAny(cleanMessage, GREETING_KEYWORDS)) {
      return {
        allowed: false,
        reason:
          role === "admin"
            ? "Hola. Puedo ayudarte con carta, reservas, mesas, usuarios y consultas internas del restaurante."
            : "Hola. Puedo ayudarte con la carta, alergenos, reservas, ofertas y navegacion por la web.",
      };
    }

    if (containsAny(cleanMessage, EXTERNAL_KEYWORDS)) {
      return {
        allowed: false,
        reason:
          "Solo puedo responder preguntas relacionadas con Tsinghe, su carta, reservas, mesas, ofertas y alergenos.",
      };
    }

    if (role !== "admin" && containsAny(cleanMessage, ADMIN_KEYWORDS)) {
      return {
        allowed: false,
        reason:
          "Esa consulta contiene informacion interna. Desde un perfil de comensal puedo ayudarte con carta, reservas, ofertas y alergenos.",
      };
    }

    if (!containsAny(cleanMessage, RESTAURANT_KEYWORDS)) {
      return {
        allowed: false,
        reason:
          "Puedo ayudarte con temas del restaurante: carta, platos, reservas, mesas, ofertas, alergenos o navegacion dentro de la web.",
      };
    }

    return { allowed: true };
  }

  buildHistory(messages) {
    return messages
      .filter((message) => message.id !== "welcome")
      .slice(-8)
      .map((message) => ({
        role: message.sender === "user" ? "user" : "model",
        parts: [{ text: message.text }],
      }));
  }

  async sendMessage({
    message,
    user,
    role,
    userName,
    locationPath,
    history = [],
  }) {
    const validation = this.validateMessage(message, role);
    if (!validation.allowed) {
      return { success: true, answer: validation.reason, blocked: true };
    }

    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("Falta configurar REACT_APP_GEMINI_API_KEY.");
    }

    const firebaseContext = await chatbotContextService.buildContext({
      message,
      role,
      user,
    });

    const response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: buildSystemInstruction({
                role,
                userName,
                userEmail: user?.email,
                locationPath,
                firebaseContext,
              }),
            },
          ],
        },
        contents: [
          ...this.buildHistory(history),
          {
            role: "user",
            parts: [{ text: message.trim() }],
          },
        ],
        generationConfig: {
          temperature: 0.35,
          topP: 0.9,
          maxOutputTokens: 420,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message = errorBody?.error?.message || "Gemini no respondio correctamente.";

      if (message.toLowerCase().includes("leaked")) {
        throw new Error(
          "La API key de Gemini fue marcada como filtrada. Revocala y crea una nueva.",
        );
      }

      if (response.status === 403) {
        throw new Error(
          "Gemini rechazo la API key. Revisa permisos, restricciones o crea una key nueva.",
        );
      }

      throw new Error(message);
    }

    const data = await response.json();
    return {
      success: true,
      answer: extractGeminiText(data),
      raw: data,
    };
  }
}

const chatbotService = new ChatbotService();
export default chatbotService;
