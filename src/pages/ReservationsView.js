/*
 * Archivo: src/pages/ReservationsView.js
 * Proposito: Vista legacy/general de reservas con datos de reservas y mesas.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useReservations from "../hooks/useReservations";
import useTables from "../hooks/useTables";

const ReservationsView = ({ role, userId }) => {
  const navigate = useNavigate();
  const { reservations, loading, updateReservation, deleteReservation } =
    useReservations(role === "comensal" ? userId : null);
  const { tables } = useTables();

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ numPeople: 1 });

  const handleEditSave = async (id) => {
    await updateReservation(id, {
      numberOfPeople: parseInt(editData.numPeople),
    });
    setEditingId(null);
  };

  if (loading)
    return (
      <div className="reservations-loading">
        Cargando reservas...
      </div>
    );

  return (
    <div className="reservations-view">
      <h2
        className="reservations-view-title"
      >
        GestiÃ³n de Reservas
      </h2>

      <div className="reservations-list">
        {reservations.map((res) => {
          const reservationTableIds = Array.isArray(res.tableIds)
            ? res.tableIds
            : [];
          const assignedTables = tables
            .filter(
              (table) =>
                reservationTableIds.includes(table.id) ||
                table.reservationId === res.id ||
                table.id === res.tableId,
            )
            .sort(
              (a, b) =>
                Number(a.tableNumber || a.number || 0) -
                Number(b.tableNumber || b.number || 0),
            );
          const fusionCode =
            res.fusionCode ||
            assignedTables.find((table) => table.fusionCode)?.fusionCode;
          const tableNumbers = assignedTables.map(
            (table) => table.tableNumber || table.number || table.id,
          );
          const tableDisplay =
            tableNumbers.length > 1
              ? `${fusionCode ? `${fusionCode}: ` : ""}Mesas ${tableNumbers.join(", ")}`
              : tableNumbers.length === 1
                ? `Mesa ${tableNumbers[0]}`
                : "Pendiente";

          return (
            <div key={res.id} className="reservation-card">
              <div className="reservation-card-content">
                <h4 className="reservation-card-title">
                  {res.userName || "Cliente"}
                </h4>
                <p>
                  <b>Fecha:</b> {res.reservationDate}
                  <p></p> 
                  <b>Hora:</b> {res.reservationTime}
                </p>

                {editingId === res.id ? (
                  <div className="reservation-edit-field">
                    <input
                      type="number"
                      value={editData.numPeople}
                      onChange={(e) =>
                        setEditData({ ...editData, numPeople: e.target.value })
                      }
                      className="reservation-edit-input"
                    />
                  </div>
                ) : (
                  <p>
                    <b>Personas:</b> {res.numberOfPeople}
                  </p>
                )}

                <p>
                  <b>Mesa:</b>{" "}
                  {tableDisplay}
                </p>
              </div>

              <div className="reservation-actions-group">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/admin/tables", {
                      state: {
                        pendingAssignment: {
                          resId: res.id,
                          numberOfPeople: res.numberOfPeople,
                          userName: res.userName,
                        },
                      },
                    })
                  }
                  className="reservation-action-button reservation-action-button-blue"
                >
                  ASIGNAR / FUSIONAR
                </button>

                {editingId === res.id ? (
                  <button
                    onClick={() => handleEditSave(res.id)}
                    className="reservation-action-button reservation-action-button-green"
                  >
                    GUARDAR
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(res.id);
                      setEditData({ numPeople: res.numberOfPeople });
                    }}
                    className="reservation-action-button reservation-action-button-yellow"
                  >
                    EDITAR CANTIDAD
                  </button>
                )}

                <button
                  onClick={() =>
                    updateReservation(res.id, { status: "confirmada" })
                  }
                  className="reservation-action-button reservation-action-button-confirm"
                >
                  CONFIRMAR
                </button>

                <button
                  onClick={() => deleteReservation(res.id)}
                  className="reservation-action-button reservation-action-button-delete"
                >
                  ELIMINAR
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReservationsView;

