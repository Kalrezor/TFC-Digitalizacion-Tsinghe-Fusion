// Vista: Menu.js
// Componente para mostrar el menú del restaurante
// Visible sin login, con funcionalidad de búsqueda y filtrado por categoría

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "../styles/ChineseStyle.css";

const Menu = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [platos, setPlatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [alergenos, setAlergenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [excludedAlergenos, setExcludedAlergenos] = useState([]);

  const filteredPlatos = platos.filter(plato => {
    if (selectedCategory && plato.idCategoria !== selectedCategory) {
      return false;
    }

    if (excludedAlergenos.length > 0) {
      const platoAlergenos = Array.isArray(plato.alergenos) ? plato.alergenos : [];
      return !excludedAlergenos.some(alergenoId => platoAlergenos.includes(alergenoId));
    }

    return true;
  });

  const toggleExcludedAlergeno = (alergenoId) => {
    setExcludedAlergenos(prev =>
      prev.includes(alergenoId)
        ? prev.filter(id => id !== alergenoId)
        : [...prev, alergenoId]
    );
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setExcludedAlergenos([]);
  };

  const fetchCollection = async (collectionNames) => {
    for (const collectionName of collectionNames) {
      const snap = await getDocs(collection(db, collectionName));
      if (snap.size > 0) {
        return { docs: snap.docs, collectionName };
      }
    }
    return { docs: [], collectionName: collectionNames[0] };
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar platos de la colección 'plate'
        const platosResult = await fetchCollection(['plate', 'plates']);
        const platosData = platosResult.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPlatos(platosData);

        // Cargar categorías de la colección 'category'
        const categoriasResult = await fetchCollection(['category', 'categories']);
        const categoriasData = categoriasResult.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nombre: data.nombre || data.name || doc.id,
            imagen: data.imagen || data.icono || '',
            ...data
          };
        });
        setCategorias(categoriasData);

        // Cargar alergenos de la colección 'allergen'
        const alergenosResult = await fetchCollection(['allergen', 'allergens']);
        const alergenosData = alergenosResult.docs.map(doc => {
          const data = doc.data();
          const nombre = data.nombre || data.name || doc.id;
          let imagen = data.imagen || data.icono || '';

          // Asignar emoji por defecto si no hay imagen
          if (!imagen) {
            const emojiMap = {
              'Gluten': '🌾',
              'Lácteos': '🥛',
              'Huevos': '🥚',
              'Frutos secos': '🥜',
              'Mariscos': '🦐',
              'Soja': '🫘'
            };
            imagen = emojiMap[nombre] || '⚠️';
          }

          return {
            id: data.id != null ? data.id : doc.id,
            nombre: nombre,
            imagen: imagen,
            ...data
          };
        });
        setAlergenos(alergenosData);

      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError(error.message || 'Error desconocido al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const getCategoriaNombre = (categoriaId) => {
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  };

  const getCategoriaImagen = (categoriaId) => {
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.imagen : null;
  };

  const renderIcon = (imagen, label) => {
    if (!imagen) return null;

    const isUrl = typeof imagen === 'string' && (
      imagen.startsWith('http') ||
      imagen.startsWith('https') ||
      imagen.startsWith('data:') ||
      imagen.startsWith('/') ||
      /\/.+\.[a-zA-Z]{2,5}(\?.*)?$/.test(imagen)
    );

    return isUrl ? (
      <img src={imagen} alt={label} style={{ width: '20px', height: '20px' }} />
    ) : (
      <span>{imagen}</span>
    );
  };

  const getAlergenosNombres = (alergenosIds) => {
    return alergenos
      .filter(a => alergenosIds?.includes(a.id))
      .map(a => a.nombre)
      .join(', ');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando menú...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Error: {error}</div>;
  }

  // Agrupar platos por categoría
  const platosPorCategoria = filteredPlatos.reduce((acc, plato) => {
    const categoriaId = plato.idCategoria || 'sin-categoria';
    if (!acc[categoriaId]) {
      acc[categoriaId] = [];
    }
    acc[categoriaId].push(plato);
    return acc;
  }, {});

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#DC143C', marginBottom: '30px' }}>Nuestra Carta</h1>

      {/* Filtros */}
      <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <div>
          <label style={{ marginRight: '10px' }}>Categoría:</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ padding: '5px' }}>
            <option value="">Todas</option>
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ marginRight: '10px' }}>Excluir alérgenos:</label>
          {alergenos.map(alergeno => (
            <button
              key={alergeno.id}
              onClick={() => toggleExcludedAlergeno(alergeno.id)}
              style={{
                margin: '0 5px',
                padding: '5px 10px',
                background: excludedAlergenos.includes(alergeno.id) ? '#DC143C' : '#f0f0f0',
                color: excludedAlergenos.includes(alergeno.id) ? 'white' : 'black',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {renderIcon(alergeno.imagen, alergeno.nombre)} {alergeno.nombre}
            </button>
          ))}
        </div>

        <button onClick={resetFilters} style={{ padding: '5px 10px', background: '#568d6e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Reset Filtros
        </button>
      </div>

      {/* Menú por categorías */}
      {Object.keys(platosPorCategoria).length === 0 ? (
        <p style={{ textAlign: 'center' }}>No hay platos disponibles.</p>
      ) : (
        Object.entries(platosPorCategoria).map(([categoriaId, platosCategoria]) => (
          <div key={categoriaId} style={{ marginBottom: '40px' }}>
            <h2 style={{ color: '#DC143C', borderBottom: '2px solid #DC143C', paddingBottom: '10px' }}>
              {getCategoriaImagen(categoriaId) && renderIcon(getCategoriaImagen(categoriaId), getCategoriaNombre(categoriaId))} {getCategoriaNombre(categoriaId)}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {platosCategoria.map(plato => (
                <div key={plato.id} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '15px', background: '#fff' }}>
                  {plato.imagen && (
                    <img src={plato.imagen} alt={plato.nombre} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px', marginBottom: '10px' }} />
                  )}
                  <h3 style={{ color: '#DC143C' }}>{plato.nombre}</h3>
                  <p>{plato.descripcion}</p>
                  <p style={{ fontWeight: 'bold' }}>€{plato.precio?.toFixed(2)}</p>
                  {plato.alergenos && plato.alergenos.length > 0 && (
                    <div>
                      <strong>Alérgenos:</strong> {getAlergenosNombres(plato.alergenos)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Botón para reservar */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button
          onClick={() => navigate(user ? '/dashboard' : '/login')}
          style={{
            padding: '15px 30px',
            background: '#DC143C',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          {user ? 'Ir al Dashboard' : 'Iniciar Sesión para Reservar'}
        </button>
      </div>
    </div>
  );
};

export default Menu;