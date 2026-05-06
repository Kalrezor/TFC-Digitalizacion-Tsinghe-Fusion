// Controlador: useUsers.js
// Hook para manejar CRUD de usuarios.

import { useState, useEffect } from "react";
import UserService from "../models/UserService";

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar todos los usuarios
  const loadUsers = async () => {
    setLoading(true);
    const result = await UserService.getAllUsers();
    setLoading(false);
    if (result.success) {
      setUsers(result.users);
    } else {
      setError(result.error);
    }
  };

  // Crear usuario
  const createUser = async (userData) => {
    const result = await UserService.createUser(userData);
    if (result.success) {
      loadUsers(); // Recargar lista
    } else {
      setError(result.error);
    }
    return result;
  };

  // Actualizar usuario
  const updateUser = async (id, userData) => {
    const result = await UserService.updateUser(id, userData);
    if (result.success) {
      loadUsers();
    } else {
      setError(result.error);
    }
    return result;
  };

  // Eliminar usuario
  const deleteUser = async (id) => {
    const result = await UserService.deleteUser(id);
    if (result.success) {
      loadUsers();
    } else {
      setError(result.error);
    }
    return result;
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    loadUsers,
  };
};

export default useUsers;
