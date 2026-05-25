import menuService from "../models/MenuService";
import offerService from "./OfferService";
import reservationService from "./ReservationService";
import tableService from "./TableService";
import tableAvailabilityService from "./TableAvailabilityService";
import reservationTableService from "./ReservationTableService";

const SUPPORT_PHONE =
  process.env.REACT_APP_RESTAURANT_SUPPORT_PHONE || "+34 600 123 456";

const normalizeText = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const tokenize = (value = "") =>
  normalizeText(value)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const levenshteinDistance = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = Array.from({ length: b.length + 1 }, (_, row) => [row]);
  for (let column = 0; column <= a.length; column++) {
    matrix[0][column] = column;
  }

  for (let row = 1; row <= b.length; row++) {
    for (let column = 1; column <= a.length; column++) {
      const cost = b[row - 1] === a[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost,
      );
    }
  }

  return matrix[b.length][a.length];
};

const isSimilarWord = (word, target) => {
  const normalizedWord = normalizeText(word);
  const normalizedTarget = normalizeText(target);

  if (normalizedWord === normalizedTarget) return true;
  if (normalizedWord.includes(normalizedTarget) || normalizedTarget.includes(normalizedWord)) {
    return Math.min(normalizedWord.length, normalizedTarget.length) >= 4;
  }

  const compactWord = normalizedWord.replace(/[aeiou]/g, "");
  const compactTarget = normalizedTarget.replace(/[aeiou]/g, "");
  if (
    compactTarget.length >= 3 &&
    (compactWord.includes(compactTarget) || compactTarget.includes(compactWord))
  ) {
    return true;
  }

  const distance = levenshteinDistance(normalizedWord, normalizedTarget);
  const maxLength = Math.max(normalizedWord.length, normalizedTarget.length);
  const allowedDistance = maxLength <= 5 ? 1 : 2;
  return distance <= allowedDistance;
};

const fuzzyIncludes = (message, words) => {
  const normalized = normalizeText(message);
  const messageTokens = tokenize(message);

  return words.some((word) => {
    const normalizedWord = normalizeText(word);
    if (normalized.includes(normalizedWord)) return true;

    const targetTokens = tokenize(word);
    return targetTokens.every((targetToken) =>
      messageTokens.some((messageToken) => isSimilarWord(messageToken, targetToken)),
    );
  });
};

const normalizeRole = (role) => {
  const normalized = normalizeText(role || "");
  if (["admin", "administrador", "administrator"].includes(normalized)) {
    return "admin";
  }
  return "comensal";
};

const todayString = () => new Date().toISOString().split("T")[0];

const MONTHS = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  setiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

const formatDate = (date) => date.toISOString().split("T")[0];

const addDays = (date, days) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const getHistoryMessages = (history = []) =>
  history
    .filter((item) => item.sender === "user")
    .map((item) => item.text || "")
    .filter(Boolean);

