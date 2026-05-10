// Vista: ForgotPassword.js
// Recuperación de contraseña con token
// También se usa para usuarios Google que crean contraseña local

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import AuthService from "../services/AuthService";
import "../styles/MinimalStyle.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const isGoogleSetup = searchParams.get("setup") === "google";

  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(isGoogleSetup ? 2 : 1);
  const [message, setMessage] = useState("");

  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const requestToken = async (emailValue) => {
    setLoading(true);
    try {
      await AuthService.requestPasswordReset(emailValue);
      setStep(2);
      setMessage("Token enviado a tu email");
    } catch (err) {
      setStep(2);
      setMessage("Token enviado a tu email");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isGoogleSetup) return;
    const currentUser = AuthService.getCurrentUser();
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [isGoogleSetup]);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Por favor ingresa tu email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor ingresa un email válido");
      return;
    }

    await requestToken(email);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isGoogleSetup && !token.trim()) {
      setError("Ingresa el token recibido en tu email");
      return;
    }

    if (!isGoogleSetup && token.length !== 3) {
      setError("El token debe tener exactamente 3 caracteres");
      return;
    }

    if (isGoogleSetup) {
      if (!phone.trim()) {
        setError("El número de teléfono es obligatorio");
        return;
      }
      const phoneRegex = /^\+?[0-9\s\-\(\)]{7,15}$/;
      if (!phoneRegex.test(phone.trim())) {
        setError("Por favor ingresa un número de teléfono válido");
        return;
      }
    }

    if (!newPassword) {
      setError("Ingresa una nueva contraseña");
      return;
    }

    if (newPassword.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres");
      return;
    }

    if (!confirmPassword) {
      setError("Confirma tu nueva contraseña");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const result = isGoogleSetup
        ? await AuthService.completeProfile(phone.trim(), newPassword)
        : await AuthService.resetPasswordWithToken(email, token, newPassword);

      if (result.success) {
        sessionStorage.removeItem("googlePasswordSetupPending");
        setMessage("Contraseña actualizada exitosamente");
        setTimeout(() => {
          navigate(isGoogleSetup ? "/dashboard" : "/login");
        }, 2000);
      } else {
        setError(result.error || "Error al resetear la contraseña");
      }
    } catch (err) {
      setError(err.message || "Error inesperado");
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
        maxWidth: "480px",
        backgroundColor: "white",
        border: "1px solid #e0e0e0",
        borderRadius: "4px",
        padding: "clamp(20px, 5vw, 40px)",
      }}>
        <div style={{ marginBottom: "28px", textAlign: "center" }}>
          <h1 style={{
            fontSize: "28px",
            color: "#568d6e",
            marginBottom: "8px",
          }}>
            {isGoogleSetup ? "Completar Registro" : "Recuperar Contraseña"}
          </h1>
          <p style={{
            fontSize: "13px",
            color: "#666666",
            margin: 0,
          }}>
            {isGoogleSetup
              ? "Proporciona tu número de teléfono y crea una contraseña"
              : step === 1
              ? "Ingresa tu email para recibir un token"
              : "Ingresa el token y tu nueva contraseña"}
          </p>
        </div>

        {message && (
          <div className="success-message" style={{ marginBottom: "16px" }}>
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="error-message" style={{ marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestToken} style={{ marginBottom: "20px" }}>
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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              {loading ? "Enviando..." : "Enviar Token"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} style={{ marginBottom: "20px" }}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isGoogleSetup}
                required
              />
            </div>

            {isGoogleSetup && (
              <div className="form-group">
                <label>Número de Teléfono *</label>
                <input
                  type="tel"
                  placeholder="Ej: +34 600 123 456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            )}

            {!isGoogleSetup && (
              <div className="form-group">
                <label>Token (3 caracteres)</label>
                <input
                  type="text"
                  placeholder="Ej: ABC"
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                  maxLength="3"
                  required
                />
                <small style={{
                  fontSize: "12px",
                  color: "#999999",
                  display: "block",
                  marginTop: "4px",
                }}>
                  Verifica tu email y copia el token
                </small>
              </div>
            )}

            <div className="form-group">
              <label>Nueva Contraseña</label>
              <input
                type="password"
                placeholder="Mínimo 4 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <input
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              {loading ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
          </form>
        )}

        <div style={{
          textAlign: "center",
          fontSize: "13px",
          color: "#666666",
        }}>
          {step === 1 ? (
            <>
              ¿Recuerdas tu contraseña?{" "}
              <Link
                to="/login"
                style={{
                  color: "#2e8b57",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                Inicia sesión
              </Link>
            </>
          ) : (
            <>
              ¿Necesitas un nuevo token?{" "}
              <button
                onClick={() => {
                  setStep(1);
                  setToken("");
                  setPhone("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setError(null);
                  setMessage("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2e8b57",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "inherit",
                }}
              >
                Volver
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
