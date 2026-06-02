import React from "react";
import { RESERVATION_SHIFTS } from "../../../services/ReservationTableService";

const ReservationsTable = ({
  filterMode,
  totalPeopleInReservations,
  availableSeats,
  aforo,
  loadingReservations,
  reservationError,
  reservations,
  statusOptions,
  normalizeReservationWithTables,
  handleReservationStatusChange,
  selectReservation,
}) => {
  return (
    <section className="admin-reservations-panel">
      <div className="admin-reservations-panel-header-row">
        <div className="admin-reservations-panel-title">
          Listado de reservas
        </div>
        <div className="admin-reservations-panel-meta">
          {filterMode === "turno" && (
            <span className="admin-reservations-panel-meta-item">
              {totalPeopleInReservations} / {availableSeats}
            </span>
          )}
          <span className="admin-reservations-panel-meta-item">
            Aforo {aforo}
          </span>
        </div>
      </div>
      {loadingReservations ? (
        <div className="admin-reservations-info-text">
          Cargando reservas...
        </div>
      ) : reservationError ? (
        <div className="admin-reservations-error-text">
          {reservationError}
        </div>
      ) : (
        <div className="admin-reservations-table-scroll">
          <table className="admin-reservations-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Turno</th>
                <th>Personas</th>
                <th>Estado</th>
                <th>Mesas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => {
                const normalized =
                  normalizeReservationWithTables(reservation);
                return (
                  <tr key={reservation.id}>
                    <td>{normalized.userName || "Cliente"}</td>
                    <td>{normalized.userPhone || "--"}</td>
                    <td>{normalized.date}</td>
                    <td>{normalized.time}</td>
                    <td>
                      {normalized.shift === RESERVATION_SHIFTS.CENA
                        ? "Cena"
                        : normalized.shift === RESERVATION_SHIFTS.COMIDA
                          ? "Comida"
                          : "—"}
                    </td>
                    <td>{normalized.peopleCount}</td>
                    <td>
                      <select
                        value={normalized.status}
                        onChange={(e) =>
                          handleReservationStatusChange(
                            reservation.id,
                            e.target.value,
                          )
                        }
                        className="admin-reservations-status-select"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {normalized.tableNumbers.length > 0
                        ? normalized.tableNumbers.join(", ")
                        : "Sin mesas"}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => selectReservation(normalized)}
                        className="admin-reservations-action-button"
                      >
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan="9" className="admin-reservations-empty">
                    No hay reservas para este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ReservationsTable;
