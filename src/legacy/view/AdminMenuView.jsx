import { useState, useEffect } from 'react';
import { useAuth } from '../control/AuthContext';
import { db, storage } from '../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import '../styles/AdminMenuView.css';

export default function AdminMenuView() {
  const [platos, setPlatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [alergenos, setAlergenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlato, setEditingPlato] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    idCategoria: '',
    descripcion: '',
    precio: '',
    alergenos: [],
    imagen: null,
    imagenPreview: null
  });
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [excludedAlergenos, setExcludedAlergenos] = useState([]);

  const { currentUser, loading: authLoading } = useAuth();

  const filteredPlatos = platos.filter(plato => {
    if (selectedCategoryFilter && plato.idCategoria !== selectedCategoryFilter) {
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
    setSelectedCategoryFilter('');
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
    if (!authLoading && currentUser) {
      cargarDatos();
    } else if (!authLoading && !currentUser) {
      setLoading(false);
      setLoadError('Debes iniciar sesión para cargar datos.');
    }
  }, [authLoading, currentUser]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setLoadError(null);

      // Cargar platos de la colección 'plate'
      const platosResult = await fetchCollection(['plate', 'plates']);
      const platosData = platosResult.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlatos(platosData);
      console.log(`Platos cargados desde colección '${platosResult.collectionName}':`, platosData.length);

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
      console.log(`Categorías cargadas desde colección '${categoriasResult.collectionName}':`, categoriasData.length, categoriasData);

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
      console.log(`Alérgenos cargados desde colección '${alergenosResult.collectionName}':`, alergenosData.length, alergenosData);

      console.log('🔍 Verificando datos existentes...');
      console.log('📊 Categorías:', categoriasData.length, '📊 Alérgenos:', alergenosData.length);

      // Mostrar datos existentes en consola
      if (categoriasData.length > 0) {
        console.log('📋 Categorías existentes:', categoriasData.map(c => `${c.nombre} (${c.id})`));
      }
      if (alergenosData.length > 0) {
        console.log('🥜 Alérgenos existentes:', alergenosData.map(a => `${a.nombre} (${a.id})`));
      }

      // Crear datos de ejemplo si no existen (más agresivo)
      if (categoriasData.length === 0 || alergenosData.length === 0) {
        console.log('⚠️ No hay categorías o alergenos, creando datos de ejemplo...');
        await crearDatosEjemplo();
        await cargarDatos();
        return;
      } else {
        console.log('✅ Ya existen datos en ambas colecciones');
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setLoadError(error.message || 'Error desconocido al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const recargarDatos = async () => {
    console.log('🔄 Recargando datos manualmente...');
    await cargarDatos();
  };

  const verificarColecciones = async () => {
    try {
      console.log('🔍 Verificando estado de colecciones...');

      const categorySnap = await getDocs(collection(db, 'category'));
      console.log(`📋 Colección 'category': ${categorySnap.size} documentos`);
      categorySnap.forEach(doc => {
        console.log(`  - ${doc.id}:`, doc.data());
      });

      const allergenSnap = await getDocs(collection(db, 'allergen'));
      console.log(`🥜 Colección 'allergen': ${allergenSnap.size} documentos`);
      allergenSnap.forEach(doc => {
        console.log(`  - ${doc.id}:`, doc.data());
      });

      const plateSnap = await getDocs(collection(db, 'plate'));
      console.log(`🍽️ Colección 'plate': ${plateSnap.size} documentos`);
      plateSnap.forEach(doc => {
        console.log(`  - ${doc.id}:`, doc.data());
      });

    } catch (error) {
      console.error('❌ Error al verificar colecciones:', error);
    }
  };

  const crearDatosEjemplo = async () => {
    try {
      console.log('🚀 Iniciando creación de datos de ejemplo...');

      // Crear categorías de ejemplo en colección 'category'
      const categoriasEjemplo = [
        { nombre: 'Entrantes', imagen: '🍽️' },
        { nombre: 'Principales', imagen: '🍖' },
        { nombre: 'Postres', imagen: '🍰' },
        { nombre: 'Bebidas', imagen: '🥤' }
      ];

      console.log('📝 Creando categorías...');
      for (const categoria of categoriasEjemplo) {
        const docRef = await addDoc(collection(db, 'category'), categoria);
        console.log('✅ Categoría creada:', categoria.nombre, 'ID:', docRef.id);
      }

      // Crear alergenos de ejemplo en colección 'allergen'
      const alergenosEjemplo = [
        { nombre: 'Gluten', imagen: '🌾' },
        { nombre: 'Lácteos', imagen: '🥛' },
        { nombre: 'Huevos', imagen: '🥚' },
        { nombre: 'Frutos secos', imagen: '🥜' },
        { nombre: 'Mariscos', imagen: '🦐' },
        { nombre: 'Soja', imagen: '🫘' }
      ];

      console.log('🥜 Creando alergenos...');
      for (const alergeno of alergenosEjemplo) {
        const docRef = await addDoc(collection(db, 'allergen'), alergeno);
        console.log('✅ Alergeno creado:', alergeno.nombre, 'ID:', docRef.id);
      }

      console.log('🎉 Datos de ejemplo creados correctamente');
      alert('✅ Datos de ejemplo creados correctamente. Haz clic en "🔍 Verificar Datos" para confirmar.');

      // No recargar automáticamente, dejar que el usuario verifique manualmente
      // await cargarDatos();

    } catch (error) {
      console.error('❌ Error al crear datos de ejemplo:', error);
      alert('Error al crear datos de ejemplo: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'precio' ? parseFloat(value) || '' : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imagen: file,
        imagenPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleCategoriaChange = (categoriaId) => {
    setFormData(prev => ({
      ...prev,
      idCategoria: categoriaId
    }));
  };

  const handleAlergenoToggle = (alergenoId) => {
    setFormData(prev => ({
      ...prev,
      alergenos: prev.alergenos.includes(alergenoId)
        ? prev.alergenos.filter(id => id !== alergenoId)
        : [...prev.alergenos, alergenoId]
    }));
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    const storageRef = ref(storage, `plate/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  const deleteImage = async (imageUrl) => {
    if (!imageUrl) return;

    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.idCategoria || !formData.descripcion || !formData.precio) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (formData.precio <= 0) {
      alert('El precio debe ser mayor a 0');
      return;
    }

    setUploading(true);

    try {
      let imageUrl = editingPlato?.imagen || null;

      // Si hay una nueva imagen, subirla
      if (formData.imagen) {
        // Eliminar imagen anterior si existe
        if (editingPlato?.imagen) {
          await deleteImage(editingPlato.imagen);
        }
        imageUrl = await uploadImage(formData.imagen);
      }

      const platoData = {
        nombre: formData.nombre,
        idCategoria: formData.idCategoria,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        alergenos: formData.alergenos,
        imagen: imageUrl,
        updatedAt: new Date().toISOString()
      };

      if (editingPlato) {
        // Actualizar plato existente en colección 'plate'
        await updateDoc(doc(db, 'plate', editingPlato.id), platoData);
        setPlatos(platos.map(p => p.id === editingPlato.id ? { ...p, ...platoData } : p));
      } else {
        // Crear nuevo plato en colección 'plate'
        platoData.createdAt = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'plate'), platoData);
        setPlatos([...platos, { id: docRef.id, ...platoData }]);
      }

      // Resetear formulario
      resetForm();
      alert(editingPlato ? 'Plato actualizado correctamente' : 'Plato creado correctamente');

    } catch (error) {
      console.error('Error al guardar plato:', error);
      alert('Error al guardar el plato');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      idCategoria: '',
      descripcion: '',
      precio: '',
      alergenos: [],
      imagen: null,
      imagenPreview: null
    });
    setEditingPlato(null);
    setShowForm(false);
  };

  const editarPlato = (plato) => {
    setEditingPlato(plato);
    setFormData({
      nombre: plato.nombre || '',
      idCategoria: plato.idCategoria || '',
      descripcion: plato.descripcion || '',
      precio: plato.precio || '',
      alergenos: plato.alergenos || [],
      imagen: null,
      imagenPreview: plato.imagen || null
    });
    setShowForm(true);
  };

  const eliminarPlato = async (plato) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${plato.nombre}"?`)) {
      return;
    }

    try {
      // Eliminar imagen del storage
      if (plato.imagen) {
        await deleteImage(plato.imagen);
      }

      // Eliminar documento de la colección 'plate'
      await deleteDoc(doc(db, 'plate', plato.id));

      setPlatos(platos.filter(p => p.id !== plato.id));
      alert('Plato eliminado correctamente');

    } catch (error) {
      console.error('Error al eliminar plato:', error);
      alert('Error al eliminar el plato');
    }
  };

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
      <img src={imagen} alt={label} className="icon-image" />
    ) : (
      <span className="icon-emoji">{imagen}</span>
    );
  };

  const getAlergenosNombres = (alergenosIds) => {
    return alergenos
      .filter(a => alergenosIds?.includes(a.id))
      .map(a => a.nombre)
      .join(', ');
  };

  if (loading) {
    return <div className="menu-loading">Cargando menú...</div>;
  }

  return (
    <div className="menu-container">
      <div className="menu-header">
        <h2>Gestión de Carta</h2>
        <div className="header-actions">
          <button
            className="new-plato-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '❌ Cancelar' : '➕ Nuevo Plato'}
          </button>
        </div>
      </div>

      {loadError && (
        <div className="data-error">Error al cargar datos: {loadError}</div>
      )}

      {/* FORMULARIO */}
      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="plato-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nombre">Nombre del Plato *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ej: Paella Valenciana"
                  required
                />
              </div>

              <div className="form-group">
                <label>Categoría *</label>
                <div className="category-options">
                  {categorias.map(categoria => (
                    <button
                      type="button"
                      key={categoria.id}
                      className={`category-option ${formData.idCategoria === categoria.id ? 'selected' : ''}`}
                      onClick={() => handleCategoriaChange(categoria.id)}
                      aria-pressed={formData.idCategoria === categoria.id}
                    >
                      <span className="category-icon">
                        {renderIcon(categoria.imagen, categoria.nombre)}
                      </span>
                      <span>{categoria.nombre || categoria.name || categoria.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="descripcion">Descripción *</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Describe los ingredientes y características del plato..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="precio">Precio (€) *</label>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Alérgenos</label>
                <div className="alergenos-checkbox-group">
                  {alergenos.map(alergeno => (
                    <label
                      key={alergeno.id}
                      className={`alergeno-checkbox ${formData.alergenos.includes(alergeno.id) ? 'checked' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.alergenos.includes(alergeno.id)}
                        onChange={() => handleAlergenoToggle(alergeno.id)}
                      />
                      <span className="alergeno-icon">
                        {renderIcon(alergeno.imagen, alergeno.nombre)}
                      </span>
                      <span>{alergeno.nombre || alergeno.name || alergeno.id}</span>
                    </label>
                  ))}
                </div>
                {formData.alergenos.length > 0 && (
                  <div className="selected-alergenos">
                    <small>Seleccionados: {getAlergenosNombres(formData.alergenos)}</small>
                  </div>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="imagen">Imagen del Plato</label>
                <input
                  type="file"
                  id="imagen"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                {(formData.imagenPreview || editingPlato?.imagen) && (
                  <div className="image-preview">
                    <img
                      src={formData.imagenPreview || editingPlato.imagen}
                      alt="Vista previa"
                      className="preview-image"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancelar
              </button>
              <button type="submit" className="submit-btn" disabled={uploading}>
                {uploading ? 'Guardando...' : (editingPlato ? 'Actualizar Plato' : 'Crear Plato')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTA DE PLATOS */}
      <div className="platos-grid">
        {filteredPlatos.length > 0 ? (
          filteredPlatos.map(plato => (
            <div key={plato.id} className="plato-card">
              <div className="plato-image">
                {plato.imagen ? (
                  <img src={plato.imagen} alt={plato.nombre} />
                ) : (
                  <div className="no-image">Sin imagen</div>
                )}
              </div>

              <div className="plato-info">
                <h3 className="plato-nombre">{plato.nombre}</h3>

                <div className="plato-categoria">
                  {getCategoriaImagen(plato.idCategoria) && (
                    <img
                      src={getCategoriaImagen(plato.idCategoria)}
                      alt={getCategoriaNombre(plato.idCategoria)}
                      className="categoria-mini-icon"
                    />
                  )}
                  <span>{getCategoriaNombre(plato.idCategoria)}</span>
                </div>

                <p className="plato-descripcion">{plato.descripcion}</p>

                <div className="plato-precio">
                  <span className="precio">€{plato.precio?.toFixed(2)}</span>
                </div>

                {plato.alergenos && plato.alergenos.length > 0 && (
                  <div className="plato-alergenos">
                    <small>Alérgenos: {getAlergenosNombres(plato.alergenos)}</small>
                  </div>
                )}
              </div>

              <div className="plato-actions">
                <button
                  className="edit-btn"
                  onClick={() => editarPlato(plato)}
                  title="Editar plato"
                >
                  ✏️
                </button>
                <button
                  className="delete-btn"
                  onClick={() => eliminarPlato(plato)}
                  title="Eliminar plato"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <p className="empty-title">No hay platos que coincidan con los filtros</p>
            <p className="empty-text">Limpia los filtros o prueba con otra categoría.</p>
          </div>
        )}
      </div>

      <div className="bottom-filter-panel">
        <div className="bottom-filter-title">
          <h3>Filtrar carta</h3>
          <button type="button" className="clear-filters-btn" onClick={resetFilters}>
            Limpiar filtros
          </button>
        </div>

        <div className="bottom-filter-group">
          <span className="filter-label">Filtrar por categoría:</span>
          <div className="filter-chip-row">
            <button
              type="button"
              className={`filter-chip ${selectedCategoryFilter === '' ? 'active' : ''}`}
              onClick={() => setSelectedCategoryFilter('')}
            >
              Todas
            </button>
            {categorias.map(categoria => (
              <button
                key={categoria.id}
                type="button"
                className={`filter-chip ${selectedCategoryFilter === categoria.id ? 'active' : ''}`}
                onClick={() => setSelectedCategoryFilter(categoria.id)}
              >
                {renderIcon(categoria.imagen, categoria.nombre)}
                {categoria.nombre || categoria.name || categoria.id}
              </button>
            ))}
          </div>
        </div>

        <div className="bottom-filter-group">
          <span className="filter-label">Excluir alérgenos:</span>
          <div className="filter-chip-row">
            {alergenos.map(alergeno => (
              <button
                key={alergeno.id}
                type="button"
                className={`filter-chip ${excludedAlergenos.includes(alergeno.id) ? 'active' : ''}`}
                onClick={() => toggleExcludedAlergeno(alergeno.id)}
              >
                {renderIcon(alergeno.imagen, alergeno.nombre)}
                {alergeno.nombre || alergeno.name || alergeno.id}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
