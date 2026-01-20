import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Home, Search, PlusSquare, User, Moon, Sun, Briefcase, ShoppingBag, ChevronLeft, Camera, Check, Trash2, ExternalLink, MessageCircle, X, Edit2, Share2, Copy, Facebook, Twitter, Linkedin, Link2, LogOut, LogIn, UserPlus, Send, MessageSquare, Heart, Phone, Video, Mic, MicOff, VideoOff, Paperclip, Image as ImageIcon, Mail, Lock, AtSign, Eye, EyeOff, ArrowRight, KeyRound, MailCheck, Zap, MoreHorizontal, Globe } from 'lucide-react';
import { CURRENT_USER, INITIAL_POSTS, MOCK_STORIES, MOCK_USERS, INITIAL_MESSAGES } from './constants';
import { Post, User as UserType, Story, Comment, Message } from './types';
import PostCard from './components/PostCard';
import StoryTray from './components/StoryTray';
import { generateSmartCaption } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

// -- Icons & UI Components --

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }: any) => {
  const baseStyle = "px-6 py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center w-full text-sm tracking-wide";
  const variants = {
    primary: "bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/30 ring-1 ring-white/10",
    secondary: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700",
    outline: "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-brand-500 hover:text-brand-500 dark:hover:border-brand-400 dark:hover:text-brand-400 bg-transparent",
    ghost: "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
  };
  return <button className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`} onClick={onClick} {...props}>{children}</button>;
};

// -- Share Modal Component --

const ShareSheet = ({ isOpen, onClose, user }: { isOpen: boolean; onClose: () => void; user: UserType }) => {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;

  const profileUrl = `${window.location.origin}/#/profile/${user.id}`;
  const shareText = `Check out ${user.name} (@${user.handle}) on AffiliSpeed! 🔥`;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `AffiliSpeed - ${user.name}`,
          text: shareText,
          url: profileUrl,
        });
        onClose();
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      alert('Native sharing is not supported on this device. Please use the buttons below.');
    }
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white"><MessageCircle className="w-6 h-6" /></div>,
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + profileUrl)}`
    },
    {
      name: 'Facebook',
      icon: <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white"><Facebook className="w-6 h-6" /></div>,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`
    },
    {
      name: 'Twitter/X',
      icon: <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white"><Twitter className="w-6 h-6" /></div>,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: <div className="w-12 h-12 rounded-full bg-[#0A66C2] flex items-center justify-center text-white"><Linkedin className="w-6 h-6" /></div>,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`
    }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl p-6 relative z-10 pointer-events-auto shadow-2xl border-t border-gray-100 dark:border-gray-800"
      >
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6 sm:hidden" />
        
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold dark:text-white mb-2">Share Profile</h3>
          <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
             <img src={user.avatar} className="w-16 h-16 rounded-full object-cover mb-2 ring-2 ring-white dark:ring-gray-600" />
             <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
             <p className="text-xs text-gray-500">@{user.handle}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {socialLinks.map((link) => (
            <a 
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2 group"
              onClick={onClose}
            >
              <div className="transform group-hover:scale-110 transition-transform duration-200 shadow-sm">
                {link.icon}
              </div>
              <span className="text-[10px] text-gray-500 font-medium">{link.name}</span>
            </a>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-1.5 pl-4 rounded-xl">
             <div className="flex-1 truncate text-xs text-gray-500">{profileUrl}</div>
             <button 
               onClick={handleCopy}
               className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'}`}
             >
               {copied ? 'Copied!' : 'Copy'}
             </button>
          </div>

          <button 
            onClick={handleNativeShare}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>More Options</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// -- Authentication Components --

const AuthLayout = ({ children, title, subtitle }: { children?: React.ReactNode, title: string, subtitle: string }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1120] p-6 transition-colors duration-200 relative overflow-hidden">
    {/* Decorative Background Elements */}
    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-[120px] pointer-events-none" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

    <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-none border border-gray-100 dark:border-gray-800 relative z-10 overflow-hidden">
      {/* Top Brand Bar */}
      <div className="h-2 w-full bg-gradient-to-r from-brand-500 to-purple-600" />
      
      <div className="px-8 py-10 sm:px-10">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 mb-6 ring-1 ring-brand-100 dark:ring-brand-800">
            <Zap className="w-7 h-7 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">{title}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
    
    <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
      &copy; {new Date().getFullYear()} AffiliSpeed. All rights reserved.
    </div>
  </div>
);

const InputField = ({ label, icon: Icon, type = "text", placeholder, value, onChange, isPassword = false, onTogglePassword }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-sm font-medium"
        placeholder={placeholder}
        required
      />
      {isPassword && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          {type === "password" ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      )}
    </div>
  </div>
);

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email, 
        password: password 
      });

      if (error) {
        alert(error.message);
      } else {
        console.log("Login successful:", data.user?.email);
        onLogin();
        navigate('/');
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Log in to access your dashboard">
      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField 
          label="Email" 
          icon={Mail} 
          type="email" 
          placeholder="name@example.com" 
          value={email} 
          onChange={(e: any) => setEmail(e.target.value)} 
        />
        
        <div className="space-y-1.5">
          <div className="flex justify-between items-center ml-1">
             <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Password</label>
             <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors">
                Forgot Password?
             </Link>
          </div>
          <div className="relative group">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
                <Lock className="h-5 w-5" />
             </div>
             <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-sm font-medium"
                placeholder="Enter your password"
                required
             />
             <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
             >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
             </button>
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </Button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        New to AffiliSpeed?{' '}
        <Link to="/signup" className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
};

const SignupScreen = ({ onSignup }: { onSignup: () => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({ 
        email: email, 
        password: password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (error) {
        alert(error.message);
      } else {
        console.log("Sign up successful! Please check your email for verification.");
        // Note: Supabase defaults to email confirmation. 
        // If "Enable email confirmation" is on, user needs to verify before login works fully.
        // For a smoother demo, often developers disable it in dev, or we show a message.
        alert("Account created! If email verification is enabled, please check your inbox.");
        onSignup();
        navigate('/');
      }
    } catch (err) {
       console.error("Unexpected error:", err);
       alert("An unexpected error occurred during signup.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join the fastest affiliate community">
      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField 
          label="Full Name" 
          icon={User} 
          type="text" 
          placeholder="e.g. Alex Creator" 
          value={name} 
          onChange={(e: any) => setName(e.target.value)} 
        />
        
        <InputField 
          label="Email" 
          icon={Mail} 
          type="email" 
          placeholder="name@example.com" 
          value={email} 
          onChange={(e: any) => setEmail(e.target.value)} 
        />

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">Password</label>
          <div className="relative group">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
                <Lock className="h-5 w-5" />
             </div>
             <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-sm font-medium"
                placeholder="Create a strong password"
                required
             />
             <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
             >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
             </button>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">Must be at least 8 characters</p>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Create Account"
            )}
          </Button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call - Supabase has resetPasswordForEmail but needs SMTP setup usually
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 2000);
  };

  if (isSent) {
    return (
      <AuthLayout title="Check your email" subtitle={`We sent a link to ${email}`}>
         <div className="text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 dark:bg-green-900/20 mb-6 text-green-500 ring-1 ring-green-100 dark:ring-green-800"
            >
              <MailCheck className="w-10 h-10" />
            </motion.div>
            
            <div className="space-y-3">
              <Button onClick={() => window.open(`mailto:${email}`)}>
                Open Email App
              </Button>
              
              <Button onClick={() => setIsSent(false)} variant="ghost">
                Try another email
              </Button>
            </div>

            <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6">
              <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Log In
              </Link>
            </div>
         </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your email to get reset instructions">
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField 
          label="Email Address" 
          icon={Mail} 
          type="email" 
          placeholder="name@example.com" 
          value={email} 
          onChange={(e: any) => setEmail(e.target.value)} 
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Log In
        </Link>
      </div>
    </AuthLayout>
  );
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview || !file) return;
    setLoading(true);

    try {
      // 1. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'oxh9k9eo');
      formData.append('cloud_name', 'dgdvvnnnj');

      const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/dgdvvnnnj/auto/upload', {
        method: 'POST',
        body: formData
      });

      if (!cloudinaryRes.ok) {
        throw new Error('Cloudinary upload failed');
      }

      const cloudinaryData = await cloudinaryRes.json();
      const secureUrl = cloudinaryData.secure_url;
      const mediaType = file.type.startsWith('video') ? 'video' : 'image';

      // 2. Save to Supabase DB (Persistence)
      const { data: insertedData, error: dbError } = await supabase
        .from('posts')
        .insert([
            {
                user_id: currentUser.id,
                media_url: secureUrl,
                type: mediaType,
                caption: caption,
                affiliate_link: affiliateLink || null,
                affiliate_label: affiliateLabel || null,
                likes: 0
            }
        ])
        .select()
        .single();

      if (dbError) {
          console.error("Supabase insert error:", dbError);
          // If DB fails, we still show locally for UX
      }

      // 3. Create Post Object (Local State Update)
      const newPostData: Post = {
        id: insertedData ? insertedData.id : `p_${Date.now()}`,
        userId: currentUser.id,
        user: currentUser,
        type: mediaType,
        url: secureUrl,
        caption: caption,
        affiliateLink: affiliateLink || undefined,
        affiliateLabel: affiliateLabel || undefined,
        likes: 0,
        comments: [],
        timestamp: Date.now(),
        likedByMe: false
      };

      onPost(newPostData);
      navigate('/');
      
    } catch (error) {
      console.error("Error uploading post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
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
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const f = e.target.files[0];
        setFile(f);
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) setAvatar(ev.target.result as string);
        };
        reader.readAsDataURL(f);
      }
    };
  
    const handleSave = async () => {
      setIsLoading(true);
      try {
          let avatarUrl = avatar;

          // 1. If new file, Upload to Cloudinary
          if (file) {
              const formData = new FormData();
              formData.append('file', file);
              formData.append('upload_preset', 'oxh9k9eo'); 
              formData.append('cloud_name', 'dgdvvnnnj');

              const res = await fetch('https://api.cloudinary.com/v1_1/dgdvvnnnj/image/upload', {
                  method: 'POST',
                  body: formData
              });
              const data = await res.json();
              avatarUrl = data.secure_url;
          }

          // 2. Update Supabase Profile
          const updates = {
              id: user.id,
              full_name: name,
              username: handle,
              bio: bio,
              avatar_url: avatarUrl,
              updated_at: new Date()
          };

          const { error } = await supabase.from('profiles').upsert(updates);
          
          if (error) {
              console.error("Profile update failed:", error);
              alert("Failed to save profile. Please try again.");
          } else {
              // 3. Update Local State
              onUpdate({ ...user, name, handle, bio, avatar: avatarUrl });
              navigate('/profile');
          }
      } catch (e) {
          console.error("Error saving profile:", e);
      } finally {
          setIsLoading(false);
      }
    };
  
    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <button onClick={() => navigate(-1)} className="text-gray-900 dark:text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg dark:text-white">Edit Profile</h1>
          <button onClick={handleSave} disabled={isLoading} className="text-brand-600 font-semibold hover:text-brand-700 disabled:opacity-50">
            {isLoading ? <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /> : <Check className="w-6 h-6" />}
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

