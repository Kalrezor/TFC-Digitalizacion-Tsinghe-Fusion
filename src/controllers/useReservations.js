// Controlador: useReservations.js
// Hook para manejar CRUD de reservas.

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

  // Crear reserva
  const createReservation = async (reservationData) => {
    const result = await ReservationService.createReservation(reservationData);
    if (result.success) {
      loadReservations();
    } else {
      setError(result.error);
    }
    return result;
  };

  // Actualizar reserva
  const updateReservation = async (id, reservationData) => {
    const result = await ReservationService.updateReservation(
      id,
      reservationData,
    );
    if (result.success) {
      loadReservations();
    } else {
      setError(result.error);
    }
    return result;
  };

  // Eliminar reserva
  const deleteReservation = async (id) => {
    const result = await ReservationService.deleteReservation(id);
    if (result.success) {
      loadReservations();
    } else {
      setError(result.error);
    }
    return result;
  };

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

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
