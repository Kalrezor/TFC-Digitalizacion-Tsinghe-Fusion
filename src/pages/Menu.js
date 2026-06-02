// Vista: Menu.js
// Ajuste de imágenes avanzado con soporte para imagen predeterminada por defecto.

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import plateService from "../services/PlateService";

// URL global de la imagen por defecto subida a Firebase
const DEFAULT_PLATE_IMAGE =
  "https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/plate%2FImgNoDisp.png?alt=media&token=67746171-489f-4b93-98dd-d744784fa37f";

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
  const menuTopRef = useRef(null);

  const currentRole = propsRole || authRole;
  const isAdmin = currentRole === "admin";

  useEffect(() => {
    loadData();
  }, [isAdmin, editMode]);

  const loadData = async () => {
    setLoading(true);
    const [resAllergens, resCats, resPlates] = await Promise.all([
      plateService.getAllAllergens(),
      plateService.getAllCategories(),
      plateService.getAllPlates(),
    ]);

    if (resAllergens.success) setAllAllergens(resAllergens.data);

    if (resCats.success) {
      const sortedCats = resCats.data.sort(
        (a, b) => (a.orden || 0) - (b.orden || 0),
      );
      setCategories(sortedCats);
    }

    if (resPlates.success) {
      const visiblePlates = editMode
        ? resPlates.data
        : resPlates.data.filter((p) => p.disponible !== false);
      setPlates(visiblePlates);
    }
    setLoading(false);
  };

  const handleAllergenToggle = (id) => {
    setSelectedAllergens((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const handleDragStart = (e, index) => {
    if (!editMode) return;
    e.dataTransfer.setData("index", index);
  };

  const handleDrop = async (e, targetIndex) => {
    if (!editMode) return;
    const sourceIndex = e.dataTransfer.getData("index");
    if (sourceIndex === String(targetIndex)) return;
    const newCategories = [...categories];
    const [removed] = newCategories.splice(sourceIndex, 1);
    newCategories.splice(targetIndex, 0, removed);
    setCategories(newCategories);
    for (let i = 0; i < newCategories.length; i++) {
      await plateService.updateCategory(
        newCategories[i].id,
        { orden: i },
        true,
      );
    }
  };

  const toggleAvailability = async (plate) => {
    const newStatus = plate.disponible === false;
    const result = await plateService.updatePlate(
      plate.id,
      { disponible: newStatus },
      true,
    );
    if (result.success) {
      setPlates((prev) =>
        prev.map((p) =>
          p.id === plate.id ? { ...p, disponible: newStatus } : p,
        ),
      );
    }
  };

  const getFilteredPlatesList = () => {
    const orderedPlates = [];

    categories.forEach((cat) => {
      const categoryPlates = plates.filter((p) => {
        const matchesSearch = p.nombre
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const belongsToCat = p.idCategoria === cat.id;
        const hasExcludedAllergen = p.alergenos?.some((aleId) =>
          selectedAllergens.includes(aleId),
        );
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
    const currentIndex = currentList.findIndex(
      (p) => p.id === selectedPlate.id,
    );
    if (currentIndex === -1) return;

    const prevIndex =
      currentIndex === 0 ? currentList.length - 1 : currentIndex - 1;
    setSelectedPlate(currentList[prevIndex]);
  };

  const handleNextPlate = (e) => {
    e.stopPropagation();
    const currentList = getFilteredPlatesList();
    const currentIndex = currentList.findIndex(
      (p) => p.id === selectedPlate.id,
    );
    if (currentIndex === -1) return;

    const nextIndex =
      currentIndex === currentList.length - 1 ? 0 : currentIndex + 1;
    setSelectedPlate(currentList[nextIndex]);
  };

  const findScrollContainer = (element) => {
    let node = element;
    while (node && node !== document.body) {
      const style = window.getComputedStyle(node);
      const overflowY = style.overflowY;
      if (
        (overflowY === "auto" ||
          overflowY === "scroll" ||
          overflowY === "overlay") &&
        node.scrollHeight > node.clientHeight
      ) {
        return node;
      }
      node = node.parentElement;
    }
    return (
      document.scrollingElement || document.documentElement || document.body
    );
  };

  const scrollToMenuTop = () => {
    const topElement = menuTopRef.current;
    if (!topElement) return;

    const scrollContainer = findScrollContainer(topElement);
    if (scrollContainer && typeof scrollContainer.scrollTo === "function") {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (typeof window.scrollTo === "function") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    topElement.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );

  return (
    <div className="menu-container" ref={menuTopRef}>
      {isAdmin && (
        <div className="admin-edit-toolbar-compact">
          <button
            className={`btn-toggle-edit ${editMode ? "active" : ""}`}
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
        <div className="allergen-filter-grid">
          {Object.values(allAllergens).map((ale) => (
            <button
              key={ale.id}
              className={`allergen-filter-btn ${selectedAllergens.includes(ale.id) ? "active" : ""}`}
              onClick={() => handleAllergenToggle(ale.id)}
            >
              <img src={ale.imagen} alt={ale.nombre} />
              <span>{ale.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={`category-anchors-grid ${editMode ? "edit-active" : ""}`}>
        {categories.map((cat, index) => (
          <div
            key={cat.id}
            draggable={editMode}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, index)}
            className={`anchor-wrapper ${editMode ? "draggable-anchor" : ""}`}
          >
            {editMode ? (
              <button type="button" className="anchor-btn menu-anchor-button">
                {cat.imagen && <img src={cat.imagen} alt="" />}
                <span>{cat.nombre.toUpperCase()}</span>
              </button>
            ) : (
              <a href={`#cat-${cat.id}`} className="anchor-btn">
                {cat.imagen && <img src={cat.imagen} alt="" />}
                <span>{cat.nombre.toUpperCase()}</span>
              </a>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="menu-back-to-top"
        onClick={scrollToMenuTop}
        aria-label="Volver al inicio de la carta"
      >
        ↑
      </button>

      <div className="menu-sections">
        {categories.map((cat) => {
          const categoryPlates = plates.filter((p) => {
            const matchesSearch = p.nombre
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
            const belongsToCat = p.idCategoria === cat.id;
            const hasExcludedAllergen = p.alergenos?.some((aleId) =>
              selectedAllergens.includes(aleId),
            );
            return belongsToCat && matchesSearch && !hasExcludedAllergen;
          });

          if (categoryPlates.length === 0 && !editMode) return null;
          const plateGridColumns =
            categoryPlates.length === 1
              ? 1
              : categoryPlates.length === 2 || categoryPlates.length === 4
                ? 2
                : 3;

          return (
            <section
              key={cat.id}
              id={`cat-${cat.id}`}
              className="category-section"
            >
              <div className="category-header-row">
                {cat.imagen && (
                  <img
                    src={cat.imagen}
                    alt=""
                    className="category-header-icon"
                  />
                )}
                <h2 className="category-title-text">{cat.nombre}</h2>
                <div className="category-line-right"></div>
              </div>
              <div
                className={`plates-grid plates-grid-cols-${plateGridColumns}`}
              >
                {categoryPlates.map((plate) => {
                  // Validación dinámica: si no tiene imagen o está vacía, inyecta la de por defecto
                  const currentImg =
                    plate.imagen && plate.imagen.trim() !== ""
                      ? plate.imagen
                      : DEFAULT_PLATE_IMAGE;

                  return (
                    <div
                      key={plate.id}
                      className={`plate-card-public ${plate.disponible === false ? "plate-off" : ""} ${editMode ? "editable-card" : ""}`}
                      onClick={() => handlePlateClick(plate)}
                    >
                      <div className="plate-card-img">
                        <img src={currentImg} alt="" />
                        {plate.disponible === false && (
                          <div className="overlay-sold-out">AGOTADO</div>
                        )}
                      </div>

                      <div className="plate-card-info">
                        <div className="plate-header">
                          <h3 className="item-name">{plate.nombre}</h3>
                          <span className="plate-price">
                            {parseFloat(plate.precio).toFixed(2)} €
                          </span>
                        </div>
                        <div className="plate-allergens-icons-row">
                          {plate.alergenos?.map((aleId) => (
                            <img
                              key={aleId}
                              src={allAllergens[aleId]?.imagen}
                              title={allAllergens[aleId]?.nombre}
                              alt=""
                            />
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
          className="menu-modal-overlay"
          onClick={() => setSelectedPlate(null)}
        >
          <div className="modal-panel">
            <button
              onClick={handlePrevPlate}
              className="modal-arrow-btn modal-arrow-left"
              aria-label="Plato anterior"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e9e9e9";
                e.currentTarget.style.color = "#000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f4f4f4";
                e.currentTarget.style.color = "#555";
              }}
            >
              ◀
            </button>

            <div
              className="modal-content-plate"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPlate(null)}
                className="modal-close-btn"
                aria-label="Cerrar"
              >
                ✕
              </button>

              <div className="modal-plate-image">
                <img
                  src={
                    selectedPlate.imagen && selectedPlate.imagen.trim() !== ""
                      ? selectedPlate.imagen
                      : DEFAULT_PLATE_IMAGE
                  }
                  alt={selectedPlate.nombre}
                />
              </div>

              <div className="modal-body">
                <div className="modal-header-row">
                  <h2 className="modal-title">{selectedPlate.nombre}</h2>
                  <span className="modal-price">
                    {parseFloat(selectedPlate.precio).toFixed(2)} €
                  </span>
                </div>

                <p className="modal-description">{selectedPlate.descripcion}</p>

                <div className="modal-allergens-section">
                  <h4 className="modal-allergens-title">
                    Información de Alérgenos
                  </h4>
                  <div className="modal-allergens-list">
                    {selectedPlate.alergenos?.length > 0 ? (
                      selectedPlate.alergenos.map((aleId) => (
                        <div key={aleId} className="modal-allergen-pill">
                          <img
                            src={allAllergens[aleId]?.imagen}
                            alt=""
                            className="modal-allergen-icon"
                          />
                          <span>{allAllergens[aleId]?.nombre}</span>
                        </div>
                      ))
                    ) : (
                      <span className="modal-no-allergens">
                        Sin alérgenos declarados.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleNextPlate}
              className="modal-arrow-btn modal-arrow-right"
              aria-label="Siguiente plato"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e9e9e9";
                e.currentTarget.style.color = "#000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f4f4f4";
                e.currentTarget.style.color = "#555";
              }}
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
        <div className="allergen-legend-grid">
          {Object.values(allAllergens).map((ale) => (
            <div key={ale.id} className="allergen-legend-item">
              <img src={ale.imagen} alt={ale.nombre} />
              <span>{ale.nombre}</span>
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
            {isAdmin
              ? "VOLVER AL PANEL DE CONTROL"
              : authRole
                ? "RESERVAR MESA"
                : "INICIA SESIÓN PARA RESERVAR"}
          </span>
        </button>
      </section>
    </div>
  );
};

export default Menu;
