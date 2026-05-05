// Modelo: MenuService.js
// Servicio para gestionar menús en Firestore.
// Incluye CRUD completo para menús con operaciones admin-only para escritura.

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

class MenuService {
  // Obtener todos los menús (lectura pública)
  async getAllMenus() {
    try {
      const querySnapshot = await getDocs(collection(db, "menus"));
      const menus = [];
      querySnapshot.forEach((doc) => {
        menus.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, menus };
    } catch (error) {
      console.error("Error obteniendo menús:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener menús activos (lectura pública)
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
      console.error("Error obteniendo menús activos:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener un menú por ID (lectura pública)
  async getMenuById(id) {
    try {
      const docSnap = await getDoc(doc(db, "menus", id));
      if (docSnap.exists()) {
        return { success: true, menu: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: "Menú no encontrado" };
      }
    } catch (error) {
      console.error("Error obteniendo menú:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener menús por categoría (lectura pública)
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
      console.error("Error obteniendo menús por categoría:", error);
      return { success: false, error: error.message };
    }
  }

  // Crear un nuevo menú (admin-only)
  async createMenu(menuData, isAdmin = false) {
    try {
      if (!isAdmin) {
        return { success: false, error: "Solo administradores pueden crear menús" };
      }
      const docRef = await addDoc(collection(db, "menus"), {
        ...menuData,
        createdAt: new Date(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error creando menú:", error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar un menú (admin-only)
  async updateMenu(id, menuData, isAdmin = false) {
    try {
      if (!isAdmin) {
        return { success: false, error: "Solo administradores pueden actualizar menús" };
      }
      await updateDoc(doc(db, "menus", id), {
        ...menuData,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error actualizando menú:", error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar un menú (admin-only)
  async deleteMenu(id, isAdmin = false) {
    try {
      if (!isAdmin) {
        return { success: false, error: "Solo administradores pueden eliminar menús" };
      }
      await deleteDoc(doc(db, "menus", id));
      return { success: true };
    } catch (error) {
      console.error("Error eliminando menú:", error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar disponibilidad de menú (admin-only)
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
