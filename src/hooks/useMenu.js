/*
 * Archivo: src/hooks/useMenu.js
 * Proposito: Hook de menu legacy: carga y gestiona datos de menus desde el servicio correspondiente.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const useMenu = () => {
  const [platos, setPlatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [alergenos, setAlergenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        // PLATOS (colecciÃ³n: plate)
        const platosSnap = await getDocs(collection(db, "plate"));
        const platosData = platosSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPlatos(platosData);

        // CATEGORÃAS (colecciÃ³n: category)
        const categoriasSnap = await getDocs(collection(db, "category"));
        const categoriasData = categoriasSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nombre: data.nombre || data.name || doc.id,
            imagen: data.imagen || data.icono || "",
            ...data
          };
        });
        setCategorias(categoriasData);

        // ALÃ‰RGENOS (colecciÃ³n: allergen)
        const alergenosSnap = await getDocs(collection(db, "allergen"));
        const alergenosData = alergenosSnap.docs.map(doc => {
          const data = doc.data();
          const nombre = data.nombre || data.name || doc.id;
          let imagen = data.imagen || data.icono || "";

          if (!imagen) {
            const emojiMap = {
              "Gluten": "ðŸŒ¾",
              "LÃ¡cteos": "ðŸ¥›",
              "Huevos": "ðŸ¥š",
              "Frutos secos": "ðŸ¥œ",
              "Mariscos": "ðŸ¦",
              "Soja": "ðŸ«˜"
            };
            imagen = emojiMap[nombre] || "âš ï¸";
          }

          return {
            id: doc.id,
            nombre,
            imagen,
            ...data
          };
        });
        setAlergenos(alergenosData);

      } catch (error) {
        console.error("Error al cargar datos del menÃº:", error);
        setError(error.message || "Error desconocido al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  return {
    platos,
    categorias,
    alergenos,
    loading,
    error
  };
};

export default useMenu;

