// Vista: AdminMenu.js
// Vista de administracion del menu para usuarios con rol de administrador.
// CRUD completo de platos del menu para administradores.
// Importaciones corregidas desde models/ (no services/).

import React, { useState, useEffect } from "react";
import menuService from "../models/MenuService";
import "../styles/ChineseStyle.css";

const CATEGORIES = ["Entradas", "Platos Principales", "Postres", "Bebidas", "Otros"];

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  allergens: "",
  imageUrl: "",
  available: true,
};

const AdminMenu = () => {
  const [dishes, setDishes]           = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [success, setSuccess]         = useState(null);
  const [searchTerm, setSearchTerm]   = useState("");
  const [filterCat, setFilterCat]     = useState("all");
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [formData, setFormData]       = useState(EMPTY_FORM);

  // Carga inicial
  useEffect(() => { loadDishes(); }, []);

  const loadDishes = async () => {
    setLoading(true);
    setError(null);
    const result = await menuService.getAllMenus();
    setLoading(false);
    if (result.success) {
      setDishes(result.menus);
    } else {
      setError("Error al cargar los platos: " + result.error);
    }
  };

  // Formulario - abrir nuevo
  const openNew = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  // Formulario - abrir edicion
  const openEdit = (dish) => {
    setFormData({
      name:        dish.name        || "",
      description: dish.description || "",
      price:       dish.price       || "",
      category:    dish.category    || "",
      allergens:   dish.allergens   || "",
      imageUrl:    dish.imageUrl    || "",
      available:   dish.available !== false,
    });
    setEditingId(dish.id);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      setError("Nombre y precio son obligatorios.");
      return;
    }
    setLoading(true);
    setError(null);

    const payload = { ...formData, price: parseFloat(formData.price) };
    const result = editingId
      ? await menuService.updateMenu(editingId, payload, true)
      : await menuService.createMenu(payload, true);

    setLoading(false);
    if (result.success) {
      setSuccess(editingId ? "Plato actualizado correctamente." : "Plato creado correctamente.");
      setShowForm(false);
      setFormData(EMPTY_FORM);
      setEditingId(null);
      loadDishes();
    } else {
      setError("Error al guardar: " + result.error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Esta accion es irreversible. Eliminar este plato?")) return;
    setLoading(true);
    const result = await menuService.deleteMenu(id, true);
    setLoading(false);
    if (result.success) { setSuccess("Plato eliminado."); loadDishes(); }
    else setError("Error al eliminar: " + result.error);
  };

  const handleToggle = async (dish) => {
    const result = await menuService.toggleMenuAvailability(dish.id, !dish.available, true);
    if (result.success) loadDishes();
    else setError("Error al cambiar disponibilidad.");
  };

  // Filtros
  const filtered = dishes.filter((d) => {
    const matchSearch =
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCat === "all" || d.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ padding: "20px" }}>

      {/* Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ color: "#DC143C", margin: 0 }}>Administracion de Menu</h1>
        <button onClick={openNew} disabled={loading} style={btnPrimary}>
          + Nuevo Plato
        </button>
      </div>

      {/* Mensajes */}
      {error   && <div style={alertError}>{error}</div>}
      {success && <div style={alertSuccess}>{success}</div>}

      {/* Formulario */}
      {showForm && (
        <div style={{ background: "#fff8f0", border: "2px solid #DC143C", borderRadius: "10px", padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ color: "#DC143C", marginTop: 0 }}>{editingId ? "Editar Plato" : "Nuevo Plato"}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Nombre del Plato *</label>
                <input name="name" value={formData.name} onChange={handleChange}
                  placeholder="Ej: Pato Pekin" required style={inputStyle} />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Descripcion</label>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  rows={3} placeholder="Descripcion del plato..." style={{ ...inputStyle, resize: "vertical" }} />
              </div>

              <div>
                <label style={labelStyle}>Precio (euros) *</label>
                <input name="price" type="number" step="0.01" min="0" value={formData.price}
                  onChange={handleChange} placeholder="0.00" required style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Categoria</label>
                <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
                  <option value="">Seleccionar...</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Alergenos</label>
                <input name="allergens" value={formData.allergens} onChange={handleChange}
                  placeholder="Ej: Gluten, Lacteos" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>URL de Imagen</label>
                <input name="imageUrl" type="url" value={formData.imageUrl} onChange={handleChange}
                  placeholder="https://..." style={inputStyle} />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input name="available" type="checkbox" checked={formData.available}
                  onChange={handleChange} id="chk-available" />
                <label htmlFor="chk-available" style={{ color: "#8B0000", fontWeight: "bold" }}>
                  Disponible en carta
                </label>
              </div>
            </div>

            <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
              <button type="submit" disabled={loading} style={btnPrimary}>
                {loading ? "Guardando..." : "Guardar"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} style={btnSecondary}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar plato..." style={{ ...inputStyle, maxWidth: "260px" }} />
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={{ ...inputStyle, maxWidth: "200px" }}>
          <option value="all">Todas las categorias</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Estadisticas */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { label: "Total Platos", value: dishes.length },
          { label: "Disponibles", value: dishes.filter((d) => d.available).length },
          { label: "No disponibles", value: dishes.filter((d) => !d.available).length },
        ].map((s) => (
          <div key={s.label} style={statBox}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#DC143C" }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#555" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && <p style={{ color: "#DC143C" }}>Cargando...</p>}

      {/* Sin resultados */}
      {!loading && filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "#888", padding: "30px" }}>
          No hay platos que coincidan.
        </p>
      )}

      {/* Tabla de platos */}
      {!loading && filtered.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#DC143C", color: "#fff" }}>
                {["Nombre", "Categoria", "Precio", "Alergenos", "Disponible", "Acciones"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((dish, i) => (
                <tr key={dish.id} style={{ background: i % 2 === 0 ? "#fff" : "#fff8f0", borderBottom: "1px solid #eee" }}>
                  <td style={td}><strong>{dish.name}</strong></td>
                  <td style={td}>{dish.category || "Sin categoria"}</td>
                  <td style={td}>{parseFloat(dish.price || 0).toFixed(2)} euros</td>
                  <td style={td}>{dish.allergens || "Ninguno"}</td>
                  <td style={td}>
                    <button onClick={() => handleToggle(dish)}
                      style={{ background: dish.available ? "#4CAF50" : "#f44336", color: "#fff", border: "none", padding: "4px 12px", borderRadius: "12px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
                      {dish.available ? "Si" : "No"}
                    </button>
                  </td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>
                    <button onClick={() => openEdit(dish)} style={{ ...btnEdit, marginRight: "8px" }}>Editar</button>
                    <button onClick={() => handleDelete(dish.id)} style={btnDelete}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Estilos reutilizables
const labelStyle   = { display: "block", color: "#8B0000", fontWeight: "bold", marginBottom: "4px", fontSize: "13px" };
const inputStyle   = { width: "100%", padding: "10px", border: "2px solid #FFD700", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" };
const btnPrimary   = { backgroundColor: "#DC143C", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const btnSecondary = { backgroundColor: "#888", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer" };
const btnEdit      = { background: "#FFD700", color: "#1a1a1a", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" };
const btnDelete    = { background: "#DC143C", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" };
const statBox      = { background: "#fff", border: "2px solid #DC143C", borderRadius: "8px", padding: "16px 24px", textAlign: "center", minWidth: "100px" };
const td           = { padding: "10px 12px", verticalAlign: "middle" };
const alertError   = { background: "#ffe0e0", border: "1px solid #DC143C", padding: "10px", borderRadius: "6px", marginBottom: "12px", color: "#8B0000" };
const alertSuccess = { background: "#e0ffe0", border: "1px solid #4CAF50", padding: "10px", borderRadius: "6px", marginBottom: "12px", color: "#2e7d32" };

export default AdminMenu;
