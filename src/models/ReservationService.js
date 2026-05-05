// Modelo: ReservationService.js
// Servicio para gestionar reservas en Firestore.
// Incluye CRUD básico para reservas.

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

class ReservationService {
  // Obtener todas las reservas
  async getAllReservations() {
    try {
      const querySnapshot = await getDocs(collection(db, "reservations"));
      const reservations = [];
      querySnapshot.forEach((doc) => {
        reservations.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, reservations };
    } catch (error) {
      console.error("Error obteniendo reservas:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener reservas por usuario
  async getReservationsByUser(userId) {
    try {
      const q = query(
        collection(db, "reservations"),
        where("userId", "==", userId),
      );
      const querySnapshot = await getDocs(q);
      const reservations = [];
      querySnapshot.forEach((doc) => {
        reservations.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, reservations };
    } catch (error) {
      console.error("Error obteniendo reservas por usuario:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener una reserva por ID
  async getReservationById(id) {
    try {
      const docSnap = await getDoc(doc(db, "reservations", id));
      if (docSnap.exists()) {
        return {
          success: true,
          reservation: { id: docSnap.id, ...docSnap.data() },
        };
      } else {
        return { success: false, error: "Reserva no encontrada" };
      }
    } catch (error) {
      console.error("Error obteniendo reserva:", error);
      return { success: false, error: error.message };
    }
  }

  // Crear una nueva reserva
  async createReservation(reservationData) {
    try {
      const docRef = await addDoc(
        collection(db, "reservations"),
        reservationData,
      );
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error creando reserva:", error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar una reserva
  async updateReservation(id, reservationData) {
    try {
      await updateDoc(doc(db, "reservations", id), reservationData);
      return { success: true };
    } catch (error) {
      console.error("Error actualizando reserva:", error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar una reserva
  async deleteReservation(id) {
    try {
      await deleteDoc(doc(db, "reservations", id));
      return { success: true };
    } catch (error) {
      console.error("Error eliminando reserva:", error);
      return { success: false, error: error.message };
    }
  }
}

const reservationService = new ReservationService();
export default reservationService;
