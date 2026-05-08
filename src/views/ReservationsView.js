import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useReservations from "../controllers/useReservations";
import useTables from "../controllers/useTables";

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
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Cargando reservas...
      </div>
    );

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2
        style={{
          color: "#DC143C",
          borderBottom: "2px solid #FFD700",
          paddingBottom: "10px",
        }}
      >
        📋 Gestión de Reservas
      </h2>

      <div style={{ display: "grid", gap: "15px", marginTop: "20px" }}>
        {reservations.map((res) => {
          const tableAssigned = tables.find((t) => t.id === res.tableId);

          return (
            <div key={res.id} style={resCard}>
              <div style={{ flex: 2 }}>
                <h4 style={{ margin: "0 0 10px 0" }}>
                  👤 {res.userName || "Cliente"}
                </h4>
                <p>
                  📅 <b>Fecha:</b> {res.reservationDate} - {res.reservationTime}
                </p>

                {editingId === res.id ? (
                  <div style={{ margin: "10px 0" }}>
                    <input
                      type="number"
                      value={editData.numPeople}
                      onChange={(e) =>
                        setEditData({ ...editData, numPeople: e.target.value })
                      }
                      style={{ width: "60px", padding: "5px" }}
                    />
                  </div>
                ) : (
                  <p>
                    👥 <b>Personas:</b> {res.numberOfPeople}
                  </p>
                )}

                <p>
                  🪑 <b>Mesa:</b>{" "}
                  {tableAssigned
                    ? `Mesa ${tableAssigned.tableNumber}`
                    : "⚠️ Pendiente"}
                </p>
              </div>

              <div style={actionButtonsGroup}>
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
                  style={btnBlue}
                >
                  🧩 ASIGNAR / FUSIONAR
                </button>

                {editingId === res.id ? (
                  <button
                    onClick={() => handleEditSave(res.id)}
                    style={btnGreen}
                  >
                    💾 GUARDAR
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(res.id);
                      setEditData({ numPeople: res.numberOfPeople });
                    }}
                    style={btnYellow}
                  >
                    ✏️ EDITAR CANTIDAD
                  </button>
                )}

                <button
                  onClick={() =>
                    updateReservation(res.id, { status: "confirmada" })
                  }
                  style={btnConfirm}
                >
                  ✅ CONFIRMAR
                </button>

                <button
                  onClick={() => deleteReservation(res.id)}
                  style={btnDelete}
                >
                  🗑️ ELIMINAR
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const resCard = {
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "12px",
  display: "flex",
  justifyContent: "space-between",
  background: "#fff",
};
const actionButtonsGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  minWidth: "200px",
};
const btnBlue = {
  background: "#007bff",
  color: "white",
  border: "none",
  padding: "10px",
  cursor: "pointer",
  borderRadius: "6px",
  fontWeight: "bold",
};
const btnGreen = {
  background: "#28a745",
  color: "white",
  border: "none",
  padding: "10px",
  borderRadius: "6px",
};
const btnYellow = {
  background: "#FFD700",
  border: "none",
  padding: "10px",
  borderRadius: "6px",
  fontWeight: "bold",
};
const btnConfirm = {
  background: "#f9f9f9",
  border: "1px solid #28a745",
  color: "#28a745",
  padding: "8px",
  borderRadius: "6px",
};
const btnDelete = {
  background: "transparent",
  color: "#999",
  border: "none",
  fontSize: "12px",
  cursor: "pointer",
};

export default ReservationsView;
