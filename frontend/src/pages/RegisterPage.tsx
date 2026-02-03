import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirige automatiquement vers /login
    // car l'inscription et la connexion utilisent le même flux OAuth
    navigate('/login', { replace: true })
  }, [navigate])

  return null
}
