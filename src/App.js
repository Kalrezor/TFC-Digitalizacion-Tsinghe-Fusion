// App.js
// Componente principal con React Router.
// Rutas publicas, protegidas por login y protegidas por rol admin.

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import useAuth from "./controllers/useAuth";
import NavigationBar from "./components/NavigationBar";

// Vistas publicas
import Home from "./views/Home";
import Menu from "./views/Menu";
import Login from "./views/Login";
import Register from "./views/Register";
import ForgotPassword from "./views/ForgotPassword";
import ConfirmReservation from "./views/ConfirmReservation";

// Vistas de usuario autenticado
import Dashboard from "./views/Dashboard";
import ReservationsView from "./views/ReservationsView";

// Vistas solo admin
import AdminMenu from "./views/AdminMenu";
import AdminTables from "./views/AdminTables";
import AdminOffers from "./views/AdminOffers";

import "./styles/MinimalStyle.css";

// Componente de carga responsivo
const LoadingScreen = () => (
  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "60vh",
    padding: "20px",
  }}>
    <div style={{
      textAlign: "center",
    }}>
      <div style={{
        fontSize: "16px",
        color: "#568d6e",
        fontWeight: "600",
      }}>
        Cargando...
      </div>
    </div>
  </div>
);

// ── Ruta protegida: requiere login ──────────────────────────────────────────
const ProtectedRoute = ({ children, isAuthenticated, loading }) => {
  if (loading) {
    return <LoadingScreen />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// ── Ruta protegida: requiere rol admin ──────────────────────────────────────
const AdminRoute = ({ children, isAuthenticated, loading, role }) => {
  if (loading) {
    return <LoadingScreen />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// ── App principal ───────────────────────────────────────────────────────────
function App() {
  const { user, userName, userEmail, role, loading, logout } = useAuth();
  const isAuthenticated = !!user;
  const needsGooglePasswordSetup =
    sessionStorage.getItem("googlePasswordSetupPending") === "true";

  return (
    <Router>
      <NavigationBar
        isAuthenticated={isAuthenticated}
        user={user}
        role={role}
        logout={logout}
      />

      <Routes>
        {/* ── Rutas publicas ─────────────────────────────────────────────── */}
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />

        {/* ── Autenticacion (redirige si ya esta logueado) ────────────────── */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              needsGooglePasswordSetup ? (
                <Navigate
                  to={`/forgot-password?email=${encodeURIComponent(
                    user.email,
                  )}&setup=google`}
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
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* ── Confirmación de reserva (publica) ──────────────────────────── */}
        <Route path="/confirm-reservation" element={<ConfirmReservation />} />

        {/* ── Rutas de usuario autenticado ────────────────────────────────── */}
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

        {/* ── Rutas solo admin ────────────────────────────────────────────── */}
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
              <AdminTables />
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

        {/* ── Fallback ─────────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
