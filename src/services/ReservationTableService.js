import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import TableService from "./TableService";

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

export const ALL_RESERVATION_TIMES = [
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

export const isValidReservationTime = (time) => ALL_RESERVATION_TIMES.includes(time);

export const hasTimeConflict = (existingTime, requestedTime, marginMinutes = 120) => {
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
  peopleCount:
    reservation.peopleCount || reservation.numberOfPeople || 0,
  tableIds: Array.isArray(reservation.tableIds)
    ? reservation.tableIds
    : reservation.tableId
    ? [reservation.tableId]
    : [],
});

const buildReservationPayload = ({
  userId,
  userEmail,
  userName,
  userPhone,
  date,
  time,
  shift,
  peopleCount,
  specialRequests,
  status,
  createdBy,
}) => ({
  userId: userId || null,
  userEmail: userEmail || "",
  userName: userName || "",
  userPhone: userPhone || "",
  date,
  reservationDate: date,
  time,
  reservationTime: time,
  shift,
  peopleCount,
  numberOfPeople: peopleCount,
  specialRequests: specialRequests || "",
  status,
  createdBy,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  tableIds: [],
});

class ReservationTableService {
  async getReservationsByDate(date, includeCanceled = false) {
    try {
      const filters = [where("reservationDate", "==", date)];
      if (!includeCanceled) {
        filters.push(where("status", "!=", RESERVATION_STATUS.CANCELED));
      }
      const querySnapshot = await getDocs(
        query(collection(db, "reservations"), ...filters),
      );

      const reservations = [];
      querySnapshot.forEach((doc) => {
        reservations.push({
          id: doc.id,
          ...normalizeReservation(doc.data()),
        });
      });

      return { success: true, reservations };
    } catch (error) {
      console.error("Error obteniendo reservas por fecha:", error);
      return { success: false, error: error.message };
    }
  }

  async getReservationsByDateAndShift(date, shift, includeCanceled = false) {
    if (!date) {
      return { success: false, error: "Fecha de reserva requerida" };
    }
    if (!Object.values(RESERVATION_SHIFTS).includes(shift)) {
      return { success: false, error: "Turno inválido" };
    }

    const result = await this.getReservationsByDate(date, includeCanceled);
    if (!result.success) {
      return result;
    }

    const reservations = result.reservations.filter(
      (reservation) => reservation.shift === shift,
    );

    return { success: true, reservations };
  }

  async createReservationFromComensal(user, date, time, peopleCount, specialRequests) {
    if (!user) {
      return { success: false, error: "Usuario no autenticado" };
    }
    if (!isValidReservationTime(time)) {
      return { success: false, error: "Hora de reserva no válida" };
    }
    const shift = getShiftFromTime(time);
    if (!shift) {
      return { success: false, error: "Turno de reserva no válido" };
    }
    if (!user.email) {
      return { success: false, error: "El usuario debe tener un email" };
    }
    if (!user.phone) {
      return { success: false, error: "El usuario debe tener teléfono registrado" };
    }

    try {
      const payload = buildReservationPayload({
        userId: user.uid || user.id,
        userEmail: user.email,
        userName: user.displayName || user.name || "",
        userPhone: user.phone,
        date,
        time,
        shift,
        peopleCount: Number(peopleCount) || 1,
        specialRequests,
        status: RESERVATION_STATUS.PENDING,
        createdBy: user.email,
      });

      const docRef = await addDoc(collection(db, "reservations"), payload);
      return { success: true, reservationId: docRef.id };
    } catch (error) {
      console.error("Error creando reserva de comensal:", error);
      return { success: false, error: error.message };
    }
  }

  async createReservationFromAdmin({
    user,
    manualName,
    manualPhone,
    date,
    time,
    peopleCount,
    specialRequests,
    adminEmail,
  }) {
    if (!isValidReservationTime(time)) {
      return { success: false, error: "Hora de reserva no válida" };
    }
    const shift = getShiftFromTime(time);
    if (!shift) {
      return { success: false, error: "Turno de reserva no válido" };
    }
    if (!adminEmail) {
      return { success: false, error: "Email del administrador requerido" };
    }

    const hasUser = user && (user.email || user.id);
    const userName = hasUser
      ? user.displayName || user.name || ""
      : manualName || "";
    const userPhone = hasUser ? user.phone || "" : manualPhone || "";

    if (!userName) {
      return { success: false, error: "Nombre del comensal requerido" };
    }
    if (!userPhone) {
      return { success: false, error: "Teléfono del comensal requerido" };
    }

    try {
      const payload = buildReservationPayload({
        userId: hasUser ? user.uid || user.id : null,
        userEmail: hasUser ? user.email || "" : "",
        userName,
        userPhone,
        date,
        time,
        shift,
        peopleCount: Number(peopleCount) || 1,
        specialRequests,
        status: RESERVATION_STATUS.CONFIRMED,
        createdBy: adminEmail,
      });

      const docRef = await addDoc(collection(db, "reservations"), payload);
      return { success: true, reservationId: docRef.id };
    } catch (error) {
      console.error("Error creando reserva de admin:", error);
      return { success: false, error: error.message };
    }
  }

