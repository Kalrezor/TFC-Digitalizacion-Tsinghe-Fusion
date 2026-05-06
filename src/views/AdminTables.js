// Vista: AdminTables.js
// Gestion grafica de las 20 mesas del restaurante para administradores.
// Importaciones corregidas desde models/ (no services/).
// Sin errores de sintaxis en template literals.

import React, { useState, useEffect } from "react";
import tableService from "../models/TableService";
import "../styles/ChineseStyle.css";

const TOTAL_TABLES = 20;
const CAPACITIES = [2, 4, 6, 8, 10, 12];

// Genera la estructura base de las 20 mesas si Firestore aun no las tiene
const buildDisplayTables = (firestoreTables) => {
  const result = [];
  for (let i = 1; i <= TOTAL_TABLES; i++) {
    const found = firestoreTables.find((t) => t.tableNumber === i || t.number === i);
    result.push(
      found
        ? found
        : { id: null, tableNumber: i, number: i, capacity: 4, active: true, available: true }
    );
  }
  return result;
};

const AdminTables = () => {
  const [tables, setTables]           = useState([]);
  const [display, setDisplay]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [success, setSuccess]         = useState(null);
  const [selected, setSelected]       = useState(null); // mesa seleccionada para panel detalle

  // Carga inicial
  useEffect(() => { loadTables(); }, []);

  const loadTables = async () => {
    setLoading(true);
    setError(null);
    const result = await tableService.getAllTables();
    setLoading(false);
    if (result.success) {
      setTables(result.tables);
      setDisplay(buildDisplayTables(result.tables));
    } else {
      setError("Error al cargar mesas: " + result.error);
    }
  };

  // Alternar activo/inactivo de una mesa
  const handleToggle = async (table) => {
    setError(null);
    setSuccess(null);

    if (!table.id) {
      // La mesa no existe en Firestore todavia, crearla
      const newTable = {
        tableNumber: table.tableNumber,
        number:      table.tableNumber,
        capacity:    table.capacity || 4,
        active:      false,   // la desactivamos porque el usuario hizo click en "ocupar"
        available:   false,
      };
      const result = await tableService.createTable(newTable);
      if (result.success) { setSuccess("Mesa " + table.tableNumber + " guardada y desactivada."); loadTables(); }
      else setError("Error al crear mesa: " + result.error);
      return;
    }

    const newActive = !(table.active !== false);
    const result = await tableService.updateTable(table.id, { active: newActive, available: newActive });
    if (result.success) {
      setSuccess("Mesa " + table.tableNumber + " actualizada.");
      loadTables();
      if (selected && selected.tableNumber === table.tableNumber) setSelected(null);
    } else {
      setError("Error al actualizar mesa: " + result.error);
    }
  };

  // Cambiar capacidad desde el panel de detalle
  const handleCapacity = async (table, newCap) => {
    if (!table.id) {
      setError("Guarda primero la mesa antes de cambiar su capacidad.");
      return;
    }
    const result = await tableService.updateTable(table.id, { capacity: parseInt(newCap) });
    if (result.success) { setSuccess("Capacidad actualizada."); loadTables(); }
    else setError("Error al actualizar capacidad: " + result.error);
  };

  // Estadisticas
  const activeCount    = display.filter((t) => t.active !== false).length;
  const inactiveCount  = TOTAL_TABLES - activeCount;
  const totalCapacity  = display.reduce((s, t) => s + (t.capacity || 4), 0);

  return (
    <div style={{ padding: "20px" }}>

      {/* Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ color: "#DC143C", margin: 0 }}>Administracion de Mesas</h1>
        <button onClick={loadTables} disabled={loading} style={btnPrimary}>
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {/* Mensajes */}
      {error   && <div style={alertError}>{error}</div>}
      {success && <div style={alertSuccess}>{success}</div>}

      {/* Estadisticas */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        {[
          { label: "Mesas Activas",   value: activeCount,   color: "#4CAF50" },
          { label: "Mesas Inactivas", value: inactiveCount, color: "#f44336" },
          { label: "Capacidad Total", value: totalCapacity, color: "#DC143C" },
        ].map((s) => (
          <div key={s.label} style={{ ...statBox, borderColor: s.color }}>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#555" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Grid de mesas */}
      {loading && <p style={{ color: "#DC143C" }}>Cargando mesas...</p>}

      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px", marginBottom: "24px" }}>
          {display.map((table) => {
            const isActive = table.active !== false;
            const isSelected = selected && selected.tableNumber === table.tableNumber;
            return (
              <div
                key={table.tableNumber}
                onClick={() => setSelected(isSelected ? null : table)}
                style={{
                  background:    isActive ? "#4CAF50" : "#f44336",
                  color:         "#fff",
                  borderRadius:  "10px",
                  padding:       "16px 10px",
                  textAlign:     "center",
                  cursor:        "pointer",
                  border:        isSelected ? "3px solid #FFD700" : "3px solid transparent",
                  boxShadow:     isSelected ? "0 0 12px rgba(255,215,0,0.6)" : "0 2px 6px rgba(0,0,0,0.15)",
                  transition:    "all 0.2s",
                  userSelect:    "none",
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>Mesa {table.tableNumber}</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>{table.capacity || 4} personas</div>
                <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.9 }}>
                  {isActive ? "Activa" : "Inactiva"}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(table); }}
                  style={{
                    marginTop:       "10px",
                    background:      "rgba(255,255,255,0.25)",
                    border:          "1px solid rgba(255,255,255,0.6)",
                    color:           "#fff",
                    padding:         "4px 10px",
                    borderRadius:    "6px",
                    cursor:          "pointer",
                    fontSize:        "11px",
                    fontWeight:      "bold",
                    width:           "100%",
                  }}
                >
                  {isActive ? "Desactivar" : "Activar"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Leyenda */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "20px", height: "20px", background: "#4CAF50", borderRadius: "4px" }}></div>
          <span style={{ fontSize: "13px" }}>Mesa activa (disponible)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "20px", height: "20px", background: "#f44336", borderRadius: "4px" }}></div>
          <span style={{ fontSize: "13px" }}>Mesa inactiva / ocupada</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "20px", height: "20px", background: "#FFD700", borderRadius: "4px", border: "2px solid #8B0000" }}></div>
          <span style={{ fontSize: "13px" }}>Seleccionada</span>
        </div>
      </div>

      {/* Panel de detalle */}
      {selected && (
        <div style={{ background: "#fff8f0", border: "2px solid #DC143C", borderRadius: "10px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ color: "#DC143C", margin: 0 }}>Detalle - Mesa {selected.tableNumber}</h2>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#555" }}>x</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Estado actual</label>
              <p style={{ margin: "4px 0", fontWeight: "bold", color: selected.active !== false ? "#4CAF50" : "#f44336" }}>
                {selected.active !== false ? "Activa" : "Inactiva"}
              </p>
              <button
                onClick={() => handleToggle(selected)}
                style={{ ...btnPrimary, background: selected.active !== false ? "#f44336" : "#4CAF50", marginTop: "8px" }}
              >
                {selected.active !== false ? "Marcar como Inactiva" : "Marcar como Activa"}
              </button>
            </div>

            <div>
              <label style={labelStyle}>Capacidad de personas</label>
              <select
                value={selected.capacity || 4}
                onChange={(e) => handleCapacity(selected, e.target.value)}
                style={{ ...inputStyle, marginTop: "4px" }}
              >
                {CAPACITIES.map((c) => (
                  <option key={c} value={c}>{c} personas</option>
                ))}
              </select>
            </div>

            {selected.id && (
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>ID en Firestore</label>
                <code style={{ fontSize: "12px", color: "#555" }}>{selected.id}</code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos reutilizables
const labelStyle   = { display: "block", color: "#8B0000", fontWeight: "bold", marginBottom: "4px", fontSize: "13px" };
const inputStyle   = { width: "100%", padding: "10px", border: "2px solid #FFD700", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" };
const btnPrimary   = { backgroundColor: "#DC143C", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const statBox      = { background: "#fff", border: "2px solid #DC143C", borderRadius: "8px", padding: "16px 24px", textAlign: "center", minWidth: "110px" };
const alertError   = { background: "#ffe0e0", border: "1px solid #DC143C", padding: "10px", borderRadius: "6px", marginBottom: "12px", color: "#8B0000" };
const alertSuccess = { background: "#e0ffe0", border: "1px solid #4CAF50", padding: "10px", borderRadius: "6px", marginBottom: "12px", color: "#2e7d32" };

export default AdminTables;
