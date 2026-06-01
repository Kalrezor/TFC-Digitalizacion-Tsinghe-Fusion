/*
 * Archivo: src/pages/CompleteProfile.js
 * Proposito: Pantalla para completar datos de perfil del usuario tras registro o autenticacion incompleta.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

// Vista: CompleteProfile.js
// Pantalla para completar datos faltantes despuÃ©s de login con Google
// Pide telÃ©fono obligatorio y contraseÃ±a opcional

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/AuthService";
import { toastError, toastSuccess } from "../services/ToastService";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);

  useEffect(() => {
    const checkUserData = async () => {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        const userDoc = await AuthService.getUserDoc(currentUser.uid);
        if (userDoc && userDoc.phone) {
          // Ya tiene telÃ©fono, redirigir
          navigate("/dashboard");
          return;
        }
        setRequiresPassword(!userDoc?.passwordConfigured);
      } catch (err) {
        console.error("Error checking user data:", err);
      }
    };

    checkUserData();
  }, [navigate]);

  useEffect(() => {
    if (error) {
      toastError(error);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      toastSuccess("Perfil completado. Redirigiendo...");
    }
  }, [success]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.phone.trim()) {
      setError("El nÃºmero de telÃ©fono es obligatorio");
      return false;
    }
    const phoneRegex = /^\+?[0-9\s\-\(\)]{7,15}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setError("Por favor ingresa un nÃºmero de telÃ©fono vÃ¡lido");
      return false;
    }

    if (requiresPassword) {
      if (!formData.password) {
        setError("La contraseÃ±a es requerida");
        return false;
      }
      if (formData.password.length < 6) {
        setError("La contraseÃ±a debe tener al menos 6 caracteres");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Las contraseÃ±as no coinciden");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await AuthService.completeProfile(
        formData.phone.trim(),
        requiresPassword ? formData.password : null
      );

      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setError(result.error || "Error al completar el perfil");
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
        padding: "40px",
      }}>
        <div style={{ marginBottom: "28px", textAlign: "center" }}>
          <h1 style={{
            fontSize: "28px",
            color: "#568d6e",
            marginBottom: "8px"
          }}>
            Completar Perfil
          </h1>
          <p style={{
            fontSize: "14px",
            color: "#666666",
            margin: 0,
          }}>
            Necesitamos algunos datos adicionales para continuar
          </p>
        </div>

        <form noValidate onSubmit={handleSubmit}>
          <div className="form-group">
            <label>NÃºmero de TelÃ©fono *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="Ej: +34 600 123 456"
            />
          </div>

          {requiresPassword && (
            <>
              <div className="form-group">
                <label>ContraseÃ±a *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="MÃ­nimo 6 caracteres"
                />
              </div>

              <div className="form-group">
                <label>Confirmar ContraseÃ±a *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", marginTop: "10px" }}
          >
            {loading ? "Guardando..." : "Completar Perfil"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;


