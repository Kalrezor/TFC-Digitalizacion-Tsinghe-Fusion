// Vista: Home.js
// Pagina de inicio del restaurante. Solo capa visual/editorial.

import React from "react";
import { useNavigate, Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import useAuth from "../hooks/useAuth";
import "../styles/MinimalStyle.css";

const Home = () => {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

  const carouselSlides = [
    { src: "https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/multimediaDesing%2Fcarrusel1.jpg?alt=media&token=377a5544-b0f2-489a-af29-41c6fb0542d7", alt: "Imagen 1" },
    { src: "https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/multimediaDesing%2Fcarrusel2.jpg?alt=media&token=5023391c-893d-4325-bd55-5723ef8dd37d", alt: "Imagen 2" },
    { src: "https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/multimediaDesing%2Fcarrusel3.jpg?alt=media&token=19d625f6-d629-4ccc-810a-9049d90aa47d", alt: "Imagen 3" },
    { src: "https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/multimediaDesing%2Fcarrusel4.jpg?alt=media&token=bf132fdb-2cb1-4da0-be78-098b4feb0248", alt: "Imagen 4" },
    { src: "https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/multimediaDesing%2Fcarrusel5.jpg?alt=media&token=816ccb9c-4224-404c-8e8a-a1f31f5211fe", alt: "Imagen 5" },
    { src: "https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/multimediaDesing%2Fcarrusel6.jpg?alt=media&token=048fd638-e39a-43c2-ab6a-5403b07ffc98", alt: "Imagen 6" },
  ];

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 5000,
    cssEase: "linear",
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 100,
    pauseOnHover: false,
    pauseOnFocus: false,
    pauseOnDotsHover: false,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 0, settings: { slidesToShow: 1 } },
    ],
  };

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
            Una experiencia de mesa serena, precisa y contemporánea, donde la
            cocina china se presenta con ritmo editorial y producto cuidado.
          </p>

          <div className="home-actions">
            <button onClick={goToMenu} className="editorial-button">
              Ver menú
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
                Iniciar sesión
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
            <h3>Mesa sin fricción</h3>
            <p>
              Reserva online, consulta disponibilidad y gestiona tus datos desde
              un panel simple.
            </p>
          </article>
        </div>
      </section>

      <section
        className="editorial-section editorial-frame"
        style={{ margin: "20px 0", padding: "24px 0" }}
      >
        <div className="home-carousel-wrapper">
          <Slider {...sliderSettings} className="home-carousel">
            {carouselSlides.map((slide, index) => (
              <div key={index} className="home-carousel-slide" style={{ padding: "0 8px" }}>
                <div
                  style={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    background: "transparent",
                    minHeight: "260px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ width: "80%", height: "80%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img
                      src={slide.src}
                      alt={slide.alt}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      <section className="editorial-section editorial-frame">
        <div className="editorial-grid-2">
          <article className="editorial-cell">
            <p className="editorial-kicker">Carta</p>
            <h3>Platos, alérgenos y disponibilidad</h3>
            <p>
              Explora la carta completa con filtros por alérgenos y acceso claro
              a cada categoría.
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
              Accede a tu cuenta para reservar y mantener tus próximas visitas
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
              textShadow: "0 0 25px rgb(255, 255, 255, 80)",
            }}
          >
            {user
              ? `Bienvenido, ${(user?.displayName || "").split(" ")[0]}`
              : "Listo para sentarte a la mesa"}
          </h2>

          {user ? (
            <div className="home-actions">
              <button onClick={logout} className="editorial-button">
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="home-actions">
              <Link to="/login" className="editorial-button">
                Iniciar sesión
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
