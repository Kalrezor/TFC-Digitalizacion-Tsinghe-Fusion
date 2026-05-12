import React from "react";
import useReservations from "../hooks/useReservations";

const MyReservationsView = ({ userId }) => {
  const { reservations, loading, error } = useReservations(userId);

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        Cargando tus reservas...
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "920px", margin: "0 auto" }}>
      <h2 style={{ color: "#DC143C", marginBottom: "20px" }}>
        📌 Mis Reservas
      </h2>

      {error && (
        <div style={{ color: "#8b0000", marginBottom: "20px" }}>{error}</div>
      )}

      {reservations.length === 0 ? (
        <div
          style={{
            background: "#fff9e6",
            border: "1px solid #ffeeba",
            padding: "20px",
            borderRadius: "16px",
          }}
        >
          Aún no tienes reservas. Puedes crear una nueva desde la sección "Reservas".
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "22px",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            alignItems: "stretch",
          }}
        >
          {reservations
            .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
            .map((reservation) => {
              const assignedTables = Array.isArray(reservation.tableIds)
                ? reservation.tableIds
                : reservation.tableId
                ? [reservation.tableId]
                : [];

              return (
                <div key={reservation.id} style={cardStyle}>
                  <div>
                    <div style={titleRowStyle}>
                      <h3 style={{ margin: 0, fontSize: "18px" }}>
                        Reserva {reservation.id.slice(-6).toUpperCase()}
                      </h3>
                      <span style={statusBadge(reservation.status)}>
                        {reservation.status}
                      </span>
                    </div>
                    <p style={metaText}>
                      <strong>Fecha:</strong> {reservation.date || reservation.reservationDate}
                    </p>
                    <p style={metaText}>
                      <strong>Hora:</strong> {reservation.time || reservation.reservationTime}
                    </p>
                    <p style={metaText}>
                      <strong>Personas:</strong> {reservation.peopleCount || reservation.numberOfPeople}
                    </p>
                    <p style={metaText}>
                      <strong>Mesas:</strong>{" "}
                      {assignedTables.length > 0 ? assignedTables.join(", ") : "Pendiente"}
                    </p>
                    {reservation.specialRequests && (
                      <p style={metaText}>
                        <strong>Solicitudes:</strong> {reservation.specialRequests}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

const cardStyle = {
  background: "#fff",
  borderRadius: "20px",
  padding: "24px",
  boxShadow: "0 16px 28px rgba(0,0,0,0.08)",
  minHeight: "220px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const titleRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginBottom: "12px",
};

const statusBadge = (status) => ({
  background: status === "confirmada" ? "#d4edda" : "#fff3cd",
  color: status === "confirmada" ? "#155724" : "#856404",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  textTransform: "capitalize",
});

const metaText = {
  margin: "6px 0",
  color: "#555",
  fontSize: "14px",
};

export default MyReservationsView;
