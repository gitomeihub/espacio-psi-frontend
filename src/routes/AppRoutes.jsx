import ProtectedRoute from './ProtectedRoute'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'

import PatientDashboard from '../pages/PatientDashboard'
import AdminDashboard from '../pages/AdminDashboard'
import BookAppointment from '../pages/BookAppointment'
import RescheduleAppointment from '../pages/RescheduleAppointment'
import Availability from '../pages/Availability'

function AppRoutes() {
  return (
    <Routes>
      {/* Página pública principal */}
      <Route path="/" element={<Home />} />

      {/* Páginas públicas de acceso */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      {/* Panel exclusivo de la psicóloga administradora */}
      <Route
         path="/admin"
         element={
           <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
           </ProtectedRoute>
       }
    />
    
        {/* Configuración privada: solamente para la administradora */}
        <Route
         path="/disponibilidad"
         element={
            <ProtectedRoute allowedRole="admin">
              <Availability />
            </ProtectedRoute>
       }
    />

      {/* Panel para pacientes */}
      <Route
         path="/paciente"
         element={
            <ProtectedRoute allowedRole="paciente">
              <PatientDashboard />
            </ProtectedRoute>
       }
    />

      {/* Pantalla donde el paciente reserva un nuevo turno */}
       <Route
         path="/reservar-turno"
         element={
          <ProtectedRoute allowedRole="paciente">
           <BookAppointment />
          </ProtectedRoute>
       }
    />
    {/* Reprogramación privada: solamente para pacientes */}
         <Route
         path="/reprogramar-turno/:appointmentId"
         element={
           <ProtectedRoute allowedRole="paciente">
             <RescheduleAppointment />
           </ProtectedRoute>
     }
    />

      {/* Ruta de respaldo para direcciones inexistentes */}
      <Route path="*" element={<Home />} />
    </Routes>
  )
}

export default AppRoutes