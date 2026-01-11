import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { communityApi, ApiError } from '../lib/api';
import { InviteLinkModal } from '../components/community/InviteLinkModal';
import type { Community } from '../types';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoadingCommunity, setIsLoadingCommunity] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (user?.communityId) {
      loadCommunity();
    } else {
      setIsLoadingCommunity(false);
    }
  }, [user]);

  const loadCommunity = async () => {
    try {
      const data = await communityApi.getMyCommunity();
      setCommunity(data);
    } catch (err) {
      // User doesn't have a community yet
      setCommunity(null);
    } finally {
      setIsLoadingCommunity(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = community && user && community.adminId === user.id;

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
        <div className="space-y-6">
          {/* Community Section */}
          {isLoadingCommunity ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ) : community ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{community.name}</h2>
                  {community.description && (
                    <p className="text-gray-600 mt-1">{community.description}</p>
                  )}
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Wygeneruj link zaproszeniowy
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Administrator</p>
                  <p className="text-lg font-medium text-gray-900">{community.adminName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Liczba członków</p>
                  <p className="text-lg font-medium text-gray-900">{community.membersCount}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Data utworzenia</p>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(community.createdAt).toLocaleDateString('pl-PL')}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Jesteś administratorem społeczności.</strong> Możesz generować linki zaproszeniowe i zarządzać społecznością.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Witaj w Sąsiad-Ma!</h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Nie należysz jeszcze do żadnej społeczności. Możesz utworzyć nową społeczność lub dołączyć do istniejącej za pomocą linku zaproszeniowego.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/create-community')}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Utwórz społeczność
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* User Info Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Twoje konto</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-600 mb-1">Email</dt>
                <dd className="text-gray-900 font-medium">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-gray-600 mb-1">Imię</dt>
                <dd className="text-gray-900 font-medium">{user?.preferredName}</dd>
              </div>
            </dl>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-lg">
            <p className="font-medium mb-2">Faza 2 - Społeczności została zaimplementowana! ✅</p>
            <p className="text-sm">
              Możesz teraz tworzyć społeczności, generować linki zaproszeniowe i dołączać do społeczności.
            </p>
            <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
              <li>Następna faza: Zarządzanie przedmiotami</li>
              <li>Później: System rezerwacji i komunikacja</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Invite Link Modal */}
      {community && (
        <InviteLinkModal
          communityId={community.id}
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}
