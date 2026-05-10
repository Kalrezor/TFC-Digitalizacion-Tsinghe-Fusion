import { useState } from 'react';

export function useNavigation() {
  const [seccion, setSeccion] = useState('inicio');

  const navegarA = (nuevaSeccion) => {
    setSeccion(nuevaSeccion);
  };

  return { seccion, navegarA };
}