  async updateReservation(reservationId, updates = {}) {
    if (!reservationId) {
      return { success: false, error: "ID de reserva requerido" };
    }
    if (!updates || typeof updates !== "object") {
      return { success: false, error: "Actualizaciones inválidas" };
    }

    const allowedFields = [
      "userId",
      "userEmail",
      "userName",
      "userPhone",
      "date",
      "reservationDate",
      "time",
      "reservationTime",
      "shift",
      "peopleCount",
      "numberOfPeople",
      "specialRequests",
      "status",
      "tableIds",
    ];

    const payload = {};
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        payload[key] = updates[key];
      }
    });

    if (payload.time && !payload.shift) {
      payload.shift = getShiftFromTime(payload.time);
    }
    if (payload.reservationTime && !payload.shift) {
      payload.shift = getShiftFromTime(payload.reservationTime);
    }
    if (payload.peopleCount && !payload.numberOfPeople) {
      payload.numberOfPeople = Number(payload.peopleCount);
    }
    if (payload.numberOfPeople && !payload.peopleCount) {
      payload.peopleCount = Number(payload.numberOfPeople);
    }
    if (payload.date && !payload.reservationDate) {
      payload.reservationDate = payload.date;
    }
    if (payload.reservationDate && !payload.date) {
      payload.date = payload.reservationDate;
    }

    payload.updatedAt = serverTimestamp();

    try {
      await updateDoc(doc(db, "reservations", reservationId), payload);
      return { success: true };
    } catch (error) {
      console.error("Error actualizando reserva:", error);
      return { success: false, error: error.message };
    }
  }

  async getReservedTableIds(date, time, excludeReservationId = null) {
    const shift = getShiftFromTime(time);
    if (!shift) {
      return { success: false, error: "Turno inválido para comprobar conflictos" };
    }

    const reservationsResult = await this.getReservationsByDateAndShift(
      date,
      shift,
    );
    if (!reservationsResult.success) {
      return reservationsResult;
    }

    const reservedTableIds = new Set();
    reservationsResult.reservations.forEach((reservation) => {
      if (
        reservation.id !== excludeReservationId &&
        hasTimeConflict(reservation.time, time)
      ) {
        reservation.tableIds?.forEach((tableId) => reservedTableIds.add(tableId));
      }
    });

    return { success: true, reservedTableIds: Array.from(reservedTableIds) };
  }

  async getAvailableTablesForReservation(
    date,
    time,
    peopleCount,
    excludeReservationId = null,
  ) {
    if (!isValidReservationTime(time)) {
      return { success: false, error: "Hora de reserva no válida" };
    }
    if (!date) {
      return { success: false, error: "Fecha de reserva requerida" };
    }
    if (Number(peopleCount) <= 0) {
      return { success: false, error: "Número de personas inválido" };
    }

    const tablesResult = await TableService.getAllTables();
    if (!tablesResult.success) {
      return tablesResult;
    }

    const reservedResult = await this.getReservedTableIds(
      date,
      time,
      excludeReservationId,
    );
    if (!reservedResult.success) {
      return reservedResult;
    }

    const availableTables = tablesResult.tables.filter((table) => {
      const capacity = Number(table.capacity || 0);
      const isActive = table.available !== false;
      const isFree = !reservedResult.reservedTableIds.includes(table.id);
      return isActive && isFree && capacity > 0;
    });

    const singleTableOptions = availableTables.filter(
      (table) => Number(table.capacity || 0) >= Number(peopleCount),
    );

    const highestCapacity = availableTables.reduce(
      (max, table) => Math.max(max, Number(table.capacity || 0)),
      0,
    );

    const needsMerge =
      Number(peopleCount) > highestCapacity && availableTables.length > 0;

    return {
      success: true,
      tables: availableTables,
      singleTableOptions,
      needsMerge,
      reservedTableIds: reservedResult.reservedTableIds,
      estimatedCapacity: availableTables.reduce(
        (sum, table) => sum + Number(table.capacity || 0),
        0,
      ),
    };
  }

  isTableAvailableForReservation(table, date, time, peopleCount, reservations) {
    if (!table || !table.id) {
      return false;
    }
    if (!isValidReservationTime(time)) {
      return false;
    }
    const capacity = Number(table.capacity || 0);
    if (capacity < Number(peopleCount)) {
      return false;
    }
    if (table.available === false) {
      return false;
    }
    if (!Array.isArray(reservations)) {
      return true;
    }

    return !reservations.some((reservation) => {
      const reservationTableIds = Array.isArray(reservation.tableIds)
        ? reservation.tableIds
        : reservation.tableId
        ? [reservation.tableId]
        : [];
      const usesTable = reservationTableIds.includes(table.id);
      return usesTable && hasTimeConflict(reservation.time, time);
    });
  }

  async assignTablesToReservation(reservationId, tableIds = []) {
    if (!reservationId) {
      return { success: false, error: "ID de reserva requerido" };
    }
    if (!Array.isArray(tableIds)) {
      return { success: false, error: "tableIds debe ser un arreglo" };
    }

    const reservationDoc = await getDoc(doc(db, "reservations", reservationId));
    if (!reservationDoc.exists()) {
      return { success: false, error: "Reserva no encontrada" };
    }

    const reservation = normalizeReservation(reservationDoc.data());
    if (reservation.status === RESERVATION_STATUS.CANCELED) {
      return { success: false, error: "No se puede asignar mesas a una reserva cancelada" };
    }

    const allTablesResult = await TableService.getAllTables();
    if (!allTablesResult.success) {
      return allTablesResult;
    }

    const tableMap = new Map();
    allTablesResult.tables.forEach((table) => tableMap.set(table.id, table));

    const missingTable = tableIds.find((tableId) => !tableMap.has(tableId));
    if (missingTable) {
      return { success: false, error: `Mesa no encontrada: ${missingTable}` };
    }

    const reservedResult = await this.getReservedTableIds(
      reservation.date,
      reservation.time,
      reservationId,
    );
    if (!reservedResult.success) {
      return reservedResult;
    }

    const conflictingTable = tableIds.find((tableId) =>
      reservedResult.reservedTableIds.includes(tableId),
    );
    if (conflictingTable) {
      return {
        success: false,
        error: `La mesa ${conflictingTable} no está disponible para ese horario`,
      };
    }

    const previousTableIds = Array.isArray(reservation.tableIds)
      ? reservation.tableIds
      : reservation.tableId
      ? [reservation.tableId]
      : [];

    const tablesToRelease = previousTableIds.filter(
      (tableId) => !tableIds.includes(tableId),
    );
    const tablesToAssign = tableIds.filter(
      (tableId) => !previousTableIds.includes(tableId),
    );

    try {
      const updates = [];
      tablesToRelease.forEach((tableId) => {
        updates.push(
          updateDoc(doc(db, "tables", tableId), {
            reservationId: null,
            available: true,
          }),
        );
      });

      tablesToAssign.forEach((tableId) => {
        updates.push(
          updateDoc(doc(db, "tables", tableId), {
            reservationId,
            available: false,
          }),
        );
      });

      const reservationUpdate = {
        tableIds,
        tableId: tableIds.length === 1 ? tableIds[0] : null,
        updatedAt: serverTimestamp(),
      };

      updates.push(updateDoc(doc(db, "reservations", reservationId), reservationUpdate));
      await Promise.all(updates);

      return { success: true };
    } catch (error) {
      console.error("Error asignando mesas a reserva:", error);
      return { success: false, error: error.message };
    }
  }

  async unassignTablesFromReservation(reservationId) {
    if (!reservationId) {
      return { success: false, error: "ID de reserva requerido" };
    }

    const reservationDoc = await getDoc(doc(db, "reservations", reservationId));
    if (!reservationDoc.exists()) {
      return { success: false, error: "Reserva no encontrada" };
    }

    const reservation = normalizeReservation(reservationDoc.data());
    const previousTableIds = Array.isArray(reservation.tableIds)
      ? reservation.tableIds
      : reservation.tableId
      ? [reservation.tableId]
      : [];

    try {
      const updates = [];
      previousTableIds.forEach((tableId) => {
        updates.push(
          updateDoc(doc(db, "tables", tableId), {
            reservationId: null,
            available: true,
          }),
        );
      });

      updates.push(
        updateDoc(doc(db, "reservations", reservationId), {
          tableIds: [],
          tableId: null,
          updatedAt: serverTimestamp(),
        }),
      );

      await Promise.all(updates);
      return { success: true };
    } catch (error) {
      console.error("Error desasignando mesas de reserva:", error);
      return { success: false, error: error.message };
    }
  }
}

const reservationTableService = new ReservationTableService();
export default reservationTableService;
