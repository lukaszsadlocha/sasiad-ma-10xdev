import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { communityApi, ApiError } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const createCommunitySchema = z.object({
  name: z.string()
    .min(1, 'Nazwa społeczności jest wymagana')
    .max(100, 'Nazwa nie może przekraczać 100 znaków'),
  description: z.string()
    .max(300, 'Opis nie może przekraczać 300 znaków')
    .optional(),
});

type CreateCommunityFormData = z.infer<typeof createCommunitySchema>;

export function CreateCommunityPage() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCommunityFormData>({
    resolver: zodResolver(createCommunitySchema),
  });

  const onSubmit = async (data: CreateCommunityFormData) => {
    try {
      setError('');
      setSuccess('');

      const community = await communityApi.createCommunity(data);

      // Update user's communityId in auth context
      updateUser({ communityId: community.id });

      setSuccess('Społeczność została utworzona!');

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Wystąpił błąd. Spróbuj ponownie.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Utwórz społeczność
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Stwórz społeczność dla swojego osiedla i zaproś sąsiadów
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nazwa społeczności *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                placeholder="np. Osiedle Słoneczne"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Opis (opcjonalny)
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={3}
                placeholder="Krótki opis społeczności..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Maksymalnie 300 znaków
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Tworzenie...' : 'Utwórz społeczność'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
