// Vista: UsersView.js
// Componente para gestionar usuarios (CRUD) - Solo para admin.

import React, { useState } from 'react';
import useUsers from '../hooks/useUsers';

const UsersView = () => {
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsers();
  const [formData, setFormData] = useState({ email: '', role: 'comensal', name: '' });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateUser(editingId, formData);
      setEditingId(null);
    } else {
      await createUser(formData);
    }
    setFormData({ email: '', role: 'comensal', name: '' });
  };

  const handleEdit = (user) => {
    setFormData({ email: user.email, role: user.role, name: user.name || '' });
    setEditingId(user.id);
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Gestión de Usuarios</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Nombre"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value="comensal">Comensal</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">{editingId ? 'Actualizar' : 'Crear'}</button>
        {editingId && <button onClick={() => setEditingId(null)}>Cancelar</button>}
      </form>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} ({user.email}) - {user.role}
            <button onClick={() => handleEdit(user)}>Editar</button>
            <button onClick={() => deleteUser(user.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersView;