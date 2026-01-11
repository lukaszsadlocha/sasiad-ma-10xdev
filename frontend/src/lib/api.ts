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
