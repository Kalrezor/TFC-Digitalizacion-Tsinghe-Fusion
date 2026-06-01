/*
 * Archivo: src/components/ReservationFormComensal.js
 * Proposito: Formulario de reserva para comensales autenticados con datos precargados.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import useAuth from "../hooks/useAuth";
import { toastError, toastSuccess } from "../services/ToastService";
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

  useEffect(() => {
    if (error) {
      toastError(error);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      toastSuccess(success);
    }
  }, [success]);

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
    <div className="comensal-reservation-form">
      <h2 className="comensal-reservation-title">
        Crear reserva
      </h2>

      <div className="comensal-reservation-card">
        <form noValidate onSubmit={handleSubmit}>
          <div className="comensal-reservation-grid">
            <label className="comensal-reservation-label">
              Fecha de reserva
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                max={maxDateString}
                className="comensal-reservation-input"
                required
              />
            </label>

            <label className="comensal-reservation-label">
              Hora
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="comensal-reservation-input"
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

            <div className="comensal-reservation-row">
              <label className="comensal-reservation-label comensal-reservation-flex">
                Personas
                <input
                  type="number"
                  value={peopleCount}
                  min={1}
                  max={10}
                  onChange={(e) => setPeopleCount(Number(e.target.value))}
                  className="comensal-reservation-input"
                  required
                />
              </label>
              <div className="comensal-reservation-flex">
                <div className="comensal-reservation-detected-label">
                  Turno detectado
                </div>
                <div className="comensal-reservation-pill">{shift || "Selecciona hora"}</div>
              </div>
            </div>

            <label className="comensal-reservation-label">
              Solicitudes especiales (opcional)
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={4}
                className="comensal-reservation-input comensal-reservation-textarea"
                placeholder="Ej: mesa tranquila, alergias, cumpleaños..."
              />
            </label>

            <div className="comensal-reservation-footer">
              <div className="comensal-reservation-profile-phone">
                Teléfono en tu perfil: <strong>{profilePhone || "no disponible"}</strong>
              </div>
              <button type="submit" disabled={loading} className="comensal-reservation-submit">
                {loading ? "Creando reserva..." : "Solicitar reserva"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationFormComensal;

