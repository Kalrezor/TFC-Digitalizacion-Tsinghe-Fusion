// Vista: AdminMenu.js (Fragmento de la Tabla optimizado para legibilidad y holgura)

import React, { useState, useEffect, useRef } from "react";
import { toastSuccess, toastError } from "../services/ToastService";
import menuService from "../models/MenuService";

const DEFAULT_PLATE_IMAGE = "https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/plate%2FImgNoDisp.png?alt=media&token=67746171-489f-4b93-98dd-d744784fa37f";

const EMPTY_FORM = {
  nombre: "",
  descripcion: "",
  precio: "",
  idCategoria: "",
  alergenos: [],
  imagen: "",
  disponible: true, 
};

const AdminMenu = () => {
  // ... (Mantén toda tu lógica de estados, useEffects y handlers exactamente igual)
  const [plates, setPlates]           = useState([]);
  const [categories, setCategories]   = useState([]);
  const [allAllergens, setAllAllergens] = useState({});
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [success, setSuccess]         = useState(null);
  const [searchTerm, setSearchTerm]   = useState("");
  const [filterCat, setFilterCat]     = useState("all");
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [formData, setFormData]       = useState(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState(null);
  const [isOpenCat, setIsOpenCat] = useState(false);
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const catRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (catRef.current && !catRef.current.contains(event.target)) setIsOpenCat(false);
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsOpenFilter(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (error) {
      toastError(error);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      toastSuccess(success);
    }
  }, [success]);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [resAllergens, resCats, resPlates] = await Promise.all([
        menuService.getAllAllergens(),
        menuService.getAllCategories(),
        menuService.getAllPlates()
      ]);
      if (resAllergens.success) setAllAllergens(resAllergens.data);
      if (resCats.success) setCategories(resCats.data);
      if (resPlates.success) setPlates(resPlates.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const loadPlatesOnly = async () => {
    const result = await menuService.getAllPlates();
    if (result.success) setPlates(result.data);
  };

  const openNew = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setImagePreview(null);
    setError(null);
    setSuccess(null);
  };

  const openEdit = (plate) => {
    setFormData({
      ...plate,
      alergenos: Array.isArray(plate.alergenos) ? plate.alergenos : [],
      disponible: plate.disponible !== undefined ? plate.disponible : true,
    });
    setEditingId(plate.id);
    setShowForm(true);
    setImagePreview(plate.imagen && plate.imagen.trim() !== "" ? plate.imagen : DEFAULT_PLATE_IMAGE);
    setError(null);
    setSuccess(null);
  };

  const [confirmDeletePlate, setConfirmDeletePlate] = useState(null);
  const handleDeleteClick = (plate) => setConfirmDeletePlate(plate);

  const handleConfirmDelete = async () => {
    if (!confirmDeletePlate) return;
    setLoading(true);
    try {
      const res = await menuService.deletePlate(confirmDeletePlate.id, true);
      setLoading(false);
      if (res && res.success !== false) {
        toastSuccess("Plato eliminado correctamente");
        loadPlatesOnly();
        setConfirmDeletePlate(null);
      } else {
        const err = (res && res.error) || "Error al eliminar el plato";
        toastError(err);
        setError(err);
      }
    } catch (err) {
      setLoading(false);
      toastError("Error al eliminar: " + err.message);
      setError(err.message);
    }
  };

  const handleCancelDelete = () => setConfirmDeletePlate(null);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "precio") {
      const val = value.replace(",", ".");
      if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) setFormData(prev => ({ ...prev, [name]: val }));
      return;
    }
    const val = type === "checkbox" ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleAlergenoToggle = (id) => {
    setFormData(prev => {
      const exists = prev.alergenos.includes(id);
      return { ...prev, alergenos: exists ? prev.alergenos.filter(a => a !== id) : [...prev.alergenos, id] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.precio || !formData.idCategoria) {
      setError("Nombre, categoría y precio son obligatorios.");
      return;
    }
    setLoading(true);
    const payload = { ...formData, precio: parseFloat(formData.precio) };
    const result = editingId 
      ? await menuService.updatePlate(editingId, payload, true)
      : await menuService.createPlate(payload, true);
    setLoading(false);
    if (result.success) {
      setSuccess("¡Guardado correctamente!");
      setShowForm(false);
      loadPlatesOnly();
    } else setError(result.error);
  };

  const filtered = plates.filter(p => {
    const matchSearch = p.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCat === "all" || p.idCategoria === filterCat;
    return matchSearch && matchCat;
  });

  const selectedCatName = categories.find(c => c.id === formData.idCategoria)?.nombre || "";
  const filterCatName = filterCat === "all" ? "TODAS LAS CATEGORÍAS" : categories.find(c => c.id === filterCat)?.nombre || "";

  return (
    <div className="container" style={{ padding: "24px 0" }}>
      {/* ... (Mantén tus cabeceras, formularios y filtros superiores exactamente como estaban) ... */}
      <div className="card admin-menu-card-spaced">
        <div className="card-header">
          <h1 className="admin-menu-heading">Administración de Menú</h1>
        </div>
        <div className="admin-menu-toolbar">
          <p className="admin-menu-intro">Gestiona los platos del menú, categoría, alérgenos e imagen desde un panel editorial.</p>
          <button onClick={openNew} disabled={loading} className="btn btn-primary">+ Nuevo Plato</button>
        </div>
      </div>

      {showForm && (
        <div className="card admin-menu-card-spaced">
          <div className="card-header">
            <h3>{editingId ? "Editar Plato" : "Nuevo Plato"}</h3>
          </div>
          <div className="admin-menu-form-shell">
            <form noValidate onSubmit={handleSubmit}>
              <div className="admin-menu-form-stack">
                <div className="form-group">
                  <label>Nombre del Plato *</label>
                  <input name="nombre" value={formData.nombre} onChange={handleChange} className="form-control" />
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={2} className="form-control" />
                </div>

                <div className="form-group admin-menu-select-group" ref={catRef}>
                  <label>Categoría *</label>
                  <div onClick={() => setIsOpenCat(!isOpenCat)} className="admin-menu-select-trigger">
                    <span style={{ fontWeight: formData.idCategoria ? "bold" : "normal" }}>{selectedCatName.toUpperCase()}</span>
                    <span>{isOpenCat ? "▲" : "▼"}</span>
                  </div>
                  {isOpenCat && (
                    <div className="admin-menu-select-dropdown">
                      <div className="admin-menu-select-grid">
                        {categories.map((cat) => (
                          <div key={cat.id} onClick={() => { setFormData(p => ({ ...p, idCategoria: cat.id })); setIsOpenCat(false); }}
                            className={`admin-menu-select-item ${formData.idCategoria === cat.id ? "is-selected" : ""}`}>
                            {cat.nombre.toUpperCase()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="admin-menu-label">Alérgenos</label>
                  <div className="admin-menu-allergen-grid">
                    {Object.values(allAllergens).map(ale => (
                      <div key={ale.id} onClick={() => handleAlergenoToggle(ale.id)}
                        className={`admin-menu-allergen-item ${formData.alergenos.includes(ale.id) ? "is-selected" : ""}`}>
                        <img src={ale.imagen} alt="" className="admin-menu-allergen-icon" />
                        <span className="admin-menu-allergen-name">{ale.nombre}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="admin-menu-form-row">
                  <div>
                    <label className="admin-menu-label">Precio (€) *</label>
                    <input name="precio" type="text" value={formData.precio} onChange={handleChange} placeholder="0.00" className="admin-menu-input" />
                  </div>
                  <div>
                    <label className="admin-menu-label">Imagen del Plato</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <input type="file" id="img-upload" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => { setImagePreview(reader.result); setFormData(p => ({ ...p, imagen: reader.result })); };
                          reader.readAsDataURL(file);
                        }
                      }} />
                      <label htmlFor="img-upload" className="btn btn-secondary" style={{ flex: 1, textAlign: "center" }}>Subir Imagen</label>
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" style={{ width: "45px", height: "45px", borderRadius: "6px", objectFit: "cover", border: "1px solid var(--gold)" }} />
                      ) : (
                        <img src={DEFAULT_PLATE_IMAGE} alt="Default Preview" style={{ width: "45px", height: "45px", borderRadius: "6px", objectFit: "contain", border: "1px solid #eee" }} />
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#ffffff", padding: "12px", borderRadius: 0, border: "1px solid #050505", width: "fit-content" }}>
                  <label style={{ marginBottom: 0, fontWeight: 700 }}>Disponible?</label>
                  <input name="disponible" type="checkbox" checked={formData.disponible} onChange={handleChange} style={{ width: "18px", height: "18px", cursor: "pointer" }} />
                  <span style={{ fontWeight: "bold", color: "#050505", fontSize: "13px" }}>
                    {formData.disponible ? "SÍ" : "NO"}
                  </span>
                </div>
              </div>
              <div style={{ marginTop: "25px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button type="submit" className="btn btn-primary">Guardar Plato</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: "22px", marginBottom: "24px" }}>
        <div className="card-header"><h3 style={{ margin: 0 }}>Filtros</h3></div>
        <div className="admin-menu-filters-row">
          <div className="admin-menu-search-cell">
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar plato..." className="admin-menu-input" />
          </div>

          <div className="admin-menu-select-group" ref={filterRef}>
            <label className="admin-menu-label">Filtrar por Categoría:</label>
            <div onClick={() => setIsOpenFilter(!isOpenFilter)} className="admin-menu-select-trigger">
              <span style={{ fontWeight: filterCat === "all" ? "normal" : "bold" }}>{filterCatName.toUpperCase()}</span>
              <span>{isOpenFilter ? "▲" : "▼"}</span>
            </div>
            {isOpenFilter && (
              <div className="admin-menu-select-dropdown">
                <div className="admin-menu-select-grid">
                  <div onClick={() => { setFilterCat("all"); setIsOpenFilter(false); }}
                    className={`admin-menu-select-item ${filterCat === "all" ? "is-selected" : ""}`}>
                    TODAS
                  </div>
                  {categories.map((cat) => (
                    <div key={cat.id} onClick={() => { setFilterCat(cat.id); setIsOpenFilter(false); }}
                      className={`admin-menu-select-item ${filterCat === cat.id ? "is-selected" : ""}`}>
                      {cat.nombre.toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- SECCIÓN SECCIÓN TABLA REFORMADA --- */}
      <div className="card" style={{ padding: "26px", overflowX: "auto", borderRadius: "12px" }}>
        <div className="card-header" style={{ marginBottom: "16px" }}>
          <h3 style={{ margin: 0 }}>Platos</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr style={{ background: "var(--sage, #222)", color: "#fff", fontSize: "13px", letterSpacing: "0.5px" }}>
              <th className="admin-menu-table-header-cell">Imagen</th>
              <th className="admin-menu-table-header-cell">Nombre</th>
              <th className="admin-menu-table-header-cell">Categoría</th>
              <th className="admin-menu-table-header-cell">Precio</th>
              <th className="admin-menu-table-header-cell">Estado</th>
              <th className="admin-menu-table-header-cell">Alérgenos</th>
              <th className="admin-menu-table-header-cell admin-menu-table-header-cell-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const tableImg = p.imagen && p.imagen.trim() !== "" ? p.imagen : DEFAULT_PLATE_IMAGE;

              return (
                <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0", transition: "background 0.2s" }} className="table-row-hover">
                  {/* Celda Imagen */}
                  <td className="admin-menu-table-cell">
                    <img 
                      src={tableImg} 
                      alt="" 
                      style={{ 
                        width: "56px", 
                        height: "56px", 
                        objectFit: tableImg === DEFAULT_PLATE_IMAGE ? "contain" : "cover", 
                        borderRadius: "8px",
                        background: "#f9f9f9",
                        border: "1px solid #eaeaea",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.03)"
                      }} 
                    />
                  </td>

                  {/* Celda Nombre */}
                  <td className="admin-menu-table-cell admin-menu-table-cell-name">
                    <strong style={{ color: "#111" }}>{p.nombre}</strong>
                  </td>

                  {/* Celda Categoría */}
                  <td className="admin-menu-table-cell admin-menu-table-cell-category">
                    {p.idCategoria}
                  </td>

                  {/* Celda Precio */}
                  <td className="admin-menu-table-cell admin-menu-table-cell-price">
                    {parseFloat(p.precio || 0).toFixed(2)} €
                  </td>

                  {/* Celda Estado (No disponible / Disponible) mas espacioso */}
                  <td className="admin-menu-table-cell">
                    <span style={{
                      color: p.disponible ? "#1e4620" : "#721c24",
                      fontWeight: "700",
                      fontSize: "11px",
                      background: p.disponible ? "#e8f5e9" : "#f8d7da",
                      border: p.disponible ? "1px solid #c3e6cb" : "1px solid #f5c6cb",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      display: "inline-block",
                      letterSpacing: "0.5px",
                      textAlign: "center",
                      whiteSpace: "nowrap"
                    }}>
                      {p.disponible ? "DISPONIBLE" : "NO DISPONIBLE"}
                    </span>
                  </td>

                  {/* Celda Alérgenos */}
                  <td className="admin-menu-table-cell">
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", maxWidth: "120px" }}>
                      {p.alergenos?.map(id => (
                        <img 
                          key={id} 
                          src={allAllergens[id]?.imagen} 
                          title={allAllergens[id]?.nombre} 
                          style={{ width: "22px", height: "22px", objectFit: "contain" }} 
                          alt="" 
                        />
                      ))}
                    </div>
                  </td>

                  {/* Celda Acciones arreglada en horizontal sin superponerse */}
                  <td className="admin-menu-table-cell admin-menu-table-cell-actions">
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center" }}>
                      <button 
                        onClick={() => openEdit(p)} 
                        className="btn btn-secondary" 
                        style={{ padding: "8px 14px", fontSize: "13px", fontWeight: "600", margin: 0, borderRadius: "6px", cursor: "pointer" }}
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(p)} 
                        className="btn btn-tertiary" 
                        style={{ padding: "8px 14px", fontSize: "13px", fontWeight: "600", margin: 0, borderRadius: "6px", cursor: "pointer", backgroundColor: "#fff5f5", color: "#e53e3e", border: "1px solid #feb2b2" }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {confirmDeletePlate && (
        <div className="card" style={{ padding: "18px", background: "#ffffff", border: "1px solid #050505", marginTop: "16px" }}>
          <div className="admin-menu-confirm-text">
            ¿Eliminar "{confirmDeletePlate.nombre}"?
            <div className="admin-menu-confirm-meta">Capacidad: --</div>
          </div>
          <div className="admin-menu-confirm-actions">
            <button onClick={handleConfirmDelete} className="btn btn-primary" disabled={loading}>{loading ? "Eliminando..." : "Confirmar"}</button>
            <button onClick={handleCancelDelete} className="btn btn-secondary">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenu;
