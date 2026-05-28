import React, { useState, useEffect } from "react";
import tableService from "../../services/TableService";
import { toastError } from "../../services/ToastService";

const TableForm = ({ isOpen, onClose, onSave, editingTable = null }) => {
  const [formData, setFormData] = useState({
    number: "",
    capacity: "",
    available: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (editingTable) {
      const currentNumber =
        editingTable.tableNumber !== undefined && editingTable.tableNumber !== null
          ? String(editingTable.tableNumber)
          : editingTable.number !== undefined && editingTable.number !== null
          ? String(editingTable.number)
          : "";

      setFormData({
        number: currentNumber,
        capacity:
          editingTable.capacity !== undefined && editingTable.capacity !== null
            ? String(editingTable.capacity)
            : "",
        available: editingTable.available !== false,
      });
      setErrors({});
    } else {
      setFormData({
        number: "",
        capacity: "",
        available: true,
      });
      setErrors({});
    }
  }, [editingTable, isOpen]);

  useEffect(() => {
    Object.values(errors).forEach((message) => {
      if (message) {
        toastError(message);
      }
    });
  }, [errors]);

  const validateForm = async () => {
    const newErrors = {};
    const numberValue = String(formData.number || "").trim();
    const capacityValue = String(formData.capacity || "").trim();

    // Validar número
    if (!numberValue) {
      newErrors.number = "El número de mesa es requerido";
    } else if (isNaN(numberValue)) {
      newErrors.number = "El número debe ser numérico";
    } else {
      const parsedNumber = parseInt(numberValue, 10);
      const currentTableNumber = editingTable
        ? Number(editingTable.tableNumber ?? editingTable.number)
        : null;

      // Validar unicidad si es nueva mesa o cambia el número al editar
      if (!editingTable || parsedNumber !== currentTableNumber) {
        const existing = await tableService.getTableByNumber(parsedNumber);
        if (existing.table) {
          newErrors.number = `Mesa #${numberValue} ya existe`;
        }
      }
    }

    // Validar capacidad
    if (!capacityValue) {
      newErrors.capacity = "La capacidad es requerida";
    } else if (isNaN(capacityValue) || parseInt(capacityValue, 10) <= 0) {
      newErrors.capacity = "La capacidad debe ser mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) return;

    try {
      setLoading(true);
      const parsedNumber = parseInt(String(formData.number || ""), 10);
      const parsedCapacity = parseInt(String(formData.capacity || ""), 10);
      const tableData = {
        number: parsedNumber,
        tableNumber: parsedNumber,
        capacity: parsedCapacity,
        available: formData.available,
      };

      const result = editingTable
        ? await tableService.updateTable(editingTable.id, tableData)
        : await tableService.createTableWithValidation(tableData);

      if (!result.success) {
        setErrors({ submit: result.error || "Error guardando mesa" });
        return;
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error guardando mesa:", error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="table-form-overlay">
      <div className="table-form-modal">
        <div className="table-form-header">
          <h2 className="table-form-title">
            {editingTable ? "Editar Mesa" : "Nueva Mesa"}
          </h2>
          <button
            onClick={onClose}
            className="table-form-close"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form noValidate onSubmit={handleSubmit} className="table-form-body">
          <div className="table-form-group">
            <label className="table-form-label">
              Número de Mesa <span className="table-form-required">*</span>
            </label>
            <input
              type="number"
              value={formData.number}
              onChange={(e) =>
                setFormData({ ...formData, number: e.target.value })
              }
              className={`table-form-input ${errors.number ? "has-error" : ""}`}
              placeholder="Ej: 1, 2, 3..."
              disabled={loading}
            />
          </div>

          <div className="table-form-group">
            <label className="table-form-label">
              Capacidad (personas) <span className="table-form-required">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: e.target.value })
              }
              className={`table-form-input ${errors.capacity ? "has-error" : ""}`}
              placeholder="Ej: 2, 4, 6..."
              disabled={loading}
            />
          </div>

          <div className="table-form-group">
            <label className="table-form-checkbox-label">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) =>
                  setFormData({ ...formData, available: e.target.checked })
                }
                className="table-form-checkbox"
                disabled={loading}
              />
              <span>Mesa disponible</span>
            </label>
          </div>

          <div className="table-form-actions">
            <button
              type="button"
              onClick={onClose}
              className="table-form-cancel"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="table-form-submit"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar Mesa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableForm;
