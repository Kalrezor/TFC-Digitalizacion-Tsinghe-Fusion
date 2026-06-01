/*
 * Archivo: src/services/TableAvailabilityService.js
 * Proposito: Servicio de disponibilidad: calcula mesas libres, ocupadas o validas segun fecha, turno y comensales.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

/**
 * SERVICIO: TableAvailabilityService.js
 * 
 * Responsabilidad: Lógica completa de disponibilidad real de mesas.
 * 
 * INDEPENDENCIA DE RESERVAS:
 * - Disponibilidad basada en: fecha, hora, turno, margen de 2 horas, reservas activas, capacidad
 * - El campo 'available' de la mesa indica si está ACTIVA o INACTIVA (no influye en disponibilidad real)
 * 
 * FUNCIONES:
 * - getTableStatusByDateAndShift(date, shift)
 *   → Retorna todas las mesas categorizadas por estado
 * 
 * - getTablesAvailabilityForTime(date, time)
 *   → Retorna estado de disponibilidad de cada mesa para una hora específica
 * 
 * - getAvailableTablesForCapacity(date, time, peopleCount)
 *   → Retorna mesas que pueden alojar X personas en esa fecha/hora
 * 
 * - validateTableForReservation(tableId, date, time)
 *   → Valida si una mesa puede ser asignada a una reserva
 */

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  hasTimeConflict,
  isValidReservationTime,
  getShiftFromTime,
  RESERVATION_STATUS,
} from "./ReservationTableService";

