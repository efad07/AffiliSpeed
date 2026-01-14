import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Home, Search, PlusSquare, User, Moon, Sun, Briefcase, ShoppingBag, ChevronLeft, Camera, Check, Trash2, ExternalLink, MessageCircle, X, Edit2, Share2, Copy, Facebook, Twitter, Linkedin, Link2, LogOut, LogIn, UserPlus, Send, MessageSquare, Heart, Phone, Video } from 'lucide-react';
import { CURRENT_USER, INITIAL_POSTS, MOCK_STORIES, MOCK_USERS, INITIAL_MESSAGES } from './constants';
import { Post, User as UserType, Story, Comment, Message } from './types';
import PostCard from './components/PostCard';
import StoryTray from './components/StoryTray';
import { generateSmartCaption } from './services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

// -- Icons & UI Components --

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 flex items-center justify-center";
  const variants = {
    primary: "bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/30",
    secondary: "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600",
    outline: "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
    ghost: "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
  };
  return <button className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`} onClick={onClick} {...props}>{children}</button>;
};

// -- Pages --

// 1. Home Feed
const Feed = ({ 
  posts, 
  stories, 
  onLike, 
  onDelete, 
  onEdit,
  onComment,
  onShare,
  onAddStory, 
  onDeleteStory, 
  onEditStory,
  currentUser 
}: { 
  posts: Post[], 
  stories: Story[], 
  onLike: (id: string) => void, 
  onDelete: (id: string) => void, 
  onEdit: (post: Post) => void,
  onComment: (id: string) => void,
  onShare: (id: string) => void,
  onAddStory: (file: File, caption: string, link?: string, label?: string) => void, 
  onDeleteStory: (id: string) => void,
  onEditStory: (id: string, caption: string) => void,
  currentUser: UserType 
}) => {
  return (
    <div className="max-w-xl mx-auto pb-20 pt-4 px-0 sm:px-4">
      <StoryTray 
        stories={stories} 
        currentUser={currentUser} 
        onAddStory={onAddStory} 
        onDeleteStory={onDeleteStory}
        onEditStory={onEditStory}
      />
      <div className="space-y-6">
        {posts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            onLike={onLike} 
            onDelete={onDelete}
            onEdit={onEdit}
            onCommentClick={onComment}
            onShare={onShare}
            isOwner={post.userId === currentUser.id}
          />
        ))}
      </div>
    </div>
  );
};

// 2. Explore / Search
const Explore = ({ posts }: { posts: Post[] }) => {
  const [term, setTerm] = useState('');
  
  // Optional: Filter posts based on search term if you want basic search functionality
  const displayedPosts = term 
    ? posts.filter(p => 
        p.caption.toLowerCase().includes(term.toLowerCase()) || 
        p.user.handle.toLowerCase().includes(term.toLowerCase())
      )
    : posts;

  return (
    <div className="max-w-xl mx-auto pb-20 pt-4 px-4">
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 py-2">
        <input 
          type="text" 
          placeholder="Search users, tags, products..." 
          className="w-full bg-gray-200 dark:bg-gray-800 border-none rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-1 mt-4">
        {displayedPosts.map((post) => (
          <div key={post.id} className="relative aspect-square group cursor-pointer overflow-hidden">
             <img src={post.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" loading="lazy" />
             {post.type === 'video' && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Shop / Deals Page
const Shop = ({ posts }: { posts: Post[] }) => {
  const deals = posts.filter(p => p.affiliateLink);
  
  return (
    <div className="max-w-xl mx-auto pb-20 pt-4 px-4 min-h-screen">
       <div className="sticky top-0 bg-gray-50 dark:bg-black z-10 py-3 mb-2 bg-opacity-95 backdrop-blur-sm">
         <h1 className="text-2xl font-bold dark:text-white flex items-center">
           Trending Deals <span className="ml-2 text-xl">🔥</span>
         </h1>
       </div>
      <div className="grid grid-cols-2 gap-3">
        {deals.map(post => (
          <a 
            key={post.id} 
            href={post.affiliateLink} 
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
          >
            <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
               <img src={post.url} className="w-full h-full object-cover" loading="lazy" />
               <div className="absolute bottom-2 left-2 bg-brand-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                 {post.affiliateLabel || 'GET DEAL'}
               </div>
               {post.type === 'video' && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-4 h-4 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
               )}
            </div>
            <div className="p-3">
               <div className="flex items-start justify-between">
                 <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug flex-1 mr-2">{post.caption}</p>
               </div>
               <div className="mt-3 flex items-center justify-between border-t border-gray-50 dark:border-gray-800 pt-2">
                  <div className="flex items-center space-x-1.5">
                    <img src={post.user.avatar} className="w-4 h-4 rounded-full object-cover" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[80px]">{post.user.handle}</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full">
                    <ExternalLink className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                  </div>
               </div>
            </div>
          </a>
        ))}
        {deals.length === 0 && (
           <div className="col-span-2 flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
             <ShoppingBag className="w-12 h-12 mb-3 opacity-20" />
             <p>No active deals right now.</p>
           </div>
        )}
      </div>
    </div>
  );
};

// 4. Upload Modal
const Upload = ({ onPost, currentUser }: { onPost: (post: Post) => void, currentUser: UserType }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [affiliateLabel, setAffiliateLabel] = useState('Get Offer');
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleGenerateCaption = async () => {
    if (!file) return;
    setGeneratingAI(true);
    const text = await generateSmartCaption(file, affiliateLabel);
    setCaption(text);
    setGeneratingAI(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview || !file) return;
    setLoading(true);

    setTimeout(() => {
      const newPost: Post = {
        id: `p_${Date.now()}`,
        userId: currentUser.id,
        user: currentUser,
        type: file.type.startsWith('video') ? 'video' : 'image',
        url: preview,
        caption,
        affiliateLink: affiliateLink || undefined,
        affiliateLabel: affiliateLabel || undefined,
        likes: 0,
        comments: [],
        timestamp: Date.now(),
        likedByMe: false
      };
      onPost(newPost);
      setLoading(false);
      navigate('/');
    }, 800);
  };

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-3 text-gray-900 dark:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg dark:text-white">New Post</h1>
      </div>
      
      <div className="p-4 pb-20">
        {!preview ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl h-64 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-500">
            <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <PlusSquare className="w-12 h-12 mb-2 text-brand-500" />
              <span>Select Photo or Video</span>
            </label>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
              {file?.type.startsWith('video') ? (
                <video src={preview} className="w-full h-full object-contain" controls />
              ) : (
                <img src={preview} className="w-full h-full object-contain" />
              )}
              <button type="button" onClick={() => setPreview(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-gray-300">Caption</label>
              <div className="relative">
                <textarea 
                  className="w-full p-3 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                  rows={3}
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={handleGenerateCaption}
                  disabled={generatingAI}
                  className="absolute right-2 bottom-2 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-2 py-1 rounded-md flex items-center transition-colors"
                >
                  {generatingAI ? 'Thinking...' : '✨ Magic Caption'}
                </button>
              </div>
            </div>

            <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-xl space-y-3">
              <div className="flex items-center space-x-2 text-brand-700 dark:text-brand-400 font-semibold mb-1">
                <Briefcase className="w-4 h-4" />
                <span>Affiliate Details</span>
              </div>
              <div>
                <label className="text-xs font-medium dark:text-gray-400">Product Link</label>
                <input 
                  type="url" 
                  className="w-full p-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                  placeholder="https://amazon.com/..."
                  value={affiliateLink}
                  onChange={e => setAffiliateLink(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium dark:text-gray-400">Button Label</label>
                <input 
                  type="text" 
                  className="w-full p-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                  placeholder="e.g. 50% OFF"
                  value={affiliateLabel}
                  onChange={e => setAffiliateLabel(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full py-3">
              {loading ? 'Posting...' : 'Share Post'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

// 5. Edit Profile
const EditProfile = ({ user, onUpdate }: { user: UserType, onUpdate: (u: UserType) => void }) => {
  const navigate = useNavigate();
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);
  const [bio, setBio] = useState(user.bio);
  const [avatar, setAvatar] = useState(user.avatar);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setAvatar(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = () => {
    onUpdate({ ...user, name, handle, bio, avatar });
    navigate('/profile');
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
        <button onClick={() => navigate(-1)} className="text-gray-900 dark:text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg dark:text-white">Edit Profile</h1>
        <button onClick={handleSave} className="text-brand-600 font-semibold hover:text-brand-700">
          <Check className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 flex flex-col items-center">
        {/* Avatar Upload */}
        <div className="relative mb-8 group cursor-pointer">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-800">
            <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-8 h-8 text-white" />
          </label>
          <input type="file" id="avatar-upload" accept="image/*" onChange={handleFileChange} className="hidden" />
          <p className="text-brand-600 font-medium text-sm mt-2 text-center">Change Photo</p>
        </div>

        {/* Form Fields */}
        <div className="w-full space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</label>
            <input 
              type="text" 
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none transition-colors resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. Network List (Followers/Following)
const NetworkList = ({ 
  title, 
  users, 
  followingIds, 
  onToggleFollow 
}: { 
  title: string, 
  users: UserType[], 
  followingIds: string[], 
  onToggleFollow: (id: string) => void 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex items-center p-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-900 dark:text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg dark:text-white">{title}</h1>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {users.length === 0 ? (
           <div className="p-8 text-center text-gray-500 dark:text-gray-400">No users found.</div>
        ) : (
          users.map(user => {
            const isFollowing = followingIds.includes(user.id);
            const isMe = user.id === CURRENT_USER.id;
            
            // Logic for Button Text:
            // If viewing Followers (title === 'Followers') and NOT following, say 'Follow Back'
            let buttonText = isFollowing ? 'Following' : 'Follow';
            if (title === 'Followers' && !isFollowing) {
               buttonText = 'Follow Back';
            }

            return (
              <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                          {user.name}
                          {user.isVerified && <svg className="w-3 h-3 text-blue-500 ml-1 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>}
                        </h3>
                        <p className="text-sm text-gray-500">@{user.handle}</p>
                    </div>
                  </div>
                  {!isMe && (
                    <button 
                      onClick={() => onToggleFollow(user.id)}
                      className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-all active:scale-95 ${
                        isFollowing 
                          ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700' 
                          : 'bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-500/20'
                      }`}
                    >
                      {buttonText}
                    </button>
                  )}
              </div>
            );
          })
        )}
      </div>
    </div>
  )
}

