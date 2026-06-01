/*
 * Archivo: src/services/MenuService.js
 * Proposito: Servicio legacy/alternativo de menus: trabaja con la coleccion menus y metodos CRUD de menu.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

// Modelo: MenuService.js
// Servicio para gestionar menÃºs en Firestore.
// Incluye CRUD completo para menÃºs con operaciones admin-only para escritura.

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

class MenuService {
  // Obtener todos los menÃºs (lectura pÃºblica)
  async getAllMenus() {
    try {
      const querySnapshot = await getDocs(collection(db, "menus"));
      const menus = [];
      querySnapshot.forEach((doc) => {
        menus.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, menus };
    } catch (error) {
      console.error("Error obteniendo menÃºs:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener menÃºs activos (lectura pÃºblica)
  async getActiveMenus() {
    try {
      const querySnapshot = await getDocs(collection(db, "menus"));
      const menus = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.active) {
          menus.push({ id: doc.id, ...data });
        }
      });
      return { success: true, menus };
    } catch (error) {
      console.error("Error obteniendo menÃºs activos:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener un menÃº por ID (lectura pÃºblica)
  async getMenuById(id) {
    try {
      const docSnap = await getDoc(doc(db, "menus", id));
      if (docSnap.exists()) {
        return { success: true, menu: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: "MenÃº no encontrado" };
      }
    } catch (error) {
      console.error("Error obteniendo menÃº:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener menÃºs por categorÃ­a (lectura pÃºblica)
  async getMenusByCategory(category) {
    try {
      const querySnapshot = await getDocs(collection(db, "menus"));
      const menus = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.category === category) {
          menus.push({ id: doc.id, ...data });
        }
      });
      return { success: true, menus };
    } catch (error) {
      console.error("Error obteniendo menÃºs por categorÃ­a:", error);
      return { success: false, error: error.message };
    }
  }

  // Crear un nuevo menÃº (admin-only)
  async createMenu(menuData, isAdmin = false) {
    try {
      if (!isAdmin) {
        return { success: false, error: "Solo administradores pueden crear menÃºs" };
      }
      const docRef = await addDoc(collection(db, "menus"), {
        ...menuData,
        createdAt: new Date(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error creando menÃº:", error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar un menÃº (admin-only)
  async updateMenu(id, menuData, isAdmin = false) {
    try {
      if (!isAdmin) {
        return { success: false, error: "Solo administradores pueden actualizar menÃºs" };
      }
      await updateDoc(doc(db, "menus", id), {
        ...menuData,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error actualizando menÃº:", error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar un menÃº (admin-only)
  async deleteMenu(id, isAdmin = false) {
    try {
      if (!isAdmin) {
        return { success: false, error: "Solo administradores pueden eliminar menÃºs" };
      }
      await deleteDoc(doc(db, "menus", id));
      return { success: true };
    } catch (error) {
      console.error("Error eliminando menÃº:", error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar disponibilidad de menÃº (admin-only)
  async toggleMenuAvailability(id, available, isAdmin = false) {
    try {
      if (!isAdmin) {
        return { success: false, error: "Solo administradores pueden cambiar disponibilidad" };
      }
      await updateDoc(doc(db, "menus", id), { available });
      return { success: true };
    } catch (error) {
      console.error("Error actualizando disponibilidad:", error);
      return { success: false, error: error.message };
    }
  }
}

const menuService = new MenuService();
export default menuService;

