import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import useAuth from "../hooks/useAuth";
import ReservationTableService, {
  RESERVATION_TIMES,
  getShiftFromTime,
  isValidReservationTime,
} from "../services/ReservationTableService";

const ReservationFormComensal = () => {
  const { user, userName, userEmail, role } = useAuth();
  const [profilePhone, setProfilePhone] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");
  const [peopleCount, setPeopleCount] = useState(2);
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPhone = async () => {
      if (!user?.uid) {
        setProfilePhone("");
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setProfilePhone(userDoc.data().phone || "");
        }
      } catch (err) {
        console.error("Error obteniendo teléfono del usuario:", err);
      }
    };
    loadPhone();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (role !== "comensal") {
      setError("Solo los comensales pueden crear esta reserva.");
      return;
    }
    if (!user) {
      setError("Usuario no autenticado.");
      return;
    }
    if (!date) {
      setError("Selecciona una fecha de reserva.");
      return;
    }
    if (!time || !isValidReservationTime(time)) {
      setError("Selecciona una hora válida dentro del turno.");
      return;
    }
    if (!profilePhone) {
      setError("Tu perfil debe tener un teléfono registrado.");
      return;
    }
    if (peopleCount < 1 || peopleCount > 10) {
      setError("El número de personas debe estar entre 1 y 10.");
      return;
    }

    setLoading(true);
    try {
      const result = await ReservationTableService.createReservationFromComensal(
        {
          uid: user.uid,
          email: userEmail,
          displayName: userName,
          phone: profilePhone,
        },
        date,
        time,
        peopleCount,
        specialRequests,
      );

      if (result.success) {
        setSuccess("Reserva creada correctamente. Espera confirmación.");
        setDate(new Date().toISOString().split("T")[0]);
        setTime("");
        setPeopleCount(2);
        setSpecialRequests("");
      } else {
        setError(result.error || "Error al crear la reserva.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error inesperado al crear la reserva.");
    } finally {
      setLoading(false);
    }
  };

  const shift = getShiftFromTime(time);
  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split("T")[0];

  return (
    <div style={{ padding: "24px", maxWidth: "720px", margin: "0 auto" }}>
      <h2 style={{ color: "#DC143C", marginBottom: "14px" }}>
        🍽️ Crear Reserva
      </h2>

      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
          padding: "24px",
        }}
      >
        {error && (
          <div style={{ color: "#8b0000", marginBottom: "16px" }}>{error}</div>
        )}
        {success && (
          <div style={{ color: "#006400", marginBottom: "16px" }}>{success}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: "16px" }}>
            <label style={labelStyle}>
              Fecha de reserva
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                max={maxDateString}
                style={inputStyle}
                required
              />
            </label>

            <label style={labelStyle}>
              Hora
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={inputStyle}
                required
              >
                <option value="">Selecciona un horario</option>
                <optgroup label="Comida">
                  {RESERVATION_TIMES.comida.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Cena">
                  {RESERVATION_TIMES.cena.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>

            <div style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
              <label style={{ ...labelStyle, flex: 1 }}>
                Personas
                <input
                  type="number"
                  value={peopleCount}
                  min={1}
                  max={10}
                  onChange={(e) => setPeopleCount(Number(e.target.value))}
                  style={inputStyle}
                  required
                />
              </label>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                  Turno detectado
                </div>
                <div style={pillStyle}>{shift || "Selecciona hora"}</div>
              </div>
            </div>

            <label style={labelStyle}>
              Solicitudes especiales (opcional)
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={4}
                style={{ ...inputStyle, resize: "vertical", minHeight: "100px" }}
                placeholder="Ej: mesa tranquila, alergias, cumpleaños..."
              />
            </label>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "#444", fontSize: "14px" }}>
                Teléfono en tu perfil: <strong>{profilePhone || "no disponible"}</strong>
              </div>
              <button type="submit" disabled={loading} style={submitStyle}>
                {loading ? "Creando reserva..." : "Solicitar reserva"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  fontSize: "14px",
  color: "#333",
  gap: "10px",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #dcdcdc",
  fontSize: "14px",
  outline: "none",
};

const submitStyle = {
  background: "#DC143C",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "bold",
};

const pillStyle = {
  padding: "10px 12px",
  borderRadius: "999px",
  border: "1px solid #ddd",
  background: "#fafafa",
  color: "#333",
  textTransform: "capitalize",
};

export default ReservationFormComensal;
