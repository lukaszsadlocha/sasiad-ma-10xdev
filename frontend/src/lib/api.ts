const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  // Add auth token if available
  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Community API functions
import type {
  Community,
  CreateCommunityRequest,
  InviteLinkResponse,
  JoinCommunityResponse
} from '../types';

export const communityApi = {
  createCommunity: (data: CreateCommunityRequest) =>
    apiRequest<Community>('/communities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyCommunity: () =>
    apiRequest<Community>('/communities/my'),

  generateInviteLink: (communityId: number) =>
    apiRequest<InviteLinkResponse>(`/communities/${communityId}/invite-link`, {
      method: 'POST',
    }),

  joinCommunity: (token: string) =>
    apiRequest<JoinCommunityResponse>(`/communities/join/${token}`, {
      method: 'POST',
    }),

  getCommunityByInviteToken: (token: string) =>
    apiRequest<Community>(`/communities/invite/${token}`),
};

// Item API functions
import type {
  Item,
  CreateItemRequest,
  ItemStatus,
  UpdateItemStatusRequest
} from '../types';

export const itemApi = {
  createItem: async (data: CreateItemRequest, photo?: File): Promise<Item> => {
    const url = `${API_BASE_URL}/items`;
    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('category', data.category);
    formData.append('description', data.description);

    if (photo) {
      formData.append('photo', photo);
    }

    const token = localStorage.getItem('accessToken');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(response.status, error.error || `HTTP ${response.status}`);
    }

    return response.json();
  },

  getCommunityItems: () =>
    apiRequest<Item[]>('/items'),

  getMyItems: () =>
    apiRequest<Item[]>('/items/my'),

  getItemById: (id: number) =>
    apiRequest<Item>(`/items/${id}`),

  updateItemStatus: (id: number, status: ItemStatus) =>
    apiRequest<Item>(`/items/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Booking API functions
import type {
  Booking,
  CreateBookingRequest,
  RejectBookingRequest
} from '../types';

export const bookingApi = {
  createBooking: (data: CreateBookingRequest) =>
    apiRequest<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyBookings: () =>
    apiRequest<Booking[]>('/bookings/my'),

  getBookingsForMyItems: () =>
    apiRequest<Booking[]>('/bookings/my-items'),

  approveBooking: (bookingId: number) =>
    apiRequest<Booking>(`/bookings/${bookingId}/approve`, {
      method: 'PATCH',
    }),

  rejectBooking: (bookingId: number, data: RejectBookingRequest) =>
    apiRequest<Booking>(`/bookings/${bookingId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  confirmHandOver: (bookingId: number) =>
    apiRequest<Booking>(`/bookings/${bookingId}/hand-over`, {
      method: 'PATCH',
    }),

  confirmReturn: (bookingId: number) =>
    apiRequest<Booking>(`/bookings/${bookingId}/return`, {
      method: 'PATCH',
    }),
};

// Message API functions
import type {
  Message,
  Conversation,
  ConversationDetail,
  SendMessageRequest
} from '../types';

export const messageApi = {
  getMyConversations: () =>
    apiRequest<Conversation[]>('/messages/conversations'),

  getConversationWithUser: (otherUserId: string) =>
    apiRequest<ConversationDetail>(`/messages/conversations/${otherUserId}`),

  sendMessage: (data: SendMessageRequest) =>
    apiRequest<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
