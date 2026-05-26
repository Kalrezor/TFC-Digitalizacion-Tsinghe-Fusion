// Vista: AdminMenu.js (Fragmento de la Tabla optimizado para legibilidad y holgura)

import React, { useState, useEffect, useRef } from "react";
import { toastSuccess, toastError } from "../services/ToastService";
import menuService from "../models/MenuService";
import "../styles/MinimalStyle.css";

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
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <h1 style={{ margin: 0 }}>Administración de Menú</h1>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", paddingTop: "16px" }}>
          <p style={{ margin: 0, color: "var(--text-light)" }}>Gestiona los platos del menú, categoría, alérgenos e imagen desde un panel editorial.</p>
          <button onClick={openNew} disabled={loading} className="btn btn-primary">+ Nuevo Plato</button>
        </div>
      </div>

      {error && <div style={alertError}>{error}</div>}
      {success && <div style={alertSuccess}>{success}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <h3>{editingId ? "Editar Plato" : "Nuevo Plato"}</h3>
          </div>
          <div style={{ padding: "22px" }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group">
                  <label>Nombre del Plato *</label>
                  <input name="nombre" value={formData.nombre} onChange={handleChange} className="form-control" />
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={2} className="form-control" />
                </div>

                <div className="form-group" style={{ position: "relative", display: "inline-block", minWidth: "280px" }} ref={catRef}>
                  <label>Categoría *</label>
                  <div onClick={() => setIsOpenCat(!isOpenCat)} style={customSelectTrigger}>
                    <span style={{ fontWeight: formData.idCategoria ? "bold" : "normal" }}>{selectedCatName.toUpperCase()}</span>
                    <span>{isOpenCat ? "▲" : "▼"}</span>
                  </div>
                  {isOpenCat && (
                    <div style={megaSelectDropdown}>
                      <div style={megaSelectGrid}>
                        {categories.map((cat) => (
                          <div key={cat.id} onClick={() => { setFormData(p => ({ ...p, idCategoria: cat.id })); setIsOpenCat(false); }}
                            style={{ ...megaSelectItem, backgroundColor: formData.idCategoria === cat.id ? "#DC143C" : "transparent", color: formData.idCategoria === cat.id ? "#fff" : "#333" }}>
                            {cat.nombre.toUpperCase()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label style={labelStyle}>Alérgenos</label>
                  <div style={allergenRecuadroStyle}>
                    {Object.values(allAllergens).map(ale => (
                      <div key={ale.id} onClick={() => handleAlergenoToggle(ale.id)}
                        style={{ ...allergenItem, border: formData.alergenos.includes(ale.id) ? "2px solid #DC143C" : "1px solid #eee", background: formData.alergenos.includes(ale.id) ? "#fff1f1" : "transparent" }}>
                        <img src={ale.imagen} alt="" style={{ width: "30px", height: "30px" }} />
                        <span style={{ fontSize: "9px" }}>{ale.nombre}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "end" }}>
                  <div>
                    <label style={labelStyle}>Precio (€) *</label>
                    <input name="precio" type="text" value={formData.precio} onChange={handleChange} placeholder="0.00" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Imagen del Plato</label>
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

                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--pearl-light)", padding: "12px", borderRadius: "6px", border: "1px solid var(--border-light)", width: "fit-content" }}>
                  <label style={{ marginBottom: 0, fontWeight: 700 }}>Disponible?</label>
                  <input name="disponible" type="checkbox" checked={formData.disponible} onChange={handleChange} style={{ width: "18px", height: "18px", cursor: "pointer" }} />
                  <span style={{ fontWeight: "bold", color: formData.disponible ? "var(--emerald)" : "#DC143C", fontSize: "13px" }}>
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
        <div style={{ display: "flex", gap: "15px", marginBottom: "20px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, maxWidth: "300px" }}>
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar plato..." style={inputStyle} />
          </div>

          <div style={{ position: "relative", display: "inline-block", minWidth: "280px" }} ref={filterRef}>
            <label style={labelStyle}>Filtrar por Categoría:</label>
            <div onClick={() => setIsOpenFilter(!isOpenFilter)} style={customSelectTrigger}>
              <span style={{ fontWeight: filterCat === "all" ? "normal" : "bold" }}>{filterCatName.toUpperCase()}</span>
              <span>{isOpenFilter ? "▲" : "▼"}</span>
            </div>
            {isOpenFilter && (
              <div style={megaSelectDropdown}>
                <div style={megaSelectGrid}>
                  <div onClick={() => { setFilterCat("all"); setIsOpenFilter(false); }}
                    style={{ ...megaSelectItem, backgroundColor: filterCat === "all" ? "#DC143C" : "transparent", color: filterCat === "all" ? "#fff" : "#333" }}>
                    TODAS
                  </div>
                  {categories.map((cat) => (
                    <div key={cat.id} onClick={() => { setFilterCat(cat.id); setIsOpenFilter(false); }}
                      style={{ ...megaSelectItem, backgroundColor: filterCat === cat.id ? "#DC143C" : "transparent", color: filterCat === cat.id ? "#fff" : "#333" }}>
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
              <th style={{ ...th, padding: "18px 14px" }}>Imagen</th>
              <th style={{ ...th, padding: "18px 14px" }}>Nombre</th>
              <th style={{ ...th, padding: "18px 14px" }}>Categoría</th>
              <th style={{ ...th, padding: "18px 14px" }}>Precio</th>
              <th style={{ ...th, padding: "18px 14px" }}>Estado</th>
              <th style={{ ...th, padding: "18px 14px" }}>Alérgenos</th>
              <th style={{ ...th, padding: "18px 14px", textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const tableImg = p.imagen && p.imagen.trim() !== "" ? p.imagen : DEFAULT_PLATE_IMAGE;

              return (
                <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0", transition: "background 0.2s" }} className="table-row-hover">
                  {/* Celda Imagen */}
                  <td style={{ ...td, padding: "20px 14px" }}>
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
                  <td style={{ ...td, padding: "20px 14px", fontSize: "15px" }}>
                    <strong style={{ color: "#111" }}>{p.nombre}</strong>
                  </td>

                  {/* Celda Categoría */}
                  <td style={{ ...td, padding: "20px 14px", color: "#666", textTransform: "capitalize", fontSize: "14px" }}>
                    {p.idCategoria}
                  </td>

                  {/* Celda Precio */}
                  <td style={{ ...td, padding: "20px 14px", fontWeight: "600", color: "#111", fontSize: "14px" }}>
                    {parseFloat(p.precio || 0).toFixed(2)} €
                  </td>

                  {/* Celda Estado (No disponible / Disponible) mas espacioso */}
                  <td style={{ ...td, padding: "20px 14px" }}>
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
                  <td style={{ ...td, padding: "20px 14px" }}>
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
                  <td style={{ ...td, padding: "20px 14px", textAlign: "center" }}>
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
        <div className="card" style={{ padding: "18px", background: "var(--pearl-light)", border: "1px solid var(--border-light)", marginTop: "16px" }}>
          <div style={confirmText}>
            ¿Eliminar "{confirmDeletePlate.nombre}"?
            <div style={confirmMeta}>Capacidad: --</div>
          </div>
          <div style={confirmActions} { ...confirmActions }>
            <button onClick={handleConfirmDelete} className="btn btn-primary" disabled={loading}>{loading ? "Eliminando..." : "Confirmar"}</button>
            <button onClick={handleCancelDelete} className="btn btn-secondary">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- ESTILOS ---
const labelStyle = { display: "block", color: "var(--text-muted)", fontWeight: "700", marginBottom: "6px", fontSize: "13px" };
const inputStyle = { width: "100%", padding: "12px 14px", border: "1px solid var(--border-light)", borderRadius: "8px", background: "var(--pearl-light)", boxSizing: "border-box" };
const customSelectTrigger = { ...inputStyle, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: "44px" };
const megaSelectDropdown = { position: "absolute", top: "100%", left: 0, minWidth: "420px", zIndex: 100, background: "#fff", border: "1px solid var(--border-light)", borderRadius: "10px", marginTop: "8px", boxShadow: "0 20px 50px rgba(15, 23, 42, 0.5)", padding: "14px" };
const megaSelectGrid = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" };
const megaSelectItem = { padding: "12px", fontSize: "12px", borderRadius: "8px", cursor: "pointer", textAlign: "center", fontWeight: "700", border: "1px solid var(--border-light)" };
const allergenRecuadroStyle = { display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "10px", background: "var(--pearl-light)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-light)" };
const allergenItem = { display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", padding: "10px", borderRadius: "8px" };
const th = { padding: "14px", textAlign: "left" };
const td = { padding: "14px", verticalAlign: "middle" };
const alertError = { background: "#FEF2F2", color: "#991B1B", padding: "12px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #FECACA" };
const alertSuccess = { background: "#ECFDF5", color: "#14532D", padding: "12px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #A7F3D0" };
const confirmText = { color: "var(--text-dark)", fontSize: "15px", fontWeight: "700" };
const confirmMeta = { color: "var(--text-muted)", fontSize: "13px", fontWeight: "400", marginTop: "6px" };
const confirmActions = { display: "flex", gap: "10px", flexWrap: "wrap" };

export default AdminMenu;