// Controlador: useAuth.js
// Este hook personalizado maneja la lógica de control para la autenticación.
// Gestiona el estado del login, errores, y llamadas al modelo AuthService.
// Ahora extendido para incluir el rol del usuario.

import { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import AuthService from "../models/AuthService";

const useAuth = () => {
  // Estado para el usuario actual
  const [user, setUser] = useState(null);
  // Estado para el rol del usuario
  const [role, setRole] = useState(null);
  // Estado para indicar si está cargando
  const [loading, setLoading] = useState(true);
  // Estado para errores
  const [error, setError] = useState(null);

  // Efecto para escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Obtener el rol desde Firestore
        const userRole = await AuthService.getUserRole(currentUser.uid);
        setRole(userRole);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  // Función para manejar el login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    const result = await AuthService.loginWithEmail(email, password);
    setLoading(false);

    if (result.success) {
      setUser(result.user);
      // El rol se establece en el useEffect
      return { success: true };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  };

  // Función para logout
  const logout = async () => {
    const result = await AuthService.logout();
    if (result.success) {
      setUser(null);
      setRole(null);
    } else {
      setError(result.error);
    }
  };

  return {
    user,
    role,
    loading,
    error,
    login,
    logout,
  };
};

export default useAuth;
