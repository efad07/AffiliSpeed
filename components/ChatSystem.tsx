
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Send, Mic, Image as ImageIcon, Phone, Video, MoreVertical, 
  ArrowLeft, Search, Check, CheckCheck, X, PhoneOff, MicOff, 
  Camera, Trash2, Smile, Paperclip, MoreHorizontal, Play, Pause,
  User as UserIcon, LogOut, Clock, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Message, CallSession, Group } from '../types';
import { CURRENT_USER } from '../constants';

// --- Types & Interfaces for Component ---

interface ChatSystemProps {
  currentUser: User;
  users: User[];
  messages: Message[];
  groups: Group[];
  onSendMessage: (text: string, receiverId: string, media?: { url: string, type: 'image'|'video'|'audio' }) => void;
}

// --- Helper Components ---

const MessageStatusIcon = ({ status, isRead }: { status?: string, isRead: boolean }) => {
  if (isRead) return <CheckCheck className="w-3 h-3 text-blue-500" />;
  if (status === 'delivered') return <CheckCheck className="w-3 h-3 text-gray-400" />;
  return <Check className="w-3 h-3 text-gray-400" />;
};

const AudioPlayer = ({ src }: { src: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setProgress((audio.currentTime / audio.duration) * 100);
    const onEnded = () => { setIsPlaying(false); setProgress(0); };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700/50 rounded-full p-2 pr-4 min-w-[200px]">
      <audio ref={audioRef} src={src} className="hidden" />
      <button onClick={togglePlay} className="p-2 bg-white dark:bg-gray-600 rounded-full shadow-sm text-brand-600 dark:text-brand-400">
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>
      <div className="flex-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
        <div className="h-full bg-brand-500 transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

// --- Main Chat System Component ---

const ChatSystem: React.FC<ChatSystemProps> = ({ currentUser, users, messages, groups, onSendMessage }) => {
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const [activeChatId, setActiveChatId] = useState<string | null>(routeUserId || null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Call State
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const activeUser = users.find(u => u.id === activeChatId);
  const activeGroup = groups.find(g => g.id === activeChatId);
  const chatTitle = activeGroup ? activeGroup.name : activeUser?.name;
  const chatAvatar = activeGroup ? activeGroup.avatar : activeUser?.avatar;
  const isOnline = activeUser?.isOnline ?? Math.random() > 0.5; // Simulated online status

  // Sync route with state
  useEffect(() => {
    setActiveChatId(routeUserId || null);
  }, [routeUserId]);

  const goToProfile = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  // --- Voice Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        // Blob creation handled in send
      };

      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (err) {
      console.error("Mic permission denied", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const cancelRecording = () => {
    stopRecording();
    audioChunksRef.current = [];
  };

  const sendVoiceNote = () => {
    stopRecording();
    // Simulate delay for recorder to finalize
    setTimeout(() => {
      if (audioChunksRef.current.length > 0 && activeChatId) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        onSendMessage("Voice Message", activeChatId, { url: audioUrl, type: 'audio' });
      }
    }, 200);
  };

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setRecordingDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // --- Call Logic ---
  const initiateCall = (type: 'audio' | 'video') => {
    if (!activeChatId) return;
    setCallSession({
      id: `call_${Date.now()}`,
      callerId: currentUser.id,
      receiverId: activeChatId,
      type,
      status: 'dialing'
    });
    // Simulate connection
    setTimeout(() => setCallSession(prev => prev ? { ...prev, status: 'ringing' } : null), 1500);
    setTimeout(() => setCallSession(prev => prev ? { ...prev, status: 'connected', startTime: Date.now() } : null), 4000);
  };

  const endCall = () => {
    setCallSession(null);
  };

  // --- Render ---

  // Filter conversations
  const conversations = users.filter(u => u.id !== currentUser.id).map(user => {
    const userMsgs = messages.filter(m => 
      (m.senderId === user.id && m.receiverId === currentUser.id) || 
      (m.senderId === currentUser.id && m.receiverId === user.id)
    ).sort((a, b) => b.timestamp - a.timestamp);
    
    return {
      user,
      lastMessage: userMsgs[0],
      unread: userMsgs.filter(m => m.senderId === user.id && !m.isRead).length
    };
  }).filter(c => c.lastMessage).sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);

  const filteredConversations = conversations.filter(c => 
    c.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.user.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-0px)] bg-white dark:bg-black overflow-hidden relative">
      
      {/* --- Call Overlay --- */}
      <AnimatePresence>
        {callSession && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center text-white"
          >
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent z-10">
               <button onClick={() => {}} className="p-2 bg-white/10 rounded-full backdrop-blur-md"><MoreVertical className="w-5 h-5"/></button>
               <div className="text-sm font-medium text-white/80 flex items-center space-x-1">
                  {callSession.status === 'connected' && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>}
                  <span>{callSession.status === 'connected' ? '00:42' : callSession.status === 'dialing' ? 'Calling...' : 'Ringing...'}</span>
               </div>
            </div>

            {/* Video Placeholder */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
               {callSession.type === 'video' && (
                 <div className="absolute inset-0 bg-gray-800">
                    {/* Remote Stream Simulation */}
                    <img src={activeUser?.avatar} className="w-full h-full object-cover opacity-50 blur-xl scale-110" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       {callSession.status === 'connected' ? (
                         <UserIcon className="w-32 h-32 text-gray-500" />
                       ) : (
                         <div className="flex flex-col items-center animate-pulse">
                            <img src={activeUser?.avatar} className="w-32 h-32 rounded-full border-4 border-white/10 mb-4 shadow-2xl" />
                            <h2 className="text-2xl font-bold">{activeUser?.name}</h2>
                         </div>
                       )}
                    </div>
                    {/* Local Stream PIP */}
                    {callSession.status === 'connected' && (
                      <div className="absolute bottom-24 right-4 w-32 h-48 bg-black rounded-xl border border-white/20 shadow-2xl overflow-hidden">
                         <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <span className="text-xs text-gray-400">You</span>
                         </div>
                      </div>
                    )}
                 </div>
               )}
               
               {callSession.type === 'audio' && (
                 <div className="flex flex-col items-center z-10">
                    <div className="relative">
                       <div className="absolute inset-0 bg-brand-500/20 rounded-full animate-ping"></div>
                       <img src={activeUser?.avatar} className="w-40 h-40 rounded-full border-4 border-gray-800 shadow-2xl relative z-10" />
                    </div>
                    <h2 className="mt-8 text-3xl font-bold">{activeUser?.name}</h2>
                    <p className="text-gray-400 mt-2 text-lg">AffiliSpeed Audio...</p>
                 </div>
               )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black/80 to-transparent">
               <div className="flex items-center justify-center space-x-6">
                  <button onClick={() => setIsMicOn(!isMicOn)} className={`p-4 rounded-full ${isMicOn ? 'bg-white/20 hover:bg-white/30' : 'bg-white text-black'} backdrop-blur-md transition-colors`}>
                     {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                  </button>
                  
                  {callSession.type === 'video' && (
                    <button onClick={() => setIsCameraOn(!isCameraOn)} className={`p-4 rounded-full ${isCameraOn ? 'bg-white/20 hover:bg-white/30' : 'bg-white text-black'} backdrop-blur-md transition-colors`}>
                       {isCameraOn ? <Video className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
                    </button>
                  )}

                  <button onClick={endCall} className="p-5 bg-red-600 rounded-full shadow-lg hover:bg-red-700 hover:scale-105 transition-all">
                     <PhoneOff className="w-8 h-8 fill-current" />
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Sidebar (Inbox) --- */}
      <div className={`${activeChatId ? 'hidden md:flex' : 'flex'} w-full md:w-96 flex-col border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-black z-10`}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
           <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold dark:text-white">Messages</h1>
              <div className="flex space-x-2">
                 <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full text-gray-600 dark:text-gray-300">
                    <MoreHorizontal className="w-6 h-6" />
                 </button>
              </div>
           </div>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search chats..." 
                className="w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
           {filteredConversations.map((convo) => (
             <div 
               key={convo.user.id} 
               onClick={() => {
                 setActiveChatId(convo.user.id);
                 navigate(`/messages/${convo.user.id}`);
               }}
               className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${activeChatId === convo.user.id ? 'bg-brand-50 dark:bg-brand-900/10' : ''}`}
             >
                <div 
                  className="relative cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={(e) => goToProfile(e, convo.user.id)}
                >
                   <img src={convo.user.avatar} className="w-14 h-14 rounded-full object-cover" />
                   {convo.user.isOnline && (
                     <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-black rounded-full"></div>
                   )}
                </div>
                <div className="ml-4 flex-1 min-w-0">
                   <div className="flex justify-between items-baseline mb-1">
                      <h3 
                        onClick={(e) => goToProfile(e, convo.user.id)}
                        className={`text-sm font-semibold truncate cursor-pointer hover:underline ${convo.unread > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        {convo.user.name}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {new Date(convo.lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                   </div>
                   <div className="flex justify-between items-center">
                      <p className={`text-sm truncate pr-2 ${convo.unread > 0 ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                         {convo.lastMessage.senderId === currentUser.id && 'You: '}{convo.lastMessage.mediaUrl ? 'Sent a file' : convo.lastMessage.text}
                      </p>
                      {convo.unread > 0 && (
                        <span className="bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                          {convo.unread}
                        </span>
                      )}
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* --- Chat Window --- */}
      {activeChatId ? (
        <div className={`flex-1 flex flex-col bg-white dark:bg-black ${activeChatId ? 'flex' : 'hidden md:flex'}`}>
           {/* Header */}
           <div className="h-16 px-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center">
                 <button onClick={() => { setActiveChatId(null); navigate('/messages'); }} className="md:hidden mr-3 text-gray-600 dark:text-gray-300">
                    <ArrowLeft className="w-6 h-6" />
                 </button>
                 <div 
                    className="flex items-center cursor-pointer group"
                    onClick={(e) => activeUser && goToProfile(e, activeUser.id)}
                 >
                    <div className="relative">
                        <img src={chatAvatar} className="w-10 h-10 rounded-full object-cover group-hover:opacity-90 transition-opacity" />
                        {isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-black rounded-full"></div>}
                    </div>
                    <div className="ml-3">
                        <h2 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{chatTitle}</h2>
                        <p className="text-xs text-green-500 font-medium">{isOnline ? 'Active now' : 'Offline'}</p>
                    </div>
                 </div>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-3">
                 <button onClick={() => initiateCall('audio')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-brand-600 dark:text-brand-400 transition-colors">
                    <Phone className="w-5 h-5" />
                 </button>
                 <button onClick={() => initiateCall('video')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-brand-600 dark:text-brand-400 transition-colors">
                    <Video className="w-5 h-5" />
                 </button>
                 <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
                    <AlertCircle className="w-5 h-5" />
                 </button>
              </div>
           </div>

           {/* Messages */}
           <ChatContent 
             messages={messages} 
             currentUser={currentUser} 
             activeChatId={activeChatId} 
           />

           {/* Input Area */}
           <div className="p-3 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800">
              {isRecording ? (
                 <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-full animate-pulse">
                    <div className="flex items-center space-x-3 text-red-500">
                       <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                       <span className="font-mono font-bold text-sm">
                          {Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, '0')}
                       </span>
                    </div>
                    <div className="flex items-center space-x-4">
                       <button onClick={cancelRecording} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">Cancel</button>
                       <button onClick={sendVoiceNote} className="bg-red-500 text-white p-2 rounded-full shadow-lg transform hover:scale-105 transition-all">
                          <Send className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
              ) : (
                 <MessageInput onSendMessage={(text, media) => onSendMessage(text, activeChatId, media)} onStartRecording={startRecording} />
              )}
           </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center p-8">
           <div className="w-24 h-24 bg-brand-100 dark:bg-brand-900/20 rounded-full flex items-center justify-center mb-6">
              <Send className="w-10 h-10 text-brand-600 dark:text-brand-400" />
           </div>
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Messages</h2>
           <p className="text-gray-500 dark:text-gray-400 max-w-sm">Select a conversation to start chatting, calling, or sharing media with your network.</p>
        </div>
      )}
    </div>
  );
};

const ChatContent = ({ messages, currentUser, activeChatId }: { messages: Message[], currentUser: User, activeChatId: string }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const chatMessages = messages.filter(m => 
    (m.senderId === currentUser.id && m.receiverId === activeChatId) || 
    (m.senderId === activeChatId && m.receiverId === currentUser.id)
  ).sort((a, b) => a.timestamp - b.timestamp);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages.length]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black/50" ref={scrollRef}>
       {chatMessages.map((msg, index) => {
         const isMe = msg.senderId === currentUser.id;
         const showAvatar = !isMe && (index === 0 || chatMessages[index-1].senderId !== msg.senderId);
         
         return (
           <motion.div 
             key={msg.id} 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
           >
              {!isMe && (
                 <div 
                    className="w-8 mr-2 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); navigate(`/profile/${msg.senderId}`); }}
                 >
                    {showAvatar && <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden"><img src={`https://picsum.photos/seed/${msg.senderId}/50`} className="w-full h-full object-cover"/></div>}
                 </div>
              )}
              <div className={`max-w-[70%] sm:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                 <div 
                   className={`
                     relative px-4 py-2.5 text-[15px] shadow-sm
                     ${isMe 
                       ? 'bg-brand-600 text-white rounded-2xl rounded-tr-sm' 
                       : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-gray-700'}
                   `}
                 >
                    {msg.mediaUrl && (
                       <div className="mb-2 -mx-2 -mt-2">
                          {msg.mediaType === 'image' && <img src={msg.mediaUrl} className="rounded-t-xl w-full h-auto max-h-60 object-cover" />}
                          {msg.mediaType === 'audio' && (
                             <div className="px-2 pt-2"><AudioPlayer src={msg.mediaUrl} /></div>
                          )}
                       </div>
                    )}
                    
                    {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                    
                    <div className={`flex items-center justify-end space-x-1 mt-1 text-[10px] ${isMe ? 'text-brand-100' : 'text-gray-400'}`}>
                       <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                       {isMe && <MessageStatusIcon isRead={msg.isRead} status={msg.status} />}
                    </div>
                 </div>
              </div>
           </motion.div>
         );
       })}
    </div>
  );
};

const MessageInput = ({ onSendMessage, onStartRecording }: { onSendMessage: (text: string, media?: any) => void, onStartRecording: () => void }) => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text);
      setText('');
      setIsTyping(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        onSendMessage('', { url: ev.target?.result as string, type: file.type.startsWith('video') ? 'video' : 'image' });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-end space-x-2">
       <button className="p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors hidden sm:block">
          <Smile className="w-6 h-6" />
       </button>
       <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <Paperclip className="w-6 h-6" />
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFile} />
       </button>
       
       <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-2xl px-4 py-2 flex items-center min-h-[48px]">
          <textarea 
            placeholder="Message..." 
            className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white resize-none max-h-32 text-sm py-1"
            rows={1}
            value={text}
            onChange={(e) => {
               setText(e.target.value);
               // Auto-grow height logic could go here
            }}
            onKeyDown={(e) => {
               if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
               }
            }}
          />
       </div>

       {text.trim() ? (
         <button onClick={handleSend} className="p-3 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 transition-transform transform active:scale-95">
            <Send className="w-5 h-5 ml-0.5" />
         </button>
       ) : (
         <button onClick={onStartRecording} className="p-3 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 transition-transform transform active:scale-95">
            <Mic className="w-5 h-5" />
         </button>
       )}
    </div>
  );
};

export default ChatSystem;
