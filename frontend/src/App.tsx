import { useState, useEffect } from 'react'

function App() {
  const [backendStatus, setBackendStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://localhost:3001/health')
      .then(res => res.json())
      .then(data => {
        setBackendStatus(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏥 Kiné Booking
          </h1>
          <p className="text-gray-600 mb-8">
            Plateforme de réservation pour kinésithérapeutes
          </p>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
              <h2 className="font-semibold text-blue-900 mb-1">Frontend Status</h2>
              <p className="text-blue-700">✅ Vite + React + TypeScript + Tailwind</p>
            </div>

            <div className={`border-l-4 p-4 rounded ${
              loading ? 'border-yellow-500 bg-yellow-50' : 
              error ? 'border-red-500 bg-red-50' : 
              'border-green-500 bg-green-50'
            }`}>
              <h2 className={`font-semibold mb-1 ${
                loading ? 'text-yellow-900' : 
                error ? 'text-red-900' : 
                'text-green-900'
              }`}>
                Backend Status
              </h2>
              
              {loading && <p className="text-yellow-700">⏳ Connexion au backend...</p>}
              
              {error && (
                <div className="text-red-700">
                  <p>❌ Erreur de connexion</p>
                  <p className="text-sm mt-1">Assure-toi que le backend tourne sur le port 3001</p>
                </div>
              )}
              
              {backendStatus && (
                <div className="text-green-700">
                  <p>✅ {backendStatus.message}</p>
                  <p className="text-sm mt-1">Port: 3001</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Stack technique :</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-medium">Frontend:</span> Vite + React
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-medium">Backend:</span> NestJS
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-medium">Database:</span> PostgreSQL
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-medium">Container:</span> Docker
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
