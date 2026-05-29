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
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {editingTable ? "Editar Mesa" : "Nueva Mesa"}
          </h2>
          <button
            onClick={onClose}
            style={styles.closeBtn}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form noValidate onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Número de Mesa <span style={styles.required}>*</span>
            </label>
            <input
              type="number"
              value={formData.number}
              onChange={(e) =>
                setFormData({ ...formData, number: e.target.value })
              }
              style={{
                ...styles.input,
                borderColor: errors.number ? "#dc2626" : "#d1d5db",
              }}
              placeholder="Ej: 1, 2, 3..."
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Capacidad (personas) <span style={styles.required}>*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: e.target.value })
              }
              style={{
                ...styles.input,
                borderColor: errors.capacity ? "#dc2626" : "#d1d5db",
              }}
              placeholder="Ej: 2, 4, 6..."
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) =>
                  setFormData({ ...formData, available: e.target.checked })
                }
                style={styles.checkbox}
                disabled={loading}
              />
              <span>Mesa disponible</span>
            </label>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={styles.btnCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={styles.btnSubmit}
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

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    maxWidth: "500px",
    width: "90%",
    padding: "24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "12px",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
    color: "#1f2937",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#6b7280",
    padding: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },
  required: {
    color: "#dc2626",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  errorText: {
    fontSize: "12px",
    color: "#dc2626",
    margin: 0,
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#374151",
    cursor: "pointer",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  actions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "20px",
    paddingTop: "12px",
    borderTop: "1px solid #e5e7eb",
  },
  btnCancel: {
    padding: "10px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    backgroundColor: "white",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnSubmit: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#059669",
    color: "white",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

export default TableForm;
