// Vista: Login.js
// Componente SOLO para login con email y Google.

import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toastSuccess, toastError } from "../services/ToastService";
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

    if (!email.trim() || !password.trim()) {
      toastError("Completa email y contraseña para continuar");
      return;
    }

    setLoading(true);
    const result = await AuthService.loginWithEmail(email, password);
    setLoading(false);

    if (result.success) {
      toastSuccess("Sesión iniciada correctamente");
      setEmail("");
      setPassword("");
      navigate(nextPath ? nextPath : "/home", { replace: true });
    } else {
      toastError(result.error || "Error al iniciar sesión");
      //setError(result.error || "Error al iniciar sesión");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await AuthService.loginWithGoogle();

      if (result.success) {
        toastSuccess("Inicio de sesión con Google exitoso");
        if (result.requiresPassword) {
          sessionStorage.setItem("googlePasswordSetupPending", "true");
          navigate(
            `/forgot-password?email=${encodeURIComponent(
              result.user.email,
            )}&setup=google`,
            { replace: true },
          );
        } else {
          navigate(nextPath ? nextPath : "/home", { replace: true });
        }
      } else {
        toastError(result.error || "Error al iniciar sesión con Google");
        //setError(result.error || "Error al iniciar sesión con Google");
      }
    } catch (err) {
      toastError(err.message || "Error inesperado al iniciar sesión");
      //setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editorial-auth-page login-video-page">
      <video className="login-background-video" autoPlay muted loop playsInline>
        <source
          src="https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/multimediaDesing%2Fcorte.mp4?alt=media&token=788bcf2e-c93c-4801-aae5-457d729030a0"
          type="video/mp4"
        />
      </video>
      <div className="login-background-overlay" />
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

        <form noValidate onSubmit={handleLoginSubmit} style={{ marginBottom: "24px" }}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Contrasena</label>
            <input
              type="password"
              placeholder="Tu contrasena"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
