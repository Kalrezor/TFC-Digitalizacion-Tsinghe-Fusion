// Controlador: useReservations.js
// Hook para manejar CRUD de reservas con actualizaciones en tiempo real.

import { useState, useEffect, useCallback } from "react";
import ReservationService from "../models/ReservationService";

const useReservations = (userId = null) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar reservas (todas o por usuario)
  const loadReservations = useCallback(async () => {
    setLoading(true);
    const result = userId
      ? await ReservationService.getReservationsByUser(userId)
      : await ReservationService.getAllReservations();
    setLoading(false);
    if (result.success) {
      setReservations(result.reservations);
    } else {
      setError(result.error);
    }
  }, [userId]);

  // Setup listeners en tiempo real
  useEffect(() => {
    setLoading(true);
    let unsubscribe = () => {};

    // Usar listener en tiempo real si está disponible
    if (userId) {
      // Para usuario específico
      unsubscribe = ReservationService.subscribeToUserReservations(
        userId,
        (result) => {
          setLoading(false);
          if (result.success) {
            setReservations(result.reservations);
            setError(null);
          } else {
            setError(result.error);
          }
        },
      );
    } else {
      // Para todas las reservas (admin)
      unsubscribe = ReservationService.subscribeToAllReservations((result) => {
        setLoading(false);
        if (result.success) {
          setReservations(result.reservations);
          setError(null);
        } else {
          setError(result.error);
        }
      });
    }

    // Cleanup: desuscribir cuando se desmonte o cambie userId
    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [userId]);

  // Crear reserva
  const createReservation = async (reservationData) => {
    const result = await ReservationService.createReservation(reservationData);
    // No necesitamos llamar a loadReservations, el listener actualizará automáticamente
    return result;
  };

  // Actualizar reserva
  const updateReservation = async (id, reservationData) => {
    const result = await ReservationService.updateReservation(
      id,
      reservationData,
    );
    // No necesitamos llamar a loadReservations, el listener actualizará automáticamente
    return result;
  };

  // Eliminar/cancelar reserva
  const deleteReservation = async (id) => {
    const result = await ReservationService.cancelReservation(id);
    // No necesitamos llamar a loadReservations, el listener actualizará automáticamente
    return result;
  };

  return {
    reservations,
    loading,
    error,
    createReservation,
    updateReservation,
    deleteReservation,
    loadReservations,
  };
};

export default useReservations;
