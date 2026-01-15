import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingApi } from '../../lib/api';
import { CreateBookingRequest } from '../../types';

const bookingSchema = z.object({
  requestedFrom: z.string().min(1, 'Data od jest wymagana'),
  requestedTo: z.string().min(1, 'Data do jest wymagana'),
  borrowerNote: z.string().max(200, 'Notatka nie może przekraczać 200 znaków').optional(),
}).refine((data) => {
  if (data.requestedFrom && data.requestedTo) {
    const from = new Date(data.requestedFrom);
    const to = new Date(data.requestedTo);
    return to > from;
  }
  return true;
}, {
  message: 'Data do musi być później niż data od',
  path: ['requestedTo'],
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingModalProps {
  itemId: number;
  itemName: string;
  ownerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingModal({
  itemId,
  itemName,
  ownerName,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = async (data: BookingFormData) => {
    try {
      setLoading(true);
      setError(null);

      const bookingRequest: CreateBookingRequest = {
        itemId,
        requestedFrom: new Date(data.requestedFrom).toISOString(),
        requestedTo: new Date(data.requestedTo).toISOString(),
        borrowerNote: data.borrowerNote,
      };

      await bookingApi.createBooking(bookingRequest);
      setSuccess(true);

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Nie udało się utworzyć rezerwacji');
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = (fromDate: string) => {
    if (!fromDate) return '';
    const from = new Date(fromDate);
    const max = new Date(from);
    max.setDate(max.getDate() + 14);
    return max.toISOString().split('T')[0];
  };

  const fromDateValue = (document.querySelector('input[name="requestedFrom"]') as HTMLInputElement)?.value || '';
  const maxDate = getMaxDate(fromDateValue);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        {success ? (
          <div className="text-center">
            <div className="mb-4 text-green-600">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Rezerwacja wysłana!</h3>
            <p className="text-gray-600">
              Wiadomość do {ownerName} została wysłana. Czekaj na odpowiedź.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">Rezerwuj: {itemName}</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data od
                </label>
                <input
                  type="date"
                  {...register('requestedFrom')}
                  min={getTodayDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.requestedFrom && (
                  <p className="mt-1 text-sm text-red-600">{errors.requestedFrom.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data do (maksymalnie +14 dni)
                </label>
                <input
                  type="date"
                  {...register('requestedTo')}
                  min={fromDateValue || getTodayDate()}
                  max={maxDate || undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.requestedTo && (
                  <p className="mt-1 text-sm text-red-600">{errors.requestedTo.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wiadomość dla właściciela (opcjonalna)
                </label>
                <textarea
                  {...register('borrowerNote')}
                  placeholder="np. Potrzebuję na dzisiaj do 18:00"
                  maxLength={200}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.borrowerNote && (
                  <p className="mt-1 text-sm text-red-600">{errors.borrowerNote.message}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Wysyłam...' : 'Wyślij prośbę'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
