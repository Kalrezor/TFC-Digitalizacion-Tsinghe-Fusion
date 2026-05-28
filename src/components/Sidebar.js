// Componente: Sidebar.js
// Sidebar desplegable/plegable para comensal y admin.

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ role, userName, selectedOption, onSelectOption, onLogout }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("editorial-lock", isOpen);
    return () => document.body.classList.remove("editorial-lock");
  }, [isOpen]);

  const menuOptions =
    role === "admin"
      ? [
          { id: "preview-inicio", label: "Ver Inicio", icon: "Vista" },
          { id: "preview-menu", label: "Ver Menú", icon: "Menu" },
          { id: "admin-menu", label: "Gestionar Menú", icon: "Menu" },
          { id: "admin-mesas", label: "Gestionar Mesas", icon: "Mesas" },
          { id: "admin-ofertas", label: "Ofertas", icon: "Oferta" },
          { id: "admin-reservas", label: "Todas las Reservas", icon: "Lista" },
          { id: "split-bill", label: "Dividir Cuenta", icon: "Cuenta" },
          { id: "chatbot-control", label: "Chatbot", icon: "Chat" },
          { id: "inicio", label: "Configuración de perfil", icon: "Configuración" }
        ]
      : [
          { id: "inicio", label: "Configuración de perfil", icon: "Configuración" },
          { id: "preview-inicio", label: "Ver Inicio", icon: "Vista" },
          { id: "preview-menu", label: "Ver Menú", icon: "Menu" },
          { id: "reservas", label: "Reservas", icon: "Lista" },
          { id: "split-bill", label: "Dividir Cuenta", icon: "Cuenta" },
        ];

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Ocultar menú" : "Mostrar menú"}
      >
        Menu
      </button>

      <aside
        className={`sidebar ${isOpen ? "open" : "closed"}`}
        style={{
          width: "min(420px, 88vw)",
          background: "#fff",
          borderRight: "1px solid #050505",
          display: "flex",
          flexDirection: "column",
          padding: "34px 0",
          transition: "transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
          transform: isOpen ? "translateX(0)" : "translateX(-105%)",
          overflow: "hidden",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 1001,
        }}
      >
        {isOpen && (
          <>
            <div style={{ padding: "0 28px 28px", borderBottom: "1px solid #050505" }}>
              <div
                style={{
                  fontSize: "11px",
                  color: "#050505",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  fontWeight: 600,
                }}
              >
                Rol
              </div>
              <div
                style={{
                  color: "#050505",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontWeight: 400,
                  marginTop: "4px",
                  fontSize: "34px",
                  lineHeight: 1,
                }}
              >
                {role === "admin" ? "Administrador" : "Comensal"}
              </div>
              {userName && (
                <div
                  style={{
                    color: "#71717a",
                    fontSize: "12px",
                    marginTop: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                  }}
                >
                  {userName}
                </div>
              )}
            </div>

            <nav style={{ flex: 1, padding: "22px 0", background: "transparent", border: 0, boxShadow: "none", position: "static" }}>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {menuOptions.map((option) => {
                  const isActive = selectedOption === option.id;
                  return (
                    <li key={option.id}>
                      <button
                        onClick={() => {
                          onSelectOption(option.id);
                          setIsOpen(false); // Cierra la sidebar tras clickear
                        }}
                        style={{
                          width: "100%",
                          background: isActive ? "#050505" : "transparent",
                          color: isActive ? "#fff" : "#050505",
                          border: "none",
                          borderLeft: isActive
                            ? "1px solid #050505"
                            : "1px solid transparent",
                          padding: "18px 28px",
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: "11px",
                          display: "block",
                          transition: "all 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.2em",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.opacity = "0.55";
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.opacity = "1";
                        }}
                      >
                        {option.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

          </>
        )}
      </aside>

      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          style={{
            display: "block",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255, 255, 255, 0.72)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
          }}
        />
      )}
    </>
  );
};

export default Sidebar;

