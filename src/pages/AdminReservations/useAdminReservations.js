import { useCallback, useEffect, useMemo, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useTablesByDateAndShift from "../../hooks/useTablesByDateAndShift";
import UserService from "../../services/UserService";
import TableService from "../../services/TableService";
import { toastSuccess, toastError } from "../../services/ToastService";
import ReservationTableService, {
  RESERVATION_SHIFTS,
  RESERVATION_STATUS,
} from "../../services/ReservationTableService";
import { normalizeReservation } from "../adminReservationsHelpers";

const today = new Date().toISOString().split("T")[0];
const defaultFormState = {
  date: today,
  time: "",
  peopleCount: 2,
  specialRequests: "",
  status: RESERVATION_STATUS.CONFIRMED,
};

const useAdminReservations = () => {
  const { userEmail: adminEmail } = useAuth();
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedEndDate, setSelectedEndDate] = useState(today);
  const [filterMode, setFilterMode] = useState("turno");
  const [selectedShift, setSelectedShift] = useState(
    RESERVATION_SHIFTS.COMIDA,
  );
  const [statusFilter, setStatusFilter] = useState("");
  const [tablesById, setTablesById] = useState({});
  const [allTables, setAllTables] = useState([]);
  const [searchClientTerm, setSearchClientTerm] = useState("");

  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [reservationError, setReservationError] = useState(null);

  const [users, setUsers] = useState([]);
  const [searchPhone, setSearchPhone] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");

  const [selectedReservation, setSelectedReservation] = useState(null);
  const [formState, setFormState] = useState(defaultFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTableIds, setSelectedTableIds] = useState([]);

  const { active: availableTablesByShift = [] } = useTablesByDateAndShift(
    selectedDate,
    selectedShift,
  );

  const statusOptions = useMemo(() => Object.values(RESERVATION_STATUS), []);

  const normalizeReservationWithTables = useCallback(
    (reservation) => {
      const normalized = normalizeReservation(reservation);
      const tableNumbers = normalized.tableIds
        .map((tableId) => {
          const mapped = tablesById[tableId];
          return mapped || tableId;
        })
        .filter(Boolean);
      return {
        ...normalized,
        tableNumbers,
      };
    },
    [tablesById],
  );

  const filteredUsers = useMemo(() => {
    const term = searchPhone.trim().toLowerCase();
    if (!term) return [];

    return users.filter((user) => {
      const phone = String(user.phone || "").toLowerCase();
      const name = String(user.name || user.displayName || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      return (
        phone.includes(term) || name.includes(term) || email.includes(term)
      );
    });
  }, [searchPhone, users]);

  const resetForm = useCallback(() => {
    setSelectedReservation(null);
    setFormState(defaultFormState);
    setSelectedUser(null);
    setManualName("");
    setManualPhone("");
    setSearchPhone("");
    setAvailableTables([]);
    setSelectedTableIds([]);
  }, []);

  const loadReservations = useCallback(async () => {
    setLoadingReservations(true);
    setReservationError(null);

    let result;
    if (filterMode === "turno") {
      result = await ReservationTableService.getReservationsByDateAndShift(
        selectedDate,
        selectedShift,
        true,
      );
    } else if (filterMode === "dia") {
      result = await ReservationTableService.getReservationsByDate(
        selectedDate,
        true,
      );
    } else if (filterMode === "rango") {
      const fromDate =
        selectedDate <= selectedEndDate ? selectedDate : selectedEndDate;
      const toDate =
        selectedDate <= selectedEndDate ? selectedEndDate : selectedDate;
      result = await ReservationTableService.getReservationsByDateRange(
        fromDate,
        toDate,
        true,
      );
    } else if (filterMode === "cliente") {
      // Obtener todas las reservas y filtrar por nombre/teléfono
      result = await ReservationTableService.getAllReservations(true);
    } else {
      result = { success: false, error: "Modo de filtro inválido" };
    }

    if (!result.success) {
      setReservationError(
        result.error || "No se pudieron cargar las reservas.",
      );
      setReservations([]);
      setLoadingReservations(false);
      return [];
    }

    let loaded = result.reservations || [];
    if (statusFilter) {
      loaded = loaded.filter(
        (reservation) => reservation.status === statusFilter,
      );
    }
    if (filterMode === "cliente" && searchClientTerm.trim()) {
      const term = searchClientTerm.trim().toLowerCase();
      loaded = loaded.filter((reservation) => {
        const userName = String(reservation.userName || "").toLowerCase();
        const userPhone = String(reservation.userPhone || "").toLowerCase();
        return userName.includes(term) || userPhone.includes(term);
      });
    }

    const sorted = [...loaded].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (a.time !== b.time) return a.time.localeCompare(b.time);
      return String(a.userName || "").localeCompare(String(b.userName || ""));
    });

    setReservations(sorted);
    setLoadingReservations(false);
    return sorted;
  }, [
    filterMode,
    selectedDate,
    selectedShift,
    selectedEndDate,
    statusFilter,
    searchClientTerm,
  ]);

  useEffect(() => {
    loadReservations();
    resetForm();
    if (filterMode !== "cliente") {
      setSearchClientTerm("");
    }
  }, [loadReservations, resetForm, filterMode]);

  useEffect(() => {
    const loadUsers = async () => {
      const result = await UserService.getAllUsers();
      if (result.success) {
        setUsers(result.users || []);
      }
    };
    const loadTables = async () => {
      const result = await TableService.getAllTables();
      if (result.success) {
        const map = {};
        (result.tables || []).forEach((table) => {
          map[table.id] = table.tableNumber || table.number || table.id;
        });
        setTablesById(map);
        setAllTables(result.tables || []);
      } else {
        console.error("Error cargando mesas:", result.error);
      }
    };
    loadUsers();
    loadTables();
  }, []);

  const selectReservation = useCallback((reservation) => {
    const normalized = normalizeReservation(reservation);
    setSelectedReservation(normalized);
    setFormState({
      date: normalized.date,
      time: normalized.time,
      peopleCount: normalized.peopleCount,
      specialRequests: normalized.specialRequests || "",
      status: normalized.status || RESERVATION_STATUS.CONFIRMED,
    });

    if (normalized.userId || normalized.userEmail) {
      setSelectedUser({
        id: normalized.userId || null,
        email: normalized.userEmail || "",
        name: normalized.userName || "",
        phone: normalized.userPhone || "",
      });
      setManualName("");
      setManualPhone("");
    } else {
      setSelectedUser(null);
      setManualName(normalized.userName || "");
      setManualPhone(normalized.userPhone || "");
    }

    setSelectedTableIds(normalized.tableIds || []);
    setSearchPhone("");
  }, []);

  useEffect(() => {
    if (!selectedReservation) {
      setAvailableTables([]);
      setSelectedTableIds([]);
      return;
    }

    const fetchTables = async () => {
      const result =
        await ReservationTableService.getAvailableTablesForReservation(
          formState.date || selectedReservation.date,
          formState.time || selectedReservation.time,
          formState.peopleCount || selectedReservation.peopleCount,
          selectedReservation.id,
        );
      if (result.success) {
        setAvailableTables(result.tables || []);
      } else {
        setAvailableTables([]);
      }
    };

    if (formState.date && formState.time && formState.peopleCount > 0) {
      fetchTables();
    }
  }, [
    selectedReservation,
    formState.date,
    formState.time,
    formState.peopleCount,
  ]);

  const totalPeopleInReservations = useMemo(() => {
    return reservations.reduce((acc, reservation) => {
      return (
        acc + Number(reservation.peopleCount || reservation.numberOfPeople || 0)
      );
    }, 0);
  }, [reservations]);

  const availableSeats = useMemo(() => {
    return availableTablesByShift.reduce((acc, table) => {
      return acc + Number(table.capacity || 0);
    }, 0);
  }, [availableTablesByShift]);

  const aforo = useMemo(() => {
    return allTables.reduce((acc, table) => {
      return (
        acc + (table.available === false ? 0 : Number(table.capacity || 0))
      );
    }, 0);
  }, [allTables]);

  const refreshSelectedReservation = useCallback(
    async (currentReservations) => {
      if (!selectedReservation?.id) {
        return;
      }
      const list = currentReservations || reservations;
      const refreshed = list.find(
        (reservation) => reservation.id === selectedReservation.id,
      );
      if (refreshed) {
        selectReservation(refreshed);
      }
    },
    [selectedReservation, reservations, selectReservation],
  );

  const handleSaveReservation = async (event) => {
    event.preventDefault();
    setFormLoading(true);

    const name = selectedUser ? selectedUser.name || "" : manualName.trim();
    const phone = selectedUser ? selectedUser.phone || "" : manualPhone.trim();

    if (!name || !phone) {
      toastError("El nombre y el teléfono son obligatorios.");
      setFormLoading(false);
      return;
    }
    if (!formState.date || !formState.time) {
      toastError("Fecha y hora son obligatorias.");
      setFormLoading(false);
      return;
    }

    try {
      if (selectedReservation) {
        const payload = {
          userId: selectedUser?.id || null,
          userEmail: selectedUser?.email || "",
          userName: name,
          userPhone: phone,
          date: formState.date,
          reservationDate: formState.date,
          time: formState.time,
          reservationTime: formState.time,
          peopleCount: Number(formState.peopleCount),
          numberOfPeople: Number(formState.peopleCount),
          specialRequests: formState.specialRequests || "",
          status: formState.status,
        };

        const result = await ReservationTableService.updateReservation(
          selectedReservation.id,
          payload,
        );
        if (result.success) {
          toastSuccess("Reserva actualizada correctamente.");
          const updatedReservations = await loadReservations();
          await refreshSelectedReservation(updatedReservations);
        } else {
          toastError(result.error || "Error actualizando la reserva.");
        }
      } else {
        const result = await ReservationTableService.createReservationFromAdmin(
          {
            user: selectedUser,
            manualName: selectedUser ? undefined : name,
            manualPhone: selectedUser ? undefined : phone,
            date: formState.date,
            time: formState.time,
            peopleCount: Number(formState.peopleCount),
            specialRequests: formState.specialRequests || "",
            adminEmail: adminEmail || "admin@localhost",
          },
        );

        if (result.success) {
          toastSuccess("Reserva creada correctamente.");
          resetForm();
          await loadReservations();
        } else {
          toastError(result.error || "Error creando la reserva.");
        }
      }
    } catch (error) {
      console.error("Error guardando reserva:", error);
      toastError(error.message || "Error inesperado.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleReservationStatusChange = async (reservationId, nextStatus) => {
    const result = await ReservationTableService.updateReservation(
      reservationId,
      {
        status: nextStatus,
      },
    );
    if (result.success) {
      toastSuccess("Estado de reserva actualizado.");
      const updatedReservations = await loadReservations();
      await refreshSelectedReservation(updatedReservations);
    } else {
      toastError(result.error || "No se pudo actualizar el estado.");
    }
  };

  const handleAssignTables = async () => {
    if (!selectedReservation) {
      return;
    }
    setAssignmentLoading(true);

    const result = await ReservationTableService.assignTablesToReservation(
      selectedReservation.id,
      selectedTableIds,
    );

    if (result.success) {
      toastSuccess("Mesas asignadas correctamente.");
      const updatedReservations = await loadReservations();
      await refreshSelectedReservation(updatedReservations);
    } else {
      toastError(result.error || "No se pudieron asignar mesas.");
    }
    setAssignmentLoading(false);
  };

  const handleUnassignTables = async () => {
    if (!selectedReservation) {
      return;
    }
    setAssignmentLoading(true);

    const result = await ReservationTableService.unassignTablesFromReservation(
      selectedReservation.id,
    );

    if (result.success) {
      toastSuccess("Mesas desasignadas correctamente.");
      const updatedReservations = await loadReservations();
      await refreshSelectedReservation(updatedReservations);
    } else {
      toastError(result.error || "No se pudieron desasignar mesas.");
    }
    setAssignmentLoading(false);
  };

  const activeAssignedTableIds = useMemo(() => {
    if (!selectedReservation) return [];
    return Array.isArray(selectedReservation.tableIds)
      ? selectedReservation.tableIds
      : selectedReservation.tableId
        ? [selectedReservation.tableId]
        : [];
  }, [selectedReservation]);

  return {
    // Filtros
    selectedDate,
    setSelectedDate,
    selectedEndDate,
    setSelectedEndDate,
    filterMode,
    setFilterMode,
    selectedShift,
    setSelectedShift,
    statusFilter,
    setStatusFilter,
    searchClientTerm,
    setSearchClientTerm,
    statusOptions,
    // Tabla de reservas
    reservations,
    loadingReservations,
    reservationError,
    totalPeopleInReservations,
    availableSeats,
    aforo,
    normalizeReservationWithTables,
    selectReservation,
    handleReservationStatusChange,
    // Formulario
    selectedReservation,
    formState,
    setFormState,
    formLoading,
    searchPhone,
    setSearchPhone,
    filteredUsers,
    selectedUser,
    setSelectedUser,
    manualName,
    setManualName,
    manualPhone,
    setManualPhone,
    handleSaveReservation,
    resetForm,
    // Asignar mesas
    availableTables,
    selectedTableIds,
    setSelectedTableIds,
    assignmentLoading,
    activeAssignedTableIds,
    handleAssignTables,
    handleUnassignTables,
  };
};

export default useAdminReservations;
