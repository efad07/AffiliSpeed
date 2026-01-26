
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Home, Search, PlusSquare, User, Moon, Sun, Briefcase, ShoppingBag, ChevronLeft, Camera, Check, Trash2, ExternalLink, MessageCircle, X, Edit2, Share2, Copy, Facebook, Twitter, Linkedin, Link2, LogOut, LogIn, UserPlus, Send, MessageSquare, Heart, Phone, Video, Mic, MicOff, VideoOff, Paperclip, Image as ImageIcon, Mail, Lock, AtSign, Eye, EyeOff, ArrowRight, KeyRound, MailCheck, Zap, MoreHorizontal, Globe, AlertTriangle, RefreshCcw, Users, UserPlus as UserPlusIcon, Film, Bell, Settings, Bookmark, Shield, HelpCircle, ChevronRight, Menu, Github, Chrome, Save, BarChart3, TrendingUp, ShieldCheck } from 'lucide-react';
import { CURRENT_USER, INITIAL_POSTS, MOCK_STORIES, MOCK_USERS, INITIAL_MESSAGES, MOCK_GROUPS, MOCK_SPARKS } from './constants';
import { Post, User as UserType, Story, Comment, Message, Group, GroupMember } from './types';
import PostCard from './components/PostCard';
import StoryTray from './components/StoryTray';
import SparkCard from './components/SparkCard';
import ChatSystem from './components/ChatSystem';
import { generateSmartCaption } from './services/geminiService';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// -- Icons & UI Components --

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.04-3.71 1.04-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }: any) => {
  const baseStyle = "px-6 py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center w-full text-sm tracking-wide";
  const variants = {
    primary: "bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white shadow-lg shadow-brand-500/30 ring-1 ring-white/10",
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

// -- Landing Page Component --
const LandingPage = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-brand-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight font-sans">AffiliSpeed</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600 dark:text-gray-400">
            <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-brand-600 transition-colors">How it Works</a>
            <a href="#trust" className="hover:text-brand-600 transition-colors">Trust</a>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/login')} className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-brand-600 transition-colors">Log In</button>
            <Button onClick={() => navigate('/signup')} className="!w-auto !px-6 !py-2.5">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-500/20 via-gray-50/50 to-white dark:from-brand-900/20 dark:via-black dark:to-black pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-4 py-1.5 rounded-full text-sm font-bold mb-8 border border-brand-100 dark:border-brand-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              <span>The #1 Platform for Affiliate Growth</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Turn Traffic into Trust. <br className="hidden md:block" />
              Turn Trust into <span className="text-brand-600 dark:text-brand-500">Income.</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              AffiliSpeed gives you the AI tools, real-time analytics, and instant trust you need to monetize your influence. Legitimate, modern, and built for success.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button onClick={() => navigate('/signup')} className="!w-auto !px-8 !py-4 text-lg shadow-brand-500/40">Start Earning Now</Button>
              <Button variant="outline" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth'})} className="!w-auto !px-8 !py-4 text-lg">How it Works</Button>
            </motion.div>
          </motion.div>

          {/* Abstract Dashboard Visual */}
          <motion.div 
            initial={{ opacity: 0, y: 100, rotateX: 20 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, type: "spring", stiffness: 50 }}
            className="mt-20 mx-auto max-w-5xl"
            style={{ perspective: 1000 }}
          >
            <div className="relative rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9] group">
               <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 to-purple-50/50 dark:from-brand-900/10 dark:to-purple-900/10 opacity-50" />
               
               {/* Mock UI Header */}
               <div className="absolute top-0 left-0 right-0 h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 flex items-center px-4 space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
               </div>

               {/* Mock UI Content */}
               <div className="absolute top-16 left-8 right-8 bottom-8 flex space-x-6">
                  <div className="w-1/4 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3 hidden md:block">
                      <div className="h-2 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                      {[1,2,3,4].map(i => <div key={i} className="h-8 w-full bg-white dark:bg-gray-700 rounded-lg shadow-sm" />)}
                  </div>
                  <div className="flex-1 space-y-6">
                      <div className="flex space-x-4">
                          <div className="flex-1 h-32 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl shadow-lg p-6 text-white flex flex-col justify-between">
                              <div className="w-8 h-8 bg-white/20 rounded-lg" />
                              <div className="h-4 w-24 bg-white/40 rounded" />
                          </div>
                          <div className="flex-1 h-32 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700" />
                          <div className="flex-1 h-32 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700" />
                      </div>
                      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-64 relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-500/10 to-transparent" />
                          <svg className="w-full h-full text-brand-500 opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
                          </svg>
                      </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Ticker */}
      <div className="bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800 py-10 overflow-hidden">
        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Trusted by verified partners</p>
        <div className="flex space-x-12 animate-scroll opacity-50 grayscale hover:grayscale-0 transition-all duration-500 justify-center flex-wrap px-4 gap-y-8">
           {/* Mock Logos */}
           {['Shopify', 'Amazon Associates', 'ClickBank', 'ShareASale', 'Rakuten', 'Impact'].map((brand) => (
             <span key={brand} className="text-xl font-bold text-gray-500 dark:text-gray-400">{brand}</span>
           ))}
        </div>
      </div>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 dark:text-white">Built for real affiliate success.</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Three simple steps to turn your content into a revenue stream.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Camera, title: "1. Create & Upload", desc: "Upload your photos or videos directly. Our platform optimizes them for maximum engagement instantly." },
              { icon: Zap, title: "2. AI-Powered Links", desc: "Our Gemini AI generates viral captions and embeds secure affiliate links automatically." },
              { icon: TrendingUp, title: "3. Track & Earn", desc: "Monitor clicks, conversions, and commissions in real-time with our transparent dashboard." }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 hover:border-brand-500/30 transition-colors group"
              >
                <div className="w-14 h-14 bg-white dark:bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200/50 dark:shadow-none mb-6 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-7 h-7 text-brand-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Deep Dive - Alternating */}
      <section id="features" className="py-24 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto space-y-24">
          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 space-y-6"
            >
              <div className="inline-flex items-center space-x-2 text-brand-600 font-bold bg-brand-50 dark:bg-brand-900/20 px-3 py-1 rounded-full text-sm">
                <Zap className="w-4 h-4" /> <span>Smarter Links</span>
              </div>
              <h2 className="text-4xl font-bold dark:text-white">AI that writes code, <br />captions, and checks.</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">Stop wasting time writing copy. Our integrated AI analyzes your image, identifies the product, and generates high-converting captions with compliant affiliate tags instantly.</p>
              <ul className="space-y-3">
                {['Automatic Product Recognition', 'SEO Optimized Hashtags', 'One-Click Compliance Disclosures'].map(item => (
                  <li key={item} className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                    <Check className="w-5 h-5 text-brand-500" /> <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 relative"
            >
              <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full" />
              <div className="relative bg-white dark:bg-black rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-gray-800">
                 {/* Simulated Chat Interface */}
                 <div className="space-y-4">
                    <div className="flex items-end space-x-2">
                       <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full" />
                       <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-bl-none max-w-[80%] text-sm">
                          Can you generate a caption for this sneaker?
                       </div>
                    </div>
                    <div className="flex items-end space-x-2 justify-end">
                       <div className="bg-brand-600 text-white p-3 rounded-2xl rounded-br-none max-w-[80%] text-sm shadow-lg">
                          Running fast never looked this good. 👟 Grab the new AirStride 5.0 at 20% off today! #run #fitness #deal
                       </div>
                       <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white"><Zap className="w-4 h-4" /></div>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 space-y-6"
            >
              <div className="inline-flex items-center space-x-2 text-blue-600 font-bold bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full text-sm">
                <BarChart3 className="w-4 h-4" /> <span>Total Transparency</span>
              </div>
              <h2 className="text-4xl font-bold dark:text-white">Real earnings.<br />No hidden fees.</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">Track every click and conversion. Our dashboard gives you granular insights so you know exactly what's working and how much you're making.</p>
              <Button variant="outline" className="!w-auto">View Demo Dashboard</Button>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 relative"
            >
               <div className="bg-white dark:bg-black rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                     <span className="font-bold">Earnings Overview</span>
                     <span className="text-green-500 font-mono text-sm">+24% this week</span>
                  </div>
                  <div className="p-8 flex items-end space-x-2 h-64">
                     {[40, 60, 45, 70, 50, 80, 65].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                          className="flex-1 bg-brand-500 rounded-t-lg opacity-80 hover:opacity-100 transition-opacity"
                        />
                     ))}
                  </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Grid */}
      <section id="trust" className="py-24 px-6 bg-white dark:bg-black">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold mb-4">Your business is safe with us.</h2>
               <p className="text-gray-500">Enterprise-grade security for solo creators.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { title: "Verified Payments", desc: "Direct deposits to your bank or PayPal. Net-30 guaranteed.", icon: ShieldCheck },
                 { title: "Data Encryption", desc: "End-to-end encryption for all your messages and financial data.", icon: Lock },
                 { title: "24/7 Support", desc: "Real humans ready to help you optimize your campaigns.", icon: HelpCircle }
               ].map((card, i) => (
                 <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="p-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-full mb-4">
                       <card.icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">{card.title}</h4>
                    <p className="text-gray-500 text-sm">{card.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 px-6">
         <div className="max-w-5xl mx-auto relative rounded-[2.5rem] bg-gray-900 dark:bg-gray-800 overflow-hidden px-6 py-16 text-center shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-900/40 to-transparent pointer-events-none" />
            <div className="relative z-10">
               <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to scale your influence?</h2>
               <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">Join thousands of creators who are turning their passion into a paycheck with AffiliSpeed.</p>
               <Button onClick={() => navigate('/signup')} className="!w-auto !px-10 !py-4 text-lg mx-auto bg-white text-black hover:bg-gray-100 border-none">Get Started Free</Button>
               <p className="mt-6 text-xs text-gray-500">No credit card required. Cancel anytime.</p>
            </div>
         </div>
      </section>

      <footer className="py-12 border-t border-gray-100 dark:border-gray-800 text-center text-gray-500 text-sm">
         <div className="flex justify-center space-x-6 mb-6">
            <Github className="w-5 h-5 hover:text-black dark:hover:text-white transition-colors cursor-pointer" />
            <Twitter className="w-5 h-5 hover:text-blue-400 transition-colors cursor-pointer" />
            <Linkedin className="w-5 h-5 hover:text-blue-700 transition-colors cursor-pointer" />
         </div>
         <p>&copy; {new Date().getFullYear()} AffiliSpeed Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

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

// -- Notification Toast --
const NotificationToast = ({ notification, onClose, onClick }: { notification: any, onClose: () => void, onClick: () => void }) => {
  if (!notification) return null;
  
  // Safe access to sender properties
  const senderName = notification.sender?.name || 'System';
  const senderAvatar = notification.sender?.avatar || 'https://via.placeholder.com/40';
  const messageText = notification.text || notification.message?.text || 'New notification';

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
            <img src={senderAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            <div className="absolute -bottom-1 -right-1 bg-brand-500 text-white rounded-full p-0.5 border-2 border-white dark:border-gray-900">
              <MessageCircle className="w-3 h-3" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{senderName}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{messageText}</p>
          </div>
          <div className="flex flex-col items-end space-y-1">
             <span className="text-[10px] text-gray-400">Now</span>
             <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// -- Share Sheet --
const ShareSheet = ({ isOpen, onClose, user }: { isOpen: boolean; onClose: () => void; user: UserType }) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;
  const profileUrl = `${window.location.origin}/#/profile/${user.id}`;
  const shareText = `Check out ${user.name} (@${user.handle}) on AffiliSpeed! 🔥`;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl p-6 relative z-10 pointer-events-auto shadow-2xl">
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6 sm:hidden" />
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold dark:text-white mb-2">Share Profile</h3>
          <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
             <img src={user.avatar} className="w-16 h-16 rounded-full object-cover mb-2" />
             <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
             <p className="text-xs text-gray-500">@{user.handle}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + profileUrl)}`} target="_blank" className="flex flex-col items-center gap-2"><div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white"><MessageCircle className="w-6 h-6"/></div><span className="text-xs">Whatsapp</span></a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`} target="_blank" className="flex flex-col items-center gap-2"><div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white"><Facebook className="w-6 h-6"/></div><span className="text-xs">Facebook</span></a>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`} target="_blank" className="flex flex-col items-center gap-2"><div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white"><Twitter className="w-6 h-6"/></div><span className="text-xs">Twitter</span></a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`} target="_blank" className="flex flex-col items-center gap-2"><div className="w-12 h-12 rounded-full bg-[#0A66C2] flex items-center justify-center text-white"><Linkedin className="w-6 h-6"/></div><span className="text-xs">LinkedIn</span></a>
        </div>
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-xl">
             <div className="flex-1 truncate text-xs text-gray-500 pl-2">{profileUrl}</div>
             <button onClick={() => { navigator.clipboard.writeText(profileUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={`px-4 py-2 rounded-lg text-sm font-bold ${copied ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'}`}>{copied ? 'Copied' : 'Copy'}</button>
        </div>
      </motion.div>
    </div>
  );
};

// -- Split Screen Auth Layout (Refined) --
const AuthLayout = ({ children, title, subtitle }: { children?: React.ReactNode, title: string, subtitle: string }) => (
  <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-black transition-colors duration-300">
    <div className="hidden lg:flex lg:w-1/2 bg-[#0B1120] relative flex-col justify-center items-center p-12 text-center overflow-hidden h-screen sticky top-0">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-[#0B1120] to-purple-900 opacity-80 z-0" />
        <div className="relative z-10 flex flex-col items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-24 h-24 bg-gradient-to-tr from-brand-400 to-purple-500 rounded-3xl flex items-center justify-center text-white shadow-2xl mb-8 ring-4 ring-white/10">
               <Zap className="w-12 h-12 fill-current" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-5xl xl:text-7xl font-extrabold text-white tracking-tighter mb-4">AffiliSpeed</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-xl text-brand-100/80 font-light max-w-md leading-relaxed">The fastest way to monetize your influence.</motion.p>
        </div>
        <div className="absolute bottom-12 text-white/20 text-xs font-mono tracking-widest">EST. {new Date().getFullYear()} • ULTRA-FAST NETWORK</div>
    </div>
    <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 md:p-24 relative z-10 bg-white dark:bg-black min-h-[100dvh]">
        <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center space-x-2 mb-8 justify-center">
                <div className="w-10 h-10 bg-gradient-to-tr from-brand-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md"><Zap className="w-6 h-6 fill-current" /></div>
                <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">AffiliSpeed</span>
            </div>
            <div className="mb-8 text-left">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">{title}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-base">{subtitle}</p>
            </div>
            {children}
        </div>
        <div className="mt-12 text-center text-xs text-gray-400 dark:text-gray-600 lg:absolute lg:bottom-8">&copy; {new Date().getFullYear()} AffiliSpeed Inc.</div>
    </div>
  </div>
);

const InputField = ({ label, icon: Icon, type = "text", placeholder, value, onChange, isPassword = false, onTogglePassword }: any) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors"><Icon className="h-5 w-5" /></div>
      <input type={type} value={value} onChange={onChange} className="block w-full pl-11 pr-12 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800" placeholder={placeholder} required />
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
    // Simulate login delay
    setTimeout(() => {
        localStorage.setItem('auth', 'true');
        onLogin();
        navigate('/');
        setIsLoading(false);
    }, 800);
  };

  const handleSocialLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
        localStorage.setItem('auth', 'true');
        onLogin();
        navigate('/');
        setIsLoading(false);
    }, 800);
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Log in to access your dashboard">
      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField label="Email" icon={Mail} type="email" placeholder="name@example.com" value={email} onChange={(e: any) => setEmail(e.target.value)} />
        <div className="space-y-1.5">
          <div className="flex justify-between items-center ml-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
            <Link to="/forgot-password" className="text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors">Forgot Password?</Link>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors"><Lock className="h-5 w-5" /></div>
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-11 pr-12 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800" placeholder="Enter your password" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
          </div>
        </div>
        <div className="pt-4">
          <Button type="submit" disabled={isLoading} className="w-full py-4 text-base shadow-lg shadow-brand-500/30">{isLoading ? "Signing in..." : "Sign In"}</Button>
        </div>
      </form>
      
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-800"></div></div>
        <div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-black text-gray-500">Or continue with</span></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <button type="button" onClick={handleSocialLogin} className="flex items-center justify-center py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-black">
          <GoogleIcon />
          <span className="ml-2 text-sm font-semibold">Google</span>
        </button>
        <button type="button" onClick={handleSocialLogin} className="flex items-center justify-center py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-[#1877F2]/10 transition-colors bg-white dark:bg-black group">
          <Facebook className="w-5 h-5 text-[#1877F2]" />
          <span className="ml-2 text-sm font-semibold group-hover:text-[#1877F2]">Facebook</span>
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">Don't have an account? <Link to="/signup" className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors">Sign up for free</Link></p></AuthLayout>
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
    // Simulate signup delay
    setTimeout(() => {
        localStorage.setItem('auth', 'true');
        onSignup();
        navigate('/');
        setIsLoading(false);
    }, 800);
  };

  const handleSocialSignup = () => {
    setIsLoading(true);
    setTimeout(() => {
        localStorage.setItem('auth', 'true');
        onSignup();
        navigate('/');
        setIsLoading(false);
    }, 800);
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join the fastest affiliate community">
      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField label="Full Name" icon={User} type="text" placeholder="e.g. Alex Creator" value={name} onChange={(e: any) => setName(e.target.value)} />
        <InputField label="Email" icon={Mail} type="email" placeholder="name@company.com" value={email} onChange={(e: any) => setEmail(e.target.value)} />
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors"><Lock className="h-5 w-5" /></div>
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-11 pr-12 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800" placeholder="Create a password" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <div className="h-1 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full ${password.length > 8 ? 'bg-green-500 w-full' : password.length > 4 ? 'bg-yellow-500 w-1/2' : 'bg-red-500 w-1/6'} transition-all duration-300`} />
            </div>
            <span className="text-xs text-gray-500">{password.length > 8 ? 'Strong' : 'Weak'}</span>
          </div>
        </div>
        <div className="pt-2">
          <Button type="submit" disabled={isLoading} className="w-full py-4 text-base shadow-brand-500/40">{isLoading ? "Creating..." : "Create Account"}</Button>
        </div>
      </form>
      
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-800"></div></div>
        <div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-black text-gray-500">Or sign up with</span></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <button type="button" onClick={handleSocialSignup} className="flex items-center justify-center py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-black">
          <GoogleIcon />
          <span className="ml-2 text-sm font-semibold">Google</span>
        </button>
        <button type="button" onClick={handleSocialSignup} className="flex items-center justify-center py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-[#1877F2]/10 transition-colors bg-white dark:bg-black group">
          <Facebook className="w-5 h-5 text-[#1877F2]" />
          <span className="ml-2 text-sm font-semibold group-hover:text-[#1877F2]">Facebook</span>
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">Already have an account? <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors">Log in</Link></p>
    </AuthLayout>
  );
};

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setIsLoading(true); setTimeout(() => { setIsLoading(false); setIsSent(true); }, 2000); };
  if (isSent) return <AuthLayout title="Check your email" subtitle={`We sent a recovery link to ${email}`}><div className="text-center"><div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-green-50 dark:bg-green-900/20 mb-8 text-green-500 ring-4 ring-green-100 dark:ring-green-900/30 animate-in zoom-in duration-300"><MailCheck className="w-12 h-12" /></div><div className="space-y-4"><Button onClick={() => window.open(`mailto:${email}`)} className="w-full py-4 text-base">Open Email App</Button><Button onClick={() => setIsSent(false)} variant="ghost" className="w-full py-4">Try another email</Button></div><div className="mt-10 border-t border-gray-100 dark:border-gray-800 pt-6"><Link to="/login" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group"><ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />Back to Log In</Link></div></div></AuthLayout>;
  return <AuthLayout title="Reset Password" subtitle="Enter your email to receive instructions"><form onSubmit={handleSubmit} className="space-y-6"><InputField label="Email Address" icon={Mail} type="email" placeholder="name@example.com" value={email} onChange={(e: any) => setEmail(e.target.value)} /><Button type="submit" disabled={isLoading} className="w-full py-4 text-base shadow-brand-500/40">{isLoading ? "Sending..." : "Send Reset Link"}</Button></form><div className="mt-10 text-center"><Link to="/login" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group"><ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />Back to Log In</Link></div></AuthLayout>;
};

// ... Pages ...

const Feed = ({ posts, stories, onLike, onDelete, onEdit, onComment, onShare, onAddStory, onDeleteStory, onEditStory, onReplyToStory, currentUser, unreadCount, onOpenMenu }: any) => {
  return (
    <div className="max-w-xl mx-auto pb-20 px-0 sm:px-4">
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-md z-30 border-b border-gray-100 dark:border-gray-800 transition-colors duration-200 sm:rounded-b-xl">
         <div className="flex items-center space-x-3">
            <button onClick={onOpenMenu} className="sm:hidden text-gray-900 dark:text-white p-1 -ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><Menu className="w-7 h-7" /></button>
            <div className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-gradient-to-tr from-brand-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20 transform hover:scale-105 transition-transform duration-200"><Zap className="w-5 h-5 fill-current" /></div>
                <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white font-sans hidden xs:block">AffiliSpeed</span>
            </div>
         </div>
         <div className="flex items-center space-x-4">
            <button className="text-gray-900 dark:text-white hover:text-red-500 transition-colors"><Heart className="w-7 h-7" /></button>
            <Link to="/shop" className="text-gray-900 dark:text-white hover:text-brand-500 transition-colors"><ShoppingBag className="w-7 h-7" /></Link>
         </div>
      </div>
      <div className="pt-2"><StoryTray stories={stories} currentUser={currentUser} onAddStory={onAddStory} onDeleteStory={onDeleteStory} onEditStory={onEditStory} onReplyToStory={onReplyToStory} /></div>
      <div className="space-y-6 mt-4">{posts.map((post: Post) => <PostCard key={post.id} post={post} onLike={onLike} onDelete={onDelete} onEdit={onEdit} onCommentClick={onComment} onShare={onShare} isOwner={post.userId === currentUser.id} />)}</div>
    </div>
  );
};

// Edit Profile Component
const EditProfile = ({ user, onUpdate }: { user: UserType, onUpdate: (u: UserType) => void }) => {
    const navigate = useNavigate();
    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState(user.bio);
    const [avatar, setAvatar] = useState(user.avatar);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            onUpdate({ ...user, name, bio, avatar });
            setIsSaving(false);
            navigate('/profile');
        }, 500);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    setAvatar(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-xl mx-auto min-h-screen bg-white dark:bg-black flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-black z-10">
                <button onClick={() => navigate(-1)} className="text-gray-900 dark:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="font-bold text-lg dark:text-white">Edit Profile</h1>
                <button onClick={handleSave} disabled={isSaving} className="text-brand-600 font-bold text-sm disabled:opacity-50">
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
            </div>
            
            <div className="p-6 space-y-6">
                <div className="flex flex-col items-center space-y-3">
                    <div 
                        className="relative group cursor-pointer" 
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <img src={avatar} className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 dark:border-gray-800" />
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="text-brand-600 font-semibold text-sm hover:text-brand-700 transition-colors"
                    >
                        Change Profile Photo
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange}
                    />
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        />
                    </div>
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Bio</label>
                        <textarea 
                            value={bio} 
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const Sparks = ({ sparks, onLike, onOpenMenu }: { sparks: Post[], onLike: (id: string) => void, onOpenMenu: () => void }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => { const index = Math.round(container.scrollTop / container.clientHeight); if (index !== activeIndex) setActiveIndex(index); };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeIndex]);
  return (
    <div className="flex justify-center w-full bg-gray-900 dark:bg-black relative">
      <div className="absolute top-4 left-4 z-40 sm:hidden"><button onClick={onOpenMenu} className="p-2 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors"><Menu className="w-6 h-6" /></button></div>
      <div ref={containerRef} className="h-[calc(100dvh-56px)] w-full sm:max-w-md sm:border-x sm:border-gray-800 bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar relative shadow-2xl">
        {sparks.map((spark, index) => <SparkCard key={spark.id} post={spark} isActive={index === activeIndex} onLike={onLike} onComment={() => {}} onShare={() => {}} />)}
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
        <div className="flex items-center space-x-3"><button onClick={onOpenMenu} className="sm:hidden text-gray-900 dark:text-white p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"><Menu className="w-6 h-6" /></button><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /><input type="text" placeholder="Search..." className="w-full bg-gray-200 dark:bg-gray-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm" value={term} onChange={(e) => setTerm(e.target.value)} /></div></div>
      </div>
      <div className="grid grid-cols-3 gap-1 mt-1">{displayedPosts.map((post) => (<div key={post.id} className="relative aspect-square group cursor-pointer overflow-hidden"><img src={post.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" loading="lazy" />{post.type === 'video' && (<div className="absolute top-2 right-2"><svg className="w-5 h-5 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>)}</div>))}</div>
    </div>
  );
};

const Shop = ({ posts, onOpenMenu }: { posts: Post[], onOpenMenu: () => void }) => {
  const deals = posts.filter(p => p.affiliateLink);
  return (
    <div className="max-w-2xl mx-auto pb-20 px-4 min-h-screen">
       <div className="sticky top-0 bg-gray-50 dark:bg-black z-20 py-3 mb-2 bg-opacity-95 backdrop-blur-sm transition-colors duration-200"><div className="flex items-center space-x-3"><button onClick={onOpenMenu} className="sm:hidden text-gray-900 dark:text-white p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"><Menu className="w-6 h-6" /></button><h1 className="text-2xl font-bold dark:text-white flex items-center">Trending Deals <span className="ml-2 text-xl">🔥</span></h1></div></div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{deals.map(post => (<a key={post.id} href={post.affiliateLink} target="_blank" rel="noopener noreferrer" className="block bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow transform hover:-translate-y-1"><div className="aspect-square relative bg-gray-100 dark:bg-gray-800"><img src={post.url} className="w-full h-full object-cover" loading="lazy" /><div className="absolute bottom-2 left-2 bg-brand-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">{post.affiliateLabel || 'GET DEAL'}</div></div><div className="p-3"><p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug">{post.caption}</p></div></a>))}</div>
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
      let secureUrl = preview; 
      
      try {
          // Cloudinary fallback
          const formData = new FormData(); formData.append('file', file); formData.append('upload_preset', 'oxh9k9eo'); formData.append('cloud_name', 'dgdvvnnnj');
          const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/dgdvvnnnj/auto/upload', { method: 'POST', body: formData });
          if (cloudinaryRes.ok) {
             const cloudinaryData = await cloudinaryRes.json();
             secureUrl = cloudinaryData.secure_url;
          }
      } catch (err) {
          console.warn("Cloudinary upload failed, using local preview.", err);
      }

      const mediaType = file.type.startsWith('video') ? 'video' : 'image';
      
      const newPostData: Post = { 
          id: `p_${Date.now()}`, 
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
      
      setTimeout(() => {
          onPost(newPostData); 
          navigate('/');
          setLoading(false);
      }, 500);

    } catch (error) { alert("Failed to create post. Please try again."); setLoading(false); }
  };
  return (
    <div className="max-w-xl mx-auto min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10"><button onClick={() => navigate(-1)} className="mr-3 text-gray-900 dark:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><ChevronLeft className="w-6 h-6" /></button><h1 className="font-bold text-lg dark:text-white">New Post</h1></div>
      <div className="p-4 pb-20">{!preview ? (<div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl h-64 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-500"><input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" id="file-upload" /><label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center"><PlusSquare className="w-12 h-12 mb-2 text-brand-500" /><span>Select Photo or Video</span></label></div>) : (<form onSubmit={handleSubmit} className="space-y-4"><div className="relative aspect-video rounded-xl overflow-hidden bg-black">{file?.type.startsWith('video') ? (<video src={preview} className="w-full h-full object-contain" controls />) : (<img src={preview} className="w-full h-full object-contain" />)}<button type="button" onClick={() => setPreview(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"><X className="w-5 h-5"/></button></div><div className="space-y-2"><label className="text-sm font-medium dark:text-gray-300">Caption</label><div className="relative"><textarea className="w-full p-3 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" rows={3} placeholder="Write a caption..." value={caption} onChange={e => setCaption(e.target.value)} /><button type="button" onClick={handleGenerateCaption} disabled={generatingAI} className="absolute right-2 bottom-2 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-2 py-1 rounded-md flex items-center transition-colors">{generatingAI ? 'Thinking...' : '✨ Magic Caption'}</button></div></div><div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-xl space-y-3"><div className="flex items-center space-x-2 text-brand-700 dark:text-brand-400 font-semibold mb-1"><Briefcase className="w-4 h-4" /><span>Affiliate Details</span></div><div><label className="text-xs font-medium dark:text-gray-400">Product Link</label><input type="url" className="w-full p-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm" placeholder="https://amazon.com/..." value={affiliateLink} onChange={e => setAffiliateLink(e.target.value)} /></div><div><label className="text-xs font-medium dark:text-gray-400">Button Label</label><input type="text" className="w-full p-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm" placeholder="e.g. 50% OFF" value={affiliateLabel} onChange={e => setAffiliateLabel(e.target.value)} /></div></div><Button type="submit" disabled={loading} className="w-full py-3">{loading ? 'Posting...' : 'Share Post'}</Button></form>)}</div>
    </div>
  );
};

// -- User Profile --
const UserProfile = ({ currentUser, posts, sparks, users, followingIds, onToggleFollow }: any) => {
  const { id } = useParams(); // Should allow optional id
  const navigate = useNavigate();
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'sparks' | 'deals'>('posts');
  
  // If id is present in URL, find that user, otherwise use currentUser
  const isMe = !id || id === currentUser.id;
  const profileUser = isMe ? currentUser : users.find((u: UserType) => u.id === id);
  
  if (!profileUser) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">User not found</div>;

  const isFollowing = followingIds ? followingIds.includes(profileUser.id) : false;

  const handleFollowClick = () => {
    if (onToggleFollow) {
      onToggleFollow(profileUser.id);
    }
  };

  // Filter content based on active tab
  const userPosts = posts.filter((p: Post) => p.userId === profileUser.id);
  const userSparks = sparks ? sparks.filter((s: Post) => s.userId === profileUser.id) : [];
  const userDeals = userPosts.filter((p: Post) => p.affiliateLink);

  let displayedContent: Post[] = [];
  switch (activeTab) {
    case 'posts':
      displayedContent = userPosts;
      break;
    case 'sparks':
      displayedContent = userSparks;
      break;
    case 'deals':
      displayedContent = userDeals;
      break;
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-white/95 dark:bg-black/95 backdrop-blur-md z-20 border-b border-gray-100 dark:border-gray-800">
         <div className="flex items-center space-x-3">
             {!isMe && <button onClick={() => navigate(-1)}><ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" /></button>}
             <div className="font-bold text-xl dark:text-white flex items-center">
                {profileUser.handle}
                {profileUser.isVerified && <span className="ml-1 text-blue-500"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></span>}
             </div>
         </div>
         <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/upload')} className="text-gray-900 dark:text-white hover:text-brand-600 transition-colors"><PlusSquare className="w-6 h-6" /></button>
            <button onClick={() => isMe ? navigate('/edit-profile') : setShowShareSheet(true)} className="text-gray-900 dark:text-white hover:text-brand-600 transition-colors"><MoreHorizontal className="w-6 h-6" /></button>
         </div>
      </div>

      <div className="px-4 py-6">
         <div className="flex items-center mb-6">
            <div className="relative">
                <img src={profileUser.avatar} className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800 p-0.5" />
                {isMe && <div className="absolute bottom-0 right-0 bg-brand-500 rounded-full p-1 border-2 border-white dark:border-black text-white"><PlusSquare className="w-3 h-3" /></div>}
            </div>
            <div className="flex-1 flex justify-around text-center ml-4">
               <div><div className="font-bold text-lg dark:text-white">{userPosts.length}</div><div className="text-xs text-gray-500">Posts</div></div>
               <div className="cursor-pointer hover:opacity-70 transition-opacity"><div className="font-bold text-lg dark:text-white">{profileUser.followers}</div><div className="text-xs text-gray-500">Followers</div></div>
               <div className="cursor-pointer hover:opacity-70 transition-opacity"><div className="font-bold text-lg dark:text-white">{profileUser.following}</div><div className="text-xs text-gray-500">Following</div></div>
            </div>
         </div>
         
         <div className="mb-6 space-y-1">
            <div className="font-bold dark:text-white text-base">{profileUser.name}</div>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{profileUser.bio}</p>
         </div>

         <div className="flex space-x-2">
            {isMe ? (
               <>
                 <button onClick={() => navigate('/edit-profile')} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold py-2 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Edit Profile</button>
                 <button onClick={() => setShowShareSheet(true)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold py-2 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Share Profile</button>
               </>
            ) : (
               <>
                 <button 
                   onClick={handleFollowClick}
                   className={`flex-1 font-semibold py-2 rounded-xl text-sm transition-all active:scale-95 ${isFollowing ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700' : 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'}`}
                 >
                   {isFollowing ? 'Following' : 'Follow'}
                 </button>
                 <button onClick={() => navigate(`/messages/${profileUser.id}`)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold py-2 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Message</button>
               </>
            )}
         </div>
      </div>

      {/* Posts Tabs */}
      <div className="flex border-t border-gray-100 dark:border-gray-800 mb-0.5">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 border-b-2 transition-colors duration-200 ${activeTab === 'posts' ? 'border-black dark:border-white' : 'border-transparent'}`}
          >
            <div className="flex justify-center">
              <ImageIcon className={`w-5 h-5 ${activeTab === 'posts' ? 'text-black dark:text-white' : 'text-gray-400'}`} />
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('sparks')}
            className={`flex-1 py-3 border-b-2 transition-colors duration-200 ${activeTab === 'sparks' ? 'border-black dark:border-white' : 'border-transparent'}`}
          >
            <div className="flex justify-center">
              <Film className={`w-5 h-5 ${activeTab === 'sparks' ? 'text-black dark:text-white' : 'text-gray-400'}`} />
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('deals')}
            className={`flex-1 py-3 border-b-2 transition-colors duration-200 ${activeTab === 'deals' ? 'border-black dark:border-white' : 'border-transparent'}`}
          >
            <div className="flex justify-center">
              <ShoppingBag className={`w-5 h-5 ${activeTab === 'deals' ? 'text-black dark:text-white' : 'text-gray-400'}`} />
            </div>
          </button>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-0.5">
         {displayedContent.length > 0 ? displayedContent.map((post: Post) => (
            <div key={post.id} className="relative aspect-square bg-gray-100 dark:bg-gray-900 group overflow-hidden cursor-pointer">
               <img src={post.type === 'video' && post.thumbnail ? post.thumbnail : post.url} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
               <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
               
               {/* Type Indicators */}
               {post.type === 'video' && (
                  <div className="absolute top-2 right-2">
                     <svg className="w-4 h-4 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
               )}
               {activeTab === 'deals' && (
                 <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-brand-600/90 text-white text-[10px] font-bold px-2 py-1 rounded-md text-center shadow-sm truncate backdrop-blur-sm">
                      {post.affiliateLabel || 'DEAL'}
                    </div>
                 </div>
               )}
            </div>
         )) : (
             <div className="col-span-3 py-16 flex flex-col items-center justify-center text-gray-400">
                 {activeTab === 'posts' && <Camera className="w-12 h-12 mb-3 opacity-20" />}
                 {activeTab === 'sparks' && <Film className="w-12 h-12 mb-3 opacity-20" />}
                 {activeTab === 'deals' && <ShoppingBag className="w-12 h-12 mb-3 opacity-20" />}
                 <p className="text-sm font-medium">No {activeTab} yet</p>
             </div>
         )}
      </div>
      <AnimatePresence>
         {showShareSheet && <ShareSheet isOpen={showShareSheet} onClose={() => setShowShareSheet(false)} user={profileUser} />}
      </AnimatePresence>
    </div>
  );
};

