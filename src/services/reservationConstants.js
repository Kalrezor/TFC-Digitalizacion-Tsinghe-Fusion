// reservationConstants.js
// Constantes y utilidades puras de reservas (turnos, horarios, estados y
// validaciones). Separadas del servicio para evitar un archivo monolítico.

export const RESERVATION_SHIFTS = {
  COMIDA: "comida",
  CENA: "cena",
};

export const RESERVATION_TIMES = {
  [RESERVATION_SHIFTS.COMIDA]: [
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ],
  [RESERVATION_SHIFTS.CENA]: [
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
    "22:30",
    "23:00",
    "23:30",
  ],
};

const ALL_RESERVATION_TIMES = [
  ...RESERVATION_TIMES[RESERVATION_SHIFTS.COMIDA],
  ...RESERVATION_TIMES[RESERVATION_SHIFTS.CENA],
];

export const RESERVATION_STATUS = {
  PENDING: "pendiente",
  CONFIRMED: "confirmada",
  CANCELED: "cancelada",
};

const parseTimeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

export const getShiftFromTime = (time) => {
  if (RESERVATION_TIMES[RESERVATION_SHIFTS.COMIDA].includes(time)) {
    return RESERVATION_SHIFTS.COMIDA;
  }
  if (RESERVATION_TIMES[RESERVATION_SHIFTS.CENA].includes(time)) {
    return RESERVATION_SHIFTS.CENA;
  }
  return null;
};

export const isValidReservationTime = (time) =>
  ALL_RESERVATION_TIMES.includes(time);

export const hasTimeConflict = (
  existingTime,
  requestedTime,
  marginMinutes = 120,
) => {
  if (!existingTime || !requestedTime) {
    return false;
  }
  const existingMinutes = parseTimeToMinutes(existingTime);
  const requestedMinutes = parseTimeToMinutes(requestedTime);
  return Math.abs(existingMinutes - requestedMinutes) <= marginMinutes;
};

export const normalizeReservation = (reservation = {}) => ({
  ...reservation,
  date: reservation.date || reservation.reservationDate || "",
  time: reservation.time || reservation.reservationTime || "",
  shift:
    reservation.shift ||
    getShiftFromTime(reservation.time || reservation.reservationTime || ""),
  peopleCount: reservation.peopleCount || reservation.numberOfPeople || 0,
  tableIds: Array.isArray(reservation.tableIds)
    ? reservation.tableIds
    : reservation.tableId
      ? [reservation.tableId]
      : [],
});
