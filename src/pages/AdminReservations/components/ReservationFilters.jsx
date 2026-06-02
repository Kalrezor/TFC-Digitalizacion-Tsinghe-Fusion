import React from "react";
import { RESERVATION_SHIFTS } from "../../../services/ReservationTableService";

const ReservationFilters = ({
  filterMode,
  setFilterMode,
  selectedDate,
  setSelectedDate,
  selectedEndDate,
  setSelectedEndDate,
  selectedShift,
  setSelectedShift,
  searchClientTerm,
  setSearchClientTerm,
  statusFilter,
  setStatusFilter,
  statusOptions,
}) => {
  return (
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
  );
};

export default ReservationFilters;
