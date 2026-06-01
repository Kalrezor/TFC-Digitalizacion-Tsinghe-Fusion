/*
 * Archivo: src/services/TableService.js
 * Proposito: Servicio de mesas: CRUD, activacion, fusion y consulta de mesas en Firestore.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

// Modelo: TableService.js
// Servicio para gestionar mesas en Firestore con actualizaciones en tiempo real.
// Incluye CRUD básico para mesas.

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

class TableService {
  // Obtener todas las mesas
  async getAllTables() {
    try {
      const querySnapshot = await getDocs(collection(db, "tables"));
      const tables = [];
      querySnapshot.forEach((doc) => {
        tables.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, tables };
    } catch (error) {
      console.error("Error obteniendo mesas:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener mesas disponibles
  async getAvailableTables() {
    try {
      const querySnapshot = await getDocs(collection(db, "tables"));
      const tables = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.available) {
          tables.push({ id: doc.id, ...data });
        }
      });
      return { success: true, tables };
    } catch (error) {
      console.error("Error obteniendo mesas disponibles:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener una mesa por ID
  async getTableById(id) {
    try {
      const docSnap = await getDoc(doc(db, "tables", id));
      if (docSnap.exists()) {
        return { success: true, table: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: "Mesa no encontrada" };
      }
    } catch (error) {
      console.error("Error obteniendo mesa:", error);
      return { success: false, error: error.message };
    }
  }

  // Crear una nueva mesa
  async createTable(tableData) {
    try {
      const docRef = await addDoc(collection(db, "tables"), tableData);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error creando mesa:", error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar una mesa
  async updateTable(id, tableData) {
    try {
      await updateDoc(doc(db, "tables", id), tableData);
      return { success: true };
    } catch (error) {
      console.error("Error actualizando mesa:", error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar una mesa
  async deleteTable(id) {
    try {
      await deleteDoc(doc(db, "tables", id));
      return { success: true };
    } catch (error) {
      console.error("Error eliminando mesa:", error);
      return { success: false, error: error.message };
    }
  }


  getNextFusionCode(tables) {
    const usedNumbers = new Set();

    tables.forEach((table) => {
      if (table.reservationId && typeof table.fusionCode === "string") {
        const match = table.fusionCode.match(/^F(\d+)$/);
        if (match) {
          usedNumbers.add(Number(match[1]));
        }
      }
    });

    let nextNumber = 1;
    while (usedNumbers.has(nextNumber)) {
      nextNumber++;
    }

    return `F${nextNumber}`;
  }
  // Fusionar múltiples mesas para una reserva (SOLO PARA RESERVAS > 4 COMENSALES)
  async mergeTables(reservationId, tableIds, guestCount) {
    try {
      if (guestCount <= 4) {
        return {
          success: false,
          error: "La fusión de mesas solo es posible para reservas con más de 4 comensales",
        };
      }

      if (!tableIds || tableIds.length < 2) {
        return {
          success: false,
          error: "Debes seleccionar al menos 2 mesas para fusionar",
        };
      }

      const tablesSnapshot = await getDocs(collection(db, "tables"));
      const existingTables = [];
      tablesSnapshot.forEach((tableDoc) => {
        existingTables.push({ id: tableDoc.id, ...tableDoc.data() });
      });

      const fusionCode = this.getNextFusionCode(existingTables);
      const updates = [];

      for (const tableId of tableIds) {
        updates.push(
          updateDoc(doc(db, "tables", tableId), {
            reservationId,
            mergedWith: tableIds.filter((id) => id !== tableId),
            fusionCode,
            available: false,
            lastModified: new Date().toISOString(),
          }),
        );
      }

      updates.push(
        updateDoc(doc(db, "reservations", reservationId), {
          tableId: tableIds[0],
          tableIds,
          fusionCode,
          updatedAt: new Date().toISOString(),
        }),
      );

      await Promise.all(updates);
      return {
        success: true,
        message: `${tableIds.length} mesas fusionadas exitosamente (${fusionCode})`,
        fusionCode,
      };
    } catch (error) {
      console.error("Error fusionando mesas:", error);
      return { success: false, error: error.message };
    }
  }

  // Desvincular/desanclar mesas (requiere PIN valido)
  async unmergeTables(tableIds, validationRequired = true) {
    try {
      if (!tableIds || tableIds.length === 0) {
        return { success: false, error: "No hay mesas que desvincular" };
      }

      const updates = [];
      let reservationId = null;

      const firstTable = await getDoc(doc(db, "tables", tableIds[0]));
      if (firstTable.exists()) {
        reservationId = firstTable.data().reservationId || null;
      }

      for (const tableId of tableIds) {
        updates.push(
          updateDoc(doc(db, "tables", tableId), {
            reservationId: null,
            mergedWith: [],
            fusionCode: null,
            available: true,
            lastModified: new Date().toISOString(),
          }),
        );
      }

      if (reservationId) {
        updates.push(
          updateDoc(doc(db, "reservations", reservationId), {
            tableId: null,
            tableIds: [],
            fusionCode: null,
            updatedAt: new Date().toISOString(),
          }),
        );
      }

      await Promise.all(updates);
      return {
        success: true,
        message: `${tableIds.length} mesas desvinculadas exitosamente`,
      };
    } catch (error) {
      console.error("Error desvinculando mesas:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener todas las mesas fusionadas con una reserva
  async getTablesByReservation(reservationId) {
    try {
      const querySnapshot = await getDocs(collection(db, "tables"));
      const tables = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.reservationId === reservationId) {
          tables.push({ id: doc.id, ...data });
        }
      });

      return { success: true, tables, count: tables.length };
    } catch (error) {
      console.error("Error obteniendo mesas de reserva:", error);
      return { success: false, error: error.message };
    }
  }

  // Mantener Firestore como fuente de verdad: no crear mesas por defecto.
  async initializeTables() {
    return { success: true, message: "Inicializacion automatica desactivada" };
  }

  // Escuchar cambios en tiempo real de todas las mesas
  subscribeToAllTables(callback) {
    try {
      const unsubscribe = onSnapshot(
        collection(db, "tables"),
        (querySnapshot) => {
          const tables = [];
          querySnapshot.forEach((doc) => {
            tables.push({ id: doc.id, ...doc.data() });
          });
          callback({ success: true, tables });
        },
        (error) => {
          console.error("Error en listener de mesas:", error);
          callback({ success: false, error: error.message });
        }
      );
      return unsubscribe;
    } catch (error) {
      console.error("Error subscripto a mesas:", error);
      return () => {};
    }
  }

  /**
   * VALIDACIÓN: Verificar si una mesa puede ser eliminada.
   * Solo permite eliminar si NO tiene reservas futuras.
   * 
   * @param {string} tableId - ID de la mesa
   * @returns {Promise} { success: boolean, canDelete: boolean, error?: string }
   */
  async canDeleteTable(tableId) {
    if (!tableId) {
      return { success: false, error: "ID de mesa requerido" };
    }

    try {
      // Obtener la mesa
      const tableDoc = await getDoc(doc(db, "tables", tableId));
      if (!tableDoc.exists()) {
        return { success: true, canDelete: true };
      }

      // Buscar reservas que usen esta mesa (no canceladas)
      const reservationsSnapshot = await getDocs(collection(db, "reservations"));
      const today = new Date().toISOString().split("T")[0];
      let hasActiveReservations = false;

      reservationsSnapshot.forEach((doc) => {
        const reservation = doc.data();
        const reservationDate = reservation.reservationDate || reservation.date || "";
        const status = reservation.status || "";

        // Si tiene reservas futuras (no canceladas)
        if (
          reservationDate >= today &&
          status !== "cancelada"
        ) {
          const tableIds = Array.isArray(reservation.tableIds)
            ? reservation.tableIds
            : reservation.tableId
            ? [reservation.tableId]
            : [];

          if (tableIds.includes(tableId)) {
            hasActiveReservations = true;
          }
        }
      });

      return {
        success: true,
        canDelete: !hasActiveReservations,
        reason: hasActiveReservations
          ? "La mesa tiene reservas futuras"
          : undefined,
      };
    } catch (error) {
      console.error("Error validando eliminación de mesa:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ELIMINAR CON VALIDACIÓN: Elimina una mesa solo si no tiene reservas futuras.
   * 
   * @param {string} tableId - ID de la mesa
   * @returns {Promise} { success: boolean, error?: string }
   */
  async deleteTableSafe(tableId) {
    if (!tableId) {
      return { success: false, error: "ID de mesa requerido" };
    }

    try {
      const validationResult = await this.canDeleteTable(tableId);

      if (!validationResult.success) {
        return validationResult;
      }

      if (!validationResult.canDelete) {
        return {
          success: false,
          error: validationResult.reason || "No se puede eliminar esta mesa",
        };
      }

      await deleteDoc(doc(db, "tables", tableId));
      return { success: true };
    } catch (error) {
      console.error("Error eliminando mesa con validación:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * BÚSQUEDA: Obtener mesas por número visible.
   * 
   * @param {number} tableNumber - Número de la mesa
   * @returns {Promise} { success: boolean, table?: object, error?: string }
   */
  async getTableByNumber(tableNumber) {
    if (tableNumber === undefined || tableNumber === null) {
      return { success: false, error: "Número de mesa requerido" };
    }

    try {
      const tablesSnapshot = await getDocs(collection(db, "tables"));
      let foundTable = null;

      tablesSnapshot.forEach((doc) => {
        const data = doc.data();
        const tableNum = data.number ?? data.tableNumber;
        if (Number(tableNum) === Number(tableNumber)) {
          foundTable = { id: doc.id, ...data };
        }
      });

      if (foundTable) {
        return { success: true, table: foundTable };
      } else {
        return { success: true, table: null };
      }
    } catch (error) {
      console.error("Error buscando mesa por número:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * FILTRO: Obtener mesas por capacidad mínima.
   * 
   * @param {number} minCapacity - Capacidad mínima requerida
   * @returns {Promise} { success: boolean, tables: array, error?: string }
   */
  async getTablesByCapacity(minCapacity) {
    if (Number(minCapacity) <= 0) {
      return { success: false, error: "Capacidad debe ser mayor a 0" };
    }

    try {
      const tablesSnapshot = await getDocs(collection(db, "tables"));
      const tables = [];

      tablesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (Number(data.capacity || 0) >= Number(minCapacity)) {
          tables.push({ id: doc.id, ...data });
        }
      });

      return { success: true, tables: tables.sort((a, b) => (a.number || 0) - (b.number || 0)) };
    } catch (error) {
      console.error("Error filtrando mesas por capacidad:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ESTADÍSTICAS: Obtener resumen de mesas.
   * 
   * @returns {Promise} { success: boolean, stats: { total, active, inactive }, error?: string }
   */
  async getTableStats() {
    try {
      const tablesSnapshot = await getDocs(collection(db, "tables"));
      let total = 0;
      let active = 0;
      let inactive = 0;

      tablesSnapshot.forEach((doc) => {
        const data = doc.data();
        total++;
        if (data.available === false) {
          inactive++;
        } else {
          active++;
        }
      });

      return {
        success: true,
        stats: {
          total,
          active,
          inactive,
          activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
        },
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas de mesas:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * CREAR CON VALIDACIÓN: Crea una mesa con campos requeridos.
   * 
   * @param {object} tableData - { number, capacity, available }
   * @returns {Promise} { success: boolean, id?: string, error?: string }
   */
  async createTableWithValidation(tableData) {
    if (!tableData || typeof tableData !== "object") {
      return { success: false, error: "Datos de mesa requeridos" };
    }

    const { number, tableNumber, capacity, available } = tableData;
    const normalizedNumber = number ?? tableNumber;

    // Validaciones
    if (normalizedNumber === undefined || normalizedNumber === null) {
      return { success: false, error: "Número de mesa requerido" };
    }

    if (Number(capacity) <= 0) {
      return { success: false, error: "Capacidad debe ser mayor a 0" };
    }

    // Verificar que no exista una mesa con el mismo número
    const existingTable = await this.getTableByNumber(normalizedNumber);
    if (existingTable.table) {
      return {
        success: false,
        error: `Ya existe una mesa con el número ${normalizedNumber}`,
      };
    }

    try {
      const payload = {
        number: Number(normalizedNumber),
        tableNumber: Number(normalizedNumber),
        capacity: Number(capacity),
        available: available !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "tables"), payload);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error creando mesa con validación:", error);
      return { success: false, error: error.message };
    }
  }
}

const tableService = new TableService();
export default tableService;

