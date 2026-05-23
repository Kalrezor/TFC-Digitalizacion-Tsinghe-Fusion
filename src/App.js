import React from "react";
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

// ── Pantalla de Carga ────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "60vh",
    }}
  >
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "16px", color: "#000000", fontWeight: "600" }}>
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

  const isAuthenticated = !!user;
  const needsGooglePasswordSetup =
    sessionStorage.getItem("googlePasswordSetupPending") === "true";

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
        <RestaurantChatbot user={user} role={role} userName={userName} />
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
