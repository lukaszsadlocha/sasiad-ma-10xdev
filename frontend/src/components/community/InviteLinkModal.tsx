import { useState, useEffect } from 'react';
import { communityApi, ApiError } from '../../lib/api';
import type { InviteLinkResponse } from '../../types';

interface InviteLinkModalProps {
  communityId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function InviteLinkModal({ communityId, isOpen, onClose }: InviteLinkModalProps) {
  const [inviteLink, setInviteLink] = useState<InviteLinkResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && !inviteLink) {
      generateLink();
    }
  }, [isOpen]);

  const generateLink = async () => {
    try {
      setIsLoading(true);
      setError('');
      const link = await communityApi.generateInviteLink(communityId);
      setInviteLink(link);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Nie udało się wygenerować linku');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink.fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Nie udało się skopiować linku');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Link zaproszeniowy
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Generowanie linku...</p>
          </div>
        ) : inviteLink ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link zaproszeniowy:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink.fullUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {copied ? '✓ Skopiowano' : 'Kopiuj'}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Informacja:</strong> Link jest ważny bezterminowo i może być używany wielokrotnie.
                Udostępnij go swoim sąsiadom, aby mogli dołączyć do społeczności.
              </p>
            </div>

            <div className="text-xs text-gray-500">
              Utworzono: {new Date(inviteLink.createdAt).toLocaleString('pl-PL')}
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
