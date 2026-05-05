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

import useAuth          from "./controllers/useAuth";
import NavigationBar    from "./components/NavigationBar";

// Vistas publicas
import Home             from "./views/Home";
import Menu             from "./views/Menu";
import Login            from "./views/Login";
import Register         from "./views/Register";
import ForgotPassword   from "./views/ForgotPassword";

// Vistas de usuario autenticado
import Dashboard        from "./views/Dashboard";
import ReservationsView from "./views/ReservationsView";

// Vistas solo admin
import AdminMenu        from "./views/AdminMenu";
import AdminTables      from "./views/AdminTables";
import AdminOffers      from "./views/AdminOffers";

import "./styles/ChineseStyle.css";

// ── Ruta protegida: requiere login ──────────────────────────────────────────
const ProtectedRoute = ({ children, isAuthenticated, loading }) => {
  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#DC143C", fontSize: "18px" }}>
        Cargando...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// ── Ruta protegida: requiere rol admin ──────────────────────────────────────
const AdminRoute = ({ children, isAuthenticated, loading, role }) => {
  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#DC143C", fontSize: "18px" }}>
        Cargando...
      </div>
    );
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
  const { user, role, loading, logout } = useAuth();
  const isAuthenticated = !!user;

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
        <Route path="/"      element={<Home />} />
        <Route path="/menu"  element={<Menu />} />

        {/* ── Autenticacion (redirige si ya esta logueado) ────────────────── */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
        />
        <Route
          path="/forgot-password"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
        />

        {/* ── Rutas de usuario autenticado ────────────────────────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
              <Dashboard role={role} userId={user?.uid} logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservations"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
              <ReservationsView role={role} userId={user?.uid} />
            </ProtectedRoute>
          }
        />

        {/* ── Rutas solo admin ────────────────────────────────────────────── */}
        <Route
          path="/admin/menu"
          element={
            <AdminRoute isAuthenticated={isAuthenticated} loading={loading} role={role}>
              <AdminMenu />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/tables"
          element={
            <AdminRoute isAuthenticated={isAuthenticated} loading={loading} role={role}>
              <AdminTables />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/offers"
          element={
            <AdminRoute isAuthenticated={isAuthenticated} loading={loading} role={role}>
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
