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
