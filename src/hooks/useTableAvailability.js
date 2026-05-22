/**
 * HOOK: useTableAvailability.js
 * 
 * Responsabilidad: Verificar disponibilidad de una mesa específica para reserva.
 * 
 * Uso:
 * const { isAvailable, valid, loading, error, refetch } = useTableAvailability(
 *   tableId,
 *   date,
 *   time,
 *   peopleCount
 * );
 * 
 * Retorna:
 * - isAvailable: boolean (mesa está libre para esa fecha/hora)
 * - valid: boolean (mesa válida para asignar a reserva)
 * - loading: boolean
 * - error: string (si hay error)
 * - refetch: función para recargar datos
 */

import { useState, useEffect, useCallback } from "react";
import TableAvailabilityService from "../services/TableAvailabilityService";

const useTableAvailability = (tableId, date, time, peopleCount = null) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [valid, setValid] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkAvailability = useCallback(async () => {
    if (!tableId || !date || !time) {
      setIsAvailable(false);
      setValid(false);
      setStatus(null);
      setError("Parámetros incompletos");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Primero obtener el estado de ocupación
      const statusResult = await TableAvailabilityService.getTableOccupancyStatus(
        tableId,
        date,
        time
      );

      if (statusResult.success) {
        setStatus(statusResult.status);
        setIsAvailable(statusResult.status === "libre");

        // Luego validar para reserva
        const validationResult =
          await TableAvailabilityService.validateTableForReservation(
            tableId,
            date,
            time,
            peopleCount
          );

        if (validationResult.success) {
          setValid(validationResult.valid);
          if (!validationResult.valid) {
            setError(validationResult.error);
          }
        } else {
          setError(validationResult.error);
        }
      } else {
        setError(statusResult.error);
      }
    } catch (err) {
      console.error("Error en useTableAvailability:", err);
      setError(err.message);
      setIsAvailable(false);
      setValid(false);
    } finally {
      setLoading(false);
    }
  }, [tableId, date, time, peopleCount]);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  return {
    isAvailable,
    valid,
    status,
    loading,
    error,
    refetch: checkAvailability,
  };
};

export default useTableAvailability;
