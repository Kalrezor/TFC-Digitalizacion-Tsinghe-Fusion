import React from "react";
import useAdminReservations from "./AdminReservations/useAdminReservations";
import ReservationFilters from "./AdminReservations/components/ReservationFilters";
import ReservationsTable from "./AdminReservations/components/ReservationsTable";
import AdminReservationEditor from "./AdminReservations/components/AdminReservationEditor";
import TableAssignmentPanel from "./AdminReservations/components/TableAssignmentPanel";

const AdminReservationsView = () => {
  const {
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
  } = useAdminReservations();

  return (
    <div className="admin-reservations">
      <header className="admin-reservations-header">
        <div>
          <h1 className="admin-reservations-title">
            Administración de reservas
          </h1>
          <p className="admin-reservations-subtitle">
            Gestiona reservas, actualiza estados y asigna mesas desde una vista
            unificada.
          </p>
        </div>
      </header>

      <div className="admin-reservations-grid">
        <ReservationFilters
          filterMode={filterMode}
          setFilterMode={setFilterMode}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedEndDate={selectedEndDate}
          setSelectedEndDate={setSelectedEndDate}
          selectedShift={selectedShift}
          setSelectedShift={setSelectedShift}
          searchClientTerm={searchClientTerm}
          setSearchClientTerm={setSearchClientTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          statusOptions={statusOptions}
        />

        <ReservationsTable
          filterMode={filterMode}
          totalPeopleInReservations={totalPeopleInReservations}
          availableSeats={availableSeats}
          aforo={aforo}
          loadingReservations={loadingReservations}
          reservationError={reservationError}
          reservations={reservations}
          statusOptions={statusOptions}
          normalizeReservationWithTables={normalizeReservationWithTables}
          handleReservationStatusChange={handleReservationStatusChange}
          selectReservation={selectReservation}
        />

        <AdminReservationEditor
          selectedReservation={selectedReservation}
          handleSaveReservation={handleSaveReservation}
          searchPhone={searchPhone}
          setSearchPhone={setSearchPhone}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          manualName={manualName}
          setManualName={setManualName}
          manualPhone={manualPhone}
          setManualPhone={setManualPhone}
          filteredUsers={filteredUsers}
          formState={formState}
          setFormState={setFormState}
          statusOptions={statusOptions}
          formLoading={formLoading}
          resetForm={resetForm}
        />

        <TableAssignmentPanel
          selectedReservation={selectedReservation}
          activeAssignedTableIds={activeAssignedTableIds}
          availableTables={availableTables}
          formState={formState}
          selectedTableIds={selectedTableIds}
          setSelectedTableIds={setSelectedTableIds}
          assignmentLoading={assignmentLoading}
          handleAssignTables={handleAssignTables}
          handleUnassignTables={handleUnassignTables}
        />
      </div>
    </div>
  );
};

export default AdminReservationsView;
