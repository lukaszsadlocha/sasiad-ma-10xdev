import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { communityApi, ApiError } from '../lib/api';
import type { Community } from '../types';

export function JoinCommunityPage() {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadCommunity();
  }, [token]);

  const loadCommunity = async () => {
    if (!token) {
      setError('Brak tokenu zaproszenia');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await communityApi.getCommunityByInviteToken(token);
      setCommunity(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError('Link zaproszeniowy jest nieprawidłowy lub wygasł');
      } else {
        setError('Nie udało się pobrać informacji o społeczności');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!token) return;

    try {
      setIsJoining(true);
      setError('');
      const result = await communityApi.joinCommunity(token);
      setSuccess(result.message);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Nie udało się dołączyć do społeczności');
      }
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (error && !community) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
          <Link
            to="/dashboard"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Przejdź do panelu
          </Link>
        </div>
      </div>
    );
  }

  if (!community) {
    return null;
  }

  // User not logged in - show login/register options
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Zaproszenie do społeczności
            </h2>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-lg font-medium text-blue-900">
                {community.name}
              </p>
              {community.description && (
                <p className="mt-2 text-sm text-blue-700">
                  {community.description}
                </p>
              )}
              <p className="mt-2 text-xs text-blue-600">
                Administrator: {community.adminName}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-center text-gray-600">
              Aby dołączyć do społeczności, musisz się zalogować lub zarejestrować
            </p>

            <Link
              to={`/register?inviteToken=${token}`}
              className="block w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center"
            >
              Zarejestruj się
            </Link>

            <Link
              to={`/login?inviteToken=${token}`}
              className="block w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center"
            >
              Zaloguj się
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // User is logged in
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Dołącz do społeczności
          </h2>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-lg font-medium text-blue-900">
              {community.name}
            </p>
            {community.description && (
              <p className="mt-2 text-sm text-blue-700">
                {community.description}
              </p>
            )}
            <div className="mt-3 space-y-1 text-xs text-blue-600">
              <p>Administrator: {community.adminName}</p>
              <p>Liczba członków: {community.membersCount}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleJoin}
            disabled={isJoining}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? 'Dołączanie...' : 'Dołącz do społeczności'}
          </button>

          <Link
            to="/dashboard"
            className="block w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center"
          >
            Anuluj
          </Link>
        </div>
      </div>
    </div>
  );
}
