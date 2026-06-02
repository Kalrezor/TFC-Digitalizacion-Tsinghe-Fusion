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
import styles from "../styles/modules/Dashboard.module.css";

// Pantalla de bienvenida segun rol
const WelcomePanel = ({ role, userName }) => (
  <div className={styles.welcomePanel}>
    <div className={styles.welcomeEmoji}>
      {role === "admin" ? "ðŸ› ï¸" : "ðŸ½ï¸"}
    </div>
    <h2 className={styles.welcomeTitle}>
      {role === "admin"
        ? `Panel de Administración`
        : `¡Bienvenido, ${userName || "Usuario"}!`}
    </h2>
    {role !== "admin" && (
      <p className={styles.welcomeSubtitle}>
        Tsinghe Cocina Fusión
      </p>
    )}
    <p className={styles.welcomeDescription}>
      {role === "admin"
        ? "Desde aquí puedes gestionar el menú del restaurante, las mesas, las ofertas y todas las reservas."
        : "Aquí puedes crear, consultar y cancelar tus reservas en Tsinghe Cocina Fusión."}
    </p>

    {/* Tarjetas informativas para admin */}
    {role === "admin" && (
      <div className={styles.cardsContainer}>
        {[
          { emoji: "🍜", label: "Menú", desc: "Platos, precios y alérgenos" },
          {
            emoji: "ðŸª‘",
            label: "Mesas",
            desc: "Mesas reales con estado en tiempo real",
          },
          {
            emoji: "ðŸ·ï¸",
            label: "Ofertas",
            desc: "Promociones y descuentos",
          },
          {
            emoji: "ðŸ“‹",
            label: "Reservas",
            desc: "Todas las reservas del restaurante",
          },
        ].map((c) => (
          <div key={c.label} className={styles.card}>
            <div className={styles.cardEmoji}>{c.emoji}</div>
            <div className={styles.cardLabel}>{c.label}</div>
            <div className={styles.cardDesc}>
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
    { key: "admin", label: "Comensal y Admin" },
  ];

  return (
    <div className={styles.chatbotPanel}>
      <div className={styles.chatbotCard}>
        <p className={styles.chatbotEyebrow}>
          Panel de mando
        </p>
        <h2 className={styles.chatbotTitle}>Chatbot</h2>

        <div className={styles.chatbotGrid}>
          {controls.map((control) => {
            const isEnabled = settings?.[control.key] !== false;
            return (
              <div key={control.key} className={styles.chatbotRow}>
                <div>
                  <div className={styles.chatbotRowEyebrow}>
                    Chatbot
                  </div>
                  <div className={styles.chatbotRowLabel}>
                    {control.label}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggle(control.key)}
                  aria-pressed={isEnabled}
                  className={styles.chatbotToggleButton}
                  style={{
                    background: isEnabled ? "#050505" : "#fff",
                    color: isEnabled ? "#fff" : "#050505",
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
        <div className={styles.notFound}>
          Seccion no encontrada.
        </div>
      );
  }
};

// Iconos para el sidebar
const ICONS = {
  inicio: "ðŸ ",
  reservas: "ðŸ“…",
  "admin-menu": "ðŸœ",
  "admin-mesas": "ðŸª‘",
  "admin-ofertas": "ðŸ·ï¸",
  "admin-reservas": "ðŸ“‹",
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

  const handleSelectOption = React.useCallback(
    (id) => {
      selectOption(id);
      const params = new URLSearchParams(location.search);
      params.set("section", id);
      navigate(
        { pathname: location.pathname, search: params.toString() },
        { replace: true },
      );
    },
    [location.pathname, location.search, navigate, selectOption],
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");
    if (section && availableOptions.some((opt) => opt.id === section)) {
      selectOption(section);
    }
  }, [location.search, availableOptions, selectOption]);

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
    <div className={styles.dashboardContainer}>
      {/* Sidebar Component */}
      <Sidebar
        role={role}
        userName={userName}
        selectedOption={selectedOption}
        onSelectOption={handleSelectOption}
        onLogout={logout}
      />

      {/* ── Contenido principal ─────────────────────────────────────────── */}
      <main className={styles.dashboardMain}>
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
