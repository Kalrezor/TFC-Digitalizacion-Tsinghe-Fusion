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
        <h1>PolÃ­tica de Privacidad</h1>
        
        <p>
          <strong>1. RESPONSABLE DEL TRATAMIENTO</strong><br />
          El responsable del tratamiento de los datos recogidos en este sitio web es <strong>TSINGHE Cocina FusiÃ³n, S.L.</strong>, con domicilio simulado en Zona VicÃ¡lvaro, 28032, Madrid, EspaÃ±a, y correo electrÃ³nico de contacto contacto@tsinghefusion.com. Todo ello en el marco exclusivo de un proyecto de simulaciÃ³n acadÃ©mica.
        </p>

        <p>
          <strong>2. DATOS QUE SE RECOGEN Y FINALIDAD</strong><br />
          A travÃ©s del formulario de reservas de la pÃ¡gina web, se solicitan Ãºnicamente los datos estrictamente necesarios para la gestiÃ³n de la reserva de mesa en el restaurante:
        </p>
        <ul>
          <li><strong>Datos recogidos:</strong> Nombre, nÃºmero de telÃ©fono, correo electrÃ³nico, fecha, hora de la reserva y nÃºmero de comensales.</li>
          <li><strong>Finalidad:</strong> La Ãºnica finalidad del tratamiento de estos datos es gestionar, confirmar, modificar o cancelar la reserva solicitada por el usuario, asÃ­ como posibilitar la comunicaciÃ³n en caso de cualquier incidencia.</li>
          <li><strong>Decisiones automatizadas:</strong> No se elaborarÃ¡n perfiles comerciales ni se tomarÃ¡n decisiones automatizadas basadas en los datos introducidos.</li>
        </ul><br />

        <p>
          <strong>3. LEGITIMACIÃ“N DEL TRATAMIENTO</strong><br />
          La base legal para el tratamiento de los datos es el <strong>consentimiento del interesado</strong> al cumplimentar y enviar voluntariamente el formulario de reserva, asÃ­ como la aplicaciÃ³n de medidas precontractuales para la prestaciÃ³n del servicio de restauraciÃ³n solicitado.
        </p>

        <p>
          <strong>4. DESTINATARIOS Y TRANSFERENCIAS INTERNACIONALES</strong><br />
          Los datos recopilados a travÃ©s del formulario se almacenan utilizando la infraestructura tecnolÃ³gica de <strong>Firebase (Google Cloud Platform)</strong>. Google actÃºa como encargado del tratamiento. Al utilizar los servicios de Firebase, los datos pueden transferirse a servidores ubicados en los Estados Unidos bajo las garantÃ­as adecuadas de las clÃ¡usulas contractuales tipo de la UniÃ³n Europea y el Marco de Privacidad de Datos (Data Privacy Framework). No se cederÃ¡n datos a otros terceros, salvo obligaciÃ³n legal.
        </p>

        <p>
          <strong>5. PLAZO DE CONSERVACIÃ“N DE LOS DATOS</strong><br />
          Los datos personales proporcionados para la gestiÃ³n de las reservas se conservarÃ¡n durante el tiempo estrictamente necesario para cumplir con la finalidad de la reserva y, posteriormente, durante los plazos legalmente exigibles para atender posibles responsabilidades.
        </p>

        <p>
          <strong>6. DERECHOS DE LOS USUARIOS</strong><br />
          El usuario tiene derecho a acceder a sus datos personales, solicitar la rectificaciÃ³n de los datos inexactos, solicitar su supresiÃ³n ("derecho al olvido"), limitar u oponerse a su tratamiento, asÃ­ como solicitar la portabilidad de sus datos. Para ejercer estos derechos ficticios dentro de este entorno de desarrollo, el usuario puede simular una comunicaciÃ³n al correo electrÃ³nico contacto@tsinghefusion.com.
        </p>

        <div style={{ fontStyle: "italic", borderLeft: "3px solid currentColor", paddingLeft: "10px", margin: "20px 0" }}>
          <strong>Aviso AcadÃ©mico:</strong> Este sitio web es un entorno de simulaciÃ³n para un Trabajo Fin de Grado (TFC). Los datos introducidos en el formulario de reservas se procesan de forma interna con fines de aprendizaje tecnolÃ³gico en el uso de Firebase, garantizando que no se utilizarÃ¡n para ninguna actividad comercial real.
        </div>

        <button onClick={() => navigate(-1)} className="editorial-button" style={{ cursor: "pointer", background: "none", border: "1px solid currentColor" }}>
          Volver a la pÃ¡gina anterior
        </button>
      </div>
    </main>
  );
};

export default PoliticaPrivacidad;