const UserProfile = ({ currentUser, posts }: { currentUser: UserType, posts: Post[] }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const viewedUser = MOCK_USERS.find(u => u.id === id) || (id === currentUser.id ? currentUser : null);

  if (!viewedUser) return <div className="p-10 text-center dark:text-white">User not found</div>;

  return (
    <div className="max-w-xl mx-auto pb-20 px-4">
       <div className="flex items-center pt-4 mb-2">
          <button onClick={() => navigate(-1)} className="mr-3 text-gray-900 dark:text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg dark:text-white">{viewedUser.handle}</h1>
       </div>
       <div className="flex flex-col items-center pt-2">
          <img src={viewedUser.avatar} className="w-24 h-24 rounded-full object-cover mb-2 border-4 border-gray-100 dark:border-gray-800" />
          <h2 className="text-xl font-bold dark:text-white">{viewedUser.name}</h2>
          <p className="text-gray-500">@{viewedUser.handle}</p>
          <p className="text-center mt-2 px-6 dark:text-gray-300">{viewedUser.bio}</p>
          <div className="flex space-x-6 mt-4 mb-6">
              <div className="text-center"><div className="font-bold dark:text-white">{viewedUser.followers}</div><div className="text-xs text-gray-500">Followers</div></div>
              <div className="text-center"><div className="font-bold dark:text-white">{viewedUser.following}</div><div className="text-xs text-gray-500">Following</div></div>
          </div>
          <div className="flex space-x-2 mb-8">
              <button className="px-6 py-2 bg-brand-600 text-white rounded-lg font-semibold text-sm shadow-lg shadow-brand-500/20">Follow</button>
              <button className="px-6 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg font-semibold text-sm dark:text-white">Message</button>
          </div>
      </div>
      <div className="grid grid-cols-3 gap-1">
          {posts.filter(p => p.userId === viewedUser.id).map(p => (
              <div key={p.id} className="aspect-square bg-gray-100 dark:bg-gray-800 relative"><img src={p.url} className="w-full h-full object-cover" /></div>
          ))}
      </div>
    </div>
  );
};

