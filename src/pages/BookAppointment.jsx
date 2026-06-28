// useState permite guardar los valores escritos o seleccionados
// dentro del formulario de reserva.
import { useState } from 'react'

// useNavigate permite volver al panel del paciente luego de reservar.
import { useNavigate } from 'react-router-dom'

// Obtenemos la información del paciente que inició sesión.
import { useAuth } from '../context/AuthContext'

// Obtenemos las funciones relacionadas con turnos.
import { useAppointments } from '../context/AppointmentContext'

// Horarios de atención simulados.
//
// Más adelante, la administradora podrá administrar esta disponibilidad
// desde su propio panel.
const availableTimes = ['09:00', '10:30', '14:00', '16:30', '18:00']

// Devuelve la fecha actual en formato YYYY-MM-DD.
//
// Usamos este formato porque es el que necesita el input type="date".
function getToday() {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// Pantalla donde una paciente puede reservar un nuevo turno.
function BookAppointment() {
  // Usuario actualmente logueado.
  const { user } = useAuth()

  // Funciones para crear turnos y verificar si un horario está libre.
  const { createAppointment, isSlotAvailable } = useAppointments()

  // Permite redirigir a otra pantalla luego de reservar.
  const navigate = useNavigate()

  // Fecha mínima permitida para el formulario.
  const today = getToday()

  // Estados que guardan la información ingresada por la paciente.
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [modality, setModality] = useState('Online')
  const [reason, setReason] = useState('')

  // Estados para mensajes de error o de confirmación.
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  /*
    Generamos la lista de horarios disponibles para la fecha elegida.

    Si todavía no se eligió una fecha, mostramos un array vacío.
    Si ya se eligió, filtramos los horarios que no estén ocupados.
  */
  const availableTimesForSelectedDate = date
    ? availableTimes.filter((availableTime) =>
        isSlotAvailable(date, availableTime),
      )
    : []

  // Se ejecuta cuando la paciente cambia la fecha.
  function handleDateChange(event) {
    // Guardamos la nueva fecha.
    setDate(event.target.value)

    // Limpiamos el horario anterior porque puede no estar disponible
    // en la nueva fecha seleccionada.
    setTime('')

    // También limpiamos cualquier error anterior.
    setError('')
  }

  // Se ejecuta al enviar el formulario.
  function handleSubmit(event) {
    // Evita que el navegador recargue toda la página.
    event.preventDefault()

    // Limpiamos mensajes de intentos anteriores.
    setError('')
    setSuccessMessage('')

    // Validación adicional, aunque el input ya tiene min={today}.
    if (date < today) {
      setError('No podés reservar un turno en una fecha anterior a hoy.')
      return
    }

    // Verificamos que la paciente haya elegido un horario.
    if (!time) {
      setError('Seleccioná un horario disponible para continuar.')
      return
    }

    // Verificamos nuevamente que ese horario siga libre.
    if (!isSlotAvailable(date, time)) {
      setError(
        'El horario seleccionado ya no está disponible. Elegí otro horario.',
      )
      setTime('')
      return
    }

    // Intentamos crear el turno.
    const result = createAppointment({
      patientId: user.id,
      patientName: user.nombre,
      date,
      time,
      modality,
      reason,
    })

    // Si el contexto detecta que el horario fue ocupado, mostramos el error.
    if (!result.success) {
      setError(result.message)
      setTime('')
      return
    }

    // Confirmación visual luego de guardar correctamente.
    setSuccessMessage('Tu turno fue reservado correctamente.')

    // Después de un segundo, volvemos al panel de la paciente.
    setTimeout(() => {
      navigate('/paciente')
    }, 1000)
  }

  return (
    <main className="booking-page">
      <section className="booking-card">
        <p className="eyebrow">Reserva online</p>

        <h1>Reservá tu turno</h1>

        <p className="booking-description">
          Elegí una fecha, horario y modalidad de atención para confirmar tu
          próxima sesión.
        </p>

        {/* Formulario para crear un nuevo turno */}
        <form className="booking-form" onSubmit={handleSubmit}>
          <label>
            Fecha de la sesión

            <input
              type="date"
              min={today}
              value={date}
              onChange={handleDateChange}
              required
            />
          </label>

          <label>
            Horario disponible

            <select
              value={time}
              onChange={(event) => setTime(event.target.value)}
              disabled={!date || availableTimesForSelectedDate.length === 0}
              required
            >
              {/* Mensaje inicial según el estado de la fecha */}
              <option value="">
                {!date
                  ? 'Primero seleccioná una fecha'
                  : availableTimesForSelectedDate.length === 0
                    ? 'No hay horarios disponibles'
                    : 'Seleccioná un horario'}
              </option>

              {/* Mostramos únicamente los horarios libres de esa fecha */}
              {availableTimesForSelectedDate.map((availableTime) => (
                <option key={availableTime} value={availableTime}>
                  {availableTime} hs
                </option>
              ))}
            </select>
          </label>

          {/* Mensaje cuando todos los horarios de ese día están ocupados */}
          {date && availableTimesForSelectedDate.length === 0 && (
            <p className="availability-message">
              No quedan horarios disponibles para la fecha seleccionada.
              Elegí otro día.
            </p>
          )}

          <label>
            Modalidad de atención

            <select
              value={modality}
              onChange={(event) => setModality(event.target.value)}
            >
              <option value="Online">Online</option>
              <option value="Presencial">Presencial</option>
            </select>
          </label>

          <label>
            Motivo de consulta

            <textarea
              placeholder="Escribí brevemente el motivo de tu consulta..."
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows="4"
              required
            />
          </label>

          {/* Mensaje visible solo cuando existe un error */}
          {error && <p className="form-error">{error}</p>}

          {/* Mensaje visible solo cuando la reserva se realizó */}
          {successMessage && (
            <p className="form-success">{successMessage}</p>
          )}

          <button type="submit" className="btn btn-primary">
            Confirmar turno
          </button>
        </form>
      </section>
    </main>
  )
}

export default BookAppointment