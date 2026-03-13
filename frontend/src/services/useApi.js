import { useAuth } from "@clerk/react"
import { authApi } from "./api"
import { useCallback } from "react"

export function useApi() {
  const { getToken } = useAuth()

  const getApi = useCallback(async () => {
    const token = await getToken()
    return authApi(token)
  }, [getToken])

  return { getApi }
}