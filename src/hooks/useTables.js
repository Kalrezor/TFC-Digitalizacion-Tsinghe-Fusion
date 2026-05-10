// Controlador: useTables.js
// Hook para manejar CRUD de mesas con actualizaciones en tiempo real.

import { useState, useEffect } from 'react';
import TableService from '../services/TableService';

const useTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Setup listener en tiempo real
  useEffect(() => {
    setLoading(true);
    
    // Usar listener en tiempo real para todas las mesas
    const unsubscribe = TableService.subscribeToAllTables((result) => {
      setLoading(false);
      if (result.success) {
        setTables(result.tables);
        setError(null);
      } else {
        setError(result.error);
      }
    });

    // Cleanup: desuscribir cuando se desmonte
    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  // Cargar todas las mesas (para casos manuales)
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
    // No necesitamos llamar a loadTables, el listener actualizará automáticamente
    return result;
  };

  // Actualizar mesa
  const updateTable = async (id, tableData) => {
    const result = await TableService.updateTable(id, tableData);
    // No necesitamos llamar a loadTables, el listener actualizará automáticamente
    return result;
  };

  // Eliminar mesa
  const deleteTable = async (id) => {
    const result = await TableService.deleteTable(id);
    // No necesitamos llamar a loadTables, el listener actualizará automáticamente
    return result;
  };

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