import React from "react";
import { Link } from "react-router-dom";

const PoliticaCookies = () => (
  <main className="editorial-legal-page">
    <div className="editorial-legal-card">
      <h1>Política de Cookies</h1>
      <p>
        Aquí podrás añadir el contenido de la Política de Cookies cuando lo tengas listo.
      </p>
      <p>
        El aviso de cookies se muestra automáticamente al entrar en el sitio.
      </p>
      <Link to="/" className="editorial-button">
        Volver al inicio
      </Link>
    </div>
  </main>
);

export default PoliticaCookies;
