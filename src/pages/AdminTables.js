import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import tableService from "../services/TableService";
import { toastSuccess, toastError, toastInput } from "../services/ToastService";
import { db } from "../firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import styles from "../styles/modules/AdminTables.module.css";

const AdminTables = ({ userId, userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pendingRes = location.state?.pendingAssignment || null;

  const [display, setDisplay] = useState([]);
  const [selectedMultiple, setSelectedMultiple] = useState([]);
  const [showPinSettings, setShowPinSettings] = useState(false);
  const [dbPin, setDbPin] = useState("1234");
  const [currentPinInput, setCurrentPinInput] = useState("");
  const [newPin, setNewPin] = useState("");
  const [, setPinError] = useState(null);
  const [, setPinSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(userRole === "admin"); // Iniciar como true si es admin
  const [loading, setLoading] = useState(false);
  const [tablesLoading, setTablesLoading] = useState(true);

  // 1. CARGA DE MESAS REALES DESDE FIRESTORE
  useEffect(() => {
    const unsubscribe = tableService.subscribeToAllTables((result) => {
      setTablesLoading(false);
      if (result.success) {
        const sortedTables = [...result.tables].sort(
          (a, b) => (a.tableNumber || 0) - (b.tableNumber || 0),
        );
        setDisplay(sortedTables);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. VERIFICAR SI ES ADMIN Y CARGAR PIN EN TIEMPO REAL
  useEffect(() => {
    if (!userId) return;

    // La ruta AdminRoute ya verificó que es admin, así que confiamos en userRole
    if (userRole === "admin") {
      setIsAdmin(true);
    }

    // Listener en tiempo real para el PIN (SINCRONIZACIÓN)
    const unsubscribe = onSnapshot(
      doc(db, "users", userId),
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          // Asegurar que si viene de la ruta protegida AdminRoute, es admin
          const isAdminFromDb = userData.role === "admin";
          if (isAdminFromDb) {
            setIsAdmin(true);
          }
          const pin = String(userData.adminPin || "1234").trim();
          setDbPin(pin);
        }
      },
      (error) => {
        console.error("Error cargando PIN en tiempo real:", error);
      },
    );

    return () => unsubscribe();
  }, [userId, userRole]);

  // 3. LÓGICA DE SELECCIÓN (FUSIÓN)
  const handleTableClick = (table) => {
    // Validar que sea admin
    if (!isAdmin) {
      toastError("Solo administradores pueden fusionar mesas.");
      return;
    }

    // Si no hay una reserva pendiente de asignar, el clic no hace nada
    if (!pendingRes || !table.active) return;

    // Si la mesa ya está ocupada por OTRA reserva, no deja seleccionarla
    if (table.reservationId && table.reservationId !== pendingRes.resId) {
      toastError("Esta mesa ya está ocupada.");
      return;
    }

    // Toggle de selección
    if (selectedMultiple.find((t) => t.tableNumber === table.tableNumber)) {
      setSelectedMultiple(
        selectedMultiple.filter((t) => t.tableNumber !== table.tableNumber),
      );
    } else {
      setSelectedMultiple([...selectedMultiple, table]);
    }
  };

  // 4. CONFIRMAR FUSIÓN (USAR NUEVO MÉTODO)
  const handleConfirmFusion = async () => {
    if (!isAdmin) {
      toastError("Solo administradores pueden fusionar mesas.");
      return;
    }

    if (selectedMultiple.length === 0) {
      toastError("Selecciona al menos una mesa.");
      return;
    }

    try {
      setLoading(true);

      const tableIds = selectedMultiple.filter((t) => t.id).map((t) => t.id);

      // Usar el nuevo método mergeTables de TableService
      const result = await tableService.mergeTables(
        pendingRes.resId,
        tableIds,
        Number(pendingRes.numberOfPeople) || 2,
      );

      if (result.success) {
        toastSuccess(result.message);
        setSelectedMultiple([]);
        navigate("/reservations");
      } else {
        toastError(result.error || "Error al fusionar mesas");
      }
    } catch (error) {
      console.error("Error en fusión:", error);
      toastError("Error al fusionar mesas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // LIBERAR/DESVINCULAR MESAS
  const handleReleaseTable = async (table) => {
    if (!isAdmin) {
      toastError("Solo administradores pueden desvincular mesas.");
      return;
    }

    if (!table.reservationId) {
      toastError("Esta mesa no está fusionada.");
      return;
    }

    // Solicitar PIN
    const confirmPass = await toastInput(
      "Mesa fusionada. Ingresa PIN de 4 dígitos:",
      {
        inputType: "password",
        maxLength: 4,
        placeholder: "PIN",
      },
    );
    if (!confirmPass) return;

    // Validar PIN
    if (confirmPass.trim() !== dbPin) {
      toastError("PIN incorrecto.");
      return;
    }

    try {
      setLoading(true);

      // Obtener todas las mesas de esta reserva
      const tablesResult = await tableService.getTablesByReservation(
        table.reservationId,
      );

      if (!tablesResult.success) {
        toastError("Error obteniendo mesas fusionadas");
        return;
      }

      const tableIdsToUnmerge = tablesResult.tables
        .filter((t) => t.id)
        .map((t) => t.id);

      // Usar el nuevo método unmergeTables
      const result = await tableService.unmergeTables(tableIdsToUnmerge);

      if (result.success) {
        toastSuccess(result.message);
      } else {
        toastError(result.error || "Error al desvincular mesas");
      }
    } catch (error) {
      console.error("Error desvinculando:", error);
      toastError("Error al desvincular mesas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseBusyTable = async (table) => {
    if (!isAdmin) {
      toastError("Solo administradores pueden liberar mesas.");
      return;
    }

    const confirmPass = await toastInput(
      "Mesa ocupada. Ingresa PIN de 4 dígitos:",
      {
        inputType: "password",
        maxLength: 4,
        placeholder: "PIN",
      },
    );
    if (!confirmPass) return;

    if (confirmPass.trim() !== dbPin) {
      toastError("PIN incorrecto.");
      return;
    }

    try {
      setLoading(true);
      const result = await tableService.updateTable(table.id, {
        active: true,
        available: true,
        reservationId: null,
        mergedWith: [],
        fusionCode: null,
        lastModified: new Date().toISOString(),
      });

      if (!result.success) {
        toastError(result.error || "Error al liberar mesa");
      }
    } catch (error) {
      console.error("Error liberando mesa:", error);
      toastError("Error al liberar mesa: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTableStatus = async (table, status) => {
    if (!isAdmin) {
      toastError("Solo administradores pueden cambiar el estado de mesas.");
      return;
    }

    if (!table.id) {
      toastError("Esta mesa no tiene ID en Firestore.");
      return;
    }

    if (table.reservationId || (!table.available && table.active !== false)) {
      toastError(
        "Esta mesa está ocupada o fusionada. Libérala con PIN antes de modificarla.",
      );
      return;
    }

    const updates =
      status === "disabled"
        ? { active: false, available: false }
        : { active: true, available: true };

    try {
      setLoading(true);
      const result = await tableService.updateTable(table.id, {
        ...updates,
        lastModified: new Date().toISOString(),
      });

      if (!result.success) {
        toastError(result.error || "Error al cambiar estado de mesa");
      }
    } catch (error) {
      console.error("Error cambiando estado de mesa:", error);
      toastError("Error al cambiar estado de mesa: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // CAMBIAR PIN (SINCRONIZAR CON FIRESTORE)
  const handleChangePin = async () => {
    setPinError(null);
    setPinSuccess(false);

    // Validar PIN actual
    if (!currentPinInput || currentPinInput.trim() !== dbPin) {
      setPinError("PIN actual incorrecto");
      toastError("PIN actual incorrecto");
      return;
    }

    // Validar nuevo PIN (4 dígitos)
    if (!newPin || !/^\d{4}$/.test(newPin)) {
      setPinError("El nuevo PIN debe ser 4 dígitos numéricos");
      toastError("El nuevo PIN debe ser 4 dígitos numéricos");
      return;
    }

    try {
      setLoading(true);

      // Actualizar en Firestore (con validación en reglas)
      await updateDoc(doc(db, "users", userId), {
        adminPin: newPin,
      });

      setPinSuccess(true);
      setPinError(null);
      toastSuccess("PIN actualizado correctamente");
      setCurrentPinInput("");
      setNewPin("");

      // El listener en tiempo real actualizará dbPin automáticamente
      setTimeout(() => {
        setShowPinSettings(false);
        setPinSuccess(false);
      }, 1500);
    } catch (error) {
      console.error("Error cambiando PIN:", error);
      setPinError("Error al cambiar PIN: " + error.message);
      toastError("Error al cambiar PIN: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Verificar permisos
  if (!isAdmin) {
    return (
      <div className={styles.centeredMessage}>
        <h2>⚠️ Acceso Denegado</h2>
        <p>Solo administradores pueden acceder a esta vista.</p>
        <button
          onClick={() => navigate("/")}
          className="admin-tables-button admin-tables-button-blue"
        >
          Volver a Inicio
        </button>
      </div>
    );
  }

  if (tablesLoading) return <div>Cargando...</div>;

  if (display.length === 0) {
    return (
      <div className={styles.centeredMessage}>
        No hay mesas registradas en Firestore.
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>⛩️ Plano de Mesas</h2>
        <button onClick={() => setShowPinSettings(!showPinSettings)}>
          ⚙️ Ajustes PIN
        </button>
      </div>

      {/* Banner de Fusión: Solo aparece si vienes de Reservas */}
      {pendingRes && (
        <div className="admin-tables-fusion-banner">
          <h3>📍 Asignando a: {pendingRes.userName}</h3>
          <p>Selecciona las mesas en el plano y pulsa Vincular</p>
          <button
            onClick={handleConfirmFusion}
            className={styles.linkButton}
          >
            VINCULAR ({selectedMultiple.length})
          </button>
          <button
            onClick={() => navigate("/reservations")}
            className={styles.cancelButton}
          >
            CANCELAR
          </button>
        </div>
      )}

      {showPinSettings && (
        <div className="admin-tables-pin-settings">
          <h3>🔐 Cambiar PIN de Seguridad</h3>

          <input
            type="password"
            placeholder="PIN Actual (4 dígitos)"
            value={currentPinInput}
            onChange={(e) => setCurrentPinInput(e.target.value.slice(0, 4))}
            maxLength="4"
            className="admin-tables-input"
          />

          <input
            type="password"
            placeholder="Nuevo PIN (4 dígitos)"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.slice(0, 4))}
            maxLength="4"
            className="admin-tables-input"
          />

          <div className={styles.pinActions}>
            <button
              onClick={handleChangePin}
              disabled={loading}
              className="admin-tables-button"
            >
              {loading ? "Guardando..." : "💾 Guardar PIN"}
            </button>

            <button
              onClick={() => {
                setShowPinSettings(false);
                setCurrentPinInput("");
                setNewPin("");
                setPinError(null);
              }}
              className="admin-tables-button admin-tables-button-muted"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="admin-tables-grid">
        {display.map((table) => {
          const tableLabel = table.tableNumber || table.number || table.id;
          const isSelected = selectedMultiple.some(
            (t) => t.tableNumber === table.tableNumber,
          );
          const isDisabled = table.active === false;
          const isReserved = !!table.reservationId;
          const isBusy = !isDisabled && (!table.available || isReserved);
          const canChangeStatus = !isBusy && !isReserved && !!table.id;
          const fusionCode = table.fusionCode;

          let bgColor = "#4CAF50";
          if (isDisabled) {
            bgColor = "#f44336";
          } else if (isBusy) {
            bgColor = "#DAA520";
          }

          return (
            <div
              key={table.id || tableLabel}
              onClick={() => handleTableClick(table)}
              className="admin-tables-card"
              style={{
                background: bgColor,
                border: isSelected ? "4px solid #333" : "1px solid #ddd",
                color: bgColor === "#DAA520" ? "black" : "white",
              }}
            >
              <div className={styles.cardBody}>
                <strong>Mesa {tableLabel}</strong>
                {fusionCode && (
                  <div className="admin-tables-fusion-code">{fusionCode}</div>
                )}
                {isReserved && (
                  <div className="admin-tables-status-badge">
                    {fusionCode ? "FUSIONADA" : "RESERVADA"}
                  </div>
                )}
                {isBusy && !isReserved && (
                  <div className="admin-tables-status-badge">OCUPADA</div>
                )}
                {isDisabled && (
                  <div className="admin-tables-status-badge">DESACTIVADA</div>
                )}
              </div>
              <div className={styles.cardActions}>
                {!isBusy && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChangeTableStatus(table, "available");
                      }}
                      disabled={loading || !canChangeStatus || !isDisabled}
                      className={styles.statusButtonBase}
                      style={{
                        background: "#2e7d32",
                        cursor:
                          loading || !canChangeStatus || !isDisabled
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          loading || !canChangeStatus || !isDisabled ? 0.55 : 1,
                      }}
                    >
                      Disponible
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChangeTableStatus(table, "disabled");
                      }}
                      disabled={loading || !canChangeStatus || isDisabled}
                      className={styles.statusButtonBase}
                      style={{
                        background: "#c62828",
                        cursor:
                          loading || !canChangeStatus || isDisabled
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          loading || !canChangeStatus || isDisabled ? 0.55 : 1,
                      }}
                    >
                      Desactivar
                    </button>
                  </>
                )}

                {isReserved && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReleaseTable(table);
                    }}
                    className={styles.unlinkButton}
                  >
                    Desvincular
                  </button>
                )}

                {isBusy && !isReserved && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReleaseBusyTable(table);
                    }}
                    disabled={loading}
                    className={styles.statusButtonBase}
                    style={{
                      background: "#ff5722",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    Liberar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminTables;
