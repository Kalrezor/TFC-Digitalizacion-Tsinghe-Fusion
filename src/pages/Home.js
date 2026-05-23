// Vista: Home.js
// Pagina de inicio del restaurante. Solo capa visual/editorial.

import React from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "../styles/MinimalStyle.css";

const Home = () => {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

  const goToMenu = () => {
    if (user) {
      navigate("/dashboard?section=preview-menu");
    } else {
      navigate("/menu");
    }
  };

  const goToReservation = () => {
    const reservePath = "/dashboard?section=reservas";
    if (user) {
      if (role === "admin") {
        navigate("/dashboard?section=admin-reservas");
      } else {
        navigate(reservePath);
      }
    } else {
      navigate(`/login?next=${encodeURIComponent(reservePath)}`);
    }
  };

  return (
    <div className="editorial-shell">
      <section className="home-hero editorial-frame">
        <div className="home-hero-copy">
          <p className="editorial-kicker">Cocina fusion · Madrid</p>
          <h1 className="home-title editorial-serif">Tsinghe Cocina Fusion</h1>
          <p className="home-lede">
            Una experiencia de mesa serena, precisa y contemporanea, donde la
            cocina china se presenta con ritmo editorial y producto cuidado.
          </p>

          <div className="home-actions">
            <button onClick={goToMenu} className="editorial-button">
              Ver menu
            </button>
            <button onClick={goToReservation} className="editorial-button">
              Reservar mesa
            </button>
            {!user && (
              <button
                onClick={() =>
                  navigate(
                    `/login?next=${encodeURIComponent(
                      "/dashboard?section=reservas",
                    )}`,
                  )
                }
                className="editorial-button"
              >
                Iniciar sesion
              </button>
            )}
          </div>
        </div>

        <div className="home-hero-visual">
          <div className="home-hero-video-wrapper" aria-hidden="true">
            <video className="home-hero-video-bg" autoPlay muted loop playsInline>
              <source
                src="https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/multimediaDesing%2Fcorte%20vertic.mp4?alt=media&token=5081065f-00a2-40d1-9fbe-9511f9acca3c"
                type="video/mp4"
              />
            </video>
            <div className="editorial-photo">
              <video className="home-hero-video-fg" autoPlay muted loop playsInline>
                <source
                  src="https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/multimediaDesing%2Fcorte%20vertic.mp4?alt=media&token=5081065f-00a2-40d1-9fbe-9511f9acca3c"
                  type="video/mp4"
                />
              </video>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-section editorial-frame">
        <div className="editorial-grid-3">
          <article className="editorial-cell">
            <p className="editorial-kicker">Producto</p>
            <h3>Origen y precision</h3>
            <p>
              Recetas de inspiracion china preparadas con ingredientes cuidados
              y una presentacion limpia.
            </p>
          </article>

          <article className="editorial-cell">
            <p className="editorial-kicker">Sala</p>
            <h3>Calma y ritmo</h3>
            <p>
              Un ambiente sobrio para compartir sin ruido visual, pensado para
              que la comida tenga presencia.
            </p>
          </article>

          <article className="editorial-cell">
            <p className="editorial-kicker">Reserva</p>
            <h3>Mesa sin friccion</h3>
            <p>
              Reserva online, consulta disponibilidad y gestiona tus datos desde
              un panel simple.
            </p>
          </article>
        </div>
      </section>

      <section className="editorial-section editorial-frame">
        <div className="editorial-grid-2">
          <article className="editorial-cell">
            <p className="editorial-kicker">Carta</p>
            <h3>Platos, alergenos y disponibilidad</h3>
            <p>
              Explora la carta completa con filtros por alergenos y acceso claro
              a cada categoria.
            </p>
            <div className="home-actions">
              <button onClick={goToMenu} className="editorial-button">
                Ver menu
              </button>
            </div>
          </article>

          <article className="editorial-cell">
            <p className="editorial-kicker">Mesa</p>
            <h3>Reserva en el momento adecuado</h3>
            <p>
              Accede a tu cuenta para reservar y mantener tus proximas visitas
              organizadas.
            </p>
            <div className="home-actions">
              <button onClick={goToReservation} className="editorial-button">
                Reservar ahora
              </button>
            </div>
          </article>
        </div>
      </section>

      <section className="editorial-section editorial-frame home-access-section">
        <div className="home-access-video-wrapper" aria-hidden="true">
          <video className="home-access-video-bg" autoPlay muted loop playsInline>
            <source
              src="https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/multimediaDesing%2FSENTADOS_2.mp4?alt=media&token=53af7f03-87ae-409e-a93a-a56052200db8"
              type="video/mp4"
            />
          </video>
          <div className="home-access-video-overlay" />
        </div>

        <div className="home-access-content" style={{ maxWidth: "720px" }}>
          <p className="editorial-kicker">Acceso</p>
          <h2
            className="editorial-serif"
            style={{
              fontSize: "clamp(42px, 7vw, 92px)",
              margin: "18px 0 28px",
            }}
          >
            {user
              ? `Bienvenido, ${(user?.displayName || "").split(" ")[0]}`
              : "Listo para sentarte a la mesa"}
          </h2>

          {user ? (
            <div className="home-actions">
              <button onClick={logout} className="editorial-button">
                Cerrar sesion
              </button>
            </div>
          ) : (
            <div className="home-actions">
              <Link to="/login" className="editorial-button">
                Iniciar sesion
              </Link>
              <Link to="/register" className="editorial-button">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </section>

      <footer className="editorial-footer editorial-ui">
        © 2026 Tsinghe Cocina Fusion. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Home;
