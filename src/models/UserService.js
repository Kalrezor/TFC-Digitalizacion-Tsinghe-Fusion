// Modelo: UserService.js
// Servicio para gestionar usuarios en Firestore.
// Incluye CRUD básico para usuarios.

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

class UserService {
  // Obtener todos los usuarios
  async getAllUsers() {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, users };
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener un usuario por ID
  async getUserById(id) {
    try {
      const docSnap = await getDoc(doc(db, "users", id));
      if (docSnap.exists()) {
        return { success: true, user: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: "Usuario no encontrado" };
      }
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
      return { success: false, error: error.message };
    }
  }

  // Crear un nuevo usuario
  async createUser(userData) {
    try {
      const docRef = await addDoc(collection(db, "users"), userData);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error creando usuario:", error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar un usuario
  async updateUser(id, userData) {
    try {
      await updateDoc(doc(db, "users", id), userData);
      return { success: true };
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar un usuario
  async deleteUser(id) {
    try {
      await deleteDoc(doc(db, "users", id));
      return { success: true };
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      return { success: false, error: error.message };
    }
  }
}

const userService = new UserService();
export default userService;
