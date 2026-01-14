
export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  isVerified?: boolean;
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

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  isRead: boolean;
  isEdited?: boolean;
  liked?: boolean; // New field for double-tap reaction
}

export type Theme = 'light' | 'dark';