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
