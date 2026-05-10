import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import "../styles/RegisterView.css";

export default function RegisterView({ navegarA }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const crearUsuarioEnFirestore = async (uid, userData) => {
    try {
      await setDoc(doc(db, 'users', uid), {
        email: userData.email,
        nombre: userData.nombre,
        role: 'comensal',
        createdAt: new Date().toISOString(),
        photoURL: userData.photoURL || null
      });
    } catch (err) {
      console.error('Error al crear usuario en Firestore:', err);
      throw err;
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validaciones
    if (!nombre || !email || !password || !confirmPassword) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (nombre.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Por favor ingresa un email válido");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      // Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar perfil con nombre
      await updateProfile(userCredential.user, {
        displayName: nombre
      });

      // Crear documento en Firestore con role comensal
      await crearUsuarioEnFirestore(userCredential.user.uid, {
        email,
        nombre,
        photoURL: null
      });

      setSuccess(true);
      setNombre("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      
      setTimeout(() => {
        alert("¡Cuenta creada exitosamente! Por favor inicia sesión.");
        navegarA('login');
      }, 500);
    } catch (err) {
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("Este email ya está registrado");
          break;
        case "auth/weak-password":
          setError("La contraseña es muy débil");
          break;
        case "auth/invalid-email":
          setError("Email inválido");
          break;
        default:
          setError(err.message || "Error al registrarse");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Crear documento en Firestore
      await crearUsuarioEnFirestore(userCredential.user.uid, {
        email: userCredential.user.email,
        nombre: userCredential.user.displayName || 'Usuario',
        photoURL: userCredential.user.photoURL
      });

      setSuccess(true);
      console.log("Cuenta creada con Google:", userCredential.user.email);
      
      setTimeout(() => {
        alert("¡Bienvenido! Cuenta creada con Google.");
      }, 500);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError("Error al registrarse con Google");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-view-container">
      <div className="register-wrapper">
        <div className="register-card">
          <div className="register-header">
            <h1 className="register-title">Crea tu Cuenta</h1>
            <p className="register-subtitle">Únete a nuestra comunidad</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              ¡Cuenta creada correctamente!
            </div>
          )}

          <form onSubmit={handleRegister} className="register-form">
            <div className="form-group">
              <label htmlFor="nombre" className="form-label">
                Nombre Completo
              </label>
              <input
                type="text"
                id="nombre"
                className="form-input"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={loading}
              />
            </div>

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
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <div className="password-input-wrapper">
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  disabled={loading}
                >
                  {passwordVisible ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar Contraseña
              </label>
              <div className="password-input-wrapper">
                <input
                  type={confirmPasswordVisible ? "text" : "password"}
                  id="confirmPassword"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  disabled={loading}
                >
                  {confirmPasswordVisible ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </button>
          </form>

          <div className="divider">
            <span>O</span>
          </div>

          <button
            type="button"
            className="google-button"
            onClick={handleGoogleSignUp}
            disabled={loading}
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.461,2.268,15.365,1.25,12.545,1.25 c-6.315,0-11.426,5.111-11.426,11.426c0,6.315,5.111,11.426,11.426,11.426c6.316,0,11.426-5.111,11.426-11.426 C23.971,11.855,23.814,11.023,23.519,10.239H12.545z"/>
            </svg>
            {loading ? "Conectando..." : "Registrarse con Google"}
          </button>

          <div className="register-footer">
            <p className="footer-text">
              ¿Ya tienes cuenta? <button className="footer-link" onClick={() => navegarA('login')}>Inicia sesión aquí</button>
            </p>
          </div>
        </div>

        <div className="register-decoration">
          <div className="decoration-circle decoration-circle-1"></div>
          <div className="decoration-circle decoration-circle-2"></div>
        </div>
      </div>
    </div>
  );
}
