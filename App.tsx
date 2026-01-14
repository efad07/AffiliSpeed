import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Home, Search, PlusSquare, User, Moon, Sun, Briefcase, ShoppingBag, ChevronLeft, Camera, Check, Trash2, ExternalLink, MessageCircle, X, Edit2, Share2, Copy, Facebook, Twitter, Linkedin, Link2, LogOut, LogIn, UserPlus, Send, MessageSquare, Heart, Phone, Video, Mic, MicOff, VideoOff, Paperclip, Image as ImageIcon } from 'lucide-react';
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
  onReplyToStory,
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
  onReplyToStory: (storyId: string, text: string) => void,
  currentUser: UserType 
}) => {
  return (
    <div className="max-w-xl mx-auto pb-20 px-0 sm:px-4">
      {/* Added top spacing to account for fixed header + stories */}
      <div className="pt-2">
        <StoryTray 
          stories={stories} 
          currentUser={currentUser} 
          onAddStory={onAddStory} 
          onDeleteStory={onDeleteStory}
          onEditStory={onEditStory}
          onReplyToStory={onReplyToStory}
        />
      </div>
      <div className="space-y-6 mt-4">
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
  
  // Optional: Filter posts based on search term
  const displayedPosts = term 
    ? posts.filter(p => 
        p.caption.toLowerCase().includes(term.toLowerCase()) || 
        p.user.handle.toLowerCase().includes(term.toLowerCase())
      )
    : posts;

  return (
    <div className="max-w-xl mx-auto pb-20 px-4">
      {/* Sticky top-14 to sit below the fixed header */}
      <div className="sticky top-14 bg-gray-50 dark:bg-gray-900 z-10 py-3 transition-colors duration-200">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search users, tags, products..." 
              className="w-full bg-gray-200 dark:bg-gray-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-1 mt-1">
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
    <div className="max-w-xl mx-auto pb-20 px-4 min-h-screen">
       {/* Sticky top-14 to sit below fixed header */}
       <div className="sticky top-14 bg-gray-50 dark:bg-black z-10 py-3 mb-2 bg-opacity-95 backdrop-blur-sm transition-colors duration-200">
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
};
  
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
                         {convo.lastMessage.senderId === currentUser.id ? 'You: ' : ''}
                         {convo.lastMessage.mediaUrl ? (convo.lastMessage.mediaType === 'image' ? 'Sent a photo' : 'Sent a video') : convo.lastMessage.text}
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

// EditMessageModal Component
const EditMessageModal = ({ message, onSave, onCancel }: any) => {
  const [text, setText] = useState(message.text);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm p-4 space-y-3">
        <h3 className="font-bold dark:text-white">Edit Message</h3>
        <input 
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={text}
          onChange={e => setText(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="px-3 py-1 text-gray-500">Cancel</button>
          <button onClick={() => onSave(message.id, text)} className="px-3 py-1 bg-brand-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

const ChatRoom = ({ messages, users, currentUser, onSend, onEdit, onToggleLike }: { messages: Message[], users: UserType[], currentUser: UserType, onSend: (text: string, receiverId: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void, onEdit: (id: string, text: string) => void, onToggleLike: (id: string) => void }) => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Call States
    const [isCalling, setIsCalling] = useState(false);
    const [callType, setCallType] = useState<'audio' | 'video' | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    
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

    // Cleanup stream on unmount
    useEffect(() => {
      return () => {
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
        }
      };
    }, [localStream]);
  
    const handleSend = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if ((text.trim() || fileInputRef.current?.files?.length) && userId) {
        onSend(text, userId);
        setText('');
      }
    };
  
    const handleDoubleTap = (msgId: string) => {
       onToggleLike(msgId);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && userId) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
           const result = ev.target?.result as string;
           const type = file.type.startsWith('video') ? 'video' : 'image';
           onSend("", userId, result, type);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSendHeart = () => {
      if (userId) {
        onSend('❤️', userId);
      }
    };

    const startCall = async (type: 'audio' | 'video') => {
      setCallType(type);
      setIsCalling(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: type === 'video', 
          audio: true 
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
        alert("Could not access camera/microphone. Please ensure permissions are granted.");
        setIsCalling(false);
      }
    };

    const endCall = () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      setIsCalling(false);
      setCallType(null);
    };

    const toggleMute = () => {
      if (localStream) {
        localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
        setIsMuted(!isMuted);
      }
    };

    const toggleCamera = () => {
      if (localStream && callType === 'video') {
        localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
        setIsCameraOff(!isCameraOff);
      }
    };
  
    if (!partner) return <div>User not found</div>;
  
    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-black h-screen flex flex-col relative">
         {/* Call Overlay */}
         <AnimatePresence>
           {isCalling && (
             <motion.div 
               initial={{ opacity: 0, y: "100%" }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: "100%" }}
               className="absolute inset-0 z-50 bg-gray-900 flex flex-col items-center justify-between py-12 px-4"
             >
                {/* Simulated Remote User View */}
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                   <div className="text-center">
                     <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 mx-auto mb-4 animate-pulse">
                        <img src={partner.avatar} className="w-full h-full object-cover" />
                     </div>
                     <h2 className="text-2xl font-bold text-white mb-2">{partner.name}</h2>
                     <p className="text-white/60 animate-pulse">Connecting...</p>
                   </div>
                </div>

                {/* Local User View (Picture-in-Picture) */}
                {callType === 'video' && (
                  <div className="absolute top-4 right-4 w-32 h-48 bg-black rounded-xl overflow-hidden shadow-2xl border border-white/20">
                     <video 
                       ref={el => {
                         if (el && localStream) el.srcObject = localStream;
                       }}
                       autoPlay 
                       muted 
                       playsInline 
                       className={`w-full h-full object-cover ${isCameraOff ? 'hidden' : ''}`} 
                     />
                     {isCameraOff && <div className="w-full h-full flex items-center justify-center text-white/50 text-xs">Camera Off</div>}
                  </div>
                )}

                {/* Controls */}
                <div className="absolute bottom-12 left-0 right-0 flex items-center justify-center space-x-6 z-10">
                   <button onClick={toggleCamera} className={`p-4 rounded-full ${isCameraOff ? 'bg-white text-black' : 'bg-gray-700/50 text-white backdrop-blur-md'}`}>
                      {isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                   </button>
                   <button onClick={endCall} className="p-4 rounded-full bg-red-500 text-white shadow-lg transform active:scale-95 transition-transform">
                      <Phone className="w-8 h-8 fill-current rotate-[135deg]" />
                   </button>
                   <button onClick={toggleMute} className={`p-4 rounded-full ${isMuted ? 'bg-white text-black' : 'bg-gray-700/50 text-white backdrop-blur-md'}`}>
                      {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                   </button>
                </div>
             </motion.div>
           )}
         </AnimatePresence>

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
               <button onClick={() => startCall('audio')}><Phone className="w-6 h-6" /></button>
               <button onClick={() => startCall('video')}><Video className="w-7 h-7" /></button>
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
  
                   <div className={`relative max-w-[70%] text-[15px] leading-snug rounded-[20px] transition-transform active:scale-[0.98] overflow-hidden ${
                     isMe 
                       ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-br-md ml-auto' 
                       : 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-bl-md'
                   } ${msg.mediaUrl ? 'p-1' : 'px-4 py-2.5'}`}>
                      {msg.mediaUrl ? (
                        <div className="space-y-1">
                          {msg.mediaType === 'video' ? (
                            <video src={msg.mediaUrl} controls className="w-full rounded-xl max-h-60 object-cover" />
                          ) : (
                            <img src={msg.mediaUrl} className="w-full rounded-xl max-h-60 object-cover" />
                          )}
                          {msg.text && <p className="px-3 pb-2 pt-1">{msg.text}</p>}
                        </div>
                      ) : (
                        <p>{msg.text}</p>
                      )}
                      
                      {/* Edited Indicator */}
                      {msg.isEdited && <span className="opacity-60 text-[10px] block text-right mt-1 font-medium italic pr-2 pb-1">edited</span>}
  
                      {/* Reaction Heart */}
                      {msg.liked && (
                        <div className={`absolute -bottom-2 ${isMe ? '-left-2' : '-right-2'} bg-white dark:bg-black rounded-full p-0.5 shadow-sm border border-gray-100 dark:border-gray-800`}>
                           <div className="bg-red-500 rounded-full p-1">
                              <Heart className="w-3 h-3 text-white fill-white" />
                           </div>
                        </div>
                      )}
                   </div>
  
                   {/* Edit Button (Only visible on hover/active for own text messages) */}
                   {isMe && !msg.mediaUrl && (
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
              <button 
                className="mr-2 text-gray-500 dark:text-gray-400 hover:text-brand-600"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="p-1 rounded-full bg-blue-500/10 text-blue-500">
                  <ImageIcon className="w-5 h-5" />
                </div>
              </button>
              <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
              />
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
                   onClick={() => handleSend()}
                   className="text-blue-500 font-semibold text-sm ml-2 hover:text-blue-600"
                 >
                   Send
                 </button>
              ) : (
                  <div className="flex space-x-3 text-gray-500 dark:text-gray-400 ml-2">
                     <button onClick={() => fileInputRef.current?.click()} className="hover:text-brand-600 transition-colors">
                       <Camera className="w-5 h-5" />
                     </button>
                     <button onClick={handleSendHeart} className="hover:text-red-500 transition-colors">
                       <Heart className="w-5 h-5" />
                     </button>
                  </div>
              )}
            </div>
         </div>
  
         {/* Edit Message Modal */}
         {editingMessage && (
           <EditMessageModal 
             message={editingMessage}
             onSave={(id: string, newText: string) => {
               onEdit(id, newText);
               setEditingMessage(null);
             }}
             onCancel={() => setEditingMessage(null)}
           />
         )}
      </div>
    );
};

// -- Newly Implemented Missing Components --

const NavItem = ({ to, icon: Icon, label, active }: any) => (
  <Link to={to} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? 'text-brand-600 dark:text-brand-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}>
    <Icon className={`w-6 h-6 ${active ? 'fill-current' : ''}`} />
    {/* <span className="text-[10px] font-medium">{label}</span> */}
  </Link>
);

const Layout = ({ children, theme, toggleTheme, isAuthenticated, onLogout }: any) => {
  const location = useLocation();
  if (!isAuthenticated && !['/login', '/signup'].includes(location.pathname)) {
      return <Navigate to="/login" replace />;
  }

  const hideNav = ['/login', '/signup', '/messages/', '/edit-profile', '/upload'].some(path => location.pathname.includes(path));
  
  // Logic for Top Header: Show on main tabs AND Login/Signup pages
  const showTopHeader = ['/', '/search', '/shop', '/profile', '/login', '/signup'].includes(location.pathname);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white font-sans transition-colors duration-200 ${theme}`}>
      <div className="mx-auto max-w-xl min-h-screen bg-white dark:bg-black shadow-2xl relative">
        
        {/* Top Header */}
        {showTopHeader && (
            <header className="fixed top-0 left-0 right-0 max-w-xl mx-auto z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 h-14 px-4 flex items-center justify-between transition-colors duration-200">
                <Link to="/" className="text-xl font-bold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                  AffiliSpeed
                </Link>
                <div className="flex items-center space-x-3">
                    <button onClick={toggleTheme} className="p-1.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    </button>
                    
                    {isAuthenticated ? (
                        <Link to="/messages" className="p-1.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
                            <MessageCircle className="w-6 h-6" />
                            <span className="absolute top-1 right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-black rounded-full"></span>
                        </Link>
                    ) : (
                         <div className="flex items-center space-x-2">
                            <Link to="/login" className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${location.pathname === '/login' ? 'bg-gray-100 dark:bg-gray-800 text-brand-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                              Log In
                            </Link>
                            <Link to="/signup" className={`text-sm font-bold px-4 py-1.5 rounded-lg transition-colors ${location.pathname === '/signup' ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'}`}>
                              Sign Up
                            </Link>
                         </div>
                    )}
                </div>
            </header>
        )}

        {/* Main Content - Added pt-14 when header is visible */}
        <main className={`${showTopHeader ? 'pt-14' : ''} ${!hideNav ? 'pb-16' : ''}`}>
            {children}
        </main>

        {!hideNav && (
            <div className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 flex justify-around items-center h-16 px-2 z-40 pb-safe-area">
            <NavItem to="/" icon={Home} label="Home" active={location.pathname === '/'} />
            <NavItem to="/search" icon={Search} label="Explore" active={location.pathname === '/search'} />
            <div className="relative -top-5">
                <Link to="/upload" className="flex items-center justify-center w-14 h-14 bg-brand-600 rounded-full shadow-lg shadow-brand-500/40 text-white transform hover:scale-105 transition-transform">
                <PlusSquare className="w-7 h-7" />
                </Link>
            </div>
            <NavItem to="/shop" icon={ShoppingBag} label="Shop" active={location.pathname === '/shop'} />
            <NavItem to="/profile" icon={User} label="Profile" active={location.pathname === '/profile'} />
            </div>
        )}
      </div>
    </div>
  );
};

