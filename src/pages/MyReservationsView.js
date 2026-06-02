import React from "react";
import useReservations from "../hooks/useReservations";

const MyReservationsView = ({ userId }) => {
  const { reservations, loading, error } = useReservations(userId);

  if (loading) {
    return (
      <div className="my-reservations-loading">Cargando tus reservas...</div>
    );
  }

  return (
    <div className="my-reservations-page">
      <h2 className="my-reservations-title">Mis Reservas</h2>

      {error && <div className="my-reservations-error">{error}</div>}

      {reservations.length === 0 ? (
        <div className="my-reservations-empty">
          Aún no tienes reservas. Puedes crear una nueva desde la sección
          "Reservas".
        </div>
      ) : (
        <div className="my-reservations-grid">
          {reservations
            .sort(
              (a, b) =>
                a.date.localeCompare(b.date) || a.time.localeCompare(b.time),
            )
            .map((reservation) => {
              const assignedTables = Array.isArray(reservation.tableIds)
                ? reservation.tableIds
                : reservation.tableId
                  ? [reservation.tableId]
                  : [];

              return (
                <div key={reservation.id} className="my-reservation-card">
                  <div>
                    <div className="my-reservation-title-row">
                      <h3 className="my-reservation-card-title">
                        Reserva {reservation.id.slice(-6).toUpperCase()}
                      </h3>
                      <span style={statusBadge(reservation.status)}>
                        {reservation.status}
                      </span>
                    </div>
                    <p className="my-reservation-meta">
                      <strong>Fecha:</strong>{" "}
                      {reservation.date || reservation.reservationDate}
                    </p>
                    <p className="my-reservation-meta">
                      <strong>Hora:</strong>{" "}
                      {reservation.time || reservation.reservationTime}
                    </p>
                    <p className="my-reservation-meta">
                      <strong>Personas:</strong>{" "}
                      {reservation.peopleCount || reservation.numberOfPeople}
                    </p>
                    <p className="my-reservation-meta">
                      <strong>Mesas:</strong>{" "}
                      {assignedTables.length > 0
                        ? assignedTables.join(", ")
                        : "Pendiente"}
                    </p>
                    {reservation.specialRequests && (
                      <p className="my-reservation-meta">
                        <strong>Solicitudes:</strong>{" "}
                        {reservation.specialRequests}
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

const statusBadge = (status) => ({
  background: status === "confirmada" ? "#d4edda" : "#fff3cd",
  color: status === "confirmada" ? "#155724" : "#856404",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  textTransform: "capitalize",
});

export default MyReservationsView;
