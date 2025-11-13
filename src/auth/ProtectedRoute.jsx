import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div style={{ padding: 16 }}>Loading...</div>
  }

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
