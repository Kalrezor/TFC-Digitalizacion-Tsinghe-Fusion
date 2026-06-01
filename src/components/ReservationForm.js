/*
 * Archivo: src/components/ReservationForm.js
 * Proposito: Formulario general de reserva: recoge fecha, turno, comensales y datos necesarios.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

// Componente: ReservationForm.js
// Formulario para crear/editar reservas
// Detecta automáticamente cuando hay > 4 comensales y sugiere fusión de mesas

import React, { useState, useEffect, useCallback } from "react";
import ReservationService from "../services/ReservationService";
import { toastError, toastInfo, toastSuccess } from "../services/ToastService";

const getBestFitTables = (tables, people) => {
  const guests = Number(people) || 1;
  const sorted = tables
    .filter((table) => Number(table.capacity || 0) >= guests)
    .sort((a, b) => {
      const capacityDiff = Number(a.capacity || 0) - Number(b.capacity || 0);
      if (capacityDiff !== 0) return capacityDiff;
      return Number(a.tableNumber || a.number || 0) - Number(b.tableNumber || b.number || 0);
    });

  const maxReasonableCapacity = Math.max(guests + 3, Math.ceil(guests * 1.5));
  const bestFits = sorted.filter(
    (table) => Number(table.capacity || 0) <= maxReasonableCapacity
  );

  if (bestFits.length >= 3 || bestFits.length === sorted.length) {
    return bestFits;
  }

  const bestFitIds = new Set(bestFits.map((table) => table.id));
  const fallbackFits = sorted
    .filter((table) => !bestFitIds.has(table.id))
    .slice(0, 3 - bestFits.length);

  return [...bestFits, ...fallbackFits];
};

const ReservationForm = ({ userId, userName, userEmail, onReservationCreated, userRole }) => {
  const [formData, setFormData] = useState({
    reservationDate: "",
    reservationTime: "",
    numberOfPeople: 2,
    specialRequests: "",
  });
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // ✨ NUEVO: Estados para detectar fusión necesaria
  const [mergingInfo, setMergingInfo] = useState(null);

  const loadAvailableTables = useCallback(async () => {
    try {
      const result = await ReservationService.getAvailableTables(
        formData.reservationDate,
        formData.reservationTime
      );

      if (result.success) {
        const filtered = getBestFitTables(result.tables, formData.numberOfPeople);
        setAvailableTables(filtered);
        if (filtered.length > 0) {
          setSelectedTable(filtered[0].id);
        } else {
          setSelectedTable(null);
        }
      } else {
        setAvailableTables([]);
        setSelectedTable(null);
        setError(result.error || "No se pudieron cargar las mesas disponibles.");
      }
    } catch (err) {
      console.error("Error cargando mesas:", err);
      setAvailableTables([]);
      setSelectedTable(null);
      setError(err.message || "Error cargando mesas disponibles.");
    }
  }, [formData.reservationDate, formData.reservationTime, formData.numberOfPeople]);

  // ✨ NUEVO: Validar si se necesita fusión cuando cambia número de personas
  useEffect(() => {
    const checkMerging = async () => {
      if (formData.reservationDate && formData.reservationTime && formData.numberOfPeople > 4) {
        const result = await ReservationService.checkIfMergingNeeded(
          formData.numberOfPeople,
          formData.reservationDate,
          formData.reservationTime
        );
        
        if (result.success) {
          setMergingInfo(result);
        }
      } else {
        setMergingInfo(null);
      }
    };
    
    checkMerging();
  }, [formData.numberOfPeople, formData.reservationDate, formData.reservationTime]);

  // Obtener mesas disponibles cuando cambia fecha/hora
  useEffect(() => {
    if (formData.reservationDate && formData.reservationTime) {
      loadAvailableTables();
    }
  }, [formData.reservationDate, formData.reservationTime, loadAvailableTables]);

  useEffect(() => {
    if (error) {
      toastError(error);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      toastSuccess("Reserva creada exitosamente.");
    }
  }, [success]);

  useEffect(() => {
    if (mergingInfo?.needsMerging) {
      toastInfo(mergingInfo.message);
    }
  }, [mergingInfo]);

  useEffect(() => {
    if (availableTables.length === 0 && formData.reservationDate && formData.reservationTime) {
      toastInfo("No hay mesas disponibles para la fecha y hora seleccionadas.");
    }
  }, [availableTables.length, formData.reservationDate, formData.reservationTime]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numberOfPeople" ? parseInt(value) : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validaciones
    if (!formData.reservationDate) {
      setError("Por favor selecciona una fecha");
      return;
    }

    if (!formData.reservationTime) {
      setError("Por favor selecciona una hora");
      return;
    }

    if (!selectedTable) {
      setError("No hay mesas disponibles para esta fecha y hora");
      return;
    }

    if (formData.numberOfPeople < 1 || formData.numberOfPeople > 10) {
      setError("El número de personas debe estar entre 1 y 10");
      return;
    }

    // NUEVO: Si > 4 personas y no hay mesas disponibles, mostrar error
    if (formData.numberOfPeople > 4 && mergingInfo && !mergingInfo.canMerge) {
      setError(`No hay suficientes mesas disponibles. Se necesitan ${mergingInfo.suggestedTableCount} mesas pero solo hay ${mergingInfo.availableTablesCount}.`);
      return;
    }

    setLoading(true);

    try {
      const reservationData = {
        userId: userId,
        userName: userName,
        userEmail: userEmail,
        tableId: selectedTable,
        reservationDate: formData.reservationDate,
        reservationTime: formData.reservationTime,
        numberOfPeople: formData.numberOfPeople,
        specialRequests: formData.specialRequests,
        status: "pendiente",
        needsMerging: mergingInfo?.needsMerging || false,
        suggestedTableCount: mergingInfo?.suggestedTableCount || 1,
      };

      const result = await ReservationService.createReservation(reservationData);

      if (result.success) {
        setSuccess(true);
        setFormData({
          reservationDate: "",
          reservationTime: "",
          numberOfPeople: 2,
          specialRequests: "",
        });
        setSelectedTable(null);
        setAvailableTables([]);
        setMergingInfo(null);

        // Callback
        if (onReservationCreated) {
          onReservationCreated(result.reservationId);
        }

        // Mostrar mensaje de éxito
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError(result.error || "Error al crear la reserva");
      }
    } catch (err) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split("T")[0];

  // Obtener fecha máxima (30 días adelante)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split("T")[0];

  return (
    <div className="reservation-form-container">
      <div className="reservation-form-card">
        <h2>📅 Nueva Reserva</h2>

        <form noValidate onSubmit={handleSubmit} className="reservation-form">
          {/* Fecha */}
          <div className="form-group">
            <label htmlFor="reservationDate">Fecha</label>
            <input
              id="reservationDate"
              type="date"
              name="reservationDate"
              value={formData.reservationDate}
              onChange={handleInputChange}
              min={today}
              max={maxDateString}
              required
            />
          </div>

          {/* Hora */}
          <div className="form-group">
            <label htmlFor="reservationTime">Hora</label>
            <select
              id="reservationTime"
              name="reservationTime"
              value={formData.reservationTime}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecciona una hora</option>
              <option value="12:00">12:00 - Mediodía</option>
              <option value="13:00">13:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
              <option value="18:00">18:00 - Tarde</option>
              <option value="19:00">19:00</option>
              <option value="20:00">20:00</option>
              <option value="21:00">21:00</option>
              <option value="22:00">22:00</option>
              <option value="23:00">23:00</option>
            </select>
          </div>

          {/* Número de personas */}
          <div className="form-group">
            <label htmlFor="numberOfPeople">Número de personas</label>
            <input
              id="numberOfPeople"
              type="number"
              name="numberOfPeople"
              value={formData.numberOfPeople}
              onChange={handleInputChange}
              min="1"
              max="10"
              required
            />
          </div>

          {/* Mesas disponibles */}
          {availableTables.length > 0 && (
            <div className="form-group">
              <label>Mesas disponibles recomendadas</label>
              <div className="reservation-table-grid">
                {availableTables.map((table) => (
                  <button
                    key={table.id}
                    type="button"
                    className={`reservation-table-card ${
                      selectedTable === table.id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedTable(table.id)}
                  >
                    <span className="reservation-table-title">
                      Mesa {table.tableNumber || table.number}
                    </span>
                    <span className="reservation-table-capacity">
                      {table.capacity} personas
                    </span>
                    {availableTables[0]?.id === table.id && (
                      <span className="reservation-table-badge">
                        Mejor ajuste
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <small className="form-hint">
                Se muestran primero las mesas que mejor encajan con tu grupo.
              </small>
            </div>
          )}

          {/* Solicitudes especiales */}
          <div className="form-group">
            <label htmlFor="specialRequests">Solicitudes especiales (opcional)</label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              placeholder="Ej: Cumpleaños, aniversario, alergias, etc."
              value={formData.specialRequests}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={loading || availableTables.length === 0}
            className="btn-primary btn-full-width"
          >
            {loading ? "Creando reserva..." : "Crear Reserva"}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ReservationForm;


