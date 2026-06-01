/*
 * Archivo: src/hooks/useTablesByDateAndShift.js
 * Proposito: Hook que agrupa mesas activas, reservadas e inactivas para una fecha y turno.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

/**
 * HOOK: useTablesByDateAndShift.js
 * 
 * Responsabilidad: Cargar estado de mesas para una fecha y turno especÃ­fico.
 * 
 * Uso:
 * const { active, reserved, inactive, loading, error } = useTablesByDateAndShift(date, shift);
 * 
 * Retorna:
 * - active: array de mesas libres
 * - reserved: array de mesas ocupadas
 * - inactive: array de mesas inactivas
 * - loading: boolean
 * - error: string (si hay error)
 * - refetch: funciÃ³n para recargar datos
 */

import { useState, useEffect, useCallback } from "react";
import TableAvailabilityService from "../services/TableAvailabilityService";

const useTablesByDateAndShift = (date, shift) => {
  const [active, setActive] = useState([]);
  const [reserved, setReserved] = useState([]);
  const [inactive, setInactive] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTablesByDateAndShift = useCallback(async () => {
    if (!date || !shift) {
      setActive([]);
      setReserved([]);
      setInactive([]);
      setError("Fecha y turno requeridos");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await TableAvailabilityService.getTableStatusByDateAndShift(
        date,
        shift
      );

      if (result.success) {
        setActive(result.tables.active || []);
        setReserved(result.tables.reserved || []);
        setInactive(result.tables.inactive || []);
        setError(null);
      } else {
        setError(result.error);
        setActive([]);
        setReserved([]);
        setInactive([]);
      }
    } catch (err) {
      console.error("Error en useTablesByDateAndShift:", err);
      setError(err.message);
      setActive([]);
      setReserved([]);
      setInactive([]);
    } finally {
      setLoading(false);
    }
  }, [date, shift]);

  useEffect(() => {
    fetchTablesByDateAndShift();
  }, [fetchTablesByDateAndShift]);

  return {
    active,
    reserved,
    inactive,
    loading,
    error,
    refetch: fetchTablesByDateAndShift,
  };
};

export default useTablesByDateAndShift;

