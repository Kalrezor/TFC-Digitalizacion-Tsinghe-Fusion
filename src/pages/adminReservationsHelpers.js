// adminReservationsHelpers.js
// Utilidades puras para la vista de reservas de administración.

import { getShiftFromTime } from "../services/reservationConstants";

// Normaliza una reserva al formato usado por la vista admin.
// Nota: el valor por defecto de peopleCount es 1 (la vista admin siempre
// trabaja con al menos un comensal), distinto del normalizeReservation del
// servicio. No unificar sin revisar este detalle.
export const normalizeReservation = (reservation) => ({
  ...reservation,
  date: reservation.date || reservation.reservationDate || "",
  time: reservation.time || reservation.reservationTime || "",
  shift:
    reservation.shift ||
    getShiftFromTime(reservation.time || reservation.reservationTime || ""),
  peopleCount: reservation.peopleCount || reservation.numberOfPeople || 1,
  tableIds: Array.isArray(reservation.tableIds)
    ? reservation.tableIds
    : reservation.tableId
      ? [reservation.tableId]
      : [],
});
