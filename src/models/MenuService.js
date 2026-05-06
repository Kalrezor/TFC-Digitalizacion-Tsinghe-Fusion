// Modelo: MenuService.js
// Servicio para gestionar menús en Firestore.
// Incluye CRUD completo para menús con operaciones admin-only para escritura.
// Adaptado a las nuevas colecciones: plate, category, allergen.

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

class MenuService {

  // Obtener todos los alérgenos por ID
  async getAllAllergens() {
    try {
      const querySnapshot = await getDocs(collection(db, "allergen"));
      const allergens = {};
      querySnapshot.forEach((doc) => {
        allergens[doc.id] = { id: doc.id, ...doc.data() };
      });
      return { success: true, data: allergens };
    } catch (error) {
      console.error("Error obteniendo alérgenos:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener todas las categorías
  async getAllCategories() {
    try {
      const querySnapshot = await getDocs(collection(db, "category"));
      const categories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data: categories };
    } catch (error) {
      console.error("Error obteniendo categorías:", error);
      return { success: false, error: error.message };
    }
  }

  /*Métodos actualizados a la tabla 'PLATE'*/

  // Obtener todos los plato
  async getAllPlates() {
    try {
      const querySnapshot = await getDocs(collection(db, "plate"));
      const plates = [];
      querySnapshot.forEach((doc) => {
        plates.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: plates };
    } catch (error) {
      console.error("Error obteniendo platos:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener plato por ID
  async getPlateById(id) {
    try {
      const docSnap = await getDoc(doc(db, "plate", id));
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: "Plato no encontrado" };
      }
    } catch (error) {
      console.error("Error obteniendo plato:", error);
      return { success: false, error: error.message };
    }
  }

  // Crear un plato solo admin
  async createPlate(plateData, isAdmin = false) {
    try {
      if (!isAdmin) {
        return { success: false, error: "Solo administradores pueden crear platos" };
      }
      const docRef = await addDoc(collection(db, "plate"), {
        ...plateData,
        createdAt: serverTimestamp(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error creando plato:", error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar plato solo admin
  async updatePlate(id, plateData, isAdmin = false) {
    try {
      if (!isAdmin) {
        return { success: false, error: "Solo administradores pueden actualizar platos" };
      }
      await updateDoc(doc(db, "plate", id), {
        ...plateData,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error actualizando plato:", error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar plato solo admin
  async deletePlate(id, isAdmin = false) {
    try {
      if (!isAdmin) {
        return { success: false, error: "Solo administradores pueden eliminar platos" };
      }
      await deleteDoc(doc(db, "plate", id));
      return { success: true };
    } catch (error) {
      console.error("Error eliminando plato:", error);
      return { success: false, error: error.message };
    }
  }

  /*MÉTODOS DE COMPATIBILIDAD*/
  async getAllMenus() { return this.getAllPlates(); }
  async createMenu(data, isAdmin) { return this.createPlate(data, isAdmin); }
  async updateMenu(id, data, isAdmin) { return this.updatePlate(id, data, isAdmin); }
  async deleteMenu(id, isAdmin) { return this.deletePlate(id, isAdmin); }
}

const menuService = new MenuService();
export default menuService;