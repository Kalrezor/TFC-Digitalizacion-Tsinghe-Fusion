// Vista: AdminOffers.js
// CRUD completo de ofertas - Corrección del botón Editar y sincronización de datos.

import React, { useState, useEffect } from "react";
import { toastSuccess, toastError, toastConfirm } from "../services/ToastService";
import offerService from "../services/OfferService";
import menuService  from "../services/MenuService";
import "../styles/ChineseStyle.css";

const EMPTY_FORM = {
  title:       "",
  description: "",
  discount:    "",
  imageUrl:    "", 
  startDate:   "",
  endDate:     "",
  active:      true,
};

const AdminOffers = () => {
  const [offers, setOffers]           = useState([]);
  const [dishes, setDishes]           = useState([]);
  const [loading, setLoading]         = useState(false);
  const [searchTerm, setSearchTerm]   = useState("");
  const [filterStatus, setFilter]     = useState("all");
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [formData, setFormData]       = useState(EMPTY_FORM);
  const [selectedDishes, setSelDishes] = useState([]);

  useEffect(() => {
    loadOffers();
    loadDishes();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    const result = await offerService.getAllOffers();
    setLoading(false);
    if (result.success) setOffers(result.offers);
    else toastError("Error al cargar las ofertas: " + result.error);
  };

  const loadDishes = async () => {
    const result = await menuService.getAllMenus();
    if (result.success) setDishes(result.menus);
  };

  const openNew = () => {
    setFormData(EMPTY_FORM);
    setSelDishes([]);
    setEditingId(null);
    setShowForm(true);
  };

  // Esta función es clave para que el botón de editar funcione perfectamente
  const openEdit = (offer) => {
    setFormData({
      title:       offer.title       || "",
      description: offer.description || "",
      discount:    offer.discount    || "",
      imageUrl:    offer.imageUrl    || "", 
      startDate:   offer.startDate   || "",
      endDate:     offer.endDate     || "",
      active:      offer.active !== false,
    });
    setSelDishes(offer.dishIds || []);
    setEditingId(offer.id);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toastError("La imagen supera el límite permitido de 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
  };

  const toggleDish = (id) => {
    setSelDishes((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.discount) {
      toastError("El título y el porcentaje de descuento son obligatorios.");
      return;
    }
    const discount = Number.parseInt(formData.discount, 10);
    if (Number.isNaN(discount) || discount < 1 || discount > 100) {
      toastError("El descuento debe estar entre 1 y 100.");
      return;
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      toastError("La fecha de fin debe ser posterior a la fecha de inicio.");
      return;
    }

    setLoading(true);
    const payload = { ...formData, discount, dishIds: selectedDishes };

    const result = editingId
      ? await offerService.updateOffer(editingId, payload, true)
      : await offerService.createOffer(payload, true);

    setLoading(false);
    if (result.success) {
      toastSuccess(editingId ? "Oferta actualizada con éxito." : "Oferta publicada correctamente.");
      setShowForm(false);
      setFormData(EMPTY_FORM);
      setSelDishes([]);
      setEditingId(null);
      loadOffers();
    } else {
      toastError("Error al procesar la solicitud: " + result.error);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await toastConfirm("¿Seguro que deseas eliminar esta oferta?", {
      confirmText: "Eliminar",
    });
    if (!confirmed) return;

    setLoading(true);
    const result = await offerService.deleteOffer(id, true);
    setLoading(false);
    if (result.success) {
      toastSuccess("Oferta eliminada.");
      loadOffers();
    } else {
      toastError("Error al eliminar: " + result.error);
    }
  };
  const handleToggleActive = async (offer) => {
    const result = await offerService.updateOffer(offer.id, { active: !offer.active }, true);
    if (result.success) {
      toastSuccess(offer.active ? "Oferta desactivada." : "Oferta activada.");
      loadOffers();
    } else {
      toastError("No se pudo cambiar el estado de la oferta.");
    }
  };

  const isEnVigor = (offer) => {
    if (!offer.active) return false;
    const now   = new Date();
    const start = offer.startDate ? new Date(offer.startDate) : null;
    const end   = offer.endDate   ? new Date(offer.endDate)   : null;
    if (start && now < start) return false;
    if (end   && now > end)   return false;
    return true;
  };

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

  const getDishNames = (dishIds) => {
    if (!dishIds || dishIds.length === 0) return "Todos los platos de la carta";
    return dishIds
      .map((id) => dishes.find((d) => d.id === id)?.name || id)
      .join(", ");
  };

  return (
    <div style={{ padding: "30px", background: "#fcfcfa", minHeight: "100vh" }}>

      {/* Cabecera Principal */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ color: "#DC143C", fontSize: "28px", fontWeight: "bold", margin: 0 }}>
          Administración de Ofertas
        </h1>
        <button onClick={openNew} disabled={loading} style={btnMainHeader}>
          + Nueva Oferta
        </button>
      </div>

      {/* Formulario Estructurado */}
      {showForm && (
        <div style={{ background: "#fff8f2", border: "1px solid #FFD700", borderRadius: "8px", padding: "30px", marginBottom: "35px" }}>
          <h2 style={{ color: "#DC143C", fontSize: "20px", marginTop: 0, marginBottom: "25px" }}>
            {editingId ? "Editar Oferta Activa" : "Nueva Oferta"}
          </h2>
          
          <form noValidate onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "35px" }}>
              
              {/* Bloque Izquierdo */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label style={labelStyle}>Título de la Oferta *</label>
                  <input name="title" value={formData.title} onChange={handleChange}
                    placeholder="Ej: Descuento Fin de Semana" style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Descripción</label>
                  <textarea name="description" value={formData.description} onChange={handleChange}
                    rows={4} placeholder="Describe los detalles o condiciones de la oferta..." style={{ ...inputStyle, resize: "none" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <label style={labelStyle}>Descuento (%) *</label>
                    <input name="discount" type="number" min="1" max="100" value={formData.discount}
                      onChange={handleChange} placeholder="Ej: 20" style={inputStyle} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "25px" }}>
                    <input name="active" type="checkbox" id="form-active-chk" checked={formData.active} onChange={handleChange} style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                    <label htmlFor="form-active-chk" style={{ color: "#8B0000", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}>Oferta activa</label>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
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
                </div>
              </div>

              {/* Bloque Derecho */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={labelStyle}>Imagen de la Oferta</label>
                  
                  <label style={btnYellowUploadFull}>
                    Subir Imagen
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      style={{ display: "none" }} 
                    />
                  </label>

                  {formData.imageUrl && (
                    <div style={{ marginTop: "12px", position: "relative", width: "100%", height: "140px", border: "1px solid #FFD700", borderRadius: "6px", overflow: "hidden", background: "#fff" }}>
                      <img src={formData.imageUrl} alt="Miniatura subida" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button type="button" onClick={handleRemoveImage} style={btnDeleteFloatingImg}>Quitar Foto</button>
                    </div>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>Platos incluidos en la oferta</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxHeight: "150px", overflowY: "auto", border: "1px solid #FFD700", borderRadius: "6px", padding: "12px", background: "#fff" }}>
                    {dishes.length === 0 && <span style={{ color: "#888", fontSize: "13px" }}>Cargando platos...</span>}
                    {dishes.map((dish) => {
                      const isChecked = selectedDishes.includes(dish.id);
                      return (
                        <label
                          key={dish.id}
                          style={{
                            display:       "flex",
                            alignItems:    "center",
                            gap:           "6px",
                            background:    isChecked ? "#FFD700" : "#f8f9fa",
                            padding:       "6px 12px",
                            borderRadius:  "20px",
                            cursor:        "pointer",
                            fontSize:      "12px",
                            fontWeight:    isChecked ? "bold" : "normal",
                            border:        isChecked ? "1px solid #8B0000" : "1px solid #ddd",
                            transition:    "all 0.1s ease",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleDish(dish.id)}
                            style={{ display: "none" }}
                          />
                          {dish.name}
                        </label>
                      );
                    })}
                  </div>
                  <small style={{ color: "#666", display: "block", marginTop: "6px" }}>
                    {selectedDishes.length === 0 
                      ? "Aplica globalmente a todos los platos de la carta." 
                      : `Filtro aplicado a ${selectedDishes.length} plato(s).`}
                  </small>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "30px", display: "flex", gap: "12px", justifyContent: "flex-end", borderTop: "1px solid #eee", paddingTop: "15px" }}>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} style={btnSecondary}>
                Cancelar
              </button>
              <button type="submit" disabled={loading} style={btnSubmitForm}>
                {loading ? "Guardando..." : "Guardar Oferta"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "25px" }}>
        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar oferta..." style={{ ...inputStyle, maxWidth: "300px" }} />
        <select value={filterStatus} onChange={(e) => setFilter(e.target.value)} style={{ ...inputStyle, maxWidth: "200px" }}>
          <option value="all">Todas</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
          <option value="vigor">En vigor ahora</option>
        </select>
      </div>

      {/* Cuadros de Estadísticas */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "30px", flexWrap: "wrap" }}>
        {[
          { label: "Total Ofertas",    value: offers.length },
          { label: "Activas",          value: offers.filter((o) => o.active).length },
          { label: "En Vigor",         value: offers.filter(isEnVigor).length },
          { label: "Desc. Promedio",   value: offers.length > 0 ? Math.round(offers.reduce((s, o) => s + (o.discount || 0), 0) / offers.length) + "%" : "0%" },
        ].map((s) => (
          <div key={s.label} style={statBox}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#DC143C" }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {loading && <p style={{ color: "#DC143C", fontWeight: "bold" }}>Cargando ofertas...</p>}

      {!loading && filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "#999", padding: "40px", border: "1px dashed #ccc", borderRadius: "8px" }}>
          No se encontraron ofertas que coincidan.
        </p>
      )}

      {/* Listado de Tarjetas */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filtered.map((offer) => {
            const enVigor = isEnVigor(offer);
            return (
              <div key={offer.id} style={{
                background:   "#fff",
                border:       "1px solid " + (enVigor ? "#4CAF50" : offer.active ? "#FFD700" : "#ddd"),
                borderRadius: "8px",
                padding:      "20px",
                position:     "relative",
                boxShadow:    "0 2px 6px rgba(0,0,0,0.02)"
              }}>
                <div style={{ position: "absolute", top: "16px", right: "16px", display: "flex", gap: "6px" }}>
                  <span style={{ background: offer.active ? "#4CAF50" : "#f44336", color: "#fff", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                    {offer.active ? "Activa" : "Inactiva"}
                  </span>
                  {enVigor && (
                    <span style={{ background: "#FFD700", color: "#000", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                      En Vigor
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  {offer.imageUrl ? (
                    <div style={{ width: "80px", height: "80px", borderRadius: "6px", overflow: "hidden", border: "1px solid #eee", flexShrink: 0 }}>
                      <img src={offer.imageUrl} alt={offer.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ) : (
                    <div style={{ background: "#DC143C", color: "#fff", borderRadius: "50%", width: "55px", height: "55px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "16px", fontWeight: "bold" }}>
                      -{offer.discount}%
                    </div>
                  )}

                  <div style={{ flex: 1, paddingRight: "140px" }}>
                    <h3 style={{ margin: "0 0 4px", color: "#111", fontSize: "16px" }}>{offer.title}</h3>
                    {offer.description && <p style={{ margin: "0 0 8px", color: "#555", fontSize: "13px" }}>{offer.description}</p>}
                    
                    <div style={{ display: "flex", gap: "15px", fontSize: "12px", color: "#777" }}>
                      {offer.startDate && <span><strong>Inicio:</strong> {new Date(offer.startDate).toLocaleString("es-ES")}</span>}
                      {offer.endDate && <span><strong>Fin:</strong> {new Date(offer.endDate).toLocaleString("es-ES")}</span>}
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#444" }}>
                      <strong>Platos vinculados:</strong> {getDishNames(offer.dishIds)}
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: "15px", display: "flex", gap: "8px" }}>
                  <button onClick={() => handleToggleActive(offer)} disabled={loading} style={{ ...btnSmallAction, background: "#f5f5f5", color: "#333", border: "1px solid #ccc" }}>
                    {offer.active ? "Desactivar" : "Activar"}
                  </button>
                  {/* CORREGIDO: Ahora llama correctamente a openEdit(offer) */}
                  <button onClick={() => openEdit(offer)} disabled={loading} style={{ ...btnSmallAction, background: "#FFD700", color: "#000", border: "1px solid #8B0000" }}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(offer.id)} disabled={loading} style={{ ...btnSmallAction, background: "#DC143C", color: "#fff", border: "none" }}>
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

// --- ESTILOS COMPONENTES ---
const labelStyle   = { display: "block", color: "#8B0000", fontWeight: "bold", marginBottom: "6px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" };
const inputStyle   = { width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", fontSize: "14px", boxSizing: "border-box", background: "#fff" };

const btnYellowUploadFull = {
  display: "block",
  width: "100%",
  padding: "14px 0",
  background: "#FFD700",
  color: "#000",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
  textAlign: "center",
  boxSizing: "border-box"
};

const btnMainHeader   = { backgroundColor: "#DC143C", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" };
const btnSubmitForm   = { backgroundColor: "#DC143C", color: "#fff", border: "none", padding: "10px 22px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const btnSecondary    = { backgroundColor: "#bbb", color: "#fff", border: "none", padding: "10px 22px", borderRadius: "6px", cursor: "pointer" };
const btnSmallAction  = { padding: "6px 14px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" };
const statBox         = { background: "#fff", border: "1px solid #FFD700", borderRadius: "6px", padding: "12px 20px", textAlign: "center", minWidth: "110px" };
const btnDeleteFloatingImg = {
  position: "absolute",
  top: "8px",
  right: "8px",
  background: "rgba(220, 20, 60, 0.9)",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  padding: "4px 8px",
  fontSize: "11px",
  cursor: "pointer",
  fontWeight: "bold"
};

export default AdminOffers;