// 7. Inbox (Message List) - Instagram Style
const Inbox = ({ messages, users, currentUser }: { messages: Message[], users: UserType[], currentUser: UserType }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Group messages by conversation partner
  const conversations = users.map(user => {
    const userMessages = messages.filter(m => 
      (m.senderId === user.id && m.receiverId === currentUser.id) || 
      (m.senderId === currentUser.id && m.receiverId === user.id)
    );
    
    // Sort by timestamp descending
    userMessages.sort((a, b) => b.timestamp - a.timestamp);
    
    const lastMessage = userMessages[0];
    const unreadCount = userMessages.filter(m => m.receiverId === currentUser.id && !m.isRead).length;

    return {
      user,
      lastMessage,
      unreadCount
    };
  }).filter(c => c.lastMessage); // Only show conversations with messages

  const filteredConversations = conversations.filter(c => 
    c.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.user.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-black min-h-screen pb-20">
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-white dark:bg-black z-10">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <ChevronLeft className="w-7 h-7 text-gray-900 dark:text-white -ml-2 mr-1" />
            <h1 className="font-bold text-xl dark:text-white">{currentUser.handle}</h1>
        </div>
        <button className="text-gray-900 dark:text-white">
            <Edit2 className="w-6 h-6" />
        </button>
      </div>

      <div className="px-4 mb-4">
        <div className="bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center px-3 py-2">
           <Search className="w-4 h-4 text-gray-500" />
           <input 
             type="text"
             placeholder="Search"
             className="bg-transparent border-none outline-none text-sm ml-2 w-full text-gray-900 dark:text-white placeholder-gray-500"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="flex flex-col">
        <h2 className="px-4 text-sm font-semibold text-gray-900 dark:text-white mb-2">Messages</h2>
        {filteredConversations.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No messages yet.</p>
            <p className="text-sm">Start a conversation with someone!</p>
          </div>
        ) : (
          filteredConversations.map(convo => {
            const isRead = convo.unreadCount === 0;
            return (
              <Link 
                to={`/messages/${convo.user.id}`} 
                key={convo.user.id}
                className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors active:bg-gray-100 dark:active:bg-gray-800"
              >
                <div className="relative mr-3">
                   <img src={convo.user.avatar} className="w-14 h-14 rounded-full object-cover" />
                   {/* Online Indicator */}
                   <div className="absolute bottom-0 right-0 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-black"></div>
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-center mb-0.5">
                     <h3 className={`text-sm truncate pr-2 ${!isRead ? 'font-bold text-gray-900 dark:text-white' : 'font-normal text-gray-900 dark:text-white'}`}>
                       {convo.user.name}
                     </h3>
                   </div>
                   <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                     <p className={`truncate max-w-[180px] ${!isRead ? 'font-bold text-gray-900 dark:text-white' : ''}`}>
                       {convo.lastMessage.senderId === currentUser.id ? 'You: ' : ''}{convo.lastMessage.text}
                     </p>
                     <span className="mx-1">·</span>
                     <span className="flex-shrink-0 text-xs">
                       {new Date(convo.lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </span>
                   </div>
                </div>
                {convo.unreadCount > 0 && (
                  <div className="ml-2 bg-blue-500 w-2.5 h-2.5 rounded-full"></div>
                )}
              </Link>
            )
          })
        )}
      </div>
    </div>
  );
};

// 8. Chat Room (Instagram Style)
const ChatRoom = ({ messages, users, currentUser, onSend, onEdit, onToggleLike }: { messages: Message[], users: UserType[], currentUser: UserType, onSend: (text: string, receiverId: string) => void, onEdit: (id: string, text: string) => void, onToggleLike: (id: string) => void }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const partner = users.find(u => u.id === userId);

  // Filter messages for this chat
  const chatMessages = messages.filter(m => 
    (m.senderId === currentUser.id && m.receiverId === userId) ||
    (m.senderId === userId && m.receiverId === currentUser.id)
  ).sort((a, b) => a.timestamp - b.timestamp);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && userId) {
      onSend(text, userId);
      setText('');
    }
  };

  const handleDoubleTap = (msgId: string) => {
     onToggleLike(msgId);
  };

  if (!partner) return <div>User not found</div>;

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-black h-screen flex flex-col">
       {/* Header */}
       <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-black z-10">
          <button onClick={() => navigate('/messages')} className="mr-4 text-gray-900 dark:text-white">
            <ChevronLeft className="w-7 h-7" />
          </button>
          <div className="flex items-center space-x-3 flex-1 cursor-pointer" onClick={() => navigate(`/profile/${partner.id}`)}>
             <div className="relative">
                <img src={partner.avatar} className="w-8 h-8 rounded-full object-cover" />
                <div className="absolute bottom-0 right-0 bg-green-500 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-black"></div>
             </div>
             <div className="flex flex-col">
                <h2 className="font-bold text-sm dark:text-white leading-none mb-0.5">{partner.name}</h2>
                <p className="text-[10px] text-gray-500">Active now</p>
             </div>
          </div>
          <div className="flex space-x-4 text-gray-900 dark:text-white">
             <Phone className="w-6 h-6" />
             <Video className="w-7 h-7" />
          </div>
       </div>

       {/* Messages Area */}
       <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white dark:bg-black" ref={scrollRef}>
          <div className="flex flex-col items-center py-6">
             <img src={partner.avatar} className="w-20 h-20 rounded-full object-cover mb-3" />
             <h3 className="text-lg font-bold dark:text-white">{partner.name}</h3>
             <p className="text-sm text-gray-500">Instagram-style messaging on AffiliSpeed</p>
             <button className="mt-4 px-4 py-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg text-sm font-semibold dark:text-white">View Profile</button>
          </div>

          <div className="text-center text-xs text-gray-400 my-4">TODAY</div>

          {chatMessages.map((msg, idx) => {
            const isMe = msg.senderId === currentUser.id;
            const prevMsg = chatMessages[idx - 1];
            const isSequence = prevMsg && prevMsg.senderId === msg.senderId;
            
            return (
              <div 
                key={msg.id} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative mb-1`}
                onDoubleClick={() => handleDoubleTap(msg.id)}
              >
                 {!isMe && !isSequence && (
                   <img src={partner.avatar} className="w-7 h-7 rounded-full object-cover mr-2 self-end mb-1" />
                 )}
                 {!isMe && isSequence && <div className="w-9 mr-0"></div>}

                 <div className={`relative max-w-[70%] px-4 py-2.5 text-[15px] leading-snug rounded-[20px] transition-transform active:scale-[0.98] ${
                   isMe 
                     ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-br-md ml-auto' 
                     : 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-bl-md'
                 }`}>
                    <p>{msg.text}</p>
                    
                    {/* Edited Indicator */}
                    {msg.isEdited && <span className="opacity-60 text-[10px] block text-right mt-1 font-medium italic">edited</span>}

                    {/* Reaction Heart */}
                    {msg.liked && (
                      <div className={`absolute -bottom-2 ${isMe ? '-left-2' : '-right-2'} bg-white dark:bg-black rounded-full p-0.5 shadow-sm border border-gray-100 dark:border-gray-800`}>
                         <div className="bg-red-500 rounded-full p-1">
                            <Heart className="w-3 h-3 text-white fill-white" />
                         </div>
                      </div>
                    )}
                 </div>

                 {/* Edit Button (Only visible on hover/active for own messages) */}
                 {isMe && (
                   <button 
                     onClick={() => setEditingMessage(msg)}
                     className="self-center ml-2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                      <Edit2 className="w-4 h-4" />
                   </button>
                 )}
              </div>
            );
          })}
          
          <div className="flex justify-end mt-1">
             <span className="text-[10px] font-semibold text-gray-400 mr-2">Seen</span>
          </div>
       </div>

       {/* Input Area */}
       <div className="p-3 bg-white dark:bg-black flex items-center space-x-3 pb-safe-area">
          <div className="bg-gray-100 dark:bg-gray-900 rounded-full flex items-center flex-1 px-4 py-2 border border-transparent focus-within:border-gray-300 dark:focus-within:border-gray-700 transition-colors">
            <input 
                type="text" 
                placeholder="Message..." 
                className="flex-1 bg-transparent border-none text-sm text-gray-900 dark:text-white focus:outline-none placeholder-gray-500"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend(e)}
            />
            {text.trim() ? (
               <button 
                 onClick={handleSend}
                 className="text-blue-500 font-semibold text-sm ml-2 hover:text-blue-600"
               >
                 Send
               </button>
            ) : (
                <div className="flex space-x-3 text-gray-500 dark:text-gray-400 ml-2">
                   <button><Camera className="w-5 h-5" /></button>
                   <button><Heart className="w-5 h-5" /></button>
                </div>
            )}
          </div>
       </div>

       {/* Edit Message Modal */}
       {editingMessage && (
         <EditMessageModal 
           message={editingMessage}
           onSave={(id, newText) => {
             onEdit(id, newText);
             setEditingMessage(null);
           }}
           onCancel={() => setEditingMessage(null)}
         />
       )}
    </div>
  );
};

// 9. User Profile (Updated to include navigation to chat)
const Profile = ({ user, posts, isMe, onDelete, onEdit }: { user: UserType, posts: Post[], isMe?: boolean, onDelete?: (id: string) => void, onEdit?: (post: Post) => void }) => {
  const userPosts = posts.filter(p => p.userId === user.id);
  const navigate = useNavigate();
  
  return (
    <div className="max-w-xl mx-auto pb-20 bg-white dark:bg-gray-900 min-h-screen">
      <div className="p-4 flex flex-col items-center border-b dark:border-gray-800">
        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-brand-400 to-purple-500 mb-3">
          <img src={user.avatar} className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-900" />
        </div>
        <h1 className="text-xl font-bold dark:text-white flex items-center">
          {user.name}
          {user.isVerified && <svg className="w-4 h-4 text-blue-500 ml-1 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">@{user.handle}</p>
        
        <div className="flex space-x-10 mb-6">
          <div className="text-center cursor-default">
            <span className="font-bold text-lg dark:text-white">{userPosts.length}</span>
            <p className="text-xs text-gray-500">Posts</p>
          </div>
          {isMe ? (
            <Link to="/profile/followers" className="text-center group cursor-pointer">
              <span className="font-bold text-lg dark:text-white group-hover:text-brand-600 transition-colors">{user.followers}</span>
              <p className="text-xs text-gray-500 group-hover:text-brand-600 transition-colors">Followers</p>
            </Link>
          ) : (
             <div className="text-center">
              <span className="font-bold text-lg dark:text-white">{user.followers}</span>
              <p className="text-xs text-gray-500">Followers</p>
            </div>
          )}
          {isMe ? (
            <Link to="/profile/following" className="text-center group cursor-pointer">
              <span className="font-bold text-lg dark:text-white group-hover:text-brand-600 transition-colors">{user.following}</span>
              <p className="text-xs text-gray-500 group-hover:text-brand-600 transition-colors">Following</p>
            </Link>
          ) : (
            <div className="text-center">
              <span className="font-bold text-lg dark:text-white">{user.following}</span>
              <p className="text-xs text-gray-500">Following</p>
            </div>
          )}
        </div>

        <p className="text-center text-sm dark:text-gray-300 mb-6 max-w-xs">{user.bio}</p>

        <div className="flex space-x-2 w-full max-w-xs">
          {isMe ? (
            <Link to="/edit-profile" className="flex-1">
              <Button variant="secondary" className="w-full">Edit Profile</Button>
            </Link>
          ) : (
            <>
              <Button className="flex-1">Follow</Button>
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={() => navigate(`/messages/${user.id}`)}
              >
                Message
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-0.5 mt-0.5">
        {userPosts.map(post => (
          <div key={post.id} className="aspect-square relative group">
            <img src={post.url} className="w-full h-full object-cover" />
            {post.type === 'video' && (
              <div className="absolute top-1 right-1">
                 <svg className="w-4 h-4 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            )}
            {post.affiliateLink && (
              <div className="absolute bottom-1 left-1 bg-black/50 p-1 rounded-sm">
                 <ShoppingBag className="w-3 h-3 text-white" />
              </div>
            )}
            {isMe && onDelete && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(post.id);
                }}
                className="absolute top-1 left-1 bg-black/50 p-1.5 rounded-full text-white hover:bg-red-600 transition-colors group-hover:opacity-100"
                title="Delete Post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
             {isMe && onEdit && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(post);
                  }}
                  className="absolute top-1 right-1 bg-black/50 p-1.5 rounded-full text-white hover:bg-blue-600 transition-colors group-hover:opacity-100"
                  title="Edit Post"
                >
                  <Briefcase className="w-4 h-4" />
                </button>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 10. NavItem
const NavItem = ({ to, icon: Icon, active }: { to: string, icon: any, active: boolean }) => (
  <Link to={to} className={`flex flex-col items-center justify-center space-y-1 w-16 h-full transition-colors ${active ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
    <Icon className={`w-6 h-6 ${active ? 'fill-current' : ''}`} strokeWidth={active ? 2.5 : 2} />
  </Link>
);

// 11. PostDetail
const PostDetail = ({ posts, onLike, onDelete, onEdit, onComment, onShare, currentUser }: { posts: Post[], onLike: (id: string) => void, onDelete: (id: string) => void, onEdit: (post: Post) => void, onComment: (id: string) => void, onShare: (id: string) => void, currentUser: UserType }) => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const post = posts.find(p => p.id === postId);

  if (!post) return <div className="p-10 text-center dark:text-white">Post not found</div>;

  return (
    <div className="max-w-xl mx-auto pb-20 pt-4 px-0 sm:px-4 min-h-screen bg-white dark:bg-gray-900">
       <div className="flex items-center px-4 py-2 mb-2 sticky top-0 z-10 bg-white dark:bg-gray-900">
         <button onClick={() => navigate(-1)} className="mr-3 text-gray-900 dark:text-white"><ChevronLeft className="w-6 h-6" /></button>
         <h1 className="font-bold text-lg dark:text-white">Post</h1>
       </div>
       <PostCard 
          post={post} 
          onLike={onLike} 
          onDelete={onDelete}
          onEdit={onEdit}
          onCommentClick={onComment}
          onShare={onShare}
          isOwner={post.userId === currentUser.id}
       />
    </div>
  );
};

// 12. Login
const Login = ({ onLogin }: { onLogin: () => void }) => {
  const navigate = useNavigate();
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
    navigate('/');
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white dark:bg-gray-900">
      <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-brand-600 to-teal-400 bg-clip-text text-transparent">AffiliSpeed</h1>
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <input type="email" placeholder="Email" className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" required />
        <input type="password" placeholder="Password" className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" required />
        <Button type="submit" className="w-full py-3">Log In</Button>
      </form>
      <p className="mt-4 text-sm text-gray-500">Don't have an account? <Link to="/signup" className="text-brand-600 font-bold hover:underline">Sign Up</Link></p>
    </div>
  );
};

// 13. Signup
const Signup = ({ onSignup }: { onSignup: (u: UserType) => void }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = {
      ...CURRENT_USER,
      id: `u_${Date.now()}`,
      name: name || 'New User',
      handle: handle || 'newuser',
    };
    onSignup(newUser);
    navigate('/');
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white dark:bg-gray-900">
      <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-brand-600 to-teal-400 bg-clip-text text-transparent">Join AffiliSpeed</h1>
      <form onSubmit={handleSignup} className="w-full max-w-sm space-y-4">
        <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" required />
        <input type="text" placeholder="Username" value={handle} onChange={e => setHandle(e.target.value)} className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" required />
        <input type="email" placeholder="Email" className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" required />
        <input type="password" placeholder="Password" className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" required />
        <Button type="submit" className="w-full py-3">Sign Up</Button>
      </form>
      <p className="mt-4 text-sm text-gray-500">Already have an account? <Link to="/login" className="text-brand-600 font-bold hover:underline">Log In</Link></p>
    </div>
  );
};

// 14. EditPostModal
const EditPostModal = ({ post, onSave, onCancel }: { post: Post, onSave: (p: Post) => void, onCancel: () => void }) => {
  const [caption, setCaption] = useState(post.caption);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl transform scale-100">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Edit Post</h2>
        <textarea 
          className="w-full p-3 border rounded-xl mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none" 
          rows={4} 
          value={caption} 
          onChange={e => setCaption(e.target.value)}
        />
        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onSave({ ...post, caption })}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

// 15. CommentsModal
const CommentsModal = ({ post, currentUser, onClose, onAddComment, onDeleteComment, onEditComment }: { 
    post: Post, 
    currentUser: UserType, 
    onClose: () => void, 
    onAddComment: (postId: string, text: string) => void, 
    onDeleteComment: (postId: string, commentId: string) => void,
    onEditComment: (postId: string, commentId: string, text: string) => void
}) => {
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddComment(post.id, text);
      setText('');
    }
  };

  const handleEdit = (comment: Comment) => {
     setEditingId(comment.id);
     setEditText(comment.text);
  };

  const saveEdit = (commentId: string) => {
     onEditComment(post.id, commentId, editText);
     setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4">
      <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md h-[80vh] sm:h-[600px] sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
           <h3 className="font-bold dark:text-white">Comments</h3>
           <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><X className="w-6 h-6 dark:text-white" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
           {post.comments.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-gray-500">
                   <MessageCircle className="w-12 h-12 mb-2 opacity-20" />
                   <p>No comments yet.</p>
               </div>
           )}
           {post.comments.map((c: Comment) => (
             <div key={c.id} className="flex space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <div className="bg-gray-50 dark:bg-gray-800 p-2.5 rounded-2xl rounded-tl-none">
                      <span className="font-bold text-sm dark:text-white block mb-0.5">{c.username}</span>
                      {editingId === c.id ? (
                          <div className="flex flex-col space-y-2">
                             <input 
                                className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
                                value={editText}
                                onChange={e => setEditText(e.target.value)}
                                autoFocus
                             />
                             <div className="flex space-x-2 text-xs">
                                <button onClick={() => saveEdit(c.id)} className="text-brand-600 font-bold">Save</button>
                                <button onClick={() => setEditingId(null)} className="text-gray-500">Cancel</button>
                             </div>
                          </div>
                      ) : (
                          <p className="text-sm dark:text-gray-300 leading-relaxed">{c.text}</p>
                      )}
                  </div>
                  <div className="flex items-center space-x-3 mt-1 ml-1 text-[10px] font-medium text-gray-500">
                    <span>{new Date(c.timestamp).toLocaleDateString()}</span>
                    {c.userId === currentUser.id && !editingId && (
                       <>
                         <button onClick={() => handleEdit(c)} className="hover:text-gray-900 dark:hover:text-gray-300">Edit</button>
                         <button onClick={() => onDeleteComment(post.id, c.id)} className="text-red-500 hover:text-red-600">Delete</button>
                       </>
                    )}
                  </div>
                </div>
             </div>
           ))}
        </div>
        <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 dark:border-gray-800 flex space-x-2 bg-white dark:bg-gray-900">
           <input 
             type="text" 
             placeholder="Add a comment..." 
             className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition-shadow"
             value={text}
             onChange={e => setText(e.target.value)}
           />
           <button 
             disabled={!text.trim()} 
             type="submit" 
             className="text-brand-600 font-bold text-sm px-3 disabled:opacity-50 hover:text-brand-700 transition-colors"
           >
               Post
           </button>
        </form>
      </div>
    </div>
  );
};

