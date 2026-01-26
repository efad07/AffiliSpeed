
import { User, Post, Story, Message, Group } from './types';

export const CURRENT_USER: User = {
  id: 'u_me',
  name: 'Alex Creator',
  handle: 'alex_c',
  avatar: 'https://picsum.photos/seed/alex/150/150',
  bio: 'Tech enthusiast & affiliate marketer 🚀 Sharing the best deals!',
  followers: 3, 
  following: 2, 
  isVerified: true,
  blockedUsers: [],
};

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Sarah Style',
    handle: 'sarahstyle',
    avatar: 'https://picsum.photos/seed/sarah/150/150',
    bio: 'Fashion & Lifestyle ✨',
    followers: 8900,
    following: 150,
    blockedUsers: [],
  },
  {
    id: 'u2',
    name: 'Tech Daily',
    handle: 'techdaily',
    avatar: 'https://picsum.photos/seed/tech/150/150',
    bio: 'Daily gadgets reviews.',
    followers: 45000,
    following: 10,
    isVerified: true,
    blockedUsers: [],
  },
  {
    id: 'u3',
    name: 'Foodie Fam',
    handle: 'foodiefam',
    avatar: 'https://picsum.photos/seed/food/150/150',
    bio: 'Cooking made easy.',
    followers: 1200,
    following: 800,
    blockedUsers: [],
  }
];

export const MOCK_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Affiliate Squad 🚀',
    avatar: 'https://ui-avatars.com/api/?name=Affiliate+Squad&background=0D9488&color=fff',
    members: [
      { userId: 'u_me', role: 'admin', joinedAt: Date.now() - 10000000, nickname: 'Big Boss' },
      { userId: 'u1', role: 'member', joinedAt: Date.now() - 9000000 },
      { userId: 'u2', role: 'member', joinedAt: Date.now() - 8000000 }
    ],
    created_at: Date.now() - 10000000
  }
];

export const MOCK_STORIES: Story[] = MOCK_USERS.map((user, i) => ({
  id: `s_${i}`,
  userId: user.id,
  user: user,
  mediaUrl: `https://picsum.photos/seed/story${i}/400/800`,
  type: 'image',
  caption: i % 2 === 0 ? 'Loving this view! 😍' : undefined,
  expiresAt: Date.now() + 86400000,
  viewed: false,
}));

// Separate data for Sparks (Vertical Videos)
export const MOCK_SPARKS: Post[] = Array.from({ length: 10 }).map((_, i) => {
  const user = MOCK_USERS[i % MOCK_USERS.length];
  return {
    id: `spark_${i}`,
    userId: user.id,
    user: user,
    type: 'video',
    // Using a vertical-ish video sample or generic video
    url: i % 2 === 0 
      ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' 
      : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: `https://picsum.photos/seed/spark_thumb${i}/400/800`,
    caption: `This product is a game changer! 🔥 Spark #${i + 1} #viral #musthave`,
    affiliateLink: 'https://example.com/product',
    affiliateLabel: i % 2 === 0 ? 'Grab 50% OFF' : 'View Deal',
    likes: Math.floor(Math.random() * 5000),
    comments: [],
    timestamp: Date.now(),
    likedByMe: false,
  };
});

export const INITIAL_POSTS: Post[] = Array.from({ length: 20 }).map((_, i) => {
  const user = MOCK_USERS[i % MOCK_USERS.length];
  const isVideo = i % 5 === 0;
  return {
    id: `p_${i}`,
    userId: user.id,
    user: user,
    type: isVideo ? 'video' : 'image',
    url: isVideo ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' : `https://picsum.photos/seed/post${i}/600/600`,
    thumbnail: isVideo ? `https://picsum.photos/seed/thumb${i}/600/600` : undefined,
    caption: `Check out this amazing find! This is post number ${i + 1} #affiliate #deal`,
    affiliateLink: i % 2 === 0 ? 'https://example.com/product' : undefined,
    affiliateLabel: 'Get 20% OFF',
    likes: Math.floor(Math.random() * 1000),
    comments: [],
    timestamp: Date.now() - Math.floor(Math.random() * 10000000),
    likedByMe: false,
  };
});

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    senderId: 'u1',
    receiverId: 'u_me',
    text: 'Hey Alex! Loved your recent post about the headphones. 🎧',
    timestamp: Date.now() - 3600000,
    isRead: true,
  },
  {
    id: 'm2',
    senderId: 'u_me',
    receiverId: 'u1',
    text: 'Thanks Sarah! Yeah, the sound quality is insane for the price.',
    timestamp: Date.now() - 3500000,
    isRead: true,
  },
  {
    id: 'm3',
    senderId: 'u1',
    receiverId: 'u_me',
    text: 'Do you have an affiliate link for them? I might grab a pair.',
    timestamp: Date.now() - 3400000,
    isRead: false,
  },
  {
    id: 'm4',
    senderId: 'u2',
    receiverId: 'u_me',
    text: 'Collaboration proposal: Check your email! 📧',
    timestamp: Date.now() - 86400000,
    isRead: true,
  },
  {
    id: 'm5',
    senderId: 'u1',
    receiverId: 'g1',
    text: 'Hey team, anyone tried the new analytics tool?',
    timestamp: Date.now() - 120000,
    isRead: true,
  }
];
