// Controlador: useDashboard.js
// Gestiona las opciones del sidebar segun el rol del usuario.
// Roles: "admin" | "comensal"

import { useState, useMemo, useCallback } from "react";

// Definicion de todas las opciones del sidebar con los roles que pueden verlas
const ALL_OPTIONS = [
  { id: "inicio",         label: "Inicio",           roles: ["admin", "comensal"] },
  { id: "preview-inicio", label: "Ver Inicio",       roles: ["admin", "comensal"] },
  { id: "preview-menu",   label: "Ver Menú",         roles: ["admin", "comensal"] },
  { id: "reservas",       label: "Reservas",         roles: ["comensal"] },
  { id: "split-bill",     label: "Dividir Cuenta",   roles: ["admin", "comensal"] },
  { id: "admin-menu",     label: "Gestión de Menú",   roles: ["admin"] },
  { id: "admin-mesas",    label: "Gestión de Mesas",  roles: ["admin"] },
  { id: "admin-ofertas",  label: "Gestión de Ofertas",roles: ["admin"] },
  { id: "admin-reservas", label: "Todas las Reservas",roles: ["admin"] },
];

const useDashboard = (role) => {
  const [selectedOption, setSelectedOption] = useState("preview-inicio");

  // Selección inicial: usar el inicio visual de la app por defecto,
  // para que recargar el dashboard se comporte como presionar Inicio.
  const availableOptions = useMemo(
    () => ALL_OPTIONS.filter((opt) => opt.roles.includes(role)),
    [role]
  );

  const selectOption = useCallback(
    (id) => {
      if (availableOptions.find((opt) => opt.id === id)) {
        setSelectedOption(id);
      }
    },
    [availableOptions]
  );

  const isOptionAvailable = (id) =>
    availableOptions.some((opt) => opt.id === id);

  return {
    selectedOption,
    availableOptions,
    selectOption,
    isOptionAvailable,
  };
};

export default useDashboard;