import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000"
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = "/"
    }
    return Promise.reject(err)
  }
)

// Call this to get an api instance with Clerk token attached
export const authApi = (token) => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
    headers: { Authorization: `Bearer ${token}` }
  })
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) window.location.href = "/"
      return Promise.reject(err)
    }
  )
  return instance
}

export default api