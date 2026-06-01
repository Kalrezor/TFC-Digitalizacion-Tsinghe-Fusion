/*
 * Archivo: src/pages/PoliticaPrivacidad.js
 * Proposito: Pagina legal de politica de privacidad y tratamiento de datos.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

import React from "react";
import { useNavigate } from "react-router-dom";

const PoliticaPrivacidad = () => {
  const navigate = useNavigate();

  return (
    <main className="editorial-legal-page">
      <div className="editorial-legal-card">
        <h1>Política de Privacidad</h1>
        
        <p>
          <strong>1. RESPONSABLE DEL TRATAMIENTO</strong><br />
          El responsable del tratamiento de los datos recogidos en este sitio web es <strong>TSINGHE Cocina Fusión, S.L.</strong>, con domicilio simulado en Zona Vicálvaro, 28032, Madrid, España, y correo electrónico de contacto contacto@tsinghefusion.com. Todo ello en el marco exclusivo de un proyecto de simulación académica.
        </p>

        <p>
          <strong>2. DATOS QUE SE RECOGEN Y FINALIDAD</strong><br />
          A través del formulario de reservas de la página web, se solicitan únicamente los datos estrictamente necesarios para la gestión de la reserva de mesa en el restaurante:
        </p>
        <ul>
          <li><strong>Datos recogidos:</strong> Nombre, número de teléfono, correo electrónico, fecha, hora de la reserva y número de comensales.</li>
          <li><strong>Finalidad:</strong> La única finalidad del tratamiento de estos datos es gestionar, confirmar, modificar o cancelar la reserva solicitada por el usuario, así como posibilitar la comunicación en caso de cualquier incidencia.</li>
          <li><strong>Decisiones automatizadas:</strong> No se elaborarán perfiles comerciales ni se tomarán decisiones automatizadas basadas en los datos introducidos.</li>
        </ul><br />

        <p>
          <strong>3. LEGITIMACIÓN DEL TRATAMIENTO</strong><br />
          La base legal para el tratamiento de los datos es el <strong>consentimiento del interesado</strong> al cumplimentar y enviar voluntariamente el formulario de reserva, así como la aplicación de medidas precontractuales para la prestación del servicio de restauración solicitado.
        </p>

        <p>
          <strong>4. DESTINATARIOS Y TRANSFERENCIAS INTERNACIONALES</strong><br />
          Los datos recopilados a través del formulario se almacenan utilizando la infraestructura tecnológica de <strong>Firebase (Google Cloud Platform)</strong>. Google actúa como encargado del tratamiento. Al utilizar los servicios de Firebase, los datos pueden transferirse a servidores ubicados en los Estados Unidos bajo las garantías adecuadas de las cláusulas contractuales tipo de la Unión Europea y el Marco de Privacidad de Datos (Data Privacy Framework). No se cederán datos a otros terceros, salvo obligación legal.
        </p>

        <p>
          <strong>5. PLAZO DE CONSERVACIÓN DE LOS DATOS</strong><br />
          Los datos personales proporcionados para la gestión de las reservas se conservarán durante el tiempo estrictamente necesario para cumplir con la finalidad de la reserva y, posteriormente, durante los plazos legalmente exigibles para atender posibles responsabilidades.
        </p>

        <p>
          <strong>6. DERECHOS DE LOS USUARIOS</strong><br />
          El usuario tiene derecho a acceder a sus datos personales, solicitar la rectificación de los datos inexactos, solicitar su supresión ("derecho al olvido"), limitar u oponerse a su tratamiento, así como solicitar la portabilidad de sus datos. Para ejercer estos derechos ficticios dentro de este entorno de desarrollo, el usuario puede simular una comunicación al correo electrónico contacto@tsinghefusion.com.
        </p>

        <div style={{ fontStyle: "italic", borderLeft: "3px solid currentColor", paddingLeft: "10px", margin: "20px 0" }}>
          <strong>Aviso Académico:</strong> Este sitio web es un entorno de simulación para un Trabajo Fin de Grado (TFC). Los datos introducidos en el formulario de reservas se procesan de forma interna con fines de aprendizaje tecnológico en el uso de Firebase, garantizando que no se utilizarán para ninguna actividad comercial real.
        </div>

        <button onClick={() => navigate(-1)} className="editorial-button" style={{ cursor: "pointer", background: "none", border: "1px solid currentColor" }}>
          Volver a la página anterior
        </button>
      </div>
    </main>
  );
};

export default PoliticaPrivacidad;