const Profile = ({ user, posts, isMe, onDelete, onEdit }: { user: UserType, posts: Post[], isMe: boolean, onDelete?: (id: string) => void, onEdit?: (post: Post) => void }) => {
    const userPosts = posts.filter((p: Post) => p.userId === user.id);
    return (
        <div className="pb-20">
             <div className="p-4 flex flex-col items-center">
                <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-gray-100 dark:border-gray-800 mb-3 object-cover" />
                <h1 className="text-xl font-bold dark:text-white">{user.name}</h1>
                <p className="text-gray-500 text-sm mb-4">@{user.handle}</p>
                <div className="flex space-x-6 mb-6 text-center">
                    <Link to="/profile/followers" className="flex flex-col">
                        <span className="font-bold text-lg dark:text-white">{user.followers}</span>
                        <span className="text-xs text-gray-500">Followers</span>
                    </Link>
                    <Link to="/profile/following" className="flex flex-col">
                        <span className="font-bold text-lg dark:text-white">{user.following}</span>
                        <span className="text-xs text-gray-500">Following</span>
                    </Link>
                    <div className="flex flex-col">
                         <span className="font-bold text-lg dark:text-white">{userPosts.length}</span>
                         <span className="text-xs text-gray-500">Posts</span>
                    </div>
                </div>
                <p className="text-center text-sm mb-6 max-w-xs">{user.bio}</p>
                
                {isMe ? (
                    <div className="flex space-x-2 w-full max-w-xs">
                        <Link to="/edit-profile" className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold text-sm text-center">Edit Profile</Link>
                        <button className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold text-sm">Share Profile</button>
                    </div>
                ) : (
                    <div className="flex space-x-2 w-full max-w-xs">
                        <button className="flex-1 py-2 bg-brand-600 text-white rounded-lg font-semibold text-sm">Follow</button>
                        <button className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold text-sm">Message</button>
                    </div>
                )}
             </div>
             
             {/* Grid */}
             <div className="grid grid-cols-3 gap-0.5">
                 {userPosts.map((post: Post) => (
                     <div key={post.id} className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                         <img src={post.url} className="w-full h-full object-cover" />
                     </div>
                 ))}
             </div>
        </div>
    )
};

