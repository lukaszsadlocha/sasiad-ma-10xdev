import { useEffect, useState } from 'react'

interface HealthResponse {
  status: string
  message: string
  timestamp: string
  environment: string
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

  useEffect(() => {
    const checkBackend = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${apiUrl}/health`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setHealth(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect to backend')
      } finally {
        setLoading(false)
      }
    }

    checkBackend()
  }, [apiUrl])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sąsiad-Ma
          </h1>
          <p className="text-gray-600">
            Wypożyczaj przedmioty od sąsiadów
          </p>
        </div>

        {/* Backend Status Card */}
        <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🔌</span>
            Backend Connection Status
          </h2>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-2xl mr-3">❌</span>
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-1">
                    Connection Failed
                  </h3>
                  <p className="text-red-600 text-sm mb-2">{error}</p>
                  <p className="text-xs text-red-500">
                    Make sure the backend is running at: <code className="bg-red-100 px-1 py-0.5 rounded">{apiUrl}</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {health && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-2xl mr-3">✅</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">
                    Backend is Running!
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold text-green-700">{health.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Environment:</span>
                      <span className="font-semibold text-indigo-600">{health.environment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Timestamp:</span>
                      <span className="font-mono text-xs text-gray-700">
                        {new Date(health.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white rounded border border-green-200">
                    <p className="text-sm text-gray-700 italic">
                      {health.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Micro-MVP • Version 0.1</p>
          <p className="mt-1">Frontend: React + Vite + TypeScript • Backend: .NET 8</p>
        </div>
      </div>
    </div>
  )
}

export default App
