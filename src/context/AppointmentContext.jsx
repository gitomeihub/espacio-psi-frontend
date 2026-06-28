// Importamos funciones necesarias para crear y usar contexto en React.
import { createContext, useContext, useEffect, useState } from 'react'

// Importamos los turnos iniciales simulados.
import mockAppointments from '../data/mockAppointments'

// Horarios generales de atención.
// Se reutilizan para validar bloqueos por rango de horario.
export const AVAILABLE_TIMES = [
  '09:00',
  '10:30',
  '14:00',
  '16:30',
  '18:00',
]

// Creamos el contexto que compartirá turnos y disponibilidad.
const AppointmentContext = createContext()

// Devuelve la fecha actual en formato YYYY-MM-DD.
function getToday() {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// Convierte una fecha YYYY-MM-DD en el día de la semana.
// 0 = domingo, 6 = sábado.
function getDayOfWeek(date) {
  const [year, month, day] = date.split('-').map(Number)

  return new Date(year, month - 1, day).getDay()
}

// Revisa si una fecha está dentro de un período, inclusive.
function isDateInRange(date, startDate, endDate) {
  return date >= startDate && date <= endDate
}

// Revisa si dos períodos se cruzan.
function rangesOverlap(startA, endA, startB, endB) {
  return startA <= endB && startB <= endA
}

// Devuelve la posición de un horario dentro del array AVAILABLE_TIMES.
function getTimeIndex(time) {
  return AVAILABLE_TIMES.indexOf(time)
}

// Revisa si un horario está dentro de un rango horario, inclusive.
function isTimeInRange(time, startTime, endTime) {
  const timeIndex = getTimeIndex(time)
  const startIndex = getTimeIndex(startTime)
  const endIndex = getTimeIndex(endTime)

  return (
    timeIndex !== -1 &&
    startIndex !== -1 &&
    endIndex !== -1 &&
    timeIndex >= startIndex &&
    timeIndex <= endIndex
  )
}

// Lee un array guardado en localStorage sin romper la app si hubiera un error.
function getStoredArray(key) {
  try {
    const savedData = localStorage.getItem(key)

    return savedData ? JSON.parse(savedData) : null
  } catch {
    return null
  }
}

// Proveedor que guarda y comparte turnos, bloqueos y configuración semanal.
export function AppointmentProvider({ children }) {
  // Turnos registrados en la aplicación.
  const [appointments, setAppointments] = useState(() => {
    const savedAppointments = getStoredArray('espacioPsiAppointments')

    return savedAppointments || mockAppointments
  })

  /*
    Bloqueos de días completos por período.

    Ejemplo:
    {
      id,
      startDate: '2026-07-10',
      endDate: '2026-07-24',
      reason: 'Vacaciones'
    }
  */
  const [blockedDateRanges, setBlockedDateRanges] = useState(() => {
    const savedRanges = getStoredArray('espacioPsiBlockedDateRanges')

    if (savedRanges) {
      return savedRanges
    }

    /*
      Conservamos bloqueos creados con la versión anterior:
      antes se guardaban como { date, reason }.
    */
    const oldBlockedDates = getStoredArray('espacioPsiBlockedDates')

    if (oldBlockedDates) {
      return oldBlockedDates.map((blockedDate) => ({
        id: blockedDate.id,
        startDate: blockedDate.date,
        endDate: blockedDate.date,
        reason: blockedDate.reason,
      }))
    }

    return []
  })

  /*
    Bloqueos de horarios por período.

    Ejemplo:
    {
      id,
      startDate: '2026-07-15',
      endDate: '2026-07-18',
      startTime: '09:00',
      endTime: '14:00',
      reason: 'Capacitación'
    }
  */
  const [blockedTimeRanges, setBlockedTimeRanges] = useState(() => {
    const savedRanges = getStoredArray('espacioPsiBlockedTimeRanges')

    if (savedRanges) {
      return savedRanges
    }

    /*
      Conservamos bloqueos puntuales creados con la versión anterior:
      antes se guardaban como { date, time, reason }.
    */
    const oldBlockedSlots = getStoredArray('espacioPsiBlockedSlots')

    if (oldBlockedSlots) {
      return oldBlockedSlots.map((blockedSlot) => ({
        id: blockedSlot.id,
        startDate: blockedSlot.date,
        endDate: blockedSlot.date,
        startTime: blockedSlot.time,
        endTime: blockedSlot.time,
        reason: blockedSlot.reason,
      }))
    }

    return []
  })

  /*
    Define si la profesional atiende los sábados.

    Por defecto queda en false.
  */
  const [saturdayEnabled, setSaturdayEnabled] = useState(() => {
    try {
      const savedSaturdaySetting = localStorage.getItem(
        'espacioPsiSaturdayEnabled',
      )

      return savedSaturdaySetting
        ? JSON.parse(savedSaturdaySetting)
        : false
    } catch {
      return false
    }
  })

  // Guardamos los turnos cada vez que se modifican.
  useEffect(() => {
    localStorage.setItem(
      'espacioPsiAppointments',
      JSON.stringify(appointments),
    )
  }, [appointments])

  // Guardamos los períodos de días bloqueados.
  useEffect(() => {
    localStorage.setItem(
      'espacioPsiBlockedDateRanges',
      JSON.stringify(blockedDateRanges),
    )
  }, [blockedDateRanges])

  // Guardamos los períodos de horarios bloqueados.
  useEffect(() => {
    localStorage.setItem(
      'espacioPsiBlockedTimeRanges',
      JSON.stringify(blockedTimeRanges),
    )
  }, [blockedTimeRanges])

  // Guardamos la decisión sobre atención los sábados.
  useEffect(() => {
    localStorage.setItem(
      'espacioPsiSaturdayEnabled',
      JSON.stringify(saturdayEnabled),
    )
  }, [saturdayEnabled])

  /*
    Devuelve información sobre la disponibilidad general de una fecha.

    Todavía no analiza horarios concretos; solo revisa:
    - domingo;
    - sábado deshabilitado;
    - período de días bloqueados.
  */
  function getDateAvailabilityStatus(date) {
    if (!date) {
      return {
        available: false,
        message: 'Seleccioná una fecha para consultar disponibilidad.',
      }
    }

    const dayOfWeek = getDayOfWeek(date)

    // Domingo: siempre cerrado.
    if (dayOfWeek === 0) {
      return {
        available: false,
        message: 'Los domingos no hay atención.',
      }
    }

    // Sábado: depende de la configuración de la administradora.
    if (dayOfWeek === 6 && !saturdayEnabled) {
      return {
        available: false,
        message: 'La atención los sábados se encuentra deshabilitada.',
      }
    }

    // Revisamos si la fecha pertenece a un período bloqueado.
    const dateRange = blockedDateRanges.find((blockedRange) =>
      isDateInRange(
        date,
        blockedRange.startDate,
        blockedRange.endDate,
      ),
    )

    if (dateRange) {
      return {
        available: false,
        message: `Esta fecha está bloqueada: ${dateRange.reason}`,
      }
    }

    return {
      available: true,
      message: '',
    }
  }

  /*
    Verifica si un horario está disponible.

    appointmentIdToIgnore se usa al reprogramar:
    permite ignorar el propio turno que se está editando.
  */
  function isSlotAvailable(date, time, appointmentIdToIgnore = null) {
    const dateStatus = getDateAvailabilityStatus(date)

    // Si el día no está disponible, ningún horario lo estará.
    if (!dateStatus.available) {
      return false
    }

    // Revisamos bloqueos por período de fecha y rango horario.
    const blockedByTimeRange = blockedTimeRanges.some(
      (blockedRange) =>
        isDateInRange(
          date,
          blockedRange.startDate,
          blockedRange.endDate,
        ) &&
        isTimeInRange(
          time,
          blockedRange.startTime,
          blockedRange.endTime,
        ),
    )

    if (blockedByTimeRange) {
      return false
    }

    // Revisamos si existe un turno confirmado en esa fecha y horario.
    const occupiedSlot = appointments.some(
      (appointment) =>
        appointment.id !== appointmentIdToIgnore &&
        appointment.date === date &&
        appointment.time === time &&
        appointment.estado !== 'Cancelado',
    )

    return !occupiedSlot
  }

  // Crea un nuevo turno si el horario continúa disponible.
  function createAppointment(appointmentData) {
    const slotIsAvailable = isSlotAvailable(
      appointmentData.date,
      appointmentData.time,
    )

    if (!slotIsAvailable) {
      return {
        success: false,
        message:
          'El horario seleccionado ya no está disponible. Elegí otro horario.',
      }
    }

    const newAppointment = {
      id: crypto.randomUUID(),
      ...appointmentData,
      estado: 'Confirmado',
      pago: 'Pendiente',
    }

    setAppointments((currentAppointments) => [
      ...currentAppointments,
      newAppointment,
    ])

    return {
      success: true,
      appointment: newAppointment,
    }
  }

  // Cambia el estado de un turno a Cancelado.
  function cancelAppointment(appointmentId) {
    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, estado: 'Cancelado' }
          : appointment,
      ),
    )
  }

  // Reprograma un turno existente.
  function rescheduleAppointment(appointmentId, newDate, newTime) {
    const appointmentToReschedule = appointments.find(
      (appointment) => appointment.id === appointmentId,
    )

    if (!appointmentToReschedule) {
      return {
        success: false,
        message: 'No se encontró el turno que querés reprogramar.',
      }
    }

    if (appointmentToReschedule.estado === 'Cancelado') {
      return {
        success: false,
        message: 'No podés reprogramar un turno cancelado.',
      }
    }

    const slotIsAvailable = isSlotAvailable(
      newDate,
      newTime,
      appointmentId,
    )

    if (!slotIsAvailable) {
      return {
        success: false,
        message:
          'El horario seleccionado ya está ocupado o bloqueado. Elegí otro horario.',
      }
    }

    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment.id === appointmentId
          ? {
              ...appointment,
              date: newDate,
              time: newTime,
            }
          : appointment,
      ),
    )

    return {
      success: true,
      message: 'Tu turno fue reprogramado correctamente.',
    }
  }

  // Marca un turno como pagado desde el panel profesional.
  function markAppointmentAsPaid(appointmentId) {
    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, pago: 'Pagado' }
          : appointment,
      ),
    )
  }

  /*
    Bloquea un período de días completos.

    Si inicio y fin coinciden, bloquea un único día.
  */
  function blockDateRange(startDate, endDate, reason) {
    const today = getToday()

    if (!startDate || !endDate) {
      return {
        success: false,
        message: 'Seleccioná una fecha de inicio y una fecha de fin.',
      }
    }

    if (startDate < today || endDate < today) {
      return {
        success: false,
        message: 'No podés bloquear fechas anteriores a hoy.',
      }
    }

    if (startDate > endDate) {
      return {
        success: false,
        message:
          'La fecha de inicio no puede ser posterior a la fecha de fin.',
      }
    }

    // Evitamos superponer dos bloqueos de día completo.
    const overlapsExistingRange = blockedDateRanges.some((blockedRange) =>
      rangesOverlap(
        startDate,
        endDate,
        blockedRange.startDate,
        blockedRange.endDate,
      ),
    )

    if (overlapsExistingRange) {
      return {
        success: false,
        message:
          'El período seleccionado se superpone con otro bloqueo de días.',
      }
    }

    // No permitimos bloquear si existen turnos confirmados dentro del período.
    const hasActiveAppointments = appointments.some(
      (appointment) =>
        appointment.estado !== 'Cancelado' &&
        isDateInRange(
          appointment.date,
          startDate,
          endDate,
        ),
    )

    if (hasActiveAppointments) {
      return {
        success: false,
        message:
          'No podés bloquear este período porque existen turnos confirmados. Primero cancelalos o reprogramalos.',
      }
    }

    const newBlockedRange = {
      id: crypto.randomUUID(),
      startDate,
      endDate,
      reason: reason.trim() || 'Sin motivo especificado',
    }

    setBlockedDateRanges((currentRanges) => [
      ...currentRanges,
      newBlockedRange,
    ])

    return {
      success: true,
      message: 'El período de días fue bloqueado correctamente.',
    }
  }

  // Elimina un bloqueo de días completos.
  function unblockDateRange(blockedRangeId) {
    setBlockedDateRanges((currentRanges) =>
      currentRanges.filter((blockedRange) => blockedRange.id !== blockedRangeId),
    )
  }

  /*
    Bloquea un período de horarios.

    Si se repite la misma fecha y hora, bloquea únicamente ese horario puntual.
  */
  function blockTimeRange(
    startDate,
    endDate,
    startTime,
    endTime,
    reason,
  ) {
    const today = getToday()

    if (!startDate || !endDate || !startTime || !endTime) {
      return {
        success: false,
        message:
          'Seleccioná fecha desde/hasta y horario desde/hasta para continuar.',
      }
    }

    if (startDate < today || endDate < today) {
      return {
        success: false,
        message: 'No podés bloquear horarios en fechas anteriores a hoy.',
      }
    }

    if (startDate > endDate) {
      return {
        success: false,
        message:
          'La fecha de inicio no puede ser posterior a la fecha de fin.',
      }
    }

    if (getTimeIndex(startTime) > getTimeIndex(endTime)) {
      return {
        success: false,
        message:
          'El horario de inicio no puede ser posterior al horario de fin.',
      }
    }

    /*
      Si existe un bloqueo completo de días dentro del mismo período,
      no hace falta agregar un bloqueo horario adicional.
    */
    const overlapsBlockedDateRange = blockedDateRanges.some((blockedRange) =>
      rangesOverlap(
        startDate,
        endDate,
        blockedRange.startDate,
        blockedRange.endDate,
      ),
    )

    if (overlapsBlockedDateRange) {
      return {
        success: false,
        message:
          'El período elegido incluye días completos ya bloqueados. Ajustá las fechas o habilitá esos días primero.',
      }
    }

    // Evitamos rangos horarios superpuestos.
    const overlapsExistingTimeRange = blockedTimeRanges.some(
      (blockedRange) =>
        rangesOverlap(
          startDate,
          endDate,
          blockedRange.startDate,
          blockedRange.endDate,
        ) &&
        rangesOverlap(
          getTimeIndex(startTime),
          getTimeIndex(endTime),
          getTimeIndex(blockedRange.startTime),
          getTimeIndex(blockedRange.endTime),
        ),
    )

    if (overlapsExistingTimeRange) {
      return {
        success: false,
        message:
          'El período horario seleccionado se superpone con otro bloqueo existente.',
      }
    }

    // No permitimos bloquear horarios con turnos confirmados.
    const hasActiveAppointments = appointments.some(
      (appointment) =>
        appointment.estado !== 'Cancelado' &&
        isDateInRange(
          appointment.date,
          startDate,
          endDate,
        ) &&
        isTimeInRange(
          appointment.time,
          startTime,
          endTime,
        ),
    )

    if (hasActiveAppointments) {
      return {
        success: false,
        message:
          'No podés bloquear este horario porque existen turnos confirmados dentro del período.',
      }
    }

    const newBlockedRange = {
      id: crypto.randomUUID(),
      startDate,
      endDate,
      startTime,
      endTime,
      reason: reason.trim() || 'Sin motivo especificado',
    }

    setBlockedTimeRanges((currentRanges) => [
      ...currentRanges,
      newBlockedRange,
    ])

    return {
      success: true,
      message: 'El período horario fue bloqueado correctamente.',
    }
  }

  // Elimina un bloqueo de horario.
  function unblockTimeRange(blockedRangeId) {
    setBlockedTimeRanges((currentRanges) =>
      currentRanges.filter((blockedRange) => blockedRange.id !== blockedRangeId),
    )
  }

  /*
    Habilita o deshabilita la atención los sábados.

    Si existen turnos confirmados futuros un sábado, no permite deshabilitarlo
    hasta que esos turnos sean cancelados o reprogramados.
  */
  function updateSaturdayEnabled(enabled) {
    if (!enabled) {
      const today = getToday()

      const hasFutureSaturdayAppointments = appointments.some(
        (appointment) =>
          appointment.estado !== 'Cancelado' &&
          appointment.date >= today &&
          getDayOfWeek(appointment.date) === 6,
      )

      if (hasFutureSaturdayAppointments) {
        return {
          success: false,
          message:
            'No podés deshabilitar los sábados porque existen turnos confirmados. Primero cancelalos o reprogramalos.',
        }
      }
    }

    setSaturdayEnabled(Boolean(enabled))

    return {
      success: true,
      message: enabled
        ? 'La atención los sábados fue habilitada.'
        : 'La atención los sábados fue deshabilitada.',
    }
  }

  // Datos y funciones disponibles en toda la aplicación.
  const value = {
    appointments,
    blockedDateRanges,
    blockedTimeRanges,
    saturdayEnabled,
    createAppointment,
    cancelAppointment,
    rescheduleAppointment,
    markAppointmentAsPaid,
    isSlotAvailable,
    getDateAvailabilityStatus,
    blockDateRange,
    unblockDateRange,
    blockTimeRange,
    unblockTimeRange,
    updateSaturdayEnabled,
  }

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  )
}

// Hook personalizado para usar el contexto fácilmente.
export function useAppointments() {
  const context = useContext(AppointmentContext)

  if (!context) {
    throw new Error(
      'useAppointments debe usarse dentro de AppointmentProvider',
    )
  }

  return context
}