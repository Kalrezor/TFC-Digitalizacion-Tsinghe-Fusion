import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toastSuccess, toastError } from "../services/ToastService";
import AuthService from "../services/AuthService";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

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
  };

  const getRegisterErrorMessage = (error) => {
    const message = typeof error === "string" ? error : error?.message || "";
    const code = error?.code || error?.errorCode || "";

    if (code === "auth/weak-password" || message.includes("auth/weak-password")) {
      return "La contraseña debe tener al menos 6 caracteres";
    }

    if (
      code === "auth/email-already-in-use" ||
      message.includes("auth/email-already-in-use")
    ) {
      return "Este email ya está registrado. ¿Quieres iniciar sesión?";
    }

    if (code === "auth/invalid-email" || message.includes("auth/invalid-email")) {
      return "El email no es válido.";
    }

    return message || "Error al registrarse";
  };

  const validateForm = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      toastError("El nombre debe tener al menos 2 caracteres");
      //setError("El nombre debe tener al menos 2 caracteres");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toastError("Por favor ingresa un email válido");
      //setError("Por favor ingresa un email válido");
      return false;
    }
    if (formData.password.length < 6) {
      toastError("La contraseña debe tener al menos 6 caracteres");
      //setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toastError("Las contraseñas no coinciden");
      //setError("Las contraseñas no coinciden");
      return false;
    }
    if (!formData.phone.trim()) {
      toastError("El número de teléfono es obligatorio");
      //setError("El número de teléfono es obligatorio");
      return false;
    }
    const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      toastError("Por favor ingresa un número de teléfono válido");
      //setError("Por favor ingresa un número de teléfono válido");
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
        formData.name.trim(),
        formData.phone.trim(),
      );

      if (result.success) {
        toastSuccess("Registro completado correctamente");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toastError(getRegisterErrorMessage(result));
      }
    } catch (err) {
      toastError(getRegisterErrorMessage(err));
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
        <div className="editorial-auth-header editorial-auth-header-compact">
          <h1>Crear Cuenta</h1>
          <p>Únete a Tsinghe Cocina Fusión</p>
        </div>

        <form noValidate onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre Completo</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ej: Juan Garcia"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="tu@email.com"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="form-group">
            <label>Confirmar contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Número de teléfono</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Ej: +34 600 123 456"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn-full-width btn-with-top-gap"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div className="editorial-auth-links editorial-auth-links-spaced">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

