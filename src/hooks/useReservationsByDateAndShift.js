import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import {
  normalizeReservation,
  RESERVATION_SHIFTS,
} from "../services/ReservationTableService";

const useReservationsByDateAndShift = (date, shift) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!date || !shift || !Object.values(RESERVATION_SHIFTS).includes(shift)) {
      setReservations([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const reservationsQuery = query(
      collection(db, "reservations"),
      where("reservationDate", "==", date),
      where("status", "!=", "cancelada"),
    );

    const unsubscribe = onSnapshot(
      reservationsQuery,
      (querySnapshot) => {
        const loadedReservations = [];
        querySnapshot.forEach((doc) => {
          const normalized = normalizeReservation(doc.data());
          if (normalized.shift === shift) {
            loadedReservations.push({ id: doc.id, ...normalized });
          }
        });
        setReservations(loadedReservations);
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        console.error("Error en listener de reservas por turno:", snapshotError);
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [date, shift]);

  return {
    reservations,
    loading,
    error,
  };
};

export default useReservationsByDateAndShift;
