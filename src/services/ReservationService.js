/*
 * Archivo: src/services/ReservationService.js
 * Proposito: Servicio de reservas: CRUD y consultas de reservas para comensales y administradores.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

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

// Generar token aleatorio de 20 caracteres para confirmaciÃ³n
const generateConfirmationToken = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 20; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

const RESERVATION_STATUS_NOTIFICATION_URL =
  "https://us-central1-digitalizacion-tsinge-fusion.cloudfunctions.net/sendReservationStatusNotification";

const sendReservationStatusNotification = async (reservation, newStatus) => {
  const recipientEmail = reservation?.userEmail || reservation?.email;

  if (!recipientEmail) {
    console.warn("âš ï¸ No hay email de cliente para notificar el cambio de estado.", {
      reservationId: reservation?.id,
      newStatus,
    });
    return;
  }

  if (!["confirmada", "cancelada"].includes(newStatus)) {
    return;
  }

  try {
    const response = await fetch(RESERVATION_STATUS_NOTIFICATION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: recipientEmail,
        newStatus,
        reservationDetails: {
          userName: reservation.userName || reservation.name || recipientEmail.split("@")[0],
          date: reservation.reservationDate || reservation.date || "",
          time: reservation.reservationTime || reservation.time || "",
          numberOfPeople: reservation.numberOfPeople ?? reservation.peopleCount ?? "",
          tableNumber: Array.isArray(reservation.tableIds)
            ? reservation.tableIds.join(", ")
            : reservation.tableId || reservation.tableNumber || "Por asignar",
          tableIds: Array.isArray(reservation.tableIds) ? reservation.tableIds : [],
          specialRequests: reservation.specialRequests || "",
        },
      }),
    });

    if (!response.ok) {
      console.error("âš ï¸ Error enviando email de estado de reserva:", response.statusText);
    }
  } catch (error) {
    console.error("âš ï¸ Error enviando email de estado de reserva:", error);
  }
};

class ReservationService {
  // Crear una nueva reserva
  async createReservation(reservationData) {
    try {
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
        status: "pendiente", // pendiente, confirmada, cancelada, no-asistiÃ³
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Generar token de confirmaciÃ³n
      const confirmationToken = generateConfirmationToken();
      await addDoc(collection(db, "reservationConfirmations"), {
        reservationId: docRef.id,
        email: reservationData.userEmail,
        token: confirmationToken,
        used: false,
        createdAt: serverTimestamp(),
      });

      // Enviar email de confirmaciÃ³n (llamar Cloud Function)
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
        console.error("âš ï¸ Error enviando email de confirmaciÃ³n:", emailError);
        // No fallar la creaciÃ³n de reserva si el email falla
      }

      return { success: true, reservationId: docRef.id };
    } catch (error) {
      console.error("âŒ Error creando reserva:", error.message);
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
        ),
      );

      let conflict = false;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "cancelada") {
          return;
        }
        conflict = true;
      });

      return conflict;
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
      const currentDoc = await getDoc(doc(db, "reservations", reservationId));
      const currentReservation = currentDoc.exists() ? currentDoc.data() : null;

      await updateDoc(doc(db, "reservations", reservationId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      if (
        currentReservation &&
        updates.status &&
        currentReservation.status !== updates.status &&
        ["confirmada", "cancelada"].includes(updates.status)
      ) {
        await sendReservationStatusNotification(
          {
            ...currentReservation,
            ...updates,
          },
          updates.status,
        );
      }

      return { success: true };
    } catch (error) {
      console.error("Error actualizando reserva:", error);
      return { success: false, error: error.message };
    }
  }

  // Cancelar reserva
  async cancelReservation(reservationId) {
    try {
      const currentDoc = await getDoc(doc(db, "reservations", reservationId));
      const currentReservation = currentDoc.exists() ? currentDoc.data() : null;

      await updateDoc(doc(db, "reservations", reservationId), {
        status: "cancelada",
        updatedAt: serverTimestamp(),
      });

      if (currentReservation && currentReservation.status !== "cancelada") {
        await sendReservationStatusNotification(
          {
            ...currentReservation,
            status: "cancelada",
          },
          "cancelada",
        );
      }

      return { success: true };
    } catch (error) {
      console.error("Error cancelando reserva:", error);
      return { success: false, error: error.message };
    }
  }

  // Confirmar reserva
  async confirmReservation(reservationId) {
    try {
      const currentDoc = await getDoc(doc(db, "reservations", reservationId));
      const currentReservation = currentDoc.exists() ? currentDoc.data() : null;

      await updateDoc(doc(db, "reservations", reservationId), {
        status: "confirmada",
        updatedAt: serverTimestamp(),
      });

      if (currentReservation && currentReservation.status !== "confirmada") {
        await sendReservationStatusNotification(
          {
            ...currentReservation,
            status: "confirmada",
          },
          "confirmada",
        );
      }

      return { success: true };
    } catch (error) {
      console.error("Error confirmando reserva:", error);
      return { success: false, error: error.message };
    }
  }

  // Marcar como no-asistiÃ³
  async markAsNoShow(reservationId) {
    try {
      await updateDoc(doc(db, "reservations", reservationId), {
        status: "no-asistiÃ³",
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
    if (!date || !time) {
      return { success: false, error: "Fecha y hora de reserva requeridas" };
    }

    try {
      // Obtener todas las mesas
      const tablesSnap = await getDocs(collection(db, "tables"));
      const allTables = [];
      tablesSnap.forEach((doc) => {
        const data = doc.data();
        if (data.active !== false && data.available !== false) {
          allTables.push({ id: doc.id, ...data });
        }
      });

      // Obtener mesas reservadas para esa fecha y hora
      const reservationsSnap = await getDocs(
        query(
          collection(db, "reservations"),
          where("reservationDate", "==", date),
          where("reservationTime", "==", time),
        ),
      );

      const reservedTableIds = new Set();
      reservationsSnap.forEach((doc) => {
        const reservationData = doc.data();
        if (reservationData.status === "cancelada") {
          return;
        }
        const reservedIds = Array.isArray(reservationData.tableIds)
          ? reservationData.tableIds
          : reservationData.tableId
          ? [reservationData.tableId]
          : [];
        reservedIds.forEach((id) => reservedTableIds.add(id));
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

  // âœ¨ VALIDAR SI UNA RESERVA NECESITA FUSIÃ“N DE MESAS
  // Retorna: { needsMerging: boolean, message: string, suggestedTables: number }
  async checkIfMergingNeeded(numberOfPeople, date, time) {
    try {
      const guestCount = Number(numberOfPeople) || 1;
      
      // Solo > 4 comensales necesitan fusiÃ³n
      if (guestCount <= 4) {
        return { 
          success: true,
          needsMerging: false,
          message: "No se requiere fusiÃ³n de mesas",
          guestCount
        };
      }

      // Si > 4, necesita fusiÃ³n
      // Calcular cuÃ¡ntas mesas se sugieren (4 personas por mesa aprox)
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
        message: `Se necesita fusiÃ³n de ${suggestedTableCount} mesa${suggestedTableCount > 1 ? 's' : ''} para ${guestCount} comensales`,
        guestCount,
        suggestedTableCount,
        availableTablesCount: availableCount,
        canMerge,
        requiresAdmin: true, // Solo admins pueden fusionar
      };
    } catch (error) {
      console.error("Error verificando necesidad de fusiÃ³n:", error);
      return { success: false, error: error.message };
    }
  }
}

const reservationService = new ReservationService();
export default reservationService;

