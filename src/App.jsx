import { useEffect } from 'react'
import './App.css'
import { auth } from './firebase/config' 
import { useNavigation } from './control/NavigationController'
import CartaView from './view/CartaView'
import ReservasView from './view/ReservasView'
import LoginView from './view/LoginView'
import NosotrosView from './view/NosotrosView'
import AdminPanelView from './view/AdminPanelView'
import GestionMenuView from './view/GestionMenuView'

function App() {
  const { seccion, navegarA, rol, user, loading } = useNavigation();

  useEffect(() => {
    if (user && seccion === 'login') {
      navegarA(rol === 'admin' ? 'admin_panel' : 'inicio');
    }
  }, [user, seccion, navegarA, rol]);

  if (loading) return <div className="view-container">Cargando...</div>;

  return (
    <div className="app-wrapper">
      <header className="navbar-main">
        <div className="logo" onClick={() => navegarA(rol === 'admin' ? 'admin_panel' : 'inicio')}>
          Tsinghe Cocina Fusión
        </div>
        
        <nav className="nav-links">
          {rol !== 'admin' && (
            <>
              <span onClick={() => navegarA('inicio')}>INICIO</span>
              <span onClick={() => navegarA('carta')}>LA CARTA</span>
            </>
          )}

          {!user && (
            <>
              <span onClick={() => navegarA('nosotros')}>NOSOTROS</span>
              <span onClick={() => navegarA('login')}>LOGIN</span>
            </>
          )}

          {rol === 'comensal' && (
            <span onClick={() => navegarA('reservas')}>RESERVAR</span>
          )}

          {rol === 'admin' && (
            <>
              <span onClick={() => navegarA('admin_panel')}>PANEL</span>
              <span onClick={() => navegarA('admin_menu')}>GESTIÓN MENÚ</span>
              <span onClick={() => navegarA('reservas')}>GESTIÓN RESERVAS</span>
            </>
          )}

          {user && (
            <span onClick={() => auth.signOut()} style={{ fontWeight: 'bold', color: '#8b2323' }}>
              SALIR
            </span>
          )}
        </nav>
      </header>

      <main className="content-filler">
        {seccion === 'inicio' && rol !== 'admin' && (
          <div className="view-container">
            <h2 className="section-title">Bienvenido a Tsinghe</h2>
            <div className="placeholder-content">
              <p>Espacio reservado para el Carrusel de imágenes.</p>
            </div>
          </div>
        )}

        {seccion === 'carta' && rol !== 'admin' && <CartaView />}
        {seccion === 'nosotros' && !user && <NosotrosView />}
        {seccion === 'login' && !user && <LoginView />}
        
        {seccion === 'reservas' && (rol === 'comensal' || rol === 'admin') && <ReservasView />}
        {seccion === 'admin_panel' && rol === 'admin' && <AdminPanelView />}
        {seccion === 'admin_menu' && rol === 'admin' && <GestionMenuView />}
      </main>

      <footer className="footer-main">
        <p>© 2026 Tsinghe Cocina Fusión - TFG DAM</p>
      </footer>
    </div>
  )
}

export default App