class TableAvailabilityService {
  /**
   * Obtiene TODAS las mesas categorizadas por estado (libres, ocupadas, inactivas)
   * para una fecha y turno específico.
   * 
   * @param {string} date - Fecha (YYYY-MM-DD)
   * @param {string} shift - Turno ('comida' | 'cena')
   * @returns {Promise} { success, tables: { active, reserved, inactive }, error }
   */
  async getTableStatusByDateAndShift(date, shift) {
    if (!date) {
      return { success: false, error: "Fecha requerida" };
    }

    try {
      // Obtener todas las mesas
      const tablesSnapshot = await getDocs(collection(db, "tables"));
      const allTables = [];
      tablesSnapshot.forEach((doc) => {
        allTables.push({ id: doc.id, ...doc.data() });
      });

      // Obtener reservas para esa fecha y turno
      // NOTA: Se necesita índice compuesto en Firestore: (reservationDate, status)
      // Ver: https://console.firebase.google.com para crear el índice
      const reservationsSnapshot = await getDocs(
        query(
          collection(db, "reservations"),
          where("reservationDate", "==", date)
          // Temporalmente se filtra el status en memoria para evitar error de índice
          // Una vez creado el índice, añadir: where("status", "!=", RESERVATION_STATUS.CANCELED)
        )
      );

      const reservations = [];
      reservationsSnapshot.forEach((doc) => {
        const data = doc.data();
        // Filtrar en memoria: excluir reservas canceladas (hasta que se cree el índice)
        if (data.status !== RESERVATION_STATUS.CANCELED) {
          reservations.push({ id: doc.id, ...data });
        }
      });

      // Categorizar mesas
      const active = [];
      const reserved = [];
      const inactive = [];

      allTables.forEach((table) => {
        const isActive = table.available !== false;

        if (!isActive) {
          inactive.push({ ...table, status: "no-disponible" });
          return;
        }

        // Verificar si tiene reservas activas en este turno con conflicto horario
        const hasConflict = reservations.some((res) => {
          const resShift = res.shift || getShiftFromTime(res.time || res.reservationTime);
          const tableIds = Array.isArray(res.tableIds)
            ? res.tableIds
            : res.tableId
            ? [res.tableId]
            : [];

          const usesThisTable = tableIds.includes(table.id);
          const shiftMatches = resShift === shift;

          return usesThisTable && shiftMatches;
        });

        if (hasConflict) {
          reserved.push({ ...table, status: "ocupada" });
        } else {
          active.push({ ...table, status: "libre" });
        }
      });

      return {
        success: true,
        tables: {
          active: active.sort((a, b) => (a.number || 0) - (b.number || 0)),
          reserved: reserved.sort((a, b) => (a.number || 0) - (b.number || 0)),
          inactive: inactive.sort((a, b) => (a.number || 0) - (b.number || 0)),
        },
      };
    } catch (error) {
      console.error("Error obteniendo estado de mesas por turno:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene estado de disponibilidad de TODAS las mesas para una hora específica.
   * 
   * @param {string} date - Fecha (YYYY-MM-DD)
   * @param {string} time - Hora (HH:MM)
   * @returns {Promise} { success, tables: [{ id, number, capacity, available, status }], error }
   */
  async getTablesAvailabilityForTime(date, time) {
    if (!date || !time) {
      return { success: false, error: "Fecha y hora requeridas" };
    }

    if (!isValidReservationTime(time)) {
      return { success: false, error: "Hora de reserva no válida" };
    }

    try {
      // Obtener todas las mesas
      const tablesSnapshot = await getDocs(collection(db, "tables"));
      const allTables = [];
      tablesSnapshot.forEach((doc) => {
        allTables.push({ id: doc.id, ...doc.data() });
      });

      // Obtener reservas para esa fecha (no canceladas)
      // NOTA: Se necesita índice compuesto en Firestore: (reservationDate, status)
      const reservationsSnapshot = await getDocs(
        query(
          collection(db, "reservations"),
          where("reservationDate", "==", date)
        )
      );

      const reservations = [];
      reservationsSnapshot.forEach((doc) => {
        const data = doc.data();
        // Filtrar en memoria: excluir reservas canceladas
        if (data.status !== RESERVATION_STATUS.CANCELED) {
          reservations.push({ id: doc.id, ...data });
        }
      });

      // Evaluar cada mesa
      const tablesWithStatus = allTables.map((table) => {
        const isActive = table.available !== false;

        if (!isActive) {
          return { ...table, status: "no-disponible" };
        }

        // Verificar conflicto horario
        const hasConflict = reservations.some((res) => {
          const tableIds = Array.isArray(res.tableIds)
            ? res.tableIds
            : res.tableId
            ? [res.tableId]
            : [];

          const usesThisTable = tableIds.includes(table.id);
          const resTime = res.time || res.reservationTime;

          return usesThisTable && hasTimeConflict(resTime, time);
        });

        return { ...table, status: hasConflict ? "ocupada" : "libre" };
      });

      return {
        success: true,
        tables: tablesWithStatus.sort((a, b) => (a.number || 0) - (b.number || 0)),
      };
    } catch (error) {
      console.error("Error obteniendo disponibilidad de mesas:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene SOLO las mesas disponibles que pueden alojar X personas
   * para una fecha y hora específica.
   * 
   * @param {string} date - Fecha (YYYY-MM-DD)
   * @param {string} time - Hora (HH:MM)
   * @param {number} peopleCount - Número de personas
   * @returns {Promise} { success, tables: [], needsMerge: boolean, error }
   */
  async getAvailableTablesForCapacity(date, time, peopleCount) {
    if (!date || !time) {
      return { success: false, error: "Fecha y hora requeridas" };
    }

    if (Number(peopleCount) <= 0) {
      return { success: false, error: "Número de personas inválido" };
    }

    try {
      const availabilityResult = await this.getTablesAvailabilityForTime(date, time);
      if (!availabilityResult.success) {
        return availabilityResult;
      }

      // Filtrar: mesas activas y libres
      const availableTables = availabilityResult.tables.filter(
        (table) =>
          table.status === "libre" && (table.capacity || 0) > 0
      );

      // Separar por capacidad
      const singleTableOptions = availableTables.filter(
        (table) => Number(table.capacity || 0) >= Number(peopleCount)
      );

      // Calcular si necesita fusión
      const totalCapacity = availableTables.reduce(
        (sum, table) => sum + Number(table.capacity || 0),
        0
      );

      const needsMerge =
        availableTables.length > 0 &&
        singleTableOptions.length === 0 &&
        totalCapacity >= Number(peopleCount);

      return {
        success: true,
        tables: availableTables,
        singleTableOptions,
        needsMerge,
        totalCapacity,
      };
    } catch (error) {
      console.error("Error obteniendo mesas por capacidad:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Valida si una mesa específica puede ser asignada a una reserva.
   * 
   * Verifica:
   * - Mesa existe
   * - Mesa está activa
   * - Mesa tiene capacidad
   * - No hay conflicto horario
   * 
   * @param {string} tableId - ID de la mesa
   * @param {string} date - Fecha (YYYY-MM-DD)
   * @param {string} time - Hora (HH:MM)
   * @param {number} peopleCount - Número de personas (opcional, solo validar capacidad)
   * @returns {Promise} { success, valid: boolean, error }
   */
  async validateTableForReservation(tableId, date, time, peopleCount = null) {
    if (!tableId) {
      return { success: false, error: "ID de mesa requerido" };
    }

    if (!date || !time) {
      return { success: false, error: "Fecha y hora requeridas" };
    }

    try {
      // Obtener mesa
      const tableDoc = await getDoc(doc(db, "tables", tableId));
      if (!tableDoc.exists()) {
        return { success: true, valid: false, error: "Mesa no encontrada" };
      }

      const table = tableDoc.data();

      // Validar que esté activa
      if (table.available === false) {
        return { success: true, valid: false, error: "Mesa inactiva" };
      }

      // Validar capacidad si se proporciona
      if (peopleCount && Number(table.capacity || 0) < Number(peopleCount)) {
        return { success: true, valid: false, error: "Capacidad insuficiente" };
      }

      // Validar disponibilidad horaria
      const availabilityResult = await this.getTablesAvailabilityForTime(date, time);
      if (!availabilityResult.success) {
        return availabilityResult;
      }

      const tableStatus = availabilityResult.tables.find((t) => t.id === tableId);
      if (!tableStatus) {
        return { success: true, valid: false, error: "Mesa no encontrada" };
      }

      const isAvailable = tableStatus.status === "libre";

      return { success: true, valid: isAvailable };
    } catch (error) {
      console.error("Error validando mesa para reserva:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene el estado de ocupación de una mesa específica
   * para una fecha y hora específica.
   * 
   * @param {string} tableId - ID de la mesa
   * @param {string} date - Fecha (YYYY-MM-DD)
   * @param {string} time - Hora (HH:MM)
   * @returns {Promise} { success, status: "libre|ocupada|no-disponible", error }
   */
  async getTableOccupancyStatus(tableId, date, time) {
    if (!tableId || !date || !time) {
      return { success: false, error: "Parámetros requeridos" };
    }

    try {
      const tableDoc = await getDoc(doc(db, "tables", tableId));
      if (!tableDoc.exists()) {
        return { success: true, status: "no-encontrada" };
      }

      const table = tableDoc.data();

      if (table.available === false) {
        return { success: true, status: "no-disponible" };
      }

      // Obtener reservas para esa fecha
      // NOTA: Se necesita índice compuesto en Firestore: (reservationDate, status)
      const reservationsSnapshot = await getDocs(
        query(
          collection(db, "reservations"),
          where("reservationDate", "==", date)
        )
      );

      let hasConflict = false;
      reservationsSnapshot.forEach((doc) => {
        const reservation = doc.data();
        // Filtrar en memoria: excluir reservas canceladas
        if (reservation.status === RESERVATION_STATUS.CANCELED) {
          return; // Ignorar reservas canceladas
        }
        
        const tableIds = Array.isArray(reservation.tableIds)
          ? reservation.tableIds
          : reservation.tableId
          ? [reservation.tableId]
          : [];

        const usesThisTable = tableIds.includes(tableId);
        const resTime = reservation.time || reservation.reservationTime;

        if (usesThisTable && hasTimeConflict(resTime, time)) {
          hasConflict = true;
        }
      });

      return { success: true, status: hasConflict ? "ocupada" : "libre" };
    } catch (error) {
      console.error("Error obteniendo ocupación de mesa:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new TableAvailabilityService();

