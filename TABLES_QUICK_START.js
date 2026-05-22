/**
 * GUÍA RÁPIDA: Arquitectura de Mesas - Lógica Interna
 * 
 * Este documento proporciona una guía rápida de cómo usar la arquitectura
 * de mesas sin tocar UI. Solo lógica interna: servicios y hooks.
 * 
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * IMPORT RÁPIDO:
 * ──────────────
 * 
 * import TableService from "../services/TableService";
 * import TableAvailabilityService from "../services/TableAvailabilityService";
 * import useTables from "../hooks/useTables";
 * import useTablesByDateAndShift from "../hooks/useTablesByDateAndShift";
 * import useTableAvailability from "../hooks/useTableAvailability";
 * 
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * CASO 1: ADMIN CREA UNA NUEVA MESA
 * ─────────────────────────────────
 * 
 * const handleCreateTable = async () => {
 *   const result = await TableService.createTableWithValidation({
 *     number: 5,
 *     capacity: 4,
 *     available: true
 *   });
 *   
 *   if (result.success) {
 *     console.log("Mesa creada con ID:", result.id);
 *   } else {
 *     console.error("Error:", result.error);
 *   }
 * };
 * 
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * CASO 2: ADMIN ELIMINA UNA MESA (CON VALIDACIÓN)
 * ────────────────────────────────────────────────
 * 
 * const handleDeleteTable = async (tableId) => {
 *   // Primero verificar si se puede eliminar
 *   const canDelete = await TableService.canDeleteTable(tableId);
 *   
 *   if (!canDelete.canDelete) {
 *     console.error(canDelete.reason);
 *     return;
 *   }
 *   
 *   // Proceder a eliminar
 *   const result = await TableService.deleteTableSafe(tableId);
 *   
 *   if (result.success) {
 *     console.log("Mesa eliminada");
 *   }
 * };
 * 
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * CASO 3: DASHBOARD DE MESAS POR FECHA Y TURNO
 * ────────────────────────────────────────────
 * 
 * function AdminTablesDashboard() {
 *   const [date, setDate] = useState("2026-05-12");
 *   const [shift, setShift] = useState("comida");
 *   
 *   const { active, reserved, inactive, loading, refetch } =
 *     useTablesByDateAndShift(date, shift);
 *   
 *   return (
 *     <>
 *       <h3>Mesas Libres: {active.length}</h3>
 *       <h3>Mesas Ocupadas: {reserved.length}</h3>
 *       <h3>Mesas Inactivas: {inactive.length}</h3>
 *       
 *       <button onClick={refetch}>Actualizar</button>
 *     </>
 *   );
 * }
 * 
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * CASO 4: VERIFICAR DISPONIBILIDAD DE UNA MESA
 * ─────────────────────────────────────────────
 * 
 * function TableAvailabilityChecker() {
 *   const { isAvailable, valid, status, loading, error } =
 *     useTableAvailability("mesa-5", "2026-05-12", "13:30", 4);
 *   
 *   return (
 *     <>
 *       {loading && <p>Cargando...</p>}
 *       {!loading && (
 *         <>
 *           <p>Estado: {status}</p>
 *           <p>¿Disponible? {isAvailable ? "Sí" : "No"}</p>
 *           <p>¿Válida para asignar? {valid ? "Sí" : "No"}</p>
 *           {error && <p className="error">{error}</p>}
 *         </>
 *       )}
 *     </>
 *   );
 * }
 * 
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * CASO 5: OBTENER MESAS DISPONIBLES PARA CAPACIDAD
 * ──────────────────────────────────────────────────
 * 
 * async function findTablesForReservation(date, time, peopleCount) {
 *   const result = await TableAvailabilityService.getAvailableTablesForCapacity(
 *     date,
 *     time,
 *     peopleCount
 *   );
 *   
 *   if (result.success) {
 *     if (result.singleTableOptions.length > 0) {
 *       // Mesa individual disponible
 *       console.log("Mesas individuales:", result.singleTableOptions);
 *     } else if (result.needsMerge) {
 *       // Necesita fusionar
 *       console.log("Se necesita fusionar", result.tables.length, "mesas");
 *     } else {
 *       console.log("No hay mesas disponibles");
 *     }
 *   }
 * }
 * 
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * CASO 6: OBTENER ESTADÍSTICAS DE MESAS
 * ──────────────────────────────────────
 * 
 * async function showTableStats() {
 *   const result = await TableService.getTableStats();
 *   
 *   if (result.success) {
 *     const { total, active, inactive, activePercentage } = result.stats;
 *     
 *     console.log(`
 *       Total de mesas: ${total}
 *       Activas: ${active} (${activePercentage}%)
 *       Inactivas: ${inactive}
 *     `);
 *   }
 * }
 * 
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * CASO 7: BUSCAR MESA POR NÚMERO
 * ───────────────────────────────
 * 
 * async function findTableByNumber(number) {
 *   const result = await TableService.getTableByNumber(number);
 *   
 *   if (result.table) {
 *     console.log("Mesa encontrada:", result.table);
 *   } else {
 *     console.log("Mesa no encontrada");
 *   }
 * }
 * 
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * CASO 8: OBTENER MESAS POR CAPACIDAD MÍNIMA
 * ──────────────────────────────────────────
 * 
 * async function findLargeTables() {
 *   const result = await TableService.getTablesByCapacity(6);
 *   
 *   if (result.success) {
 *     console.log("Mesas con capacidad >= 6:", result.tables);
 *   }
 * }
 * 
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * CASO 9: CARGAR TODAS LAS MESAS EN TIEMPO REAL (HOOK)
 * ────────────────────────────────────────────────────
 * 
 * function AllTablesOverview() {
 *   const { tables, loading, error } = useTables();
 *   
 *   return (
 *     <>
 *       {loading && <p>Cargando mesas...</p>}
 *       {error && <p className="error">{error}</p>}
 *       {!loading && (
 *         <>
 *           <h2>Total de mesas activas: {tables.length}</h2>
 *           {tables.map(table => (
 *             <div key={table.id}>
 *               Mesa {table.number} (Capacidad: {table.capacity})
 *             </div>
 *           ))}
 *         </>
 *       )}
 *     </>
 *   );
 * }
 * 
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * CASO 10: FLUJO COMPLETO - CREAR RESERVA CON ASIGNACIÓN DE MESAS
 * ───────────────────────────────────────────────────────────────
 * 
 * import ReservationTableService from "../services/ReservationTableService";
 * import TableService from "../services/TableService";
 * 
 * async function createReservationWithTableAssignment(user, date, time, peopleCount) {
 *   try {
 *     // 1. Verificar disponibilidad de mesas
 *     const availabilityResult = 
 *       await TableAvailabilityService.getAvailableTablesForCapacity(
 *         date, time, peopleCount
 *       );
 *     
 *     if (!availabilityResult.success) {
 *       throw new Error("Error verificando disponibilidad");
 *     }
 *     
 *     if (availabilityResult.tables.length === 0) {
 *       throw new Error("No hay mesas disponibles");
 *     }
 *     
 *     // 2. Crear la reserva
 *     const reservationResult = 
 *       await ReservationTableService.createReservationFromComensal(
 *         user, date, time, peopleCount, "Especiales"
 *       );
 *     
 *     if (!reservationResult.success) {
 *       throw new Error("Error creando reserva");
 *     }
 *     
 *     const reservationId = reservationResult.reservationId;
 *     
 *     // 3. Asignar mesas según disponibilidad
 *     let tableIds = [];
 *     
 *     if (availabilityResult.singleTableOptions.length > 0) {
 *       // Usar primera mesa individual disponible
 *       tableIds = [availabilityResult.singleTableOptions[0].id];
 *     } else if (availabilityResult.needsMerge) {
 *       // Fusionar mesas
 *       tableIds = availabilityResult.tables
 *         .slice(0, Math.ceil(peopleCount / 4))
 *         .map(t => t.id);
 *       
 *       await TableService.mergeTables(
 *         reservationId, tableIds, peopleCount
 *       );
 *     }
 *     
 *     // 4. Asignar mesas a la reserva
 *     const assignmentResult = 
 *       await ReservationTableService.assignTablesToReservation(
 *         reservationId, tableIds
 *       );
 *     
 *     if (assignmentResult.success) {
 *       console.log("Reserva creada exitosamente con mesas asignadas");
 *       return { success: true, reservationId };
 *     } else {
 *       throw new Error("Error asignando mesas");
 *     }
 *     
 *   } catch (error) {
 *     console.error("Error en flujo de reserva:", error);
 *     return { success: false, error: error.message };
 *   }
 * }
 * 
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * FLUJO TÍPICO DE INTEGRACIÓN CON UI (EJEMPLO)
 * ──────────────────────────────────────────────
 * 
 * Component ReserveForm → [useTableAvailability + TableAvailabilityService]
 *                         ↓
 *                      ReservationTableService.createReservationFromComensal()
 *                         ↓
 *                      TableService.mergeTables() (si es necesario)
 *                         ↓
 *                      ReservationTableService.assignTablesToReservation()
 *                         ↓
 *                      ✓ Reserva creada
 * 
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * VALIDACIONES AUTOMÁTICAS
 * ────────────────────────
 * 
 * ✓ createTableWithValidation()
 *   - Valida número único
 *   - Valida capacidad > 0
 * 
 * ✓ deleteTableSafe()
 *   - Solo permite eliminar si NO tiene reservas futuras
 * 
 * ✓ validateTableForReservation()
 *   - Mesa existe
 *   - Mesa está activa
 *   - Tiene capacidad
 *   - No hay conflicto horario
 * 
 * ✓ getAvailableTablesForCapacity()
 *   - Calcula ocupación real
 *   - Determina si necesita fusión
 *   - Retorna solo mesas válidas
 * 
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * CONSTANTES IMPORTANTES
 * ──────────────────────
 * 
 * Margen de tiempo entre reservas: 120 minutos (2 horas)
 * Mínimo de comensales para fusión: 5 personas
 * Máxima capacidad por mesa: 10 personas
 * 
 * ════════════════════════════════════════════════════════════════════════════════
 */

export const QUICK_START = {
  documentCreated: true,
  version: "1.0",
};
