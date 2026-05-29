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
      <div style={styles.container}>
        <div style={styles.loadingMessage}>Cargando disponibilidad...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingMessage}>No se pudo cargar la disponibilidad.</div>
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
    <div style={styles.container}>
      <h3 style={styles.title}>Disponibilidad de Mesas</h3>

      <div style={styles.grid}>
        {/* LIBRES */}
        <div style={styles.section}>
          <h4 style={{ ...styles.sectionTitle, color: "#10b981" }}>
            ✓ Libres ({activeTables.length})
          </h4>
          <div style={styles.tableGroup}>
            {activeTables && activeTables.length > 0 ? (
              activeTables.map((table) => (
                <div key={table.id} style={styles.tableCard}>
                  <div style={{ ...styles.tableCardHeader, borderColor: "#10b981" }}>
                    <span style={styles.tableNumber}>Mesa #{table.tableNumber ?? table.number}</span>
                    <span style={styles.capacity}>{table.capacity} pax</span>
                  </div>
                  <div style={styles.status}>
                    <span style={{ ...styles.badge, backgroundColor: "#d1fae5", color: "#065f46" }}>
                      Disponible
                    </span>
                  </div>
                  <div style={styles.actions}>
                    <button
                      style={styles.occupyButton}
                      disabled={Boolean(actionLoading[table.id])}
                      onClick={() => handleOccupyTable(table)}
                    >
                      {actionLoading[table.id] ? "Procesando..." : "Marcar ocupada"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={styles.noData}>No hay mesas libres</p>
            )}
          </div>
        </div>

        {/* OCUPADAS */}
        <div style={styles.section}>
          <h4 style={{ ...styles.sectionTitle, color: "#f59e0b" }}>
            ⚠ Ocupadas ({reservedTables.length})
          </h4>
          <div style={styles.tableGroup}>
            {reservedTables && reservedTables.length > 0 ? (
              reservedTables.map((table) => {
                const resInfo = getReservationInfo(reservationDetails[table.id]);
                return (
                  <div key={table.id} style={styles.tableCard}>
                    <div style={{ ...styles.tableCardHeader, borderColor: "#f59e0b" }}>
                      <span style={styles.tableNumber}>Mesa #{table.tableNumber ?? table.number}</span>
                      <span style={styles.capacity}>{table.capacity} pax</span>
                    </div>
                    <div style={styles.status}>
                      <span style={{ ...styles.badge, backgroundColor: "#fef3c7", color: "#92400e" }}>
                        Ocupada
                      </span>
                    </div>
                    {resInfo && (
                      <div style={styles.resDetails}>
                        <p style={styles.resDetail}>
                          <strong>Hora:</strong> {resInfo.time}
                        </p>
                        <p style={styles.resDetail}>
                          <strong>Cliente:</strong> {resInfo.customerName}
                        </p>
                        <p style={styles.resDetail}>
                          <strong>Personas:</strong> {resInfo.numberOfPeople}
                        </p>
                      </div>
                    )}
                    <div style={styles.actions}>
                      <button
                        style={styles.releaseButton}
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
              <p style={styles.noData}>No hay mesas ocupadas</p>
            )}
          </div>
        </div>

        {/* INACTIVAS */}
        <div style={styles.section}>
          <h4 style={{ ...styles.sectionTitle, color: "#ef4444" }}>
            ✗ Inactivas ({inactiveTables.length})
          </h4>
          <div style={styles.tableGroup}>
            {inactiveTables && inactiveTables.length > 0 ? (
              inactiveTables.map((table) => (
                <div key={table.id} style={styles.tableCard}>
                  <div style={{ ...styles.tableCardHeader, borderColor: "#ef4444" }}>
                    <span style={styles.tableNumber}>Mesa #{table.tableNumber ?? table.number}</span>
                    <span style={styles.capacity}>{table.capacity} pax</span>
                  </div>
                  <div style={styles.status}>
                    <span style={{ ...styles.badge, backgroundColor: "#fee2e2", color: "#7f1d1d" }}>
                      No disponible
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p style={styles.noData}>No hay mesas inactivas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  title: {
    margin: "0 0 20px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  section: {
    borderRadius: "6px",
    padding: "16px",
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
  },
  sectionTitle: {
    margin: "0 0 16px 0",
    fontSize: "14px",
    fontWeight: "600",
  },
  tableGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  tableCard: {
    backgroundColor: "white",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  },
  tableCardHeader: {
    padding: "12px",
    borderLeft: "4px solid",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fafbfc",
    borderBottom: "1px solid #e5e7eb",
  },
  tableNumber: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1f2937",
  },
  capacity: {
    fontSize: "13px",
    color: "#6b7280",
  },
  status: {
    padding: "10px 12px",
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  badge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
  },
  resDetails: {
    padding: "10px 12px",
    backgroundColor: "#fafbfc",
    borderTop: "1px solid #e5e7eb",
    fontSize: "12px",
    color: "#6b7280",
  },
  resDetail: {
    margin: "4px 0",
    padding: 0,
  },
  actions: {
    padding: "10px 12px 16px",
    display: "flex",
    justifyContent: "flex-end",
  },
  occupyButton: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: "600",
  },
  releaseButton: {
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: "600",
  },
  noData: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "13px",
    margin: 0,
    padding: "12px",
  },
  loadingMessage: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#6b7280",
    fontSize: "14px",
  },
  errorMessage: {
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#fee2e2",
    color: "#7f1d1d",
    borderRadius: "6px",
    fontSize: "14px",
    border: "1px solid #fecaca",
  },
};

export default TableAvailabilityPanel;
