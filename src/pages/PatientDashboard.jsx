// Link permite navegar a la reserva sin recargar la aplicación.
import { Link } from 'react-router-dom'

// Obtenemos el usuario logueado.
import { useAuth } from '../context/AuthContext'

// Obtenemos los turnos y la función para cancelarlos.
import { useAppointments } from '../context/AppointmentContext'

// Panel principal del paciente.
function PatientDashboard() {
  // Usuario que inició sesión.
  const { user } = useAuth()

  // Lista general de turnos y función para cancelarlos.
  const { appointments, cancelAppointment } = useAppointments()

  // Filtramos para mostrar solamente los turnos del paciente actual.
  const patientAppointments = appointments.filter(
    (appointment) => appointment.patientId === user.id,
  )

  // Cancela un turno seleccionado.
  function handleCancel(appointmentId) {
    // Pedimos confirmación antes de cambiar el estado del turno.
    const confirmed = window.confirm(
      '¿Seguro que querés cancelar este turno?',
    )

    if (confirmed) {
      cancelAppointment(appointmentId)
    }
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-welcome">
        <p className="eyebrow">Portal del paciente</p>

        <h1>Hola, {user?.nombre}</h1>

        <p>
          Desde este espacio vas a poder reservar, consultar y gestionar tus
          turnos.
        </p>

        {/* Botón para comenzar una nueva reserva */}
        <Link to="/reservar-turno" className="btn btn-primary">
          Reservar nuevo turno
        </Link>
      </section>

      <section className="appointments-section">
        <div className="appointments-header">
          <div>
            <p className="eyebrow">Mis turnos</p>
            <h2>Próximas sesiones</h2>
          </div>
        </div>

        {/* 
          Si no hay turnos, mostramos un mensaje.
          Si existen, recorremos el array y creamos una tarjeta por turno.
        */}
        {patientAppointments.length === 0 ? (
          <div className="empty-state">
            <h3>Todavía no tenés turnos reservados</h3>
            <p>
              Podés elegir día, horario y modalidad desde el botón de reserva.
            </p>
          </div>
        ) : (
          <div className="appointments-grid">
            {patientAppointments.map((appointment) => (
              <article
                className="appointment-card"
                key={appointment.id}
              >
                <div className="appointment-card-header">
                  <span className="appointment-date">
                    {appointment.date}
                  </span>

                  <span
                    className={
                      appointment.estado === 'Cancelado'
                        ? 'status status-cancelled'
                        : 'status status-confirmed'
                    }
                  >
                    {appointment.estado}
                  </span>
                </div>

                <h3>{appointment.time} hs</h3>

                <p>
                  <strong>Modalidad:</strong> {appointment.modality}
                </p>

                <p>
                  <strong>Motivo:</strong> {appointment.reason}
                </p>

                <p>
                  <strong>Pago:</strong> {appointment.pago}
                </p>

                {/* Los turnos confirmados pueden reprogramarse o cancelarse */}
            {appointment.estado === 'Confirmado' && (
                <div className="appointment-actions">
                  <Link
                   to={`/reprogramar-turno/${appointment.id}`}
                   className="btn btn-reschedule"
                >
               Reprogramar turno
                 </Link>

                  <button
                   type="button"
                   className="btn btn-cancel"
                   onClick={() => handleCancel(appointment.id)}
                  >
                    Cancelar turno
                  </button>
                </div>
            )}      
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default PatientDashboard