const PostDetail = ({ posts, onLike, onDelete, onEdit, onComment, onShare, currentUser }: any) => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const post = posts.find((p: Post) => p.id === postId);

    if (!post) return <div>Post not found</div>;

    return (
        <div className="min-h-screen bg-white dark:bg-black pt-safe-top">
            <div className="flex items-center px-4 py-3 sticky top-0 bg-white dark:bg-black z-10 border-b border-gray-100 dark:border-gray-800">
                <button onClick={() => navigate(-1)}><ChevronLeft className="w-6 h-6 dark:text-white" /></button>
                <h1 className="font-bold text-lg ml-4 dark:text-white">Post</h1>
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

const Login = ({ onLogin }: any) => {
    const navigate = useNavigate();
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin();
        navigate('/');
    };
    return (
        <div className="flex-1 h-full flex flex-col items-center justify-center p-6 bg-white dark:bg-black min-h-[calc(100vh-3.5rem)]">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-brand-600">AffiliSpeed</h1>
                    <p className="text-gray-500">Monetize your influence instantly.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="email" placeholder="Email" className="w-full p-3 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900" />
                    <input type="password" placeholder="Password" className="w-full p-3 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900" />
                    <button type="submit" className="w-full bg-brand-600 text-white p-3 rounded-lg font-bold">Log In</button>
                </form>
                <div className="text-center">
                    <p className="text-sm text-gray-500">Don't have an account? <Link to="/signup" className="text-brand-600 font-semibold">Sign up</Link></p>
                </div>
            </div>
        </div>
    );
};

