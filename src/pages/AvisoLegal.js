import React from "react";
import { Link } from "react-router-dom";

const AvisoLegal = () => (
  <main className="editorial-legal-page">
    <div className="editorial-legal-card">
      <h1>Aviso Legal</h1>
      <p>
        Aquí podrás añadir el contenido del Aviso Legal cuando lo tengas listo.
      </p>
      <p>
        Mientras tanto, esta página funciona como un marcador de posición para que el enlace esté disponible en el sitio.
      </p>
      <Link to="/" className="editorial-button">
        Volver al inicio
      </Link>
    </div>
  </main>
);

export default AvisoLegal;
