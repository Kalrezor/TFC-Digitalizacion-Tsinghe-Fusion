import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import tableService from "../models/TableService";
import { db } from "../firebaseConfig";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";

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
  const [pinError, setPinError] = useState(null);
  const [pinSuccess, setPinSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(userRole === "admin"); // Iniciar como true si es admin
  const [loading, setLoading] = useState(false);

  // 0. INICIALIZAR MESAS (primera carga)
  useEffect(() => {
    const initializeMesas = async () => {
      const result = await tableService.initializeTables();
      console.log("Resultado inicialización:", result);
    };
    initializeMesas();
  }, []);

  // 1. CARGA DE MESAS
  useEffect(() => {
    const unsubscribe = tableService.subscribeToAllTables((result) => {
      if (result.success) {
        const fullTables = [];
        for (let i = 1; i <= 20; i++) {
          const found = result.tables.find((t) => t.tableNumber === i);
          fullTables.push(
            found || {
              id: null,
              tableNumber: i,
              capacity: 4,
              active: true,
              available: true,
            },
          );
        }
        setDisplay(fullTables);
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
    const unsubscribe = onSnapshot(doc(db, "users", userId), (doc) => {
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
    }, (error) => {
      console.error("Error cargando PIN en tiempo real:", error);
    });

    return () => unsubscribe();
  }, [userId, userRole]);

  // 3. LÓGICA DE SELECCIÓN (FUSIÓN)
  const handleTableClick = (table) => {
    // Validar que sea admin
    if (!isAdmin) {
      alert("⚠️ Solo administradores pueden fusionar mesas.");
      return;
    }

    // Si no hay una reserva pendiente de asignar, el clic no hace nada
    if (!pendingRes || !table.active) return;

    // Si la mesa ya está ocupada por OTRA reserva, no deja seleccionarla
    if (table.reservationId && table.reservationId !== pendingRes.resId) {
      return alert("Esta mesa ya está ocupada.");
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
      return alert("⚠️ Solo administradores pueden fusionar mesas.");
    }

    if (selectedMultiple.length === 0) {
      return alert("Selecciona al menos una mesa.");
    }

    try {
      setLoading(true);
      
      const tableIds = selectedMultiple
        .filter(t => t.id)
        .map(t => t.id);

      // Usar el nuevo método mergeTables de TableService
      const result = await tableService.mergeTables(
        pendingRes.resId,
        tableIds,
        Number(pendingRes.numberOfPeople) || 2
      );

      if (result.success) {
        alert(`✅ ${result.message}`);
        setSelectedMultiple([]);
        navigate("/reservations");
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error en fusión:", error);
      alert("Error al fusionar mesas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // LIBERAR/DESVINCULAR MESAS
  const handleReleaseTable = async (table) => {
    if (!isAdmin) {
      alert("⚠️ Solo administradores pueden desvincular mesas.");
      return;
    }

    if (!table.reservationId) {
      alert("Esta mesa no está fusionada.");
      return;
    }

    // Solicitar PIN
    const confirmPass = prompt("⚠️ Mesa FUSIONADA. Ingresa PIN de 4 dígitos:");
    if (!confirmPass) return;

    // Validar PIN
    if (confirmPass.trim() !== dbPin) {
      return alert("❌ PIN incorrecto.");
    }

    try {
      setLoading(true);
      
      // Obtener todas las mesas de esta reserva
      const tablesResult = await tableService.getTablesByReservation(table.reservationId);
      
      if (!tablesResult.success) {
        return alert("Error obteniendo mesas fusionadas");
      }

      const tableIdsToUnmerge = tablesResult.tables
        .filter(t => t.id)
        .map(t => t.id);

      // Usar el nuevo método unmergeTables
      const result = await tableService.unmergeTables(tableIdsToUnmerge);

      if (result.success) {
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error desvinculando:", error);
      alert("Error al desvincular mesas: " + error.message);
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
      return;
    }

    // Validar nuevo PIN (4 dígitos)
    if (!newPin || !/^\d{4}$/.test(newPin)) {
      setPinError("El nuevo PIN debe ser 4 dígitos numéricos");
      return;
    }

    try {
      setLoading(true);
      
      // Actualizar en Firestore (con validación en reglas)
      await updateDoc(doc(db, "users", userId), { 
        adminPin: newPin 
      });

      setPinSuccess(true);
      setPinError(null);
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
    } finally {
      setLoading(false);
    }
  };

  // --- ESTILOS ---
  const tableGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
    gap: "15px",
  };
  const tableCard = {
    padding: "12px",
    borderRadius: "12px",
    color: "white",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    minHeight: "140px",
    cursor: "pointer",
    position: "relative",
  };
  const badgeFusion = {
    fontSize: "10px",
    background: "rgba(0,0,0,0.2)",
    borderRadius: "4px",
    padding: "3px 6px",
    marginTop: "5px",
    fontWeight: "bold",
  };
  const fusionBanner = {
    background: "#fffde7",
    padding: "15px",
    borderRadius: "12px",
    border: "2px solid #fbc02d",
    marginBottom: "20px",
    textAlign: "center",
  };
  const pinSettingsStyle = {
    background: "#f9f9f9",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    marginBottom: "20px",
  };
  const inputStyle = {
    padding: "8px",
    margin: "8px 0",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "100%",
    boxSizing: "border-box",
  };
  const buttonStyle = {
    background: "#2e7d32",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px",
  };

  // Verificar permisos
  if (!isAdmin) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>⚠️ Acceso Denegado</h2>
        <p>Solo administradores pueden acceder a esta vista.</p>
        <button 
          onClick={() => navigate("/")}
          style={{ ...buttonStyle, background: "#1976d2" }}
        >
          Volver a Inicio
        </button>
      </div>
    );
  }

  if (display.length === 0) return <div>Cargando...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>⛩️ Plano de Mesas</h2>
        <button onClick={() => setShowPinSettings(!showPinSettings)}>
          ⚙️ Ajustes PIN
        </button>
      </div>

      {/* Banner de Fusión: Solo aparece si vienes de Reservas */}
      {pendingRes && (
        <div style={fusionBanner}>
          <h3>📍 Asignando a: {pendingRes.userName}</h3>
          <p>Selecciona las mesas en el plano y pulsa Vincular</p>
          <button
            onClick={handleConfirmFusion}
            style={{
              background: "#2e7d32",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            VINCULAR ({selectedMultiple.length})
          </button>
          <button
            onClick={() => navigate("/reservations")}
            style={{
              background: "#757575",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              marginLeft: "10px",
              cursor: "pointer",
            }}
          >
            CANCELAR
          </button>
        </div>
      )}

      {showPinSettings && (
        <div style={pinSettingsStyle}>
          <h3>🔐 Cambiar PIN de Seguridad</h3>
          
          {pinError && (
            <div style={{ background: "#ffebee", padding: "10px", borderRadius: "4px", marginBottom: "10px", color: "#c62828" }}>
              {pinError}
            </div>
          )}
          
          {pinSuccess && (
            <div style={{ background: "#e8f5e9", padding: "10px", borderRadius: "4px", marginBottom: "10px", color: "#2e7d32" }}>
              ✅ PIN actualizado correctamente
            </div>
          )}

          <input
            type="password"
            placeholder="PIN Actual (4 dígitos)"
            value={currentPinInput}
            onChange={(e) => setCurrentPinInput(e.target.value.slice(0, 4))}
            maxLength="4"
            style={inputStyle}
          />
          
          <input
            type="password"
            placeholder="Nuevo PIN (4 dígitos)"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.slice(0, 4))}
            maxLength="4"
            style={inputStyle}
          />

          <div style={{ marginTop: "15px" }}>
            <button
              onClick={handleChangePin}
              disabled={loading}
              style={{ ...buttonStyle, opacity: loading ? 0.6 : 1 }}
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
              style={{ ...buttonStyle, background: "#757575" }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={tableGrid}>
        {display.map((table) => {
          const isSelected = selectedMultiple.some(
            (t) => t.tableNumber === table.tableNumber,
          );
          const isOccupied = !table.available || table.reservationId;
          
          // Colores:
          // Rojo (#f44336) = No activa/Inactiva
          // Verde (#4CAF50) = Disponible y activa
          // Amarillo (#FFD700) = Ocupada pero sin reserva
          // Dorado (#DAA520) = Fusionada/Con reserva
          let bgColor = "#4CAF50"; // Verde por defecto
          if (!table.active) {
            bgColor = "#f44336"; // Rojo - no activa
          } else if (table.reservationId) {
            bgColor = "#DAA520"; // Dorado - fusionada/con reserva
          } else if (isOccupied) {
            bgColor = "#FFD700"; // Amarillo - ocupada
          }

          return (
            <div
              key={table.tableNumber}
              onClick={() => handleTableClick(table)}
              style={{
                ...tableCard,
                background: bgColor,
                border: isSelected ? "4px solid #333" : "1px solid #ddd",
                color: (bgColor === "#FFD700" || bgColor === "#DAA520") ? "black" : "white",
              }}
            >
              <div style={{ flex: 1 }}>
                <strong>Mesa {table.tableNumber}</strong>
                {table.reservationId && (
                  <div style={badgeFusion}>🔗 FUSIONADA</div>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "5px",
                  marginTop: "10px",
                }}
              >
                {table.reservationId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReleaseTable(table);
                    }}
                    style={{
                      padding: "4px 8px",
                      fontSize: "10px",
                      background: "#ff5722",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer"
                    }}
                  >
                    🔓 Desvincular
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
