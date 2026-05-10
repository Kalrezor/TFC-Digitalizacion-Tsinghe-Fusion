import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { useAuth } from '../control/AuthContext';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import AdminMenuView from './AdminMenuView';
import '../styles/AdminView.css';

export default function AdminView() {
  const { currentUser, loading: authLoading } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalReservas: 0,
    totalUsuarios: 0,
    totalIngresos: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar reservas
      const reservasSnap = await getDocs(collection(db, 'reservas'));
      const reservasData = reservasSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReservas(reservasData);

      // Cargar usuarios
      const usuariosSnap = await getDocs(collection(db, 'users'));
      const usuariosData = usuariosSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsuarios(usuariosData);

      // Calcular estadísticas
      setStats({
        totalReservas: reservasData.length,
        totalUsuarios: usuariosData.length,
        totalIngresos: reservasData.reduce((sum, r) => sum + (r.personas * 45 || 0), 0)
      });
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const eliminarReserva = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      try {
        await deleteDoc(doc(db, 'reservas', id));
        setReservas(reservas.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error al eliminar reserva:', error);
      }
    }
  };

  if (authLoading) {
    return <div className="admin-loading">Cargando...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="admin-header">
          <h1 className="admin-logo">Admin Panel</h1>
          <p className="admin-user">{currentUser?.email}</p>
        </div>

        <nav className="admin-nav">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </button>
          <button
            className={`nav-item ${activeTab === 'reservas' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservas')}
          >
            <span className="nav-icon">📅</span>
            Reservas ({reservas.length})
          </button>
          <button
            className={`nav-item ${activeTab === 'usuarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('usuarios')}
          >
            <span className="nav-icon">👥</span>
            Usuarios ({usuarios.length})
          </button>
          <button
            className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            <span className="nav-icon">🍽️</span>
            Gestión de Carta
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <span className="logout-icon">🚪</span>
          Cerrar Sesión
        </button>
      </div>

      <div className="admin-content">
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="tab-content dashboard-content">
            <h2 className="tab-title">Panel de Control</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon stat-icon-1">📅</div>
                <h3 className="stat-label">Reservas Totales</h3>
                <p className="stat-value">{stats.totalReservas}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-2">👥</div>
                <h3 className="stat-label">Usuarios Registrados</h3>
                <p className="stat-value">{stats.totalUsuarios}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-3">💰</div>
                <h3 className="stat-label">Ingresos Estimados</h3>
                <p className="stat-value">${stats.totalIngresos}</p>
              </div>
            </div>

            <div className="recent-section">
              <h3 className="recent-title">Últimas Reservas</h3>
              {reservas.slice(0, 5).length > 0 ? (
                <div className="recent-list">
                  {reservas.slice(0, 5).map(reserva => (
                    <div key={reserva.id} className="recent-item">
                      <div className="recent-info">
                        <p className="recent-name">{reserva.nombre || 'Sin nombre'}</p>
                        <p className="recent-detail">{reserva.fecha} - {reserva.personas} personas</p>
                      </div>
                      <span className="badge">{reserva.estado || 'pendiente'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">No hay reservas</p>
              )}
            </div>
          </div>
        )}

        {/* RESERVAS */}
        {activeTab === 'reservas' && (
          <div className="tab-content">
            <h2 className="tab-title">Gestión de Reservas</h2>
            {loading ? (
              <p className="loading-text">Cargando reservas...</p>
            ) : reservas.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Personas</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservas.map(reserva => (
                      <tr key={reserva.id}>
                        <td>{reserva.nombre}</td>
                        <td>{reserva.email}</td>
                        <td>{reserva.fecha}</td>
                        <td>{reserva.hora}</td>
                        <td>{reserva.personas}</td>
                        <td>
                          <span className={`status-badge status-${reserva.estado}`}>
                            {reserva.estado}
                          </span>
                        </td>
                        <td>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => eliminarReserva(reserva.id)}
                          >
                            🗑️ Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-message">No hay reservas registradas</p>
            )}
          </div>
        )}

        {/* USUARIOS */}
        {activeTab === 'usuarios' && (
          <div className="tab-content">
            <h2 className="tab-title">Gestión de Usuarios</h2>
            {loading ? (
              <p className="loading-text">Cargando usuarios...</p>
            ) : usuarios.length > 0 ? (
              <div className="users-grid">
                {usuarios.map(usuario => (
                  <div key={usuario.id} className="user-card">
                    <div className="user-avatar">
                      {usuario.email.charAt(0).toUpperCase()}
                    </div>
                    <h4 className="user-email">{usuario.email}</h4>
                    <p className="user-role">
                      <span className={`role-badge role-${usuario.role}`}>
                        {usuario.role}
                      </span>
                    </p>
                    <p className="user-date">
                      Registrado: {usuario.createdAt ? new Date(usuario.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">No hay usuarios registrados</p>
            )}
          </div>
        )}

        {/* GESTIÓN DE CARTA */}
        {activeTab === 'menu' && <AdminMenuView />}
      </div>
    </div>
  );
}
