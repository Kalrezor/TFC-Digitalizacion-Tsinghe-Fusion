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
  setDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

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

  // Fusionar múltiples mesas para una reserva (SOLO PARA RESERVAS > 4 COMENSALES)
  async mergeTables(reservationId, tableIds, guestCount) {
    try {
      // Validar que haya > 4 comensales
      if (guestCount <= 4) {
        return { 
          success: false, 
          error: "La fusión de mesas solo es posible para reservas con más de 4 comensales" 
        };
      }

      // Validar que al menos haya 2 mesas
      if (!tableIds || tableIds.length < 2) {
        return { 
          success: false, 
          error: "Debes seleccionar al menos 2 mesas para fusionar" 
        };
      }

      const updates = [];

      // Actualizar cada mesa
      for (const tableId of tableIds) {
        updates.push(
          updateDoc(doc(db, "tables", tableId), {
            reservationId: reservationId,
            mergedWith: tableIds.filter(id => id !== tableId), // Otras mesas con las que está fusionada
            available: false,
            lastModified: new Date().toISOString(),
          })
        );
      }

      await Promise.all(updates);
      console.log(`✅ ${tableIds.length} mesas fusionadas para reserva ${reservationId}`);
      return { 
        success: true, 
        message: `${tableIds.length} mesas fusionadas exitosamente` 
      };
    } catch (error) {
      console.error("Error fusionando mesas:", error);
      return { success: false, error: error.message };
    }
  }

  // Desvincular/desanclar mesas (requiere PIN válido)
  async unmergeTables(tableIds, validationRequired = true) {
    try {
      if (!tableIds || tableIds.length === 0) {
        return { success: false, error: "No hay mesas que desvincular" };
      }

      const updates = [];

      for (const tableId of tableIds) {
        updates.push(
          updateDoc(doc(db, "tables", tableId), {
            reservationId: null,
            mergedWith: [], // Limpiar array de fusiones
            available: true,
            lastModified: new Date().toISOString(),
          })
        );
      }

      await Promise.all(updates);
      console.log(`✅ ${tableIds.length} mesas desvinculadas`);
      return { 
        success: true, 
        message: `${tableIds.length} mesas desvinculadas exitosamente` 
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

  // Inicializar 20 mesas si no existen
  async initializeTables() {
    try {
      const existingTables = await getDocs(collection(db, "tables"));
      
      // Si ya hay mesas, no hacer nada
      if (existingTables.size >= 20) {
        console.log("✅ Las 20 mesas ya están inicializadas");
        return { success: true, message: "Mesas ya existen" };
      }

      const batchSize = existingTables.size;
      const tablesNeeded = 20 - batchSize;
      let created = 0;

      for (let i = 1; i <= 20; i++) {
        const tableId = `mesa-${i}`;
        const tableDoc = doc(db, "tables", tableId);
        
        // Verificar si ya existe
        const existsDoc = await getDoc(tableDoc);
        if (!existsDoc.exists()) {
          await setDoc(tableDoc, {
            tableNumber: i,
            capacity: 4,
            available: true,
            active: true,
            reservationId: null,
            mergedWith: [],
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          });
          created++;
        }
      }

      console.log(`✅ ${created} mesas creadas. Total: 20`);
      return { success: true, message: `${created} mesas inicializadas` };
    } catch (error) {
      console.error("Error inicializando mesas:", error);
      return { success: false, error: error.message };
    }
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
