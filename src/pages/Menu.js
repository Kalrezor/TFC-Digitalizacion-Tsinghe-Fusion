// Vista: Menu.js
// Ajuste de imágenes avanzado con soporte para imagen predeterminada por defecto.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../controllers/useAuth";
import menuService from "../models/MenuService";
import "../styles/ChineseStyle.css";

// URL global de la imagen por defecto subida a Firebase
const DEFAULT_PLATE_IMAGE = "https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/plate%2FImgNoDisp.png?alt=media&token=67746171-489f-4b93-98dd-d744784fa37f";

const Menu = ({ role: propsRole }) => {
  const navigate = useNavigate();
  const { role: authRole } = useAuth();
  
  const [plates, setPlates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allAllergens, setAllAllergens] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [selectedPlate, setSelectedPlate] = useState(null);

  const currentRole = propsRole || authRole;
  const isAdmin = currentRole === "admin";

  useEffect(() => {
    loadData();
  }, [isAdmin, editMode]);

  const loadData = async () => {
    setLoading(true);
    const [resAllergens, resCats, resPlates] = await Promise.all([
      menuService.getAllAllergens(),
      menuService.getAllCategories(),
      menuService.getAllPlates()
    ]);

    if (resAllergens.success) setAllAllergens(resAllergens.data);
    
    if (resCats.success) {
      const sortedCats = resCats.data.sort((a, b) => (a.orden || 0) - (b.orden || 0));
      setCategories(sortedCats);
    }
    
    if (resPlates.success) {
      const visiblePlates = editMode 
        ? resPlates.data 
        : resPlates.data.filter(p => p.disponible !== false);
      setPlates(visiblePlates);
    }
    setLoading(false);
  };

  const handleAllergenToggle = (id) => {
    setSelectedAllergens(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleDragStart = (e, index) => {
    if (!editMode) return;
    e.dataTransfer.setData("index", index);
  };

  const handleDrop = async (e, targetIndex) => {
    if (!editMode) return;
    const sourceIndex = e.dataTransfer.getData("index");
    if (sourceIndex == targetIndex) return;
    const newCategories = [...categories];
    const [removed] = newCategories.splice(sourceIndex, 1);
    newCategories.splice(targetIndex, 0, removed);
    setCategories(newCategories);
    for (let i = 0; i < newCategories.length; i++) {
      await menuService.updateCategory(newCategories[i].id, { orden: i }, true);
    }
  };

  const toggleAvailability = async (plate) => {
    const newStatus = plate.disponible === false;
    const result = await menuService.updatePlate(plate.id, { disponible: newStatus }, true);
    if (result.success) {
      setPlates(prev => prev.map(p => p.id === plate.id ? { ...p, disponible: newStatus } : p));
    }
  };

  const getFilteredPlatesList = () => {
    const orderedPlates = [];
    
    categories.forEach(cat => {
      const categoryPlates = plates.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const belongsToCat = p.idCategoria === cat.id;
        const hasExcludedAllergen = p.alergenos?.some(aleId => selectedAllergens.includes(aleId));
        return belongsToCat && matchesSearch && !hasExcludedAllergen;
      });
      
      orderedPlates.push(...categoryPlates);
    });

    return orderedPlates;
  };

  const handlePlateClick = (plate) => {
    if (editMode) {
      toggleAvailability(plate);
    } else {
      setSelectedPlate(plate);
    }
  };

  const handlePrevPlate = (e) => {
    e.stopPropagation();
    const currentList = getFilteredPlatesList();
    const currentIndex = currentList.findIndex(p => p.id === selectedPlate.id);
    if (currentIndex === -1) return;
    
    const prevIndex = currentIndex === 0 ? currentList.length - 1 : currentIndex - 1;
    setSelectedPlate(currentList[prevIndex]);
  };

  const handleNextPlate = (e) => {
    e.stopPropagation();
    const currentList = getFilteredPlatesList();
    const currentIndex = currentList.findIndex(p => p.id === selectedPlate.id);
    if (currentIndex === -1) return;

    const nextIndex = currentIndex === currentList.length - 1 ? 0 : currentIndex + 1;
    setSelectedPlate(currentList[nextIndex]);
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div></div>;

  return (
    <div className="menu-container">
      {isAdmin && (
        <div className="admin-edit-toolbar-compact">
          <button 
            className={`btn-toggle-edit ${editMode ? 'active' : ''}`} 
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "SALIR Y GUARDAR" : "GESTIONAR ESTRUCTURA"}
          </button>
        </div>
      )}

      <div className="menu-header">
        <div className="header-content">
          <h1>Nuestra Carta</h1>
        </div>
      </div>

      <div className="menu-search-section">
        <input 
          type="text" 
          placeholder="Buscar plato..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input-wide"
        />
      </div>

      <div className="allergen-filter-wrapper">
        <p className="filter-label">Excluir platos con:</p>
        <div 
          className="allergen-filter-grid"
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            overflowX: "auto",
            justifyContent: "center",
            gap: "8px",
            padding: "10px 4px",
            width: "100%"
          }}
        >
          {Object.values(allAllergens).map(ale => (
            <button 
              key={ale.id}
              className={`allergen-filter-btn ${selectedAllergens.includes(ale.id) ? 'active' : ''}`}
              onClick={() => handleAllergenToggle(ale.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                padding: "6px",
                aspectRatio: "1 / 1",
                width: "75px",
                minWidth: "75px",
                height: "75px",
                flexShrink: 0
              }}
            >
              <img src={ale.imagen} alt={ale.nombre} style={{ width: "24px", height: "24px", objectFit: "contain" }} />
              <span style={{ fontSize: "10px", fontWeight: "500", textTransform: "capitalize", textAlign: "center" }}>
                {ale.nombre}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className={`category-anchors-grid ${editMode ? 'edit-active' : ''}`}>
        {categories.map((cat, index) => (
          <div
            key={cat.id}
            draggable={editMode}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, index)}
            className={`anchor-wrapper ${editMode ? 'draggable-anchor' : ''}`}
          >
            <a 
              href={editMode ? null : `#cat-${cat.id}`} 
              className="anchor-btn"
              style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "10px 18px" }}
            >
              {cat.imagen && <img src={cat.imagen} alt="" style={{ width: "22px", height: "22px", objectFit: "contain" }} />}
              <span>{cat.nombre.toUpperCase()}</span>
            </a>
          </div>
        ))}
      </div>

      <div className="menu-sections">
        {categories.map((cat) => {
          const categoryPlates = plates.filter(p => {
            const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            const belongsToCat = p.idCategoria === cat.id;
            const hasExcludedAllergen = p.alergenos?.some(aleId => selectedAllergens.includes(aleId));
            return belongsToCat && matchesSearch && !hasExcludedAllergen;
          });

          if (categoryPlates.length === 0 && !editMode) return null;

          return (
            <section key={cat.id} id={`cat-${cat.id}`} className="category-section">
              <div className="category-header-row" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                {cat.imagen && <img src={cat.imagen} alt="" style={{ width: "35px", height: "35px", objectFit: "contain" }} />}
                <h2 className="category-title-text" style={{ margin: 0 }}>{cat.nombre}</h2>
                <div className="category-line-right" style={{ flexGrow: 1 }}></div>
              </div>
              <div className="plates-grid">
                {categoryPlates.map(plate => {
                  // Validación dinámica: si no tiene imagen o está vacía, inyecta la de por defecto
                  const currentImg = plate.imagen && plate.imagen.trim() !== "" ? plate.imagen : DEFAULT_PLATE_IMAGE;

                  return (
                    <div 
                      key={plate.id} 
                      className={`plate-card-public ${plate.disponible === false ? 'plate-off' : ''} ${editMode ? 'editable-card' : ''}`}
                      onClick={() => handlePlateClick(plate)}
                      style={{ display: "flex", alignItems: "stretch" }} 
                    >
                      <div 
                        className="plate-card-img" 
                        style={{ 
                          display: "flex", 
                          justifyContent: "center", 
                          alignItems: "center", 
                          backgroundColor: "#ffffff", 
                          overflow: "hidden",
                          position: "relative",
                          width: "140px",      
                          minWidth: "140px",   
                          height: "100%",     
                          padding: "8px",   
                          boxSizing: "border-box"
                        }}
                      >
                        <img 
                          src={currentImg} 
                          alt="" 
                          style={{ 
                            maxWidth: "100%", 
                            maxHeight: "100%", 
                            width: "auto",   
                            height: "auto",   
                            objectFit: "contain",
                            display: "block",
                            margin: "0 auto" 
                          }} 
                        />
                        {plate.disponible === false && <div className="overlay-sold-out">AGOTADO</div>}
                      </div>
                      
                      <div className="plate-card-info" style={{ flexGrow: 1 }}>
                        <div className="plate-header">
                          <h3 className="item-name">{plate.nombre}</h3>
                          <span className="plate-price">{parseFloat(plate.precio).toFixed(2)} €</span>
                        </div>
                        <div className="plate-allergens-icons-row">
                          {plate.alergenos?.map(aleId => (
                            <img key={aleId} src={allAllergens[aleId]?.imagen} title={allAllergens[aleId]?.nombre} alt="" />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* --- POP-UP / MODAL DEL PLATO --- */}
      {selectedPlate && (
        <div 
          className="modal-overlay" 
          onClick={() => setSelectedPlate(null)}
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center",
            alignItems: "center", zIndex: 3000, backdropFilter: "blur(4px)"
          }}
        >
          <div style={{ position: "relative", width: "90%", maxWidth: "600px" }}>
            
            {/* Flecha Izquierda */}
            <button
              onClick={handlePrevPlate}
              style={{
                position: "absolute", left: "-25px", top: "50%", transform: "translateY(-50%)",
                background: "#f4f4f4", border: "1px solid #ddd", borderRadius: "50%", 
                width: "45px", height: "45px", cursor: "pointer", zIndex: 3100, fontSize: "16px", 
                display: "flex", alignItems: "center", justifyContent: "center", color: "#555",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)", transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => { e.target.style.background = "#e9e9e9"; e.target.style.color = "#000"; }}
              onMouseLeave={(e) => { e.target.style.background = "#f4f4f4"; e.target.style.color = "#555"; }}
            >
              ◀
            </button>

            {/* Recuadro del Contenido */}
            <div 
              className="modal-content-plate" 
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white", width: "100%", borderRadius: "12px",
                overflow: "hidden", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.25)"
              }}
            >
              <button 
                onClick={() => setSelectedPlate(null)}
                style={{
                  position: "absolute", top: "15px", right: "15px", background: "white",
                  border: "1px solid #aaa", borderRadius: "50%", width: "30px", height: "30px",
                  cursor: "pointer", zIndex: 10, fontWeight: "bold", color: "#555"
                }}
              >
                ✕
              </button>
              
              {/* Contenedor Pop-up Inteligente con imagen por defecto reactiva */}
              <div 
                style={{ 
                  width: "100%", 
                  height: "320px", 
                  overflow: "hidden", 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center", 
                  backgroundColor: "#ffffff",
                  padding: "15px",
                  boxSizing: "border-box"
                }}
              >
                <img 
                  src={selectedPlate.imagen && selectedPlate.imagen.trim() !== "" ? selectedPlate.imagen : DEFAULT_PLATE_IMAGE} 
                  alt={selectedPlate.nombre} 
                  style={{ 
                    maxWidth: "100%", 
                    maxHeight: "100%", 
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                    display: "block",
                    margin: "0 auto"
                  }} 
                />
              </div>
              
              <div style={{ padding: "30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                  <h2 style={{ fontFamily: "Georgia, serif", fontSize: "28px", margin: 0, fontWeight: "400" }}>
                    {selectedPlate.nombre}
                  </h2>
                  <span style={{ fontSize: "22px", fontWeight: "700", color: "#050505" }}>
                    {parseFloat(selectedPlate.precio).toFixed(2)} €
                  </span>
                </div>
                
                <p style={{ color: "#444", fontSize: "16px", lineHeight: "1.6", marginBottom: "25px" }}>
                  {selectedPlate.descripcion}
                </p>
                
                <div style={{ borderTop: "1px solid #eee", paddingTop: "15px" }}>
                  <h4 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px", color: "#888" }}>
                    Información de Alérgenos
                  </h4>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {selectedPlate.alergenos?.length > 0 ? (
                      selectedPlate.alergenos.map(aleId => (
                        <div key={aleId} style={{ display: "flex", alignItems: "center", gap: "5px", background: "#f9f9f9", padding: "5px 10px", borderRadius: "20px", border: "1px solid #eee" }}>
                          <img src={allAllergens[aleId]?.imagen} alt="" style={{ width: "18px", height: "18px" }} />
                          <span style={{ fontSize: "12px", fontWeight: "600" }}>{allAllergens[aleId]?.nombre}</span>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: "13px", color: "#aaa" }}>Sin alérgenos declarados.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Flecha Derecha */}
            <button
              onClick={handleNextPlate}
              style={{
                position: "absolute", right: "-25px", top: "50%", transform: "translateY(-50%)",
                background: "#f4f4f4", border: "1px solid #ddd", borderRadius: "50%", 
                width: "45px", height: "45px", cursor: "pointer", zIndex: 3100, fontSize: "16px", 
                display: "flex", alignItems: "center", justifyContent: "center", color: "#555",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)", transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => { e.target.style.background = "#e9e9e9"; e.target.style.color = "#000"; }}
              onMouseLeave={(e) => { e.target.style.background = "#f4f4f4"; e.target.style.color = "#555"; }}
            >
              ▶
            </button>

          </div>
        </div>
      )}

      {/* FOOTER DE ALÉRGENOS */}
      <div className="allergen-info-card footer-allergens">
        <div className="allergen-notice">
          <h3>Información de Alérgenos</h3>
          <p>Consulte a nuestro personal para más detalles.</p>
        </div>
        <div className="allergen-legend-grid" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px" }}>
          {Object.values(allAllergens).map(ale => (
            <div key={ale.id} className="allergen-legend-item" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "80px" }}>
              <img src={ale.imagen} alt={ale.nombre} style={{ width: "22px", height: "22px", marginBottom: "6px" }} />
              <span style={{ fontSize: "10px", fontWeight: "600", textTransform: "uppercase", textAlign: "center" }}>{ale.nombre}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="menu-cta-container">
        <button
          onClick={() => {
            if (isAdmin) {
              navigate("/dashboard?section=inicio");
              return;
            }
            const reservePath = "/dashboard?section=reservas";
            if (authRole) {
              navigate(reservePath);
            } else {
              navigate(`/login?next=${encodeURIComponent(reservePath)}`);
            }
          }}
          className="cta-main-button"
        >
          <span className="cta-text">
            {isAdmin ? "VOLVER AL PANEL DE CONTROL" : (authRole ? "RESERVAR MESA" : "INICIA SESIÓN PARA RESERVAR")}
          </span>
        </button>
      </section>
    </div>
  );
};

export default Menu;