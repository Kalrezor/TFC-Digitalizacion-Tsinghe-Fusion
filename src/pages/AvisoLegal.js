/*
 * Archivo: src/pages/AvisoLegal.js
 * Proposito: Pagina legal con informacion del titular, condiciones de uso y aviso legal del sitio.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

import React from "react";
import { useNavigate } from "react-router-dom";

const AvisoLegal = () => {
  const navigate = useNavigate();

  return (
    <main className="editorial-legal-page">
      <div className="editorial-legal-card">
        <h1>Aviso Legal</h1>
        
        <p>
          <strong>1. DATOS IDENTIFICATIVOS</strong><br />
          En cumplimiento con el deber de información recogido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), a continuación se reflejan los siguientes datos del titular de este sitio web:
        </p>
        <ul>
          <li><strong>Titular de la web:</strong> TSINGHE Cocina Fusión, S.L. (Entidad simulada para fines académicos).</li>
          <li><strong>NIF/CIF:</strong> B-00000000</li>
          <li><strong>Domicilio comercial:</strong> Zona Vicálvaro, 28032, Madrid, España.</li>
          <li><strong>Correo electrónico de contacto:</strong> contacto@tsinghefusion.com</li>
        </ul><br />

        <p>
          <strong>2. USUARIOS</strong><br />
          El acceso y/o uso de este portal de TSINGHE Cocina Fusión atribuye la condición de USUARIO, que acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas. Las citadas Condiciones serán de aplicación independientemente de las Condiciones Generales de Contratación que en su caso resulten de obligado cumplimiento.
        </p>

        <p>
          <strong>3. USO DEL PORTAL</strong><br />
          La página web proporciona el acceso a informaciones, servicios, programas o datos (en adelante, "los contenidos") en Internet pertenecientes a TSINGHE Cocina Fusión o a sus licenciantes a los que el USUARIO pueda tener acceso. El USUARIO asume la responsabilidad del uso del portal. Dicha responsabilidad se extiende al registro o formulario de datos que fuese necesario para acceder a determinados servicios, como el sistema de gestión de reservas de mesas.
        </p>
        <p>
          En dicho registro el USUARIO será responsable de aportar información veraz y lícita. El USUARIO se compromete a hacer un uso adecuado de los contenidos y servicios que TSINGHE Cocina Fusión ofrece a través de su portal y con carácter enunciativo pero no limitativo, a no emplearlos para:
        </p>
        <ol>
          <li>Incurrir en actividades ilícitas, ilegales o contrarias a la buena fe y al orden público.</li>
          <li>Difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico-ilegal, de apología del terrorismo o atentatorio contra los derechos humanos.</li>
          <li>Provocar daños en los sistemas físicos y lógicos de TSINGHE Cocina Fusión, de sus proveedores o de terceras personas, introducir o difundir en la red virus informáticos o cualesquiera otros sistemas físicos o lógicos que sean susceptibles de provocar los daños anteriormente mencionados.</li>
        </ol><br />

        <p>
          <strong>4. PROTECCIÓN DE DATOS</strong><br />
          TSINGHE Cocina Fusión cumple con las directrices del Reglamento General de Protección de Datos (RGPD) de la Unión Europea y la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales, velando por garantizar un correcto uso y tratamiento de los datos personales del usuario recopilados en el formulario de reservas.
        </p>

        <p>
          <strong>5. PROPIEDAD INTELECTUAL E INDUSTRIAL</strong><br />
          TSINGHE Cocina Fusión por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (a título enunciativo, imágenes, marcas, logotipos, estructura, diseño y código fuente).
        </p>
        <p>
          Todos los derechos reservados. En virtud de lo dispuesto en los artículos 8 y 32.1, párrafo segundo, de la Ley de Propiedad Intelectual, quedan expresamente prohibidas la reproducción, la distribución y la comunicación pública, incluida su modalidad de puesta a disposición, de la totalidad o parte de los contenidos de esta página web, con fines comerciales, en cualquier soporte y por cualquier medio técnico, sin la autorización de TSINGHE Cocina Fusión.
        </p>

        <p>
          <strong>6. EXCLUSIÓN DE GARANTÍAS Y RESPONSABILIDAD</strong><br />
          TSINGHE Cocina Fusión no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos, falta de disponibilidad del portal o la transmisión de virus o programas maliciosos o lesivos en los contenidos.
        </p>
        <div style={{ fontStyle: "italic", borderLeft: "3px solid currentColor", paddingLeft: "10px", margin: "10px 0" }}>
          <strong>Aviso Académico:</strong> Debido a la naturaleza de este sitio web como Entorno de Simulación de un Trabajo Fin de Grado (TFC), se informa que este espacio no presta servicios comerciales ni reales de restauración, siendo su funcionalidad estrictamente evaluativa y didáctica.
        </div>

        <p>
          <strong>7. MODIFICACIONES</strong><br />
          TSINGHE Cocina Fusión se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su portal, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través de la misma como la forma en la que éstos aparezcan presentados o localizados en su portal.
        </p>

        <p>
          <strong>8. ENLACES</strong><br />
          En el caso de que en la página web se dispusiesen enlaces o hipervínculos hacía otros sitios de Internet, TSINGHE Cocina Fusión no ejercerá ningún tipo de control sobre dichos sitios y contenidos. En ningún caso asumirá responsabilidad alguna por los contenidos de algún enlace perteneciente a un sitio web ajeno.
        </p>

        <p>
          <strong>9. DERECHO DE EXCLUSIÓN</strong><br />
          TSINGHE Cocina Fusión se reserva el derecho a denegar o retirar el acceso a portal y/o los servicios ofrecidos sin necesidad de preaviso, a instancia propia o de un tercero, a aquellos usuarios que incumplan las presentes Condiciones Generales de Uso.
        </p>

        <p>
          <strong>10. GENERALIDADES</strong><br />
          TSINGHE Cocina Fusión perseguirá el incumplimiento de las presentes condiciones así como cualquier utilización indebida de su portal ejerciendo todas las acciones civiles y penales que le puedan corresponder en derecho.
        </p>

        <p>
          <strong>11. MODIFICACIÓN DE LAS PRESENTES CONDICIONES Y DURACIÓN</strong><br />
          TSINGHE Cocina Fusión podrá modificar en cualquier momento las condiciones aquí determinadas, siendo debidamente publicadas como aquí aparecen. La vigencia de las citadas condiciones irá en función de su exposición y estarán vigentes hasta que sean modificadas por otras debidamente publicadas.
        </p>

        <p>
          <strong>12. LEGISLACIÓN APLICABLE Y JURISDICCIÓN</strong><br />
          La relación entre TSINGHE Cocina Fusión y el USUARIO se regirá por la normativa española vigente y cualquier controversia se someterá a los Juzgados y tribunales de la ciudad de Madrid.
        </p>

        <button onClick={() => navigate(-1)} className="editorial-button" style={{ cursor: "pointer", background: "none", border: "1px solid currentColor" }}>
          Volver a la página anterior
        </button>
      </div>
    </main>
  );
};

export default AvisoLegal;
