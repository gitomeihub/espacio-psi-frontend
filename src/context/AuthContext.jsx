// Importamos funciones de React necesarias para crear y usar contexto.
import { createContext, useContext, useEffect, useState } from 'react'

// Importamos los usuarios iniciales simulados.
import mockUsers from '../data/mockUsers'

// Creamos el contexto que compartirá datos de autenticación
// con toda la aplicación.
const AuthContext = createContext()

// Proveedor principal de autenticación.
export function AuthProvider({ children }) {
  // Guardamos todos los usuarios disponibles en la aplicación.
  // Si ya hay usuarios registrados en localStorage, los usamos.
  // Si no, comenzamos con los usuarios simulados.
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('espacioPsiUsers')

    return savedUsers ? JSON.parse(savedUsers) : mockUsers
  })

  // Guardamos el usuario que tiene sesión iniciada.
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('espacioPsiUser')

    return savedUser ? JSON.parse(savedUser) : null
  })

  // Cada vez que cambia la lista de usuarios, la guardamos.
  useEffect(() => {
    localStorage.setItem('espacioPsiUsers', JSON.stringify(users))
  }, [users])

  // Cada vez que cambia la sesión actual, actualizamos localStorage.
  useEffect(() => {
    if (user) {
      localStorage.setItem('espacioPsiUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('espacioPsiUser')
    }
  }, [user])

  // Busca un usuario según email y contraseña.
  function login(email, password) {
    const foundUser = users.find(
      (currentUser) =>
        currentUser.email.toLowerCase() === email.toLowerCase() &&
        currentUser.password === password,
    )

    // Si las credenciales no coinciden, no se inicia sesión.
    if (!foundUser) {
      return null
    }

    // No guardamos la contraseña dentro de la sesión actual.
    const { password: userPassword, ...userWithoutPassword } = foundUser

    setUser(userWithoutPassword)

    return userWithoutPassword
  }

  // Registra un nuevo usuario con rol paciente.
  function register(nombre, email, password) {
    // Normalizamos el email para evitar duplicados con mayúsculas/minúsculas.
    const normalizedEmail = email.trim().toLowerCase()

    // Verificamos si ya existe una cuenta con ese correo.
    const emailAlreadyExists = users.some(
      (currentUser) =>
        currentUser.email.toLowerCase() === normalizedEmail,
    )

    if (emailAlreadyExists) {
      return {
        success: false,
        message: 'Ya existe una cuenta registrada con ese correo electrónico.',
      }
    }

    // Creamos el nuevo paciente.
    const newUser = {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      email: normalizedEmail,
      password,
      rol: 'paciente',
    }

    // Agregamos el nuevo usuario al listado general.
    setUsers((currentUsers) => [...currentUsers, newUser])

    // Creamos la sesión sin incluir la contraseña.
    const { password: userPassword, ...userWithoutPassword } = newUser

    setUser(userWithoutPassword)

    return {
      success: true,
      user: userWithoutPassword,
    }
  }

  // Elimina la sesión actual.
  function logout() {
    setUser(null)
  }

  // Datos y funciones disponibles en toda la aplicación.
  const value = {
    user,
    users,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook personalizado para acceder al contexto fácilmente.
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return context
}