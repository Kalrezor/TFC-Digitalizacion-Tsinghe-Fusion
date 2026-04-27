import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const menuData = {
  alergenos: [
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
  ]
};

// Componente para renderizar cada icono de alérgeno
const ImagenAlergeno = ({ idAlergeno }) => {
  const infoAlergeno = menuData.alergenos.find(a => a.id === idAlergeno);
  if (!infoAlergeno) return null;
  return (
    <img 
      src={infoAlergeno.imagen}
      alt={infoAlergeno.nombre}
      title={infoAlergeno.nombre}
      className="me-1 border rounded img-alergeno-small" 
    />
  );
};

export default function CartaView() {
  const [menuAgrupado, setMenuAgrupado] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Consultamos solo los platos disponibles
    const q = query(collection(db, "menus"), where("available", "==", true));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const platos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Agrupamos los platos por categoría
      const agrupados = platos.reduce((acc, plato) => {
        const cat = plato.category || "OTROS";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(plato);
        return acc;
      }, {});

      setMenuAgrupado(agrupados);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="view-container">Cargando la carta...</div>;

  return (
    <div className="container py-5 px-3 carta-container">
      <header className="text-center mb-5 carta-header">
        <h2 className="display-5 fw-bold text-dark text-uppercase">Nuestra Carta</h2>
        <p className="text-secondary fst-italic">Tsinghe Cocina Fusión</p>
      </header>

      <div className="d-flex flex-column gap-5">
        {Object.keys(menuAgrupado).map((categoria) => (
          <section key={categoria}>
            <h3 className="h4 fw-bold carta-category-title">{categoria}</h3>
            <div className="row g-4">
              {menuAgrupado[categoria].map((plato) => (
                <div key={plato.id} className="col-12 col-md-6">
                  <div className="plato-item">
                    <div className="pe-3 flex-grow-1 text-start">
                      <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '1.1rem' }}>
                        {plato.name}
                      </h5>
                      {plato.description && (
                        <p className="text-muted mb-1 small">{plato.description}</p>
                      )}
                      <div className="d-flex flex-wrap mt-2">
                        {Array.isArray(plato.allergens) && 
                          plato.allergens.map(id => <ImagenAlergeno key={id} idAlergeno={id} />)}
                      </div>
                    </div>
                    <span className="plato-precio">
                      {typeof plato.price === 'number' ? `${plato.price.toFixed(2)}€` : plato.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="carta-footer-info">
        <p className="fw-bold mb-3 h5 text-dark">Información sobre alérgenos:</p>
        <div className="row g-3">
          {menuData.alergenos.map(alergeno => (
            <div key={alergeno.id} className="col-12 col-sm-6 col-md-4 d-flex align-items-center">
              <img src={alergeno.imagen} alt={alergeno.nombre} className="border rounded img-alergeno-footer" />
              <span className="text-muted small">{alergeno.nombre}</span>
            </div>
          ))}
        </div>
        <p className="small mb-0 mt-4 fst-italic">
          Si usted tiene alguna alergia alimentaria, por favor póngase en contacto con nuestro personal.
          Debido a nuestra elaboración artesanal, todos los platos pueden contener trazas de alérgenos.
        </p>
      </footer>
    </div>
  );
}