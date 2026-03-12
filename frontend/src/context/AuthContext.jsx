import React, { createContext, useContext, useState, useEffect } from "react"
import api from "../services/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("cf_token")
    const role  = localStorage.getItem("cf_role")
    const name  = localStorage.getItem("cf_name")
    const id    = localStorage.getItem("cf_id")
    if (token) setUser({ token, role, name, id })
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password })
    const { token, role, name } = res.data
    const payload = JSON.parse(atob(token.split(".")[1]))
    localStorage.setItem("cf_token", token)
    localStorage.setItem("cf_role", role)
    localStorage.setItem("cf_name", name)
    localStorage.setItem("cf_id", payload.id)
    setUser({ token, role, name, id: payload.id })
    return role
  }

  const logout = () => { localStorage.clear(); setUser(null) }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