const NavItem = ({ to, icon: Icon, label, active }: any) => (
  <Link to={to} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? 'text-brand-600 dark:text-brand-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}>
    <Icon className={`w-6 h-6 ${active ? 'fill-current' : ''}`} />
    {/* <span className="text-[10px] font-medium">{label}</span> */}
  </Link>
);

const Layout = ({ children, theme, toggleTheme, isAuthenticated, onLogout, isAuthChecking }: any) => {
  const location = useLocation();

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
      </div>
    );
  }

  if (!isAuthenticated && !['/login', '/signup', '/forgot-password'].includes(location.pathname)) {
      return <Navigate to="/login" replace />;
  }

  const hideNav = ['/login', '/signup', '/forgot-password', '/messages/', '/edit-profile', '/upload'].some(path => location.pathname.includes(path));
  
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
                        <div className="flex items-center gap-3">
                            <Link to="/messages" className="p-1.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
                                <MessageCircle className="w-6 h-6" />
                                <span className="absolute top-1 right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-black rounded-full"></span>
                            </Link>
                            {/* Logout button removed from here */}
                        </div>
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

const App = () => {
  const [theme, setTheme] = useState('light');
  const [currentUser, setCurrentUser] = useState<UserType>(CURRENT_USER);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [followingIds, setFollowingIds] = useState<string[]>(['u2', 'u3']);
  const [showShareSheet, setShowShareSheet] = useState(false);

  // Define fetchProfileData logic
  const fetchProfileData = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            console.error("Error fetching profile:", error);
            return null;
        }

        if (data) {
            return {
                name: data.full_name || data.name,
                avatar: data.avatar_url, 
                bio: data.bio,
                handle: data.username || data.handle
            };
        }
    } catch (err) {
        console.error("Unexpected error fetching profile:", err);
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
        try {
            // 1. Check Initial Session
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session && mounted) {
                setIsAuthenticated(true);
                const profile = await fetchProfileData(session.user.id);
                if (mounted && profile) {
                    setCurrentUser(prev => ({
                        ...prev,
                        id: session.user.id,
                        name: profile.name || session.user.user_metadata?.full_name || prev.name,
                        handle: profile.handle || session.user.email?.split('@')[0] || prev.handle,
                        avatar: profile.avatar || prev.avatar,
                        bio: profile.bio || prev.bio
                    }));
                }
            }
        } catch (e) {
            console.error("Session check error", e);
        } finally {
            if (mounted) setIsAuthChecking(false);
        }

        // 2. Listen for Auth Changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            
            setIsAuthenticated(!!session);
            
            if (session?.user) {
                const profile = await fetchProfileData(session.user.id);
                if (mounted && profile) {
                    setCurrentUser(prev => ({
                        ...prev,
                        id: session.user.id,
                        name: profile.name || session.user.user_metadata?.full_name || prev.name,
                        handle: profile.handle || session.user.email?.split('@')[0] || prev.handle,
                        avatar: profile.avatar || prev.avatar,
                        bio: profile.bio || prev.bio
                    }));
                }
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(CURRENT_USER); // Reset to default mock user on logout
            }
            
            setIsAuthChecking(false);
        });
        
        // 3. Fetch Posts from DB
        const fetchPosts = async () => {
           try {
              const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles:user_id (
                        id,
                        username,
                        full_name,
                        avatar_url
                    )
                `)
                .order('created_at', { ascending: false });

              if (data && !error && mounted) {
                 const mappedPosts: Post[] = data.map((p: any) => ({
                    id: p.id,
                    userId: p.user_id,
                    user: {
                       id: p.profiles?.id || 'unknown',
                       name: p.profiles?.full_name || 'User',
                       handle: p.profiles?.username || 'user',
                       avatar: p.profiles?.avatar_url || 'https://via.placeholder.com/150',
                       bio: '',
                       followers: 0,
                       following: 0
                    },
                    type: p.type || 'image',
                    url: p.media_url,
                    caption: p.caption,
                    affiliateLink: p.affiliate_link,
                    affiliateLabel: p.affiliate_label,
                    likes: p.likes || 0,
                    comments: [],
                    timestamp: new Date(p.created_at).getTime(),
                    likedByMe: false
                 }));
                 // Merge with mock posts if needed, or replace. Here we replace for real data feel
                 if (mappedPosts.length > 0) {
                     setPosts(prev => [...mappedPosts, ...INITIAL_POSTS]);
                 }
              }
           } catch(e) {
               console.error("Fetch posts error", e);
           }
        };
        fetchPosts();

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    };

    init();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const handleLogin = () => {
    // This is now purely for state/navigation updates triggered by the LoginScreen
    setIsAuthenticated(true);
  };

  const handleLike = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likedByMe ? p.likes - 1 : p.likes + 1, likedByMe: !p.likedByMe } : p));
  };

  const handleDelete = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  const handleEdit = (post: Post) => {
    // Basic prompt implementation for edit
    const newCaption = prompt("Edit caption:", post.caption);
    if (newCaption !== null) {
        setPosts(posts.map(p => p.id === post.id ? { ...p, caption: newCaption } : p));
    }
  };

  const handleComment = (id: string) => {
    console.log("Comment on post", id);
  };

  const handleShare = (id: string) => {
    console.log("Share post", id);
  };

  const handlePost = (post: Post) => {
    setPosts([post, ...posts]);
  };

  const handleAddStory = (file: File, caption: string, link?: string, label?: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const story: Story = {
        id: `s_${Date.now()}`,
        userId: currentUser.id,
        user: currentUser,
        mediaUrl: e.target?.result as string,
        type: file.type.startsWith('video') ? 'video' : 'image',
        caption,
        affiliateLink: link,
        affiliateLabel: label,
        expiresAt: Date.now() + 86400000,
        viewed: false
      };
      setStories([story, ...stories]);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteStory = (id: string) => {
    setStories(stories.filter(s => s.id !== id));
  };

  const handleEditStory = (id: string, caption: string) => {
    setStories(stories.map(s => s.id === id ? { ...s, caption } : s));
  };
  
  const handleReplyStory = (storyId: string, text: string) => {
      const story = stories.find(s => s.id === storyId);
      if (story) {
        handleSendMessage(`Replied to story: ${text}`, story.userId);
      }
  };

  const handleUpdateUser = (user: UserType) => {
    setCurrentUser(user);
  };

  const handleToggleFollow = (id: string) => {
    setFollowingIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSendMessage = async (text: string, receiverId: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    // 1. Optimistic Update
    const msg: Message = {
      id: `m_${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      text,
      mediaUrl,
      mediaType,
      timestamp: Date.now(),
      isRead: false
    };
    setMessages(prev => [...prev, msg]);

    // 2. Save to Supabase Database
    try {
        const { error } = await supabase
            .from('messages')
            .insert([{ 
                sender_id: currentUser.id,
                receiver_id: receiverId,
                text: text,
                media_url: mediaUrl,
                media_type: mediaType
                // timestamp is usually auto-generated by Supabase 'created_at'
            }]);

        if (error) {
            console.error("Supabase Database Error:", error.message);
        } else {
            console.log("Message saved to Supabase!");
        }
    } catch (err) {
        console.error("Error saving message:", err);
    }
  };

  const handleEditMessage = (id: string, text: string) => {
    setMessages(messages.map(m => m.id === id ? { ...m, text, isEdited: true } : m));
  };

  const handleToggleLikeMessage = (id: string) => {
    setMessages(messages.map(m => m.id === id ? { ...m, liked: !m.liked } : m));
  };

  return (
    <Router>
      <Layout theme={theme} toggleTheme={toggleTheme} isAuthenticated={isAuthenticated} onLogout={handleLogout} isAuthChecking={isAuthChecking}>
        <Routes>
          <Route path="/login" element={<LoginScreen onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignupScreen onSignup={handleLogin} />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/" element={<Feed posts={posts} stories={stories} onLike={handleLike} onDelete={handleDelete} onEdit={handleEdit} onComment={handleComment} onShare={handleShare} onAddStory={handleAddStory} onDeleteStory={handleDeleteStory} onEditStory={handleEditStory} onReplyToStory={handleReplyStory} currentUser={currentUser} />} />
          <Route path="/search" element={<Explore posts={posts} />} />
          <Route path="/shop" element={<Shop posts={posts} />} />
          <Route path="/upload" element={<Upload onPost={handlePost} currentUser={currentUser} />} />
          <Route path="/profile" element={
             <div className="max-w-xl mx-auto pb-20 px-4">
                <div className="flex justify-end pt-4">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Logout
                    </button>
                </div>
                <div className="flex flex-col items-center -mt-2">
                    <img src={currentUser.avatar} className="w-24 h-24 rounded-full object-cover mb-2 border-4 border-gray-100 dark:border-gray-800" />
                    <h2 className="text-xl font-bold dark:text-white">{currentUser.name}</h2>
                    <p className="text-gray-500">@{currentUser.handle}</p>
                    <p className="text-center mt-2 px-6 dark:text-gray-300">{currentUser.bio}</p>
                    <div className="flex space-x-6 mt-4 mb-6">
                        <Link to="/profile/followers" className="text-center"><div className="font-bold dark:text-white">{currentUser.followers}</div><div className="text-xs text-gray-500">Followers</div></Link>
                        <Link to="/profile/following" className="text-center"><div className="font-bold dark:text-white">{currentUser.following}</div><div className="text-xs text-gray-500">Following</div></Link>
                    </div>
                    <div className="flex space-x-2 mb-8">
                        <Link to="/edit-profile" className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg font-semibold text-sm dark:text-white">Edit Profile</Link>
                        <button onClick={() => setShowShareSheet(true)} className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg font-semibold text-sm dark:text-white">Share Profile</button>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                    {posts.filter(p => p.userId === currentUser.id).map(p => (
                        <div key={p.id} className="aspect-square bg-gray-100 dark:bg-gray-800 relative"><img src={p.url} className="w-full h-full object-cover" /></div>
                    ))}
                </div>
             </div>
          } />
          {/* Public Profile View (For shared links) */}
          <Route path="/profile/:id" element={<UserProfile currentUser={currentUser} posts={posts} />} />
          <Route path="/edit-profile" element={<EditProfile user={currentUser} onUpdate={handleUpdateUser} />} />
          <Route path="/profile/followers" element={<NetworkList title="Followers" users={MOCK_USERS} followingIds={followingIds} onToggleFollow={handleToggleFollow} />} />
          <Route path="/profile/following" element={<NetworkList title="Following" users={MOCK_USERS.filter(u => followingIds.includes(u.id))} followingIds={followingIds} onToggleFollow={handleToggleFollow} />} />
          <Route path="/messages" element={<Inbox messages={messages} users={MOCK_USERS} currentUser={currentUser} />} />
          <Route path="/messages/:userId" element={<ChatRoom messages={messages} users={MOCK_USERS} currentUser={currentUser} onSend={handleSendMessage} onEdit={handleEditMessage} onToggleLike={handleToggleLikeMessage} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AnimatePresence>
          {showShareSheet && (
            <ShareSheet 
              isOpen={showShareSheet} 
              onClose={() => setShowShareSheet(false)} 
              user={currentUser} 
            />
          )}
        </AnimatePresence>
      </Layout>
    </Router>
  );
};

export default App;