import menuService from "../models/MenuService";
import offerService from "./OfferService";
import reservationService from "./ReservationService";
import tableService from "./TableService";
import tableAvailabilityService from "./TableAvailabilityService";
import reservationTableService from "./ReservationTableService";

const normalizeText = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const includesAny = (message, words) => {
  const normalized = normalizeText(message);
  return words.some((word) => normalized.includes(normalizeText(word)));
};

const normalizeRole = (role) => {
  const normalized = normalizeText(role || "");
  if (["admin", "administrador", "administrator"].includes(normalized)) {
    return "admin";
  }
  return "comensal";
};

const todayString = () => new Date().toISOString().split("T")[0];

const compactList = (items, formatter, limit = 8) => {
  if (!Array.isArray(items) || items.length === 0) return "Ninguno.";
  const visibleItems = items.slice(0, limit).map(formatter);
  const remaining = items.length - visibleItems.length;
  return `${visibleItems.join("\n")}${remaining > 0 ? `\n...y ${remaining} mas.` : ""}`;
};

class ChatbotContextService {
  async buildContext({ message, role, user }) {
    const tasks = [];
    const cleanMessage = normalizeText(message);
    const effectiveRole = normalizeRole(role);
    const isAdmin = effectiveRole === "admin";

    if (
      includesAny(cleanMessage, [
        "menu",
        "carta",
        "plato",
        "platos",
        "alergeno",
        "alergenos",
        "recomienda",
        "recomendacion",
      ])
    ) {
      tasks.push(this.getMenuContext());
    }

    if (includesAny(cleanMessage, ["oferta", "ofertas", "descuento"])) {
      tasks.push(this.getOffersContext());
    }

    if (includesAny(cleanMessage, ["reserva", "reservas", "reseva", "resevas"])) {
      tasks.push(
        isAdmin
          ? this.getAdminReservationsContext()
          : this.getComensalReservationsContext(user?.uid),
      );
    }

    if (isAdmin && includesAny(cleanMessage, ["mesa", "mesas", "libre", "libres", "disponible"])) {
      tasks.push(this.getAdminTablesContext());
    }

    if (!tasks.length) {
      tasks.push(this.getBasicNavigationContext(effectiveRole));
    }

    const results = await Promise.allSettled(tasks);
    return results
      .map((result) =>
        result.status === "fulfilled"
          ? result.value
          : `Error recuperando contexto: ${result.reason?.message || "desconocido"}`,
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
      `Categorias: ${categories.map((category) => category.nombre).join(", ") || "Sin categorias."}`,
      "Platos disponibles destacados:",
      compactList(
        availablePlates,
        (plate) => {
          const allergenNames =
            plate.alergenos
              ?.map((id) => allergens[id]?.nombre)
              .filter(Boolean)
              .join(", ") || "sin alergenos indicados";
          return `- ${plate.nombre}: ${plate.descripcion || "Sin descripcion"} (${plate.precio || "sin precio"} EUR). Alergenos: ${allergenNames}`;
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
          `- ${offer.title || offer.name || "Oferta"}: ${offer.description || "Sin descripcion"}${offer.discount ? ` (${offer.discount}% descuento)` : ""}`,
        10,
      ),
    ].join("\n");
  }

  async getComensalReservationsContext(userId) {
    if (!userId) return "Reservas del comensal: usuario no identificado.";
    const result = await reservationService.getUserReservations(userId);
    if (!result.success) return "Reservas del comensal: no se pudieron consultar.";

    return [
      "CONTEXTO RESERVAS DEL COMENSAL:",
      compactList(
        result.reservations,
        (reservation) =>
          `- ${reservation.reservationDate || reservation.date || "sin fecha"} ${reservation.reservationTime || reservation.time || ""}: ${reservation.numberOfPeople || reservation.peopleCount || "?"} personas, estado ${reservation.status || "sin estado"}.`,
        8,
      ),
    ].join("\n");
  }

  async getAdminReservationsContext() {
    const today = todayString();
    const result = await reservationTableService.getReservationsByDate(today, true);
    if (!result.success) return "Reservas admin: no se pudieron consultar.";

    return [
      `CONTEXTO ADMIN RESERVAS DE HOY (${today}):`,
      `Total reservas de hoy: ${result.reservations.length}.`,
      compactList(
        result.reservations,
        (reservation) =>
          `- ${reservation.time || reservation.reservationTime || ""}: ${reservation.userName || "Sin nombre"}, ${reservation.peopleCount || reservation.numberOfPeople || "?"} personas, estado ${reservation.status || "sin estado"}, mesas ${(reservation.tableIds || []).join(", ") || reservation.tableId || "sin asignar"}.`,
        12,
      ),
    ].join("\n");
  }

  async getAdminTablesContext() {
    const today = todayString();
    const currentHour = new Date().getHours();
    const shift = currentHour >= 18 ? "cena" : "comida";
    const [statsResult, statusResult] = await Promise.all([
      tableService.getTableStats(),
      tableAvailabilityService.getTableStatusByDateAndShift(today, shift),
    ]);

    if (!statsResult.success && !statusResult.success) {
      return "Mesas admin: no se pudieron consultar.";
    }

    const stats = statsResult.stats;
    const tables = statusResult.tables;

    return [
      `CONTEXTO ADMIN MESAS (${today}, turno ${shift}):`,
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
      "CONTEXTO NAVEGACION:",
      "- /menu muestra la carta publica con platos y alergenos.",
      "- /dashboard?section=reservas permite gestionar reservas del comensal.",
      "- /dashboard?section=preview-menu permite ver carta desde el panel.",
      role === "admin"
        ? "- Admin: /dashboard permite acceder a menu, mesas, ofertas y reservas internas."
        : "- Comensal: puede consultar sus reservas y crear nuevas desde su panel.",
    ].join("\n");
  }
}

const chatbotContextService = new ChatbotContextService();
export default chatbotContextService;
