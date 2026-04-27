import { useState } from 'react';
import '../App.css'; 

export default function LoginView() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  return (
    <div className="view-container">
      <div className="auth-card">
        <h2 className="section-title">
          {isLogin ? 'Inicio de Sesión' : 'Crear Cuenta'}
        </h2>
        
        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          {!isLogin && (
            <div className="form-group">
              <label>Nombre Completo</label>
              <input 
                type="text" 
                placeholder="Tu nombre" 
                value={name}
                onChange={(e) => setName(e.target.value)}
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
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="********" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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