// Componente: AdminReservationForm.js
// Formulario para que el admin cree reservas en nombre de otros usuarios
// Con búsqueda en tiempo real y opción de crear usuario

import React, { useState, useEffect } from "react";
import ReservationService from "../models/ReservationService";
import UserService from "../models/UserService";
import "../styles/ChineseStyle.css";

const AdminReservationForm = ({ onReservationCreated }) => {
  const [formData, setFormData] = useState({
    userEmail: "",
    reservationDate: "",
    reservationTime: "",
    numberOfPeople: 2,
    specialRequests: "",
  });
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Cargar usuarios al montar
  useEffect(() => {
    loadUsers();
  }, []);

  // Filtrar usuarios por búsqueda en tiempo real
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term),
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Cargar mesas disponibles cuando cambia fecha/hora
  useEffect(() => {
    if (formData.reservationDate && formData.reservationTime) {
      loadAvailableTables();
    }
  }, [formData.reservationDate, formData.reservationTime]);

  // Cargar lista de usuarios
  const loadUsers = async () => {
    try {
      const result = await UserService.getAllUsers();
      if (result.success) {
        setUsers(result.users);
      }
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    }
  };

  // Cargar mesas disponibles
  const loadAvailableTables = async () => {
    try {
      const result = await ReservationService.getAvailableTables(
        formData.reservationDate,
        formData.reservationTime,
      );

      if (result.success) {
        const filtered = result.tables.filter(
          (table) => table.capacity >= formData.numberOfPeople,
        );
        setAvailableTables(filtered);
        if (filtered.length > 0) {
          setSelectedTable(filtered[0].id);
        }
      }
    } catch (err) {
      console.error("Error cargando mesas:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numberOfPeople" ? parseInt(value) : value,
    }));
    setError(null);
  };

  const handleUserChange = (e) => {
    const userId = e.target.value;
    const user = users.find((u) => u.id === userId);
    setSelectedUser(user);
    setFormData((prev) => ({
      ...prev,
      userEmail: user?.email || "",
    }));
    setShowNewUserForm(false);
    setSearchTerm("");
  };

  // Crear nuevo usuario
  const handleCreateNewUser = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newUserData.name.trim()) {
      setError("Por favor ingresa el nombre del usuario");
      return;
    }

    if (!newUserData.email.trim()) {
      setError("Por favor ingresa el email del usuario");
      return;
    }

    // Validar que el email no exista ya
    const emailExists = users.some((u) => u.email === newUserData.email);
    if (emailExists) {
      setError("Este email ya está registrado");
      return;
    }

    setLoading(true);

    try {
      // Llamar a la función para crear usuario en Auth y enviar email
      const response = await fetch(
        "https://us-central1-digitalizacion-tsinge-fusion.cloudfunctions.net/sendVerificationEmail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: newUserData.email.trim(),
            name: newUserData.name.trim(),
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        // Esperar un poco para que el trigger cree el documento en Firestore
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Buscar el usuario creado
        const updatedUsers = await UserService.getAllUsers();
        if (updatedUsers.success) {
          setUsers(updatedUsers.users);
          const newUser = updatedUsers.users.find(u => u.email === newUserData.email.trim());
          if (newUser) {
            setSelectedUser(newUser);
            setFormData((prev) => ({
              ...prev,
              userEmail: newUser.email,
            }));
          }
        }

        setNewUserData({ name: "", email: "", phone: "" });
        setShowNewUserForm(false);
        setSearchTerm("");
        setError("Usuario creado. Se envió email de verificación.");
      } else {
        setError(result.error || "Error al crear usuario");
      }
    } catch (err) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  // Enviar email de verificación
  const sendVerificationEmail = async (email, name) => {
    try {
      const response = await fetch(
        "https://us-central1-digitalizacion-tsinge-fusion.cloudfunctions.net/sendVerificationEmail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            name: name,
          }),
        },
      );

      if (!response.ok) {
        console.error(
          "Error enviando email de verificación:",
          response.statusText,
        );
      }
    } catch (error) {
      console.error("Error enviando email:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validaciones
    if (!selectedUser) {
      setError("Por favor selecciona un usuario");
      return;
    }

    if (!formData.reservationDate) {
      setError("Por favor selecciona una fecha");
      return;
    }

    if (!formData.reservationTime) {
      setError("Por favor selecciona una hora");
      return;
    }

    if (!selectedTable) {
      setError("No hay mesas disponibles para esta fecha y hora");
      return;
    }

    if (formData.numberOfPeople < 1 || formData.numberOfPeople > 10) {
      setError("El número de personas debe estar entre 1 y 10");
      return;
    }

    setLoading(true);

    try {
      const reservationData = {
        userId: selectedUser.id,
        userName: selectedUser.name,
        userEmail: selectedUser.email,
        tableId: selectedTable,
        reservationDate: formData.reservationDate,
        reservationTime: formData.reservationTime,
        numberOfPeople: formData.numberOfPeople,
        specialRequests: formData.specialRequests,
        status: "confirmada", // Reservas creadas por admin se confirman automáticamente
      };

      const result =
        await ReservationService.createReservation(reservationData);

      if (result.success) {
        setSuccess(true);
        setFormData({
          userEmail: "",
          reservationDate: "",
          reservationTime: "",
          numberOfPeople: 2,
          specialRequests: "",
        });
        setSelectedUser(null);
        setSelectedTable(null);
        setAvailableTables([]);

        if (onReservationCreated) {
          onReservationCreated(result.reservationId);
        }

        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError(result.error || "Error al crear la reserva");
      }
    } catch (err) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split("T")[0];

  return (
    <div className="reservation-form-container">
      <div className="reservation-form-card">
        <h2>📅 Crear Reserva para Usuario</h2>

        {error && <div className="error-message error-box">❌ {error}</div>}
        {success && (
          <div className="success-message success-box">
            ✅ ¡Reserva creada exitosamente!
          </div>
        )}

        <form onSubmit={handleSubmit} className="reservation-form">
          {/* Seleccionar Usuario - Con búsqueda en tiempo real */}
          <div className="form-group">
            <label htmlFor="userSearch">Seleccionar Usuario</label>
            {!selectedUser ? (
              <>
                <input
                  id="userSearch"
                  type="text"
                  placeholder="Busca por nombre o correo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />

                {filteredUsers.length > 0 && (
                  <div className="user-list">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="user-item"
                        onClick={() => {
                          setSelectedUser(user);
                          setFormData((prev) => ({
                            ...prev,
                            userEmail: user.email,
                          }));
                          setSearchTerm("");
                        }}
                      >
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                        {/* Mostrar badge si emailVerified es false o undefined (usuario no verificado) */}
                        {!user.emailVerified && (
                          <span className="badge-pending">
                            Pendiente verificación
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {searchTerm.trim() !== "" && filteredUsers.length === 0 && (
                  <div className="no-results">
                    <p>No se encontraron usuarios</p>
                    <button
                      type="button"
                      onClick={() => setShowNewUserForm(true)}
                      className="btn-secondary btn-small"
                    >
                      ➕ Añadir nuevo usuario
                    </button>
                  </div>
                )}

                {searchTerm.trim() === "" && users.length === 0 && (
                  <div className="no-results">
                    <p>No hay usuarios registrados</p>
                    <button
                      type="button"
                      onClick={() => setShowNewUserForm(true)}
                      className="btn-secondary btn-small"
                    >
                      ➕ Crear nuevo usuario
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="selected-user">
                  <div>
                    <strong>{selectedUser.name}</strong>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {selectedUser.email}
                    </div>
                    {!selectedUser.emailVerified && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#FF6B6B",
                          marginTop: "4px",
                        }}
                      >
                        ⚠️ Pendiente de verificación de correo
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(null);
                      setSearchTerm("");
                    }}
                    className="btn-secondary btn-small"
                  >
                    Cambiar
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Formulario para crear nuevo usuario */}
          {showNewUserForm && !selectedUser && (
            <div className="new-user-form">
              <h3>Crear nuevo usuario</h3>
              <div className="form-group">
                <label htmlFor="newUserName">Nombre completo</label>
                <input
                  id="newUserName"
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={newUserData.name}
                  onChange={(e) =>
                    setNewUserData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newUserEmail">Email</label>
                <input
                  id="newUserEmail"
                  type="email"
                  placeholder="Ej: juan@email.com"
                  value={newUserData.email}
                  onChange={(e) =>
                    setNewUserData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newUserPhone">Teléfono (opcional)</label>
                <input
                  id="newUserPhone"
                  type="tel"
                  placeholder="Ej: +34 123 456 789"
                  value={newUserData.phone}
                  onChange={(e) =>
                    setNewUserData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={handleCreateNewUser}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? "Creando..." : "Crear usuario"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewUserForm(false);
                    setNewUserData({ name: "", email: "", phone: "" });
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Fecha */}
          <div className="form-group">
            <label htmlFor="reservationDate">Fecha</label>
            <input
              id="reservationDate"
              type="date"
              name="reservationDate"
              value={formData.reservationDate}
              onChange={handleInputChange}
              min={today}
              max={maxDateString}
              required
            />
          </div>

          {/* Hora */}
          <div className="form-group">
            <label htmlFor="reservationTime">Hora</label>
            <select
              id="reservationTime"
              name="reservationTime"
              value={formData.reservationTime}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecciona una hora</option>
              <option value="12:00">12:00 - Mediodía</option>
              <option value="13:00">13:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
              <option value="18:00">18:00 - Tarde</option>
              <option value="19:00">19:00</option>
              <option value="20:00">20:00</option>
              <option value="21:00">21:00</option>
              <option value="22:00">22:00</option>
              <option value="23:00">23:00</option>
            </select>
          </div>

          {/* Número de personas */}
          <div className="form-group">
            <label htmlFor="numberOfPeople">Número de personas</label>
            <input
              id="numberOfPeople"
              type="number"
              name="numberOfPeople"
              value={formData.numberOfPeople}
              onChange={handleInputChange}
              min="1"
              max="10"
              required
            />
          </div>

          {/* Mesas disponibles */}
          {availableTables.length > 0 && (
            <div className="form-group">
              <label htmlFor="selectedTable">Mesa disponible</label>
              <select
                id="selectedTable"
                value={selectedTable || ""}
                onChange={(e) => setSelectedTable(e.target.value)}
                required
              >
                {availableTables.map((table) => (
                  <option key={table.id} value={table.id}>
                    Mesa {table.tableNumber} - Capacidad: {table.capacity}{" "}
                    personas
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Solicitudes especiales */}
          <div className="form-group">
            <label htmlFor="specialRequests">
              Solicitudes especiales (opcional)
            </label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              placeholder="Ej: Cumpleaños, aniversario, alergias, etc."
              value={formData.specialRequests}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={loading || availableTables.length === 0}
            className="btn-primary btn-full-width"
          >
            {loading ? "Creando reserva..." : "Crear Reserva"}
          </button>
        </form>

        {availableTables.length === 0 &&
          formData.reservationDate &&
          formData.reservationTime && (
            <div className="info-message">
              ℹ️ No hay mesas disponibles para la fecha y hora seleccionadas
            </div>
          )}
      </div>
    </div>
  );
};

export default AdminReservationForm;
