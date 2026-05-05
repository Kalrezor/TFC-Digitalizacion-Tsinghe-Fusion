// Vista: Login.js
// Este componente representa la vista del formulario de login y registro.
// Maneja la entrada del usuario y llama al controlador useAuth.

import React, { useState } from "react";
import AuthService from "../models/AuthService";
import "../styles/ChineseStyle.css";

const Login = () => {
  // Estados locales para el formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [userNotFoundEmail, setUserNotFoundEmail] = useState(null); // Para registrar si no existe

  // Manejador para el envío del formulario de login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await AuthService.loginWithEmail(email, password);
    setLoading(false);

    if (result.success) {
      console.log("Login exitoso");
      setEmail("");
      setPassword("");
      // El componente se re-renderizará cuando el user se actualice en App.js
    } else {
      // Si el usuario no existe, preguntar si quiere registrarse
      if (
        result.suggestion === "provider" &&
        (result.errorCode === "auth/user-not-found" ||
          result.errorCode === "auth/invalid-credential")
      ) {
        setUserNotFoundEmail(email);
        setError(
          `No existe una cuenta con ${email}. ¿Quieres registrarte ahora?`,
        );
      } else {
        setError(result.error);
      }
    }
  };

  // Manejador para el registro
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validar que el nombre no esté vacío
    if (!name.trim()) {
      setLoading(false);
      setError("El nombre es requerido");
      return;
    }

    try {
      console.log("Registrando usuario con:", { email, name });
      const result = await AuthService.registerWithEmail(
        email,
        password,
        name.trim(),
      );
      setLoading(false);

      if (result.success) {
        console.log("Registro exitoso");
        setIsRegistering(false);
        setUserNotFoundEmail(null);
        setEmail("");
        setPassword("");
        setName("");
        setError("Usuario registrado correctamente. ¡Bienvenido!");
        // Enviar email de bienvenida
        await AuthService.sendWelcomeEmail(email, email.split("@")[0]);
      } else {
        console.error("Error en registro:", result.error);
        setError(result.error);
      }
    } catch (err) {
      setLoading(false);
      console.error("Error capturado:", err);
      setError(err.message);
    }
  };

  // Manejador para registrarse cuando el usuario no existe
  const handleRegisterFromNotFound = async () => {
    if (!name.trim()) {
      setError("Ingresa tu nombre");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Registrando usuario no encontrado con:", {
        email: userNotFoundEmail,
        name,
      });
      const result = await AuthService.registerWithEmail(
        userNotFoundEmail,
        password,
        name.trim(),
      );
      setLoading(false);

      if (result.success) {
        console.log("Registro exitoso");
        setUserNotFoundEmail(null);
        setEmail("");
        setPassword("");
        setName("");
        setError("✅ Usuario creado correctamente. ¡Bienvenido!");
        // Enviar email de bienvenida
        await AuthService.sendWelcomeEmail(userNotFoundEmail, name);
      } else {
        console.error("Error en registro:", result.error);
        setError(result.error);
      }
    } catch (err) {
      setLoading(false);
      console.error("Error capturado:", err);
      setError(err.message);
    }
  };

  // Manejador para Google SignIn
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await AuthService.loginWithGoogle();
      setLoading(false);

      if (result.success) {
        console.log("Google SignIn exitoso");
        // El componente se re-renderizará cuando el user se actualice en App.js
      } else {
        setError(result.error);
      }
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegistering ? "Registro" : "Iniciar Sesión"}</h2>

      {/* Formulario de login/registro normal */}
      {!userNotFoundEmail ? (
        <form
          onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit}
        >
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="name">Nombre:</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading
              ? "Cargando..."
              : isRegistering
                ? "Registrarse"
                : "Iniciar Sesión"}
          </button>
        </form>
      ) : (
        <div className="form-group-container">
          <div className="info-message">
            La cuenta con <strong>{userNotFoundEmail}</strong> no existe.
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegisterFromNotFound();
            }}
          >
            <div className="form-group">
              <label htmlFor="name">Tu nombre:</label>
              <input
                id="name"
                type="text"
                placeholder="¿Cuál es tu nombre?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password-new">Contraseña:</label>
              <input
                id="password-new"
                type="password"
                placeholder="Crea una contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Creando cuenta..." : "Crear cuenta ahora"}
            </button>

            <button
              type="button"
              onClick={() => {
                setUserNotFoundEmail(null);
                setError(null);
              }}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

      {/* Botones de inicio de sesión social */}
      {!isRegistering && !userNotFoundEmail && (
        <div className="social-auth-buttons">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="btn-google"
            title="Inicia sesión con tu cuenta Google"
          >
            🔐 Google
          </button>
        </div>
      )}

      <button
        onClick={() => {
          setIsRegistering(!isRegistering);
          setError(null);
          setEmail("");
          setPassword("");
          setName("");
          setUserNotFoundEmail(null);
        }}
        className="btn-secondary"
      >
        {isRegistering
          ? "¿Ya tienes cuenta? Inicia sesión"
          : "¿No tienes cuenta? Regístrate"}
      </button>

      {error && (
        <div
          className={
            error.includes("correctamente") || error.includes("bienvenido")
              ? "success-message"
              : "error-message"
          }
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default Login;
