// Vista: Menu.js
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

  const handleDragStart = (e, index) => {
    if (!editMode) return;
    e.dataTransfer.setData("index", index);
  };

  const handleDrop = async (e, targetIndex) => {
    if (!editMode) return;
    const sourceIndex = e.dataTransfer.getData("index");
    if (sourceIndex === targetIndex) return;

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
        <div className="admin-edit-toolbar">
          <div className="toolbar-info">
            <span className="admin-badge">MODO ADMINISTRADOR</span>
            <p>{editMode ? "Arrastra categorías o clica platos" : "Modo lectura"}</p>
          </div>
          <button className={`btn-toggle-edit ${editMode ? 'active' : ''}`} onClick={() => setEditMode(!editMode)}>
            {editMode ? "GUARDAR Y CERRAR" : "GESTIONAR CARTA"}
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

      <div className="category-anchors-grid">
        {categories.map(cat => (
          <a key={cat.id} href={`#cat-${cat.id}`} className="anchor-btn">
            {cat.nombre.toUpperCase()}
          </a>
        ))}
      </div>

      <div className="menu-sections">
        {categories.map((cat, index) => {
          const categoryPlates = plates.filter(p => 
            p.idCategoria === cat.id && p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
          );
          if (categoryPlates.length === 0 && !editMode) return null;

          return (
            <section key={cat.id} id={`cat-${cat.id}`} className="category-section"
              draggable={editMode} onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, index)}
            >
              <div className={`category-header-row ${editMode ? 'draggable-cursor' : ''}`}>
                <h2 className="category-title-text">
                  {editMode && <span className="drag-handle">≡</span>}
                  {cat.nombre}
                </h2>
                <div className="category-line-right"></div>
              </div>
              <div className="plates-grid">
                {categoryPlates.map(plate => (
                  <div key={plate.id} className={`plate-card-public ${plate.disponible === false ? 'plate-off' : ''}`}
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

      {/* --- LEYENDA DE ALÉRGENOS --- */}
      <div className="allergen-info-card footer-allergens">
        <div className="allergen-notice">
          <h3>Información de Alérgenos</h3>
          <p>Cualquier duda consulte a nuestro personal o llame al restaurante.</p>
        </div>
        <div className="allergen-legend-grid">
          {Object.values(allAllergens).map(ale => (
            <div key={ale.id} className="allergen-legend-item">
              <img src={ale.imagen} alt={ale.nombre} />
              <span>{ale.nombre}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- BOTÓN DE RESERVA MEJORADO --- */}
      <section className="menu-cta-container">
        <button 
          onClick={() => navigate("/dashboard", { state: { selectedTab: "nueva-reserva" } })} 
          className="cta-main-button"
        >
          <span className="cta-icon">{isAdmin ? "" : ""}</span>
          <span className="cta-text">
            {isAdmin ? "VOLVER AL PANEL DE CONTROL" : (authRole ? "REALIZAR UNA RESERVA" : "INICIA SESIÓN PARA RESERVAR")}
          </span>
        </button>
      </section>
    </div>
  );
};

export default Menu;
