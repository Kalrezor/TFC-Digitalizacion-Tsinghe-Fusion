// Vista: ConfirmReservation.js
// Página para confirmar reservas desde el link en el email

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../styles/ChineseStyle.css";

const ConfirmReservation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const confirmReservation = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Token no válido");
        return;
      }

      try {
        // Llamar a Cloud Function para confirmar
        const response = await fetch(
          "https://us-central1-digitalizacion-tsinge-fusion.cloudfunctions.net/confirmReservationToken",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          setStatus("success");
          setMessage(
            "¡Reserva confirmada exitosamente! Será redirigido en 3 segundos..."
          );
          setEmail(result.email);

          // Verificar si el usuario tiene cuenta
          if (!result.userExists) {
            setShowRegister(true);
            setMessage(
              "¡Reserva confirmada! Ahora crea una cuenta para gestionar tu reserva."
            );
          } else {
            setTimeout(() => {
              navigate("/login");
            }, 3000);
          }
        } else {
          setStatus("error");
          setMessage(result.error || "Error al confirmar la reserva");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Error de conexión: " + error.message);
      }
    };

    confirmReservation();
  }, [searchParams, navigate]);

  return (
    <div className="confirm-reservation-container">
      <div className="confirm-card">
        {status === "loading" && (
          <div className="loading-state">
            <h2>Confirmando tu reserva...</h2>
            <div className="spinner"></div>
          </div>
        )}

        {status === "success" && (
          <div className="success-state">
            <h2>✅ ¡Reserva Confirmada!</h2>
            <p>{message}</p>

            {showRegister && (
              <div className="register-cta">
                <p>
                  Crea una cuenta para poder gestionar tu reserva y acceder a más funciones.
                </p>
                <button
                  onClick={() => navigate(`/register?email=${email}`)}
                  className="btn-primary btn-large"
                >
                  Crear Cuenta
                </button>
              </div>
            )}

            {!showRegister && (
              <button onClick={() => navigate("/login")} className="btn-primary">
                Ir a Iniciar Sesión
              </button>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="error-state">
            <h2>❌ Error al Confirmar</h2>
            <p>{message}</p>
            <button onClick={() => navigate("/")} className="btn-primary">
              Volver al Inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmReservation;
