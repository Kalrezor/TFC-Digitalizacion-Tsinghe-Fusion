import React, { useState } from "react";
import { toastSuccess, toastError } from "../../services/ToastService";
import tableService from "../../services/TableService";

const TableList = ({
  tables,
  loading,
  onTableEdit,
  onTableDelete,
  onTableCreate,
}) => {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteTable, setConfirmDeleteTable] = useState(null);

  const handleDeleteClick = async (table) => {
    try {
      setDeletingId(table.id);
      const canDelete = await tableService.canDeleteTable(table.id);

      if (!canDelete) {
        toastError(
          "No se puede eliminar esta mesa. Tiene reservas futuras asignadas.",
        );
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
      <div className="table-list">
        <div className="table-list-loading">Cargando mesas...</div>
      </div>
    );
  }

  if (!tables || tables.length === 0) {
    return (
      <div className="table-list">
        <div className="table-list-empty">
          <p>No hay mesas registradas</p>
          <button onClick={onTableCreate} className="table-list-create-empty">
            + Crear primera mesa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="table-list">
      <div className="table-list-header">
        <h3 className="table-list-title">
          Mesas Registradas ({tables.length})
        </h3>
        <button onClick={onTableCreate} className="table-list-create">
          + Nueva Mesa
        </button>
      </div>

      {confirmDeleteTable && (
        <div className="table-list-confirm">
          <div className="table-list-confirm-text">
            ¿Eliminar mesa #
            {confirmDeleteTable.tableNumber ?? confirmDeleteTable.number}?
            <span className="table-list-confirm-meta">
              Capacidad: {confirmDeleteTable.capacity} personas
            </span>
          </div>
          <div className="table-list-confirm-actions">
            <button
              onClick={handleConfirmDelete}
              className="table-list-confirm-button"
              disabled={deletingId === confirmDeleteTable.id}
            >
              {deletingId === confirmDeleteTable.id
                ? "Eliminando..."
                : "Confirmar"}
            </button>
            <button
              onClick={handleCancelDelete}
              className="table-list-cancel-button"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="table-list-wrapper">
        <table className="table-list-table">
          <thead>
            <tr className="table-list-header-row">
              <th className="table-list-th">Mesa #</th>
              <th className="table-list-th">Capacidad</th>
              <th className="table-list-th">Estado</th>
              <th className="table-list-th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table) => (
              <tr
                key={table.id}
                className="table-list-row"
                style={{ opacity: table.available ? 1 : 0.6 }}
              >
                <td className="table-list-td">
                  <span className="table-list-number">
                    #{table.tableNumber ?? table.number}
                  </span>
                </td>
                <td className="table-list-td">
                  <span className="table-list-capacity">
                    {table.capacity} pax
                  </span>
                </td>
                <td className="table-list-td">
                  <span
                    className="table-list-badge"
                    style={{
                      backgroundColor: table.available ? "#d1fae5" : "#fee2e2",
                      color: table.available ? "#065f46" : "#7f1d1d",
                    }}
                  >
                    {table.available ? "✓ Disponible" : "✗ Inactiva"}
                  </span>
                </td>
                <td className="table-list-td">
                  <div className="table-list-actions">
                    <button
                      onClick={() => onTableEdit(table)}
                      className="table-list-edit"
                      title="Editar mesa"
                    >
                      ✎ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(table)}
                      className="table-list-delete"
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

export default TableList;
