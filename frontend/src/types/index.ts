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

// Item types
export enum ItemStatus {
  Available = 0,
  Borrowed = 1,
  Unavailable = 2
}

export interface Item {
  id: number;
  name: string;
  category: string;
  description: string;
  photoUrl?: string;
  status: ItemStatus;
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl?: string;
  communityId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemRequest {
  name: string;
  category: string;
  description: string;
}

export interface UpdateItemStatusRequest {
  status: ItemStatus;
}

// Available categories for items (from PRD)
export const ITEM_CATEGORIES = [
  'Narzędzia ogrodowe',
  'Narzędzia budowlane',
  'Sprzęt dziecięcy',
  'Sport',
  'Elektronika',
  'Książki',
  'Kuchnia',
  'Inne'
] as const;

export type ItemCategory = typeof ITEM_CATEGORIES[number];
