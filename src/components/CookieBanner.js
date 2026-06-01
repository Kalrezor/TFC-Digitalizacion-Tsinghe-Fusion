/*
 * Archivo: src/components/CookieBanner.js
 * Proposito: Banner de consentimiento de cookies y enlace a politica correspondiente.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "tsinghe-cookie-consent";

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setIsVisible(false);
  };

  const handleClose = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "dismissed");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-banner-content">
        <div className="cookie-banner-text">
          <strong>Usamos cookies</strong> para mejorar tu experiencia.
          Al continuar, aceptas nuestra <Link to="/politica-cookies">Política de Cookies</Link>.
        </div>
        <div className="cookie-banner-actions">
          <button
            type="button"
            className="cookie-banner-button cookie-banner-button-secondary"
            onClick={handleClose}
          >
            Cerrar
          </button>
          <button
            type="button"
            className="cookie-banner-button cookie-banner-button-primary"
            onClick={handleAccept}
          >
            Aceptar cookies
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;

