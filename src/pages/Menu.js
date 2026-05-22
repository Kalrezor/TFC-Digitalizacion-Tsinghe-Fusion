// Vista: Menu.js
// Corrección de la alineación del texto "Frutos Secos" en la leyenda de alérgenos inferior.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../controllers/useAuth";
import menuService from "../models/MenuService";
import "../styles/ChineseStyle.css";

const Menu = ({ role: propsRole }) => {
  const navigate = useNavigate();
  const { role: authRole } = useAuth();
  
  const [plates, setPlates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allAllergens, setAllAllergens] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(false);
  
  // Estado para el filtro de alérgenos (exclusión)
  const [selectedAllergens, setSelectedAllergens] = useState([]);

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
    if (!editMode) return;
    const newStatus = plate.disponible === false;
    const result = await menuService.updatePlate(plate.id, { disponible: newStatus }, true);
    if (result.success) {
      setPlates(prev => prev.map(p => p.id === plate.id ? { ...p, disponible: newStatus } : p));
    }
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

      {/* FILTRO DE ALÉRGENOS - EN UNA ÚNICA FILA HORIZONTAL */}
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
              <img 
                src={ale.imagen} 
                alt={ale.nombre} 
                title={ale.nombre} 
                style={{ marginBottom: 0, width: "24px", height: "24px", objectFit: "contain" }} 
              />
              <span style={{ 
                fontSize: "10px", 
                fontWeight: "500", 
                textTransform: "capitalize",
                textAlign: "center",
                lineHeight: "1.1",
                wordBreak: "break-word"
              }}>
                {ale.nombre}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ACCESOS DIRECTOS */}
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
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "10px 18px"
              }}
            >
              {cat.imagen && (
                <img 
                  src={cat.imagen} 
                  alt="" 
                  style={{ 
                    width: "22px", 
                    height: "22px", 
                    objectFit: "contain",
                    flexShrink: 0
                  }} 
                />
              )}
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
                {cat.imagen && (
                  <img 
                    src={cat.imagen} 
                    alt="" 
                    style={{ 
                      width: "35px", 
                      height: "35px", 
                      objectFit: "contain",
                      flexShrink: 0
                    }} 
                  />
                )}
                <h2 className="category-title-text" style={{ margin: 0, whiteSpace: "nowrap" }}>
                  {cat.nombre}
                </h2>
                <div className="category-line-right" style={{ flexGrow: 1 }}></div>
              </div>
              <div className="plates-grid">
                {categoryPlates.map(plate => (
                  <div 
                    key={plate.id} 
                    className={`plate-card-public ${plate.disponible === false ? 'plate-off' : ''} ${editMode ? 'editable-card' : ''}`}
                    onClick={() => toggleAvailability(plate)}
                  >
                    <div className="plate-card-img">
                      <img src={plate.imagen} alt="" />
                      {plate.disponible === false && <div className="overlay-sold-out">AGOTADO</div>}
                    </div>
                    <div className="plate-card-info">
                      <div className="plate-header">
                        <h3 className="item-name">{plate.nombre}</h3>
                        <span className="plate-price">{parseFloat(plate.precio).toFixed(2)} €</span>
                      </div>
                      <p className="item-description">{plate.descripcion}</p>
                      <div className="plate-allergens-icons-row">
                        {plate.alergenos?.map(aleId => (
                          <img key={aleId} src={allAllergens[aleId]?.imagen} title={allAllergens[aleId]?.nombre} alt="" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* INFORMACIÓN DE ALÉRGENOS FIJADA Y ALINEADA EN EL PIE DE PÁGINA */}
      <div className="allergen-info-card footer-allergens">
        <div className="allergen-notice">
          <h3>Información de Alérgenos</h3>
          <p>Consulte a nuestro personal para más detalles.</p>
        </div>
        <div className="allergen-legend-grid" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px" }}>
          {Object.values(allAllergens).map(ale => (
            <div 
              key={ale.id} 
              className="allergen-legend-item"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                width: "80px",
                textAlign: "center"
              }}
            >
              <img src={ale.imagen} alt={ale.nombre} style={{ width: "22px", height: "22px", objectFit: "contain", marginBottom: "6px" }} />
              <span style={{ 
                fontSize: "10px", 
                fontWeight: "600", 
                textTransform: "uppercase", 
                letterSpacing: "0.5px",
                lineHeight: "1.2",
                display: "block",
                width: "100%"
              }}>
                {ale.nombre}
              </span>
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