const Signup = ({ onSignup }: any) => {
    const navigate = useNavigate();
    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        onSignup(CURRENT_USER);
        navigate('/');
    };
    return (
        <div className="flex-1 h-full flex flex-col items-center justify-center p-6 bg-white dark:bg-black min-h-[calc(100vh-3.5rem)]">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-brand-600">Join AffiliSpeed</h1>
                    <p className="text-gray-500">Start your affiliate journey.</p>
                </div>
                <form onSubmit={handleSignup} className="space-y-4">
                     <input type="text" placeholder="Full Name" className="w-full p-3 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900" />
                    <input type="text" placeholder="Username" className="w-full p-3 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900" />
                    <input type="email" placeholder="Email" className="w-full p-3 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900" />
                    <input type="password" placeholder="Password" className="w-full p-3 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900" />
                    <button type="submit" className="w-full bg-brand-600 text-white p-3 rounded-lg font-bold">Sign Up</button>
                </form>
                <div className="text-center">
                    <p className="text-sm text-gray-500">Already have an account? <Link to="/login" className="text-brand-600 font-semibold">Log in</Link></p>
                </div>
            </div>
        </div>
    );
};

const EditPostModal = ({ post, onSave, onCancel }: any) => {
    const [caption, setCaption] = useState(post.caption);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm p-4 space-y-4">
                <h3 className="font-bold dark:text-white">Edit Post</h3>
                <textarea 
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                    <button onClick={onCancel} className="px-4 py-2 text-gray-500">Cancel</button>
                    <button onClick={() => onSave({...post, caption})} className="px-4 py-2 bg-brand-600 text-white rounded">Save</button>
                </div>
            </div>
        </div>
    );
};

