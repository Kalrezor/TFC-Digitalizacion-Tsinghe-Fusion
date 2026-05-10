import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { useAuth } from '../control/AuthContext';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import '../styles/ComelView.css';

export default function ComelView() {
  const { currentUser, loading: authLoading } = useAuth();
  const [miReservas, setMiReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reservas');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    personas: 1,
    nombre: currentUser?.displayName || '',
    telefono: '',
    notas: ''
  });

  useEffect(() => {
    cargarMisReservas();
  }, [currentUser]);

  const cargarMisReservas = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, 'reservas'),
        where('email', '==', currentUser.email)
      );
      const snapshot = await getDocs(q);
      const reservas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMiReservas(reservas);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'personas' ? parseInt(value) : value
    }));
  };

  const handleSubmitReserva = async (e) => {
    e.preventDefault();

    if (!formData.fecha || !formData.hora) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const nuevaReserva = {
        ...formData,
        email: currentUser.email,
        estado: 'pendiente',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'reservas'), nuevaReserva);
      setMiReservas([...miReservas, { id: docRef.id, ...nuevaReserva }]);
      setFormData({
        fecha: '',
        hora: '',
        personas: 1,
        nombre: currentUser?.displayName || '',
        telefono: '',
        notas: ''
      });
      setShowForm(false);
      alert('¡Reserva creada exitosamente!');
    } catch (error) {
      console.error('Error al crear reserva:', error);
      alert('Error al crear la reserva');
    }
  };

  const eliminarReserva = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      try {
        await deleteDoc(doc(db, 'reservas', id));
        setMiReservas(miReservas.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error al eliminar reserva:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (authLoading) {
    return <div className="comensal-loading">Cargando...</div>;
  }

  return (
    <div className="comensal-container">
      <div className="comensal-header">
        <div className="header-left">
          <h1 className="comensal-title">Mi Cuenta</h1>
          <p className="comensal-welcome">Bienvenido, {currentUser?.email}</p>
        </div>
        <button className="comensal-logout" onClick={handleLogout}>
          <span>🚪</span> Cerrar Sesión
        </button>
      </div>

      <div className="comensal-tabs">
        <button
          className={`tab-btn ${activeTab === 'reservas' ? 'active' : ''}`}
          onClick={() => setActiveTab('reservas')}
        >
          <span className="tab-icon">📅</span>
          Mis Reservas
        </button>
        <button
          className={`tab-btn ${activeTab === 'perfil' ? 'active' : ''}`}
          onClick={() => setActiveTab('perfil')}
        >
          <span className="tab-icon">👤</span>
          Mi Perfil
        </button>
      </div>

      <div className="comensal-content">
        {/* RESERVAS */}
        {activeTab === 'reservas' && (
          <div className="tab-panel">
            <div className="section-header">
              <h2>Mis Reservas</h2>
              <button
                className="new-reserva-btn"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? '❌ Cancelar' : '➕ Nueva Reserva'}
              </button>
            </div>

            {/* FORMULARIO */}
            {showForm && (
              <div className="reserva-form-container">
                <form onSubmit={handleSubmitReserva} className="reserva-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="nombre">Nombre</label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="telefono">Teléfono</label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Tu teléfono"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="fecha">Fecha</label>
                      <input
                        type="date"
                        id="fecha"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="hora">Hora</label>
                      <input
                        type="time"
                        id="hora"
                        name="hora"
                        value={formData.hora}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="personas">Personas</label>
                      <select
                        id="personas"
                        name="personas"
                        value={formData.personas}
                        onChange={handleInputChange}
                        className="form-input"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'persona' : 'personas'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="notas">Notas especiales (opcional)</label>
                    <textarea
                      id="notas"
                      name="notas"
                      value={formData.notas}
                      onChange={handleInputChange}
                      className="form-input form-textarea"
                      placeholder="Alergias, preferencias, etc..."
                      rows="3"
                    />
                  </div>

                  <button type="submit" className="form-submit-btn">
                    Confirmar Reserva
                  </button>
                </form>
              </div>
            )}

            {/* LISTADO DE RESERVAS */}
            <div className="reservas-list">
              {loading ? (
                <p className="loading-message">Cargando reservas...</p>
              ) : miReservas.length > 0 ? (
                <div className="reservas-grid">
                  {miReservas.map(reserva => (
                    <div key={reserva.id} className="reserva-card">
                      <div className="reserva-header">
                        <span className={`reserva-status status-${reserva.estado}`}>
                          {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                        </span>
                      </div>
                      <div className="reserva-body">
                        <p className="reserva-date">
                          <span className="date-icon">📅</span>
                          {new Date(reserva.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="reserva-time">
                          <span className="time-icon">🕐</span>
                          {reserva.hora}
                        </p>
                        <p className="reserva-people">
                          <span className="people-icon">👥</span>
                          {reserva.personas} {reserva.personas === 1 ? 'persona' : 'personas'}
                        </p>
                        {reserva.notas && (
                          <p className="reserva-notes">
                            <span className="note-icon">📝</span>
                            {reserva.notas}
                          </p>
                        )}
                      </div>
                      <div className="reserva-footer">
                        <button
                          className="cancel-btn"
                          onClick={() => eliminarReserva(reserva.id)}
                        >
                          Cancelar Reserva
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p className="empty-title">No tienes reservas</p>
                  <p className="empty-text">¿Por qué no haces tu primera reserva?</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PERFIL */}
        {activeTab === 'perfil' && (
          <div className="tab-panel">
            <h2>Mi Perfil</h2>
            <div className="profile-card">
              <div className="profile-avatar">
                {currentUser?.email.charAt(0).toUpperCase()}
              </div>
              <div className="profile-info">
                <p className="profile-label">Email</p>
                <p className="profile-value">{currentUser?.email}</p>
              </div>
              <div className="profile-info">
                <p className="profile-label">Total de Reservas</p>
                <p className="profile-value">{miReservas.length}</p>
              </div>
              <div className="profile-info">
                <p className="profile-label">Miembro desde</p>
                <p className="profile-value">
                  {currentUser?.metadata?.creationTime
                    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('es-ES')
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
