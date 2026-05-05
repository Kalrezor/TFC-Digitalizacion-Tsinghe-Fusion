// Vista: ReservationsView.js
// Componente para gestionar reservas (CRUD).
// Permite crear, ver, actualizar y cancelar reservas.

import React, { useState, useEffect } from 'react';
import useReservations from '../controllers/useReservations';
import useTables from '../controllers/useTables';
import '../styles/ChineseStyle.css';

const ReservationsView = ({ role, userId }) => {
  const { reservations, loading, error, createReservation, updateReservation, deleteReservation } = useReservations(role === 'comensal' ? userId : null);
  const { tables } = useTables();
  
  const [formData, setFormData] = useState({ date: '', time: '', numPeople: 1, tableId: '' });
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [availableTables, setAvailableTables] = useState([]);

  // Validar fecha (no permitir fechas pasadas)
  const isValidDate = (dateStr) => {
    const selectedDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  };

  // Obtener mesas disponibles para la fecha/hora seleccionadas
  useEffect(() => {
    if (formData.date && formData.time) {
      // Filtrar mesas que:
      // 1. Están activas
      // 2. Tienen capacidad >= numPeople
      // 3. No tienen reserva para esa fecha/hora
      const reserved = reservations
        .filter(r => r.date === formData.date && r.time === formData.time && r.status === 'activa')
        .map(r => r.tableId);

      const available = tables.filter(
        table => table.active && table.capacity >= formData.numPeople && !reserved.includes(table.id)
      );
      setAvailableTables(available);
    }
  }, [formData.date, formData.time, formData.numPeople, tables, reservations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    // Validaciones
    if (!formData.date || !formData.time) {
      setFormError('Debes seleccionar fecha y hora');
      return;
    }

    if (!isValidDate(formData.date)) {
      setFormError('No puedes reservar en una fecha pasada');
      return;
    }

    if (!formData.tableId) {
      setFormError('Debes seleccionar una mesa');
      return;
    }

    if (formData.numPeople < 1 || formData.numPeople > 10) {
      setFormError('El número de personas debe ser entre 1 y 10');
      return;
    }

    const data = {
      ...formData,
      userId,
      status: 'activa',
      createdAt: new Date().toISOString(),
    };

    let result;
    if (editingId) {
      result = await updateReservation(editingId, data);
      if (result.success) {
        setSuccessMessage('Reserva actualizada correctamente');
      }
      setEditingId(null);
    } else {
      result = await createReservation(data);
      if (result.success) {
        setSuccessMessage('Reserva creada correctamente');
      }
    }

    if (!result.success) {
      setFormError(result.error || 'Error al guardar la reserva');
    }

    setFormData({ date: '', time: '', numPeople: 1, tableId: '' });
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleEdit = (reservation) => {
    setFormData({
      date: reservation.date,
      time: reservation.time,
      numPeople: reservation.numPeople,
      tableId: reservation.tableId,
    });
    setEditingId(reservation.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      const result = await deleteReservation(id);
      if (result.success) {
        setSuccessMessage('Reserva cancelada correctamente');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };

  const getTableInfo = (tableId) => {
    return tables.find(t => t.id === tableId);
  };

  if (loading) {
    return (
      <div className="reservations-container">
        <div style={{ textAlign: 'center', padding: '40px', color: '#DC143C', fontSize: '18px' }}>
          Cargando reservas...
        </div>
      </div>
    );
  }

  return (
    <div className="reservations-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: '#DC143C', marginBottom: '30px', textAlign: 'center' }}>
        📅 Gestionar Reservas
      </h2>

      {/* Formulario de creación/edición */}
      {(role === 'admin' || role === 'comensal') && (
        <form onSubmit={handleSubmit} style={{
          background: '#f9f9f9',
          border: '2px solid #FFD700',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '30px',
        }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>
            {editingId ? '✏️ Editar Reserva' : '➕ Nueva Reserva'}
          </h3>

          {/* Mensajes */}
          {formError && (
            <div style={{
              background: '#ffcccc',
              border: '1px solid #cc0000',
              color: '#cc0000',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '15px',
            }}>
              {formError}
            </div>
          )}
          {successMessage && (
            <div style={{
              background: '#ccffcc',
              border: '1px solid #00cc00',
              color: '#00cc00',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '15px',
            }}>
              {successMessage}
            </div>
          )}

          {/* Grid de inputs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '15px',
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Fecha
              </label>
              <input
                type="date"
                value={formData.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Hora
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Personas
              </label>
              <input
                type="number"
                placeholder="Número de personas"
                value={formData.numPeople}
                onChange={(e) => setFormData({ ...formData, numPeople: parseInt(e.target.value) || 1 })}
                min="1"
                max="10"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Mesa
              </label>
              <select
                value={formData.tableId}
                onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  fontSize: '14px',
                }}
              >
                <option value="">
                  {availableTables.length > 0 ? 'Seleccionar mesa' : 'Ninguna mesa disponible'}
                </option>
                {availableTables.map(table => (
                  <option key={table.id} value={table.id}>
                    Mesa {table.tableNumber || table.id} ({table.capacity} personas)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              style={{
                background: '#DC143C',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              {editingId ? '✏️ Actualizar' : '➕ Crear Reserva'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ date: '', time: '', numPeople: 1, tableId: '' });
                  setFormError('');
                }}
                style={{
                  background: '#999',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }}
              >
                ❌ Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      {/* Lista de reservas */}
      <div>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>
          📋 Tus Reservas ({reservations.length})
        </h3>

        {reservations.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '30px',
            background: '#f5f5f5',
            borderRadius: '10px',
            color: '#999',
          }}>
            No tienes reservas aún. ¡Crea una ahora!
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {reservations.map(reservation => {
              const tableInfo = getTableInfo(reservation.tableId);
              const reservationDate = new Date(reservation.date);
              const isUpcoming = reservationDate >= new Date();
              const canEdit = isUpcoming && (role === 'admin' || reservation.userId === userId);
              const canDelete = role === 'admin' || reservation.userId === userId;

              return (
                <div
                  key={reservation.id}
                  style={{
                    background: '#fff',
                    border: `3px solid ${isUpcoming ? '#FFD700' : '#ddd'}`,
                    borderRadius: '10px',
                    padding: '15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                      📅 <strong>Fecha:</strong> {new Date(reservation.date).toLocaleDateString('es-ES')}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                      🕐 <strong>Hora:</strong> {reservation.time}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                      👥 <strong>Personas:</strong> {reservation.numPeople}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                      🪑 <strong>Mesa:</strong> {tableInfo ? `Mesa ${tableInfo.tableNumber || tableInfo.id}` : 'No disponible'} (capacidad: {tableInfo?.capacity || 'N/A'})
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#DC143C', fontWeight: 'bold' }}>
                      {reservation.status === 'activa' ? '✅ Activa' : '❌ Cancelada'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {canEdit && reservation.status === 'activa' && (
                      <button
                        onClick={() => handleEdit(reservation)}
                        style={{
                          background: '#FFD700',
                          color: '#333',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '12px',
                        }}
                      >
                        ✏️ Editar
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(reservation.id)}
                        style={{
                          background: '#DC143C',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '12px',
                        }}
                      >
                        🗑️ Cancelar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsView;