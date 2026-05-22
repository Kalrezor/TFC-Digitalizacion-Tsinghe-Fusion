// Vista: Login.js
// Componente SOLO para login con email y Google.

import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import AuthService from "../services/AuthService";
import "../styles/MinimalStyle.css";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get("next");
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
      navigate(nextPath ? nextPath : "/home", { replace: true });
    } else {
      setError(result.error || "Error al iniciar sesion");
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
          console.log("Usuario ya tiene perfil completo");
          navigate(nextPath ? nextPath : "/home", { replace: true });
        }
      } else {
        setError(result.error || "Error al iniciar sesion con Google");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editorial-auth-page">
      <div className="editorial-auth-card">
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <h1>Iniciar Sesion</h1>
          <p>Accede a tu cuenta en Tsinghe</p>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: "16px" }}>
            {error}
          </div>
        )}

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
            <label>Contrasena</label>
            <input
              type="password"
              placeholder="Tu contrasena"
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
            {loading ? "Iniciando..." : "Iniciar Sesion"}
          </button>
        </form>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "24px 0",
          }}
        >
          <div style={{ flex: 1, height: "1px", backgroundColor: "#050505" }} />
          <span className="editorial-ui">o</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#050505" }} />
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn btn-secondary"
          style={{ width: "100%", marginBottom: "24px" }}
        >
          Continuar con Google
        </button>

        <div className="editorial-auth-links">
          <Link
            to="/forgot-password"
            style={{ display: "inline-block", marginBottom: "12px" }}
          >
            Olvidaste tu contrasena?
          </Link>
          <br />
          <span>No tienes cuenta? </span>
          <Link to="/register">Registrate aqui</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
