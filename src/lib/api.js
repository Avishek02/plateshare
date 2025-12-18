import axios from 'axios'
import { auth } from './firebase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000'
})

api.interceptors.request.use(async config => {
  const current = auth.currentUser
  if (current) {
    const token = await current.getIdToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export default api
