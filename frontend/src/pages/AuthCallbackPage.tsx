import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setTokens, authApi } from '../services/api'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setError(errorParam)
      return
    }

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken)
      authApi.getMe().then(user => {
        navigate(user.role === 'practitioner' ? '/practitioner' : '/dashboard', { replace: true })
      }).catch(() => {
        navigate('/dashboard', { replace: true })
      })
    } else {
      setError('Tokens manquants dans la reponse')
    }
  }, [searchParams, navigate])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Erreur de connexion</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retour a la connexion
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600">Connexion en cours...</p>
      </div>
    </div>
  )
}
