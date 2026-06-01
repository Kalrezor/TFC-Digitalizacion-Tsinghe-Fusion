/*
 * Archivo: src/components/LegalFooter.js
 * Proposito: Footer legal con enlaces a aviso legal, privacidad y cookies.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

import React from "react";
import { Link } from "react-router-dom";

const LegalFooter = () => (
  <footer className="editorial-footer editorial-legal-footer">
    <div className="editorial-legal-links">
      <Link to="/aviso-legal">Aviso Legal</Link>
      <Link to="/politica-privacidad">PolÃ­tica de Privacidad</Link>
      <Link to="/politica-cookies">PolÃ­tica de Cookies</Link>
    </div>
    <div className="editorial-legal-copy">
      Â© {new Date().getFullYear()} Tsinghe Cocina FusiÃ³n. Todos los derechos reservados.
    </div>
  </footer>
);

export default LegalFooter;

