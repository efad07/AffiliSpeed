
export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  isVerified?: boolean;
  isOnline?: boolean;
  lastSeen?: number;
  blockedUsers?: string[]; // IDs of users blocked by this user
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string; // For videos
  caption: string;
  affiliateLink?: string;
  affiliateLabel?: string;
  likes: number;
  comments: Comment[];
  timestamp: number;
  likedByMe: boolean;
}

export interface Story {
  id: string;
  userId: string;
  user: User;
  mediaUrl: string;
  type: 'image' | 'video';
  caption?: string;
  affiliateLink?: string;
  affiliateLabel?: string;
  expiresAt: number;
  viewed: boolean;
}

export interface GroupMember {
  userId: string;
  role: 'admin' | 'member';
  nickname?: string;
  joinedAt: number;
}

export interface Group {
  id: string;
  name: string;
  avatar: string;
  members: GroupMember[]; 
  created_at: number;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string; // Can be a User ID or Group ID
  text: string;
  mediaUrl?: string; 
  mediaType?: 'image' | 'video' | 'audio';
  timestamp: number;
  status?: MessageStatus;
  isRead: boolean;
  isEdited?: boolean;
  liked?: boolean;
  replyToId?: string;
  deletedForEveryone?: boolean;
  deletedFor?: string[]; // Array of User IDs who deleted this message for themselves
}

export interface CallSession {
  id: string;
  callerId: string;
  receiverId: string;
  type: 'audio' | 'video';
  status: 'dialing' | 'ringing' | 'connected' | 'ended' | 'missed';
  startTime?: number;
  duration?: number;
}

export type Theme = 'light' | 'dark';
