import React, { useState } from "react";
import { toastSuccess, toastError } from "../../services/ToastService";
import tableService from "../../services/TableService";

const TableList = ({ tables, loading, onTableEdit, onTableDelete, onTableCreate }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteTable, setConfirmDeleteTable] = useState(null);

  const handleDeleteClick = async (table) => {
    try {
      setDeletingId(table.id);
      const canDelete = await tableService.canDeleteTable(table.id);

      if (!canDelete) {
        toastError("No se puede eliminar esta mesa. Tiene reservas futuras asignadas.");
        setDeletingId(null);
        return;
      }

      setConfirmDeleteTable(table);
      setDeletingId(null);
    } catch (error) {
      console.error("Error al eliminar mesa:", error);
      toastError("Error al eliminar: " + error.message);
      setDeletingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteTable?.id) {
      toastError("No se pudo identificar la mesa a eliminar.");
      return;
    }

    try {
      setDeletingId(confirmDeleteTable.id);
      await tableService.deleteTable(confirmDeleteTable.id);
      toastSuccess("Mesa eliminada correctamente");
      onTableDelete();
    } catch (error) {
      console.error("Error al eliminar mesa:", error);
      toastError("Error al eliminar: " + error.message);
    } finally {
      setDeletingId(null);
      setConfirmDeleteTable(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteTable(null);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingMessage}>Cargando mesas...</div>
      </div>
    );
  }

  if (!tables || tables.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyMessage}>
          <p>No hay mesas registradas</p>
          <button onClick={onTableCreate} style={styles.btnCreateEmpty}>
            + Crear primera mesa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Mesas Registradas ({tables.length})</h3>
        <button onClick={onTableCreate} style={styles.btnCreate}>
          + Nueva Mesa
        </button>
      </div>

      {confirmDeleteTable && (
        <div style={styles.confirmBox}>
          <div style={styles.confirmText}>
            ¿Eliminar mesa #{confirmDeleteTable.tableNumber ?? confirmDeleteTable.number}?
            <span style={styles.confirmMeta}>
              Capacidad: {confirmDeleteTable.capacity} personas
            </span>
          </div>
          <div style={styles.confirmActions}>
            <button
              onClick={handleConfirmDelete}
              style={styles.btnConfirm}
              disabled={deletingId === confirmDeleteTable.id}
            >
              {deletingId === confirmDeleteTable.id ? "Eliminando..." : "Confirmar"}
            </button>
            <button onClick={handleCancelDelete} style={styles.btnCancel}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Mesa #</th>
              <th style={styles.th}>Capacidad</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table) => (
              <tr
                key={table.id}
                style={{
                  ...styles.row,
                  opacity: table.available ? 1 : 0.6,
                }}
              >
                <td style={styles.td}>
                  <span style={styles.tableNumber}>#{table.tableNumber ?? table.number}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.capacity}>{table.capacity} pax</span>
                </td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: table.available ? "#d1fae5" : "#fee2e2",
                      color: table.available ? "#065f46" : "#7f1d1d",
                    }}
                  >
                    {table.available ? "✓ Disponible" : "✗ Inactiva"}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.actions}>
                    <button
                      onClick={() => onTableEdit(table)}
                      style={styles.btnEdit}
                      title="Editar mesa"
                    >
                      ✎ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(table)}
                      style={styles.btnDelete}
                      disabled={deletingId === table.id}
                      title="Eliminar mesa"
                    >
                      {deletingId === table.id ? "..." : "🗑 Eliminar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid #e5e7eb",
  },
  title: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
  },
  btnCreate: {
    padding: "8px 16px",
    backgroundColor: "#059669",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnCreateEmpty: {
    padding: "10px 20px",
    backgroundColor: "#059669",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "12px",
  },
  loadingMessage: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#6b7280",
    fontSize: "14px",
  },
  emptyMessage: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#6b7280",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  headerRow: {
    backgroundColor: "#f9fafb",
    borderBottom: "2px solid #e5e7eb",
  },
  th: {
    padding: "12px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
  },
  row: {
    borderBottom: "1px solid #e5e7eb",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "12px",
    fontSize: "14px",
    color: "#374151",
  },
  tableNumber: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1f2937",
  },
  capacity: {
    fontSize: "14px",
    color: "#374151",
  },
  badge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  confirmBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  confirmText: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: "600",
  },
  confirmMeta: {
    display: "block",
    color: "#475569",
    fontSize: "13px",
    fontWeight: "400",
    marginTop: "4px",
  },
  confirmActions: {
    display: "flex",
    gap: "10px",
  },
  btnConfirm: {
    backgroundColor: "#059669",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 18px",
    fontSize: "14px",
    cursor: "pointer",
  },
  btnCancel: {
    backgroundColor: "#f1f5f9",
    color: "#334155",
    border: "none",
    borderRadius: "8px",
    padding: "10px 18px",
    fontSize: "14px",
    cursor: "pointer",
  },
  btnEdit: {
    padding: "6px 12px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnDelete: {
    padding: "6px 12px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

export default TableList;