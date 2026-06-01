/*
 * Archivo: src/pages/Dashboard.js
 * Proposito: Panel principal autenticado: muestra secciones disponibles para admin o comensal y coordina vistas internas.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

// Vista: Dashboard.js
// Panel principal tras el login.
// Sidebar dinámico según rol + contenido de cada sección.
// Admin: gestiona menu, mesas, ofertas y reservas.
// Comensal: gestiona sus reservas.

import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AdminReservationForm from "../components/AdminReservationForm";
import useDashboard from "../hooks/useDashboard";
import Reservations from "./Reservations";
import AdminReservationsView from "./AdminReservationsView";
import AdminMenu from "./AdminMenu";
import TablesManagementView from "../components/TableManagement/TablesManagementView";
import AdminOffers from "./AdminOffers";
import Home from "./Home";
import ProfileForm from "../components/ProfileForm";
import Menu from "./Menu";
import SplitBillForm from "../components/SplitBillForm";

// Pantalla de bienvenida segun rol
const WelcomePanel = ({ role, userName }) => (
  <div style={{ padding: "40px 20px", textAlign: "center" }}>
    <div style={{ fontSize: "60px", marginBottom: "16px" }}>
      {role === "admin" ? "🛠️" : "🍽️"}
    </div>
    <h2 style={{ color: "#050505", marginBottom: "8px" }}>
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
        ? "Desde aquí puedes gestionar el menú del restaurante, las mesas, las ofertas y todas las reservas."
        : "Aquí puedes crear, consultar y cancelar tus reservas en Tsinghe Cocina Fusión."}
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
          { emoji: "🍜", label: "Menú", desc: "Platos, precios y alérgenos" },
          {
            emoji: "🪑",
            label: "Mesas",
            desc: "Mesas reales con estado en tiempo real",
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
              border: "1px solid #050505",
              borderRadius: 0,
              padding: "20px 24px",
              minWidth: "140px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "32px" }}>{c.emoji}</div>
            <div
              style={{ fontWeight: "bold", color: "#050505", marginTop: "8px" }}
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

const ChatbotControlPanel = ({ settings, onToggle }) => {
  const controls = [
    { key: "comensal", label: "Comensal" },
    { key: "admin", label: "Admin" },
  ];

  return (
    <div style={{ padding: "40px 20px" }}>
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          background: "#fff",
          border: "1px solid #050505",
          padding: "28px",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#050505",
            marginBottom: "10px",
          }}
        >
          Panel de mando
        </p>
        <h2 style={{ color: "#050505", marginBottom: "24px" }}>Chatbot</h2>

        <div style={{ display: "grid", gap: "14px" }}>
          {controls.map((control) => {
            const isEnabled = settings?.[control.key] !== false;
            return (
              <div
                key={control.key}
                style={{
                  border: "1px solid #050505",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "16px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "#71717a",
                    }}
                  >
                    Chatbot
                  </div>
                  <div
                    style={{
                      color: "#050505",
                      fontSize: "20px",
                      fontWeight: 600,
                      marginTop: "4px",
                    }}
                  >
                    {control.label}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggle(control.key)}
                  aria-pressed={isEnabled}
                  style={{
                    minWidth: "92px",
                    border: "1px solid #050505",
                    background: isEnabled ? "#050505" : "#fff",
                    color: isEnabled ? "#fff" : "#050505",
                    padding: "12px 16px",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  }}
                >
                  {isEnabled ? "ON" : "OFF"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Render del contenido segun opcion del sidebar
const renderContent = (
  selectedOption,
  role,
  userId,
  userName,
  userEmail,
  chatbotSettings,
  onToggleChatbot,
) => {
  switch (selectedOption) {
    case "inicio":
      return <ProfileForm userId={userId} />;

    case "preview-inicio":
      return <Home />;

    case "preview-menu":
      return <Menu />;

    // Comensal
    case "reservas":
      return <Reservations userId={userId} />;

    // Opción compartida para ambos roles
    case "split-bill":
      return <SplitBillForm />;

    case "chatbot-control":
      return (
        <ChatbotControlPanel
          settings={chatbotSettings}
          onToggle={onToggleChatbot}
        />
      );

    // Admin
    case "admin-menu":
      return <AdminMenu />;
    case "admin-mesas":
      return <TablesManagementView />;
    case "admin-ofertas":
      return <AdminOffers />;
    case "admin-reservas":
      return <AdminReservationsView />;
    case "admin-crear-reserva":
      return <AdminReservationForm onReservationCreated={() => {}} />;

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

const Dashboard = ({
  role,
  userId,
  userName,
  userEmail,
  logout,
  chatbotSettings,
  onToggleChatbot,
}) => {
  const { selectedOption, availableOptions, selectOption } = useDashboard(role);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");
    if (section && availableOptions.some((opt) => opt.id === section)) {
      selectOption(section);
      params.delete("section");
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }
  }, [location.pathname, location.search, availableOptions, selectOption, navigate]);

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
          background: "#ffffff",
          overflowY: "auto",
        }}
      >
        {renderContent(
          selectedOption,
          role,
          userId,
          userName,
          userEmail,
          chatbotSettings,
          onToggleChatbot,
        )}
      </main>
    </div>
  );
};

export default Dashboard;


