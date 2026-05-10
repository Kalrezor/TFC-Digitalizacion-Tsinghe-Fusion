// Modelo: MenuService.js
// Servicio para gestionar men�s en Firestore.
// Incluye CRUD completo para men�s con operaciones admin-only para escritura.

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
  // Obtener todos los men�s (lectura p�blica)
  async getAllMenus() {
    try {
      const querySnapshot = await getDocs(collection(db, "menus"));
      const menus = [];
      querySnapshot.forEach((doc) => {
        menus.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, menus };
    } catch (error) {
      console.error("Error obteniendo men�s:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener men�s activos (lectura p�blica)
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
      console.error("Error obteniendo men�s activos:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener un men� por ID (lectura p�blica)
  async getMenuById(id) {
    try {
      const docSnap = await getDoc(doc(db, "menus", id));
      if (docSnap.exists()) {
        return { success: true, menu: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: "Men� no encontrado" };
      }
    } catch (error) {
      console.error("Error obteniendo men�:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener men�s por categor�a (lectura p�blica)
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
      console.error("Error obteniendo men�s por categor�a:", error);
      return { success: false, error: error.message };
    }
  }

  // Crear un nuevo men� (admin-only)
  async createMenu(menuData, isAdmin = false) {
    try {
      if (!isAdmin) {
        return { success: false, error: "Solo administradores pueden crear men�s" };
      }
      const docRef = await addDoc(collection(db, "menus"), {
        ...menuData,
        createdAt: new Date(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error creando men�:", error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar un men� (admin-only)
  async updateMenu(id, menuData, isAdmin = false) {
    try {
      if (!isAdmin) {
        return { success: false, error: "Solo administradores pueden actualizar men�s" };
      }
      await updateDoc(doc(db, "menus", id), {
        ...menuData,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error actualizando men�:", error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar un men� (admin-only)
  async deleteMenu(id, isAdmin = false) {
    try {
      if (!isAdmin) {
        return { success: false, error: "Solo administradores pueden eliminar men�s" };
      }
      await deleteDoc(doc(db, "menus", id));
      return { success: true };
    } catch (error) {
      console.error("Error eliminando men�:", error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar disponibilidad de men� (admin-only)
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
