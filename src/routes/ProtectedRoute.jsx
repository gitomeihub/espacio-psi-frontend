// Navigate permite redirigir a otra ruta sin necesidad de hacer clic.
import { Navigate } from 'react-router-dom'

// Importamos el contexto de autenticación para saber
// si hay una sesión iniciada y qué rol tiene el usuario.
import { useAuth } from '../context/AuthContext'

// Componente que protege una ruta privada.
// Recibe:
// - children: la pantalla que queremos proteger.
// - allowedRole: el rol que puede acceder a esa pantalla.
function ProtectedRoute({ children, allowedRole }) {
  // Obtenemos la sesión actual desde AuthContext.
  const { user, isAuthenticated } = useAuth()

  // Si no hay un usuario logueado, lo enviamos al login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Si hay un rol permitido y el usuario no coincide,
  // lo redirigimos a su propio panel.
  if (allowedRole && user.rol !== allowedRole) {
    const userPanel = user.rol === 'admin' ? '/admin' : '/paciente'

    return <Navigate to={userPanel} replace />
  }

  // Si tiene sesión y el rol correcto, puede ver la página protegida.
  return children
}

export default ProtectedRoute