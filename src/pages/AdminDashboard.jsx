// Impor del hook para obtener el usuario que inició sesión.
import { useAuth } from '../context/AuthContext'

// Import los turnos y la función para actualizar el estado de pago.
import { useAppointments } from '../context/AppointmentContext'

import { Link } from 'react-router-dom'

// Panel principal de la psicóloga administradora.
function AdminDashboard() {
  // Usuario administrador actualmente logueado.
  const { user, users } = useAuth()

  // Obtenemos los turnos y la función para registrar pagos.
 // Obtenemos turnos, pagos y cancelación desde el contexto.
    const {
        appointments,
        markAppointmentAsPaid,
        cancelAppointment,
    } = useAppointments()

  // Turnos que no fueron cancelados.
  const activeAppointments = appointments.filter(
    (appointment) => appointment.estado !== 'Cancelado',
  )

  // Turnos que todavía no fueron abonados.
  const pendingPayments = activeAppointments.filter(
    (appointment) => appointment.pago === 'Pendiente',
  )

  // Turnos que ya fueron marcados como pagados.
  const paidAppointments = activeAppointments.filter(
    (appointment) => appointment.pago === 'Pagado',
  )

  // Ordenamos los turnos por fecha y horario.
  const sortedAppointments = [...appointments].sort((firstAppointment, secondAppointment) => {
    const firstDateTime = `${firstAppointment.date} ${firstAppointment.time}`
    const secondDateTime = `${secondAppointment.date} ${secondAppointment.time}`

    return firstDateTime.localeCompare(secondDateTime)
  })

  // Convierte una fecha como 2026-06-30 a 30/06/2026.
  function formatDate(date) {
    const [year, month, day] = date.split('-')

    return `${day}/${month}/${year}`
  }
    /*
    Filtramos solamente los usuarios con rol paciente.

    La administradora también está dentro del array users,
    pero no debe aparecer en la lista de pacientes.
  */
  const patientUsers = users.filter(
    (currentUser) => currentUser.rol === 'paciente',
  )

  /*
    Devuelve un resumen de turnos para un paciente determinado.

    Así, desde la interfaz podemos mostrar cuántos turnos tiene,
    cuántos siguen activos y cuántos fueron abonados.
  */
  function getPatientSummary(patientId) {
    // Turnos que pertenecen al paciente recibido.
    const patientAppointments = appointments.filter(
      (appointment) => appointment.patientId === patientId,
    )

    // Turnos que todavía no fueron cancelados.
    const activePatientAppointments = patientAppointments.filter(
      (appointment) => appointment.estado !== 'Cancelado',
    )

    // Turnos que fueron marcados como pagados.
    const paidPatientAppointments = patientAppointments.filter(
      (appointment) => appointment.pago === 'Pagado',
    )

    return {
      total: patientAppointments.length,
      active: activePatientAppointments.length,
      paid: paidPatientAppointments.length,
    }
  }
    // Permite que la profesional cancele un turno desde la agenda.
        function handleAdminCancel(appointmentId, patientName) {
        const confirmed = window.confirm(
             `¿Seguro que querés cancelar el turno de ${patientName}?`,
     )

  if (confirmed) {
    cancelAppointment(appointmentId)
  }
}
  return (
    <main className="dashboard-page">
      <section className="dashboard-welcome">
        <p className="eyebrow">Panel profesional</p>

        <h1>Hola, {user?.nombre}</h1>

        <p>
          Desde este panel podés consultar la agenda, gestionar los pagos y
          revisar la información de cada turno reservado.
        </p>

        <Link to="/disponibilidad" className="btn btn-primary admin-availability-link">
          Gestionar disponibilidad
        </Link>
      </section>

      {/* Resumen general de la agenda */}
      <section className="admin-summary">
        <article className="stat-card">
          <span className="stat-label">Turnos activos</span>
          <strong className="stat-number">
            {activeAppointments.length}
          </strong>
        </article>

        <article className="stat-card">
          <span className="stat-label">Pagos pendientes</span>
          <strong className="stat-number">
            {pendingPayments.length}
          </strong>
        </article>

        <article className="stat-card">
          <span className="stat-label">Sesiones cobradas</span>
          <strong className="stat-number">
            {paidAppointments.length}
          </strong>
        </article>
      </section>

      {/* Gestión básica de pacientes registrados */}
      <section className="patients-section">
        <div className="patients-header">
          <div>
            <p className="eyebrow">Gestión de pacientes</p>
            <h2>Pacientes registrados</h2>
          </div>

          <span className="patients-total">
            {patientUsers.length} pacientes
          </span>
        </div>

        {/* 
          Si no hubiera pacientes registrados, mostramos un mensaje.
          Si existen, creamos una tarjeta por cada paciente.
        */}
        {patientUsers.length === 0 ? (
          <div className="empty-state">
            <h3>Todavía no hay pacientes registrados</h3>

            <p>
              Cuando una persona cree una cuenta desde Registro, aparecerá en
              esta sección.
            </p>
          </div>
        ) : (
          <div className="patients-grid">
            {patientUsers.map((patient) => {
              // Obtenemos el resumen de turnos del paciente actual.
              const summary = getPatientSummary(patient.id)

              return (
                <article className="patient-card" key={patient.id}>
                  <div className="patient-card-header">
                    <div className="patient-avatar">
                      {patient.nombre.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h3>{patient.nombre}</h3>
                      <p className="patient-email">{patient.email}</p>
                    </div>
                  </div>

                  <div className="patient-stats">
                    <div className="patient-stat">
                      <span>Turnos totales</span>
                      <strong>{summary.total}</strong>
                    </div>

                    <div className="patient-stat">
                      <span>Turnos activos</span>
                      <strong>{summary.active}</strong>
                    </div>

                    <div className="patient-stat">
                      <span>Sesiones pagadas</span>
                      <strong>{summary.paid}</strong>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Agenda completa de la psicóloga */}
      <section className="appointments-section">
        <div className="appointments-header">
          <div>
            <p className="eyebrow">Agenda centralizada</p>
            <h2>Turnos reservados</h2>
          </div>
        </div>

        {/* Si no existen turnos, mostramos un mensaje */}
        {sortedAppointments.length === 0 ? (
          <div className="empty-state">
            <h3>Todavía no hay turnos registrados</h3>

            <p>
              Cuando una paciente reserve una sesión, el turno aparecerá en
              esta agenda.
            </p>
          </div>
        ) : (
          <div className="admin-appointments-grid">
            {/* Creamos una tarjeta por cada turno */}
            {sortedAppointments.map((appointment) => (
              <article
                className="admin-appointment-card"
                key={appointment.id}
              >
                <div className="appointment-card-header">
                  <span className="appointment-date">
                    {formatDate(appointment.date)}
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
                  <strong>Paciente:</strong> {appointment.patientName}
                </p>

                <p>
                  <strong>Modalidad:</strong> {appointment.modality}
                </p>

                <p>
                  <strong>Motivo:</strong> {appointment.reason}
                </p>

                <p>
                  <strong>Pago:</strong>{' '}
                  <span
                    className={
                      appointment.pago === 'Pagado'
                        ? 'payment payment-paid'
                        : 'payment payment-pending'
                    }
                  >
                    {appointment.pago}
                  </span>
                </p>

                {/* Acciones disponibles solo para turnos confirmados */}
{appointment.estado === 'Confirmado' && (
  <div className="admin-appointment-actions">
    {/* Solo mostramos pago si todavía está pendiente */}
    {appointment.pago === 'Pendiente' && (
      <button
        type="button"
        className="btn btn-payment"
        onClick={() => markAppointmentAsPaid(appointment.id)}
      >
        Marcar como pagado
      </button>
    )}

    {/* La profesional puede cancelar el turno */}
    <button
      type="button"
      className="btn btn-admin-cancel"
      onClick={() =>
        handleAdminCancel(appointment.id, appointment.patientName)
      }
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

export default AdminDashboard