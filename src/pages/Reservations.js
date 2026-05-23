import React from "react";
import "../styles/MinimalStyle.css";
import ReservationFormComensal from "../components/ReservationFormComensal";
import MyReservationsView from "./MyReservationsView";

const Reservations = ({ userId }) => (
  <div style={containerStyle}>
    <div style={gridStyle}>
      <section style={panelStyle}>
        <div style={panelHeaderStyle}>Crear reserva</div>
        <ReservationFormComensal />
      </section>

      <section style={panelStyle}>
        <div style={panelHeaderStyle}>Mis reservas</div>
        <MyReservationsView userId={userId} />
      </section>
    </div>
  </div>
);

const containerStyle = {
  padding: 24,
};

const headerStyle = {
  marginBottom: 24,
};

const titleStyle = {
  fontSize: 32,
  margin: 0,
  color: "#222",
};

const subtitleStyle = {
  marginTop: 8,
  color: "#555",
  lineHeight: 1.5,
};

const gridStyle = {
  display: "grid",
  gap: 24,
  gridTemplateColumns: "1fr",
};

const panelStyle = {
  background: "#fff",
  borderRadius: 20,
  boxShadow: "0 14px 32px rgba(0,0,0,0.08)",
  padding: 22,
};

const panelHeaderStyle = {
  marginBottom: 18,
  fontSize: 18,
  fontWeight: 700,
  color: "#222",
};

export default Reservations;
