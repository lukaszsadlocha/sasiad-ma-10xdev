export interface User {
  id: string;
  email: string;
  preferredName: string;
  communityId?: number;
  avatarUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  preferredName: string;
  acceptTerms: boolean;
  inviteToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Community types
export interface Community {
  id: number;
  name: string;
  description?: string;
  adminId: string;
  adminName: string;
  membersCount: number;
  createdAt: string;
}

export interface CreateCommunityRequest {
  name: string;
  description?: string;
}

export interface InviteLinkResponse {
  token: string;
  fullUrl: string;
  createdAt: string;
}

export interface JoinCommunityResponse {
  communityId: number;
  communityName: string;
  message: string;
}
