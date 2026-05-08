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
import { auth, db } from "../firebaseConfig";

const LIST_USERS_URL =
  "https://us-central1-digitalizacion-tsinge-fusion.cloudfunctions.net/listUsersAdmin";

class UserService {
  // Obtener todos los usuarios
  async getAllUsers() {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });

      if (users.length > 0) {
        return { success: true, users };
      }

      return this.getAllUsersFromAuth();
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      return this.getAllUsersFromAuth();
    }
  }

  async getAllUsersFromAuth() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: "Usuario no autenticado" };
      }

      const token = await currentUser.getIdToken();
      const response = await fetch(LIST_USERS_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Error obteniendo usuarios de Firebase Auth",
        };
      }

      return { success: true, users: data.users || [] };
    } catch (error) {
      console.error("Error obteniendo usuarios de Auth:", error);
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
