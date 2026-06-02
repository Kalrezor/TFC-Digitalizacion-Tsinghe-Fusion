import React, { useState } from "react";
import useTables from "../../hooks/useTables";
import TableList from "./TableList";
import TableForm from "./TableForm";
import TableAvailabilityPanel from "./TableAvailabilityPanel";

const TablesManagementView = () => {
  const {
    tables,
    loading: tablesLoading,
    error: tablesError,
    refetch: refetchTables,
  } = useTables();

  // Estado para filtros de disponibilidad
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Formato YYYY-MM-DD
  });
  const [selectedShift, setSelectedShift] = useState("comida");

  // Estado para el modal de formulario
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  // Manejar creación de mesa
  const handleTableCreate = () => {
    setEditingTable(null);
    setShowForm(true);
  };

  // Manejar edición de mesa
  const handleTableEdit = (table) => {
    setEditingTable(table);
    setShowForm(true);
  };

  // Manejar eliminación de mesa
  const handleTableDelete = () => {
    refetchTables(); // Recargar lista después de eliminar
  };

  // Manejar guardar (crear/editar)
  const handleFormSave = () => {
    refetchTables(); // Recargar lista después de guardar
    setShowForm(false);
    setEditingTable(null);
  };

  // Manejar cerrar modal
  const handleFormClose = () => {
    setShowForm(false);
    setEditingTable(null);
  };

  // Formatear fecha para display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="tables-management">
      <div className="tables-management-header">
        <h1 className="tables-management-title">Gestión de Mesas</h1>
        <p className="tables-management-subtitle">
          Administra las mesas del restaurante y visualiza su disponibilidad
        </p>
      </div>

      {/* Filtros de fecha y turno */}
      <div className="tables-management-filters">
        <div className="tables-management-filter-group">
          <label className="tables-management-filter-label">Fecha:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="tables-management-date-input"
          />
        </div>
        <div className="tables-management-filter-group">
          <label className="tables-management-filter-label">Turno:</label>
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="tables-management-select-input"
          >
            <option value="comida">Comida</option>
            <option value="cena">Cena</option>
          </select>
        </div>
        <div className="tables-management-date-display">
          {formatDate(selectedDate)} -{" "}
          {selectedShift === "comida" ? "Comida" : "Cena"}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="tables-management-content">
        {/* Lista de mesas con CRUD */}
        <div className="tables-management-section">
          <TableList
            tables={tables}
            loading={tablesLoading}
            onTableEdit={handleTableEdit}
            onTableDelete={handleTableDelete}
            onTableCreate={handleTableCreate}
          />
        </div>

        {/* Panel de disponibilidad */}
        <div className="tables-management-section">
          <TableAvailabilityPanel
            selectedDate={selectedDate}
            selectedShift={selectedShift}
          />
        </div>
      </div>

      {/* Modal de formulario */}
      <TableForm
        isOpen={showForm}
        onClose={handleFormClose}
        onSave={handleFormSave}
        editingTable={editingTable}
      />

      {/* Error global */}
      {tablesError && (
        <div className="tables-management-error">
          Error cargando mesas: {tablesError}
        </div>
      )}
    </div>
  );
};

export default TablesManagementView;
