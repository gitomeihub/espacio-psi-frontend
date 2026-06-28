// useState guarda lo que la persona escribe en el formulario.
import { useState } from 'react'

// Link permite navegar entre pantallas.
// useNavigate permite redirigir luego del registro.
import { Link, useNavigate } from 'react-router-dom'

// Importamos la función register desde el contexto.
import { useAuth } from '../context/AuthContext'

// Pantalla de registro de nuevos pacientes.
function Register() {
  // Estados para guardar los datos ingresados.
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Estados para mensajes de error o éxito.
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Permite navegar luego del registro.
  const navigate = useNavigate()

  // Obtenemos la función register desde AuthContext.
  const { register } = useAuth()

  // Se ejecuta al enviar el formulario.
  function handleSubmit(event) {
    // Evita que el navegador recargue la página.
    event.preventDefault()

    // Limpiamos mensajes anteriores.
    setError('')
    setSuccessMessage('')

    // Validación básica del nombre.
    if (name.trim().length < 3) {
      setError('Ingresá un nombre y apellido válidos.')
      return
    }

    // Validación básica de contraseña.
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    // Intentamos registrar al paciente.
    const result = register(name, email, password)

    // Si el email ya estaba usado, mostramos el mensaje.
    if (!result.success) {
      setError(result.message)
      return
    }

    // Confirmación visual.
    setSuccessMessage('Cuenta creada correctamente. Te llevamos a tu panel...')

    // Luego de un segundo, lo llevamos al panel del paciente.
    setTimeout(() => {
      navigate('/paciente')
    }, 1000)
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Creá tu cuenta</p>

        <h1>Registro de paciente</h1>

        <p className="auth-description">
          Completá tus datos para reservar y gestionar tus turnos desde el
          portal.
        </p>

        {/* Formulario de alta de paciente */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Nombre y apellido

            <input
              type="text"
              placeholder="Ejemplo: Ana Pérez"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

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
              placeholder="Creá una contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {/* Mensaje de error, solo se muestra cuando existe */}
          {error && <p className="form-error">{error}</p>}

          {/* Mensaje de confirmación luego de crear la cuenta */}
          {successMessage && (
            <p className="form-success">{successMessage}</p>
          )}

          <button type="submit" className="btn btn-primary">
            Crear cuenta
          </button>
        </form>

        <p className="auth-link">
          ¿Ya tenés una cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </section>
    </main>
  )
}

export default Register