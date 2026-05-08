// Vista: Menu.js
// Componente para mostrar el men� del restaurante
// Visible sin login, con funcionalidad de b�squeda y filtrado por categor�a

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../controllers/useAuth";
import MenuService from "../models/MenuService";
import "../styles/ChineseStyle.css";

const Menu = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  // Cargar men�s al montar el componente
  useEffect(() => {
    const loadMenus = async () => {
      setLoading(true);
      const result = await MenuService.getAllMenus();

      if (result.success) {
        setAllMenuItems(result.menus);
        // Extraer categor�as �nicas
        const uniqueCategories = [
          ...new Set(
            result.menus.map((item) => item.category || "Sin categor�a"),
          ),
        ];
        setCategories(uniqueCategories);
        setFilteredItems(result.menus);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };

    loadMenus();
  }, []);

  // Filtrar items por b�squeda y categor�a
  useEffect(() => {
    let filtered = allMenuItems;

    // Filtrar por categor�a
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (item) => (item.category || "Sin categor�a") === selectedCategory,
      );
    }

    // Filtrar por b�squeda
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(search)) ||
          (item.description && item.description.toLowerCase().includes(search)),
      );
    }

    setFilteredItems(filtered);
  }, [searchTerm, selectedCategory, allMenuItems]);

  const handleReserveClick = () => {
    if (!user) {
      navigate("/login");
    } else {
      navigate("/dashboard", { state: { selectedTab: "nueva-reserva" } });
    }
  };

  if (loading) {
    return (
      <div className="menu-container">
        <div className="loading">Cargando men�...</div>
      </div>
    );
  }

  return (
    <div className="menu-container">
      {/* Header del Men� */}
      <div className="menu-header">
        <div className="header-content">
          <button onClick={() => navigate("/")} className="back-button">
            ? Volver al Inicio
          </button>
          <h1>?? Men� del Restaurante</h1>
          <p className="menu-subtitle">Descubre nuestras deliciosas opciones</p>
        </div>
      </div>

      {/* Controles de b�squeda y filtrado */}
      <div className="menu-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="?? Buscar plato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filter">
          <button
            className="category-btn"
            onClick={() => setSelectedCategory("all")}
          >
            Todos ({allMenuItems.length})
          </button>
          {categories.map((category) => {
            const count = allMenuItems.filter(
              (item) => (item.category || "Sin categoría") === category,
            ).length;
            return (
              <button
                key={category}
                className="category-btn"
                onClick={() => setSelectedCategory(category)}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Mensaje de error */}
      {error && <div className="error-message">Error: {error}</div>}

      {/* Resultado de b�squeda */}
      {filteredItems.length === 0 ? (
        <div className="no-results">
          <p>No se encontraron platos</p>
          {searchTerm && (
            <p className="search-hint">Intenta con otro t�rmino de b�squeda</p>
          )}
        </div>
      ) : (
        <div className="menu-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="menu-item-card">
              {/* Imagen del plato */}
              <div className="item-image">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="image-placeholder">???</div>
                )}
              </div>

              {/* Informaci�n del plato */}
              <div className="item-content">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-category">
                  {item.category || "Sin categor�a"}
                </p>

                {item.description && (
                  <p className="item-description">{item.description}</p>
                )}

                {item.allergens &&
                  Array.isArray(item.allergens) &&
                  item.allergens.length > 0 && (
                    <div className="item-allergens">
                      <span className="allergen-label">?? Al�rgenos:</span>
                      <div className="allergen-list">
                        {item.allergens.map((allergen, idx) => (
                          <span key={idx} className="allergen-tag">
                            {allergen}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {item.price && (
                  <div className="item-footer">
                    <span className="item-price">�{item.price.toFixed(2)}</span>
                    {item.available === false && (
                      <span className="unavailable-badge">No disponible</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to Action para Reservar */}
      <section className="menu-cta">
        <h2>�Te apetece probar nuestros platos?</h2>
        {!user ? (
          <div className="cta-buttons">
            <button
              onClick={() => navigate("/login")}
              className="btn-primary btn-large"
            >
              🔐 Inicia Sesión para Reservar
            </button>
            <p className="cta-secondary-text">
              ¿No tienes cuenta?{" "}
              <button
                onClick={() => navigate("/register")}
                className="link-btn"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        ) : (
          <button
            onClick={handleReserveClick}
            className="btn-primary btn-large"
          >
            📅 Reservar una Mesa
          </button>
        )}
      </section>
    </div>
  );
};

export default Menu;
