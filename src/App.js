import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import useAuth from "./hooks/useAuth";
import NavigationBar from "./components/NavigationBar";
import RestaurantChatbot from "./components/RestaurantChatbot";

// Vistas públicas
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ConfirmReservation from "./pages/ConfirmReservation";
import Reservations from "./pages/Reservations";

// Vistas de usuario autenticado
import Dashboard from "./pages/Dashboard";
import MyReservationsView from "./pages/MyReservationsView";
import AdminReservationsView from "./pages/AdminReservationsView";

// Vistas solo admin
import AdminMenu from "./pages/AdminMenu";
import AdminTables from "./pages/AdminTables";
import AdminOffers from "./pages/AdminOffers";

import { Toaster } from "react-hot-toast";
import "./styles/MinimalStyle.css";

const CHATBOT_SETTINGS_KEY = "tsinghe-chatbot-settings";
const DEFAULT_CHATBOT_SETTINGS = {
  comensal: true,
  admin: true,
};

const getChatbotSettings = () => {
  try {
    const storedSettings = localStorage.getItem(CHATBOT_SETTINGS_KEY);
    if (!storedSettings) return DEFAULT_CHATBOT_SETTINGS;
    return {
      ...DEFAULT_CHATBOT_SETTINGS,
      ...JSON.parse(storedSettings),
    };
  } catch (error) {
    return DEFAULT_CHATBOT_SETTINGS;
  }
};

const normalizeChatbotRole = (role) => (role === "admin" ? "admin" : "comensal");

// ── Pantalla de Carga ────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div className="app-loading-screen">
    <div className="app-loading-content">
      <div className="app-loading-text">
        Cargando autenticación...
      </div>
    </div>
  </div>
);

const LoginRoute = ({ isAuthenticated, loading, needsGooglePasswordSetup }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const nextPath = searchParams.get("next");
  const email = searchParams.get("email") || "";

  if (loading) return <LoadingScreen />;
  if (isAuthenticated) {
    if (needsGooglePasswordSetup) {
      return (
        <Navigate
          to={`/forgot-password?email=${encodeURIComponent(email)}&setup=google`}
          replace
        />
      );
    }
    return <Navigate to={nextPath || "/"} replace />;
  }

  return <Login />;
};

const ProtectedRoute = ({ children, isAuthenticated, loading }) => {
  if (loading) return <LoadingScreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children, isAuthenticated, loading, role }) => {
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return role === "admin" ? children : <Navigate to="/dashboard" replace />;
};

// ── App Principal ───────────────────────────────────────────────────────────
function App() {
  const { user, userName, userEmail, role, loading, logout } = useAuth();
  const [chatbotSettings, setChatbotSettings] = useState(getChatbotSettings);

  const isAuthenticated = !!user;
  const needsGooglePasswordSetup =
    sessionStorage.getItem("googlePasswordSetupPending") === "true";
  const chatbotRole = normalizeChatbotRole(role);
  const isChatbotEnabled = chatbotSettings[chatbotRole] !== false;

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === CHATBOT_SETTINGS_KEY) {
        setChatbotSettings(getChatbotSettings());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleChatbot = (targetRole) => {
    setChatbotSettings((currentSettings) => {
      const nextSettings = {
        ...DEFAULT_CHATBOT_SETTINGS,
        ...currentSettings,
        [targetRole]: currentSettings[targetRole] === false,
      };
      localStorage.setItem(CHATBOT_SETTINGS_KEY, JSON.stringify(nextSettings));
      return nextSettings;
    });
  };

  // IMPORTANTE: El chequeo de loading debe ir AQUÍ dentro
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <NavigationBar
        isAuthenticated={isAuthenticated}
        user={user}
        userName={userName}
        role={role}
        logout={logout}
      />

      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/confirm-reservation" element={<ConfirmReservation />} />

        {/* Lógica de Login mejorada */}
        <Route
          path="/login"
          element={
            <LoginRoute
              isAuthenticated={isAuthenticated}
              loading={loading}
              needsGooglePasswordSetup={needsGooglePasswordSetup}
            />
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
          }
        />

        {/* Rutas protegidas (Usuario) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
              <Dashboard
                role={role}
                userId={user?.uid}
                userName={userName}
                userEmail={userEmail}
                logout={logout}
                chatbotSettings={chatbotSettings}
                onToggleChatbot={toggleChatbot}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservations"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
              <Reservations userId={user?.uid} />
            </ProtectedRoute>
          }
        />

        {/* Rutas protegidas (Admin) */}
        <Route
          path="/admin/menu"
          element={
            <AdminRoute
              isAuthenticated={isAuthenticated}
              loading={loading}
              role={role}
            >
              <AdminMenu />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/tables"
          element={
            <AdminRoute
              isAuthenticated={isAuthenticated}
              loading={loading}
              role={role}
            >
              <AdminTables userId={user?.uid} userRole={role} />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/offers"
          element={
            <AdminRoute
              isAuthenticated={isAuthenticated}
              loading={loading}
              role={role}
            >
              <AdminOffers />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {isAuthenticated && (
        <RestaurantChatbot
          user={user}
          role={role}
          userName={userName}
          enabled={isChatbotEnabled}
        />
      )}
      <Toaster
        toastOptions={{
          duration: 4500,
          style: {
            fontFamily: "Inter, Arial, sans-serif",
          },
        }}
      />
    </Router>
  );
}

export default App;