// 16. ShareModal
const ShareModal = ({ post, onClose }: { post: Post, onClose: () => void }) => {
   const [copied, setCopied] = useState(false);
   const shareUrl = `${window.location.origin}/#/post/${post.id}`;

   const copyToClipboard = () => {
     navigator.clipboard.writeText(shareUrl);
     setCopied(true);
     setTimeout(() => setCopied(false), 2000);
   };

   return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl transform scale-100">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-lg font-bold dark:text-white">Share to</h3>
           <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X className="w-5 h-5 dark:text-gray-400" /></button>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
           <button className="flex flex-col items-center space-y-2 group">
              <div className="w-14 h-14 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-transform"><Facebook className="w-7 h-7" /></div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Facebook</span>
           </button>
           <button className="flex flex-col items-center space-y-2 group">
              <div className="w-14 h-14 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-transform"><Twitter className="w-7 h-7" /></div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Twitter</span>
           </button>
           <button className="flex flex-col items-center space-y-2 group">
              <div className="w-14 h-14 rounded-full bg-[#0A66C2] text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-transform"><Linkedin className="w-7 h-7" /></div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">LinkedIn</span>
           </button>
           <button className="flex flex-col items-center space-y-2 group" onClick={copyToClipboard}>
              <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                  {copied ? <Check className="w-7 h-7 text-green-500" /> : <Link2 className="w-7 h-7" />}
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{copied ? 'Copied' : 'Copy'}</span>
           </button>
        </div>
        
        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
           <p className="flex-1 text-xs text-gray-500 dark:text-gray-400 truncate mr-3 select-all">{shareUrl}</p>
           <button onClick={copyToClipboard} className="text-brand-600 font-bold text-xs hover:text-brand-700">
              {copied ? 'COPIED' : 'COPY'}
           </button>
        </div>
      </div>
    </div>
   );
};

