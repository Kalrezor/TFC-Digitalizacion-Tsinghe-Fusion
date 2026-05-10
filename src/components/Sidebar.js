// Componente: Sidebar.js
// Sidebar desplegable/plegable para comensal y admin.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ChineseStyle.css";

const Sidebar = ({ role, userName, selectedOption, onSelectOption, onLogout }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const menuOptions =
    role === "admin"
      ? [
          { id: "inicio", label: "Panel Principal", icon: "Inicio" },
          { id: "preview-inicio", label: "Ver Inicio", icon: "Vista" },
          { id: "preview-menu", label: "Ver Menu", icon: "Menu" },
          { id: "admin-menu", label: "Gestionar Menu", icon: "Menu" },
          { id: "admin-mesas", label: "Gestionar Mesas", icon: "Mesas" },
          { id: "admin-ofertas", label: "Ofertas", icon: "Oferta" },
          { id: "admin-reservas", label: "Todas las Reservas", icon: "Lista" },
        ]
      : [
          { id: "inicio", label: "Dashboard", icon: "Panel" },
          { id: "preview-inicio", label: "Ver Inicio", icon: "Vista" },
          { id: "preview-menu", label: "Ver Menú", icon: "Menu" },
          { id: "reservas", label: "Mis Reservas", icon: "Lista" },
          { id: "nueva-reserva", label: "Nueva Reserva", icon: "Crear" },
        ];

  const handleLogout = async () => {
    await onLogout();
    navigate("/login");
  };

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Ocultar menu" : "Mostrar menu"}
      >
        =
      </button>

      <aside
        className={`sidebar ${isOpen ? "open" : "closed"}`}
        style={{
          width: isOpen ? "220px" : "0",
          background: "#1a1a1a",
          borderRight: isOpen ? "3px solid #DC143C" : "none",
          display: "flex",
          flexDirection: "column",
          padding: isOpen ? "24px 0" : "0",
          transition: "all 0.3s ease",
          overflow: "hidden",
        }}
      >
        {isOpen && (
          <>
            <div style={{ padding: "0 20px 20px", borderBottom: "1px solid #333" }}>
              <div
                style={{
                  fontSize: "11px",
                  color: "#888",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Rol
              </div>
              <div
                style={{
                  color: "#FFD700",
                  fontWeight: "bold",
                  marginTop: "4px",
                  fontSize: "14px",
                }}
              >
                {role === "admin" ? "Administrador" : "Comensal"}
              </div>
              {userName && (
                <div
                  style={{
                    color: "#ccc",
                    fontSize: "12px",
                    marginTop: "8px",
                    fontStyle: "italic",
                  }}
                >
                  {userName}
                </div>
              )}
            </div>

            <nav style={{ flex: 1, padding: "16px 0" }}>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {menuOptions.map((option) => {
                  const isActive = selectedOption === option.id;
                  return (
                    <li key={option.id}>
                      <button
                        onClick={() => onSelectOption(option.id)}
                        style={{
                          width: "100%",
                          background: isActive ? "#DC143C" : "transparent",
                          color: isActive ? "#fff" : "#ccc",
                          border: "none",
                          borderLeft: isActive
                            ? "4px solid #FFD700"
                            : "4px solid transparent",
                          padding: "12px 20px",
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: "14px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          transition: "all 0.2s",
                          fontWeight: isActive ? "bold" : "normal",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.background = "#2a2a2a";
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span style={{ fontSize: "11px", minWidth: "38px" }}>
                          {option.icon}
                        </span>
                        {option.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div style={{ padding: "0 16px" }}>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  background: "transparent",
                  color: "#DC143C",
                  border: "2px solid #DC143C",
                  borderRadius: "6px",
                  padding: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "bold",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#DC143C";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#DC143C";
                }}
              >
                Cerrar Sesion
              </button>
            </div>
          </>
        )}
      </aside>

      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          style={{
            display: "none",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
        />
      )}
    </>
  );
};

export default Sidebar;
