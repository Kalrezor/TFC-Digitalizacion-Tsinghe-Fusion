// Controlador: useTables.js
// Hook para manejar CRUD de mesas.

import { useState, useEffect } from 'react';
import TableService from '../models/TableService';

const useTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar todas las mesas
  const loadTables = async () => {
    setLoading(true);
    const result = await TableService.getAllTables();
    setLoading(false);
    if (result.success) {
      setTables(result.tables);
    } else {
      setError(result.error);
    }
  };

  // Cargar mesas disponibles
  const loadAvailableTables = async () => {
    setLoading(true);
    const result = await TableService.getAvailableTables();
    setLoading(false);
    if (result.success) {
      setTables(result.tables);
    } else {
      setError(result.error);
    }
  };

  // Crear mesa
  const createTable = async (tableData) => {
    const result = await TableService.createTable(tableData);
    if (result.success) {
      loadTables();
    } else {
      setError(result.error);
    }
    return result;
  };

  // Actualizar mesa
  const updateTable = async (id, tableData) => {
    const result = await TableService.updateTable(id, tableData);
    if (result.success) {
      loadTables();
    } else {
      setError(result.error);
    }
    return result;
  };

  // Eliminar mesa
  const deleteTable = async (id) => {
    const result = await TableService.deleteTable(id);
    if (result.success) {
      loadTables();
    } else {
      setError(result.error);
    }
    return result;
  };

  useEffect(() => {
    loadTables();
  }, []);

  return {
    tables,
    loading,
    error,
    createTable,
    updateTable,
    deleteTable,
    loadTables,
    loadAvailableTables
  };
};

export default useTables;