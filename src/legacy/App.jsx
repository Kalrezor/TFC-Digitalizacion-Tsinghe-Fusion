import './App.css'
import { useNavigation } from './control/NavigationController'
import CartaView from './view/CartaView'
import ReservasView from './view/ReservasView'
import LoginView from './view/LoginView'
import NosotrosView from './view/NosotrosView'

function App() {
  const { seccion, navegarA } = useNavigation();

  return (
    <div className="app-wrapper">
      <header className="navbar-main">
        <div className="logo" onClick={() => navegarA('inicio')}>
          Tsinghe Cocina Fusión
        </div>
        <nav className="nav-links">
          <span onClick={() => navegarA('carta')}>LA CARTA</span>
          <span onClick={() => navegarA('reservas')}>RESERVAR</span>
          <span onClick={() => navegarA('nosotros')}>NOSOTROS</span>
          <span onClick={() => navegarA('login')}>LOGIN</span>
        </nav>
      </header>

      <main className="content-filler">
        {seccion === 'inicio' && (
          <div className="view-container">
            <h2 className="section-title">Bienvenido a Tsinghe</h2>
            <div className="placeholder-content">
              <p>Espacio reservado para el Carrusel de imágenes y presentación principal.</p>
            </div>
          </div>
        )}

        {seccion === 'carta' && <CartaView />}
        {seccion === 'reservas' && <ReservasView />}
        {seccion === 'nosotros' && <NosotrosView />}
        {seccion === 'login' && <LoginView />}
      </main>

      <footer className="footer-main">
        <p>© 2026 Tsinghe Cocina Fusión - TFG DAM</p>
      </footer>
    </div>
  )
}

export default App