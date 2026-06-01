/*
 * Archivo: src/pages/ConfirmReservation.js
 * Proposito: Pagina de confirmacion de reserva desde enlaces o flujos de validacion.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

// Vista: ConfirmReservation.js
// PÃ¡gina para confirmar reservas desde el link en el email

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

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
        setMessage("Token no vÃ¡lido");
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
            "Â¡Reserva confirmada exitosamente! SerÃ¡ redirigido en 3 segundos..."
          );
          setEmail(result.email);

          // Verificar si el usuario tiene cuenta
          if (!result.userExists) {
            setShowRegister(true);
            setMessage(
              "Â¡Reserva confirmada! Ahora crea una cuenta para gestionar tu reserva."
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
        setMessage("Error de conexiÃ³n: " + error.message);
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
            <h2>âœ… Â¡Reserva Confirmada!</h2>
            <p>{message}</p>

            {showRegister && (
              <div className="register-cta">
                <p>
                  Crea una cuenta para poder gestionar tu reserva y acceder a mÃ¡s funciones.
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
                Ir a Iniciar SesiÃ³n
              </button>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="error-state">
            <h2>âŒ Error al Confirmar</h2>
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


