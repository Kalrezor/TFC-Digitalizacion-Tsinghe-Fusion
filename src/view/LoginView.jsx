import { useState } from 'react';
import { auth, db } from '../firebase/config'; 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import '../App.css';

export default function LoginView() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Sesión iniciada");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          name: name,
          email: email,
          role: "comensal", 
          status: "active",
          createdAt: serverTimestamp(),
          photoURL: ""
        });
        
        console.log("Comensal registrado con éxito");
      }
    } catch (err) {
      if (err.code === 'auth/weak-password') {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Este correo ya está registrado.");
      } else {
        setError("Datos incorrectos o error de conexión.");
      }
      console.error("Error Firebase:", err.code);
    }
  };

  return (
    <div className="view-container">
      <div className="auth-card">
        <h2 className="section-title">
          {isLogin ? 'Inicio de Sesión' : 'Crear Cuenta'}
        </h2>
        
        {error && <p className="error-message" style={{ color: '#8b2323', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate={false}>
          {!isLogin && (
            <div className="form-group">
              <label>Nombre Completo</label>
              <input 
                type="text" 
                placeholder="Tu nombre" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="ejemplo@correo.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="Mínimo 6 caracteres" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            {isLogin ? 'Entrar' : 'Registrarse'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta?'}
            <span onClick={() => setIsLogin(!isLogin)} className="toggle-link">
              {isLogin ? ' Regístrate aquí' : ' Inicia sesión'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}