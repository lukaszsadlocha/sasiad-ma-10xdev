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

// Booking types
export enum BookingStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  InProgress = 3,
  Returned = 4
}

export interface Booking {
  id: number;
  itemId: number;
  itemName: string;
  itemPhotoUrl?: string;

  borrowerId: string;
  borrowerName: string;
  borrowerAvatarUrl?: string;

  ownerId: string;
  ownerName: string;
  ownerAvatarUrl?: string;

  requestedFrom: string; // ISO date string
  requestedTo: string;

  borrowerNote?: string;
  rejectionReason?: string;

  status: BookingStatus;

  handedOverAt?: string;
  returnedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  itemId: number;
  requestedFrom: string; // ISO date string
  requestedTo: string;
  borrowerNote?: string;
}

export interface RejectBookingRequest {
  reason?: string;
}

// Message types
export interface Message {
  id: number;
  conversationId: number;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string; // ISO date string
}

export interface Conversation {
  id: number;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastMessageContent?: string;
  lastMessageSentAt?: string;
}

export interface ConversationDetail {
  id: number;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatarUrl?: string;
  messages: Message[];
}

export interface SendMessageRequest {
  recipientId: string;
  content: string;
}

// User Profile types
export interface UserProfile {
  id: string;
  email: string;
  preferredName: string;
  avatarUrl?: string;
  emailNotificationsEnabled: boolean;
  communityId?: number;
  communityName?: string;
}

export interface UpdateUserSettingsRequest {
  emailNotificationsEnabled: boolean;
}
