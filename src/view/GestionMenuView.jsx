import { useState, useEffect } from 'react';
import { db, storage } from '../firebase/config'; 
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const categoriasDisponibles = [
  "ENSALADAS", "SOPAS", "ARROZES", "FIDEOS Y TALLARINES", "DIM SUM", 
  "VERDURA", "TERNERA", "POLLO", "PATO", "CERDO", "MARISCO", 
  "NIGIRIS", "GUNKAN", "MAKI", "ROLL", "TEMAKI", "SASHIMI", 
  "TATAKI", "TARTAR", "POKE", "BANDEJAS", "POSTRES", "CAFÉS Y TÉS", "BEBIDAS", "VINOS"
];

const listaAlergenos = [
  { id: 1, nombre: "Cereales con gluten", imagen: "/assets/ico_cereales.png" },
  { id: 2, nombre: "Crustáceos", imagen: "/assets/ico_crustaceos.png" },
  { id: 3, nombre: "Huevos", imagen: "/assets/ico_huevos.png" },
  { id: 4, nombre: "Pescado", imagen: "/assets/ico_pescado.png" },
  { id: 5, nombre: "Cacahuetes", imagen: "/assets/ico_cacahuetes.png" },
  { id: 6, nombre: "Soja", imagen: "/assets/ico_soja.png" },
  { id: 7, nombre: "Lácteos", imagen: "/assets/ico_lacteos.png" },
  { id: 8, nombre: "Frutos secos", imagen: "/assets/ico_frutsecos.png" },
  { id: 9, nombre: "Apio", imagen: "/assets/ico_apio.png" },
  { id: 10, nombre: "Mostaza", imagen: "/assets/ico_mostaza.png" },
  { id: 11, nombre: "Sésamo", imagen: "/assets/ico_sesamo.png" },
  { id: 12, nombre: "Sulfitos", imagen: "/assets/ico_sulfitos.png" },
  { id: 13, nombre: "Altramuz", imagen: "/assets/ico_altramuz.png" },
  { id: 14, nombre: "Moluscos", imagen: "/assets/ico_moluscos.png" }
];

export default function GestionMenuView() {
  const [platos, setPlatos] = useState([]);
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  
  const [nuevoPlato, setNuevoPlato] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    allergens: [],
    available: true
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "menus"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlatos(data);
    });
    return () => unsubscribe();
  }, []);

  const toggleAlergeno = (id) => {
    setNuevoPlato(prev => {
      const current = prev.allergens || [];
      return {
        ...prev,
        allergens: current.includes(id) ? current.filter(a => a !== id) : [...current, id]
      };
    });
  };

  const handleAddPlato = async (e) => {
    e.preventDefault();
    if (!imagenArchivo) return alert("Por favor, selecciona una imagen");
    
    setSubiendo(true);
    try {
      const storageRef = ref(storage, `menus/${Date.now()}_${imagenArchivo.name}`);
      await uploadBytes(storageRef, imagenArchivo);
      const urlFinal = await getDownloadURL(storageRef);

      await addDoc(collection(db, "menus"), {
        ...nuevoPlato,
        price: Number(nuevoPlato.price),
        imageUrl: urlFinal,
        createdAt: serverTimestamp()
      });

      setNuevoPlato({ name: '', description: '', price: '', category: '', allergens: [], available: true });
      setImagenArchivo(null);
    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="view-container">
      <h2 className="section-title">Gestión del Menú</h2>
      <div className="admin-main-grid">
        <section className="admin-column-left">
          <h3 className="admin-subtitle">Platos Actuales</h3>
          <div className="main-list-container">
            {platos.map((plato) => (
              <div key={plato.id} className="plato-card-admin">
                {plato.imageUrl && <img src={plato.imageUrl} alt="" className="img-plato-mini" />}
                <div className="plato-info">
                  <span className="plato-category-tag">{plato.category}</span>
                  <h4 className="plato-name-admin">{plato.name}</h4>
                  <p className="plato-desc-admin">{plato.description}</p>
                  <span className="plato-price-admin">{plato.price}€</span>
                  <div className="plato-alergenos-tags">
                    {Array.isArray(plato.allergens) && plato.allergens.map(id => {
                      const al = listaAlergenos.find(a => a.id === id);
                      return al ? <img key={id} src={al.imagen} className="img-alergeno-tiny" title={al.nombre} /> : null;
                    })}
                  </div>
                </div>
                <button onClick={() => deleteDoc(doc(db, "menus", plato.id))} className="btn-delete">Eliminar</button>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-column-right">
          <div className="admin-side-card">
            <h3 className="admin-subtitle">Nuevo Plato</h3>
            <form onSubmit={handleAddPlato} className="admin-form">
              
              <div className="form-group-admin">
                <label>Nombre del Plato</label>
                <input type="text" value={nuevoPlato.name} onChange={(e) => setNuevoPlato({...nuevoPlato, name: e.target.value})} required placeholder="Ej: Pato Pekín" />
              </div>

              {/* NUEVO CAMPO: DESCRIPCIÓN */}
              <div className="form-group-admin">
                <label>Descripción</label>
                <textarea 
                  value={nuevoPlato.description} 
                  onChange={(e) => setNuevoPlato({...nuevoPlato, description: e.target.value})} 
                  placeholder="Ingredientes o detalles..."
                  rows="3"
                />
              </div>

              <div className="form-group-admin">
                <label>Precio (€)</label>
                <input type="number" step="0.01" value={nuevoPlato.price} onChange={(e) => setNuevoPlato({...nuevoPlato, price: e.target.value})} required />
              </div>

              <div className="form-group-admin">
                <label>Categoría</label>
                <select value={nuevoPlato.category} onChange={(e) => setNuevoPlato({...nuevoPlato, category: e.target.value})} required>
                  <option value="">Seleccionar...</option>
                  {categoriasDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* MEJORA: BOTÓN DE CARGA DE IMAGEN */}
              <div className="form-group-admin">
                <label>Imagen del Plato</label>
                <label htmlFor="file-input" className="btn-upload-custom">
                   {imagenArchivo ? "✓ IMAGEN SELECCIONADA" : "CARGAR IMAGEN"}
                </label>
                <input 
                  type="file" 
                  id="file-input" 
                  accept="image/*" 
                  onChange={(e) => setImagenArchivo(e.target.files[0])} 
                  style={{ display: 'none' }} 
                />
                {imagenArchivo && <span className="file-name-display">{imagenArchivo.name}</span>}
              </div>
              
              <div className="form-group-admin">
                <label>Alérgenos</label>
                <div className="alergenos-visual-grid">
                  {listaAlergenos.map(al => (
                    <div 
                      key={al.id} 
                      className={`alergeno-box ${(nuevoPlato.allergens || []).includes(al.id) ? 'active' : ''}`}
                      onClick={() => toggleAlergeno(al.id)}
                      title={al.nombre}
                    >
                      <img src={al.imagen} alt={al.nombre} />
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-save" disabled={subiendo}>
                {subiendo ? 'SUBIENDO...' : 'GUARDAR PLATO'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}