// 17. EditMessageModal
const EditMessageModal = ({ message, onSave, onCancel }: { message: Message, onSave: (id: string, text: string) => void, onCancel: () => void }) => {
  const [text, setText] = useState(message.text);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl transform scale-100">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Edit Message</h2>
        <textarea 
          className="w-full p-3 border rounded-xl mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none" 
          rows={3} 
          value={text} 
          onChange={e => setText(e.target.value)}
        />
        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onSave(message.id, text)}>Save</Button>
        </div>
      </div>
    </div>
  );
};

interface LayoutProps {
  children?: React.ReactNode;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Layout = ({ children, theme, toggleTheme, isAuthenticated, onLogout }: LayoutProps) => {
  const location = useLocation();
  const isHideHeader = location.pathname === '/upload' || location.pathname === '/edit-profile' || location.pathname.includes('/profile/') || location.pathname.includes('/post/') || location.pathname.includes('/messages/') || location.pathname === '/login' || location.pathname === '/signup';
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-200 font-sans">
      
      {/* Top Header - Mobile */}
      {!isHideHeader && (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex justify-between items-center max-w-xl mx-auto">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-brand-500 to-teal-400 bg-clip-text text-transparent">
            AffiliSpeed
          </Link>
          <div className="flex items-center space-x-3">
             {isAuthenticated ? (
               <>
                 <Link to="/messages" className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    <MessageSquare className="w-6 h-6" />
                 </Link>
                 <button 
                   onClick={onLogout} 
                   className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                   title="Logout"
                 >
                   <LogOut className="w-5 h-5" />
                 </button>
               </>
             ) : (
               <div className="flex items-center space-x-2">
                 <Link to="/login">
                   <Button variant="ghost" className="px-3 py-1.5 text-sm h-auto">Sign In</Button>
                 </Link>
                 <Link to="/signup">
                   <Button className="px-3 py-1.5 text-sm h-auto bg-brand-600 text-white">Sign Up</Button>
                 </Link>
               </div>
             )}
             <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
               {theme === 'light' ? <Moon className="w-5 h-5 text-gray-700" /> : <Sun className="w-5 h-5 text-yellow-400" />}
             </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="">
        {children}
      </main>

      {/* Bottom Navigation */}
      {!isHideHeader && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 h-16 z-40 max-w-xl mx-auto pb-safe-area">
          <div className="flex h-full items-center justify-around">
            <NavItem to="/" icon={Home} active={location.pathname === '/'} />
            <NavItem to="/search" icon={Search} active={location.pathname === '/search'} />
            <div className="relative -top-5">
              <Link to="/upload" className="flex items-center justify-center w-14 h-14 bg-brand-600 rounded-full text-white shadow-lg shadow-brand-500/40 transform transition-transform active:scale-90">
                <PlusSquare className="w-7 h-7" />
              </Link>
            </div>
            <NavItem to="/shop" icon={ShoppingBag} active={location.pathname === '/shop'} />
            <NavItem to="/profile" icon={User} active={location.pathname === '/profile'} />
          </div>
        </nav>
      )}
    </div>
  );
};

// -- Main App Component --

const App = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [currentUser, setCurrentUser] = useState<UserType>(CURRENT_USER);
  const [followingIds, setFollowingIds] = useState<string[]>(['u1', 'u2']); // Mock initial following
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [activeSharePostId, setActiveSharePostId] = useState<string | null>(null);

