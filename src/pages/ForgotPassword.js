// Vista: ForgotPassword.js
// Recuperación de contraseña con token
// También se usa para usuarios Google que crean contraseña local

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toastSuccess, toastError, toastInfo } from "../services/ToastService";
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

  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const getPasswordErrorMessage = (err) => {
    const message = typeof err === "string" ? err : err?.message || err?.error || "";
    const code = err?.code || err?.errorCode || "";

    if (code === "auth/weak-password" || message.includes("auth/weak-password")) {
      return "La contraseña debe tener al menos 6 caracteres";
    }

    return message || "Error inesperado";
  };

  //eliminamos todos los setError

  const requestToken = async (emailValue) => {
    setLoading(true);
    try {
      await AuthService.requestPasswordReset(emailValue);
      setStep(2);
      //setMessage("Token enviado a tu email");
      toastSuccess("Token enviado a tu email");
    } catch (err) {
      setStep(2);
      //setMessage("Token enviado a tu email");
      toastInfo("Si hay una cuenta registrada, recibirás el token en tu email.");
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
      toastError("Por favor ingresa tu email");
      //setError("Por favor ingresa tu email");
      return;
    }

    if (!validateEmail(email)) {
      toastError("Por favor ingresa un email válido");
      //setError("Por favor ingresa un email válido");
      return;
    }

    await requestToken(email);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isGoogleSetup && !token.trim()) {
      toastError("Ingresa el token recibido en tu email");
      //setError("Ingresa el token recibido en tu email");
      return;
    }

    if (!isGoogleSetup && token.length !== 3) {
      toastError("El token debe tener exactamente 3 caracteres");
      //setError("El token debe tener exactamente 3 caracteres");
      return;
    }

    if (isGoogleSetup) {
      if (!phone.trim()) {
        toastError("El número de teléfono es obligatorio");
        //setError("El número de teléfono es obligatorio");
        return;
      }
      const phoneRegex = /^\+?[0-9\s\-\(\)]{7,15}$/;
      if (!phoneRegex.test(phone.trim())) {
        toastError("Por favor ingresa un número de teléfono válido");
        //setError("Por favor ingresa un número de teléfono válido");
        return;
      }
    }

    if (!newPassword) {
      toastError("Ingresa una nueva contraseña");
      //setError("Ingresa una nueva contraseña");
      return;
    }

    if (newPassword.length < 6) {
      toastError("La contraseña debe tener al menos 6 caracteres");
      //setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!confirmPassword) {
      toastError("Confirma tu nueva contraseña");
      //setError("Confirma tu nueva contraseña");
      return;
    }

    if (newPassword !== confirmPassword) {
      toastError("Las contraseñas no coinciden");
      //setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const result = isGoogleSetup
        ? await AuthService.completeProfile(phone.trim(), newPassword)
        : await AuthService.resetPasswordWithToken(email, token, newPassword);

      if (result.success) {
        sessionStorage.removeItem("googlePasswordSetupPending");
        toastSuccess("Contraseña actualizada exitosamente");
        //setMessage("Contraseña actualizada exitosamente");
        setTimeout(() => {
          navigate(isGoogleSetup ? "/dashboard" : "/login");
        }, 2000);
      } else {
        toastError(getPasswordErrorMessage(result));
        //setError(result.error || "Error al resetear la contraseña");
      }
    } catch (err) {
      toastError(getPasswordErrorMessage(err));
      //setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editorial-auth-page">
      <div className="editorial-auth-card">
        <div style={{ marginBottom: "28px", textAlign: "center" }}>
          <h1>
            {isGoogleSetup ? "Completar Registro" : "Recuperar Contraseña"}
          </h1>
          <p>
            {isGoogleSetup
              ? "Proporciona tu número de teléfono y crea una contraseña"
              : step === 1
              ? "Ingresa tu email para recibir un token"
              : "Ingresa el token y tu nueva contraseña"}
          </p>
        </div>

        {step === 1 && (
          <form noValidate onSubmit={handleRequestToken} style={{ marginBottom: "20px" }}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
          <form noValidate onSubmit={handleResetPassword} style={{ marginBottom: "20px" }}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isGoogleSetup}
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
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <input
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

        <div className="editorial-auth-links">
          {step === 1 ? (
            <>
              ¿Recuerdas tu contraseña? {" "}
              <Link to="/login">Inicia sesión</Link>
            </>
          ) : (
            <>
              ¿Necesitas un nuevo token? {" "}
              <button
                onClick={() => {
                  setStep(1);
                  setToken("");
                  setPhone("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setError(null);
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
