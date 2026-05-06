// Vista: Dashboard.js
// Panel principal tras el login.
// Sidebar dinámico según rol + contenido de cada sección.
// Admin: gestiona menu, mesas, ofertas y reservas.
// Comensal: gestiona sus reservas.

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ReservationForm from "../components/ReservationForm";
import AdminReservationForm from "../components/AdminReservationForm";
import useDashboard from "../controllers/useDashboard";
import ReservationsView from "./ReservationsView";
import AdminMenu from "./AdminMenu";
import AdminTables from "./AdminTables";
import AdminOffers from "./AdminOffers";
import Home from "./Home";
import Menu from "./Menu";
import "../styles/ChineseStyle.css";

// Pantalla de bienvenida segun rol
const WelcomePanel = ({ role, userName }) => (
  <div style={{ padding: "40px 20px", textAlign: "center" }}>
    <div style={{ fontSize: "60px", marginBottom: "16px" }}>
      {role === "admin" ? "🛠️" : "🍽️"}
    </div>
    <h2 style={{ color: "#DC143C", marginBottom: "8px" }}>
      {role === "admin"
        ? `Panel de Administración`
        : `¡Bienvenido, ${userName || "Usuario"}!`}
    </h2>
    {role !== "admin" && (
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "12px" }}>
        Tsinghe Cocina Fusión
      </p>
    )}
    <p
      style={{
        color: "#555",
        maxWidth: "480px",
        margin: "0 auto",
        lineHeight: "1.6",
      }}
    >
      {role === "admin"
        ? "Desde aqui puedes gestionar el menu del restaurante, las mesas, las ofertas y todas las reservas."
        : "Aqui puedes crear, consultar y cancelar tus reservas en Tsinghe Cocina Fusión."}
    </p>

    {/* Tarjetas informativas para admin */}
    {role === "admin" && (
      <div
        style={{
          display: "flex",
          gap: "16px",
          justifyContent: "center",
          marginTop: "32px",
          flexWrap: "wrap",
        }}
      >
        {[
          { emoji: "🍜", label: "Menu", desc: "Platos, precios y alergenos" },
          {
            emoji: "🪑",
            label: "Mesas",
            desc: "20 mesas con estado en tiempo real",
          },
          { emoji: "🏷️", label: "Ofertas", desc: "Promociones y descuentos" },
          {
            emoji: "📋",
            label: "Reservas",
            desc: "Todas las reservas del restaurante",
          },
        ].map((c) => (
          <div
            key={c.label}
            style={{
              background: "#fff",
              border: "2px solid #FFD700",
              borderRadius: "10px",
              padding: "20px 24px",
              minWidth: "140px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "32px" }}>{c.emoji}</div>
            <div
              style={{ fontWeight: "bold", color: "#DC143C", marginTop: "8px" }}
            >
              {c.label}
            </div>
            <div style={{ fontSize: "12px", color: "#777", marginTop: "4px" }}>
              {c.desc}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Render del contenido segun opcion del sidebar
const renderContent = (selectedOption, role, userId, userName, userEmail) => {
  switch (selectedOption) {
    case "inicio":
      return <WelcomePanel role={role} userName={userName} />;

    case "preview-inicio":
      return <Home />;

    case "preview-menu":
      return <Menu />;

    // Comensal
    case "reservas":
      return (
        <ReservationsView
          role={role}
          userId={userId}
          userEmail={userEmail}
          userName={userName}
          showCreateForm={false}
        />
      );

    case "nueva-reserva":
      return (
        <ReservationForm
          userId={userId}
          userName={userName}
          userEmail={userEmail}
          onReservationCreated={() => {
            // Podría hacer algo aquí si quiere
          }}
        />
      );

    // Admin
    case "admin-menu":
      return <AdminMenu />;
    case "admin-mesas":
      return <AdminTables />;
    case "admin-ofertas":
      return <AdminOffers />;
    case "admin-reservas":
      return (
        <ReservationsView
          role={role}
          userId={userId}
          userEmail={userEmail}
          userName={userName}
          showCreateForm={false}
        />
      );
    case "admin-crear-reserva":
      return (
        <AdminReservationForm
          onReservationCreated={() => {
            // Podría hacer algo aquí si quiere
          }}
        />
      );

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
  inicio: "🏠",
  reservas: "📅",
  "admin-menu": "🍜",
  "admin-mesas": "🪑",
  "admin-ofertas": "🏷️",
  "admin-reservas": "📋",
};

void ICONS;

const Dashboard = ({ role, userId, userName, userEmail, logout }) => {
  const { selectedOption, selectOption } = useDashboard(role);
  const navigate = useNavigate();

  // Proteger acceso si el usuario tiene cambio de contrasena pendiente (Google)
  useEffect(() => {
    const hasPasswordPending = sessionStorage.getItem(
      "googlePasswordSetupPending",
    );
    if (hasPasswordPending) {
      // Obtener el email del usuario actual
      const email = userEmail || "";
      navigate(
        `/forgot-password?email=${encodeURIComponent(email)}&setup=google`,
        { replace: true },
      );
    }
  }, [navigate, userEmail]);

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 63px)" }}>
      {/* Sidebar Component */}
      <Sidebar
        role={role}
        userName={userName}
        selectedOption={selectedOption}
        onSelectOption={selectOption}
        onLogout={logout}
      />

      {/* ── Contenido principal ─────────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          background: "#fafaf5",
          overflowY: "auto",
        }}
      >
        {renderContent(selectedOption, role, userId, userName, userEmail)}
      </main>
    </div>
  );
};

export default Dashboard;
