// NavigationBar.js
// Barra de navegacion superior adaptada al rol del usuario.
// Diseño responsivo y minimalista con colores: Perla, Dorado, Verde Sage

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
    <nav style={{
      backgroundColor: "white",
      borderBottom: "2px solid #ffd700",
      padding: "0",
      position: "sticky",
      top: 0,
      zIndex: 200,
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
        gap: "16px",
      }}>
        {/* Logo */}
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          style={{
            color: "#6db888",
            textDecoration: "none",
            fontSize: "clamp(16px, 4vw, 22px)",
            fontWeight: "600",
            fontFamily: "'Georgia', serif",
            flexShrink: 0,
          }}
        >
          Tsinghe
        </Link>

        {/* Menu Escritorio */}
        <div style={{
          display: "none",
          gap: "20px",
          alignItems: "center",
          flex: 1,
          justifyContent: "center",
        }} className="hidden-mobile">
          {!isAuthenticated && (
            <>
              <Link
                to="/"
                style={{
                  color: "#2d2d2d",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "color 250ms ease",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#6db888")}
                onMouseLeave={(e) => (e.target.style.color = "#2d2d2d")}
              >
                Inicio
              </Link>
              <Link
                to="/menu"
                style={{
                  color: "#2d2d2d",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "color 250ms ease",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#6db888")}
                onMouseLeave={(e) => (e.target.style.color = "#2d2d2d")}
              >
                Menú
              </Link>
            </>
          )}
        </div>

        {/* Seccion Derecha */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
        }}>
          {isAuthenticated ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  backgroundColor: "#6db888",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  maxWidth: "150px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  transition: "background-color 250ms ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#568d6e")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#6db888")}
              >
                {user?.email?.split("@")[0] || "Usuario"}
              </button>

              {showUserMenu && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  background: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                  minWidth: "180px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  zIndex: 300,
                }}>
                  <Link
                    to="/dashboard"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: "block",
                      padding: "12px 16px",
                      color: "#2d2d2d",
                      textDecoration: "none",
                      borderBottom: "1px solid #e0e0e0",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "background-color 250ms ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5ede3")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    Mi Panel
                  </Link>
                  {role === "admin" && (
                    <Link
                      to="/admin/menu"
                      onClick={() => setShowUserMenu(false)}
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        color: "#2e8b57",
                        textDecoration: "none",
                        borderBottom: "1px solid #e0e0e0",
                        fontSize: "14px",
                        fontWeight: "600",
                        transition: "background-color 250ms ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5ede3")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "12px 16px",
                      color: "#2e8b57",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      transition: "background-color 250ms ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5ede3")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  color: "#6db888",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: "600",
                  padding: "8px 12px",
                  border: "2px solid #6db888",
                  borderRadius: "4px",
                  transition: "all 250ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#6db888";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#6db888";
                }}
              >
                Entrar
              </Link>
              <Link
                to="/register"
                style={{
                  backgroundColor: "#2e8b57",
                  color: "white",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: "600",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  transition: "background-color 250ms ease",
                  display: "none",
                }}
                className="hidden-mobile"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1f6338")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2e8b57")}
              >
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
