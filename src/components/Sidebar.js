// Componente: Sidebar.js
// Sidebar desplegable/plegable para comensal y admin.

import React, { useEffect, useState } from "react";
import styles from "../styles/modules/Sidebar.module.css";

const Sidebar = ({ role, userName, selectedOption, onSelectOption }) => {
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
          {
            id: "inicio",
            label: "Configuración de perfil",
            icon: "Configuración",
          },
        ]
      : [
          {
            id: "inicio",
            label: "Configuración de perfil",
            icon: "Configuración",
          },
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
        className={`sidebar ${isOpen ? "open" : "closed"} ${styles.aside}`}
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(-105%)",
        }}
      >
        {isOpen && (
          <>
            <div className={styles.header}>
              <div className={styles.roleLabel}>
                Rol
              </div>
              <div className={styles.roleName}>
                {role === "admin" ? "Administrador" : "Comensal"}
              </div>
              {userName && (
                <div className={styles.userName}>
                  {userName}
                </div>
              )}
            </div>

            <nav className={styles.nav}>
              <ul className={styles.menuList}>
                {menuOptions.map((option) => {
                  const isActive = selectedOption === option.id;
                  return (
                    <li key={option.id}>
                      <button
                        onClick={() => {
                          onSelectOption(option.id);
                          setIsOpen(false); // Cierra la sidebar tras clickear
                        }}
                        className={styles.menuButton}
                        style={{
                          background: isActive ? "#050505" : "transparent",
                          color: isActive ? "#fff" : "#050505",
                          borderLeft: isActive
                            ? "1px solid #050505"
                            : "1px solid transparent",
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
          className={`sidebar-overlay ${styles.overlay}`}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
