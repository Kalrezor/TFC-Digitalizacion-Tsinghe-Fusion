import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import AuthService from "../models/AuthService";
import "../styles/MinimalStyle.css";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setFormData((prev) => ({
        ...prev,
        email: decodeURIComponent(emailParam),
      }));
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor ingresa un email válido");
      return false;
    }
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await AuthService.registerWithEmail(
        formData.email,
        formData.password,
        formData.name.trim()
      );

      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(result.error || "Error al registrarse");
      }
    } catch (err) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container" style={{
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
          <h1 style={{ fontSize: "28px", color: "#568d6e", marginBottom: "8px" }}>Crear Cuenta</h1>
          <p style={{ fontSize: "14px", color: "#666666" }}>Únete a Tsinghe Cocina Fusión</p>
        </div>

        {success && <div className="success-box">✓ ¡Registro exitoso! Redirigiendo...</div>}
        {error && <div className="error-box">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre Completo</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Ej: Juan García" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="tu@email.com" />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} required placeholder="Mínimo 6 caracteres" />
          </div>

          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", marginTop: "10px" }}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13px" }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: "#2e8b57", fontWeight: "600", textDecoration: "none" }}>Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;