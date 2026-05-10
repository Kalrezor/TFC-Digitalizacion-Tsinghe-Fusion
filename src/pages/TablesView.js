// Vista: TablesView.js
// Componente para gestionar mesas (CRUD).

import React, { useState } from 'react';
import useTables from '../hooks/useTables';

const TablesView = ({ role }) => {
  const { tables, loading, error, createTable, updateTable, deleteTable, loadAvailableTables } = useTables();
  const [formData, setFormData] = useState({ number: 1, capacity: 2, available: true });
  const [editingId, setEditingId] = useState(null);
  const [showAvailable, setShowAvailable] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateTable(editingId, formData);
      setEditingId(null);
    } else {
      await createTable(formData);
    }
    setFormData({ number: 1, capacity: 2, available: true });
  };

  const handleEdit = (table) => {
    setFormData({ number: table.number, capacity: table.capacity, available: table.available });
    setEditingId(table.id);
  };

  const toggleAvailable = () => {
    setShowAvailable(!showAvailable);
    if (!showAvailable) {
      loadAvailableTables();
    } else {
      // Recargar todas
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Mesas</h2>
      <button onClick={toggleAvailable}>
        {showAvailable ? 'Mostrar todas' : 'Mostrar disponibles'}
      </button>
      {role === 'admin' && (
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Número de mesa"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) })}
            min="1"
            required
          />
          <input
            type="number"
            placeholder="Capacidad"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
            min="1"
            required
          />
          <label>
            <input
              type="checkbox"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
            />
            Disponible
          </label>
          <button type="submit">{editingId ? 'Actualizar' : 'Crear'}</button>
          {editingId && <button onClick={() => setEditingId(null)}>Cancelar</button>}
        </form>
      )}
      <ul>
        {tables.map(table => (
          <li key={table.id}>
            Mesa {table.number} - Capacidad: {table.capacity} - {table.available ? 'Disponible' : 'Ocupada'}
            {role === 'admin' && (
              <>
                <button onClick={() => handleEdit(table)}>Editar</button>
                <button onClick={() => deleteTable(table.id)}>Eliminar</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TablesView;