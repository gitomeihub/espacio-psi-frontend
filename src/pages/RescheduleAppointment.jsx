// useState guarda los datos seleccionados en el formulario.
import { useState } from 'react'

// useParams obtiene el id del turno desde la URL.
// useNavigate permite volver al panel luego de reprogramar.
// Navigate permite redirigir si el turno no existe.
import {
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom'

// Obtenemos el usuario actualmente logueado.
import { useAuth } from '../context/AuthContext'

// Obtenemos los turnos y las funciones relacionadas.
import { useAppointments } from '../context/AppointmentContext'

// Horarios de atención simulados.
const availableTimes = ['09:00', '10:30', '14:00', '16:30', '18:00']

// Devuelve la fecha actual en formato YYYY-MM-DD.
function getToday() {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// Pantalla para modificar fecha y horario de un turno.
function RescheduleAppointment() {
  // Obtenemos el id que viene desde la URL.
  const { appointmentId } = useParams()

  // Obtenemos el paciente logueado.
  const { user } = useAuth()

  // Obtenemos los turnos y las funciones necesarias.
  const {
    appointments,
    isSlotAvailable,
    rescheduleAppointment,
  } = useAppointments()

  // Permite volver al panel luego de guardar.
  const navigate = useNavigate()

  /*
    Buscamos el turno correspondiente al id de la URL.

    También verificamos que pertenezca a la paciente logueada,
    para evitar que una paciente modifique un turno ajeno.
  */
  const appointment = appointments.find(
    (currentAppointment) =>
      currentAppointment.id === appointmentId &&
      currentAppointment.patientId === user.id,
  )

  // Fecha mínima permitida.
  const today = getToday()

  // Inicializamos el formulario con la fecha y hora actuales del turno.
  const [date, setDate] = useState(appointment?.date ?? '')
  const [time, setTime] = useState(appointment?.time ?? '')

  // Mensajes de error o éxito.
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  /*
    Mostramos solo horarios disponibles para la fecha elegida.

    Ignoramos el propio turno para que su horario actual
    siga apareciendo como una opción válida.
  */
  const availableTimesForSelectedDate = date
    ? availableTimes.filter((availableTime) =>
        isSlotAvailable(date, availableTime, appointmentId),
      )
    : []

  // Si el turno no existe o ya fue cancelado, volvemos al panel.
  if (!appointment || appointment.estado === 'Cancelado') {
    return <Navigate to="/paciente" replace />
  }

  // Se ejecuta cuando cambia la fecha.
  function handleDateChange(event) {
    setDate(event.target.value)

    // Limpiamos la hora anterior, porque puede no estar disponible
    // en la nueva fecha seleccionada.
    setTime('')

    setError('')
  }

  // Se ejecuta al enviar el formulario.
  function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSuccessMessage('')

    // Validación adicional de fecha.
    if (date < today) {
      setError('No podés seleccionar una fecha anterior a hoy.')
      return
    }

    // Validamos que exista un horario seleccionado.
    if (!time) {
      setError('Seleccioná un horario disponible para continuar.')
      return
    }

    // Intentamos reprogramar el turno.
    const result = rescheduleAppointment(
      appointment.id,
      date,
      time,
    )

    // Si el horario fue ocupado o hay otro error, lo mostramos.
    if (!result.success) {
      setError(result.message)
      setTime('')
      return
    }

    // Mostramos confirmación.
    setSuccessMessage(result.message)

    // Luego de un segundo, volvemos al panel de paciente.
    setTimeout(() => {
      navigate('/paciente')
    }, 1000)
  }

  return (
    <main className="booking-page">
      <section className="booking-card">
        <p className="eyebrow">Gestión de turnos</p>

        <h1>Reprogramá tu turno</h1>

        <p className="booking-description">
          Elegí una nueva fecha y horario disponible para tu sesión.
        </p>

        {/* Información del turno que se está modificando */}
        <div className="current-appointment-info">
          <p>
            <strong>Turno actual:</strong> {appointment.date} a las{' '}
            {appointment.time} hs
          </p>

          <p>
            <strong>Modalidad:</strong> {appointment.modality}
          </p>

          <p>
            <strong>Motivo:</strong> {appointment.reason}
          </p>

          <p className="current-appointment-note">
            La modalidad, el motivo de consulta y el estado de pago se
            conservarán al reprogramar.
          </p>
        </div>

        {/* Formulario de reprogramación */}
        <form className="booking-form" onSubmit={handleSubmit}>
          <label>
            Nueva fecha

            <input
              type="date"
              min={today}
              value={date}
              onChange={handleDateChange}
              required
            />
          </label>

          <label>
            Nuevo horario disponible

            <select
              value={time}
              onChange={(event) => setTime(event.target.value)}
              disabled={!date || availableTimesForSelectedDate.length === 0}
              required
            >
              <option value="">
                {!date
                  ? 'Primero seleccioná una fecha'
                  : availableTimesForSelectedDate.length === 0
                    ? 'No hay horarios disponibles'
                    : 'Seleccioná un horario'}
              </option>

              {availableTimesForSelectedDate.map((availableTime) => (
                <option key={availableTime} value={availableTime}>
                  {availableTime} hs
                </option>
              ))}
            </select>
          </label>

          {/* Aviso cuando no quedan horarios para una fecha */}
          {date && availableTimesForSelectedDate.length === 0 && (
            <p className="availability-message">
              No quedan horarios disponibles para la fecha seleccionada.
              Elegí otro día.
            </p>
          )}

          {/* Mensajes del formulario */}
          {error && <p className="form-error">{error}</p>}

          {successMessage && (
            <p className="form-success">{successMessage}</p>
          )}

          <button type="submit" className="btn btn-primary">
            Confirmar reprogramación
          </button>
        </form>
      </section>
    </main>
  )
}

export default RescheduleAppointment