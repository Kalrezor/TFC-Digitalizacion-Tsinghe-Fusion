// Vista: Login.js
// Componente SOLO para login con email y Google
// Diseño responsivo y minimalista

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthService from "../models/AuthService";
import "../styles/MinimalStyle.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await AuthService.loginWithEmail(email, password);
    setLoading(false);

    if (result.success) {
      console.log("Login exitoso");
      setEmail("");
      setPassword("");
    } else {
      setError(result.error || "Error al iniciar sesión");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await AuthService.loginWithGoogle();

      if (result.success) {
        console.log("Google SignIn exitoso", result);

        if (result.requiresPassword) {
          sessionStorage.setItem("googlePasswordSetupPending", "true");
          navigate(
            `/forgot-password?email=${encodeURIComponent(
              result.user.email,
            )}&setup=google`,
            { replace: true },
          );
        } else {
          console.log("Usuario ya tiene contraseña configurada");
          navigate("/dashboard", { replace: true });
        }
      } else {
        setError(result.error || "Error al iniciar sesión con Google");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 60px)",
      backgroundColor: "#faf5ed",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        backgroundColor: "white",
        border: "1px solid #e0e0e0",
        borderRadius: "4px",
        padding: "clamp(20px, 5vw, 40px)",
      }}>
        {/* Header */}
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <h1 style={{
            fontSize: "28px",
            color: "#568d6e",
            marginBottom: "8px",
          }}>
            Iniciar Sesión
          </h1>
          <p style={{
            fontSize: "14px",
            color: "#666666",
            margin: 0,
          }}>
            Accede a tu cuenta en Tsinghe
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message" style={{ marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} style={{ marginBottom: "24px" }}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%" }}
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          margin: "24px 0",
        }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e0e0e0" }}></div>
          <span style={{ fontSize: "12px", color: "#999999" }}>o</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e0e0e0" }}></div>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn btn-secondary"
          style={{ width: "100%", marginBottom: "24px" }}
        >
          Continuar con Google
        </button>

        {/* Links */}
        <div style={{
          textAlign: "center",
          fontSize: "13px",
          color: "#666666",
        }}>
          <Link
            to="/forgot-password"
            style={{
              color: "#6db888",
              textDecoration: "none",
              fontWeight: "600",
              display: "block",
              marginBottom: "8px",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#568d6e")}
            onMouseLeave={(e) => (e.target.style.color = "#6db888")}
          >
            ¿Olvidaste tu contraseña?
          </Link>
          <span>¿No tienes cuenta? </span>
          <Link
            to="/register"
            style={{
              color: "#2e8b57",
              textDecoration: "none",
              fontWeight: "600",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#1f6338")}
            onMouseLeave={(e) => (e.target.style.color = "#2e8b57")}
          >
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
