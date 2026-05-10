// Vista: Home.js
// Página de inicio del restaurante - Diseño responsivo y minimalista
// Paleta: Perla, Dorado, Verde Sage

import React from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "../styles/MinimalStyle.css";

const Home = () => {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#e8dccf" }}>
      {/* Hero Section */}
      <section style={{
        backgroundColor: "#e8dccf",
        padding: "clamp(40px, 10vw, 80px) 16px",
        textAlign: "center",
        borderBottom: "2px solid #ffd700",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{
            fontSize: "clamp(32px, 8vw, 56px)",
            color: "#568d6e",
            marginBottom: "16px",
          }}>
            Tsinghe Cocina Fusión
          </h1>
          <p style={{
            fontSize: "clamp(14px, 3vw, 18px)",
            color: "#666666",
            marginBottom: "32px",
            maxWidth: "600px",
            margin: "0 auto 32px",
          }}>
            Auténtica cocina china en un ambiente acogedor
          </p>
          
          {/* CTA Buttons */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            justifyContent: "center",
            alignItems: "center",
          }}>
            <button
              onClick={() => navigate("/menu")}
              className="btn btn-primary"
              style={{
                minWidth: "160px",
                fontSize: "14px",
              }}
            >
              Ver Menú
            </button>
            <button
              onClick={() => {
                const reservePath = "/dashboard?section=nueva-reserva";
                if (user) {
                  if (role === "admin") {
                    navigate("/reservations");
                  } else {
                    navigate(reservePath);
                  }
                } else {
                  navigate(`/login?next=${encodeURIComponent(reservePath)}`);
                }
              }}
              className="btn btn-secondary"
              style={{
                minWidth: "160px",
                fontSize: "14px",
              }}
            >
              Reservar Mesa
            </button>
            {!user && (
              <button
                onClick={() => navigate(`/login?next=${encodeURIComponent("/dashboard?section=nueva-reserva")}`)}
                className="btn btn-secondary"
                style={{
                  minWidth: "160px",
                  fontSize: "14px",
                }}
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Info Sections - Grid Responsivo */}
      <section style={{
        padding: "clamp(40px, 10vw, 60px) 16px",
        backgroundColor: "white",
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "32px",
        }} className="grid-responsive">
          {/* Info Card 1 */}
          <div className="card">
            <h3 style={{
              color: "#2e8b57",
              marginBottom: "12px",
              fontSize: "18px",
            }}>
              ✓ Auténtico
            </h3>
            <p style={{ fontSize: "13px", color: "#666666" }}>
              Recetas tradicionales chinas preparadas con ingredientes de calidad
            </p>
          </div>

          {/* Info Card 2 */}
          <div className="card">
            <h3 style={{
              color: "#2e8b57",
              marginBottom: "12px",
              fontSize: "18px",
            }}>
              ✓ Acogedor
            </h3>
            <p style={{ fontSize: "13px", color: "#666666" }}>
              Ambiente cálido y moderno perfecto para compartir en familia
            </p>
          </div>

          {/* Info Card 3 */}
          <div className="card">
            <h3 style={{
              color: "#2e8b57",
              marginBottom: "12px",
              fontSize: "18px",
            }}>
              ✓ Fácil
            </h3>
            <p style={{ fontSize: "13px", color: "#666666" }}>
              Reserva en línea en segundos y gestiona tus preferencias
            </p>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section style={{
        padding: "clamp(40px, 10vw, 60px) 16px",
        backgroundColor: "#faf5ed",
        borderTop: "1px solid #e0e0e0",
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          textAlign: "center",
        }}>
          <h2 style={{
            fontSize: "clamp(24px, 5vw, 32px)",
            color: "#568d6e",
            marginBottom: "32px",
          }}>
            Explora Nuestras Opciones
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "20px",
          }} className="grid-2">
            {/* Option 1 */}
            <div className="card">
              <h3 style={{ color: "#6db888", marginBottom: "12px" }}>
                📋 Menú Completo
              </h3>
              <p style={{ fontSize: "13px", color: "#666666", marginBottom: "16px" }}>
                Descubre toda nuestra oferta culinaria
              </p>
              <Link
                to="/menu"
                className="btn btn-secondary"
                style={{ fontSize: "12px", padding: "8px 16px" }}
              >
                Ver Menú
              </Link>
            </div>

            {/* Option 2 */}
            <div className="card">
              <h3 style={{ color: "#6db888", marginBottom: "12px" }}>
                📅 Reservar
              </h3>
              <p style={{ fontSize: "13px", color: "#666666", marginBottom: "16px" }}>
                Asegura tu mesa en el momento que prefieras
              </p>
              <button
                onClick={() => {
                  const reservePath = "/dashboard?section=nueva-reserva";
                  if (user) {
                    if (role === "admin") {
                      navigate("/reservations");
                    } else {
                      navigate(reservePath);
                    }
                  } else {
                    navigate(`/login?next=${encodeURIComponent(reservePath)}`);
                  }
                }}
                className="btn btn-secondary"
                style={{ fontSize: "12px", padding: "8px 16px" }}
              >
                Reservar Ahora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section style={{
        padding: "clamp(40px, 10vw, 60px) 16px",
        backgroundColor: "white",
        textAlign: "center",
        borderTop: "2px solid #ffd700",
      }}>
        <div style={{
          maxWidth: "600px",
          margin: "0 auto",
        }}>
          <h2 style={{
            fontSize: "clamp(20px, 4vw, 28px)",
            color: "#568d6e",
            marginBottom: "20px",
          }}>
            {user ? `Bienvenido, ${user.email?.split("@")[0]}` : "¿Listo para disfrutar?"}
          </h2>
          
          {user ? (
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                to="/dashboard"
                className="btn btn-primary"
                style={{ fontSize: "14px" }}
              >
                Mi Panel
              </Link>
              <button
                onClick={logout}
                className="btn btn-secondary"
                style={{ fontSize: "14px" }}
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                to="/login"
                className="btn btn-primary"
                style={{ fontSize: "14px" }}
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="btn btn-secondary"
                style={{ fontSize: "14px" }}
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: "#2d2d2d",
        color: "#999999",
        padding: "24px 16px",
        textAlign: "center",
        fontSize: "12px",
        borderTop: "1px solid #444",
      }}>
        <p style={{ margin: 0 }}>
          © 2026 Tsinghe Cocina Fusión. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Home;
