// NavigationBar.js
// Barra superior adaptada al rol del usuario. Solo capa visual.

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/MinimalStyle.css";

const NavigationBar = ({ isAuthenticated, user, role, logout }) => {
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
          to={isAuthenticated ? "/dashboard" : "/"}
          className="editorial-brand"
        >
          Tsinghe
        </Link>

        <div className="editorial-nav-center">
          <Link to="/" className="editorial-nav-link">
            Inicio
          </Link>
          <Link to="/menu" className="editorial-nav-link">
            Menu
          </Link>
          {isAuthenticated && role === "admin" && (
            <Link to="/dashboard" className="editorial-nav-link">
              Studio
            </Link>
          )}
        </div>

        <div className="editorial-nav-actions">
          {isAuthenticated ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="editorial-button"
                style={{ maxWidth: "190px" }}
              >
                {user?.email?.split("@")[0] || "Usuario"}
              </button>

              {showUserMenu && (
                <div className="editorial-user-menu">
                  <Link
                    to="/dashboard"
                    onClick={() => setShowUserMenu(false)}
                    className="editorial-menu-item editorial-ui"
                  >
                    Mi panel
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="editorial-menu-item editorial-ui"
                  >
                    Cerrar sesion
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
