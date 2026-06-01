/*
 * Archivo: src/components/NavigationBar.js
 * Proposito: Barra de navegacion principal: enlaces publicos, estado de sesion, rol y cierre de sesion.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

// NavigationBar.js
// Barra superior adaptada al rol del usuario. Solo capa visual.

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const NavigationBar = ({ isAuthenticated, user, userName, role, logout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate("/");
  };

  return (
    <nav className="editorial-topbar">
      <div className="editorial-topbar-inner">
        <Link
          to={isAuthenticated ? "/dashboard?section=preview-inicio" : "/"}
          className="editorial-brand"
        >
          Tsinghe
        </Link>

        <div className="editorial-nav-center">
          <Link
            to={isAuthenticated ? "/dashboard?section=preview-inicio" : "/"}
            className="editorial-nav-link"
          >
            Inicio
          </Link>
          <Link
            to={isAuthenticated ? "/dashboard?section=preview-menu" : "/menu"}
            className="editorial-nav-link"
          >
            Menu
          </Link>
          {isAuthenticated && (
            <Link
              to={
                role === "admin"
                  ? "/dashboard?section=admin-reservas"
                  : "/dashboard?section=reservas"
              }
              className="editorial-nav-link"
            >
              Reserva
            </Link>
          )}
          {isAuthenticated && role === "admin" && (
            <Link to="/dashboard?section=inicio" className="editorial-nav-link">
              PERFIL
            </Link>
          )}
        </div>

        <div className="editorial-nav-actions">
          {isAuthenticated ? (
            <div className="editorial-user-menu-wrapper">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="editorial-button editorial-user-button"
              >
                {userName || user?.displayName || user?.email?.split("@")[0] || "Usuario"}
              </button>

              {showUserMenu && (
                <div className="editorial-user-menu">
                      <Link
                    to="/dashboard?section=inicio"
                    onClick={() => setShowUserMenu(false)}
                    className="editorial-menu-item editorial-ui"
                  >
                    Configuración de perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="editorial-menu-item editorial-ui"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="editorial-button">
                Entrar
              </Link>
              <Link to="/register" className="editorial-button hidden-mobile">
                Registro
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;


