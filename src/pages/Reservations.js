import React from "react";
import ReservationFormComensal from "../components/ReservationFormComensal";
import MyReservationsView from "./MyReservationsView";

const Reservations = ({ userId }) => (
  <div style={{ padding: "24px", maxWidth: "1300px", margin: "0 auto", display: "grid", gap: "32px" }}>
    <div>
      <h2 style={{ color: "#DC143C", marginBottom: "16px" }}>📅 Reservas</h2>
      <p style={{ color: "#555", lineHeight: 1.7, maxWidth: "760px" }}>
        En esta sección puedes crear una reserva nueva y ver el estado de tus reservas actuales en un mismo lugar.
      </p>
    </div>

    <div
      style={{
        display: "grid",
        gap: "32px",
        gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
        alignItems: "start",
      }}
    >
      <ReservationFormComensal />
      <MyReservationsView userId={userId} />
    </div>
  </div>
);

export default Reservations;