const CommentsModal = ({ post, currentUser, onClose, onAddComment, onDeleteComment, onEditComment }: any) => {
    const [text, setText] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onAddComment(post.id, text);
            setText('');
        }
    };
    return (
         <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/50">
             <div className="bg-white dark:bg-gray-900 sm:rounded-xl w-full sm:max-w-md sm:mx-auto h-[80vh] sm:h-[600px] flex flex-col shadow-2xl overflow-hidden rounded-t-2xl">
                 <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                     <h3 className="font-bold mx-auto dark:text-white">Comments</h3>
                     <button onClick={onClose} className="absolute right-3"><X className="w-6 h-6 dark:text-white" /></button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-4 space-y-4">
                     {post.comments.length === 0 && <p className="text-center text-gray-500">No comments yet.</p>}
                     {post.comments.map((comment: Comment) => (
                         <div key={comment.id} className="flex space-x-3">
                             <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                             <div className="flex-1">
                                 <p className="text-sm dark:text-white"><span className="font-bold mr-1">{comment.username}</span>{comment.text}</p>
                             </div>
                             {comment.userId === currentUser.id && (
                                 <button onClick={() => onDeleteComment(post.id, comment.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                             )}
                         </div>
                     ))}
                 </div>
                 <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center space-x-2">
                     <img src={currentUser.avatar} className="w-8 h-8 rounded-full" />
                     <input 
                        type="text" 
                        placeholder="Add a comment..." 
                        className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-sm dark:text-white outline-none" 
                        value={text}
                        onChange={e => setText(e.target.value)}
                     />
                     <button type="submit" disabled={!text.trim()} className="text-brand-600 font-semibold disabled:opacity-50">Post</button>
                 </form>
             </div>
         </div>
    );
};

const ShareModal = ({ post, onClose }: any) => {
    return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
             <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm p-4">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold dark:text-white">Share to...</h3>
                     <button onClick={onClose}><X className="w-5 h-5 dark:text-white" /></button>
                 </div>
                 <div className="grid grid-cols-4 gap-4">
                     <div className="flex flex-col items-center space-y-2">
                         <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white"><Link2 className="w-6 h-6"/></div>
                         <span className="text-xs dark:text-gray-300">Copy Link</span>
                     </div>
                     <div className="flex flex-col items-center space-y-2">
                         <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white"><MessageCircle className="w-6 h-6"/></div>
                         <span className="text-xs dark:text-gray-300">WhatsApp</span>
                     </div>
                      <div className="flex flex-col items-center space-y-2">
                         <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white"><Twitter className="w-6 h-6"/></div>
                         <span className="text-xs dark:text-gray-300">Twitter</span>
                     </div>
                      <div className="flex flex-col items-center space-y-2">
                         <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white"><Facebook className="w-6 h-6"/></div>
                         <span className="text-xs dark:text-gray-300">Facebook</span>
                     </div>
                 </div>
             </div>
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
  const handleSendMessage = (text: string, receiverId: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    const newMessage: Message = {
      id: `m_${Date.now()}`,
      senderId: currentUser.id,
      receiverId: receiverId,
      text: text,
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      timestamp: Date.now(),
      isRead: false
    };
    setMessages(prev => [...prev, newMessage]);

    // Simulate auto-reply after 2 seconds
    if (!mediaUrl) { // Only auto-reply if it's text for better flow
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
    }
  };

  // Reply to Story Logic
  const handleReplyToStory = (storyId: string, text: string) => {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    // In a real app, you might want to attach a reference to the story
    const replyText = `Replied to story: ${text}`;
    handleSendMessage(replyText, story.userId);
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
                onReplyToStory={handleReplyToStory}
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