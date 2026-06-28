// useState permite guardar los valores de los formularios.
import { useState } from 'react'

// Link permite volver al panel de la profesional.
import { Link } from 'react-router-dom'

// Importamos horarios generales y funciones de disponibilidad.
import {
  AVAILABLE_TIMES,
  useAppointments,
} from '../context/AppointmentContext'

// Devuelve la fecha actual en formato YYYY-MM-DD.
function getToday() {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// Convierte una fecha YYYY-MM-DD en DD/MM/YYYY.
function formatDate(date) {
  const [year, month, day] = date.split('-')

  return `${day}/${month}/${year}`
}

// Muestra un período de fechas de forma más clara.
function formatDateRange(startDate, endDate) {
  if (startDate === endDate) {
    return formatDate(startDate)
  }

  return `${formatDate(startDate)} al ${formatDate(endDate)}`
}

// Muestra un período de horarios de forma más clara.
function formatTimeRange(startTime, endTime) {
  if (startTime === endTime) {
    return `${startTime} hs`
  }

  return `${startTime} a ${endTime} hs`
}

// Pantalla de configuración de disponibilidad para la profesional.
function Availability() {
  const today = getToday()

  const {
    blockedDateRanges,
    blockedTimeRanges,
    saturdayEnabled,
    blockDateRange,
    unblockDateRange,
    blockTimeRange,
    unblockTimeRange,
    updateSaturdayEnabled,
  } = useAppointments()

  // Estados para bloquear días completos.
  const [dayStartDate, setDayStartDate] = useState('')
  const [dayEndDate, setDayEndDate] = useState('')
  const [dayReason, setDayReason] = useState('')

  // Estados para bloquear horarios.
  const [timeStartDate, setTimeStartDate] = useState('')
  const [timeEndDate, setTimeEndDate] = useState('')
  const [timeStart, setTimeStart] = useState('')
  const [timeEnd, setTimeEnd] = useState('')
  const [timeReason, setTimeReason] = useState('')

  // Estados para mostrar mensajes de error o éxito.
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Ordenamos bloqueos para mostrarlos de forma cronológica.
  const sortedDateRanges = [...blockedDateRanges].sort((first, second) =>
    first.startDate.localeCompare(second.startDate),
  )

  const sortedTimeRanges = [...blockedTimeRanges].sort((first, second) => {
    const firstDateTime = `${first.startDate} ${first.startTime}`
    const secondDateTime = `${second.startDate} ${second.startTime}`

    return firstDateTime.localeCompare(secondDateTime)
  })

  /*
    Si se elige una fecha de inicio, completamos la fecha final
    con el mismo día cuando todavía no tiene valor.

    Así, para bloquear un día puntual, alcanza con elegir "desde".
  */
  function handleDayStartDateChange(event) {
    const newDate = event.target.value

    setDayStartDate(newDate)

    if (!dayEndDate || newDate > dayEndDate) {
      setDayEndDate(newDate)
    }
  }

  // Mismo comportamiento para los bloqueos por rango horario.
  function handleTimeStartDateChange(event) {
    const newDate = event.target.value

    setTimeStartDate(newDate)

    if (!timeEndDate || newDate > timeEndDate) {
      setTimeEndDate(newDate)
    }
  }

  /*
    Si se elige una hora de inicio, completamos la hora final
    con ese mismo horario cuando todavía no tiene valor.
  */
  function handleTimeStartChange(event) {
    const newTime = event.target.value

    setTimeStart(newTime)

    const currentEndIndex = AVAILABLE_TIMES.indexOf(timeEnd)
    const newStartIndex = AVAILABLE_TIMES.indexOf(newTime)

    if (!timeEnd || newStartIndex > currentEndIndex) {
      setTimeEnd(newTime)
    }
  }

  // Limpia mensajes anteriores antes de una nueva acción.
  function clearMessages() {
    setError('')
    setSuccessMessage('')
  }

  // Envía el formulario de bloqueo de días.
  function handleBlockDateRange(event) {
    event.preventDefault()

    clearMessages()

    const result = blockDateRange(
      dayStartDate,
      dayEndDate,
      dayReason,
    )

    if (!result.success) {
      setError(result.message)
      return
    }

    setSuccessMessage(result.message)
    setDayStartDate('')
    setDayEndDate('')
    setDayReason('')
  }

  // Envía el formulario de bloqueo de horarios.
  function handleBlockTimeRange(event) {
    event.preventDefault()

    clearMessages()

    const result = blockTimeRange(
      timeStartDate,
      timeEndDate,
      timeStart,
      timeEnd,
      timeReason,
    )

    if (!result.success) {
      setError(result.message)
      return
    }

    setSuccessMessage(result.message)
    setTimeStartDate('')
    setTimeEndDate('')
    setTimeStart('')
    setTimeEnd('')
    setTimeReason('')
  }

  // Habilita o deshabilita la atención los sábados.
  function handleSaturdayChange(event) {
    clearMessages()

    const result = updateSaturdayEnabled(event.target.checked)

    if (!result.success) {
      setError(result.message)
      return
    }

    setSuccessMessage(result.message)
  }

  // Pide confirmación antes de volver a habilitar un período de días.
  function handleUnblockDateRange(blockedRange) {
    const confirmed = window.confirm(
      `¿Querés habilitar el período ${formatDateRange(
        blockedRange.startDate,
        blockedRange.endDate,
      )}?`,
    )

    if (confirmed) {
      unblockDateRange(blockedRange.id)
    }
  }

  // Pide confirmación antes de volver a habilitar un período horario.
  function handleUnblockTimeRange(blockedRange) {
    const confirmed = window.confirm(
      `¿Querés habilitar el período ${formatDateRange(
        blockedRange.startDate,
        blockedRange.endDate,
      )}, de ${formatTimeRange(
        blockedRange.startTime,
        blockedRange.endTime,
      )}?`,
    )

    if (confirmed) {
      unblockTimeRange(blockedRange.id)
    }
  }

  /*
    Para el selector "hasta", mostramos solo horarios iguales
    o posteriores al horario de inicio.
  */
  const endTimeOptions = timeStart
    ? AVAILABLE_TIMES.filter(
        (availableTime) =>
          AVAILABLE_TIMES.indexOf(availableTime) >=
          AVAILABLE_TIMES.indexOf(timeStart),
      )
    : AVAILABLE_TIMES

  return (
    <main className="availability-page">
      <div className="container">
        <section className="availability-intro">
          <div>
            <p className="eyebrow">Panel profesional</p>

            <h1>Configuración de disponibilidad</h1>

            <p>
              Configurá la atención semanal y bloqueá períodos completos por
              vacaciones, feriados, capacitaciones o motivos personales.
            </p>
          </div>

          <Link to="/admin" className="btn btn-secondary">
            Volver al panel
          </Link>
        </section>

        {/* Reglas semanales de atención */}
        <section className="weekly-rules-card">
          <div>
            <p className="eyebrow">Agenda semanal</p>
            <h2>Reglas generales</h2>
          </div>

          <div className="weekly-rules-grid">
            <article className="weekly-rule weekly-rule-closed">
              <span>Domingos</span>
              <strong>Cerrado por defecto</strong>
              <p>Los domingos no se muestran horarios disponibles.</p>
            </article>

            <label className="weekly-rule saturday-toggle">
              <div>
                <span>Sábados</span>
                <strong>
                  {saturdayEnabled
                    ? 'Atención habilitada'
                    : 'Atención deshabilitada'}
                </strong>
                <p>
                  Al habilitarlo, se usan los mismos horarios generales de
                  atención.
                </p>
              </div>

              <input
                type="checkbox"
                checked={saturdayEnabled}
                onChange={handleSaturdayChange}
              />
            </label>
          </div>
        </section>

        {/* Mensajes generales */}
        {error && <p className="form-error availability-feedback">{error}</p>}

        {successMessage && (
          <p className="form-success availability-feedback">
            {successMessage}
          </p>
        )}

        <section className="availability-layout">
          {/* Bloqueo de días completos */}
          <article className="availability-card">
            <p className="eyebrow">Bloqueo general</p>

            <h2>Bloquear días completos</h2>

            <p className="availability-description">
              Ideal para vacaciones, feriados o períodos sin atención. Si
              elegís la misma fecha, se bloqueará un solo día.
            </p>

            <form
              className="availability-form"
              onSubmit={handleBlockDateRange}
            >
              <div className="availability-period-grid">
                <label>
                  Desde

                  <input
                    type="date"
                    min={today}
                    value={dayStartDate}
                    onChange={handleDayStartDateChange}
                    required
                  />
                </label>

                <label>
                  Hasta

                  <input
                    type="date"
                    min={dayStartDate || today}
                    value={dayEndDate}
                    onChange={(event) => setDayEndDate(event.target.value)}
                    required
                  />
                </label>
              </div>

              <label>
                Motivo del bloqueo

                <textarea
                  rows="3"
                  placeholder="Ejemplo: Vacaciones, feriado, asunto personal..."
                  value={dayReason}
                  onChange={(event) => setDayReason(event.target.value)}
                />
              </label>

              <button type="submit" className="btn btn-primary">
                Bloquear período
              </button>
            </form>
          </article>

          {/* Bloqueo de horarios */}
          <article className="availability-card">
            <p className="eyebrow">Bloqueo puntual</p>

            <h2>Bloquear horarios</h2>

            <p className="availability-description">
              Podés bloquear un horario puntual o varios horarios durante un
              período. Si repetís fecha y hora, será un único bloqueo.
            </p>

            <form
              className="availability-form"
              onSubmit={handleBlockTimeRange}
            >
              <div className="availability-period-grid">
                <label>
                  Fecha desde

                  <input
                    type="date"
                    min={today}
                    value={timeStartDate}
                    onChange={handleTimeStartDateChange}
                    required
                  />
                </label>

                <label>
                  Fecha hasta

                  <input
                    type="date"
                    min={timeStartDate || today}
                    value={timeEndDate}
                    onChange={(event) => setTimeEndDate(event.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="availability-period-grid">
                <label>
                  Horario desde

                  <select
                    value={timeStart}
                    onChange={handleTimeStartChange}
                    required
                  >
                    <option value="">Seleccioná un horario</option>

                    {AVAILABLE_TIMES.map((availableTime) => (
                      <option key={availableTime} value={availableTime}>
                        {availableTime} hs
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Horario hasta

                  <select
                    value={timeEnd}
                    onChange={(event) => setTimeEnd(event.target.value)}
                    required
                  >
                    <option value="">Seleccioná un horario</option>

                    {endTimeOptions.map((availableTime) => (
                      <option key={availableTime} value={availableTime}>
                        {availableTime} hs
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Motivo del bloqueo

                <textarea
                  rows="3"
                  placeholder="Ejemplo: Capacitación, reunión, pausa, trámite..."
                  value={timeReason}
                  onChange={(event) => setTimeReason(event.target.value)}
                />
              </label>

              <button type="submit" className="btn btn-primary">
                Bloquear horario
              </button>
            </form>
          </article>
        </section>

        {/* Listado de días bloqueados */}
        <section className="blocked-section">
          <div className="blocked-header">
            <div>
              <p className="eyebrow">Disponibilidad actual</p>
              <h2>Períodos de días bloqueados</h2>
            </div>

            <span className="blocked-total">
              {sortedDateRanges.length} bloqueos
            </span>
          </div>

          {sortedDateRanges.length === 0 ? (
            <div className="empty-state">
              <h3>No hay períodos bloqueados</h3>

              <p>
                Los días o períodos que bloquees aparecerán en esta sección.
              </p>
            </div>
          ) : (
            <div className="blocked-grid">
              {sortedDateRanges.map((blockedRange) => (
                <article className="blocked-card" key={blockedRange.id}>
                  <div>
                    <span className="blocked-type">Días completos</span>

                    <h3>
                      {formatDateRange(
                        blockedRange.startDate,
                        blockedRange.endDate,
                      )}
                    </h3>

                    <p>{blockedRange.reason}</p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-unblock"
                    onClick={() => handleUnblockDateRange(blockedRange)}
                  >
                    Habilitar período
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Listado de horarios bloqueados */}
        <section className="blocked-section">
          <div className="blocked-header">
            <div>
              <p className="eyebrow">Disponibilidad actual</p>
              <h2>Períodos horarios bloqueados</h2>
            </div>

            <span className="blocked-total">
              {sortedTimeRanges.length} bloqueos
            </span>
          </div>

          {sortedTimeRanges.length === 0 ? (
            <div className="empty-state">
              <h3>No hay períodos horarios bloqueados</h3>

              <p>
                Los horarios que bloquees aparecerán en esta sección.
              </p>
            </div>
          ) : (
            <div className="blocked-grid">
              {sortedTimeRanges.map((blockedRange) => (
                <article className="blocked-card" key={blockedRange.id}>
                  <div>
                    <span className="blocked-type">Horario</span>

                    <h3>
                      {formatDateRange(
                        blockedRange.startDate,
                        blockedRange.endDate,
                      )}
                    </h3>

                    <p className="blocked-range-line">
                      {formatTimeRange(
                        blockedRange.startTime,
                        blockedRange.endTime,
                      )}
                    </p>

                    <p>{blockedRange.reason}</p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-unblock"
                    onClick={() => handleUnblockTimeRange(blockedRange)}
                  >
                    Habilitar horario
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Availability