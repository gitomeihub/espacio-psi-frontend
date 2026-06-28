// Importamos Link para navegar sin recargar la aplicación.
// useNavigate permite redirigir por código, por ejemplo luego de cerrar sesión.
import { Link, useNavigate } from 'react-router-dom'

// Importamos el contexto para saber si hay un usuario logueado
// y para poder ejecutar la función logout.
import { useAuth } from '../context/AuthContext'

// Componente de encabezado principal.
function Header() {
  // Obtenemos la información de sesión desde AuthContext.
  const { user, logout, isAuthenticated } = useAuth()

  // Hook que permite cambiar de página desde una función.
  const navigate = useNavigate()

  // Según el rol, define a qué panel debe ir el botón "Mi panel".
  const panelRoute = user?.rol === 'admin' ? '/admin' : '/paciente'

  // Función que se ejecuta al presionar "Cerrar sesión".
  function handleLogout() {
    // Borra el usuario del estado y de localStorage.
    logout()

    // Luego de cerrar sesión, vuelve al inicio.
    navigate('/')
  }

  return (
    <header className="header">
      <div className="container header-content">
        {/* Logo: lleva a la página principal */}
        <Link to="/" className="logo">
          ESPACIO <span>PSI</span>
        </Link>

        {/* Menú principal de la landing */}
        <nav className="nav">
          <Link to="/">Inicio</Link>
          <a href="/#sobre-mi">Sobre mí</a>
          <a href="/#modalidades">Modalidades</a>
          <a href="/#turnos">Turnos</a>
          <a href="/#contacto">Contacto</a>
        </nav>

        {/* 
          Si hay sesión iniciada, mostramos información del usuario,
          acceso a su panel y el botón de cerrar sesión.
          
          Si no hay sesión, mostramos solamente "Iniciar sesión".
        */}
        {isAuthenticated ? (
          <div className="session-actions">
            <span className="user-greeting">
              Hola, {user.nombre.split(' ')[0]}
            </span>

            <Link to={panelRoute} className="btn btn-outline">
              Mi panel
            </Link>

            <button
              type="button"
              className="btn btn-logout"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-outline">
            Iniciar sesión
          </Link>
        )}
      </div>
    </header>
  )
}

export default Header