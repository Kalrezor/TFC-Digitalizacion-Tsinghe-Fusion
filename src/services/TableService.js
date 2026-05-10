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
  // Fusionar multiples mesas para una reserva (SOLO PARA RESERVAS > 4 COMENSALES)
  async mergeTables(reservationId, tableIds, guestCount) {
    try {
      if (guestCount <= 4) {
        return {
          success: false,
          error: "La fusion de mesas solo es posible para reservas con mas de 4 comensales",
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
      console.log(`Mesas fusionadas para reserva ${reservationId}: ${fusionCode}`);
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
      console.log(`${tableIds.length} mesas desvinculadas`);
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
}

const tableService = new TableService();
export default tableService;
