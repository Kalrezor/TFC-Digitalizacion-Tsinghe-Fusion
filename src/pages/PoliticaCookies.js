import React from "react";
import { useNavigate } from "react-router-dom";

const PoliticaCookies = () => {
  const navigate = useNavigate();

  return (
    <main className="editorial-legal-page">
      <div className="editorial-legal-card">
        <h1>Política de Cookies</h1>
        
        <p>
          <strong>1. ¿QUÉ SON LAS COOKIES?</strong><br />
          Una cookie es un fichero que se descarga en su ordenador o dispositivo móvil al acceder a determinadas páginas web. Las cookies permiten a una página web, entre otras cosas, almacenar y recuperar información sobre los hábitos de navegación de un usuario o de su equipo y, dependiendo de la información que contengan y de la forma en que utilice su equipo, pueden utilizarse para reconocer al usuario.
        </p>

        <p>
          <strong>2. COOKIES UTILIZADAS EN ESTE SITIO WEB</strong><br />
          Esta página web utiliza una infraestructura técnica basada en <strong>Firebase (Google Cloud Platform)</strong> para su correcto funcionamiento. Las cookies que se emplean se clasifican en:
        </p>
        <ul>
          <li>
            <strong>Cookies Técnicas y Estrictamente Necesarias:</strong> Son aquellas que permiten al usuario la navegación a través de la página web y la utilización de las diferentes opciones o servicios que en ella existen (como por ejemplo, la identificación de la sesión o el procesamiento de la solicitud de reserva en tiempo real). Al ser indispensables para el funcionamiento del sitio, no requieren el consentimiento previo del usuario.
          </li><br />
          <li>
            <strong>Cookies de Firebase (Google):</strong> Firebase puede utilizar identificadores de sesión y cookies técnicas para mantener la estabilidad del servicio, gestionar la concurrencia en la base de datos de reservas y prevenir el fraude o uso malintencionado de los formularios.
          </li><br />
        </ul>

        <p>
          <strong>3. CÓMO DESACTIVAR O ELIMINAR LAS COOKIES</strong><br />
          El usuario puede, en cualquier momento, permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de las opciones del navegador instalado en su ordenador o dispositivo móvil:
        </p>
        <ul>
          <li><strong>Google Chrome:</strong> Configuración &gt; Privacidad y seguridad &gt; Cookies y otros datos de sitios.</li>
          <li><strong>Mozilla Firefox:</strong> Ajustes &gt; Privacidad &amp; Seguridad &gt; Cookies y datos del sitio.</li>
          <li><strong>Safari:</strong> Preferencias &gt; Privacidad &gt; Bloquear todas las cookies.</li>
          <li><strong>Microsoft Edge:</strong> Configuración &gt; Cookies y permisos del sitio.</li>
        </ul><br />
        <p>
          La desactivación de todas las cookies técnicas podría afectar a la correcta visualización de la web o impedir el funcionamiento esperado del sistema de reservas en tiempo real.
        </p>

        <div style={{ fontStyle: "italic", borderLeft: "3px solid currentColor", paddingLeft: "10px", margin: "20px 0" }}>
          <strong>Aviso Académico:</strong> Este sitio web es un entorno de simulación para un Trabajo Fin de Grado (TFC). El uso de cookies y herramientas de Firebase se limita al alcance didáctico del proyecto y no con fines de explotación comercial o rastreo publicitario masivo.
        </div>

        <button onClick={() => navigate(-1)} className="editorial-button" style={{ cursor: "pointer", background: "none", border: "1px solid currentColor" }}>
          Volver a la página anterior
        </button>
      </div>
    </main>
  );
};

export default PoliticaCookies;