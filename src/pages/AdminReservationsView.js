/*
 * Archivo: src/pages/AdminReservationsView.js
 * Proposito: Vista administrativa de reservas: permite consultar, crear, editar, confirmar/cancelar y asignar mesas.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

import React, { useEffect, useMemo, useState } from "react";
import useAuth from "../hooks/useAuth";
import useTablesByDateAndShift from "../hooks/useTablesByDateAndShift";
import UserService from "../services/UserService";
import TableService from "../services/TableService";
import { toastSuccess, toastError } from "../services/ToastService";
import ReservationTableService, {
  RESERVATION_SHIFTS,
  RESERVATION_TIMES,
  RESERVATION_STATUS,
  getShiftFromTime,
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
  const [selectedEndDate, setSelectedEndDate] = useState(today);
  const [filterMode, setFilterMode] = useState("turno");
  const [selectedShift, setSelectedShift] = useState(RESERVATION_SHIFTS.COMIDA);
  const [statusFilter, setStatusFilter] = useState("");
  const [tablesById, setTablesById] = useState({});
  const [allTables, setAllTables] = useState([]);
  const [searchClientTerm, setSearchClientTerm] = useState("");

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
  const [formLoading, setFormLoading] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTableIds, setSelectedTableIds] = useState([]);

  const { active: availableTablesByShift = [] } = useTablesByDateAndShift(selectedDate, selectedShift);

  const statusOptions = useMemo(
    () => Object.values(RESERVATION_STATUS),
    [],
  );

  const normalizeReservation = (reservation) => ({
    ...reservation,
    date: reservation.date || reservation.reservationDate || "",
    time: reservation.time || reservation.reservationTime || "",
    shift: reservation.shift || getShiftFromTime(reservation.time || reservation.reservationTime || ""),
    peopleCount: reservation.peopleCount || reservation.numberOfPeople || 1,
    tableIds: Array.isArray(reservation.tableIds)
      ? reservation.tableIds
      : reservation.tableId
      ? [reservation.tableId]
      : [],
  });

  const normalizeReservationWithTables = (reservation) => {
    const normalized = normalizeReservation(reservation);
    const tableNumbers = normalized.tableIds
      .map((tableId) => {
        const mapped = tablesById[tableId];
        return mapped || tableId;
      })
      .filter(Boolean);
    return {
      ...normalized,
      tableNumbers,
    };
  };

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
  };

  const loadReservations = async () => {
    setLoadingReservations(true);
    setReservationError(null);

    let result;
    if (filterMode === "turno") {
      result = await ReservationTableService.getReservationsByDateAndShift(
        selectedDate,
        selectedShift,
        true,
      );
    } else if (filterMode === "dia") {
      result = await ReservationTableService.getReservationsByDate(
        selectedDate,
        true,
      );
    } else if (filterMode === "rango") {
      const fromDate = selectedDate <= selectedEndDate ? selectedDate : selectedEndDate;
      const toDate = selectedDate <= selectedEndDate ? selectedEndDate : selectedDate;
      result = await ReservationTableService.getReservationsByDateRange(
        fromDate,
        toDate,
        true,
      );
    } else if (filterMode === "cliente") {
      // Obtener todas las reservas y filtrar por nombre/teléfono
      result = await ReservationTableService.getAllReservations(true);
    } else {
      result = { success: false, error: "Modo de filtro inválido" };
    }

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
    if (filterMode === "cliente" && searchClientTerm.trim()) {
      const term = searchClientTerm.trim().toLowerCase();
      loaded = loaded.filter((reservation) => {
        const userName = String(reservation.userName || "").toLowerCase();
        const userPhone = String(reservation.userPhone || "").toLowerCase();
        return userName.includes(term) || userPhone.includes(term);
      });
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
    if (filterMode !== "cliente") {
      setSearchClientTerm("");
    }
  }, [selectedDate, selectedEndDate, filterMode, selectedShift, statusFilter, searchClientTerm]);

  useEffect(() => {
    const loadUsers = async () => {
      const result = await UserService.getAllUsers();
      if (result.success) {
        setUsers(result.users || []);
      }
    };
    const loadTables = async () => {
      const result = await TableService.getAllTables();
      if (result.success) {
        const map = {};
        (result.tables || []).forEach((table) => {
          map[table.id] = table.tableNumber || table.number || table.id;
        });
        setTablesById(map);
        setAllTables(result.tables || []);
      } else {
        console.error("Error cargando mesas:", result.error);
      }
    };
    loadUsers();
    loadTables();
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
    setSearchPhone("");
  };

  const totalPeopleInReservations = useMemo(() => {
    return reservations.reduce((acc, reservation) => {
      return acc + Number(reservation.peopleCount || reservation.numberOfPeople || 0);
    }, 0);
  }, [reservations]);

  const availableSeats = useMemo(() => {
    return availableTablesByShift.reduce((acc, table) => {
      return acc + Number(table.capacity || 0);
    }, 0);
  }, [availableTablesByShift]);

  const aforo = useMemo(() => {
    return allTables.reduce((acc, table) => {
      return acc + (table.available === false ? 0 : Number(table.capacity || 0));
    }, 0);
  }, [allTables]);

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

    const name = selectedUser ? selectedUser.name || "" : manualName.trim();
    const phone = selectedUser ? selectedUser.phone || "" : manualPhone.trim();

    if (!name || !phone) {
      toastError("El nombre y el teléfono son obligatorios.");
      setFormLoading(false);
      return;
    }
    if (!formState.date || !formState.time) {
      toastError("Fecha y hora son obligatorias.");
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
          toastSuccess("Reserva actualizada correctamente.");
          const updatedReservations = await loadReservations();
          await refreshSelectedReservation(updatedReservations);
        } else {
          toastError(result.error || "Error actualizando la reserva.");
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
          toastSuccess("Reserva creada correctamente.");
          resetForm();
          await loadReservations();
        } else {
          toastError(result.error || "Error creando la reserva.");
        }
      }
    } catch (error) {
      console.error("Error guardando reserva:", error);
      toastError(error.message || "Error inesperado.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleReservationStatusChange = async (reservationId, nextStatus) => {
    const result = await ReservationTableService.updateReservation(reservationId, {
      status: nextStatus,
    });
    if (result.success) {
      toastSuccess("Estado de reserva actualizado.");
      const updatedReservations = await loadReservations();
      await refreshSelectedReservation(updatedReservations);
    } else {
      toastError(result.error || "No se pudo actualizar el estado.");
    }
  };

  const handleAssignTables = async () => {
    if (!selectedReservation) {
      return;
    }
    setAssignmentLoading(true);

    const result = await ReservationTableService.assignTablesToReservation(
      selectedReservation.id,
      selectedTableIds,
    );

    if (result.success) {
      toastSuccess("Mesas asignadas correctamente.");
      const updatedReservations = await loadReservations();
      await refreshSelectedReservation(updatedReservations);
    } else {
      toastError(result.error || "No se pudieron asignar mesas.");
    }
    setAssignmentLoading(false);
  };

  const handleUnassignTables = async () => {
    if (!selectedReservation) {
      return;
    }
    setAssignmentLoading(true);

    const result = await ReservationTableService.unassignTablesFromReservation(
      selectedReservation.id,
    );

    if (result.success) {
      toastSuccess("Mesas desasignadas correctamente.");
      const updatedReservations = await loadReservations();
      await refreshSelectedReservation(updatedReservations);
    } else {
      toastError(result.error || "No se pudieron desasignar mesas.");
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
    <div className="admin-reservations">
      <header className="admin-reservations-header">
        <div>
          <h1 className="admin-reservations-title">Administración de reservas</h1>
          <p className="admin-reservations-subtitle">
            Gestiona reservas, actualiza estados y asigna mesas desde una vista unificada.
          </p>
        </div>
      </header>

      <div className="admin-reservations-grid">
        <section className="admin-reservations-panel">
          <div className="admin-reservations-panel-title">Filtros</div>
          <div className="admin-reservations-filters-grid">
            <label className="admin-reservations-field-label">
              Filtrar por
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                className="admin-reservations-input"
              >
                <option value="turno">Turno</option>
                <option value="dia">Día</option>
                <option value="rango">Rango de fechas</option>
                <option value="cliente">Nombre/Teléfono del cliente</option>
              </select>
            </label>
            {filterMode !== "cliente" ? (
              <label className="admin-reservations-field-label">
                Fecha inicio
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="admin-reservations-input"
                />
              </label>
            ) : null}
            {filterMode === "rango" ? (
              <label className="admin-reservations-field-label">
                Fecha fin
                <input
                  type="date"
                  value={selectedEndDate}
                  onChange={(e) => setSelectedEndDate(e.target.value)}
                  className="admin-reservations-input"
                />
              </label>
            ) : null}
            {filterMode === "turno" ? (
              <label className="admin-reservations-field-label">
                Turno
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="admin-reservations-input"
                >
                  <option value={RESERVATION_SHIFTS.COMIDA}>Comida</option>
                  <option value={RESERVATION_SHIFTS.CENA}>Cena</option>
                </select>
              </label>
            ) : null}
            {filterMode === "cliente" ? (
              <label className="admin-reservations-field-label">
                Buscar por nombre o teléfono
                <input
                  type="text"
                  value={searchClientTerm}
                  onChange={(e) => setSearchClientTerm(e.target.value)}
                  placeholder="Ej. Juan García / +34 600 123 456"
                  className="admin-reservations-input"
                />
              </label>
            ) : null}
            <label className="admin-reservations-field-label">
              Estado
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-reservations-input"
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

        <section className="admin-reservations-panel">
          <div className="admin-reservations-panel-header-row">
            <div className="admin-reservations-panel-title">Listado de reservas</div>
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
            <div className="admin-reservations-info-text">Cargando reservas...</div>
          ) : reservationError ? (
            <div className="admin-reservations-error-text">{reservationError}</div>
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
                    const normalized = normalizeReservationWithTables(reservation);
                    return (
                      <tr key={reservation.id}>
                        <td>{normalized.userName || "Cliente"}</td>
                        <td>{normalized.userPhone || "--"}</td>
                        <td>{normalized.date}</td>
                        <td>{normalized.time}</td>
                        <td>{normalized.shift === RESERVATION_SHIFTS.CENA ? "Cena" : normalized.shift === RESERVATION_SHIFTS.COMIDA ? "Comida" : "—"}</td>
                        <td>{normalized.peopleCount}</td>
                        <td>
                          <select
                            value={normalized.status}
                            onChange={(e) => handleReservationStatusChange(reservation.id, e.target.value)}
                            className="admin-reservations-status-select"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>{normalized.tableNumbers.length > 0 ? normalized.tableNumbers.join(", ") : "Sin mesas"}</td>
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

        <section className="admin-reservations-panel">
          <div className="admin-reservations-panel-title">{selectedReservation ? "Editar reserva" : "Crear nueva reserva"}</div>
          <form noValidate onSubmit={handleSaveReservation} className="admin-reservations-form">
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
                        className="admin-reservations-search-result"
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <strong style={{ fontSize: 14, color: "#222" }}>{user.name || user.displayName || user.email}</strong>
                          <div style={{ display: "flex", gap: 12, fontSize: 13, color: "#666" }}>
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
                    <div style={{ fontSize: 12, marginTop: 6, color: "#888" }}>Puedes crear la reserva manualmente con nombre y teléfono.</div>
                  </div>
                )}
              </div>
            )}

            <div className="admin-reservations-field-row">
              <label className="admin-reservations-field-label">
                Nombre del cliente
                <input
                  type="text"
                  value={selectedUser ? selectedUser.name || selectedUser.displayName || "" : manualName}
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
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedUser.name || selectedUser.displayName || selectedUser.email}</div>
                  <div style={{ fontSize: 13, color: "#555" }}>Teléfono: {selectedUser.phone}</div>
                  <div style={{ fontSize: 13, color: "#666" }}>Email: {selectedUser.email}</div>
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
                  onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                  className="admin-reservations-input"
                />
              </label>
              <label className="admin-reservations-field-label">
                Hora
                <select
                  value={formState.time}
                  onChange={(e) => setFormState({ ...formState, time: e.target.value })}
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
                  onChange={(e) => setFormState({ ...formState, peopleCount: Number(e.target.value) })}
                  className="admin-reservations-input"
                />
              </label>
              <label className="admin-reservations-field-label">
                Estado
                <select
                  value={formState.status}
                  onChange={(e) => setFormState({ ...formState, status: e.target.value })}
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
                onChange={(e) => setFormState({ ...formState, specialRequests: e.target.value })}
                className="admin-reservations-input admin-reservations-textarea"
              />
            </label>

            <div className="admin-reservations-button-row">
              <button type="submit" className="admin-reservations-primary-button" disabled={formLoading}>
                {selectedReservation ? "Guardar cambios" : "Crear reserva"}
              </button>
              <button type="button" className="admin-reservations-secondary-button" onClick={resetForm} disabled={formLoading}>
                Limpiar
              </button>
            </div>
          </form>
        </section>

        <section className="admin-reservations-panel">
          <div className="admin-reservations-panel-title">Asignar mesas</div>
          {selectedReservation ? (
            <>
              <div className="admin-reservations-info-section">
                <strong>Reserva:</strong> {selectedReservation.userName || "Cliente"} — {selectedReservation.date} {selectedReservation.time}
              </div>
              <div className="admin-reservations-info-section">
                <strong>Mesas asignadas:</strong>{" "}
                {activeAssignedTableIds.length > 0 ? activeAssignedTableIds.join(", ") : "Sin mesas asignadas"}
              </div>
              <div className="admin-reservations-spaced-block">
                <div className="admin-reservations-subheader">Mesas disponibles</div>
                {availableTables.length === 0 ? (
                  <div className="admin-reservations-empty">No hay mesas disponibles para esta fecha/hora.</div>
                ) : (
                  <>
                    {/* Sugerencia automática */}
                    {formState.peopleCount && availableTables.length > 0 && (
                      <div className="admin-reservations-info-section admin-reservations-suggestion">
                        <strong>Sugerencia:</strong> {formState.peopleCount} {formState.peopleCount === 1 ? "persona" : "personas"} —
                        {availableTables.filter(t => t.capacity >= formState.peopleCount).length > 0
                          ? ` Selecciona una mesa con capacidad ≥ ${formState.peopleCount} o fusiona varias.`
                          : " No hay mesa individual que cubra. Considera fusionar varias."}
                      </div>
                    )}
                    
                    <div className="admin-reservations-table-grid">
                      {availableTables
                        .sort((a, b) => {
                          // Ordenar: primero las recomendadas (capacity >= peopleCount), luego otras
                          const aRecommended = a.capacity >= formState.peopleCount;
                          const bRecommended = b.capacity >= formState.peopleCount;
                          if (aRecommended !== bRecommended) {
                            return bRecommended ? 1 : -1;
                          }
                          return (a.number || a.tableNumber || 0) - (b.number || b.tableNumber || 0);
                        })
                        .map((table) => {
                          const isRecommended = table.capacity >= formState.peopleCount;
                          return (
                            <label 
                              key={table.id} 
                              className={`admin-reservations-table-card${selectedTableIds.includes(table.id) ? " selected" : ""}`}
                              style={{
                                borderColor: selectedTableIds.includes(table.id) ? "#2563eb" : isRecommended ? "#10b981" : "#d1d5db",
                                borderWidth: "2px",
                                backgroundColor: selectedTableIds.includes(table.id) ? "#eff6ff" : isRecommended ? "#ecfdf5" : "white",
                                color: selectedTableIds.includes(table.id) ? "#1e3a8a" : "#111827",
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="checkbox"
                                className="admin-reservations-table-checkbox"
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
                                <strong style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  Mesa {table.number || table.tableNumber || table.id}
                                  {isRecommended && <span style={{ fontSize: 14, color: "#10b981" }}>Recomendada</span>}
                                </strong>
                              </div>
                              <div style={{ fontSize: 13, color: "#6b7280" }}>
                                Capacidad: <strong>{table.capacity || "-"}</strong> pax
                              </div>
                              {isRecommended && (
                                <div style={{ fontSize: 12, color: "#10b981", marginTop: 6 }}>
                                  Cubre {formState.peopleCount} {formState.peopleCount === 1 ? "persona" : "personas"}
                                </div>
                              )}
                            </label>
                          );
                        })}
                    </div>
                  </>
                )}
              </div>
              <div className="admin-reservations-button-row">
                <button
                  type="button"
                  onClick={handleAssignTables}
                  disabled={assignmentLoading || selectedTableIds.length === 0}
                  className="admin-reservations-primary-button"
                >
                  {assignmentLoading ? "Guardando..." : "Asignar mesas"}
                </button>
                <button
                  type="button"
                  onClick={handleUnassignTables}
                  disabled={assignmentLoading || activeAssignedTableIds.length === 0}
                  className="admin-reservations-secondary-button"
                >
                  Desasignar todas
                </button>
              </div>
            </>
          ) : (
            <div className="admin-reservations-empty">Selecciona una reserva para administrar las mesas asignadas.</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminReservationsView;

