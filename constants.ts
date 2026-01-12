import { User, Post, Story } from './types';

export const CURRENT_USER: User = {
  id: 'u_me',
  name: 'Alex Creator',
  handle: 'alex_c',
  avatar: 'https://picsum.photos/seed/alex/150/150',
  bio: 'Tech enthusiast & affiliate marketer 🚀 Sharing the best deals!',
  followers: 3, // Matches MOCK_USERS length
  following: 2, // Matches initial followingIds in App.tsx
  isVerified: true,
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
  },
  {
    id: 'u3',
    name: 'Foodie Fam',
    handle: 'foodiefam',
    avatar: 'https://picsum.photos/seed/food/150/150',
    bio: 'Cooking made easy.',
    followers: 1200,
    following: 800,
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