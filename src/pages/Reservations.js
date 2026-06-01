/*
 * Archivo: src/pages/Reservations.js
 * Proposito: Contenedor de reservas del usuario autenticado.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

import React from "react";
import ReservationFormComensal from "../components/ReservationFormComensal";
import MyReservationsView from "./MyReservationsView";

const Reservations = ({ userId }) => (
  <div className="reservations-page">
    <div className="reservations-grid">
      <section className="reservations-panel">
        <div className="reservations-panel-header">Crear reserva</div>
        <ReservationFormComensal />
      </section>

      <section className="reservations-panel">
        <div className="reservations-panel-header">Mis reservas</div>
        <MyReservationsView userId={userId} />
      </section>
    </div>
  </div>
);

export default Reservations;


