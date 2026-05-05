// NavigationBar.js
// Barra de navegacion superior adaptada al rol del usuario.
// No logueado:  Inicio | Menu | Iniciar sesion | Registrarse
// Comensal:     Inicio | Menu | Reservas | (menu usuario con logout)
// Admin:        Inicio | Menu | Admin Menu | Admin Mesas | Admin Ofertas | (menu usuario con logout)

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/ChineseStyle.css";

const NAV_LINK = {
  color: "#E8E8E8",
  textDecoration: "none",
  fontSize: "14px",
  padding: "6px 4px",
  transition: "color 0.2s",
  whiteSpace: "nowrap",
};

const NavigationBar = ({ isAuthenticated, user, role, logout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate("/");
  };

  return (
    <nav
      style={{
        backgroundColor: "#1a1a1a",
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "3px solid #DC143C",
        minHeight: "60px",
        position: "sticky",
        top: 0,
        zIndex: 200,
        gap: "16px",
      }}
    >
      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <Link
        to="/"
        style={{
          color: "#DC143C",
          textDecoration: "none",
          fontSize: "22px",
          fontWeight: "bold",
          fontFamily: "Georgia, serif",
          flexShrink: 0,
        }}
      >
        Tsinghe Cocina Fusión
      </Link>

      {/* ── Enlaces centrales ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
          flex: 1,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Link
          to="/"
          style={NAV_LINK}
          onMouseEnter={(e) => (e.target.style.color = "#DC143C")}
          onMouseLeave={(e) => (e.target.style.color = "#E8E8E8")}
        >
          Inicio
        </Link>

        <Link
          to="/menu"
          style={NAV_LINK}
          onMouseEnter={(e) => (e.target.style.color = "#DC143C")}
          onMouseLeave={(e) => (e.target.style.color = "#E8E8E8")}
        >
          Menu
        </Link>

        {/* Solo comensal logueado */}
        {isAuthenticated && role === "comensal" && (
          <Link
            to="/reservations"
            style={NAV_LINK}
            onMouseEnter={(e) => (e.target.style.color = "#DC143C")}
            onMouseLeave={(e) => (e.target.style.color = "#E8E8E8")}
          >
            Mis Reservas
          </Link>
        )}

        {/* Solo admin logueado */}
        {isAuthenticated && role === "admin" && (
          <>
            <Link
              to="/admin/menu"
              style={{ ...NAV_LINK, color: "#FFD700" }}
              onMouseEnter={(e) => (e.target.style.color = "#DC143C")}
              onMouseLeave={(e) => (e.target.style.color = "#FFD700")}
            >
              Admin Menu
            </Link>
            <Link
              to="/admin/tables"
              style={{ ...NAV_LINK, color: "#FFD700" }}
              onMouseEnter={(e) => (e.target.style.color = "#DC143C")}
              onMouseLeave={(e) => (e.target.style.color = "#FFD700")}
            >
              Admin Mesas
            </Link>
            <Link
              to="/admin/offers"
              style={{ ...NAV_LINK, color: "#FFD700" }}
              onMouseEnter={(e) => (e.target.style.color = "#DC143C")}
              onMouseLeave={(e) => (e.target.style.color = "#FFD700")}
            >
              Admin Ofertas
            </Link>
          </>
        )}
      </div>

      {/* ── Seccion derecha: autenticacion ────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        {isAuthenticated ? (
          // Usuario logueado: menu desplegable
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                backgroundColor: "#DC143C",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                maxWidth: "200px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email?.split("@")[0] || "Usuario"}
            </button>

            {showUserMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  background: "#2a2a2a",
                  border: "1px solid #DC143C",
                  borderRadius: "6px",
                  minWidth: "180px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  zIndex: 300,
                }}
              >
                <Link
                  to="/dashboard"
                  onClick={() => setShowUserMenu(false)}
                  style={{
                    display: "block",
                    padding: "12px 16px",
                    color: "#E8E8E8",
                    textDecoration: "none",
                    borderBottom: "1px solid #444",
                    fontSize: "14px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#3a3a3a")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  Mi Panel
                </Link>

                {role === "admin" && (
                  <div style={{ borderBottom: "1px solid #444" }}>
                    {[
                      { to: "/admin/menu", label: "Gestion Menu" },
                      { to: "/admin/tables", label: "Gestion Mesas" },
                      { to: "/admin/offers", label: "Gestion Ofertas" },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setShowUserMenu(false)}
                        style={{
                          display: "block",
                          padding: "10px 16px",
                          color: "#FFD700",
                          textDecoration: "none",
                          fontSize: "13px",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#3a3a3a")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "12px 16px",
                    color: "#DC143C",
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#3a3a3a")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  Cerrar sesion
                </button>
              </div>
            )}
          </div>
        ) : (
          // No logueado: botones de acceso
          <>
            <Link
              to="/login"
              style={{
                color: "#E8E8E8",
                textDecoration: "none",
                fontSize: "14px",
                padding: "8px 16px",
                border: "1px solid #DC143C",
                borderRadius: "4px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#DC143C";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#E8E8E8";
              }}
            >
              Iniciar sesion
            </Link>

            <Link
              to="/register"
              style={{
                background: "#DC143C",
                color: "white",
                textDecoration: "none",
                fontSize: "14px",
                padding: "8px 16px",
                borderRadius: "4px",
                fontWeight: "bold",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#a00020")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#DC143C")
              }
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
