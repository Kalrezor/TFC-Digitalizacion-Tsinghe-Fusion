/*
 * Archivo: src/pages/Login.js
 * Proposito: Pagina de inicio de sesion: email/password, Google y redireccion despues de login.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

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
      toastError("Completa email y contraseÃ±a para continuar");
      return;
    }

    setLoading(true);
    const result = await AuthService.loginWithEmail(email, password);
    setLoading(false);

    if (result.success) {
      toastSuccess("SesiÃ³n iniciada correctamente");
      setEmail("");
      setPassword("");
      navigate(nextPath ? nextPath : "/home", { replace: true });
    } else {
      toastError(result.error || "Error al iniciar sesiÃ³n");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await AuthService.loginWithGoogle();

      if (result.success) {
        toastSuccess("Inicio de sesiÃ³n con Google exitoso");
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
      } else if (result.canceledByUser) {
        // El usuario cerrÃ³ la ventana de Google sin elegir cuenta.
        // No mostramos un error agresivo para no interferir con la experiencia.
      } else {
        toastError(result.error || "Error al iniciar sesiÃ³n con Google");
      }
    } catch (err) {
      toastError(err.message || "Error inesperado al iniciar sesiÃ³n");
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
          <h1>Iniciar SesiÃ³n</h1>
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
            <label>ContraseÃ±a</label>
            <input
              type="password"
              placeholder="Tu contraseÃ±a"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full-width"
          >
            {loading ? "Iniciando..." : "Iniciar SesiÃ³n"}
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
            Â¿Olvidaste tu contraseÃ±a?
          </Link>
          <br />
          <span>Â¿No tienes cuenta? </span>
          <Link to="/register">RegÃ­strate aquÃ­</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;


