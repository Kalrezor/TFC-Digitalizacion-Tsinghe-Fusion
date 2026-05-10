import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import useAuth from "./hooks/useAuth";
import NavigationBar from "./components/NavigationBar";

// Vistas públicas
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ConfirmReservation from "./pages/ConfirmReservation";

// Vistas de usuario autenticado
import Dashboard from "./pages/Dashboard";
import ReservationsView from "./pages/ReservationsView";

// Vistas solo admin
import AdminMenu from "./pages/AdminMenu";
import AdminTables from "./pages/AdminTables";
import AdminOffers from "./pages/AdminOffers";

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
      <div style={{ fontSize: "16px", color: "#568d6e", fontWeight: "600" }}>
        Cargando autenticación...
      </div>
    </div>
  </div>
);

// ── Componentes de Ruta Protegida ───────────────────────────────────────────
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
            isAuthenticated ? (
              needsGooglePasswordSetup ? (
                <Navigate
                  to={`/forgot-password?email=${encodeURIComponent(user.email)}&setup=google`}
                  replace
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Login />
            )
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
              <ReservationsView
                role={role}
                userId={user?.uid}
                userEmail={userEmail}
                userName={userName}
              />
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
    </Router>
  );
}

export default App;
