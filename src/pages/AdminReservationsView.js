import React, { useEffect, useMemo, useState } from "react";
import useAuth from "../hooks/useAuth";
import UserService from "../services/UserService";
import ReservationTableService, {
  RESERVATION_SHIFTS,
  RESERVATION_TIMES,
  RESERVATION_STATUS,
} from "../services/ReservationTableService";

const today = new Date().toISOString().split("T")[0];
const defaultFormState = {
  date: today,
  time: "",
  peopleCount: 2,
  specialRequests: "",
  status: RESERVATION_STATUS.CONFIRMED,
};

const AdminReservationsView = () => {
  const { userEmail: adminEmail } = useAuth();
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedShift, setSelectedShift] = useState(RESERVATION_SHIFTS.COMIDA);
  const [statusFilter, setStatusFilter] = useState("");

  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [reservationError, setReservationError] = useState(null);

  const [users, setUsers] = useState([]);
  const [searchPhone, setSearchPhone] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");

  const [selectedReservation, setSelectedReservation] = useState(null);
  const [formState, setFormState] = useState(defaultFormState);
  const [feedback, setFeedback] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTableIds, setSelectedTableIds] = useState([]);

  const statusOptions = useMemo(
    () => Object.values(RESERVATION_STATUS),
    [],
  );

  const normalizeReservation = (reservation) => ({
    ...reservation,
    date: reservation.date || reservation.reservationDate || "",
    time: reservation.time || reservation.reservationTime || "",
    peopleCount: reservation.peopleCount || reservation.numberOfPeople || 1,
    tableIds: Array.isArray(reservation.tableIds)
      ? reservation.tableIds
      : reservation.tableId
      ? [reservation.tableId]
      : [],
  });

  const filteredUsers = useMemo(() => {
    const term = searchPhone.trim().toLowerCase();
    if (!term) return [];

    return users.filter((user) => {
      const phone = String(user.phone || "").toLowerCase();
      const name = String(user.name || user.displayName || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      return phone.includes(term) || name.includes(term) || email.includes(term);
    });
  }, [searchPhone, users]);

  const resetForm = () => {
    setSelectedReservation(null);
    setFormState(defaultFormState);
    setSelectedUser(null);
    setManualName("");
    setManualPhone("");
    setSearchPhone("");
    setAvailableTables([]);
    setSelectedTableIds([]);
    setFeedback(null);
  };

  const loadReservations = async () => {
    setLoadingReservations(true);
    setReservationError(null);

    const result = await ReservationTableService.getReservationsByDateAndShift(
      selectedDate,
      selectedShift,
      true,
    );

    if (!result.success) {
      setReservationError(result.error || "No se pudieron cargar las reservas.");
      setReservations([]);
      setLoadingReservations(false);
      return [];
    }

    let loaded = result.reservations || [];
    if (statusFilter) {
      loaded = loaded.filter((reservation) => reservation.status === statusFilter);
    }

    const sorted = [...loaded].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (a.time !== b.time) return a.time.localeCompare(b.time);
      return String(a.userName || "").localeCompare(String(b.userName || ""));
    });

    setReservations(sorted);
    setLoadingReservations(false);
    return sorted;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadReservations();
    resetForm();
  }, [selectedDate, selectedShift, statusFilter]);

  useEffect(() => {
    const loadUsers = async () => {
      const result = await UserService.getAllUsers();
      if (result.success) {
        setUsers(result.users || []);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedReservation) {
      setAvailableTables([]);
      setSelectedTableIds([]);
      return;
    }

    const fetchTables = async () => {
      const result = await ReservationTableService.getAvailableTablesForReservation(
        formState.date || selectedReservation.date,
        formState.time || selectedReservation.time,
        formState.peopleCount || selectedReservation.peopleCount,
        selectedReservation.id,
      );
      if (result.success) {
        setAvailableTables(result.tables || []);
      } else {
        setAvailableTables([]);
      }
    };

    if (formState.date && formState.time && formState.peopleCount > 0) {
      fetchTables();
    }
  }, [selectedReservation, formState.date, formState.time, formState.peopleCount]);

  const selectReservation = (reservation) => {
    const normalized = normalizeReservation(reservation);
    setSelectedReservation(normalized);
    setFormState({
      date: normalized.date,
      time: normalized.time,
      peopleCount: normalized.peopleCount,
      specialRequests: normalized.specialRequests || "",
      status: normalized.status || RESERVATION_STATUS.CONFIRMED,
    });

    if (normalized.userId || normalized.userEmail) {
      setSelectedUser({
        id: normalized.userId || null,
        email: normalized.userEmail || "",
        name: normalized.userName || "",
        phone: normalized.userPhone || "",
      });
      setManualName("");
      setManualPhone("");
    } else {
      setSelectedUser(null);
      setManualName(normalized.userName || "");
      setManualPhone(normalized.userPhone || "");
    }

    setSelectedTableIds(normalized.tableIds || []);
    setFeedback(null);
    setSearchPhone("");
  };

  const refreshSelectedReservation = async (currentReservations) => {
    if (!selectedReservation?.id) {
      return;
    }
    const list = currentReservations || reservations;
    const refreshed = list.find((reservation) => reservation.id === selectedReservation.id);
    if (refreshed) {
      selectReservation(refreshed);
    }
  };

  const handleSaveReservation = async (event) => {
    event.preventDefault();
    setFormLoading(true);
    setFeedback(null);

    const name = selectedUser ? selectedUser.name || "" : manualName.trim();
    const phone = selectedUser ? selectedUser.phone || "" : manualPhone.trim();

    if (!name || !phone) {
      setFeedback({ type: "error", message: "El nombre y el teléfono son obligatorios." });
      setFormLoading(false);
      return;
    }
    if (!formState.date || !formState.time) {
      setFeedback({ type: "error", message: "Fecha y hora son obligatorias." });
      setFormLoading(false);
      return;
    }

    try {
      if (selectedReservation) {
        const payload = {
          userId: selectedUser?.id || null,
          userEmail: selectedUser?.email || "",
          userName: name,
          userPhone: phone,
          date: formState.date,
          reservationDate: formState.date,
          time: formState.time,
          reservationTime: formState.time,
          peopleCount: Number(formState.peopleCount),
          numberOfPeople: Number(formState.peopleCount),
          specialRequests: formState.specialRequests || "",
          status: formState.status,
        };

        const result = await ReservationTableService.updateReservation(
          selectedReservation.id,
          payload,
        );
        if (result.success) {
          setFeedback({ type: "success", message: "Reserva actualizada correctamente." });
          const updatedReservations = await loadReservations();
          await refreshSelectedReservation(updatedReservations);
        } else {
          setFeedback({ type: "error", message: result.error || "Error actualizando la reserva." });
        }
      } else {
        const result = await ReservationTableService.createReservationFromAdmin({
          user: selectedUser,
          manualName: selectedUser ? undefined : name,
          manualPhone: selectedUser ? undefined : phone,
          date: formState.date,
          time: formState.time,
          peopleCount: Number(formState.peopleCount),
          specialRequests: formState.specialRequests || "",
          adminEmail: adminEmail || "admin@localhost",
        });

        if (result.success) {
          setFeedback({ type: "success", message: "Reserva creada correctamente." });
          resetForm();
          await loadReservations();
        } else {
          setFeedback({ type: "error", message: result.error || "Error creando la reserva." });
        }
      }
    } catch (error) {
      console.error("Error guardando reserva:", error);
      setFeedback({ type: "error", message: error.message || "Error inesperado." });
    } finally {
      setFormLoading(false);
    }
  };

  const handleReservationStatusChange = async (reservationId, nextStatus) => {
    setFeedback(null);
    const result = await ReservationTableService.updateReservation(reservationId, {
      status: nextStatus,
    });
    if (result.success) {
      setFeedback({ type: "success", message: "Estado de reserva actualizado." });
      const updatedReservations = await loadReservations();
      await refreshSelectedReservation(updatedReservations);
    } else {
      setFeedback({ type: "error", message: result.error || "No se pudo actualizar el estado." });
    }
  };

  const handleAssignTables = async () => {
    if (!selectedReservation) {
      return;
    }
    setAssignmentLoading(true);
    setFeedback(null);

    const result = await ReservationTableService.assignTablesToReservation(
      selectedReservation.id,
      selectedTableIds,
    );

    if (result.success) {
      setFeedback({ type: "success", message: "Mesas asignadas correctamente." });
      const updatedReservations = await loadReservations();
      await refreshSelectedReservation(updatedReservations);
    } else {
      setFeedback({ type: "error", message: result.error || "No se pudieron asignar mesas." });
    }
    setAssignmentLoading(false);
  };

  const handleUnassignTables = async () => {
    if (!selectedReservation) {
      return;
    }
    setAssignmentLoading(true);
    setFeedback(null);

    const result = await ReservationTableService.unassignTablesFromReservation(
      selectedReservation.id,
    );

    if (result.success) {
      setFeedback({ type: "success", message: "Mesas desasignadas correctamente." });
      const updatedReservations = await loadReservations();
      await refreshSelectedReservation(updatedReservations);
    } else {
      setFeedback({ type: "error", message: result.error || "No se pudieron desasignar mesas." });
    }
    setAssignmentLoading(false);
  };

  const activeAssignedTableIds = useMemo(() => {
    if (!selectedReservation) return [];
    return Array.isArray(selectedReservation.tableIds)
      ? selectedReservation.tableIds
      : selectedReservation.tableId
      ? [selectedReservation.tableId]
      : [];
  }, [selectedReservation]);

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Administración de reservas</h1>
          <p style={subtitleStyle}>
            Gestiona reservas, actualiza estados y asigna mesas desde una vista unificada.
          </p>
        </div>
      </header>

      <div style={gridStyle}>
        <section style={panelStyle}>
          <div style={panelHeaderStyle}>Filtros</div>
          <div style={filtersGridStyle}>
            <label style={fieldLabelStyle}>
              Fecha
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={inputStyle}
              />
            </label>
            <label style={fieldLabelStyle}>
              Turno
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                style={inputStyle}
              >
                <option value={RESERVATION_SHIFTS.COMIDA}>Comida</option>
                <option value={RESERVATION_SHIFTS.CENA}>Cena</option>
              </select>
            </label>
            <label style={fieldLabelStyle}>
              Estado
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={inputStyle}
              >
                <option value="">Todos</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section style={panelStyle}>
          <div style={panelHeaderStyle}>Listado de reservas</div>
          {loadingReservations ? (
            <div style={infoTextStyle}>Cargando reservas...</div>
          ) : reservationError ? (
            <div style={errorTextStyle}>{reservationError}</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Teléfono</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Personas</th>
                    <th>Estado</th>
                    <th>Mesas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((reservation) => {
                    const normalized = normalizeReservation(reservation);
                    return (
                      <tr key={reservation.id}>
                        <td>{normalized.userName || "Cliente"}</td>
                        <td>{normalized.userPhone || "--"}</td>
                        <td>{normalized.date}</td>
                        <td>{normalized.time}</td>
                        <td>{normalized.peopleCount}</td>
                        <td>
                          <select
                            value={normalized.status}
                            onChange={(e) => handleReservationStatusChange(reservation.id, e.target.value)}
                            style={statusSelectStyle}
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>{normalized.tableIds.length > 0 ? normalized.tableIds.join(", ") : "Sin mesas"}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => selectReservation(normalized)}
                            style={actionButtonStyle}
                          >
                            Seleccionar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {reservations.length === 0 && (
                    <tr>
                      <td colSpan="8" style={emptyRowStyle}>
                        No hay reservas para este filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section style={panelStyle}>
          <div style={panelHeaderStyle}>{selectedReservation ? "Editar reserva" : "Crear nueva reserva"}</div>
          {feedback && (
            <div style={feedback.type === "success" ? successBoxStyle : errorBoxStyle}>
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleSaveReservation} style={formStyle}>
            <div style={fieldLabelStyle}>
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
                style={inputStyle}
              />
            </div>

            {searchPhone && (
              <div style={searchResultsStyle}>
                {filteredUsers.length > 0 ? (
                  <>
                    <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                      {filteredUsers.length} resultado{filteredUsers.length !== 1 ? "s" : ""} encontrado{filteredUsers.length !== 1 ? "s" : ""}
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
                        style={searchResultButtonStyle}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <strong style={{ fontSize: 14, color: "#222" }}>{user.name || user.displayName || user.email}</strong>
                          <div style={{ display: "flex", gap: 12, fontSize: 13, color: "#666" }}>
                            <span>📱 {user.phone || "Sin teléfono"}</span>
                            <span>✉️ {user.email}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <div style={emptyRowStyle}>
                    <div>No se encontraron usuarios.</div>
                    <div style={{ fontSize: 12, marginTop: 6, color: "#888" }}>Puedes crear la reserva manualmente con nombre y teléfono.</div>
                  </div>
                )}
              </div>
            )}

            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>
                Nombre del cliente
                <input
                  type="text"
                  value={selectedUser ? selectedUser.name || selectedUser.displayName || "" : manualName}
                  onChange={(e) => {
                    setManualName(e.target.value);
                    if (selectedUser) setSelectedUser(null);
                  }}
                  style={inputStyle}
                  required
                />
              </label>
              <label style={fieldLabelStyle}>
                Teléfono del cliente
                <input
                  type="text"
                  value={selectedUser ? selectedUser.phone || "" : manualPhone}
                  onChange={(e) => {
                    setManualPhone(e.target.value);
                    if (selectedUser) setSelectedUser(null);
                  }}
                  style={inputStyle}
                  required
                />
              </label>
            </div>

            {selectedUser && (
              <div style={selectedUserCardStyle}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>✓ {selectedUser.name || selectedUser.displayName || selectedUser.email}</div>
                  <div style={{ fontSize: 13, color: "#555" }}>📱 {selectedUser.phone}</div>
                  <div style={{ fontSize: 13, color: "#666" }}>✉️ {selectedUser.email}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setManualName("");
                    setManualPhone("");
                  }}
                  style={secondaryButtonStyle}
                >
                  Cambiar cliente
                </button>
              </div>
            )}

            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>
                Fecha
                <input
                  type="date"
                  value={formState.date}
                  onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                  style={inputStyle}
                  required
                />
              </label>
              <label style={fieldLabelStyle}>
                Hora
                <select
                  value={formState.time}
                  onChange={(e) => setFormState({ ...formState, time: e.target.value })}
                  style={inputStyle}
                  required
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

            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>
                Personas
                <input
                  type="number"
                  min="1"
                  value={formState.peopleCount}
                  onChange={(e) => setFormState({ ...formState, peopleCount: Number(e.target.value) })}
                  style={inputStyle}
                  required
                />
              </label>
              <label style={fieldLabelStyle}>
                Estado
                <select
                  value={formState.status}
                  onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                  style={inputStyle}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label style={fieldLabelStyle}>
              Solicitudes especiales
              <textarea
                rows={4}
                value={formState.specialRequests}
                onChange={(e) => setFormState({ ...formState, specialRequests: e.target.value })}
                style={{ ...inputStyle, minHeight: 100 }}
              />
            </label>

            <div style={buttonRowStyle}>
              <button type="submit" style={primaryButtonStyle} disabled={formLoading}>
                {selectedReservation ? "Guardar cambios" : "Crear reserva"}
              </button>
              <button type="button" style={secondaryButtonStyle} onClick={resetForm} disabled={formLoading}>
                Limpiar
              </button>
            </div>
          </form>
        </section>

        <section style={panelStyle}>
          <div style={panelHeaderStyle}>Asignar mesas</div>
          {selectedReservation ? (
            <>
              <div style={infoSectionStyle}>
                <strong>Reserva:</strong> {selectedReservation.userName || "Cliente"} — {selectedReservation.date} {selectedReservation.time}
              </div>
              <div style={infoSectionStyle}>
                <strong>Mesas asignadas:</strong>{" "}
                {activeAssignedTableIds.length > 0 ? activeAssignedTableIds.join(", ") : "Sin mesas asignadas"}
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={subHeaderStyle}>Mesas disponibles</div>
                {availableTables.length === 0 ? (
                  <div style={emptyRowStyle}>No hay mesas disponibles para esta fecha/hora.</div>
                ) : (
                  <div style={tableGridStyle}>
                    {availableTables.map((table) => (
                      <label key={table.id} style={tableCardStyle}>
                        <input
                          type="checkbox"
                          checked={selectedTableIds.includes(table.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelectedTableIds((prev) =>
                              checked
                                ? [...new Set([...prev, table.id])]
                                : prev.filter((id) => id !== table.id),
                            );
                          }}
                        />
                        <div>
                          <strong>Mesa {table.number || table.tableNumber || table.id}</strong>
                        </div>
                        <div>Capacidad: {table.capacity || "-"}</div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div style={buttonRowStyle}>
                <button
                  type="button"
                  onClick={handleAssignTables}
                  disabled={assignmentLoading || selectedTableIds.length === 0}
                  style={primaryButtonStyle}
                >
                  {assignmentLoading ? "Guardando..." : "Asignar mesas"}
                </button>
                <button
                  type="button"
                  onClick={handleUnassignTables}
                  disabled={assignmentLoading || activeAssignedTableIds.length === 0}
                  style={secondaryButtonStyle}
                >
                  Desasignar todas
                </button>
              </div>
            </>
          ) : (
            <div style={emptyRowStyle}>Selecciona una reserva para administrar las mesas asignadas.</div>
          )}
        </section>
      </div>
    </div>
  );
};

const containerStyle = {
  padding: 24,
};

const headerStyle = {
  marginBottom: 24,
};

const titleStyle = {
  fontSize: 32,
  margin: 0,
  color: "#222",
};

const subtitleStyle = {
  marginTop: 8,
  color: "#555",
  lineHeight: 1.5,
};

const gridStyle = {
  display: "grid",
  gap: 24,
  gridTemplateColumns: "1fr",
};

const panelStyle = {
  background: "#fff",
  borderRadius: 20,
  boxShadow: "0 14px 32px rgba(0,0,0,0.08)",
  padding: 22,
};

const panelHeaderStyle = {
  marginBottom: 18,
  fontSize: 18,
  fontWeight: 700,
  color: "#222",
};

const filtersGridStyle = {
  display: "grid",
  gap: 16,
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
};

const fieldRowStyle = {
  display: "grid",
  gap: 16,
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
};

const fieldLabelStyle = {
  display: "grid",
  gap: 10,
  fontSize: 14,
  color: "#333",
};

const inputStyle = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid #d8d8d8",
  padding: "12px 14px",
  fontSize: 14,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const statusSelectStyle = {
  borderRadius: 10,
  border: "1px solid #d8d8d8",
  padding: "8px 10px",
  width: "100%",
  fontSize: 13,
};

const actionButtonStyle = {
  appearance: "none",
  border: "none",
  background: "#DC143C",
  color: "#fff",
  borderRadius: 10,
  padding: "8px 12px",
  cursor: "pointer",
};

const primaryButtonStyle = {
  appearance: "none",
  border: "none",
  background: "#DC143C",
  color: "#fff",
  borderRadius: 12,
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 700,
};

const secondaryButtonStyle = {
  appearance: "none",
  border: "1px solid #dcdcdc",
  background: "#fafafa",
  color: "#333",
  borderRadius: 12,
  padding: "12px 18px",
  cursor: "pointer",
};

const buttonRowStyle = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 8,
};

const feedbackBoxBase = {
  borderRadius: 14,
  padding: 14,
  marginBottom: 18,
};

const successBoxStyle = {
  ...feedbackBoxBase,
  background: "#e6ffed",
  color: "#1f6e4d",
};

const errorBoxStyle = {
  ...feedbackBoxBase,
  background: "#ffe8e8",
  color: "#8b0000",
};

const infoTextStyle = {
  color: "#555",
};

const errorTextStyle = {
  color: "#8b0000",
};

const emptyRowStyle = {
  padding: 18,
  color: "#666",
  textAlign: "center",
};

const searchResultsStyle = {
  display: "grid",
  gap: 10,
  marginTop: 12,
  padding: "12px",
  background: "#f9fafb",
  borderRadius: 12,
  border: "1px solid #eee",
  maxHeight: "400px",
  overflowY: "auto",
};

const searchResultButtonStyle = {
  textAlign: "left",
  background: "#f8fafb",
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: "12px 14px",
  cursor: "pointer",
  display: "grid",
  gap: 4,
  transition: "all 0.2s ease",
  "&:hover": {
    background: "#e8f2ff",
    borderColor: "#DC143C",
  },
};

const selectedUserCardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 18px",
  borderRadius: 14,
  border: "2px solid #DC143C",
  background: "#fff5f7",
  gap: 14,
  boxShadow: "0 2px 8px rgba(220, 20, 60, 0.08)",
};

const infoSectionStyle = {
  marginBottom: 12,
  color: "#444",
};

const subHeaderStyle = {
  marginBottom: 10,
  fontWeight: 700,
  color: "#222",
};

const tableGridStyle = {
  display: "grid",
  gap: 12,
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
};

const tableCardStyle = {
  borderRadius: 14,
  border: "1px solid #e5e7eb",
  background: "#f8f9ff",
  padding: 14,
  display: "grid",
  gap: 8,
};

const formStyle = {
  display: "grid",
  gap: 16,
};

export default AdminReservationsView;
