import React, { useState } from "react";
import useTables from "../../hooks/useTables";
import TableList from "./TableList";
import TableForm from "./TableForm";
import TableAvailabilityPanel from "./TableAvailabilityPanel";

const TablesManagementView = () => {
  const { tables, loading: tablesLoading, error: tablesError, refetch: refetchTables } = useTables();

  // Estado para filtros de disponibilidad
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
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
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Gestión de Mesas</h1>
        <p style={styles.subtitle}>
          Administra las mesas del restaurante y visualiza su disponibilidad
        </p>
      </div>

      {/* Filtros de fecha y turno */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Fecha:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.dateInput}
          />
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Turno:</label>
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            style={styles.selectInput}
          >
            <option value="comida">Comida</option>
            <option value="cena">Cena</option>
          </select>
        </div>
        <div style={styles.dateDisplay}>
          {formatDate(selectedDate)} - {selectedShift === "comida" ? "Comida" : "Cena"}
        </div>
      </div>

      {/* Contenido principal */}
      <div style={styles.content}>
        {/* Lista de mesas con CRUD */}
        <div style={styles.section}>
          <TableList
            tables={tables}
            loading={tablesLoading}
            onTableEdit={handleTableEdit}
            onTableDelete={handleTableDelete}
            onTableCreate={handleTableCreate}
          />
        </div>

        {/* Panel de disponibilidad */}
        <div style={styles.section}>
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
        <div style={styles.globalError}>
          Error cargando mesas: {tablesError}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  },
  header: {
    marginBottom: "24px",
    textAlign: "center",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
  },
  subtitle: {
    margin: 0,
    fontSize: "16px",
    color: "#6b7280",
  },
  filters: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  filterLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },
  dateInput: {
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
    minWidth: "140px",
  },
  selectInput: {
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
    minWidth: "120px",
    backgroundColor: "white",
  },
  dateDisplay: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    marginLeft: "auto",
  },
  content: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "24px",
  },
  section: {
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  globalError: {
    marginTop: "20px",
    padding: "16px",
    backgroundColor: "#fee2e2",
    color: "#7f1d1d",
    borderRadius: "6px",
    border: "1px solid #fecaca",
    textAlign: "center",
    fontSize: "14px",
  },
};

export default TablesManagementView;