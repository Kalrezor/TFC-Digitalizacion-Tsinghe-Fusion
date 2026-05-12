import React, { useState, useEffect } from "react";
import useTablesByDateAndShift from "../../hooks/useTablesByDateAndShift";
import ReservationTableService from "../../services/ReservationTableService";

const TableAvailabilityPanel = ({ selectedDate, selectedShift }) => {
  const { active: activeTables = [], reserved: reservedTables = [], inactive: inactiveTables = [], loading, error } = useTablesByDateAndShift(selectedDate, selectedShift);
  const [reservationDetails, setReservationDetails] = useState({});

  // Cargar detalles de reservas para mesas ocupadas
  useEffect(() => {
    const loadReservationDetails = async () => {
      if (reservedTables && reservedTables.length > 0) {
        const details = {};
        for (const table of reservedTables) {
          try {
            const reservations = await ReservationTableService.getReservationsByTable(table.id);
            if (reservations && reservations.length > 0) {
              details[table.id] = reservations[0]; // Tomar la primera reserva
            }
          } catch (err) {
            console.error("Error cargando reserva para mesa:", err);
          }
        }
        setReservationDetails(details);
      }
    };

    loadReservationDetails();
  }, [reservedTables, selectedDate, selectedShift]);

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
        <div style={styles.errorMessage}>Error: {error}</div>
      </div>
    );
  }

  const getReservationInfo = (reservation) => {
    if (!reservation) return null;
    return {
      time: reservation.time || "N/A",
      customerName: reservation.customerName || "No especificado",
      numberOfPeople: reservation.numberOfPeople || 0,
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