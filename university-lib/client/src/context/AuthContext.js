import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

axios.defaults.withCredentials = true
axios.defaults.baseURL = 'http://localhost:5000'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user

  const fetchUser = async () => {
    try {
      const { data } = await axios.get('/api/auth/status')
      setUser(data)
    } catch (err) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password })
    await fetchUser()
    return data
  }

  const register = async (email, password) => {
    const { data } = await axios.post('/api/auth/register', { email, password })
    await fetchUser()
    return data
  }

  const logout = async () => {
    await axios.post('/api/auth/logout')
    setUser(null)
  }

  const value = useMemo(() => ({ user, isAuthenticated, loading, login, register, logout, fetchUser }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
