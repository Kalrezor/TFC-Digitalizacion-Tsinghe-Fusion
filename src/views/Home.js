// Vista: Home.js
// P�gina de inicio del restaurante - Visible sin login requerido
// Muestra bienvenida, informaci�n del restaurante y call-to-action para reservas

import React from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../controllers/useAuth";
import "../styles/ChineseStyle.css";

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="home-container">
      {/* Header con navegaci�n */}
      <header className="home-header">
        <div className="header-content">
          <div className="restaurant-logo">
            <h1>🍜 Tsinghe Cocina Fusión</h1>
            <p className="tagline">Aut�ntica Cocina China</p>
          </div>
          <nav className="header-nav">
            <button onClick={() => navigate("/menu")} className="nav-btn">
              ?? Ver MENU
            </button>
            {user ? (
              <>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="nav-btn"
                >
                  ?? Mi Perfil
                </button>
                <button onClick={() => logout()} className="nav-btn btn-logout">
                  Cerrar Sesi�n
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate("/login")} className="nav-btn">
                  Iniciar Sesi�n
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="nav-btn btn-register"
                >
                  Registrarse
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Secci�n Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>¡Bienvenido a Tsinghe Cocina Fusión!</h2>
          <p className="hero-subtitle">
            Descubre la m�s aut�ntica cocina china en un ambiente acogedor
          </p>
          <div className="hero-buttons">
            <button
              onClick={() => navigate("/menu")}
              className="btn-primary btn-large"
            >
              ??? Explorar MENU
            </button>
            <button
              onClick={() =>
                user ? navigate("/reservations") : navigate("/login")
              }
              className="btn-secondary btn-large"
            >
              ?? Reservar Mesa
            </button>
          </div>
        </div>
      </section>

      {/* Informaci�n del Restaurante */}
      <section className="info-section">
        <div className="info-cards">
          <div className="info-card">
            <div className="card-icon">?????</div>
            <h3>Chefs Especializados</h3>
            <p>
              Con m�s de 20 a�os de experiencia en la gastronom�a china
              tradicional
            </p>
          </div>
          <div className="info-card">
            <div className="card-icon">??</div>
            <h3>Ingredientes Premium</h3>
            <p>
              Seleccionamos cuidadosamente los mejores ingredientes importados
            </p>
          </div>
          <div className="info-card">
            <div className="card-icon">??</div>
            <h3>Ambiente Familiar</h3>
            <p>
              Un lugar perfecto para disfrutar en compa��a de amigos y familia
            </p>
          </div>
        </div>
      </section>

      {/* Men� Destacado */}
      <section className="featured-section">
        <h2>Especialidades de la Casa</h2>
        <div className="featured-items">
          <div className="featured-item">
            <div className="item-image">??</div>
            <h4>Pato Pekin�s</h4>
            <p>Receta tradicional con salsa agridulce</p>
            <p className="item-price">�18.50</p>
          </div>
          <div className="featured-item">
            <div className="item-image">??</div>
            <h4>Arroz Frito Especial</h4>
            <p>Con camarones, huevo y vegetales</p>
            <p className="item-price">�12.99</p>
          </div>
          <div className="featured-item">
            <div className="item-image">??</div>
            <h4>Noodles Salteados</h4>
            <p>A la manera de Chongqing</p>
            <p className="item-price">�11.50</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <h2>�Listo para reservar?</h2>
        <p>
          Haz tu reserva ahora y disfruta de una experiencia culinaria �nica
        </p>
        {user ? (
          <button
            onClick={() => navigate("/reservations")}
            className="btn-primary btn-large"
          >
            ?? Reservar Ahora
          </button>
        ) : (
          <>
            <p className="cta-login-message">
              Inicia sesi�n para hacer una reserva
            </p>
            <button
              onClick={() => navigate("/login")}
              className="btn-primary btn-large"
            >
              ?? Iniciar Sesi�n
            </button>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Tsinghe Cocina Fusión</h4>
            <p>Calle Principal 123</p>
            <p>?? +34 900 123 456</p>
            <p>?? info@tsinghefusion.es</p>
          </div>
          <div className="footer-section">
            <h4>Horario</h4>
            <p>Lunes a Jueves: 12:00 - 23:00</p>
            <p>Viernes a S�bado: 12:00 - 00:30</p>
            <p>Domingo: 13:00 - 23:00</p>
          </div>
          <div className="footer-section">
            <h4>S�guenos</h4>
            <p>Facebook | Instagram | TikTok</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            &copy; 2026 Tsinghe Cocina Fusión. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
