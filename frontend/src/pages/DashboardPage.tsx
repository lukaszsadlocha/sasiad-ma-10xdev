import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Sąsiad-Ma</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Witaj, <span className="font-medium">{user?.preferredName}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Wyloguj
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
              <p className="font-medium">Pomyślnie zalogowano!</p>
              <p className="text-sm mt-1">
                Faza 1 - Autentykacja została zaimplementowana. Backend i frontend są połączone.
              </p>
            </div>

            <div className="border border-gray-200 rounded p-4">
              <h3 className="font-medium text-gray-900 mb-2">Informacje o użytkowniku:</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-600">ID:</dt>
                  <dd className="text-gray-900 font-mono">{user?.id}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Email:</dt>
                  <dd className="text-gray-900">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Imię:</dt>
                  <dd className="text-gray-900">{user?.preferredName}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Community ID:</dt>
                  <dd className="text-gray-900">
                    {user?.communityId || <span className="text-gray-500 italic">Brak</span>}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
              <p className="font-medium">Następne kroki:</p>
              <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                <li>Faza 2: Implementacja społeczności</li>
                <li>Faza 3: Zarządzanie przedmiotami</li>
                <li>Faza 4: System rezerwacji</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
