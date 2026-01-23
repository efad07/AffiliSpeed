import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Home, Search, PlusSquare, User, Moon, Sun, Briefcase, ShoppingBag, ChevronLeft, Camera, Check, Trash2, ExternalLink, MessageCircle, X, Edit2, Share2, Copy, Facebook, Twitter, Linkedin, Link2, LogOut, LogIn, UserPlus, Send, MessageSquare, Heart, Phone, Video, Mic, MicOff, VideoOff, Paperclip, Image as ImageIcon, Mail, Lock, AtSign, Eye, EyeOff, ArrowRight, KeyRound, MailCheck, Zap, MoreHorizontal, Globe, AlertTriangle, RefreshCcw, Users, UserPlus as UserPlusIcon, Film, Bell, Settings, Bookmark, Shield, HelpCircle, ChevronRight, Menu } from 'lucide-react';
import { CURRENT_USER, INITIAL_POSTS, MOCK_STORIES, MOCK_USERS, INITIAL_MESSAGES, MOCK_GROUPS, MOCK_SPARKS } from './constants';
import { Post, User as UserType, Story, Comment, Message, Group } from './types';
import PostCard from './components/PostCard';
import StoryTray from './components/StoryTray';
import SparkCard from './components/SparkCard';
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
    ghost: "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30"
  };
  return <button className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`} onClick={onClick} {...props}>{children}</button>;
};

// -- Loading Screen Component --
const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-black transition-colors duration-200">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-800 border-t-brand-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Zap className="w-6 h-6 text-brand-600 animate-pulse" />
      </div>
    </div>
    <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-white tracking-tight animate-pulse">AffiliSpeed</h2>
  </div>
);

// -- Mobile Menu Component --
const MobileMenu = ({ isOpen, onClose, navItems, theme, toggleTheme, onLogout }: any) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm sm:hidden"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[80%] max-w-xs bg-white dark:bg-gray-900 z-50 shadow-2xl overflow-y-auto sm:hidden border-r border-gray-200 dark:border-gray-800"
          >
             <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-brand-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-md">
                        <Zap className="w-5 h-5 fill-current" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">AffiliSpeed</span>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                    <X className="w-6 h-6" />
                </button>
             </div>

             <nav className="px-4 py-6 space-y-1">
                {navItems.map((item: any) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={`flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${window.location.hash.endsWith(item.path) ? 'bg-brand-50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                        {item.badge > 0 && <span className="ml-auto bg-brand-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{item.badge}</span>}
                    </Link>
                ))}
             </nav>

             <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 space-y-2 pb-safe-area">
                <button 
                    onClick={toggleTheme}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl w-full text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button 
                    onClick={() => { onClose(); onLogout(); }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Log Out</span>
                </button>
             </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// -- Notification Toast Component --
const NotificationToast = ({ notification, onClose, onClick }: { notification: any, onClose: () => void, onClick: () => void }) => {
  return (
    <div className="fixed top-4 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
      <motion.div
        initial={{ y: -100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -100, opacity: 0, scale: 0.9 }}
        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-2xl rounded-2xl p-4 w-full max-w-sm pointer-events-auto cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-start space-x-3">
          <div className="relative">
            <img src={notification.sender.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            <div className="absolute -bottom-1 -right-1 bg-brand-500 text-white rounded-full p-0.5 border-2 border-white dark:border-gray-900">
              <MessageCircle className="w-3 h-3" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{notification.sender.name}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{notification.text}</p>
          </div>
          <div className="flex flex-col items-end space-y-1">
             <span className="text-[10px] text-gray-400">Now</span>
             <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
             >
                <X className="w-4 h-4" />
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
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
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl p-6 relative z-10 pointer-events-auto shadow-2xl border-t border-gray-100 dark:border-gray-800 mx-auto"
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

// -- Settings Modal Component --

const SettingsSheet = ({ isOpen, onClose, onLogout, toggleTheme, isDarkMode }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl p-6 relative z-10 pointer-events-auto shadow-2xl border-t border-gray-100 dark:border-gray-800 mx-auto"
      >
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6 sm:hidden" />
        <h3 className="text-xl font-bold dark:text-white mb-6 text-center">Settings</h3>
        
        <div className="space-y-4">
            <button 
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                <div className="flex items-center space-x-3 text-gray-900 dark:text-white">
                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    <span className="font-semibold">Dark Mode</span>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isDarkMode ? 'bg-brand-600' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : ''}`} />
                </div>
            </button>

            <button 
                onClick={() => { onClose(); onLogout(); }}
                className="w-full py-3.5 bg-red-50 dark:bg-red-900/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors"
            >
                <LogOut className="w-5 h-5" />
                <span>Log Out</span>
            </button>
        </div>
      </motion.div>
    </div>
  );
};

// -- Authentication Components --

const AuthLayout = ({ children, title, subtitle }: { children?: React.ReactNode, title: string, subtitle: string }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1120] p-6 transition-colors duration-200 relative overflow-hidden">
    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-[120px] pointer-events-none" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />
    <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-none border border-gray-100 dark:border-gray-800 relative z-10 overflow-hidden">
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
    <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">&copy; {new Date().getFullYear()} AffiliSpeed. All rights reserved.</div>
  </div>
);

const InputField = ({ label, icon: Icon, type = "text", placeholder, value, onChange, isPassword = false, onTogglePassword }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors"><Icon className="h-5 w-5" /></div>
      <input type={type} value={value} onChange={onChange} className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-sm font-medium" placeholder={placeholder} required />
      {isPassword && <button type="button" onClick={onTogglePassword} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">{type === "password" ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>}
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else { onLogin(); navigate('/'); }
    } catch (err) { alert("Error logging in"); } finally { setIsLoading(false); }
  };
  return <AuthLayout title="Welcome Back" subtitle="Log in to access your dashboard"><form onSubmit={handleSubmit} className="space-y-5"><InputField label="Email" icon={Mail} type="email" placeholder="name@example.com" value={email} onChange={(e: any) => setEmail(e.target.value)} /><div className="space-y-1.5"><div className="flex justify-between items-center ml-1"><label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Password</label><Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors">Forgot Password?</Link></div><div className="relative group"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors"><Lock className="h-5 w-5" /></div><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-sm font-medium" placeholder="Enter your password" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></div><div className="pt-2"><Button type="submit" disabled={isLoading}>{isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Sign In"}</Button></div></form><p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">New to AffiliSpeed? <Link to="/signup" className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors">Create an account</Link></p></AuthLayout>;
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
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) alert(error.message);
      else { alert("Account created! Check email."); onSignup(); navigate('/'); }
    } catch (err) { alert("Error signing up"); } finally { setIsLoading(false); }
  };
  return <AuthLayout title="Create Account" subtitle="Join the fastest affiliate community"><form onSubmit={handleSubmit} className="space-y-5"><InputField label="Full Name" icon={User} type="text" placeholder="e.g. Alex Creator" value={name} onChange={(e: any) => setName(e.target.value)} /><InputField label="Email" icon={Mail} type="email" placeholder="name@example.com" value={email} onChange={(e: any) => setEmail(e.target.value)} /><div className="space-y-1.5"><label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">Password</label><div className="relative group"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors"><Lock className="h-5 w-5" /></div><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-sm font-medium" placeholder="Create a strong password" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div><p className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">Must be at least 8 characters</p></div><div className="pt-2"><Button type="submit" disabled={isLoading}>{isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Create Account"}</Button></div></form><p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">Already have an account? <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors">Log in</Link></p></AuthLayout>;
};

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setIsLoading(true); setTimeout(() => { setIsLoading(false); setIsSent(true); }, 2000); };
  if (isSent) return <AuthLayout title="Check your email" subtitle={`We sent a link to ${email}`}><div className="text-center"><div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 dark:bg-green-900/20 mb-6 text-green-500 ring-1 ring-green-100 dark:ring-green-800"><MailCheck className="w-10 h-10" /></div><div className="space-y-3"><Button onClick={() => window.open(`mailto:${email}`)}>Open Email App</Button><Button onClick={() => setIsSent(false)} variant="ghost">Try another email</Button></div><div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6"><Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"><ChevronLeft className="w-4 h-4 mr-1" />Back to Log In</Link></div></div></AuthLayout>;
  return <AuthLayout title="Reset Password" subtitle="Enter your email to get reset instructions"><form onSubmit={handleSubmit} className="space-y-6"><InputField label="Email Address" icon={Mail} type="email" placeholder="name@example.com" value={email} onChange={(e: any) => setEmail(e.target.value)} /><Button type="submit" disabled={isLoading}>{isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Send Reset Link"}</Button></form><div className="mt-8 text-center"><Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"><ChevronLeft className="w-4 h-4 mr-1" />Back to Log In</Link></div></AuthLayout>;
};

// -- Pages -- 

const Feed = ({ posts, stories, onLike, onDelete, onEdit, onComment, onShare, onAddStory, onDeleteStory, onEditStory, onReplyToStory, currentUser, unreadCount, onOpenMenu }: any) => {
  return (
    <div className="max-w-xl mx-auto pb-20 px-0 sm:px-4">
      {/* Branding Header with Shop Icon and Menu Button */}
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-md z-30 border-b border-gray-100 dark:border-gray-800 transition-colors duration-200 sm:rounded-b-xl">
         <div className="flex items-center space-x-3">
            {/* Menu Button for Mobile */}
            <button onClick={onOpenMenu} className="sm:hidden text-gray-900 dark:text-white p-1 -ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
               <Menu className="w-7 h-7" />
            </button>
            
            <div className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-gradient-to-tr from-brand-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20 transform hover:scale-105 transition-transform duration-200">
                <Zap className="w-5 h-5 fill-current" />
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white font-sans hidden xs:block">AffiliSpeed</span>
            </div>
         </div>
         <div className="flex items-center space-x-4">
            <button className="text-gray-900 dark:text-white hover:text-red-500 transition-colors">
               <Heart className="w-7 h-7" />
            </button>
            {/* Shop icon now in header instead of Messages */}
            <Link to="/shop" className="text-gray-900 dark:text-white hover:text-brand-500 transition-colors">
               <ShoppingBag className="w-7 h-7" />
            </Link>
         </div>
      </div>

      <div className="pt-2">
        <StoryTray stories={stories} currentUser={currentUser} onAddStory={onAddStory} onDeleteStory={onDeleteStory} onEditStory={onEditStory} onReplyToStory={onReplyToStory} />
      </div>
      <div className="space-y-6 mt-4">
        {posts.map((post: Post) => <PostCard key={post.id} post={post} onLike={onLike} onDelete={onDelete} onEdit={onEdit} onCommentClick={onComment} onShare={onShare} isOwner={post.userId === currentUser.id} />)}
      </div>
    </div>
  );
};

// -- Sparks Page Component --
const Sparks = ({ sparks, onLike, onOpenMenu }: { sparks: Post[], onLike: (id: string) => void, onOpenMenu: () => void }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const index = Math.round(container.scrollTop / container.clientHeight);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeIndex]);

  return (
    <div className="flex justify-center w-full bg-gray-900 dark:bg-black relative">
      {/* Floating Menu Button for Mobile */}
      <div className="absolute top-4 left-4 z-40 sm:hidden">
         <button 
            onClick={onOpenMenu} 
            className="p-2 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors"
         >
            <Menu className="w-6 h-6" />
         </button>
      </div>

      <div 
        ref={containerRef}
        className="h-[calc(100dvh-56px)] w-full sm:max-w-md sm:border-x sm:border-gray-800 bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar relative shadow-2xl"
      >
        {sparks.map((spark, index) => (
          <SparkCard 
            key={spark.id} 
            post={spark} 
            isActive={index === activeIndex}
            onLike={onLike}
            onComment={() => console.log('Comment on spark', spark.id)}
            onShare={() => console.log('Share spark', spark.id)}
          />
        ))}
      </div>
    </div>
  );
};

const Explore = ({ posts, onOpenMenu }: { posts: Post[], onOpenMenu: () => void }) => {
  const [term, setTerm] = useState('');
  const displayedPosts = term ? posts.filter(p => p.caption.toLowerCase().includes(term.toLowerCase()) || p.user.handle.toLowerCase().includes(term.toLowerCase())) : posts;
  return (
    <div className="max-w-2xl mx-auto pb-20 px-4">
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-20 py-3 transition-colors duration-200">
        <div className="flex items-center space-x-3">
            {/* Menu Button for Mobile */}
            <button onClick={onOpenMenu} className="sm:hidden text-gray-900 dark:text-white p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
               <Menu className="w-6 h-6" />
            </button>
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" placeholder="Search users, tags, products..." className="w-full bg-gray-200 dark:bg-gray-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm" value={term} onChange={(e) => setTerm(e.target.value)} />
            </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 mt-1">{displayedPosts.map((post) => (<div key={post.id} className="relative aspect-square group cursor-pointer overflow-hidden"><img src={post.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" loading="lazy" />{post.type === 'video' && (<div className="absolute top-2 right-2"><svg className="w-5 h-5 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>)}</div>))}</div>
    </div>
  );
};

const Shop = ({ posts, onOpenMenu }: { posts: Post[], onOpenMenu: () => void }) => {
  const deals = posts.filter(p => p.affiliateLink);
  return (
    <div className="max-w-2xl mx-auto pb-20 px-4 min-h-screen">
       <div className="sticky top-0 bg-gray-50 dark:bg-black z-20 py-3 mb-2 bg-opacity-95 backdrop-blur-sm transition-colors duration-200">
           <div className="flex items-center space-x-3">
               {/* Menu Button for Mobile */}
                <button onClick={onOpenMenu} className="sm:hidden text-gray-900 dark:text-white p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold dark:text-white flex items-center">Trending Deals <span className="ml-2 text-xl">🔥</span></h1>
           </div>
       </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{deals.map(post => (<a key={post.id} href={post.affiliateLink} target="_blank" rel="noopener noreferrer" className="block bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow transform hover:-translate-y-1"><div className="aspect-square relative bg-gray-100 dark:bg-gray-800"><img src={post.url} className="w-full h-full object-cover" loading="lazy" /><div className="absolute bottom-2 left-2 bg-brand-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">{post.affiliateLabel || 'GET DEAL'}</div>{post.type === 'video' && (<div className="absolute top-2 right-2"><svg className="w-4 h-4 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>)}</div><div className="p-3"><div className="flex items-start justify-between"><p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug flex-1 mr-2">{post.caption}</p></div><div className="mt-3 flex items-center justify-between border-t border-gray-50 dark:border-gray-800 pt-2"><div className="flex items-center space-x-1.5"><img src={post.user.avatar} className="w-4 h-4 rounded-full object-cover" /><span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[80px]">{post.user.handle}</span></div><div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full"><ExternalLink className="w-3 h-3 text-brand-600 dark:text-brand-400" /></div></div></div></a>))}</div>
    </div>
  );
};

const Upload = ({ onPost, currentUser }: { onPost: (post: Post) => void, currentUser: UserType }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [affiliateLabel, setAffiliateLabel] = useState('Get Offer');
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const navigate = useNavigate();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { const f = e.target.files[0]; setFile(f); const reader = new FileReader(); reader.onloadend = () => setPreview(reader.result as string); reader.readAsDataURL(f); } };
  const handleGenerateCaption = async () => { if (!file) return; setGeneratingAI(true); const text = await generateSmartCaption(file, affiliateLabel); setCaption(text); setGeneratingAI(false); };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview || !file) return;
    setLoading(true);
    try {
      const formData = new FormData(); formData.append('file', file); formData.append('upload_preset', 'oxh9k9eo'); formData.append('cloud_name', 'dgdvvnnnj');
      const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/dgdvvnnnj/auto/upload', { method: 'POST', body: formData });
      if (!cloudinaryRes.ok) throw new Error('Cloudinary upload failed');
      const cloudinaryData = await cloudinaryRes.json();
      const secureUrl = cloudinaryData.secure_url;
      const mediaType = file.type.startsWith('video') ? 'video' : 'image';
      const { data: insertedData } = await supabase.from('posts').insert([{ user_id: currentUser.id, media_url: secureUrl, type: mediaType, caption: caption, affiliate_link: affiliateLink || null, affiliate_label: affiliateLabel || null, likes: 0 }]).select().single();
      const newPostData: Post = { id: insertedData ? insertedData.id : `p_${Date.now()}`, userId: currentUser.id, user: currentUser, type: mediaType, url: secureUrl, caption: caption, affiliateLink: affiliateLink || undefined, affiliateLabel: affiliateLabel || undefined, likes: 0, comments: [], timestamp: Date.now(), likedByMe: false };
      onPost(newPostData); navigate('/');
    } catch (error) { alert("Failed to create post. Please try again."); } finally { setLoading(false); }
  };
  return (
    <div className="max-w-xl mx-auto min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10"><button onClick={() => navigate(-1)} className="mr-3 text-gray-900 dark:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><ChevronLeft className="w-6 h-6" /></button><h1 className="font-bold text-lg dark:text-white">New Post</h1></div>
      <div className="p-4 pb-20">{!preview ? (<div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl h-64 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-500"><input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" id="file-upload" /><label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center"><PlusSquare className="w-12 h-12 mb-2 text-brand-500" /><span>Select Photo or Video</span></label></div>) : (<form onSubmit={handleSubmit} className="space-y-4"><div className="relative aspect-video rounded-xl overflow-hidden bg-black">{file?.type.startsWith('video') ? (<video src={preview} className="w-full h-full object-contain" controls />) : (<img src={preview} className="w-full h-full object-contain" />)}<button type="button" onClick={() => setPreview(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div><div className="space-y-2"><label className="text-sm font-medium dark:text-gray-300">Caption</label><div className="relative"><textarea className="w-full p-3 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" rows={3} placeholder="Write a caption..." value={caption} onChange={e => setCaption(e.target.value)} /><button type="button" onClick={handleGenerateCaption} disabled={generatingAI} className="absolute right-2 bottom-2 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-2 py-1 rounded-md flex items-center transition-colors">{generatingAI ? 'Thinking...' : '✨ Magic Caption'}</button></div></div><div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-xl space-y-3"><div className="flex items-center space-x-2 text-brand-700 dark:text-brand-400 font-semibold mb-1"><Briefcase className="w-4 h-4" /><span>Affiliate Details</span></div><div><label className="text-xs font-medium dark:text-gray-400">Product Link</label><input type="url" className="w-full p-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm" placeholder="https://amazon.com/..." value={affiliateLink} onChange={e => setAffiliateLink(e.target.value)} /></div><div><label className="text-xs font-medium dark:text-gray-400">Button Label</label><input type="text" className="w-full p-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm" placeholder="e.g. 50% OFF" value={affiliateLabel} onChange={e => setAffiliateLabel(e.target.value)} /></div></div><Button type="submit" disabled={loading} className="w-full py-3">{loading ? 'Posting...' : 'Share Post'}</Button></form>)}</div>
    </div>
  );
};

// -- Inbox Component --

const Inbox = ({ messages, users, currentUser, groups, onCreateGroup }: { messages: Message[], users: UserType[], currentUser: UserType, groups: Group[], onCreateGroup: (name: string, members: string[]) => void }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewChat, setShowNewChat] = useState(false);
    
    // Group creation state
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
    // 1. Process 1-on-1 conversations
    const userConversations = users.map(user => {
      const userMessages = messages.filter(m => 
        (m.senderId === user.id && m.receiverId === currentUser.id) || 
        (m.senderId === currentUser.id && m.receiverId === user.id)
      );
      userMessages.sort((a, b) => b.timestamp - a.timestamp);
      return {
        id: user.id,
        user,
        lastMessage: userMessages[0],
        unreadCount: userMessages.filter(m => m.receiverId === currentUser.id && !m.isRead).length,
        type: 'direct'
      };
    }).filter(c => c.lastMessage);

    // 2. Process Group conversations
    const groupConversations = groups.map(group => {
        if (!group.members.includes(currentUser.id)) return null;
        
        const groupMessages = messages.filter(m => m.receiverId === group.id);
        groupMessages.sort((a, b) => b.timestamp - a.timestamp);
        
        return {
            id: group.id,
            group,
            lastMessage: groupMessages[0] || { timestamp: group.created_at, text: 'Group created' }, // Fallback if no messages yet
            unreadCount: groupMessages.filter(m => m.timestamp > (Date.now() - 86400000) && !m.isRead).length, // Simplified unread logic for groups
            type: 'group'
        };
    }).filter(Boolean) as any[];

    // 3. Merge and Sort
    const allConversations = [...userConversations, ...groupConversations].sort((a, b) => {
        const timeA = a.lastMessage?.timestamp || 0;
        const timeB = b.lastMessage?.timestamp || 0;
        return timeB - timeA;
    });
  
    const filteredConversations = allConversations.filter(c => {
        if (c.type === 'direct') {
            return c.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.user.handle.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
            return c.group.name.toLowerCase().includes(searchTerm.toLowerCase());
        }
    });

    const handleCreateGroupSubmit = () => {
        if (!newGroupName.trim() || selectedMembers.length === 0) return;
        onCreateGroup(newGroupName, selectedMembers);
        setIsCreatingGroup(false);
        setNewGroupName('');
        setSelectedMembers([]);
        setShowNewChat(false);
    };

    const toggleMemberSelection = (userId: string) => {
        if (selectedMembers.includes(userId)) {
            setSelectedMembers(prev => prev.filter(id => id !== userId));
        } else {
            setSelectedMembers(prev => [...prev, userId]);
        }
    };
  
    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-black min-h-screen pb-20">
        <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-white dark:bg-black z-10">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <ChevronLeft className="w-7 h-7 text-gray-900 dark:text-white -ml-2 mr-1" />
              <h1 className="font-bold text-xl dark:text-white">{currentUser.handle}</h1>
          </div>
          <button onClick={() => setShowNewChat(true)} className="text-gray-900 dark:text-white">
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
              <p className="text-sm">Start a conversation or create a group!</p>
            </div>
          ) : (
            filteredConversations.map(convo => {
              const isRead = convo.unreadCount === 0;
              const linkTarget = `/messages/${convo.id}`;
              const displayName = convo.type === 'direct' ? convo.user.name : convo.group.name;
              const displayAvatar = convo.type === 'direct' ? convo.user.avatar : convo.group.avatar;
              const lastMsgText = convo.lastMessage?.text || "Started a chat";
              const lastMsgSenderId = convo.lastMessage?.senderId;
              const isMeSender = lastMsgSenderId === currentUser.id;

              return (
                <Link 
                  to={linkTarget} 
                  key={convo.id}
                  className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors active:bg-gray-100 dark:active:bg-gray-800"
                >
                  <div className="relative mr-3">
                     <img src={displayAvatar} className="w-14 h-14 rounded-full object-cover" />
                     {convo.type === 'group' && (
                         <div className="absolute -bottom-1 -right-1 bg-white dark:bg-black rounded-full p-0.5">
                             <div className="bg-brand-500 rounded-full p-1"><Users className="w-3 h-3 text-white"/></div>
                         </div>
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-center mb-0.5">
                       <h3 className={`text-sm truncate pr-2 ${!isRead ? 'font-bold text-gray-900 dark:text-white' : 'font-normal text-gray-900 dark:text-white'}`}>
                         {displayName}
                       </h3>
                     </div>
                     <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                       <p className={`truncate max-w-[180px] ${!isRead ? 'font-bold text-gray-900 dark:text-white' : ''}`}>
                         {isMeSender ? 'You: ' : ''}
                         {convo.lastMessage.mediaUrl ? 'Sent a media' : lastMsgText}
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

        {/* New Chat / Create Group Modal */}
        <AnimatePresence>
          {showNewChat && (
            <motion.div 
               initial={{ opacity: 0, y: "100%" }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: "100%" }}
               className="fixed inset-0 z-50 bg-white dark:bg-black flex flex-col"
            >
               <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                  <button onClick={() => { setShowNewChat(false); setIsCreatingGroup(false); }} className="text-gray-900 dark:text-white">
                    <X className="w-6 h-6" />
                  </button>
                  <h2 className="font-bold text-lg dark:text-white">{isCreatingGroup ? "New Group" : "New Message"}</h2>
                  {isCreatingGroup ? (
                      <button 
                        onClick={handleCreateGroupSubmit} 
                        disabled={!newGroupName.trim() || selectedMembers.length === 0}
                        className="text-brand-600 font-bold disabled:opacity-50"
                      >
                          Create
                      </button>
                  ) : (
                      <div className="w-6" /> 
                  )}
               </div>

               <div className="p-4 overflow-y-auto">
                  {!isCreatingGroup ? (
                      <>
                        <button 
                            onClick={() => setIsCreatingGroup(true)}
                            className="flex items-center space-x-3 p-3 w-full hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl mb-2 text-brand-600"
                        >
                            <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                            <span className="font-bold">Create a New Group</span>
                        </button>
                        
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">Suggested</h3>
                        {users.filter(u => u.id !== currentUser.id).map(user => (
                            <div 
                            key={user.id} 
                            onClick={() => {
                                navigate(`/messages/${user.id}`);
                                setShowNewChat(false);
                            }}
                            className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl cursor-pointer"
                            >
                            <img src={user.avatar} className="w-12 h-12 rounded-full object-cover" />
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                                <p className="text-sm text-gray-500">@{user.handle}</p>
                            </div>
                            </div>
                        ))}
                      </>
                  ) : (
                      <div className="space-y-4">
                          <div className="space-y-2">
                              <label className="text-sm font-medium dark:text-gray-300">Group Name</label>
                              <input 
                                  type="text" 
                                  className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-900 border-none outline-none dark:text-white"
                                  placeholder="e.g. Besties"
                                  value={newGroupName}
                                  onChange={e => setNewGroupName(e.target.value)}
                              />
                          </div>
                          
                          <div>
                              <h3 className="text-sm font-semibold text-gray-500 mb-2">Add Members</h3>
                              {users.filter(u => u.id !== currentUser.id).map(user => {
                                  const isSelected = selectedMembers.includes(user.id);
                                  return (
                                    <div 
                                        key={user.id} 
                                        onClick={() => toggleMemberSelection(user.id)}
                                        className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer border ${isSelected ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                                    >
                                        <div className="relative">
                                            <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" />
                                            {isSelected && (
                                                <div className="absolute -bottom-1 -right-1 bg-brand-500 text-white rounded-full p-0.5">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">{user.name}</p>
                                            <p className="text-xs text-gray-500">@{user.handle}</p>
                                        </div>
                                    </div>
                                  );
                              })}
                          </div>
                      </div>
                  )}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
};

const EditMessageModal = ({ message, onSave, onCancel }: any) => {
  const [text, setText] = useState(message.text);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 w-full max-w-sm">
        <h3 className="font-bold mb-2 dark:text-white">Edit Message</h3>
        <input 
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="px-3 py-1 text-gray-500">Cancel</button>
          <button onClick={() => onSave(message.id, text)} className="px-3 py-1 bg-brand-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

// -- ChatRoom Component --

const ChatRoom = ({ messages, users, groups, currentUser, onSend, onEdit, onToggleLike }: { messages: Message[], users: UserType[], groups: Group[], currentUser: UserType, onSend: (text: string, receiverId: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void, onEdit: (id: string, text: string) => void, onToggleLike: (id: string) => void }) => {
    const { userId } = useParams(); // This can be userId OR groupId
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Determine if we are in a group or direct chat
    const partner = users.find(u => u.id === userId);
    const activeGroup = groups.find(g => g.id === userId);
    
    // Call States (Direct chat only for now)
    const [isCalling, setIsCalling] = useState(false);
    const [callType, setCallType] = useState<'audio' | 'video' | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);

    // Camera Capture States
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const cameraVideoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Filter messages for this chat
    const chatMessages = messages.filter(m => {
        if (activeGroup) {
            return m.receiverId === activeGroup.id;
        } else if (partner) {
            return (m.senderId === currentUser.id && m.receiverId === partner.id) ||
                   (m.senderId === partner.id && m.receiverId === currentUser.id);
        }
        return false;
    }).sort((a, b) => a.timestamp - b.timestamp);
  
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
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
      };
    }, [localStream, cameraStream]);
  
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

    // --- Camera Capture Logic ---
    const startCamera = async () => {
        try {
            setShowCameraModal(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
            setCameraStream(stream);
            if (cameraVideoRef.current) {
                cameraVideoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            alert("Unable to access camera. Please allow camera permissions.");
            setShowCameraModal(false);
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setShowCameraModal(false);
    };

    const capturePhoto = () => {
        if (cameraVideoRef.current && canvasRef.current && userId) {
            const video = cameraVideoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                onSend("", userId, dataUrl, 'image');
                stopCamera();
            }
        }
    };

    // --- Call Logic ---
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
  
    if (!partner && !activeGroup) return <div>Chat not found</div>;
    
    // Header Info
    const chatTitle = activeGroup ? activeGroup.name : partner?.name;
    const chatAvatar = activeGroup ? activeGroup.avatar : partner?.avatar;
    const chatSubtitle = activeGroup ? `${activeGroup.members.length} members` : 'Active now';
  
    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-black h-screen flex flex-col relative">
         {/* Call Overlay */}
         <AnimatePresence>
           {isCalling && partner && (
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

         {/* Camera Capture Modal */}
         <AnimatePresence>
            {showCameraModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-black flex flex-col"
                >
                    <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                        <video 
                            ref={el => {
                                if (el && cameraStream) el.srcObject = cameraStream;
                                // @ts-ignore
                                cameraVideoRef.current = el;
                            }}
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        
                        <button onClick={stopCamera} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-6 bg-black flex justify-center items-center pb-12">
                         <button 
                            onClick={capturePhoto} 
                            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-transparent active:bg-white/20 transition-colors"
                        >
                            <div className="w-16 h-16 rounded-full bg-white"></div>
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
            <div className="flex items-center space-x-3 flex-1 cursor-pointer" onClick={() => partner ? navigate(`/profile/${partner.id}`) : null}>
               <div className="relative">
                  <img src={chatAvatar} className="w-8 h-8 rounded-full object-cover" />
                  {!activeGroup && <div className="absolute bottom-0 right-0 bg-green-500 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-black"></div>}
               </div>
               <div className="flex flex-col">
                  <h2 className="font-bold text-sm dark:text-white leading-none mb-0.5">{chatTitle}</h2>
                  <p className="text-[10px] text-gray-500">{chatSubtitle}</p>
               </div>
            </div>
            {!activeGroup && (
                <div className="flex space-x-4 text-gray-900 dark:text-white">
                    <button onClick={() => startCall('audio')}><Phone className="w-6 h-6" /></button>
                    <button onClick={() => startCall('video')}><Video className="w-7 h-7" /></button>
                </div>
            )}
         </div>
  
         {/* Messages Area */}
         <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white dark:bg-black" ref={scrollRef}>
            <div className="flex flex-col items-center py-6">
               <img src={chatAvatar} className="w-20 h-20 rounded-full object-cover mb-3" />
               <h3 className="text-lg font-bold dark:text-white">{chatTitle}</h3>
               <p className="text-sm text-gray-500">{activeGroup ? `Group created on ${new Date(activeGroup.created_at).toLocaleDateString()}` : 'Instagram-style messaging on AffiliSpeed'}</p>
               {partner && <button className="mt-4 px-4 py-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg text-sm font-semibold dark:text-white">View Profile</button>}
            </div>
  
            <div className="text-center text-xs text-gray-400 my-4">TODAY</div>
  
            {chatMessages.map((msg, idx) => {
              const isMe = msg.senderId === currentUser.id;
              const prevMsg = chatMessages[idx - 1];
              const isSequence = prevMsg && prevMsg.senderId === msg.senderId;
              
              // Find sender info for group chats
              const sender = users.find(u => u.id === msg.senderId) || currentUser;

              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-1`}
                  onDoubleClick={() => handleDoubleTap(msg.id)}
                >
                   {/* Show Sender Name in Group Chat if it's not me */}
                   {activeGroup && !isMe && !isSequence && (
                       <span className="text-[10px] text-gray-500 ml-9 mb-0.5">{sender.name}</span>
                   )}

                   <div className="flex group relative max-w-[80%]">
                        {!isMe && !isSequence && (
                            <img src={sender.avatar} className="w-7 h-7 rounded-full object-cover mr-2 self-end mb-1" />
                        )}
                        {!isMe && isSequence && <div className="w-9 mr-0"></div>}
        
                        <div className={`relative text-[15px] leading-snug rounded-[20px] transition-transform active:scale-[0.98] overflow-hidden ${
                            isMe 
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-br-md' 
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
                </div>
              );
            })}
            
            <div className="flex justify-end mt-1">
               <span className="text-[10px] font-semibold text-gray-400 mr-2">Seen</span>
            </div>
         </div>

         {/* Restored Input Footer */}
         <div className="p-3 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 sticky bottom-0 z-20 pb-safe-area">
             <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-2">
                 {/* Camera Button - Opens Live Camera */}
                 <button onClick={startCamera} className="p-1 text-brand-600 dark:text-brand-500">
                    <div className="bg-brand-100 dark:bg-brand-900/30 p-1.5 rounded-full">
                        <Camera className="w-5 h-5" />
                    </div>
                 </button>
                 
                 {/* Gallery Input Hidden Field */}
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*,video/*" 
                    onChange={handleFileSelect} 
                 />
                 
                 <input 
                    type="text" 
                    className="flex-1 bg-transparent border-none outline-none text-sm max-h-20 py-2 dark:text-white placeholder-gray-500"
                    placeholder="Message..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                 />
                 {text.trim() ? (
                     <button onClick={() => handleSend()} className="text-brand-600 font-semibold text-sm">Send</button>
                 ) : (
                     <>
                        {/* Gallery Button - Opens File Picker */}
                        <button className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                            <ImageIcon className="w-6 h-6" onClick={() => fileInputRef.current?.click()}/>
                        </button>
                        <button onClick={handleSendHeart} className="text-red-500 hover:scale-110 transition-transform">
                            <Heart className="w-7 h-7 fill-current" />
                        </button>
                     </>
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

const UserProfile = ({ currentUser, posts, users, followingIds, onToggleFollow }: any) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showShareSheet, setShowShareSheet] = useState(false);
  
  const isMe = !id || id === currentUser.id;
  const profileUser = isMe ? currentUser : users.find((u: UserType) => u.id === id);
  
  if (!profileUser) return <div className="p-8 text-center text-gray-500">User not found</div>;

  const userPosts = posts.filter((p: Post) => p.userId === profileUser.id);
  const isFollowing = followingIds.includes(profileUser.id);

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-white dark:bg-black z-20">
         <div className="font-bold text-xl dark:text-white flex items-center">
            {profileUser.handle}
            {profileUser.isVerified && <span className="ml-1 text-blue-500"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></span>}
         </div>
         <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/upload')}><PlusSquare className="w-6 h-6 dark:text-white" /></button>
            {isMe && <button onClick={() => navigate('/edit-profile')}><MoreHorizontal className="w-6 h-6 dark:text-white" /></button>}
         </div>
      </div>

      <div className="px-4 mb-6">
         <div className="flex items-center mb-6">
            <img src={profileUser.avatar} className="w-20 h-20 rounded-full object-cover mr-6 ring-2 ring-gray-100 dark:ring-gray-800" />
            <div className="flex-1 flex justify-around text-center">
               <div><div className="font-bold text-lg dark:text-white">{userPosts.length}</div><div className="text-xs text-gray-500">Posts</div></div>
               <Link to="/profile/followers"><div><div className="font-bold text-lg dark:text-white">{profileUser.followers}</div><div className="text-xs text-gray-500">Followers</div></div></Link>
               <Link to="/profile/following"><div><div className="font-bold text-lg dark:text-white">{profileUser.following}</div><div className="text-xs text-gray-500">Following</div></div></Link>
            </div>
         </div>
         
         <div className="mb-4">
            <div className="font-bold dark:text-white text-base">{profileUser.name}</div>
            <p className="text-sm text-gray-900 dark:text-gray-300 whitespace-pre-wrap">{profileUser.bio}</p>
         </div>

         <div className="flex space-x-2">
            {isMe ? (
               <>
                 <button onClick={() => navigate('/edit-profile')} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold py-1.5 rounded-lg text-sm">Edit Profile</button>
                 <button onClick={() => setShowShareSheet(true)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold py-1.5 rounded-lg text-sm">Share Profile</button>
               </>
            ) : (
               <>
                 <button 
                   onClick={() => onToggleFollow(profileUser.id)}
                   className={`flex-1 font-semibold py-1.5 rounded-lg text-sm transition-colors ${isFollowing ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'bg-brand-600 text-white'}`}
                 >
                   {isFollowing ? 'Following' : 'Follow'}
                 </button>
                 <button onClick={() => navigate(`/messages/${profileUser.id}`)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold py-1.5 rounded-lg text-sm">Message</button>
               </>
            )}
         </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-0.5">
         {userPosts.map((post: Post) => (
            <div key={post.id} className="relative aspect-square bg-gray-100 dark:bg-gray-900">
               <img src={post.url} className="w-full h-full object-cover" loading="lazy" />
               {post.type === 'video' && (
                  <div className="absolute top-1 right-1">
                     <svg className="w-4 h-4 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
               )}
            </div>
         ))}
      </div>
      <AnimatePresence>
         {showShareSheet && <ShareSheet isOpen={showShareSheet} onClose={() => setShowShareSheet(false)} user={profileUser} />}
      </AnimatePresence>
    </div>
  );
};

const EditProfile = ({ user, onUpdate }: any) => {
  const navigate = useNavigate();
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);
  const [bio, setBio] = useState(user.bio);
  
  const handleSave = () => {
    onUpdate({ ...user, name, handle, bio });
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
       <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-black z-10">
          <button onClick={() => navigate(-1)} className="text-gray-900 dark:text-white">Cancel</button>
          <h1 className="font-bold text-base dark:text-white">Edit Profile</h1>
          <button onClick={handleSave} className="text-brand-600 font-bold">Done</button>
       </div>
       <div className="p-6 flex flex-col items-center">
          <div className="mb-6 flex flex-col items-center">
             <img src={user.avatar} className="w-24 h-24 rounded-full object-cover mb-3" />
             <button className="text-brand-600 font-semibold text-sm">Change Profile Photo</button>
          </div>
          <div className="w-full space-y-4">
             <div>
                <label className="text-xs text-gray-500">Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full border-b border-gray-200 dark:border-gray-800 py-2 bg-transparent dark:text-white outline-none" />
             </div>
             <div>
                <label className="text-xs text-gray-500">Username</label>
                <input value={handle} onChange={e => setHandle(e.target.value)} className="w-full border-b border-gray-200 dark:border-gray-800 py-2 bg-transparent dark:text-white outline-none" />
             </div>
             <div>
                <label className="text-xs text-gray-500">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full border-b border-gray-200 dark:border-gray-800 py-2 bg-transparent dark:text-white outline-none resize-none" rows={3} />
             </div>
          </div>
       </div>
    </div>
  );
};

const NetworkList = ({ title, users, followingIds, onToggleFollow }: any) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-black z-10">
         <button onClick={() => navigate(-1)} className="mr-4 text-gray-900 dark:text-white"><ChevronLeft className="w-6 h-6" /></button>
         <h1 className="font-bold text-lg dark:text-white">{title}</h1>
      </div>
      <div className="p-4 space-y-4">
         {users.map((user: UserType) => {
            const isFollowing = followingIds.includes(user.id);
            return (
              <div key={user.id} className="flex items-center justify-between">
                 <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)}>
                    <img src={user.avatar} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                       <div className="font-bold dark:text-white text-sm">{user.handle}</div>
                       <div className="text-xs text-gray-500">{user.name}</div>
                    </div>
                 </div>
                 <button 
                   onClick={() => onToggleFollow(user.id)}
                   className={`px-4 py-1.5 rounded-lg text-xs font-bold ${isFollowing ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700' : 'bg-brand-600 text-white'}`}
                 >
                   {isFollowing ? 'Following' : 'Follow'}
                 </button>
              </div>
            );
         })}
      </div>
    </div>
  );
};

