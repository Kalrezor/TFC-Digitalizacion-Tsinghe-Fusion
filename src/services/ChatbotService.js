import chatbotContextService from "./ChatbotContextService";

const SUPPORT_PHONE =
  process.env.REACT_APP_RESTAURANT_SUPPORT_PHONE || "+34 600 123 456";

const DEFAULT_GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
];

const getConfiguredModels = () => {
  const configured = process.env.REACT_APP_GEMINI_MODEL || "";
  const models = configured
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  return Array.from(new Set([...models, ...DEFAULT_GEMINI_MODELS]));
};

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
  "postre",
  "postres",
  "bebida",
  "bebidas",
  "entrante",
  "entrantes",
  "arroz",
  "arroces",
  "sopa",
  "sopas",
  "ensalada",
  "ensaladas",
  "fideo",
  "fideos",
  "tallarines",
  "pato",
  "pollo",
  "ternera",
  "cerdo",
  "marisco",
  "mariscos",
  "vegano",
  "vegetariano",
  "precio",
  "precios",
  "reserva",
  "reservas",
  "reseva",
  "resevas",
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
const COURTESY_KEYWORDS = ["gracias", "muchas gracias", "ok", "vale", "perfecto", "genial"];

const UNCLEAR_MESSAGE = `No he entendido bien la consulta. Podrias hacer la pregunta nuevamente? Por ejemplo: "que reservas hay hoy?", "que ofertas hay?" o "que platos tienen alergenos?". Si necesitas ayuda directa, contacta con soporte del restaurante: ${SUPPORT_PHONE}.`;

const normalizeRole = (role) => {
  const normalized = normalizeText(role || "");
  if (["admin", "administrador", "administrator"].includes(normalized)) {
    return "admin";
  }
  return "comensal";
};

const normalizeText = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const containsAny = (message, keywords) => {
  const normalized = normalizeText(message);
  return keywords.some((keyword) => normalized.includes(normalizeText(keyword)));
};

const typoHint = (message) => {
  const normalized = normalizeText(message);
  const typoExamples = [
    ["resrva", "reserva"],
    ["resrvas", "reservas"],
    ["ofrta", "oferta"],
    ["ofrtas", "ofertas"],
    ["alrgeno", "alergeno"],
    ["alrgenos", "alergenos"],
    ["meza", "mesa"],
    ["mezas", "mesas"],
    ["postre", "postre"],
    ["postrez", "postres"],
  ];

  const fixedWords = typoExamples.reduce(
    (text, [wrong, right]) => text.replaceAll(wrong, right),
    normalized,
  );

  return fixedWords !== normalized ? `El usuario pudo querer decir: "${fixedWords}".` : "";
};

const buildSystemInstruction = ({ role, userName, userEmail, locationPath, firebaseContext }) => {
  const effectiveRole = normalizeRole(role);
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

  if (effectiveRole === "admin") {
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
    "Si el contexto contiene reservas propias del comensal, puedes mostrarlas al usuario.",
    "Si pregunta por reservas sin decir 'mis', interpreta que pregunta por sus propias reservas, nunca por reservas globales.",
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
    const effectiveRole = normalizeRole(role);

    if (!cleanMessage) {
      return {
        allowed: false,
        reason: UNCLEAR_MESSAGE,
      };
    }

    if (cleanMessage.length <= 2) {
      return {
        allowed: false,
        reason: UNCLEAR_MESSAGE,
      };
    }

    if (containsAny(cleanMessage, GREETING_KEYWORDS)) {
      return {
        allowed: false,
        reason:
          effectiveRole === "admin"
            ? "Hola. Puedo ayudarte con carta, reservas, mesas, usuarios y consultas internas del restaurante."
            : "Hola. Puedo ayudarte con la carta, alergenos, reservas, ofertas y navegacion por la web.",
      };
    }

    if (containsAny(cleanMessage, COURTESY_KEYWORDS)) {
      return {
        allowed: false,
        reason:
          "Con gusto. Si necesitas algo mas, puedo ayudarte con carta, postres, alergenos, reservas, mesas u ofertas del restaurante.",
      };
    }

    if (containsAny(cleanMessage, EXTERNAL_KEYWORDS)) {
      return {
        allowed: false,
        reason:
          "Solo puedo responder preguntas relacionadas con Tsinghe, su carta, reservas, mesas, ofertas y alergenos.",
      };
    }

    if (effectiveRole !== "admin" && containsAny(cleanMessage, ADMIN_KEYWORDS)) {
      return {
        allowed: false,
        reason:
          "Esa consulta contiene informacion interna. Desde un perfil de comensal puedo ayudarte con carta, reservas, ofertas y alergenos.",
      };
    }

    if (!containsAny(cleanMessage, RESTAURANT_KEYWORDS)) {
      return { allowed: true };
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

  getGeminiEndpoint(model) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  }

  isHighDemandError(error) {
    const message = (error?.message || "").toLowerCase();
    return (
      message.includes("high demand") ||
      message.includes("overloaded") ||
      message.includes("unavailable") ||
      message.includes("try again later") ||
      error?.status === 429 ||
      error?.status === 503
    );
  }

  async callGemini({ model, apiKey, payload }) {
    const response = await fetch(this.getGeminiEndpoint(model), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message = errorBody?.error?.message || "Gemini no respondio correctamente.";
      const error = new Error(message);
      error.status = response.status;
      error.model = model;
      throw error;
    }

    return response.json();
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
      role: normalizeRole(role),
      user,
      history,
    });

    const payload = {
      systemInstruction: {
        parts: [
          {
            text: buildSystemInstruction({
              role,
              userName,
              userEmail: user?.email,
              locationPath,
              firebaseContext: `${typoHint(message)}\n${firebaseContext}`.trim(),
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
    };

    let lastError = null;
    for (const model of getConfiguredModels()) {
      try {
        const data = await this.callGemini({ model, apiKey, payload });
        return {
          success: true,
          answer: extractGeminiText(data),
          model,
          raw: data,
        };
      } catch (error) {
        lastError = error;
        if (error.message.toLowerCase().includes("leaked")) {
          throw new Error(
            `No puedo conectar con el asistente porque la API key fue bloqueada. Contacta con soporte del restaurante: ${SUPPORT_PHONE}.`,
          );
        }

        if (error.status === 403) {
          throw new Error(
            `Gemini rechazo la conexion del asistente. Contacta con soporte del restaurante: ${SUPPORT_PHONE}.`,
          );
        }

        if (!this.isHighDemandError(error)) {
          break;
        }
      }
    }

    const fallbackAnswer = await chatbotContextService.buildLocalAnswer({
      message,
      role: normalizeRole(role),
      user,
      history,
    });

    return {
      success: true,
      answer: `${fallbackAnswer}\n\nNota: Gemini esta temporalmente saturado, asi que respondi usando los datos locales de Firebase.`,
      fallback: true,
      error: lastError?.message,
    };
  }
}

const chatbotService = new ChatbotService();
export default chatbotService;