  // Initialize Theme
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Update Current User Following Count when followingIds changes
  useEffect(() => {
    setCurrentUser(u => ({ 
      ...u, 
      following: followingIds.length,
      followers: MOCK_USERS.length // Since MOCK_USERS are the followers in this demo
    }));
  }, [followingIds]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleSignup = (newUser: UserType) => {
    setCurrentUser(newUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return { 
          ...p, 
          likedByMe: !p.likedByMe, 
          likes: p.likedByMe ? p.likes - 1 : p.likes + 1 
        };
      }
      return p;
    }));
  };

  const handleCreatePost = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleAddStory = (file: File, caption: string, link?: string, label?: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const newStory: Story = {
          id: `s_${Date.now()}`,
          userId: currentUser.id,
          user: currentUser,
          mediaUrl: e.target.result as string,
          type: file.type.startsWith('video') ? 'video' : 'image',
          caption: caption,
          affiliateLink: link,
          affiliateLabel: label,
          expiresAt: Date.now() + 86400000,
          viewed: false
        };
        setStories(prev => [newStory, ...prev]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePost = (id: string) => {
    setPostToDelete(id);
  };

  const confirmDeletePost = () => {
    if (postToDelete) {
      setPosts(prev => prev.filter(p => p.id !== postToDelete));
      setPostToDelete(null);
    }
  };

  const handleEditPost = (post: Post) => {
    setPostToEdit(post);
  };

  const confirmEditPost = (updatedPost: Post) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    setPostToEdit(null);
  };

  const handleDeleteStory = (id: string) => {
    setStories(prev => prev.filter(s => s.id !== id));
  };

  const handleEditStory = (id: string, caption: string) => {
    setStories(prev => prev.map(s => s.id === id ? { ...s, caption } : s));
  };

  const handleToggleFollow = (id: string) => {
    setFollowingIds(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleAddComment = (postId: string, text: string) => {
    const newComment: Comment = {
        id: `c_${Date.now()}`,
        userId: currentUser.id,
        username: currentUser.handle,
        text: text,
        timestamp: Date.now()
    };
    
    setPosts(prev => prev.map(p => {
        if (p.id === postId) {
            return { ...p, comments: [...p.comments, newComment] };
        }
        return p;
    }));
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    setPosts(prev => prev.map(p => {
        if (p.id === postId) {
            return {
                ...p,
                comments: p.comments.filter(c => c.id !== commentId)
            };
        }
        return p;
    }));
  };

  const handleEditComment = (postId: string, commentId: string, newText: string) => {
    setPosts(prev => prev.map(p => {
        if (p.id === postId) {
            return {
                ...p,
                comments: p.comments.map(c => c.id === commentId ? { ...c, text: newText } : c)
            };
        }
        return p;
    }));
  };

  const handleShare = (postId: string) => {
    setActiveSharePostId(postId);
  };

  // Messaging Logic
  const handleSendMessage = (text: string, receiverId: string) => {
    const newMessage: Message = {
      id: `m_${Date.now()}`,
      senderId: currentUser.id,
      receiverId: receiverId,
      text: text,
      timestamp: Date.now(),
      isRead: false
    };
    setMessages(prev => [...prev, newMessage]);

    // Simulate auto-reply after 2 seconds
    setTimeout(() => {
        const replies = [
          "That sounds great! 👍",
          "Can you tell me more?",
          "I'll check it out soon.",
          "Awesome!",
          "Haha, totally! 😂"
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        const replyMessage: Message = {
            id: `m_r_${Date.now()}`,
            senderId: receiverId,
            receiverId: currentUser.id,
            text: randomReply,
            timestamp: Date.now(),
            isRead: false
        };
        setMessages(prev => [...prev, replyMessage]);
    }, 2000);
  };

  // Edit Message Logic
  const handleEditMessage = (id: string, newText: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, text: newText, isEdited: true } : m));
  };

  // Like Message Logic (Double Tap)
  const handleToggleLikeMessage = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, liked: !m.liked } : m));
  };

  return (
    <Router>
      <Layout theme={theme} toggleTheme={toggleTheme} isAuthenticated={isAuthenticated} onLogout={handleLogout}>
        <Routes>
          <Route 
            path="/" 
            element={
              <Feed 
                posts={posts} 
                stories={stories} 
                onLike={handleLike} 
                onDelete={handleDeletePost}
                onEdit={handleEditPost}
                onComment={(id) => setActiveCommentPostId(id)}
                onShare={handleShare}
                onAddStory={handleAddStory}
                onDeleteStory={handleDeleteStory}
                onEditStory={handleEditStory}
                currentUser={currentUser} 
              />
            } 
          />
          <Route path="/search" element={<Explore posts={posts} />} />
          <Route path="/shop" element={<Shop posts={posts} />} />
          <Route path="/upload" element={<Upload onPost={handleCreatePost} currentUser={currentUser} />} />
          <Route 
            path="/profile" 
            element={
              <Profile 
                user={currentUser} 
                posts={posts} 
                isMe={true} 
                onDelete={handleDeletePost}
                onEdit={handleEditPost}
              />
            } 
          />
          <Route path="/edit-profile" element={<EditProfile user={currentUser} onUpdate={setCurrentUser} />} />
          <Route 
            path="/post/:postId" 
            element={
              <PostDetail 
                 posts={posts} 
                 onLike={handleLike} 
                 onDelete={handleDeletePost} 
                 onEdit={handleEditPost} 
                 onComment={(id) => setActiveCommentPostId(id)}
                 onShare={handleShare}
                 currentUser={currentUser}
              />
            } 
          />
          <Route 
            path="/profile/followers" 
            element={
              <NetworkList 
                title="Followers" 
                users={MOCK_USERS} 
                followingIds={followingIds}
                onToggleFollow={handleToggleFollow}
              />
            } 
          />
          <Route 
            path="/profile/following" 
            element={
              <NetworkList 
                title="Following" 
                users={MOCK_USERS.filter(u => followingIds.includes(u.id))} 
                followingIds={followingIds}
                onToggleFollow={handleToggleFollow}
              />
            } 
          />
          {/* Messaging Routes */}
          <Route path="/messages" element={<Inbox messages={messages} users={MOCK_USERS} currentUser={currentUser} />} />
          <Route 
            path="/messages/:userId" 
            element={
              <ChatRoom 
                 messages={messages} 
                 users={MOCK_USERS} 
                 currentUser={currentUser} 
                 onSend={handleSendMessage} 
                 onEdit={handleEditMessage} 
                 onToggleLike={handleToggleLikeMessage}
              />
            } 
          />
          
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup onSignup={handleSignup} />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Edit Modal */}
        {postToEdit && (
           <EditPostModal 
             post={postToEdit} 
             onSave={confirmEditPost} 
             onCancel={() => setPostToEdit(null)} 
           />
        )}

        {/* Comments Modal */}
        {activeCommentPostId && (
            <CommentsModal 
              post={posts.find(p => p.id === activeCommentPostId)!}
              currentUser={currentUser}
              onClose={() => setActiveCommentPostId(null)}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              onEditComment={handleEditComment}
            />
        )}

        {/* Share Modal */}
        {activeSharePostId && (
            <ShareModal 
              post={posts.find(p => p.id === activeSharePostId)!}
              onClose={() => setActiveSharePostId(null)}
            />
        )}

        {/* Global Delete Confirmation Modal */}
        {postToDelete && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-xs shadow-2xl transform scale-100 animate-in fade-in zoom-in duration-200">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                        <Trash2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Post?</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Are you sure you want to delete this post? This action cannot be undone.
                      </p>
                    </div>
                    <div className="flex space-x-3 w-full">
                        <button 
                          onClick={() => setPostToDelete(null)}
                          className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={confirmDeletePost}
                          className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-500/30"
                        >
                          Delete
                        </button>
                    </div>
                  </div>
              </div>
            </div>
        )}
      </Layout>
    </Router>
  );
};

export default App;