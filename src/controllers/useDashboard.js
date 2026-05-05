// Controlador: useDashboard.js
// Gestiona las opciones del sidebar segun el rol del usuario.
// Roles: "admin" | "comensal"

import { useState } from "react";

// Definicion de todas las opciones del sidebar con los roles que pueden verlas
const ALL_OPTIONS = [
  { id: "inicio",         label: "Inicio",           roles: ["admin", "comensal"] },
  { id: "reservas",       label: "Mis Reservas",      roles: ["comensal"] },
  { id: "admin-menu",     label: "Gestion de Menu",   roles: ["admin"] },
  { id: "admin-mesas",    label: "Gestion de Mesas",  roles: ["admin"] },
  { id: "admin-ofertas",  label: "Gestion de Ofertas",roles: ["admin"] },
  { id: "admin-reservas", label: "Todas las Reservas",roles: ["admin"] },
];

const useDashboard = (role) => {
  const [selectedOption, setSelectedOption] = useState("inicio");

  // Solo las opciones que corresponden al rol actual
  const availableOptions = ALL_OPTIONS.filter(
    (opt) => opt.roles.includes(role)
  );

  const selectOption = (id) => {
    if (availableOptions.find((opt) => opt.id === id)) {
      setSelectedOption(id);
    }
  };

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
