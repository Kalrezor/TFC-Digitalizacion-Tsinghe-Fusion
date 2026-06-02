import React from "react";
import { RESERVATION_TIMES } from "../../../services/ReservationTableService";
import styles from "../../../styles/modules/AdminReservationsView.module.css";

const AdminReservationEditor = ({
  selectedReservation,
  handleSaveReservation,
  searchPhone,
  setSearchPhone,
  selectedUser,
  setSelectedUser,
  manualName,
  setManualName,
  manualPhone,
  setManualPhone,
  filteredUsers,
  formState,
  setFormState,
  statusOptions,
  formLoading,
  resetForm,
}) => {
  return (
    <section className="admin-reservations-panel">
      <div className="admin-reservations-panel-title">
        {selectedReservation ? "Editar reserva" : "Crear nueva reserva"}
      </div>
      <form
        noValidate
        onSubmit={handleSaveReservation}
        className="admin-reservations-form"
      >
        <div className="admin-reservations-field-label">
          Buscar cliente (teléfono, nombre o email)
          <input
            type="text"
            value={searchPhone}
            onChange={(e) => {
              setSearchPhone(e.target.value);
              if (selectedUser) {
                setSelectedUser(null);
                setManualName("");
                setManualPhone("");
              }
            }}
            placeholder="Ej. +34 600 123 456 / Juan García / juan@email.com"
            className="admin-reservations-input"
          />
        </div>

        {searchPhone && (
          <div className="admin-reservations-search-results">
            {filteredUsers.length > 0 ? (
              <>
                <div className={styles.searchResultsCount}>
                  {filteredUsers.length} resultado
                  {filteredUsers.length !== 1 ? "s" : ""} encontrado
                  {filteredUsers.length !== 1 ? "s" : ""}
                </div>
                {filteredUsers.slice(0, 8).map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(user);
                      setManualName(user.name || user.displayName || "");
                      setManualPhone(user.phone || "");
                      setSearchPhone("");
                    }}
                    className="admin-reservations-search-result"
                  >
                    <div className={styles.searchResultBody}>
                      <strong className={styles.searchResultName}>
                        {user.name || user.displayName || user.email}
                      </strong>
                      <div className={styles.searchResultMeta}>
                        <span>Teléfono: {user.phone || "Sin teléfono"}</span>
                        <span>Email: {user.email}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <div className="admin-reservations-empty">
                <div>No se encontraron usuarios.</div>
                <div className={styles.emptyHint}>
                  Puedes crear la reserva manualmente con nombre y teléfono.
                </div>
              </div>
            )}
          </div>
        )}

        <div className="admin-reservations-field-row">
          <label className="admin-reservations-field-label">
            Nombre del cliente
            <input
              type="text"
              value={
                selectedUser
                  ? selectedUser.name || selectedUser.displayName || ""
                  : manualName
              }
              onChange={(e) => {
                setManualName(e.target.value);
                if (selectedUser) setSelectedUser(null);
              }}
              className="admin-reservations-input"
            />
          </label>
          <label className="admin-reservations-field-label">
            Teléfono del cliente
            <input
              type="text"
              value={selectedUser ? selectedUser.phone || "" : manualPhone}
              onChange={(e) => {
                setManualPhone(e.target.value);
                if (selectedUser) setSelectedUser(null);
              }}
              className="admin-reservations-input"
            />
          </label>
        </div>

        {selectedUser && (
          <div className="admin-reservations-selected-user">
            <div className={styles.selectedUserBody}>
              <div className={styles.selectedUserName}>
                {selectedUser.name ||
                  selectedUser.displayName ||
                  selectedUser.email}
              </div>
              <div className={styles.selectedUserPhone}>
                Teléfono: {selectedUser.phone}
              </div>
              <div className={styles.selectedUserEmail}>
                Email: {selectedUser.email}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedUser(null);
                setManualName("");
                setManualPhone("");
              }}
              className="admin-reservations-secondary-button"
            >
              Cambiar cliente
            </button>
          </div>
        )}

        <div className="admin-reservations-field-row">
          <label className="admin-reservations-field-label">
            Fecha
            <input
              type="date"
              value={formState.date}
              onChange={(e) =>
                setFormState({ ...formState, date: e.target.value })
              }
              className="admin-reservations-input"
            />
          </label>
          <label className="admin-reservations-field-label">
            Hora
            <select
              value={formState.time}
              onChange={(e) =>
                setFormState({ ...formState, time: e.target.value })
              }
              className="admin-reservations-input"
            >
              <option value="">Selecciona una hora</option>
              <optgroup label="Comida">
                {RESERVATION_TIMES.comida.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Cena">
                {RESERVATION_TIMES.cena.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
        </div>

        <div className="admin-reservations-field-row">
          <label className="admin-reservations-field-label">
            Personas
            <input
              type="number"
              min="1"
              value={formState.peopleCount}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  peopleCount: Number(e.target.value),
                })
              }
              className="admin-reservations-input"
            />
          </label>
          <label className="admin-reservations-field-label">
            Estado
            <select
              value={formState.status}
              onChange={(e) =>
                setFormState({ ...formState, status: e.target.value })
              }
              className="admin-reservations-input"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="admin-reservations-field-label">
          Solicitudes especiales
          <textarea
            rows={4}
            value={formState.specialRequests}
            onChange={(e) =>
              setFormState({
                ...formState,
                specialRequests: e.target.value,
              })
            }
            className="admin-reservations-input admin-reservations-textarea"
          />
        </label>

        <div className="admin-reservations-button-row">
          <button
            type="submit"
            className="admin-reservations-primary-button"
            disabled={formLoading}
          >
            {selectedReservation ? "Guardar cambios" : "Crear reserva"}
          </button>
          <button
            type="button"
            className="admin-reservations-secondary-button"
            onClick={resetForm}
            disabled={formLoading}
          >
            Limpiar
          </button>
        </div>
      </form>
    </section>
  );
};

export default AdminReservationEditor;
