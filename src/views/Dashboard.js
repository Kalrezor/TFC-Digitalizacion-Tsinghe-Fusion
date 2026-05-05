// Vista: Dashboard.js
// Panel principal tras el login.
// Sidebar dinamico segun rol + contenido de cada seccion.
// Admin: gestiona menu, mesas, ofertas y reservas.
// Comensal: gestiona sus reservas.

import React from "react";
import useDashboard     from "../controllers/useDashboard";
import ReservationsView from "./ReservationsView";
import AdminMenu        from "./AdminMenu";
import AdminTables      from "./AdminTables";
import AdminOffers      from "./AdminOffers";
import "../styles/ChineseStyle.css";

// Pantalla de bienvenida segun rol
const WelcomePanel = ({ role }) => (
  <div style={{ padding: "40px 20px", textAlign: "center" }}>
    <div style={{ fontSize: "60px", marginBottom: "16px" }}>
      {role === "admin" ? "🛠️" : "🍽️"}
    </div>
    <h2 style={{ color: "#DC143C", marginBottom: "12px" }}>
      {role === "admin" ? "Panel de Administracion" : "Bienvenido a Tsinghe Cocina Fusión"}
    </h2>
    <p style={{ color: "#555", maxWidth: "480px", margin: "0 auto", lineHeight: "1.6" }}>
      {role === "admin"
        ? "Desde aqui puedes gestionar el menu del restaurante, las mesas, las ofertas y todas las reservas."
        : "Aqui puedes crear, consultar y cancelar tus reservas en Tsinghe Cocina Fusión."}
    </p>

    {/* Tarjetas informativas para admin */}
    {role === "admin" && (
      <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "32px", flexWrap: "wrap" }}>
        {[
          { emoji: "🍜", label: "Menu",    desc: "Platos, precios y alergenos"   },
          { emoji: "🪑", label: "Mesas",   desc: "20 mesas con estado en tiempo real" },
          { emoji: "🏷️", label: "Ofertas", desc: "Promociones y descuentos"       },
          { emoji: "📋", label: "Reservas",desc: "Todas las reservas del restaurante" },
        ].map((c) => (
          <div key={c.label} style={{
            background: "#fff",
            border: "2px solid #FFD700",
            borderRadius: "10px",
            padding: "20px 24px",
            minWidth: "140px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "32px" }}>{c.emoji}</div>
            <div style={{ fontWeight: "bold", color: "#DC143C", marginTop: "8px" }}>{c.label}</div>
            <div style={{ fontSize: "12px", color: "#777", marginTop: "4px" }}>{c.desc}</div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Render del contenido segun opcion del sidebar
const renderContent = (selectedOption, role, userId) => {
  switch (selectedOption) {
    case "inicio":
      return <WelcomePanel role={role} />;

    // Comensal
    case "reservas":
      return <ReservationsView role={role} userId={userId} />;

    // Admin
    case "admin-menu":
      return <AdminMenu />;
    case "admin-mesas":
      return <AdminTables />;
    case "admin-ofertas":
      return <AdminOffers />;
    case "admin-reservas":
      return <ReservationsView role={role} userId={userId} />;

    default:
      return (
        <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>
          Seccion no encontrada.
        </div>
      );
  }
};

// Iconos para el sidebar
const ICONS = {
  "inicio":         "🏠",
  "reservas":       "📅",
  "admin-menu":     "🍜",
  "admin-mesas":    "🪑",
  "admin-ofertas":  "🏷️",
  "admin-reservas": "📋",
};

const Dashboard = ({ role, userId, logout }) => {
  const { selectedOption, availableOptions, selectOption } = useDashboard(role);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 63px)" }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside style={{
        width:           "220px",
        flexShrink:      0,
        background:      "#1a1a1a",
        borderRight:     "3px solid #DC143C",
        display:         "flex",
        flexDirection:   "column",
        padding:         "24px 0",
      }}>
        {/* Rol del usuario */}
        <div style={{ padding: "0 20px 20px", borderBottom: "1px solid #333" }}>
          <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "1px" }}>
            Rol
          </div>
          <div style={{ color: "#FFD700", fontWeight: "bold", marginTop: "4px", fontSize: "14px" }}>
            {role === "admin" ? "Administrador" : "Comensal"}
          </div>
        </div>

        {/* Opciones del menu */}
        <nav style={{ flex: 1, padding: "16px 0" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {availableOptions.map((option) => {
              const isActive = selectedOption === option.id;
              return (
                <li key={option.id}>
                  <button
                    onClick={() => selectOption(option.id)}
                    style={{
                      width:           "100%",
                      background:      isActive ? "#DC143C" : "transparent",
                      color:           isActive ? "#fff" : "#ccc",
                      border:          "none",
                      borderLeft:      isActive ? "4px solid #FFD700" : "4px solid transparent",
                      padding:         "12px 20px",
                      textAlign:       "left",
                      cursor:          "pointer",
                      fontSize:        "14px",
                      display:         "flex",
                      alignItems:      "center",
                      gap:             "10px",
                      transition:      "all 0.2s",
                      fontWeight:      isActive ? "bold" : "normal",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = "#2a2a2a";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>{ICONS[option.id] || "•"}</span>
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Boton de logout */}
        <div style={{ padding: "0 16px" }}>
          <button
            onClick={handleLogout}
            style={{
              width:           "100%",
              background:      "transparent",
              color:           "#DC143C",
              border:          "2px solid #DC143C",
              borderRadius:    "6px",
              padding:         "10px",
              cursor:          "pointer",
              fontSize:        "13px",
              fontWeight:      "bold",
              transition:      "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#DC143C";
              e.currentTarget.style.color      = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color      = "#DC143C";
            }}
          >
            Cerrar sesion
          </button>
        </div>
      </aside>

      {/* ── Contenido principal ─────────────────────────────────────────── */}
      <main style={{
        flex:       1,
        background: "#fafaf5",
        overflowY:  "auto",
      }}>
        {renderContent(selectedOption, role, userId)}
      </main>
    </div>
  );
};

export default Dashboard;
