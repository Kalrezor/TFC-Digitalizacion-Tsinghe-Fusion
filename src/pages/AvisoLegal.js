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
          En cumplimiento con el deber de informaciÃ³n recogido en el artÃ­culo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la InformaciÃ³n y del Comercio ElectrÃ³nico (LSSI-CE), a continuaciÃ³n se reflejan los siguientes datos del titular de este sitio web:
        </p>
        <ul>
          <li><strong>Titular de la web:</strong> TSINGHE Cocina FusiÃ³n, S.L. (Entidad simulada para fines acadÃ©micos).</li>
          <li><strong>NIF/CIF:</strong> B-00000000</li>
          <li><strong>Domicilio comercial:</strong> Zona VicÃ¡lvaro, 28032, Madrid, EspaÃ±a.</li>
          <li><strong>Correo electrÃ³nico de contacto:</strong> contacto@tsinghefusion.com</li>
        </ul><br />

        <p>
          <strong>2. USUARIOS</strong><br />
          El acceso y/o uso de este portal de TSINGHE Cocina FusiÃ³n atribuye la condiciÃ³n de USUARIO, que acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquÃ­ reflejadas. Las citadas Condiciones serÃ¡n de aplicaciÃ³n independientemente de las Condiciones Generales de ContrataciÃ³n que en su caso resulten de obligado cumplimiento.
        </p>

        <p>
          <strong>3. USO DEL PORTAL</strong><br />
          La pÃ¡gina web proporciona el acceso a informaciones, servicios, programas o datos (en adelante, "los contenidos") en Internet pertenecientes a TSINGHE Cocina FusiÃ³n o a sus licenciantes a los que el USUARIO pueda tener acceso. El USUARIO asume la responsabilidad del uso del portal. Dicha responsabilidad se extiende al registro o formulario de datos que fuese necesario para acceder a determinados servicios, como el sistema de gestiÃ³n de reservas de mesas.
        </p>
        <p>
          En dicho registro el USUARIO serÃ¡ responsable de aportar informaciÃ³n veraz y lÃ­cita. El USUARIO se compromete a hacer un uso adecuado de los contenidos y servicios que TSINGHE Cocina FusiÃ³n ofrece a travÃ©s de su portal y con carÃ¡cter enunciativo pero no limitativo, a no emplearlos para:
        </p>
        <ol>
          <li>Incurrir en actividades ilÃ­citas, ilegales o contrarias a la buena fe y al orden pÃºblico.</li>
          <li>Difundir contenidos o propaganda de carÃ¡cter racista, xenÃ³fobo, pornogrÃ¡fico-ilegal, de apologÃ­a del terrorismo o atentatorio contra los derechos humanos.</li>
          <li>Provocar daÃ±os en los sistemas fÃ­sicos y lÃ³gicos de TSINGHE Cocina FusiÃ³n, de sus proveedores o de terceras personas, introducir o difundir en la red virus informÃ¡ticos o cualesquiera otros sistemas fÃ­sicos o lÃ³gicos que sean susceptibles de provocar los daÃ±os anteriormente mencionados.</li>
        </ol><br />

        <p>
          <strong>4. PROTECCIÃ“N DE DATOS</strong><br />
          TSINGHE Cocina FusiÃ³n cumple con las directrices del Reglamento General de ProtecciÃ³n de Datos (RGPD) de la UniÃ³n Europea y la Ley OrgÃ¡nica 3/2018, de 5 de diciembre, de ProtecciÃ³n de Datos Personales y garantÃ­a de los derechos digitales, velando por garantizar un correcto uso y tratamiento de los datos personales del usuario recopilados en el formulario de reservas.
        </p>

        <p>
          <strong>5. PROPIEDAD INTELECTUAL E INDUSTRIAL</strong><br />
          TSINGHE Cocina FusiÃ³n por sÃ­ o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su pÃ¡gina web, asÃ­ como de los elementos contenidos en la misma (a tÃ­tulo enunciativo, imÃ¡genes, marcas, logotipos, estructura, diseÃ±o y cÃ³digo fuente).
        </p>
        <p>
          Todos los derechos reservados. En virtud de lo dispuesto en los artÃ­culos 8 y 32.1, pÃ¡rrafo segundo, de la Ley de Propiedad Intelectual, quedan expresamente prohibidas la reproducciÃ³n, la distribuciÃ³n y la comunicaciÃ³n pÃºblica, incluida su modalidad de puesta a disposiciÃ³n, de la totalidad o parte de los contenidos de esta pÃ¡gina web, con fines comerciales, en cualquier soporte y por cualquier medio tÃ©cnico, sin la autorizaciÃ³n de TSINGHE Cocina FusiÃ³n.
        </p>

        <p>
          <strong>6. EXCLUSIÃ“N DE GARANTÃAS Y RESPONSABILIDAD</strong><br />
          TSINGHE Cocina FusiÃ³n no se hace responsable, en ningÃºn caso, de los daÃ±os y perjuicios de cualquier naturaleza que pudieran ocasionar, a tÃ­tulo enunciativo: errores u omisiones en los contenidos, falta de disponibilidad del portal o la transmisiÃ³n de virus o programas maliciosos o lesivos en los contenidos.
        </p>
        <div style={{ fontStyle: "italic", borderLeft: "3px solid currentColor", paddingLeft: "10px", margin: "10px 0" }}>
          <strong>Aviso AcadÃ©mico:</strong> Debido a la naturaleza de este sitio web como Entorno de SimulaciÃ³n de un Trabajo Fin de Grado (TFC), se informa que este espacio no presta servicios comerciales ni reales de restauraciÃ³n, siendo su funcionalidad estrictamente evaluativa y didÃ¡ctica.
        </div>

        <p>
          <strong>7. MODIFICACIONES</strong><br />
          TSINGHE Cocina FusiÃ³n se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su portal, pudiendo cambiar, suprimir o aÃ±adir tanto los contenidos y servicios que se presten a travÃ©s de la misma como la forma en la que Ã©stos aparezcan presentados o localizados en su portal.
        </p>

        <p>
          <strong>8. ENLACES</strong><br />
          En el caso de que en la pÃ¡gina web se dispusiesen enlaces o hipervÃ­nculos hacÃ­a otros sitios de Internet, TSINGHE Cocina FusiÃ³n no ejercerÃ¡ ningÃºn tipo de control sobre dichos sitios y contenidos. En ningÃºn caso asumirÃ¡ responsabilidad alguna por los contenidos de algÃºn enlace perteneciente a un sitio web ajeno.
        </p>

        <p>
          <strong>9. DERECHO DE EXCLUSIÃ“N</strong><br />
          TSINGHE Cocina FusiÃ³n se reserva el derecho a denegar o retirar el acceso a portal y/o los servicios ofrecidos sin necesidad de preaviso, a instancia propia o de un tercero, a aquellos usuarios que incumplan las presentes Condiciones Generales de Uso.
        </p>

        <p>
          <strong>10. GENERALIDADES</strong><br />
          TSINGHE Cocina FusiÃ³n perseguirÃ¡ el incumplimiento de las presentes condiciones asÃ­ como cualquier utilizaciÃ³n indebida de su portal ejerciendo todas las acciones civiles y penales que le puedan corresponder en derecho.
        </p>

        <p>
          <strong>11. MODIFICACIÃ“N DE LAS PRESENTES CONDICIONES Y DURACIÃ“N</strong><br />
          TSINGHE Cocina FusiÃ³n podrÃ¡ modificar en cualquier momento las condiciones aquÃ­ determinadas, siendo debidamente publicadas como aquÃ­ aparecen. La vigencia de las citadas condiciones irÃ¡ en funciÃ³n de su exposiciÃ³n y estarÃ¡n vigentes hasta que sean modificadas por otras debidamente publicadas.
        </p>

        <p>
          <strong>12. LEGISLACIÃ“N APLICABLE Y JURISDICCIÃ“N</strong><br />
          La relaciÃ³n entre TSINGHE Cocina FusiÃ³n y el USUARIO se regirÃ¡ por la normativa espaÃ±ola vigente y cualquier controversia se someterÃ¡ a los Juzgados y tribunales de la ciudad de Madrid.
        </p>

        <button onClick={() => navigate(-1)} className="editorial-button" style={{ cursor: "pointer", background: "none", border: "1px solid currentColor" }}>
          Volver a la pÃ¡gina anterior
        </button>
      </div>
    </main>
  );
};

export default AvisoLegal;
