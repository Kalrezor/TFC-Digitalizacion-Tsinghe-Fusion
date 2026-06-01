/*
 * Archivo: src/pages/PoliticaCookies.js
 * Proposito: Pagina legal de politica de cookies.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

import React from "react";
import { useNavigate } from "react-router-dom";

const PoliticaCookies = () => {
  const navigate = useNavigate();

  return (
    <main className="editorial-legal-page">
      <div className="editorial-legal-card">
        <h1>PolÃ­tica de Cookies</h1>
        
        <p>
          <strong>1. Â¿QUÃ‰ SON LAS COOKIES?</strong><br />
          Una cookie es un fichero que se descarga en su ordenador o dispositivo mÃ³vil al acceder a determinadas pÃ¡ginas web. Las cookies permiten a una pÃ¡gina web, entre otras cosas, almacenar y recuperar informaciÃ³n sobre los hÃ¡bitos de navegaciÃ³n de un usuario o de su equipo y, dependiendo de la informaciÃ³n que contengan y de la forma en que utilice su equipo, pueden utilizarse para reconocer al usuario.
        </p>

        <p>
          <strong>2. COOKIES UTILIZADAS EN ESTE SITIO WEB</strong><br />
          Esta pÃ¡gina web utiliza una infraestructura tÃ©cnica basada en <strong>Firebase (Google Cloud Platform)</strong> para su correcto funcionamiento. Las cookies que se emplean se clasifican en:
        </p>
        <ul>
          <li>
            <strong>Cookies TÃ©cnicas y Estrictamente Necesarias:</strong> Son aquellas que permiten al usuario la navegaciÃ³n a travÃ©s de la pÃ¡gina web y la utilizaciÃ³n de las diferentes opciones o servicios que en ella existen (como por ejemplo, la identificaciÃ³n de la sesiÃ³n o el procesamiento de la solicitud de reserva en tiempo real). Al ser indispensables para el funcionamiento del sitio, no requieren el consentimiento previo del usuario.
          </li><br />
          <li>
            <strong>Cookies de Firebase (Google):</strong> Firebase puede utilizar identificadores de sesiÃ³n y cookies tÃ©cnicas para mantener la estabilidad del servicio, gestionar la concurrencia en la base de datos de reservas y prevenir el fraude o uso malintencionado de los formularios.
          </li><br />
        </ul>

        <p>
          <strong>3. CÃ“MO DESACTIVAR O ELIMINAR LAS COOKIES</strong><br />
          El usuario puede, en cualquier momento, permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuraciÃ³n de las opciones del navegador instalado en su ordenador o dispositivo mÃ³vil:
        </p>
        <ul>
          <li><strong>Google Chrome:</strong> ConfiguraciÃ³n &gt; Privacidad y seguridad &gt; Cookies y otros datos de sitios.</li>
          <li><strong>Mozilla Firefox:</strong> Ajustes &gt; Privacidad &amp; Seguridad &gt; Cookies y datos del sitio.</li>
          <li><strong>Safari:</strong> Preferencias &gt; Privacidad &gt; Bloquear todas las cookies.</li>
          <li><strong>Microsoft Edge:</strong> ConfiguraciÃ³n &gt; Cookies y permisos del sitio.</li>
        </ul><br />
        <p>
          La desactivaciÃ³n de todas las cookies tÃ©cnicas podrÃ­a afectar a la correcta visualizaciÃ³n de la web o impedir el funcionamiento esperado del sistema de reservas en tiempo real.
        </p>

        <div style={{ fontStyle: "italic", borderLeft: "3px solid currentColor", paddingLeft: "10px", margin: "20px 0" }}>
          <strong>Aviso AcadÃ©mico:</strong> Este sitio web es un entorno de simulaciÃ³n para un Trabajo Fin de Grado (TFC). El uso de cookies y herramientas de Firebase se limita al alcance didÃ¡ctico del proyecto y no con fines de explotaciÃ³n comercial o rastreo publicitario masivo.
        </div>

        <button onClick={() => navigate(-1)} className="editorial-button" style={{ cursor: "pointer", background: "none", border: "1px solid currentColor" }}>
          Volver a la pÃ¡gina anterior
        </button>
      </div>
    </main>
  );
};

export default PoliticaCookies;
