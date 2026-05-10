import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/config";
import "../styles/ForgotPasswordView.css";

export default function ForgotPasswordView({ navegarA }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState("email"); // "email" o "verification"

  const handleSendReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Por favor ingresa tu email");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Por favor ingresa un email válido");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      setStep("verification");
      
      setTimeout(() => {
        setStep("verification");
      }, 500);
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
          setError("No existe una cuenta con este email");
          break;
        case "auth/invalid-email":
          setError("Email inválido");
          break;
        case "auth/too-many-requests":
          setError("Demasiados intentos. Intenta más tarde.");
          break;
        default:
          setError(err.message || "Error al enviar el email de recuperación");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-wrapper">
        <div className="forgot-password-card">
          <div className="forgot-password-header">
            <h1 className="forgot-password-title">Recupera tu Contraseña</h1>
            <p className="forgot-password-subtitle">Te enviaremos un email para que recuperes acceso a tu cuenta</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}

          {success && step === "verification" && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              Email enviado correctamente. Revisa tu bandeja de entrada.
            </div>
          )}

          {step === "email" && (
            <form onSubmit={handleSendReset} className="forgot-password-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <p className="form-helper">
                  Ingresa el email asociado a tu cuenta
                </p>
              </div>

              <button
                type="submit"
                className="send-reset-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Enviando...
                  </>
                ) : (
                  "Enviar Email de Recuperación"
                )}
              </button>
            </form>
          )}

          {step === "verification" && (
            <div className="verification-container">
              <div className="verification-icon">📧</div>
              <h3 className="verification-title">Email Enviado</h3>
              <p className="verification-text">
                Hemos enviado un enlace de recuperación a <strong>{email}</strong>
              </p>
              <ol className="verification-steps">
                <li>Abre el email en tu bandeja de entrada</li>
                <li>Haz clic en el enlace de recuperación</li>
                <li>Crea una nueva contraseña</li>
                <li>Inicia sesión con tu nueva contraseña</li>
              </ol>
              
              <div className="resend-section">
                <p className="resend-text">¿No recibiste el email?</p>
                <button
                  type="button"
                  className="resend-button"
                  onClick={() => {
                    setStep("email");
                    setEmail("");
                    setSuccess(false);
                  }}
                  disabled={loading}
                >
                  Intentar de Nuevo
                </button>
              </div>
            </div>
          )}

          <div className="forgot-password-footer">
            <p className="footer-text">
              ¿Ya recuerdas tu contraseña? <button className="footer-link" onClick={() => navegarA('login')}>Inicia sesión</button>
            </p>
            <p className="footer-text">
              ¿No tienes cuenta? <button className="footer-link" onClick={() => navegarA('registro')}>Regístrate aquí</button>
            </p>
          </div>
        </div>

        <div className="forgot-password-decoration">
          <div className="decoration-circle decoration-circle-1"></div>
          <div className="decoration-circle decoration-circle-2"></div>
        </div>
      </div>
    </div>
  );
}
