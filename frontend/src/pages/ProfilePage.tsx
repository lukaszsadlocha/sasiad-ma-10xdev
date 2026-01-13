import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { userApi, ApiError } from '../lib/api';
import type { UserProfile } from '../types';

export function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await userApi.getUserProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Nie udało się załadować profilu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailNotificationsChange = async (enabled: boolean) => {
    if (!profile) return;

    try {
      setIsSaving(true);
      setError('');
      setSuccessMessage('');

      const updatedProfile = await userApi.updateUserSettings({
        emailNotificationsEnabled: enabled
      });

      setProfile(updatedProfile);
      setSuccessMessage('Ustawienia zostały zapisane');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Nie udało się zaktualizować ustawień');
      }
      // Revert checkbox
      loadProfile();
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Ładowanie profilu...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Nie udało się załadować profilu</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Sąsiad-Ma</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Wyloguj
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Profil użytkownika</h2>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* User info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dane osobowe</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Imię</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.preferredName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.email}</dd>
                </div>
                {profile.communityName && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Społeczność</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile.communityName}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Notification settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ustawienia powiadomień</h3>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="email-notifications"
                      type="checkbox"
                      checked={profile.emailNotificationsEnabled}
                      onChange={(e) => handleEmailNotificationsChange(e.target.checked)}
                      disabled={isSaving}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="email-notifications" className="font-medium text-gray-700">
                      Otrzymuj powiadomienia email o nowych wiadomościach
                    </label>
                    <p className="text-gray-500 mt-1">
                      Gdy ktoś wyśle Ci wiadomość w czacie, otrzymasz powiadomienie na email.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Informacja:</strong> Powiadomienia o rezerwacjach (nowa prośba, akceptacja, odrzucenie)
                    są wysyłane zawsze i nie można ich wyłączyć.
                  </p>
                </div>
              </div>

              {/* Success/Error messages */}
              {successMessage && (
                <div className="mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
