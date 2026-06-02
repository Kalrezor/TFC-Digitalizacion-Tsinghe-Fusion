// Vista: AdminOffers.js
// CRUD completo de ofertas - Corrección del botón Editar y sincronización de datos.

import React, { useState, useEffect } from "react";
import {
  toastSuccess,
  toastError,
  toastConfirm,
} from "../services/ToastService";
import offerService from "../services/OfferService";
import menuService from "../services/MenuService";
import styles from "../styles/modules/AdminOffers.module.css";

const EMPTY_FORM = {
  title: "",
  description: "",
  discount: "",
  imageUrl: "",
  startDate: "",
  endDate: "",
  active: true,
};

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
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
      title: offer.title || "",
      description: offer.description || "",
      discount: offer.discount || "",
      imageUrl: offer.imageUrl || "",
      startDate: offer.startDate || "",
      endDate: offer.endDate || "",
      active: offer.active !== false,
    });
    setSelDishes(offer.dishIds || []);
    setEditingId(offer.id);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
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
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) >= new Date(formData.endDate)
    ) {
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
      toastSuccess(
        editingId
          ? "Oferta actualizada con éxito."
          : "Oferta publicada correctamente.",
      );
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
    const confirmed = await toastConfirm(
      "¿Seguro que deseas eliminar esta oferta?",
      {
        confirmText: "Eliminar",
      },
    );
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
    const result = await offerService.updateOffer(
      offer.id,
      { active: !offer.active },
      true,
    );
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
    if (filterStatus === "active") matchStatus = o.active;
    if (filterStatus === "inactive") matchStatus = !o.active;
    if (filterStatus === "vigor") matchStatus = isEnVigor(o);
    return matchSearch && matchStatus;
  });

  const getDishNames = (dishIds) => {
    if (!dishIds || dishIds.length === 0) return "Todos los platos de la carta";
    return dishIds
      .map((id) => dishes.find((d) => d.id === id)?.name || id)
      .join(", ");
  };

  return (
    <div className={styles.page}>
      {/* Cabecera Principal */}
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>
          Administración de Ofertas
        </h1>
        <button
          onClick={openNew}
          disabled={loading}
          className="admin-offers-main-button"
        >
          + Nueva Oferta
        </button>
      </div>

      {/* Formulario Estructurado */}
      {showForm && (
        <div className={styles.formPanel}>
          <h2 className={styles.formTitle}>
            {editingId ? "Editar Oferta Activa" : "Nueva Oferta"}
          </h2>

          <form noValidate onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              {/* Bloque Izquierdo */}
              <div className={styles.formColumn}>
                <div>
                  <label className="admin-offers-label">
                    Título de la Oferta *
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ej: Descuento Fin de Semana"
                    className="admin-offers-input"
                  />
                </div>

                <div>
                  <label className="admin-offers-label">Descripción</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe los detalles o condiciones de la oferta..."
                    className="admin-offers-input admin-offers-textarea"
                  />
                </div>

                <div className={styles.fieldRow}>
                  <div>
                    <label className="admin-offers-label">
                      Descuento (%) *
                    </label>
                    <input
                      name="discount"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.discount}
                      onChange={handleChange}
                      placeholder="Ej: 20"
                      className="admin-offers-input"
                    />
                  </div>
                  <div className={styles.checkboxField}>
                    <input
                      name="active"
                      type="checkbox"
                      id="form-active-chk"
                      checked={formData.active}
                      onChange={handleChange}
                      className={styles.checkbox}
                    />
                    <label
                      htmlFor="form-active-chk"
                      className={styles.checkboxLabel}
                    >
                      Oferta activa
                    </label>
                  </div>
                </div>

                <div className={styles.fieldRow}>
                  <div>
                    <label className="admin-offers-label">
                      Fecha de Inicio
                    </label>
                    <input
                      name="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="admin-offers-input"
                    />
                  </div>
                  <div>
                    <label className="admin-offers-label">Fecha de Fin</label>
                    <input
                      name="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="admin-offers-input"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque Derecho */}
              <div className={styles.formColumnRight}>
                <div>
                  <label className="admin-offers-label">
                    Imagen de la Oferta
                  </label>

                  <label className="admin-offers-upload-button">
                    Subir Imagen
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className={styles.hiddenInput}
                    />
                  </label>

                  {formData.imageUrl && (
                    <div className={styles.imagePreview}>
                      <img
                        src={formData.imageUrl}
                        alt="Miniatura subida"
                        className={styles.imageCover}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="admin-offers-remove-image-button"
                      >
                        Quitar Foto
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="admin-offers-label">
                    Platos incluidos en la oferta
                  </label>
                  <div className={styles.dishPicker}>
                    {dishes.length === 0 && (
                      <span className={styles.dishPickerEmpty}>
                        Cargando platos...
                      </span>
                    )}
                    {dishes.map((dish) => {
                      const isChecked = selectedDishes.includes(dish.id);
                      return (
                        <label
                          key={dish.id}
                          className={styles.dishChip}
                          style={{
                            background: isChecked ? "#050505" : "#ffffff",
                            color: isChecked ? "#ffffff" : "#050505",
                            fontWeight: isChecked ? "bold" : "normal",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleDish(dish.id)}
                            className={styles.hiddenInput}
                          />
                          {dish.name}
                        </label>
                      );
                    })}
                  </div>
                  <small className={styles.dishHint}>
                    {selectedDishes.length === 0
                      ? "Aplica globalmente a todos los platos de la carta."
                      : `Filtro aplicado a ${selectedDishes.length} plato(s).`}
                  </small>
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="admin-offers-secondary-button"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="admin-offers-submit-button"
              >
                {loading ? "Guardando..." : "Guardar Oferta"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className={styles.filters}>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar oferta..."
          className="admin-offers-input admin-offers-search-input"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilter(e.target.value)}
          className="admin-offers-input admin-offers-filter-select"
        >
          <option value="all">Todas</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
          <option value="vigor">En vigor ahora</option>
        </select>
      </div>

      {/* Cuadros de Estadísticas */}
      <div className={styles.stats}>
        {[
          { label: "Total Ofertas", value: offers.length },
          { label: "Activas", value: offers.filter((o) => o.active).length },
          { label: "En Vigor", value: offers.filter(isEnVigor).length },
          {
            label: "Desc. Promedio",
            value:
              offers.length > 0
                ? Math.round(
                    offers.reduce((s, o) => s + (o.discount || 0), 0) /
                      offers.length,
                  ) + "%"
                : "0%",
          },
        ].map((s) => (
          <div key={s.label} className="admin-offers-stat-box">
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {loading && <p className={styles.loadingText}>Cargando ofertas...</p>}

      {!loading && filtered.length === 0 && (
        <p className={styles.emptyState}>
          No se encontraron ofertas que coincidan.
        </p>
      )}

      {/* Listado de Tarjetas */}
      {!loading && filtered.length > 0 && (
        <div className={styles.cardList}>
          {filtered.map((offer) => {
            const enVigor = isEnVigor(offer);
            return (
              <div key={offer.id} className={styles.card}>
                <div className={styles.cardBadges}>
                  <span
                    className={styles.badge}
                    style={{
                      background: offer.active ? "#050505" : "#ffffff",
                      color: offer.active ? "#fff" : "#050505",
                    }}
                  >
                    {offer.active ? "Activa" : "Inactiva"}
                  </span>
                  {enVigor && (
                    <span className={styles.badgeVigor}>En Vigor</span>
                  )}
                </div>

                <div className={styles.cardBody}>
                  {offer.imageUrl ? (
                    <div className={styles.cardImageWrap}>
                      <img
                        src={offer.imageUrl}
                        alt={offer.title}
                        className={styles.imageCover}
                      />
                    </div>
                  ) : (
                    <div className={styles.cardDiscount}>
                      -{offer.discount}%
                    </div>
                  )}

                  <div className={styles.cardInfo}>
                    <h3 className={styles.cardTitle}>{offer.title}</h3>
                    {offer.description && (
                      <p className={styles.cardDescription}>
                        {offer.description}
                      </p>
                    )}

                    <div className={styles.cardDates}>
                      {offer.startDate && (
                        <span>
                          <strong>Inicio:</strong>{" "}
                          {new Date(offer.startDate).toLocaleString("es-ES")}
                        </span>
                      )}
                      {offer.endDate && (
                        <span>
                          <strong>Fin:</strong>{" "}
                          {new Date(offer.endDate).toLocaleString("es-ES")}
                        </span>
                      )}
                    </div>
                    <p className={styles.cardDishes}>
                      <strong>Platos vinculados:</strong>{" "}
                      {getDishNames(offer.dishIds)}
                    </p>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    onClick={() => handleToggleActive(offer)}
                    disabled={loading}
                    className="admin-offers-small-action-button admin-offers-small-action-button-light"
                  >
                    {offer.active ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    onClick={() => openEdit(offer)}
                    disabled={loading}
                    className="admin-offers-small-action-button admin-offers-small-action-button-light"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    disabled={loading}
                    className="admin-offers-small-action-button admin-offers-small-action-button-dark"
                  >
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
