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

const ImagenAlergeno = ({ idAlergeno }) => {
  const infoAlergeno = menuData.alergenos.find(a => a.id === idAlergeno);
  if (!infoAlergeno) return null;
  return (
    <img 
      src={infoAlergeno.imagen}
      alt={infoAlergeno.nombre}
      title={infoAlergeno.nombre}
      className="img-alergeno-small" 
    />
  );
};

export default function CartaView() {
  const [menuAgrupado, setMenuAgrupado] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "menus"), where("available", "==", true));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const platos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
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

  if (loading) return <div className="view-container">Cargando la carta fusión...</div>;

  return (
    <div className="container-fluid py-5 px-4 carta-container-wide">
      <header className="text-center mb-5 carta-header">
        <h2 className="display-4 fw-bold text-dark text-uppercase">Nuestra Carta</h2>
        <p className="text-secondary h5 fst-italic">Tsinghe Cocina Fusión</p>
      </header>

      <div className="d-flex flex-column gap-5">
        {Object.keys(menuAgrupado).map((categoria) => (
          <section key={categoria} className="categoria-section">
            <h3 className="carta-category-title">{categoria}</h3>
            <div className="row g-4">
              {menuAgrupado[categoria].map((plato) => (
                <div key={plato.id} className="col-12 col-xl-6">
                  <div className="plato-card-rect">
                    <div className="plato-card-img-wrapper">
                      {plato.imageUrl ? (
                        <img src={plato.imageUrl} alt={plato.name} className="plato-img-full" />
                      ) : (
                        <div className="plato-img-placeholder">Tsinghe</div>
                      )}
                    </div>
                    
                    <div className="plato-card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <h5 className="plato-name-full">{plato.name}</h5>
                        <span className="plato-precio-bold">{Number(plato.price).toFixed(2)}€</span>
                      </div>
                      <p className="plato-desc-full">{plato.description}</p>
                      
                      <div className="plato-alergenos-row">
                        {Array.isArray(plato.allergens) && 
                          plato.allergens.map(id => <ImagenAlergeno key={id} idAlergeno={id} />)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="carta-footer-info mt-5">
        <p className="fw-bold mb-4 h4 text-dark text-center">Información sobre alérgenos</p>
        <div className="alergenos-footer-grid">
          {menuData.alergenos.map(alergeno => (
            <div key={alergeno.id} className="alergeno-footer-item">
              <img src={alergeno.imagen} alt={alergeno.nombre} className="img-alergeno-footer" />
              <span className="text-muted small">{alergeno.nombre}</span>
            </div>
          ))}
        </div>
        <p className="small mb-0 mt-4 text-center fst-italic border-top pt-3 text-secondary">
          Si usted tiene alguna alergia alimentaria, por favor póngase en contacto con nuestro personal.
        </p>
      </footer>
    </div>
  );
}