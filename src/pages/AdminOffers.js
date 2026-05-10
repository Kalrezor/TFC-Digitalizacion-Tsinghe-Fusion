// Vista: AdminOffers.js
// CRUD completo de ofertas para administradores.
// Importaciones corregidas desde models/ (no services/).
// Sin errores de sintaxis en template literals.

import React, { useState, useEffect } from "react";
import offerService from "../services/OfferService";
import menuService  from "../services/MenuService";
import "../styles/ChineseStyle.css";

const EMPTY_FORM = {
  title:       "",
  description: "",
  discount:    "",
  startDate:   "",
  endDate:     "",
  active:      true,
};

const AdminOffers = () => {
  const [offers, setOffers]           = useState([]);
  const [dishes, setDishes]           = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [success, setSuccess]         = useState(null);
  const [searchTerm, setSearchTerm]   = useState("");
  const [filterStatus, setFilter]     = useState("all");
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [formData, setFormData]       = useState(EMPTY_FORM);
  const [selectedDishes, setSelDishes] = useState([]);

  // Carga inicial
  useEffect(() => {
    loadOffers();
    loadDishes();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    setError(null);
    const result = await offerService.getAllOffers();
    setLoading(false);
    if (result.success) setOffers(result.offers);
    else setError("Error al cargar ofertas: " + result.error);
  };

  const loadDishes = async () => {
    const result = await menuService.getAllMenus();
    if (result.success) setDishes(result.menus);
  };

  // Formulario - abrir nuevo
  const openNew = () => {
    setFormData(EMPTY_FORM);
    setSelDishes([]);
    setEditingId(null);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  // Formulario - abrir edicion
  const openEdit = (offer) => {
    setFormData({
      title:       offer.title       || "",
      description: offer.description || "",
      discount:    offer.discount    || "",
      startDate:   offer.startDate   || "",
      endDate:     offer.endDate     || "",
      active:      offer.active !== false,
    });
    setSelDishes(offer.dishIds || []);
    setEditingId(offer.id);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleDish = (id) => {
    setSelDishes((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.discount) {
      setError("Titulo y descuento son obligatorios.");
      return;
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError("La fecha de fin debe ser posterior a la de inicio.");
      return;
    }

    setLoading(true);
    setError(null);
    const payload = { ...formData, discount: parseInt(formData.discount), dishIds: selectedDishes };

    const result = editingId
      ? await offerService.updateOffer(editingId, payload, true)
      : await offerService.createOffer(payload, true);

    setLoading(false);
    if (result.success) {
      setSuccess(editingId ? "Oferta actualizada." : "Oferta creada.");
      setShowForm(false);
      setFormData(EMPTY_FORM);
      setSelDishes([]);
      setEditingId(null);
      loadOffers();
    } else {
      setError("Error al guardar: " + result.error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Eliminar esta oferta definitivamente?")) return;
    setLoading(true);
    const result = await offerService.deleteOffer(id, true);
    setLoading(false);
    if (result.success) { setSuccess("Oferta eliminada."); loadOffers(); }
    else setError("Error al eliminar: " + result.error);
  };

  const handleToggleActive = async (offer) => {
    const result = await offerService.updateOffer(offer.id, { active: !offer.active }, true);
    if (result.success) loadOffers();
    else setError("Error al cambiar estado.");
  };

  // Comprobar si una oferta esta en vigor ahora mismo
  const isEnVigor = (offer) => {
    if (!offer.active) return false;
    const now   = new Date();
    const start = offer.startDate ? new Date(offer.startDate) : null;
    const end   = offer.endDate   ? new Date(offer.endDate)   : null;
    if (start && now < start) return false;
    if (end   && now > end)   return false;
    return true;
  };

  // Filtros
  const filtered = offers.filter((o) => {
    const matchSearch =
      o.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.description?.toLowerCase().includes(searchTerm.toLowerCase());
    let matchStatus = true;
    if (filterStatus === "active")   matchStatus = o.active;
    if (filterStatus === "inactive") matchStatus = !o.active;
    if (filterStatus === "vigor")    matchStatus = isEnVigor(o);
    return matchSearch && matchStatus;
  });

  // Nombre de platos relacionados
  const getDishNames = (dishIds) => {
    if (!dishIds || dishIds.length === 0) return "Todos los platos";
    return dishIds
      .map((id) => dishes.find((d) => d.id === id)?.name || id)
      .join(", ");
  };

  return (
    <div style={{ padding: "20px" }}>

      {/* Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ color: "#DC143C", margin: 0 }}>Administracion de Ofertas</h1>
        <button onClick={openNew} disabled={loading} style={btnPrimary}>
          + Nueva Oferta
        </button>
      </div>

      {/* Mensajes */}
      {error   && <div style={alertError}>{error}</div>}
      {success && <div style={alertSuccess}>{success}</div>}

      {/* Formulario */}
      {showForm && (
        <div style={{ background: "#fff8f0", border: "2px solid #DC143C", borderRadius: "10px", padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ color: "#DC143C", marginTop: 0 }}>{editingId ? "Editar Oferta" : "Nueva Oferta"}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Titulo de la Oferta *</label>
                <input name="title" value={formData.title} onChange={handleChange}
                  placeholder="Ej: Descuento Fin de Semana" required style={inputStyle} />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Descripcion</label>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  rows={3} placeholder="Describe la oferta..." style={{ ...inputStyle, resize: "vertical" }} />
              </div>

              <div>
                <label style={labelStyle}>Descuento (%) *</label>
                <input name="discount" type="number" min="1" max="100" value={formData.discount}
                  onChange={handleChange} placeholder="Ej: 20" required style={inputStyle} />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "24px" }}>
                <input name="active" type="checkbox" id="chk-active" checked={formData.active} onChange={handleChange} />
                <label htmlFor="chk-active" style={{ color: "#8B0000", fontWeight: "bold" }}>Oferta activa</label>
              </div>

              <div>
                <label style={labelStyle}>Fecha de Inicio</label>
                <input name="startDate" type="datetime-local" value={formData.startDate}
                  onChange={handleChange} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Fecha de Fin</label>
                <input name="endDate" type="datetime-local" value={formData.endDate}
                  onChange={handleChange} style={inputStyle} />
              </div>

              {/* Selector de platos incluidos */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Platos incluidos en la oferta (opcional)</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "8px", maxHeight: "160px", overflowY: "auto", border: "1px solid #FFD700", borderRadius: "6px", padding: "10px" }}>
                  {dishes.length === 0 && <span style={{ color: "#888", fontSize: "13px" }}>No hay platos disponibles.</span>}
                  {dishes.map((dish) => {
                    const checked = selectedDishes.includes(dish.id);
                    return (
                      <label
                        key={dish.id}
                        style={{
                          display:       "flex",
                          alignItems:    "center",
                          gap:           "6px",
                          background:    checked ? "#FFD700" : "#f5f5f5",
                          padding:       "6px 10px",
                          borderRadius:  "20px",
                          cursor:        "pointer",
                          fontSize:      "13px",
                          fontWeight:    checked ? "bold" : "normal",
                          border:        checked ? "1px solid #8B0000" : "1px solid #ccc",
                          transition:    "all 0.15s",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleDish(dish.id)}
                          style={{ display: "none" }}
                        />
                        {dish.name} ({parseFloat(dish.price || 0).toFixed(2)} euros)
                      </label>
                    );
                  })}
                </div>
                <small style={{ color: "#888" }}>
                  {selectedDishes.length === 0
                    ? "Sin seleccion (aplica a todos los platos)"
                    : selectedDishes.length + " plato(s) seleccionado(s)"}
                </small>
              </div>
            </div>

            <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
              <button type="submit" disabled={loading} style={btnPrimary}>
                {loading ? "Guardando..." : "Guardar Oferta"}
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
          placeholder="Buscar oferta..." style={{ ...inputStyle, maxWidth: "260px" }} />
        <select value={filterStatus} onChange={(e) => setFilter(e.target.value)} style={{ ...inputStyle, maxWidth: "200px" }}>
          <option value="all">Todas</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
          <option value="vigor">En vigor ahora</option>
        </select>
      </div>

      {/* Estadisticas */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { label: "Total Ofertas",    value: offers.length },
          { label: "Activas",          value: offers.filter((o) => o.active).length },
          { label: "En Vigor",         value: offers.filter(isEnVigor).length },
          { label: "Desc. Promedio",   value: offers.length > 0 ? Math.round(offers.reduce((s, o) => s + (o.discount || 0), 0) / offers.length) + "%" : "0%" },
        ].map((s) => (
          <div key={s.label} style={statBox}>
            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#DC143C" }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#555" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && <p style={{ color: "#DC143C" }}>Cargando...</p>}

      {/* Sin resultados */}
      {!loading && filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "#888", padding: "30px" }}>No hay ofertas que coincidan.</p>
      )}

      {/* Lista de ofertas */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filtered.map((offer) => {
            const enVigor = isEnVigor(offer);
            return (
              <div key={offer.id} style={{
                background:   "#fff",
                border:       "2px solid " + (enVigor ? "#4CAF50" : offer.active ? "#FFD700" : "#ccc"),
                borderRadius: "10px",
                padding:      "20px",
                position:     "relative",
              }}>
                {/* Badges */}
                <div style={{ position: "absolute", top: "16px", right: "16px", display: "flex", gap: "8px" }}>
                  <span style={{ background: offer.active ? "#4CAF50" : "#f44336", color: "#fff", padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
                    {offer.active ? "Activa" : "Inactiva"}
                  </span>
                  {enVigor && (
                    <span style={{ background: "#FFD700", color: "#8B0000", padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
                      En Vigor
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                  <div style={{ background: "#DC143C", color: "#fff", borderRadius: "50%", width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "18px", fontWeight: "bold" }}>
                    -{offer.discount}%
                  </div>
                  <div style={{ flex: 1, paddingRight: "120px" }}>
                    <h3 style={{ margin: "0 0 6px", color: "#1a1a1a" }}>{offer.title}</h3>
                    {offer.description && <p style={{ margin: "0 0 8px", color: "#555", fontSize: "14px" }}>{offer.description}</p>}
                    {offer.startDate && (
                      <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#888" }}>
                        Desde: {new Date(offer.startDate).toLocaleString("es-ES")}
                      </p>
                    )}
                    {offer.endDate && (
                      <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#888" }}>
                        Hasta: {new Date(offer.endDate).toLocaleString("es-ES")}
                      </p>
                    )}
                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#333" }}>
                      <strong>Platos:</strong> {getDishNames(offer.dishIds)}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button onClick={() => handleToggleActive(offer)} disabled={loading}
                    style={{ ...btnToggle, background: offer.active ? "#888" : "#4CAF50" }}>
                    {offer.active ? "Desactivar" : "Activar"}
                  </button>
                  <button onClick={() => openEdit(offer)} disabled={loading} style={btnEdit}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(offer.id)} disabled={loading} style={btnDelete}>
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
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
const btnEdit      = { background: "#FFD700", color: "#1a1a1a", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" };
const btnDelete    = { background: "#DC143C", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" };
const btnToggle    = { color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" };
const statBox      = { background: "#fff", border: "2px solid #DC143C", borderRadius: "8px", padding: "16px 24px", textAlign: "center", minWidth: "100px" };
const alertError   = { background: "#ffe0e0", border: "1px solid #DC143C", padding: "10px", borderRadius: "6px", marginBottom: "12px", color: "#8B0000" };
const alertSuccess = { background: "#e0ffe0", border: "1px solid #4CAF50", padding: "10px", borderRadius: "6px", marginBottom: "12px", color: "#2e7d32" };

export default AdminOffers;