// -- Layout --
const Layout = ({ children, theme, toggleTheme, isAuthenticated, onLogout, isAuthChecking, unreadCount, isMobileMenuOpen, closeMobileMenu, notification, onCloseNotification }: any) => {
  const location = useLocation();
  const navigate = useNavigate();

  if (isAuthChecking) return <LoadingScreen />;

  // NOTE: Changed logic here to allow "/" to be public (Landing Page) if not authenticated
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/']; 
  
  if (publicRoutes.includes(location.pathname)) {
    // If on root and authenticated, redirect to feed (handled in App main component via Route render, but good to check here too if structure changes)
    // However, since Layout wraps everything, we just render children for public routes.
    return <div className={theme}>{children}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />; // Redirect to Landing Page (root) instead of login
  }

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Film, label: 'Sparks', path: '/sparks' },
    { icon: Search, label: 'Explore', path: '/search' },
    { icon: ShoppingBag, label: 'Deals', path: '/shop' },
    { icon: PlusSquare, label: 'Create', path: '/upload' },
    { icon: MessageCircle, label: 'Messages', path: '/messages', badge: unreadCount },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className={theme}>
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-200 flex flex-col sm:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden sm:flex flex-col w-64 fixed h-full bg-white dark:bg-black border-r border-gray-100 dark:border-gray-800 z-30">
          <div className="p-6 flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-tr from-brand-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight font-sans">AffiliSpeed</span>
          </div>
          
          <nav className="flex-1 px-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-brand-50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400 font-bold shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    <item.icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
                  </div>
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="ml-auto bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-brand-500/20">
                      {item.badge}
                    </span>
                  )}
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
          <AnimatePresence>
            {notification && (
                <NotificationToast 
                    notification={notification} 
                    onClose={onCloseNotification} 
                    onClick={() => {
                        navigate('/messages');
                        onCloseNotification();
                    }}
                />
            )}
          </AnimatePresence>
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 flex justify-around items-center px-2 py-3 z-40 pb-safe-area shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
          <Link to="/" className={`p-2 rounded-xl transition-colors ${location.pathname === '/' ? 'text-brand-600 bg-brand-50 dark:bg-brand-900/20' : 'text-gray-400'}`}><Home className="w-6 h-6" /></Link>
          <Link to="/sparks" className={`p-2 rounded-xl transition-colors ${location.pathname === '/sparks' ? 'text-brand-600 bg-brand-50 dark:bg-brand-900/20' : 'text-gray-400'}`}><Film className="w-6 h-6" /></Link>
          <Link to="/upload" className="p-2"><div className="bg-brand-600 text-white rounded-xl p-2 shadow-lg shadow-brand-500/30 transform hover:scale-105 transition-transform"><PlusSquare className="w-6 h-6" /></div></Link>
          <Link to="/shop" className={`p-2 rounded-xl transition-colors ${location.pathname === '/shop' ? 'text-brand-600 bg-brand-50 dark:bg-brand-900/20' : 'text-gray-400'}`}><ShoppingBag className="w-6 h-6" /></Link>
          <Link to="/profile" className={`p-2 rounded-xl transition-colors ${location.pathname === '/profile' ? 'text-brand-600 bg-brand-50 dark:bg-brand-900/20' : 'text-gray-400'}`}><User className="w-6 h-6" /></Link>
        </div>
      </div>
      
      {/* Mobile Sidebar Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} navItems={navItems} theme={theme} toggleTheme={toggleTheme} onLogout={onLogout} />
    </div>
  );
};

// -- Main App --
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
  const [notification, setNotification] = useState<{ message?: Message, text?: string, sender?: UserType } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark'); }, []);
  
  // Replaced Supabase auth check with LocalStorage mock check
  useEffect(() => {
      const checkAuth = () => {
        const auth = localStorage.getItem('auth');
        setIsAuthenticated(!!auth);
        setIsAuthChecking(false);
      };
      checkAuth();
  }, []);

  const handlePost = (newPost: Post) => setPosts(prev => [newPost, ...prev]);
  const handleLike = (id: string) => setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likedByMe ? p.likes - 1 : p.likes + 1, likedByMe: !p.likedByMe } : p));
  const handleSparkLike = (id: string) => setSparks(prev => prev.map(p => p.id === id ? { ...p, likes: p.likedByMe ? p.likes - 1 : p.likes + 1, likedByMe: !p.likedByMe } : p));
  
  // New Message Handler for Chat System
  const handleSendMessage = (text: string, receiverId: string, media?: { url: string, type: 'image' | 'video' | 'audio' }) => {
    const newMessage: Message = { 
      id: `m_${Date.now()}`, 
      senderId: currentUser.id, 
      receiverId, 
      text, 
      mediaUrl: media?.url,
      mediaType: media?.type,
      timestamp: Date.now(), 
      isRead: false,
      status: 'sent'
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate Delivery Status
    setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' } : m));
    }, 1000);
    
    // Simulate Read Status & Reply if it's a user
    if (!receiverId.startsWith('g_')) {
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, isRead: true, status: 'read' } : m));
        }, 2500);
    }
  };

  const handleCreateGroup = (name: string, members: string[]) => { 
      const newGroup: Group = { 
          id: `g_${Date.now()}`, 
          name, 
          avatar: `https://ui-avatars.com/api/?name=${name}`, 
          members: [
              { userId: currentUser.id, role: 'admin', joinedAt: Date.now() },
              ...members.map(id => ({ userId: id, role: 'member', joinedAt: Date.now() } as GroupMember))
          ], 
          created_at: Date.now() 
      }; 
      setGroups(prev => [newGroup, ...prev]); 
  };

  const handleGroupAction = (groupId: string, action: 'leave' | 'add_member' | 'remove_member' | 'promote_admin' | 'update_info' | 'set_nickname', payload?: any) => {
      setGroups(prevGroups => {
          return prevGroups.map(group => {
              if (group.id !== groupId) return group;

              switch (action) {
                  case 'leave':
                      const remainingMembers = group.members.filter(m => m.userId !== currentUser.id);
                      if (remainingMembers.length === 0) return null as any; // Delete group
                      
                      // If admin left, promote next member
                      const adminLeft = group.members.find(m => m.userId === currentUser.id)?.role === 'admin';
                      if (adminLeft && !remainingMembers.some(m => m.role === 'admin')) {
                          remainingMembers[0].role = 'admin';
                      }
                      return { ...group, members: remainingMembers };
                  
                  case 'add_member':
                      if (group.members.some(m => m.userId === payload.userId)) return group;
                      return { ...group, members: [...group.members, { userId: payload.userId, role: 'member', joinedAt: Date.now() }] };

                  case 'remove_member':
                      return { ...group, members: group.members.filter(m => m.userId !== payload.userId) };

                  case 'promote_admin':
                      return { ...group, members: group.members.map(m => m.userId === payload.userId ? { ...m, role: 'admin' } : m) };

                  case 'update_info':
                      return { ...group, ...payload };

                  case 'set_nickname':
                      return { ...group, members: group.members.map(m => m.userId === payload.userId ? { ...m, nickname: payload.nickname } : m) };

                  default:
                      return group;
              }
          }).filter(Boolean); // Remove nulls (deleted groups)
      });
      
      // If leaving, navigate away
      if (action === 'leave') {
          // Navigation handled in ChatSystem via callback or effect, 
          // but state update happens here.
      }
  };

  const handleDeleteMessage = (messageId: string, forEveryone: boolean) => {
      setMessages(prev => prev.map(m => {
          if (m.id !== messageId) return m;
          if (forEveryone) {
              return { ...m, deletedForEveryone: true, text: '', mediaUrl: undefined };
          } else {
              return { ...m, deletedFor: [...(m.deletedFor || []), currentUser.id] };
          }
      }));
  };

  const handleBlockUser = (userId: string) => {
      setCurrentUser(prev => ({ ...prev, blockedUsers: [...(prev.blockedUsers || []), userId] }));
  };

  const handleUnblockUser = (userId: string) => {
      setCurrentUser(prev => ({ ...prev, blockedUsers: (prev.blockedUsers || []).filter(id => id !== userId) }));
  };
  
  const handleToggleFollow = (targetUserId: string) => {
      const isFollowing = followingIds.includes(targetUserId);
      const newFollowingIds = isFollowing ? followingIds.filter(id => id !== targetUserId) : [...followingIds, targetUserId];
      setFollowingIds(newFollowingIds);
      setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, followers: isFollowing ? Math.max(0, u.followers - 1) : u.followers + 1 } : u));
      setCurrentUser(prev => ({ ...prev, following: isFollowing ? Math.max(0, prev.following - 1) : prev.following + 1 }));
  };
  
  const handleUpdateProfile = (updatedUser: UserType) => {
      setCurrentUser(updatedUser);
  };
  
  const handleComment = (id: string) => {
      setNotification({ text: "Comments feature coming soon!", sender: { ...currentUser, name: "System", avatar: "https://via.placeholder.com/150" } });
      setTimeout(() => setNotification(null), 3000);
  };
  
  const handleShare = (id: string) => {
      // Copy link to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/#/post/${id}`);
      setNotification({ text: "Link copied to clipboard!", sender: { ...currentUser, name: "System", avatar: "https://via.placeholder.com/150" } });
      setTimeout(() => setNotification(null), 3000);
  };

  return (
    <Router>
      <Layout 
        theme={theme} 
        toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} 
        isAuthenticated={isAuthenticated} 
        // Mock logout
        onLogout={() => { 
            localStorage.removeItem('auth');
            setIsAuthenticated(false); 
        }} 
        isAuthChecking={isAuthChecking} 
        unreadCount={unreadCount} 
        isMobileMenuOpen={isMobileMenuOpen} 
        closeMobileMenu={() => setIsMobileMenuOpen(false)}
        notification={notification}
        onCloseNotification={() => setNotification(null)}
      >
         <Routes>
             <Route path="/login" element={<LoginScreen onLogin={() => setIsAuthenticated(true)} />} />
             <Route path="/signup" element={<SignupScreen onSignup={() => setIsAuthenticated(true)} />} />
             <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
             
             {/* Modified Root Route: Shows Feed if auth, Landing if not */}
             <Route path="/" element={
                isAuthenticated ? (
                    <Feed posts={posts} stories={stories} onLike={handleLike} onDelete={id => setPostToDelete(id)} onEdit={() => {}} onComment={handleComment} onShare={handleShare} onAddStory={() => {}} onDeleteStory={() => {}} onEditStory={() => {}} onReplyToStory={() => {}} currentUser={currentUser} unreadCount={unreadCount} onOpenMenu={() => setIsMobileMenuOpen(true)} />
                ) : (
                    <LandingPage />
                )
             } />
             
             <Route path="/sparks" element={<Sparks sparks={sparks} onLike={handleSparkLike} onOpenMenu={() => setIsMobileMenuOpen(true)} />} />
             <Route path="/search" element={<Explore onOpenMenu={() => setIsMobileMenuOpen(true)} posts={posts} />} />
             <Route path="/shop" element={<Shop onOpenMenu={() => setIsMobileMenuOpen(true)} posts={posts} />} />
             <Route path="/upload" element={<Upload onPost={handlePost} currentUser={currentUser} />} />
             <Route path="/profile" element={<UserProfile currentUser={currentUser} posts={posts} sparks={sparks} users={users} followingIds={followingIds} onToggleFollow={handleToggleFollow} />} />
             <Route path="/profile/:id" element={<UserProfile currentUser={currentUser} posts={posts} sparks={sparks} users={users} followingIds={followingIds} onToggleFollow={handleToggleFollow} />} />
             <Route path="/edit-profile" element={<EditProfile user={currentUser} onUpdate={handleUpdateProfile} />} />
             
             {/* New Chat System Routes */}
             <Route path="/messages" element={<ChatSystem currentUser={currentUser} users={users} messages={messages} groups={groups} onSendMessage={handleSendMessage} onCreateGroup={handleCreateGroup} onGroupAction={handleGroupAction} onBlockUser={handleBlockUser} onUnblockUser={handleUnblockUser} onDeleteMessage={handleDeleteMessage} />} />
             <Route path="/messages/:userId" element={<ChatSystem currentUser={currentUser} users={users} messages={messages} groups={groups} onSendMessage={handleSendMessage} onCreateGroup={handleCreateGroup} onGroupAction={handleGroupAction} onBlockUser={handleBlockUser} onUnblockUser={handleUnblockUser} onDeleteMessage={handleDeleteMessage} />} />
             
             <Route path="*" element={<Navigate to="/" replace />} />
         </Routes>
      </Layout>
    </Router>
  );
};

export default App;
