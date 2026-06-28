// useState permite guardar los datos escritos en el formulario.
// useNavigate permite redirigir a otra pantalla después del login.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// Importamos el hook que creamos en AuthContext.
import { useAuth } from '../context/AuthContext'

// Pantalla de inicio de sesión.
function Login() {
  // Estado para guardar el email escrito por la persona.
  const [email, setEmail] = useState('')

  // Estado para guardar la contraseña escrita por la persona.
  const [password, setPassword] = useState('')

  // Estado para mostrar errores debajo del formulario.
  const [error, setError] = useState('')

  // Función para navegar a otra ruta de la aplicación.
  const navigate = useNavigate()

  // Obtenemos la función login desde el contexto.
  const { login } = useAuth()

  // Se ejecuta al enviar el formulario.
  function handleSubmit(event) {
    // Evita que la página se recargue al enviar el formulario.
    event.preventDefault()

    // Limpiamos un posible error anterior.
    setError('')

    // Validamos las credenciales contra los usuarios simulados.
    const loggedUser = login(email.trim(), password)

    // Si no encontramos un usuario válido, mostramos el mensaje.
    if (!loggedUser) {
      setError('El correo electrónico o la contraseña son incorrectos.')
      return
    }

    // Según el rol, llevamos a la persona a su panel correspondiente.
    if (loggedUser.rol === 'admin') {
      navigate('/admin')
    } else {
      navigate('/paciente')
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Bienvenida/o a ESPACIO PSI</p>

        <h1>Iniciar sesión</h1>

        <p className="auth-description">
          Ingresá con tus datos para gestionar tus turnos o acceder al panel
          profesional.
        </p>

        {/* Formulario de acceso */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Correo electrónico

            <input
              type="email"
              placeholder="nombre@correo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Contraseña

            <input
              type="password"
              placeholder="Ingresá tu contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {/* El mensaje solo se muestra cuando existe un error */}
          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary">
            Ingresar
          </button>
        </form>

        <p className="auth-link">
          ¿Todavía no tenés una cuenta?{' '}
          <Link to="/registro">Registrate</Link>
        </p>
      </section>
    </main>
  )
}

export default Login