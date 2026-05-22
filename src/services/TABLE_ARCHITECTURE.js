/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ARQUITECTURA DE LÓGICA INTERNA: GESTIÓN DE MESAS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * RESPONSABILIDAD: Lógica de mesas, disponibilidad, validaciones e integraciones.
 * NO CONTIENE: UI, componentes React, pantallas ni lógica de presentación.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * 1. MODELO DE DATOS (Firestore: colección "tables")
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Document: mesa-1, mesa-2, mesa-3...
 * 
 * Campos:
 * ┌─────────────────┬──────────┬─────────────────────────────────────────────┐
 * │ Campo           │ Tipo     │ Descripción                                 │
 * ├─────────────────┼──────────┼─────────────────────────────────────────────┤
 * │ number          │ number   │ Número visible en el restaurante (1, 2, 3...) │
 * │ capacity        │ number   │ Capacidad en personas (2-10)                │
 * │ available       │ boolean  │ Indica si la mesa está ACTIVA o no (NO es  │
 * │                 │          │ disponibilidad real, solo si se usa)       │
 * │ createdAt       │ string   │ Timestamp de creación (ISO 8601)            │
 * │ updatedAt       │ string   │ Timestamp última actualización (ISO 8601)   │
 * │ reservationId   │ string   │ (opcional) ID de reserva si está fusionada │
 * │ fusionCode      │ string   │ (opcional) Código de fusión (F1, F2, etc)  │
 * │ mergedWith      │ array    │ (opcional) IDs de mesas fusionadas con esta│
 * │ lastModified    │ string   │ (opcional) Timestamp de última modificación │
 * └─────────────────┴──────────┴─────────────────────────────────────────────┘
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * 2. SERVICIOS DISPONIBLES
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * A. TableService.js
 * ───────────────────
 * CRUD BÁSICO Y VALIDACIONES:
 * 
 * • getAllTables()
 *   → Retorna todas las mesas
 * 
 * • getAvailableTables()
 *   → Retorna mesas con available === true
 * 
 * • getTableById(id)
 *   → Obtiene una mesa por ID
 * 
 * • getTableByNumber(tableNumber)
 *   → Obtiene una mesa por su número visible
 * 
 * • createTable(tableData)
 *   → Crea mesa SIN validación (uso bajo nivel)
 * 
 * • createTableWithValidation(tableData)
 *   → Crea mesa CON validaciones (recomendado para admin)
 *   → Valida: número único, capacidad > 0
 * 
 * • updateTable(id, tableData)
 *   → Actualiza campos de la mesa
 * 
 * • deleteTable(id)
 *   → Elimina sin validaciones (USAR CON CUIDADO)
 * 
 * • deleteTableSafe(id)
 *   → Elimina SOLO si no tiene reservas futuras (RECOMENDADO)
 * 
 * • canDeleteTable(id)
 *   → Valida si una mesa puede ser eliminada
 * 
 * BÚSQUEDA Y FILTRADO:
 * 
 * • getTablesByCapacity(minCapacity)
 *   → Retorna mesas que pueden alojar X personas
 * 
 * • getTableStats()
 *   → Retorna estadísticas (total, activas, inactivas)
 * 
 * FUSIÓN (Restaurante con espacio para fusionar mesas):
 * 
 * • mergeTables(reservationId, tableIds, guestCount)
 *   → Fusiona múltiples mesas para reserva > 4 comensales
 * 
 * • unmergeTables(tableIds)
 *   → Desfusiona mesas después de reserva
 * 
 * • getTablesByReservation(reservationId)
 *   → Obtiene mesas asociadas a una reserva
 * 
 * TIEMPO REAL:
 * 
 * • subscribeToAllTables(callback)
 *   → Escucha cambios en tiempo real
 * 
 * ───────────────────────────────────────────────────────────────────────────────
 * 
 * B. TableAvailabilityService.js
 * ────────────────────────────────
 * DISPONIBILIDAD REAL DE MESAS (independiente del campo "available"):
 * 
 * CRÍTICA: Disponibilidad se calcula considerando:
 * - Fecha
 * - Hora
 * - Turno (comida/cena)
 * - Margen de 2 horas entre reservas
 * - Reservas activas (status != "cancelada")
 * - Capacidad de la mesa
 * 
 * • getTableStatusByDateAndShift(date, shift)
 *   Retorna: { active: [], reserved: [], inactive: [] }
 *   → active: mesas libres para ese turno
 *   → reserved: mesas ocupadas por reservas
 *   → inactive: mesas con available === false
 * 
 * • getTablesAvailabilityForTime(date, time)
 *   Retorna: { tables: [{ id, number, capacity, status: "libre|ocupada|no-disponible" }] }
 *   → Estatus de cada mesa para una hora específica
 * 
 * • getAvailableTablesForCapacity(date, time, peopleCount)
 *   Retorna: { tables: [], singleTableOptions: [], needsMerge: boolean }
 *   → tables: mesas libres
 *   → singleTableOptions: mesas que caben X personas sin fusionar
 *   → needsMerge: si se necesita fusionar varias mesas
 * 
 * • validateTableForReservation(tableId, date, time, peopleCount)
 *   Retorna: { valid: boolean, error?: string }
 *   → Valida si mesa puede asignarse a reserva
 *   → Verifica: existencia, estatus activo, capacidad, disponibilidad
 * 
 * • getTableOccupancyStatus(tableId, date, time)
 *   Retorna: { status: "libre|ocupada|no-disponible|no-encontrada" }
 *   → Ocupación de una mesa para fecha/hora específica
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * 3. HOOKS REACT
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * A. useTables()
 * ───────────────
 * Carga todas las mesas activas en tiempo real
 * 
 * Uso:
 * ┌───────────────────────────────────────────┐
 * │ const { tables, loading, error } =        │
 * │   useTables();                            │
 * │                                           │
 * │ tables:  [{ id, number, capacity, ... }] │
 * │ loading: boolean                          │
 * │ error:   string | null                    │
 * └───────────────────────────────────────────┘
 * 
 * ───────────────────────────────────────────────────────────────────────────────
 * 
 * B. useTablesByDateAndShift(date, shift)
 * ────────────────────────────────────────
 * Obtiene estado de mesas categorizadas para fecha y turno
 * 
 * Uso:
 * ┌──────────────────────────────────────────────┐
 * │ const { active, reserved, inactive,          │
 * │   loading, error, refetch } =                │
 * │   useTablesByDateAndShift("2026-05-12", "comida"); │
 * │                                              │
 * │ active:   [{ id, number, status: "libre" }] │
 * │ reserved: [{ id, number, status: "ocupada" }] │
 * │ inactive: [{ id, number, status: "no-disponible" }] │
 * │ loading:  boolean                            │
 * │ error:    string | null                      │
 * │ refetch:  función para recargar              │
 * └──────────────────────────────────────────────┘
 * 
 * ───────────────────────────────────────────────────────────────────────────────
 * 
 * C. useTableAvailability(tableId, date, time, peopleCount)
 * ──────────────────────────────────────────────────────────
 * Verifica disponibilidad de una mesa específica
 * 
 * Uso:
 * ┌──────────────────────────────────────────────────┐
 * │ const { isAvailable, valid, status,              │
 * │   loading, error, refetch } =                    │
 * │   useTableAvailability("mesa-1", "2026-05-12",  │
 * │   "13:00", 4);                                   │
 * │                                                  │
 * │ isAvailable: boolean (mesa libre para esa hora)  │
 * │ valid:       boolean (válida para asignar)       │
 * │ status:      "libre|ocupada|no-disponible"       │
 * │ loading:     boolean                             │
 * │ error:       string | null                       │
 * │ refetch:     función para recargar               │
 * └──────────────────────────────────────────────────┘
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * 4. FLUJO TÍPICO: CREAR RESERVA CON ASIGNACIÓN DE MESAS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 1. Usuario selecciona fecha, hora, número de personas
 * 
 * 2. Backend consulta disponibilidad:
 *    await TableAvailabilityService.getAvailableTablesForCapacity(
 *      date, time, peopleCount
 *    )
 * 
 * 3. Mostrar al usuario:
 *    - Si hay mesa individual que cabe → opción "1 mesa"
 *    - Si se necesita fusionar → opción "Fusionar X mesas"
 * 
 * 4. Usuario confirma reserva
 * 
 * 5. Backend crea reserva y asigna mesas:
 *    const reservationResult =
 *      await ReservationTableService.createReservationFromComensal(...)
 * 
 *    if (needsMerge) {
 *      await TableService.mergeTables(reservationId, tableIds, peopleCount)
 *    } else {
 *      await ReservationTableService.assignTablesToReservation(
 *        reservationId, [tableId]
 *      )
 *    }
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * 5. REGLAS DE SEGURIDAD FIRESTORE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * tables:
 * - Lectura: todos pueden leer
 * - Escritura: SOLO admin (uid en allowedAdmins)
 * - Eliminación: SOLO admin
 * 
 * reservations:
 * - Lectura: usuarios pueden ver sus propias + admin ve todas
 * - Escritura: usuarios crean propias + admin crea todas
 * - Actualización: admin puede actualizar cualquiera
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * 6. CONSTANTES Y CONFIGURACIÓN
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * MARGEN DE TIEMPO ENTRE RESERVAS: 120 minutos (2 horas)
 * → Definido en ReservationTableService.hasTimeConflict(time1, time2, marginMinutes = 120)
 * 
 * TURNOS DISPONIBLES:
 * - COMIDA: 12:00 - 16:30
 * - CENA:   20:00 - 23:30
 * → Definidos en ReservationTableService.RESERVATION_TIMES
 * 
 * CAPACIDAD MÁXIMA POR MESA: 10 personas
 * → Validado en componentes UI (no en servicio, es validación de negocio)
 * 
 * MÍNIMO DE COMENSALES PARA FUSIÓN: > 4 personas
 * → Definido en TableService.mergeTables(...)
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * 7. EJEMPLO DE CÓDIGO: IMPLEMENTAR EN UN COMPONENTE ADMIN
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * import useTables from "../hooks/useTables";
 * import useTablesByDateAndShift from "../hooks/useTablesByDateAndShift";
 * import TableService from "../services/TableService";
 * 
 * function AdminTablesView() {
 *   const { tables, loading } = useTables();
 *   const { active, reserved, inactive } = useTablesByDateAndShift(
 *     "2026-05-12",
 *     "comida"
 *   );
 * 
 *   const handleCreateTable = async () => {
 *     const result = await TableService.createTableWithValidation({
 *       number: 5,
 *       capacity: 4,
 *       available: true
 *     });
 *     if (result.success) console.log("Mesa creada:", result.id);
 *   };
 * 
 *   const handleDeleteTable = async (tableId) => {
 *     const result = await TableService.deleteTableSafe(tableId);
 *     if (result.success) console.log("Mesa eliminada");
 *   };
 * 
 *   return (
 *     // ...render con datos de mesas...
 *   );
 * }
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * 8. NOTAS IMPORTANTES
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * ✓ El campo "available" de tabla NO determina disponibilidad real
 *   → Solo indica si la mesa está ACTIVA (en operación) o no
 *   → Disponibilidad real se calcula por reservas + margen de 2 horas
 * 
 * ✓ TableAvailabilityService NO modifica datos
 *   → Es READ-ONLY, solo consulta y calcula disponibilidad
 * 
 * ✓ Toda asignación de mesas pasa por validaciones
 *   → isTableAvailable(...) antes de asignar
 * 
 * ✓ Los datos en tiempo real se sincronizan automáticamente
 *   → onSnapshot en TableService.subscribeToAllTables()
 * 
 * ✓ Fusión de mesas solo es para reservas > 4 comensales
 *   → Lógica en TableService.mergeTables(...)
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const ARCHITECTURE_NOTES = {
  version: "1.0",
  description: "Arquitectura de lógica interna de mesas",
  services: {
    TableService: "CRUD + validaciones + fusión",
    TableAvailabilityService: "Disponibilidad real + estado de mesas",
    ReservationTableService: "Ya existente, integración automática",
  },
  hooks: {
    useTables: "Todas las mesas activas en tiempo real",
    useTablesByDateAndShift: "Estado de mesas por fecha/turno",
    useTableAvailability: "Disponibilidad de mesa específica",
  },
  constraints: {
    marginMinutes: 120,
    minGuestsForMerge: 5,
    maxCapacityPerTable: 10,
  },
};
