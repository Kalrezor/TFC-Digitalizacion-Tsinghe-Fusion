// Modelo: ReservationService.js
// Servicio para gestionar reservas en Firestore

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

// Generar token aleatorio de 20 caracteres para confirmación
const generateConfirmationToken = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 20; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

class ReservationService {
  // Crear una nueva reserva
  async createReservation(reservationData) {
    try {
      console.log("📅 Creando reserva:", reservationData);

      // Validar que no exista otra reserva en la misma mesa y hora
      const existingReservation = await this.checkReservationConflict(
        reservationData.tableId,
        reservationData.reservationDate,
        reservationData.reservationTime,
      );

      if (existingReservation) {
        return {
          success: false,
          error: "Ya existe una reserva para esta mesa en esta fecha y hora",
        };
      }

      const docRef = await addDoc(collection(db, "reservations"), {
        ...reservationData,
        status: "pendiente", // pendiente, confirmada, cancelada, no-asistió
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Generar token de confirmación
      const confirmationToken = generateConfirmationToken();
      await addDoc(collection(db, "reservationConfirmations"), {
        reservationId: docRef.id,
        email: reservationData.userEmail,
        token: confirmationToken,
        used: false,
        createdAt: serverTimestamp(),
      });

      // Enviar email de confirmación (llamar Cloud Function)
      try {
        await fetch(
          "https://us-central1-digitalizacion-tsinge-fusion.cloudfunctions.net/sendReservationConfirmation",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: reservationData.userEmail,
              reservationDetails: {
                userName: reservationData.userName,
                date: reservationData.reservationDate,
                time: reservationData.reservationTime,
                numberOfPeople: reservationData.numberOfPeople,
                tableNumber: reservationData.tableId,
                specialRequests: reservationData.specialRequests,
              },
              confirmationToken,
            }),
          },
        );
      } catch (emailError) {
        console.error("⚠️ Error enviando email de confirmación:", emailError);
        // No fallar la creación de reserva si el email falla
      }

      console.log("✅ Reserva creada:", docRef.id);
      return { success: true, reservationId: docRef.id };
    } catch (error) {
      console.error("❌ Error creando reserva:", error.message);
      return { success: false, error: error.message };
    }
  }

  // Verificar conflicto de reserva
  async checkReservationConflict(tableId, date, time) {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, "reservations"),
          where("tableId", "==", tableId),
          where("reservationDate", "==", date),
          where("reservationTime", "==", time),
          where("status", "!=", "cancelada"),
        ),
      );

      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error verificando conflicto:", error);
      return false;
    }
  }

  // Obtener reservas del usuario
  async getUserReservations(userId) {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "reservations"), where("userId", "==", userId)),
      );

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

  // Escuchar cambios en tiempo real de reservas del usuario
  subscribeToUserReservations(userId, callback) {
    try {
      const unsubscribe = onSnapshot(
        query(collection(db, "reservations"), where("userId", "==", userId)),
        (querySnapshot) => {
          const reservations = [];
          querySnapshot.forEach((doc) => {
            reservations.push({ id: doc.id, ...doc.data() });
          });
          callback({ success: true, reservations });
        },
        (error) => {
          console.error("Error en listener de reservas del usuario:", error);
          callback({ success: false, error: error.message });
        }
      );
      return unsubscribe;
    } catch (error) {
      console.error("Error subscripto a reservas del usuario:", error);
      return () => {};
    }
  }

  // Alias: getReservationsByUser (para compatibilidad con el controlador)
  async getReservationsByUser(userId) {
    return this.getUserReservations(userId);
  }

  // Obtener todas las reservas (para admin)
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

  // Escuchar cambios en tiempo real de todas las reservas
  subscribeToAllReservations(callback) {
    try {
      const unsubscribe = onSnapshot(
        collection(db, "reservations"),
        (querySnapshot) => {
          const reservations = [];
          querySnapshot.forEach((doc) => {
            reservations.push({ id: doc.id, ...doc.data() });
          });
          callback({ success: true, reservations });
        },
        (error) => {
          console.error("Error en listener de reservas:", error);
          callback({ success: false, error: error.message });
        }
      );
      return unsubscribe;
    } catch (error) {
      console.error("Error subscripto a reservas:", error);
      return () => {};
    }
  }

  // Obtener reserva por ID
  async getReservationById(reservationId) {
    try {
      const docSnap = await getDoc(doc(db, "reservations", reservationId));
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

  // Actualizar reserva
  async updateReservation(reservationId, updates) {
    try {
      console.log("📝 Actualizando reserva:", reservationId);

      await updateDoc(doc(db, "reservations", reservationId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Reserva actualizada");
      return { success: true };
    } catch (error) {
      console.error("Error actualizando reserva:", error);
      return { success: false, error: error.message };
    }
  }

  // Cancelar reserva
  async cancelReservation(reservationId) {
    try {
      console.log("❌ Cancelando reserva:", reservationId);

      await updateDoc(doc(db, "reservations", reservationId), {
        status: "cancelada",
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Reserva cancelada");
      return { success: true };
    } catch (error) {
      console.error("Error cancelando reserva:", error);
      return { success: false, error: error.message };
    }
  }

  // Confirmar reserva
  async confirmReservation(reservationId) {
    try {
      await updateDoc(doc(db, "reservations", reservationId), {
        status: "confirmada",
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error("Error confirmando reserva:", error);
      return { success: false, error: error.message };
    }
  }

  // Marcar como no-asistió
  async markAsNoShow(reservationId) {
    try {
      await updateDoc(doc(db, "reservations", reservationId), {
        status: "no-asistió",
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error("Error marcando como no-show:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener reservas por fecha (para admin)
  async getReservationsByDate(date) {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, "reservations"),
          where("reservationDate", "==", date),
          where("status", "!=", "cancelada"),
        ),
      );

      const reservations = [];
      querySnapshot.forEach((doc) => {
        reservations.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, reservations };
    } catch (error) {
      console.error("Error obteniendo reservas por fecha:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener mesas disponibles para una fecha y hora
  async getAvailableTables(date, time) {
    try {
      // Obtener todas las mesas
      const tablesSnap = await getDocs(collection(db, "tables"));
      const allTables = [];
      tablesSnap.forEach((doc) => {
        if (doc.data().active) {
          allTables.push({ id: doc.id, ...doc.data() });
        }
      });

      // Obtener mesas reservadas
      const reservationsSnap = await getDocs(
        query(
          collection(db, "reservations"),
          where("reservationDate", "==", date),
          where("reservationTime", "==", time),
          where("status", "!=", "cancelada"),
        ),
      );

      const reservedTableIds = new Set();
      reservationsSnap.forEach((doc) => {
        reservedTableIds.add(doc.data().tableId);
      });

      // Filtrar mesas disponibles
      const availableTables = allTables.filter(
        (table) => !reservedTableIds.has(table.id),
      );

      return { success: true, tables: availableTables };
    } catch (error) {
      console.error("Error obteniendo mesas disponibles:", error);
      return { success: false, error: error.message };
    }
  }

  // ✨ VALIDAR SI UNA RESERVA NECESITA FUSIÓN DE MESAS
  // Retorna: { needsMerging: boolean, message: string, suggestedTables: number }
  async checkIfMergingNeeded(numberOfPeople, date, time) {
    try {
      const guestCount = Number(numberOfPeople) || 1;
      
      // Solo > 4 comensales necesitan fusión
      if (guestCount <= 4) {
        return { 
          success: true,
          needsMerging: false,
          message: "No se requiere fusión de mesas",
          guestCount
        };
      }

      // Si > 4, necesita fusión
      // Calcular cuántas mesas se sugieren (4 personas por mesa aprox)
      const suggestedTableCount = Math.ceil(guestCount / 4);

      // Verificar disponibilidad
      const availableResult = await this.getAvailableTables(date, time);
      if (!availableResult.success) {
        return { 
          success: false, 
          error: "Error verificando disponibilidad de mesas" 
        };
      }

      const availableCount = availableResult.tables.length;
      const canMerge = availableCount >= suggestedTableCount;

      return {
        success: true,
        needsMerging: true,
        message: `Se necesita fusión de ${suggestedTableCount} mesa${suggestedTableCount > 1 ? 's' : ''} para ${guestCount} comensales`,
        guestCount,
        suggestedTableCount,
        availableTablesCount: availableCount,
        canMerge,
        requiresAdmin: true, // Solo admins pueden fusionar
      };
    } catch (error) {
      console.error("Error verificando necesidad de fusión:", error);
      return { success: false, error: error.message };
    }
  }
}

const reservationService = new ReservationService();
export default reservationService;