const Layout = ({ children, theme, toggleTheme, isAuthenticated, onLogout, isAuthChecking, unreadCount, isMobileMenuOpen, closeMobileMenu }: any) => {
  const location = useLocation();
  const navigate = useNavigate();

  if (isAuthChecking) return <LoadingScreen />;

  // Public routes that don't need the main layout wrapper
  const publicRoutes = ['/login', '/signup', '/forgot-password'];
  if (publicRoutes.includes(location.pathname)) {
    return <div className={theme}>{children}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Film, label: 'Sparks', path: '/sparks' },
    { icon: Search, label: 'Explore', path: '/search' },
    { icon: PlusSquare, label: 'Create', path: '/upload' },
    { icon: ShoppingBag, label: 'Deals', path: '/shop' },
    { icon: MessageCircle, label: 'Messages', path: '/messages', badge: unreadCount },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className={theme}>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} navItems={navItems} theme={theme} toggleTheme={toggleTheme} onLogout={onLogout} />
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-200 flex flex-col sm:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden sm:flex flex-col w-64 fixed h-full bg-white dark:bg-black border-r border-gray-100 dark:border-gray-800 z-30">
          <div className="p-6 flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-brand-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight">AffiliSpeed</span>
          </div>
          
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-brand-50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <div className="relative">
                    <item.icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${isActive ? 'fill-current' : ''}`} />
                    {item.badge > 0 && <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">{item.badge}</span>}
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <button 
              onClick={toggleTheme}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl w-full text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button 
              onClick={onLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 sm:ml-64 relative min-h-screen pb-16 sm:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 flex justify-around items-center px-2 py-3 z-40 pb-safe-area">
          {/* We simplify mobile nav to 5 items usually */}
          <Link to="/" className={`p-2 ${location.pathname === '/' ? 'text-brand-600' : 'text-gray-400'}`}><Home className="w-6 h-6" /></Link>
          <Link to="/sparks" className={`p-2 ${location.pathname === '/sparks' ? 'text-brand-600' : 'text-gray-400'}`}><Film className="w-6 h-6" /></Link>
          <Link to="/upload" className="p-2"><div className="bg-brand-600 text-white rounded-xl p-1"><PlusSquare className="w-6 h-6" /></div></Link>
          <Link to="/shop" className={`p-2 ${location.pathname === '/shop' ? 'text-brand-600' : 'text-gray-400'}`}><ShoppingBag className="w-6 h-6" /></Link>
          <Link to="/profile" className={`p-2 ${location.pathname === '/profile' ? 'text-brand-600' : 'text-gray-400'}`}><User className="w-6 h-6" /></Link>
        </div>
      </div>
    </div>
  );
};

// -- App Component (Main Logic) --

const App = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [sparks, setSparks] = useState<Post[]>(MOCK_SPARKS);
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [currentUser, setCurrentUser] = useState<UserType>(CURRENT_USER);
  const [users, setUsers] = useState<UserType[]>(MOCK_USERS);
  const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS); 
  const [followingIds, setFollowingIds] = useState<string[]>(['u1', 'u3']);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: Message, sender: UserType } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
  }, []);

  useEffect(() => {
      const timer = setTimeout(() => {
          const fakeIncomingMsg: Message = {
              id: `m_sim_${Date.now()}`,
              senderId: 'u1', 
              receiverId: currentUser.id,
              text: "Hey! Just saw you liked my post. Want to collab on a video? 🎥",
              timestamp: Date.now(),
              isRead: false
          };
          setMessages(prev => [...prev, fakeIncomingMsg]);
      }, 5000);
      return () => clearTimeout(timer);
  }, [currentUser.id]);

  useEffect(() => {
      const count = messages.filter(m => m.receiverId === currentUser.id && !m.isRead).length;
      setUnreadCount(count);
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.receiverId === currentUser.id && lastMsg.senderId !== currentUser.id && !lastMsg.isRead) {
          const sender = users.find(u => u.id === lastMsg.senderId);
          if (sender) {
              setNotification({ message: lastMsg, sender });
              if (audioRef.current) {
                  audioRef.current.volume = 0.5;
                  audioRef.current.play().catch(e => console.log("Audio play failed", e));
              }
              setTimeout(() => setNotification(null), 4000);
          }
      }
  }, [messages, currentUser.id, users]);

  useEffect(() => {
      if (!isAuthenticated) return;
      const channel = supabase.channel('realtime messages').subscribe();
      return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsAuthChecking(false);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const handleLogout = async () => { await supabase.auth.signOut(); setIsAuthenticated(false); };

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, likes: p.likedByMe ? p.likes - 1 : p.likes + 1, likedByMe: !p.likedByMe };
      }
      return p;
    }));
  };

  const handleSparkLike = (id: string) => {
    setSparks(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, likes: p.likedByMe ? p.likes - 1 : p.likes + 1, likedByMe: !p.likedByMe };
        }
        return p;
      }));
  }

  const handlePost = (newPost: Post) => setPosts(prev => [newPost, ...prev]);
  const handleDeletePost = (id: string) => setPostToDelete(id);
  const confirmDelete = async () => {
    if (!postToDelete) return;
    const id = postToDelete;
    setPostToDelete(null);
    setPosts(prev => prev.filter(p => p.id !== id));
    try { await supabase.from('posts').delete().eq('id', id); } catch(e) { console.error(e); }
  };

  const handleAddStory = (file: File, caption: string, link?: string, label?: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
       const url = e.target?.result as string;
       const newStory: Story = { id: `s_${Date.now()}`, userId: currentUser.id, user: currentUser, mediaUrl: url, type: file.type.startsWith('video') ? 'video' : 'image', caption: caption, affiliateLink: link, affiliateLabel: label, expiresAt: Date.now() + 86400000, viewed: false };
       setStories(prev => [newStory, ...prev]);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteStory = (id: string) => setStories(prev => prev.filter(s => s.id !== id));
  const handleEditStory = (id: string, caption: string) => setStories(prev => prev.map(s => s.id === id ? { ...s, caption } : s));
  const handleReplyToStory = (storyId: string, text: string) => {
      const story = stories.find(s => s.id === storyId);
      if (story) handleSendMsg(`Replied to story: ${text}`, story.userId);
  };

  const handleSendMsg = (text: string, receiverId: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
      const newMsg: Message = { id: `m_${Date.now()}`, senderId: currentUser.id, receiverId: receiverId, text, mediaUrl, mediaType, timestamp: Date.now(), isRead: false };
      setMessages(prev => [...prev, newMsg]);
  };

  const handleEditMessage = (id: string, text: string) => setMessages(prev => prev.map(m => m.id === id ? { ...m, text, isEdited: true } : m));
  const handleToggleMessageLike = (id: string) => setMessages(prev => prev.map(m => m.id === id ? { ...m, liked: !m.liked } : m));

  const handleUpdateProfile = (updatedUser: UserType) => {
      setCurrentUser(updatedUser);
      setPosts(prev => prev.map(p => p.userId === updatedUser.id ? { ...p, user: updatedUser } : p));
  };

  const handleToggleFollow = (targetUserId: string) => {
      const isFollowing = followingIds.includes(targetUserId);
      const newFollowingIds = isFollowing ? followingIds.filter(id => id !== targetUserId) : [...followingIds, targetUserId];
      setFollowingIds(newFollowingIds);
      setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, followers: isFollowing ? Math.max(0, u.followers - 1) : u.followers + 1 } : u));
      setCurrentUser(prev => ({ ...prev, following: isFollowing ? Math.max(0, prev.following - 1) : prev.following + 1 }));
  };

  const handleCreateGroup = (name: string, members: string[]) => {
      const newGroup: Group = { id: `g_${Date.now()}`, name: name, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`, members: [...members, currentUser.id], adminId: currentUser.id, created_at: Date.now() };
      setGroups(prev => [newGroup, ...prev]);
      handleSendMsg(`Created group "${name}"`, newGroup.id);
  };

  return (
    <Router>
      <Layout 
        theme={theme} 
        toggleTheme={toggleTheme} 
        isAuthenticated={isAuthenticated} 
        onLogout={handleLogout} 
        isAuthChecking={isAuthChecking} 
        unreadCount={unreadCount}
        isMobileMenuOpen={isMobileMenuOpen}
        closeMobileMenu={() => setIsMobileMenuOpen(false)}
      >
         <Routes>
             <Route path="/login" element={<LoginScreen onLogin={() => setIsAuthenticated(true)} />} />
             <Route path="/signup" element={<SignupScreen onSignup={() => setIsAuthenticated(true)} />} />
             <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
             <Route path="/" element={<Feed posts={posts} stories={stories} onLike={handleLike} onDelete={handleDeletePost} onEdit={(post) => console.log('Edit', post)} onComment={(id) => console.log('Comment', id)} onShare={(id) => console.log('Share', id)} onAddStory={handleAddStory} onDeleteStory={handleDeleteStory} onEditStory={handleEditStory} onReplyToStory={handleReplyToStory} currentUser={currentUser} unreadCount={unreadCount} onOpenMenu={() => setIsMobileMenuOpen(true)} />} />
             <Route path="/sparks" element={<Sparks sparks={sparks} onLike={handleSparkLike} onOpenMenu={() => setIsMobileMenuOpen(true)} />} />
             <Route path="/search" element={<Explore onOpenMenu={() => setIsMobileMenuOpen(true)} posts={posts} />} />
             <Route path="/shop" element={<Shop onOpenMenu={() => setIsMobileMenuOpen(true)} posts={posts} />} />
             <Route path="/upload" element={<Upload onPost={handlePost} currentUser={currentUser} />} />
             <Route path="/profile" element={<UserProfile currentUser={currentUser} posts={posts} users={users} followingIds={followingIds} onToggleFollow={handleToggleFollow} onLogout={handleLogout} toggleTheme={toggleTheme} isDarkMode={theme === 'dark'} />} />
             <Route path="/profile/:id" element={<UserProfile currentUser={currentUser} posts={posts} users={users} followingIds={followingIds} onToggleFollow={handleToggleFollow} onLogout={handleLogout} toggleTheme={toggleTheme} isDarkMode={theme === 'dark'} />} />
             <Route path="/edit-profile" element={<EditProfile user={currentUser} onUpdate={handleUpdateProfile} onLogout={handleLogout} toggleTheme={toggleTheme} isDarkMode={theme === 'dark'} />} />
             
             <Route path="/messages" element={<Inbox messages={messages} users={users} groups={groups} currentUser={currentUser} onCreateGroup={handleCreateGroup} />} />
             <Route path="/messages/:userId" element={<ChatRoom messages={messages} users={users} groups={groups} currentUser={currentUser} onSend={handleSendMsg} onEdit={handleEditMessage} onToggleLike={handleToggleMessageLike} />} />
             
             <Route path="/profile/followers" element={<NetworkList title="Followers" users={MOCK_USERS} followingIds={followingIds} onToggleFollow={handleToggleFollow} />} />
             <Route path="/profile/following" element={<NetworkList title="Following" users={MOCK_USERS} followingIds={followingIds} onToggleFollow={handleToggleFollow} />} />
             <Route path="*" element={<Navigate to="/" replace />} />
         </Routes>
         
         <AnimatePresence>
            {notification && (
                <NotificationToast 
                    notification={notification} 
                    onClose={() => setNotification(null)}
                    onClick={() => {
                        setNotification(null);
                        window.location.hash = `#/messages/${notification.sender.id}`;
                    }}
                />
            )}

            {postToDelete && (<div className="fixed inset-0 z-[70] flex items-center justify-center px-4"><div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPostToDelete(null)} /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-700 relative z-10"><div className="flex flex-col items-center text-center mb-6"><div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4"><AlertTriangle className="w-6 h-6" /></div><h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Post?</h3><p className="text-gray-500 dark:text-gray-400 text-sm">Are you sure you want to delete this photo? This action cannot be undone.</p></div><div className="flex space-x-3"><button onClick={() => setPostToDelete(null)} className="flex-1 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button><button onClick={confirmDelete} className="flex-1 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors">Delete</button></div></motion.div></div>)}
         </AnimatePresence>
      </Layout>
    </Router>
  );
};

export default App;