const getExplicitRequestedDate = (message = "", fallbackDate = new Date()) => {
  const normalized = normalizeText(message);

  if (fuzzyIncludes(normalized, ["pasado manana"])) {
    return formatDate(addDays(new Date(), 2));
  }

  if (fuzzyIncludes(normalized, ["manana"])) {
    return formatDate(addDays(new Date(), 1));
  }

  if (fuzzyIncludes(normalized, ["hoy"])) {
    return todayString();
  }

  const isoMatch = normalized.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const numericMatch = normalized.match(/\b(\d{1,2})[-/](\d{1,2})(?:[-/](20\d{2}))?\b/);
  if (numericMatch) {
    const [, day, month, year] = numericMatch;
    return `${year || fallbackDate.getFullYear()}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const spanishDateMatch = normalized.match(
    /\b(\d{1,2})\s*(?:de)?\s*(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?:\s*(?:de)?\s*(20\d{2}))?\b/,
  );
  if (spanishDateMatch) {
    const [, day, monthName, year] = spanishDateMatch;
    return `${year || fallbackDate.getFullYear()}-${String(MONTHS[monthName] + 1).padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const dayOnlyMatch = normalized.match(/\b(?:el|dia|para|del|al)?\s*(\d{1,2})\b/);
  if (dayOnlyMatch) {
    const day = Number(dayOnlyMatch[1]);
    if (day >= 1 && day <= 31) {
      return `${fallbackDate.getFullYear()}-${String(fallbackDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  return null;
};

const getRequestedDate = (message = "", history = []) => {
  const historyMessages = getHistoryMessages(history);
  const reversedHistory = [...historyMessages].reverse();
  const now = new Date();

  let fallbackDate = now;
  for (const previousMessage of reversedHistory) {
    const previousDate = getExplicitRequestedDate(previousMessage, fallbackDate);
    if (previousDate) {
      fallbackDate = new Date(`${previousDate}T12:00:00`);
      break;
    }
  }

  const requestedDate = getExplicitRequestedDate(message, fallbackDate);
  if (requestedDate) return requestedDate;

  return todayString();
};

const getRequestedPeriod = (message = "", history = []) => {
  const normalized = normalizeText(message);
  const historyMessages = getHistoryMessages(history);
  const combined = `${historyMessages.slice(-2).join(" ")} ${normalized}`;
  const now = new Date();

  if (fuzzyIncludes(combined, ["este mes", "mes actual"])) {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      type: "month",
      label: "este mes",
      from: formatDate(start),
      to: formatDate(end),
    };
  }

  if (fuzzyIncludes(combined, ["esta semana", "semana actual"])) {
    const day = now.getDay() || 7;
    const start = addDays(now, 1 - day);
    const end = addDays(start, 6);
    return {
      type: "week",
      label: "esta semana",
      from: formatDate(start),
      to: formatDate(end),
    };
  }

  const date = getRequestedDate(message, history);
  return {
    type: "day",
    label: date === todayString() ? "hoy" : date,
    from: date,
    to: date,
  };
};

const getRequestedShift = (message = "", history = []) => {
  const historyMessages = getHistoryMessages(history);
  const combined = normalizeText(`${historyMessages.slice(-2).join(" ")} ${message}`);

  if (fuzzyIncludes(combined, ["cena", "noche"])) return "cena";
  if (fuzzyIncludes(combined, ["comida", "almuerzo", "medio dia", "mediodia"])) return "comida";
  return null;
};

const filterReservationsByShift = (reservations = [], shift) => {
  if (!shift) return reservations;
  return reservations.filter((reservation) => {
    const reservationShift = reservation.shift;
    if (reservationShift) return reservationShift === shift;
    const time = reservation.time || reservation.reservationTime || "";
    const hour = Number(time.split(":")[0]);
    if (!Number.isFinite(hour)) return false;
    return shift === "cena" ? hour >= 18 : hour < 18;
  });
};

const compactList = (items, formatter, limit = 8) => {
  if (!Array.isArray(items) || items.length === 0) return "Ninguno.";
  const visibleItems = items.slice(0, limit).map(formatter);
  const remaining = items.length - visibleItems.length;
  return `${visibleItems.join("\n")}${remaining > 0 ? `\n...y ${remaining} mas.` : ""}`;
};

class ChatbotContextService {
  getLastUserIntent(history = []) {
    const lastUserMessages = history
      .filter((item) => item.sender === "user")
      .slice(-3)
      .map((item) => normalizeText(item.text || ""))
      .reverse();

    for (const previousMessage of lastUserMessages) {
      if (fuzzyIncludes(previousMessage, ["reserva", "reservas", "reseva", "resevas"])) {
        return "reservations";
      }
      if (fuzzyIncludes(previousMessage, ["mesa", "mesas", "libre", "libres", "disponible"])) {
        return "tables";
      }
      if (fuzzyIncludes(previousMessage, ["oferta", "ofertas", "descuento"])) {
        return "offers";
      }
      if (
        fuzzyIncludes(previousMessage, [
          "menu",
          "carta",
          "plato",
          "platos",
          "postre",
          "postres",
          "bebida",
          "bebidas",
          "alergeno",
          "alergenos",
        ])
      ) {
        return "menu";
      }
    }

    return null;
  }

  async buildContext({ message, role, user, history = [] }) {
    const tasks = [];
    const cleanMessage = normalizeText(message);
    const effectiveRole = normalizeRole(role);
    const isAdmin = effectiveRole === "admin";
    const lastIntent = this.getLastUserIntent(history);

    if (
      fuzzyIncludes(cleanMessage, [
        "menu",
        "carta",
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
        "alergeno",
        "alergenos",
        "recomienda",
        "recomendacion",
      ]) ||
      lastIntent === "menu"
    ) {
      tasks.push(this.getMenuContext());
    }

    if (fuzzyIncludes(cleanMessage, ["oferta", "ofertas", "descuento"]) || lastIntent === "offers") {
      tasks.push(this.getOffersContext());
    }

    if (
      fuzzyIncludes(cleanMessage, ["reserva", "reservas", "reseva", "resevas"]) ||
      lastIntent === "reservations"
    ) {
      tasks.push(
        isAdmin
          ? this.getAdminReservationsContext(cleanMessage, history)
          : this.getComensalReservationsContext(user?.uid, cleanMessage, history),
      );
    }

    if (
      isAdmin &&
      (fuzzyIncludes(cleanMessage, ["mesa", "mesas", "libre", "libres", "disponible"]) ||
        lastIntent === "tables")
    ) {
      tasks.push(this.getAdminTablesContext(cleanMessage, history));
    }

    if (!tasks.length) {
      tasks.push(this.getBasicNavigationContext(effectiveRole));
    }

    const results = await Promise.allSettled(tasks);
    return results
      .map((result) =>
        result.status === "fulfilled"
          ? result.value
          : `No se pudo recuperar parte de la información. Si el problema persiste, contacta con soporte del restaurante: ${SUPPORT_PHONE}.`,
      )
      .filter(Boolean)
      .join("\n\n");
  }

  async getMenuContext() {
    const [platesResult, categoriesResult, allergensResult] = await Promise.all([
      menuService.getAllPlates(),
      menuService.getAllCategories(),
      menuService.getAllAllergens(),
    ]);

    if (!platesResult.success) return "Carta: no se pudo consultar ahora mismo.";

    const categories = categoriesResult.success ? categoriesResult.data : [];
    const allergens = allergensResult.success ? allergensResult.data : {};
    const availablePlates = platesResult.data.filter((plate) => plate.disponible !== false);

    return [
      "CONTEXTO CARTA:",
      `Categorías: ${categories.map((category) => category.nombre).join(", ") || "Sin categorías."}`,
      "Platos disponibles destacados:",
      compactList(
        availablePlates,
        (plate) => {
          const allergenNames =
            plate.alergenos
              ?.map((id) => allergens[id]?.nombre)
              .filter(Boolean)
              .join(", ") || "sin alérgenos indicados";
          return `- ${plate.nombre}: ${plate.descripcion || "Sin descripción"} (${plate.precio || "sin precio"} EUR). Alérgenos: ${allergenNames}`;
        },
        12,
      ),
    ].join("\n");
  }

  async getOffersContext() {
    const result = await offerService.getActiveOffers();
    if (!result.success) return "Ofertas: no se pudieron consultar ahora mismo.";

    return [
      "CONTEXTO OFERTAS ACTIVAS:",
      compactList(
        result.offers,
        (offer) =>
          `- ${offer.title || offer.name || "Oferta"}: ${offer.description || "Sin descripción"}${offer.discount ? ` (${offer.discount}% descuento)` : ""}`,
        10,
      ),
    ].join("\n");
  }

  filterReservationsByPeriod(reservations = [], period) {
    return reservations.filter((reservation) => {
      const reservationDate = reservation.reservationDate || reservation.date || "";
      return reservationDate >= period.from && reservationDate <= period.to;
    });
  }

  async getComensalReservationsContext(userId, message = "", history = []) {
    if (!userId) return "Reservas del comensal: usuario no identificado.";
    const result = await reservationService.getUserReservations(userId);
    if (!result.success) return "Reservas del comensal: no se pudieron consultar.";
    const period = getRequestedPeriod(message, history);
    const reservations = this.filterReservationsByPeriod(result.reservations, period);

    return [
      `CONTEXTO RESERVAS PROPIAS DEL COMENSAL (${period.label}: ${period.from} a ${period.to}):`,
      `Total reservas propias: ${reservations.length}.`,
      compactList(
        reservations,
        (reservation) =>
          `- ${reservation.reservationDate || reservation.date || "sin fecha"} ${reservation.reservationTime || reservation.time || ""}: ${reservation.numberOfPeople || reservation.peopleCount || "?"} personas, estado ${reservation.status || "sin estado"}.`,
        8,
      ),
    ].join("\n");
  }

  async getAdminReservationsContext(message = "", history = []) {
    const period = getRequestedPeriod(message, history);
    const shift = getRequestedShift(message, history);
    const result =
      period.type === "day"
        ? await reservationTableService.getReservationsByDate(period.from, true)
        : await reservationTableService.getReservationsByDateRange(period.from, period.to, true);
    if (!result.success) return "Reservas admin: no se pudieron consultar.";
    const reservations = filterReservationsByShift(result.reservations, shift);

    return [
      `CONTEXTO ADMIN RESERVAS (${period.label}: ${period.from} a ${period.to}${shift ? `, turno ${shift}` : ""}):`,
      `Total reservas: ${reservations.length}.`,
      compactList(
        reservations,
        (reservation) =>
          `- ${reservation.time || reservation.reservationTime || ""}: ${reservation.userName || "Sin nombre"}, ${reservation.peopleCount || reservation.numberOfPeople || "?"} personas, estado ${reservation.status || "sin estado"}, mesas ${(reservation.tableIds || []).join(", ") || reservation.tableId || "sin asignar"}.`,
        12,
      ),
    ].join("\n");
  }

  async getAdminTablesContext(message = "", history = []) {
    const requestedDate = getRequestedDate(message, history);
    const currentHour = new Date().getHours();
    const shift = currentHour >= 18 ? "cena" : "comida";
    const [statsResult, statusResult] = await Promise.all([
      tableService.getTableStats(),
      tableAvailabilityService.getTableStatusByDateAndShift(requestedDate, shift),
    ]);

    if (!statsResult.success && !statusResult.success) {
      return "Mesas admin: no se pudieron consultar.";
    }

    const stats = statsResult.stats;
    const tables = statusResult.tables;

    return [
      `CONTEXTO ADMIN MESAS (${requestedDate}, turno ${shift}):`,
      stats ? `Resumen: ${stats.total} mesas, ${stats.active} activas, ${stats.inactive} inactivas.` : "",
      tables
        ? `Libres: ${tables.active.length}. Ocupadas: ${tables.reserved.length}. Inactivas: ${tables.inactive.length}.`
        : "",
      tables
        ? `Mesas libres: ${tables.active.map((table) => table.number || table.tableNumber || table.id).join(", ") || "ninguna"}.`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  getBasicNavigationContext(role) {
    return [
      "CONTEXTO NAVEGACIÓN:",
      "- /menu muestra la carta pública con platos y alérgenos.",
      "- /dashboard?section=reservas permite gestionar reservas del comensal.",
      "- /dashboard?section=preview-menu permite ver carta desde el panel.",
      role === "admin"
        ? "- Admin: /dashboard permite acceder a menú, mesas, ofertas y reservas internas."
        : "- Comensal: puede consultar sus reservas y crear nuevas desde su panel.",
    ].join("\n");
  }

  async buildLocalAnswer({ message, role, user, history = [] }) {
    const cleanMessage = normalizeText(message);
    const isAdmin = normalizeRole(role) === "admin";
    const lastIntent = this.getLastUserIntent(history);

    if (fuzzyIncludes(cleanMessage, ["oferta", "ofertas", "descuento"]) || lastIntent === "offers") {
      return this.answerOffers();
    }

    if (
      fuzzyIncludes(cleanMessage, ["reserva", "reservas", "reseva", "resevas"]) ||
      lastIntent === "reservations"
    ) {
      return isAdmin
        ? this.answerAdminReservations(cleanMessage, history)
        : this.answerComensalReservations(user?.uid, cleanMessage, history);
    }

    if (fuzzyIncludes(cleanMessage, ["mesa", "mesas", "libre", "libres", "disponible"]) || lastIntent === "tables") {
      return isAdmin
        ? this.answerAdminTables(cleanMessage, history)
        : "Para consultar disponibilidad concreta, entra en tu panel y crea una reserva indicando fecha, hora y numero de personas.";
    }

    if (
      fuzzyIncludes(cleanMessage, [
        "menu",
        "carta",
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
        "alergeno",
        "alergenos",
        "recomienda",
      ]) ||
      lastIntent === "menu"
    ) {
      return this.answerMenu(cleanMessage);
    }

    return "Puedo ayudarte con carta, platos, alérgenos, reservas, mesas, ofertas y navegación del restaurante.";
  }

  async answerOffers() {
    const result = await offerService.getActiveOffers();
    if (!result.success) return "No pude consultar las ofertas activas ahora mismo.";
    if (!result.offers.length) return "Ahora mismo no hay ofertas activas registradas.";

    return [
      "Ofertas activas:",
      compactList(
        result.offers,
        (offer) =>
          `- ${offer.title || offer.name || "Oferta"}: ${offer.description || "Sin descripcion"}${offer.discount ? ` (${offer.discount}% descuento)` : ""}`,
        8,
      ),
    ].join("\n");
  }

  async answerComensalReservations(userId, message = "", history = []) {
    if (!userId) return "No pude identificar tu usuario para consultar tus reservas.";
    const result = await reservationService.getUserReservations(userId);
    if (!result.success) return "No pude consultar tus reservas ahora mismo.";
    const period = getRequestedPeriod(message, history);
    const reservations = this.filterReservationsByPeriod(result.reservations, period);
    if (!reservations.length) {
      return `No tienes reservas propias registradas para ${period.label} (${period.from}${period.from !== period.to ? ` a ${period.to}` : ""}).`;
    }

    return [
      `Tus reservas para ${period.label} (${period.from}${period.from !== period.to ? ` a ${period.to}` : ""}):`,
      compactList(
        reservations,
        (reservation) =>
          `- ${reservation.reservationDate || reservation.date || "sin fecha"} ${reservation.reservationTime || reservation.time || ""}: ${reservation.numberOfPeople || reservation.peopleCount || "?"} personas, estado ${reservation.status || "sin estado"}.`,
        8,
      ),
    ].join("\n");
  }

  async answerAdminReservations(message = "", history = []) {
    const period = getRequestedPeriod(message, history);
    const shift = getRequestedShift(message, history);
    const result =
      period.type === "day"
        ? await reservationTableService.getReservationsByDate(period.from, true)
        : await reservationTableService.getReservationsByDateRange(period.from, period.to, true);
    if (!result.success) return `No pude consultar las reservas para ${period.label}.`;
    const reservations = filterReservationsByShift(result.reservations, shift);
    if (!reservations.length) {
      return `No hay reservas${shift ? ` de ${shift}` : ""} registradas para ${period.label} (${period.from}${period.from !== period.to ? ` a ${period.to}` : ""}).`;
    }

    return [
      `Reservas${shift ? ` de ${shift}` : ""} para ${period.label} (${period.from}${period.from !== period.to ? ` a ${period.to}` : ""}): ${reservations.length}.`,
      compactList(
        reservations,
        (reservation) =>
          `- ${reservation.time || reservation.reservationTime || ""}: ${reservation.userName || "Sin nombre"}, ${reservation.peopleCount || reservation.numberOfPeople || "?"} personas, estado ${reservation.status || "sin estado"}, mesas ${(reservation.tableIds || []).join(", ") || reservation.tableId || "sin asignar"}.`,
        12,
      ),
    ].join("\n");
  }

  async answerAdminTables(message = "", history = []) {
    const requestedDate = getRequestedDate(message, history);
    const currentHour = new Date().getHours();
    const shift = currentHour >= 18 ? "cena" : "comida";
    const result = await tableAvailabilityService.getTableStatusByDateAndShift(requestedDate, shift);
    if (!result.success) return "No pude consultar la disponibilidad de mesas.";

    return [
      `Mesas para ${requestedDate}, turno ${shift}:`,
      `Libres: ${result.tables.active.length}. Ocupadas: ${result.tables.reserved.length}. Inactivas: ${result.tables.inactive.length}.`,
      `Mesas libres: ${result.tables.active.map((table) => table.number || table.tableNumber || table.id).join(", ") || "ninguna"}.`,
    ].join("\n");
  }

  async answerMenu(cleanMessage = "") {
    const [platesResult, allergensResult, categoriesResult] = await Promise.all([
      menuService.getAllPlates(),
      menuService.getAllAllergens(),
      menuService.getAllCategories(),
    ]);
    if (!platesResult.success) return "No pude consultar la carta ahora mismo.";

    const allergens = allergensResult.success ? allergensResult.data : {};
    const categories = categoriesResult.success ? categoriesResult.data : [];
    const categoryById = new Map(categories.map((category) => [category.id, category]));
    const menuTerms = [
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
    ];
    const requestedTerms = menuTerms.filter((term) => cleanMessage.includes(term));

    let availablePlates = platesResult.data.filter((plate) => plate.disponible !== false);
    if (requestedTerms.length) {
      availablePlates = availablePlates.filter((plate) => {
        const category = categoryById.get(plate.idCategoria);
        const searchable = normalizeText(
          `${plate.nombre || ""} ${plate.descripcion || ""} ${category?.nombre || ""}`,
        );
        return requestedTerms.some((term) => searchable.includes(normalizeText(term)));
      });
    }

    if (!availablePlates.length && requestedTerms.length) {
      return `No encontre ${requestedTerms.join(", ")} disponibles en la carta ahora mismo. Puedes revisar la carta completa en /menu o consultar con el restaurante.`;
    }
    if (!availablePlates.length) return "No hay platos disponibles registrados ahora mismo.";

    return [
      requestedTerms.length ? "Encontré estos resultados en carta:" : "Algunos platos disponibles:",
      compactList(
        availablePlates,
        (plate) => {
          const allergenNames =
            plate.alergenos
              ?.map((id) => allergens[id]?.nombre)
              .filter(Boolean)
              .join(", ") || "sin alergenos indicados";
          return `- ${plate.nombre}: ${plate.precio || "sin precio"} EUR. Alergenos: ${allergenNames}.`;
        },
        10,
      ),
    ].join("\n");
  }
}

const chatbotContextService = new ChatbotContextService();
export default chatbotContextService;
