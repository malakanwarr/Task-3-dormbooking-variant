
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>   // still checking the token, don't decide yet
  if (!user) return <Navigate to="/login" replace />
  return children
}