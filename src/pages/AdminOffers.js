// Vista: AdminOffers.js
// CRUD completo de ofertas - Corrección del botón Editar y sincronización de datos.

import React, { useState, useEffect } from "react";
import { toastSuccess, toastError, toastConfirm } from "../services/ToastService";
import offerService from "../services/OfferService";
import menuService  from "../services/MenuService";

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
    if (result.success && result.data) {
      setDishes(result.data);
    }
  };

  const openNew = () => {
    setFormData(EMPTY_FORM);
    setSelDishes([]);
    setEditingId(null);
    setShowForm(true);
  };

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
    const now = new Date();
    
    const parseLocalDate = (dateStr) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    };

    const start = parseLocalDate(offer.startDate);
    const end = parseLocalDate(offer.endDate);
    
    if (start && now < start) return false;
    if (end && now > end) return false;
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
    <div style={{ padding: "30px", background: "#ffffff", minHeight: "100vh" }}>

      {/* Cabecera Principal */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ color: "#050505", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "42px", fontWeight: 400, margin: 0 }}>
          Administración de Ofertas
        </h1>
        <button onClick={openNew} disabled={loading} className="admin-offers-main-button">
          + Nueva Oferta
        </button>
      </div>

      {/* Formulario Estructurado */}
      {showForm && (
        <div style={{ background: "#ffffff", border: "1px solid #050505", borderRadius: 0, padding: "30px", marginBottom: "35px" }}>
          <h2 style={{ color: "#050505", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "30px", fontWeight: 400, marginTop: 0, marginBottom: "25px" }}>
            {editingId ? "Editar Oferta Activa" : "Nueva Oferta"}
          </h2>
          
          <form noValidate onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "35px" }}>
              
              {/* Bloque Izquierdo */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label className="admin-offers-label">Título de la Oferta *</label>
                  <input name="title" value={formData.title} onChange={handleChange}
                    placeholder="Ej: Descuento Fin de Semana" className="admin-offers-input" />
                </div>

                <div>
                  <label className="admin-offers-label">Descripción</label>
                  <textarea name="description" value={formData.description} onChange={handleChange}
                    rows={4} placeholder="Describe los detalles o condiciones de la oferta..." className="admin-offers-input admin-offers-textarea" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <label className="admin-offers-label">Descuento (%) *</label>
                    <input name="discount" type="number" min="1" max="100" value={formData.discount}
                      onChange={handleChange} placeholder="Ej: 20" className="admin-offers-input" />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "25px" }}>
                    <input name="active" type="checkbox" id="form-active-chk" checked={formData.active} onChange={handleChange} style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                    <label htmlFor="form-active-chk" style={{ color: "#050505", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}>Oferta activa</label>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <label className="admin-offers-label">Fecha de Inicio</label>
                    <input name="startDate" type="datetime-local" value={formData.startDate}
                      onChange={handleChange} className="admin-offers-input" />
                  </div>
                  <div>
                    <label className="admin-offers-label">Fecha de Fin</label>
                    <input name="endDate" type="datetime-local" value={formData.endDate}
                      onChange={handleChange} className="admin-offers-input" />
                  </div>
                </div>
              </div>

              {/* Bloque Derecho */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label className="admin-offers-label">Imagen de la Oferta</label>
                  
                  <label className="admin-offers-upload-button">
                    Subir Imagen
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      style={{ display: "none" }} 
                    />
                  </label>

                  {formData.imageUrl && (
                    <div style={{ marginTop: "12px", position: "relative", width: "100%", height: "140px", border: "1px solid #050505", borderRadius: 0, overflow: "hidden", background: "#fff" }}>
                      <img src={formData.imageUrl} alt="Miniatura subida" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button type="button" onClick={handleRemoveImage} className="admin-offers-remove-image-button">Quitar Foto</button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="admin-offers-label">Platos incluidos en la oferta</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxHeight: "150px", overflowY: "auto", border: "1px solid #050505", borderRadius: 0, padding: "12px", background: "#fff" }}>
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
                            background:    isChecked ? "#050505" : "#ffffff",
                            color:         isChecked ? "#ffffff" : "#050505",
                            padding:       "6px 12px",
                            borderRadius:  0,
                            cursor:        "pointer",
                            fontSize:      "12px",
                            fontWeight:    isChecked ? "bold" : "normal",
                            border:        "1px solid #050505",
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
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="admin-offers-secondary-button">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="admin-offers-submit-button">
                {loading ? "Guardando..." : "Guardar Oferta"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "25px" }}>
        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar oferta..." className="admin-offers-input admin-offers-search-input" />
        <select value={filterStatus} onChange={(e) => setFilter(e.target.value)} className="admin-offers-input admin-offers-filter-select">
          <option value="all">Todas</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
          <option value="vigor">En vigor ahora</option>
        </select>
      </div>

      {/* Cuadros de Estadísticas */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "30px", flexWrap: "wrap" }}>
        {[
          { label: "Total Ofertas",     value: offers.length },
          { label: "Activas",          value: offers.filter((o) => o.active).length },
          { label: "En Vigor",         value: offers.filter(isEnVigor).length },
          { label: "Desc. Promedio",   value: offers.length > 0 ? Math.round(offers.reduce((s, o) => s + (o.discount || 0), 0) / offers.length) + "%" : "0%" },
        ].map((s) => (
          <div key={s.label} className="admin-offers-stat-box">
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#050505" }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {loading && <p style={{ color: "#050505", fontWeight: "bold" }}>Cargando ofertas...</p>}

      {!loading && filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "#71717a", padding: "40px", border: "1px dashed #050505", borderRadius: 0 }}>
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
                border:       "1px solid #050505",
                borderRadius: 0,
                padding:      "20px",
                position:     "relative",
                boxShadow:    "none"
              }}>
                <div style={{ position: "absolute", top: "16px", right: "16px", display: "flex", gap: "6px" }}>
                  <span style={{ background: offer.active ? "#050505" : "#ffffff", color: offer.active ? "#fff" : "#050505", border: "1px solid #050505", padding: "3px 8px", borderRadius: 0, fontSize: "11px", fontWeight: "bold" }}>
                    {offer.active ? "Activa" : "Inactiva"}
                  </span>
                  {enVigor && (
                    <span style={{ background: "#ffffff", color: "#050505", border: "1px solid #050505", padding: "3px 8px", borderRadius: 0, fontSize: "11px", fontWeight: "bold" }}>
                      En Vigor
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  {offer.imageUrl ? (
                    <div style={{ width: "80px", height: "80px", borderRadius: 0, overflow: "hidden", border: "1px solid #050505", flexShrink: 0 }}>
                      <img src={offer.imageUrl} alt={offer.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ) : (
                    <div style={{ background: "#050505", color: "#fff", borderRadius: 0, width: "55px", height: "55px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "16px", fontWeight: "bold" }}>
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
                  <button onClick={() => handleToggleActive(offer)} disabled={loading} className="admin-offers-small-action-button admin-offers-small-action-button-light">
                    {offer.active ? "Desactivar" : "Activar"}
                  </button>
                  <button onClick={() => openEdit(offer)} disabled={loading} className="admin-offers-small-action-button admin-offers-small-action-button-light">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(offer.id)} disabled={loading} className="admin-offers-small-action-button admin-offers-small-action-button-dark">
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

export default AdminOffers;

