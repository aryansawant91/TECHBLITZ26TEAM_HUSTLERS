import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth as useClerkAuth, useUser } from "@clerk/react"
import api from "../services/api"

const RoleContext = createContext(null)

export function RoleProvider({ children }) {
  const { isSignedIn, getToken } = useClerkAuth()
  const { user } = useUser()
  const [role, setRole] = useState(null)
  const [name, setName] = useState(null)
  const [mongoId, setMongoId] = useState(null)
  const [roleLoading, setRoleLoading] = useState(true)

  useEffect(() => {
    if (!isSignedIn || !user) {
      setRole(null)
      setName(null)
      setMongoId(null)
      setRoleLoading(false)
      return
    }

    const fetchRole = async () => {
      setRoleLoading(true)
      try {
        const token = await getToken()
        const email = user.primaryEmailAddress?.emailAddress
        const clerk_id = user.id

        // Check if user already exists in MongoDB
        try {
          const res = await api.get(`/auth/clerk-me?clerk_id=${clerk_id}&email=${email}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setRole(res.data.role)
          setName(res.data.name)
          setMongoId(res.data.id)
          sessionStorage.removeItem("pending_role")
          return
        } catch (err) {
          if (err.response?.status !== 404) throw err
        }

        // User not in MongoDB — check if they selected a role before signing in
        const pendingRole = sessionStorage.getItem("pending_role")
        if (pendingRole) {
          const res = await api.post("/auth/clerk-register", {
            clerk_id: clerk_id,
            email: email,
            name: user.fullName || user.firstName,
            role: pendingRole
          }, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setRole(pendingRole)
          setName(res.data.name)
          setMongoId(res.data.id)
          sessionStorage.removeItem("pending_role")
        } else {
          // No pending role — leave role as null (Landing will show role picker)
          setRole(null)
        }
      } catch (err) {
        console.error("Role fetch error:", err)
        setRole(null)
      } finally {
        setRoleLoading(false)
      }
    }

    fetchRole()
  }, [isSignedIn, user])

  const registerRole = async (selectedRole) => {
    const token = await getToken()
    const res = await api.post("/auth/clerk-register", {
      clerk_id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName || user.firstName,
      role: selectedRole
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setRole(selectedRole)
    setName(res.data.name)
    setMongoId(res.data.id)
    return selectedRole
  }

  return (
    <RoleContext.Provider value={{ role, name, mongoId, roleLoading, registerRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)