// Vista: Login.js
// Componente SOLO para login con email y Google.

import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toastSuccess, toastError } from "../services/ToastService";
import AuthService from "../services/AuthService";

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
      }
    } catch (err) {
      toastError(err.message || "Error inesperado al iniciar sesión");
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
        <div className="editorial-auth-header">
          <h1>Iniciar Sesión</h1>
          <p>Accede a tu cuenta en Tsinghe</p>
        </div>

        <form noValidate onSubmit={handleLoginSubmit} className="editorial-auth-form">
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
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full-width"
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="editorial-auth-divider">
          <div />
          <span className="editorial-ui">o</span>
          <div />
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn btn-secondary btn-full-width editorial-auth-google"
        >
          Continuar con Google
        </button>

        <div className="editorial-auth-links">
          <Link
            to="/forgot-password"
            className="editorial-auth-forgot-link"
          >
            ¿Olvidaste tu contraseña?
          </Link>
          <br />
          <span>¿No tienes cuenta? </span>
          <Link to="/register">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

