// Vista: AdminMenu.js
// Vista de administración del menú para usuarios con rol de administrador.
// CRUD completo de platos vinculado a Firebase con Selectores Personalizados.

import React, { useState, useEffect, useRef } from "react";
import menuService from "../models/MenuService";
import "../styles/ChineseStyle.css";

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

  // Refs y Estados para los Selectores (Formulario y Filtro Tabla)
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

  // --- MANEJADORES ---
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
    setImagePreview(plate.imagen);
    setError(null);
    setSuccess(null);
  };

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
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ color: "#DC143C", margin: 0 }}>Administración de Menú</h1>
        <button onClick={openNew} disabled={loading} style={btnPrimary}>+ Nuevo Plato</button>
      </div>

      {error && <div style={alertError}>{error}</div>}
      {success && <div style={alertSuccess}>{success}</div>}

      {showForm && (
        <div style={{ background: "#fff8f0", border: "2px solid #DC143C", borderRadius: "10px", padding: "24px", marginBottom: "24px" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Nombre del Plato *</label>
                <input name="nombre" value={formData.nombre} onChange={handleChange} required style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Descripción</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={2} style={inputStyle} />
              </div>

              <div style={{ position: "relative", display: "inline-block", minWidth: "280px" }} ref={catRef}>
                <label style={labelStyle}>Categoría *</label>
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

              <div>
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
                         reader.onloadend = () => { setImagePreview(reader.result); setFormData(p => ({...p, imagen: reader.result})); };
                         reader.readAsDataURL(file);
                       }
                    }} />
                    <label htmlFor="img-upload" style={{ ...btnEdit, padding: "12px 20px", flex: 1, textAlign: "center" }}>Subir Imagen</label>
                    {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: "45px", height: "45px", borderRadius: "6px", objectFit: "cover", border: "1px solid #FFD700" }} />}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fff", padding: "10px", borderRadius: "6px", border: "1px solid #FFD700", width: "fit-content" }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>¿Disponible?</label>
                <input name="disponible" type="checkbox" checked={formData.disponible} onChange={handleChange} style={{ width: "18px", height: "18px", cursor: "pointer" }} />
                <span style={{ fontWeight: "bold", color: formData.disponible ? "#2e7d32" : "#DC143C", fontSize: "13px" }}>
                    {formData.disponible ? "SÍ" : "NO"}
                </span>
              </div>
            </div>
            <div style={{ marginTop: "25px", display: "flex", gap: "12px" }}>
              <button type="submit" style={btnPrimary}>Guardar Plato</button>
              <button type="button" onClick={() => setShowForm(false)} style={btnSecondary}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros fuera del formulario */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px", alignItems: "flex-end" }}>
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

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr style={{ background: "#DC143C", color: "#fff" }}>
              <th style={th}>Imagen</th>
              <th style={th}>Nombre</th>
              <th style={th}>Categoría</th>
              <th style={th}>Precio</th>
              <th style={th}>Estado</th>
              <th style={th}>Alérgenos</th>
              <th style={th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={td}><img src={p.imagen} alt="" style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }} /></td>
                <td style={td}><strong>{p.nombre}</strong></td>
                <td style={td}>{p.idCategoria}</td>
                <td style={td}>{parseFloat(p.precio || 0).toFixed(2)} €</td>
                <td style={td}>
                    <span style={{ 
                        color: p.disponible ? "#2e7d32" : "#DC143C", 
                        fontWeight: "bold", 
                        fontSize: "11px",
                        background: p.disponible ? "#e8f5e9" : "#ffebee",
                        padding: "4px 8px",
                        borderRadius: "12px"
                    }}>
                        {p.disponible ? "DISPONIBLE" : "NO DISPONIBLE"}
                    </span>
                </td>
                <td style={td}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {p.alergenos?.map(id => <img key={id} src={allAllergens[id]?.imagen} title={allAllergens[id]?.nombre} style={{ width: "20px" }} alt="" />)}
                  </div>
                </td>
                <td style={td}>
                  <button onClick={() => openEdit(p)} style={btnEditSmaller}>Editar</button>
                  <button onClick={() => {if(window.confirm("¿Eliminar?")) menuService.deletePlate(p.id, true).then(loadPlatesOnly)}} style={{...btnDelete, marginLeft: "5px"}}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- ESTILOS ---
const labelStyle = { display: "block", color: "#8B0000", fontWeight: "bold", marginBottom: "4px", fontSize: "12px" };
const inputStyle = { width: "100%", padding: "10px", border: "2px solid #FFD700", borderRadius: "6px", background: "#fff", boxSizing: "border-box" };
const customSelectTrigger = { ...inputStyle, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: "41px" };
const megaSelectDropdown = { position: "absolute", top: "100%", left: 0, minWidth: "450px", zIndex: 100, background: "#fff", border: "2px solid #FFD700", borderRadius: "6px", marginTop: "4px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", padding: "10px" };
const megaSelectGrid = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" };
const megaSelectItem = { padding: "8px", fontSize: "10px", borderRadius: "4px", cursor: "pointer", textAlign: "center", fontWeight: "bold", border: "1px solid #eee" };
const allergenRecuadroStyle = { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px", background: "#fff", padding: "15px", borderRadius: "8px", border: "2px solid #FFD700" };
const allergenItem = { display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", padding: "5px", borderRadius: "6px" };
const btnPrimary = { backgroundColor: "#DC143C", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const btnSecondary = { backgroundColor: "#888", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer" };
const btnEdit = { background: "#FFD700", color: "#1a1a1a", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", display: "inline-block" };
const btnEditSmaller = { ...btnEdit, padding: "6px 12px", fontSize: "12px" };
const btnDelete = { background: "#DC143C", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" };
const th = { padding: "12px", textAlign: "left" };
const td = { padding: "12px", verticalAlign: "middle" };
const alertError = { background: "#ffe0e0", color: "#8B0000", padding: "10px", marginBottom: "10px", borderRadius: "6px" };
const alertSuccess = { background: "#e0ffe0", color: "#2e7d32", padding: "10px", marginBottom: "10px", borderRadius: "6px" };

export default AdminMenu;