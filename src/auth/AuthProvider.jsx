import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import api from '../lib/api'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, current => {
      setUser(current)
      setLoading(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    const interceptor = api.interceptors.request.use(async config => {
      const current = auth.currentUser
      if (current) {
        const token = await current.getIdToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    })
    return () => api.interceptors.request.eject(interceptor)
  }, [])

  const value = {
    user,
    loading,
    signOut: () => signOut(auth)
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
