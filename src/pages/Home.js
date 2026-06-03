// Vista: Home.js
// Página de inicio con carrusel estructural y ofertas dinámicas reubicadas

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import useAuth from "../hooks/useAuth";
import plateService from "../services/PlateService";
import styles from "../styles/modules/Home.module.css";

const OfferCard = ({ offer, onSelect }) => {
  const imagenUrl = offer.imageUrl || "";
  const textoTitulo = offer.title || "Promoción Especial";
  const textoDescuento = offer.discount ? `-${offer.discount}%` : "Oferta";

  return (
    <div
      onClick={() => onSelect(offer)}
      className={styles.offerCard}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.06)";
      }}
    >
      {/* Imagen de fondo */}
      {imagenUrl && (
        <img
          src={imagenUrl}
          alt={textoTitulo}
          className={styles.offerCardImage}
        />
      )}

      {/* Degradado negro inferior para legibilidad */}
      <div className={styles.offerCardGradient} />

      {/* Bloque de Información Fijo en la Base */}
      <div className={styles.offerCardInfo}>
        {/* Etiqueta / Badge del Descuento */}
        <span className={styles.offerCardBadge}>{textoDescuento}</span>

        {/* Título de la Oferta */}
        <h3 className={styles.offerCardTitle}>{textoTitulo}</h3>
      </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [stretchCarouselSlides, setStretchCarouselSlides] = useState({});

  const handleCarouselImageLoad = (index, event) => {
    const { naturalHeight } = event.target;
    if (!naturalHeight) return;

    if (naturalHeight < 620) {
      setStretchCarouselSlides((prev) => ({ ...prev, [index]: true }));
    }
  };

  // Lógica de validación temporal exacta sanitizada para evitar fallos de zona horaria
  const isEnVigor = (offer) => {
    if (!offer.active) return false;

    const now = new Date();

    const parseLocalDate = (dateStr) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    };

    const start = parseLocalDate(offer.startDate);
    const end = parseLocalDate(offer.endDate);

    if (start && now < start) return false;
    if (end && now > end) return false;

    return true;
  };

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoadingOffers(true);
        const response = await plateService.getAllOffers();

        if (response.success && response.data) {
          // Filtrar únicamente las ofertas que están activas y en vigor según la fecha actual
          const validOffers = response.data.filter(isEnVigor);
          setOffers(validOffers);
        }
      } catch (error) {
        console.error("Error al cargar las ofertas en el Home:", error);
      } finally {
        setLoadingOffers(false);
      }
    };

    fetchOffers();
  }, []);

  const carouselSlides = [
    {
      src: "https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/multimediaDesing%2Fcarrusel1.jpg?alt=media&token=377a5544-b0f2-489a-af29-41c6fb0542d7",
      alt: "Imagen 1",
    },
    {
      src: "https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/multimediaDesing%2Fcarrusel2.jpg?alt=media&token=5023391c-893d-4325-bd55-5723ef8dd37d",
      alt: "Imagen 2",
    },
    {
      src: "https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/multimediaDesing%2Fcarrusel3.jpg?alt=media&token=19d625f6-d629-4ccc-810a-9049d90aa47d",
      alt: "Imagen 3",
    },
    {
      src: "https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/multimediaDesing%2Fcarrusel4.jpg?alt=media&token=bf132fdb-2cb1-4da0-be78-098b4feb0248",
      alt: "Imagen 4",
    },
    {
      src: "https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/multimediaDesing%2Fcarrusel5.jpg?alt=media&token=816ccb9c-4224-404c-8e8a-a1f31f5211fe",
      alt: "Imagen 5",
    },
    {
      src: "https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/multimediaDesing%2Fcarrusel6.jpg?alt=media&token=048fd638-e39a-43c2-ab6a-5403b07ffc98",
      alt: "Imagen 6",
    },
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
    setSelectedOffer(null);
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
      {/* SECCIÓN HERO */}
      <section className="home-hero editorial-frame">
        <div className="home-hero-copy">
          <p className="editorial-kicker">Cocina fusión · Madrid</p>
          <h1 className="home-title editorial-serif">Tsinghe Cocina Fusión</h1>
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
            <video
              className="home-hero-video-bg"
              autoPlay
              muted
              loop
              playsInline
            >
              <source
                src="https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/multimediaDesing%2Fcorte%20vertic.mp4?alt=media&token=5081065f-00a2-40d1-9fbe-9511f9acca3c"
                type="video/mp4"
              />
            </video>
            <div className="editorial-photo">
              <video
                className="home-hero-video-fg"
                autoPlay
                muted
                loop
                playsInline
              >
                <source
                  src="https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/multimediaDesing%2Fcorte%20vertic.mp4?alt=media&token=5081065f-00a2-40d1-9fbe-9511f9acca3c"
                  type="video/mp4"
                />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN MÁXIMAS RESTAURANTE */}
      <section className="editorial-section editorial-frame">
        <div className="editorial-grid-3">
          <article className="editorial-cell">
            <p className="editorial-kicker">Producto</p>
            <h3>Origen y precisión</h3>
            <p>
              Recetas de inspiración china preparadas con ingredientes cuidados
              y una presentación limpia.
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

      {/* 1. CARRUSEL DE IMÁGENES */}
      <section
        className={`editorial-section editorial-frame ${styles.carouselSection}`}
      >
        <div className={`home-carousel-wrapper ${styles.carouselWrapper}`}>
          <Slider {...sliderSettings} className="home-carousel">
            {carouselSlides.map((slide, index) => (
              <div
                key={index}
                className={`home-carousel-slide ${styles.carouselSlide}`}
              >
                <div className={styles.carouselSlideInner}>
                  {/* Volvemos al ancho de antes para recuperar el formato vertical,
                      pero forzamos el centrado horizontal con margin: 0 auto */}
                  <div className={styles.carouselImageFrame}>
                    <img
                      src={slide.src}
                      alt={slide.alt}
                      onLoad={(e) => handleCarouselImageLoad(index, e)}
                      className={styles.carouselImage}
                      style={{
                        objectFit: stretchCarouselSlides[index]
                          ? "fill"
                          : "cover",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* 2. SECCIÓN DE OFERTAS DINÁMICAS */}
      {!loadingOffers && offers.length > 0 && (
        <section
          className={`editorial-section editorial-frame ${styles.offersSection}`}
        >
          <p className={`editorial-kicker ${styles.offersKicker}`}>
            Experiencias de temporada
          </p>
          <h2 className={`editorial-serif ${styles.offersHeading}`}>
            Promociones Activas
          </h2>

          <div className={styles.offersGrid}>
            {offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onSelect={(o) => setSelectedOffer(o)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. SECCIÓN INTERMEDIA DE REDIRECCIÓN */}
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
                Ver menú
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

      {/* SECCIÓN SEGUNDO VIDEO INFERIOR */}
      <section className="editorial-section editorial-frame home-access-section">
        <div className="home-access-video-wrapper" aria-hidden="true">
          <video
            className="home-access-video-bg"
            autoPlay
            muted
            loop
            playsInline
          >
            <source
              src="https://firebasestorage.googleapis.com/v0/b/digitalizacion-tsinge-fusion.firebasestorage.app/o/multimediaDesing%2FSENTADOS_2.mp4?alt=media&token=53af7f03-87ae-409e-a93a-a56052200db8"
              type="video/mp4"
            />
          </video>
          <div className="home-access-video-overlay" />
        </div>

        <div className={`home-access-content ${styles.accessContent}`}>
          <p className="editorial-kicker">Acceso</p>
          <h2 className={`editorial-serif ${styles.accessHeading}`}>
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

      {/* POP-UP / MODAL DETALLE DE OFERTA */}
      {selectedOffer && (
        <div onClick={() => setSelectedOffer(null)} className={styles.modalOverlay}>
          <div
            onClick={(e) => e.stopPropagation()}
            className={styles.modalCard}
          >
            {selectedOffer.imageUrl && (
              <div className={styles.modalImageWrap}>
                <img
                  src={selectedOffer.imageUrl}
                  alt={selectedOffer.title}
                  className={styles.modalImage}
                />
                <button
                  onClick={() => setSelectedOffer(null)}
                  className={styles.modalClose}
                >
                  ✕
                </button>
              </div>
            )}

            <div className={styles.modalBody}>
              <span className={styles.modalBadge}>
                {selectedOffer.discount
                  ? `-${selectedOffer.discount}%`
                  : "Oferta"}
              </span>

              <h2 className={styles.modalTitle}>
                {selectedOffer.title || "Promoción Especial"}
              </h2>

              <p className={styles.modalDescription}>
                {selectedOffer.description || "Sin descripción disponible."}
              </p>

              <button
                onClick={goToReservation}
                className={`editorial-button ${styles.modalButton}`}
              >
                Aprovechar Oferta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
