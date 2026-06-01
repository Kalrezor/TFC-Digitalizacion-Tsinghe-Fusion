/*
 * Archivo: src/components/TableManagement/TableAvailabilityPanel.js
 * Proposito: Panel de disponibilidad de mesas por fecha y turno.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

import React, { useState, useEffect } from "react";
import useTablesByDateAndShift from "../../hooks/useTablesByDateAndShift";
import ReservationTableService from "../../services/ReservationTableService";
import { toastError, toastSuccess } from "../../services/ToastService";

const TableAvailabilityPanel = ({ selectedDate, selectedShift }) => {
  const { active: activeTables = [], reserved: reservedTables = [], inactive: inactiveTables = [], loading, error, refetch } = useTablesByDateAndShift(selectedDate, selectedShift);
  const [reservationDetails, setReservationDetails] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const clearActionFeedback = () => {
    setActionMessage("");
    setActionError("");
  };

  useEffect(() => {
    if (actionMessage) {
      toastSuccess(actionMessage);
    }
  }, [actionMessage]);

  useEffect(() => {
    if (actionError) {
      toastError(actionError);
    }
  }, [actionError]);

  useEffect(() => {
    if (error) {
      toastError("Error: " + error);
    }
  }, [error]);

  // Cargar detalles de reservas para mesas ocupadas
  useEffect(() => {
    const loadReservationDetails = async () => {
      if (reservedTables && reservedTables.length > 0) {
        const details = {};
        for (const table of reservedTables) {
          try {
            const result = await ReservationTableService.getReservationsByTable(table.id, selectedDate);
            if (result.success && result.reservations && result.reservations.length > 0) {
              details[table.id] = result.reservations[0]; // Tomar la primera reserva
            }
          } catch (err) {
            console.error("Error cargando reserva para mesa:", err);
          }
        }
        setReservationDetails(details);
      } else {
        setReservationDetails({});
      }
    };

    loadReservationDetails();
  }, [reservedTables, selectedDate, selectedShift]);

  const handleOccupyTable = async (table) => {
    clearActionFeedback();
    setActionLoading((prev) => ({ ...prev, [table.id]: true }));

    try {
      const result = await ReservationTableService.createManualOccupancyReservation({
        date: selectedDate,
        shift: selectedShift,
        tableIds: [table.id],
        createdBy: "admin",
      });

      if (result.success) {
        setActionMessage(`Mesa ${table.tableNumber ?? table.number} ocupada correctamente.`);
        await refetch();
      } else {
        setActionError(result.error || "No se pudo ocupar la mesa.");
      }
    } catch (err) {
      console.error("Error ocupando mesa:", err);
      setActionError(err.message || "Error al ocupar la mesa.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [table.id]: false }));
    }
  };

  const handleReleaseTable = async (table) => {
    clearActionFeedback();
    setActionLoading((prev) => ({ ...prev, [table.id]: true }));

    try {
      const reservation = reservationDetails[table.id];
      if (!reservation || !reservation.id) {
        setActionError("No se encontró la reserva asociada a esta mesa.");
        return;
      }

      const result = await ReservationTableService.releaseTableFromReservation(reservation.id, table.id);
      if (result.success) {
        setActionMessage(`Mesa ${table.tableNumber ?? table.number} liberada correctamente.`);
        await refetch();
      } else {
        setActionError(result.error || "No se pudo liberar la mesa.");
      }
    } catch (err) {
      console.error("Error liberando mesa:", err);
      setActionError(err.message || "Error al liberar la mesa.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [table.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="table-availability-panel">
        <div className="table-availability-loading">Cargando disponibilidad...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-availability-panel">
        <div className="table-availability-loading">No se pudo cargar la disponibilidad.</div>
      </div>
    );
  }

  const getReservationInfo = (reservation) => {
    if (!reservation) return null;
    return {
      time: reservation.time || "N/A",
      customerName: reservation.userName || reservation.customerName || "No especificado",
      numberOfPeople: reservation.peopleCount || reservation.numberOfPeople || 0,
    };
  };

  return (
    <div className="table-availability-panel">
      <h3 className="table-availability-title">Disponibilidad de Mesas</h3>

      <div className="table-availability-grid">
        {/* LIBRES */}
        <div className="table-availability-section">
          <h4 className="table-availability-section-title table-availability-section-title-free">
            ✓ Libres ({activeTables.length})
          </h4>
          <div className="table-availability-table-group">
            {activeTables && activeTables.length > 0 ? (
              activeTables.map((table) => (
                <div key={table.id} className="table-availability-card">
                  <div className="table-availability-card-header table-availability-card-header-free">
                    <span className="table-availability-table-number">Mesa #{table.tableNumber ?? table.number}</span>
                    <span className="table-availability-capacity">{table.capacity} pax</span>
                  </div>
                  <div className="table-availability-status">
                    <span className="table-availability-badge table-availability-badge-free">
                      Disponible
                    </span>
                  </div>
                  <div className="table-availability-actions">
                    <button
                      className="table-availability-button table-availability-button-occupy"
                      disabled={Boolean(actionLoading[table.id])}
                      onClick={() => handleOccupyTable(table)}
                    >
                      {actionLoading[table.id] ? "Procesando..." : "Marcar ocupada"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="table-availability-no-data">No hay mesas libres</p>
            )}
          </div>
        </div>

        {/* OCUPADAS */}
        <div className="table-availability-section">
          <h4 className="table-availability-section-title table-availability-section-title-busy">
            ⚠ Ocupadas ({reservedTables.length})
          </h4>
          <div className="table-availability-table-group">
            {reservedTables && reservedTables.length > 0 ? (
              reservedTables.map((table) => {
                const resInfo = getReservationInfo(reservationDetails[table.id]);
                return (
                  <div key={table.id} className="table-availability-card">
                    <div className="table-availability-card-header table-availability-card-header-busy">
                      <span className="table-availability-table-number">Mesa #{table.tableNumber ?? table.number}</span>
                      <span className="table-availability-capacity">{table.capacity} pax</span>
                    </div>
                    <div className="table-availability-status">
                      <span className="table-availability-badge table-availability-badge-busy">
                        Ocupada
                      </span>
                    </div>
                    {resInfo && (
                      <div className="table-availability-res-details">
                        <p className="table-availability-res-detail">
                          <strong>Hora:</strong> {resInfo.time}
                        </p>
                        <p className="table-availability-res-detail">
                          <strong>Cliente:</strong> {resInfo.customerName}
                        </p>
                        <p className="table-availability-res-detail">
                          <strong>Personas:</strong> {resInfo.numberOfPeople}
                        </p>
                      </div>
                    )}
                    <div className="table-availability-actions">
                      <button
                        className="table-availability-button table-availability-button-release"
                        disabled={Boolean(actionLoading[table.id])}
                        onClick={() => handleReleaseTable(table)}
                      >
                        {actionLoading[table.id] ? "Procesando..." : "Liberar mesa"}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="table-availability-no-data">No hay mesas ocupadas</p>
            )}
          </div>
        </div>

        {/* INACTIVAS */}
        <div className="table-availability-section">
          <h4 className="table-availability-section-title table-availability-section-title-inactive">
            ✗ Inactivas ({inactiveTables.length})
          </h4>
          <div className="table-availability-table-group">
            {inactiveTables && inactiveTables.length > 0 ? (
              inactiveTables.map((table) => (
                <div key={table.id} className="table-availability-card">
                  <div className="table-availability-card-header table-availability-card-header-inactive">
                    <span className="table-availability-table-number">Mesa #{table.tableNumber ?? table.number}</span>
                    <span className="table-availability-capacity">{table.capacity} pax</span>
                  </div>
                  <div className="table-availability-status">
                    <span className="table-availability-badge table-availability-badge-inactive">
                      No disponible
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="table-availability-no-data">No hay mesas inactivas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableAvailabilityPanel;

