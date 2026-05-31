import React from "react";
import { Link } from "react-router-dom";

const PoliticaPrivacidad = () => (
  <main className="editorial-legal-page">
    <div className="editorial-legal-card">
      <h1>Política de Privacidad</h1>
      <p>
        Aquí podrás añadir el contenido de la Política de Privacidad cuando esté disponible.
      </p>
      <p>
        Por ahora, esta página muestra un texto temporal y el enlace ya está preparado.
      </p>
      <Link to="/" className="editorial-button">
        Volver al inicio
      </Link>
    </div>
  </main>
);

export default PoliticaPrivacidad;
