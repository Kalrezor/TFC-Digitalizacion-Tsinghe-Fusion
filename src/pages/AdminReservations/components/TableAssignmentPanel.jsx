import React from "react";
import styles from "../../../styles/modules/AdminReservationsView.module.css";

const TableAssignmentPanel = ({
  selectedReservation,
  activeAssignedTableIds,
  availableTables,
  formState,
  selectedTableIds,
  setSelectedTableIds,
  assignmentLoading,
  handleAssignTables,
  handleUnassignTables,
}) => {
  return (
    <section className="admin-reservations-panel">
      <div className="admin-reservations-panel-title">Asignar mesas</div>
      {selectedReservation ? (
        <>
          <div className="admin-reservations-info-section">
            <strong>Reserva:</strong>{" "}
            {selectedReservation.userName || "Cliente"} —{" "}
            {selectedReservation.date} {selectedReservation.time}
          </div>
          <div className="admin-reservations-info-section">
            <strong>Mesas asignadas:</strong>{" "}
            {activeAssignedTableIds.length > 0
              ? activeAssignedTableIds.join(", ")
              : "Sin mesas asignadas"}
          </div>
          <div className="admin-reservations-spaced-block">
            <div className="admin-reservations-subheader">
              Mesas disponibles
            </div>
            {availableTables.length === 0 ? (
              <div className="admin-reservations-empty">
                No hay mesas disponibles para esta fecha/hora.
              </div>
            ) : (
              <>
                {/* Sugerencia automática */}
                {formState.peopleCount && availableTables.length > 0 && (
                  <div className="admin-reservations-info-section admin-reservations-suggestion">
                    <strong>Sugerencia:</strong> {formState.peopleCount}{" "}
                    {formState.peopleCount === 1 ? "persona" : "personas"} —
                    {availableTables.filter(
                      (t) => t.capacity >= formState.peopleCount,
                    ).length > 0
                      ? ` Selecciona una mesa con capacidad ≥ ${formState.peopleCount} o fusiona varias.`
                      : " No hay mesa individual que cubra. Considera fusionar varias."}
                  </div>
                )}

                <div className="admin-reservations-table-grid">
                  {availableTables
                    .sort((a, b) => {
                      // Ordenar: primero las recomendadas (capacity >= peopleCount), luego otras
                      const aRecommended =
                        a.capacity >= formState.peopleCount;
                      const bRecommended =
                        b.capacity >= formState.peopleCount;
                      if (aRecommended !== bRecommended) {
                        return bRecommended ? 1 : -1;
                      }
                      return (
                        (a.number || a.tableNumber || 0) -
                        (b.number || b.tableNumber || 0)
                      );
                    })
                    .map((table) => {
                      const isRecommended =
                        table.capacity >= formState.peopleCount;
                      return (
                        <label
                          key={table.id}
                          className={`admin-reservations-table-card${selectedTableIds.includes(table.id) ? " selected" : ""}`}
                          style={{
                            borderColor: selectedTableIds.includes(table.id)
                              ? "#2563eb"
                              : isRecommended
                                ? "#10b981"
                                : "#d1d5db",
                            borderWidth: "2px",
                            backgroundColor: selectedTableIds.includes(
                              table.id,
                            )
                              ? "#eff6ff"
                              : isRecommended
                                ? "#ecfdf5"
                                : "white",
                            color: selectedTableIds.includes(table.id)
                              ? "#1e3a8a"
                              : "#111827",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            className="admin-reservations-table-checkbox"
                            checked={selectedTableIds.includes(table.id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelectedTableIds((prev) =>
                                checked
                                  ? [...new Set([...prev, table.id])]
                                  : prev.filter((id) => id !== table.id),
                              );
                            }}
                          />
                          <div>
                            <strong className={styles.tableCardTitle}>
                              Mesa{" "}
                              {table.number || table.tableNumber || table.id}
                              {isRecommended && (
                                <span
                                  className={styles.tableCardRecommendedBadge}
                                >
                                  Recomendada
                                </span>
                              )}
                            </strong>
                          </div>
                          <div className={styles.tableCardCapacity}>
                            Capacidad: <strong>{table.capacity || "-"}</strong>{" "}
                            pax
                          </div>
                          {isRecommended && (
                            <div className={styles.tableCardRecommendedNote}>
                              Cubre {formState.peopleCount}{" "}
                              {formState.peopleCount === 1
                                ? "persona"
                                : "personas"}
                            </div>
                          )}
                        </label>
                      );
                    })}
                </div>
              </>
            )}
          </div>
          <div className="admin-reservations-button-row">
            <button
              type="button"
              onClick={handleAssignTables}
              disabled={assignmentLoading || selectedTableIds.length === 0}
              className="admin-reservations-primary-button"
            >
              {assignmentLoading ? "Guardando..." : "Asignar mesas"}
            </button>
            <button
              type="button"
              onClick={handleUnassignTables}
              disabled={
                assignmentLoading || activeAssignedTableIds.length === 0
              }
              className="admin-reservations-secondary-button"
            >
              Desasignar todas
            </button>
          </div>
        </>
      ) : (
        <div className="admin-reservations-empty">
          Selecciona una reserva para administrar las mesas asignadas.
        </div>
      )}
    </section>
  );
};

export default TableAssignmentPanel;
