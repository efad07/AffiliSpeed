
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Send, Mic, Image as ImageIcon, Phone, Video, MoreVertical, 
  ArrowLeft, Search, Check, CheckCheck, X, PhoneOff, MicOff, 
  Camera, Trash2, Smile, Paperclip, MoreHorizontal, Play, Pause,
  User as UserIcon, LogOut, Clock, AlertCircle, Shield, Users,
  Ban, Edit2, UserPlus, UserMinus, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Message, CallSession, Group, GroupMember } from '../types';

// --- Types & Interfaces for Component ---

interface ChatSystemProps {
  currentUser: User;
  users: User[];
  messages: Message[];
  groups: Group[];
  onSendMessage: (text: string, receiverId: string, media?: { url: string, type: 'image'|'video'|'audio' }) => void;
  onCreateGroup: (name: string, members: string[]) => void;
  onGroupAction: (groupId: string, action: 'leave' | 'add_member' | 'remove_member' | 'promote_admin' | 'update_info' | 'set_nickname', payload?: any) => void;
  onBlockUser: (userId: string) => void;
  onUnblockUser: (userId: string) => void;
  onDeleteMessage: (messageId: string, forEveryone: boolean) => void;
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

// --- Group Info Modal ---
const GroupInfoPanel = ({ 
    group, 
    currentUser, 
    users, 
    onClose, 
    onAction 
}: { 
    group: Group, 
    currentUser: User, 
    users: User[],
    onClose: () => void, 
    onAction: (action: string, payload: any) => void 
}) => {
    const [editName, setEditName] = useState(false);
    const [name, setName] = useState(group.name);
    const [addMemberMode, setAddMemberMode] = useState(false);
    
    const myMember = group.members.find(m => m.userId === currentUser.id);
    const isAdmin = myMember?.role === 'admin';

    const potentialMembers = users.filter(u => !group.members.find(m => m.userId === u.id) && u.id !== currentUser.id);

    return (
        <motion.div 
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }} 
            className="absolute inset-y-0 right-0 w-full md:w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-50 shadow-2xl flex flex-col"
        >
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center">
                <button onClick={onClose} className="mr-3"><ArrowLeft className="w-6 h-6 text-gray-500" /></button>
                <h2 className="font-bold text-lg dark:text-white">Group Info</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="flex flex-col items-center">
                    <img src={group.avatar} className="w-24 h-24 rounded-full mb-3 border-4 border-gray-100 dark:border-gray-800" />
                    {editName ? (
                        <div className="flex items-center space-x-2 w-full">
                            <input 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                className="flex-1 bg-gray-100 dark:bg-gray-800 p-2 rounded text-center dark:text-white"
                            />
                            <button onClick={() => { onAction('update_info', { name }); setEditName(false); }} className="p-2 bg-green-500 text-white rounded"><Check className="w-4 h-4" /></button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-xl dark:text-white">{group.name}</h3>
                            {isAdmin && <button onClick={() => setEditName(true)}><Edit2 className="w-4 h-4 text-gray-400" /></button>}
                        </div>
                    )}
                    <p className="text-sm text-gray-500">{group.members.length} members</p>
                </div>

                {isAdmin && (
                    <div>
                        <button 
                            onClick={() => setAddMemberMode(!addMemberMode)}
                            className="flex items-center space-x-2 text-brand-600 font-medium w-full p-2 hover:bg-brand-50 dark:hover:bg-brand-900/10 rounded-lg transition-colors"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span>Add Members</span>
                        </button>
                        {addMemberMode && (
                            <div className="mt-2 space-y-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 max-h-40 overflow-y-auto">
                                {potentialMembers.map(u => (
                                    <div key={u.id} className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                        <div className="flex items-center space-x-2">
                                            <img src={u.avatar} className="w-6 h-6 rounded-full" />
                                            <span className="text-sm dark:text-white">{u.name}</span>
                                        </div>
                                        <button onClick={() => onAction('add_member', { userId: u.id })} className="text-brand-500 font-bold text-xs">ADD</button>
                                    </div>
                                ))}
                                {potentialMembers.length === 0 && <p className="text-xs text-gray-500 text-center p-2">No users to add</p>}
                            </div>
                        )}
                    </div>
                )}

                <div>
                    <h4 className="font-bold text-sm text-gray-500 uppercase mb-3">Members</h4>
                    <div className="space-y-3">
                        {group.members.map(member => {
                            const user = users.find(u => u.id === member.userId) || (member.userId === currentUser.id ? currentUser : null);
                            if (!user) return null;
                            const isMe = user.id === currentUser.id;
                            
                            return (
                                <div key={user.id} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <img src={user.avatar} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <div className="flex items-center space-x-1">
                                                <span className="font-medium text-sm dark:text-white">
                                                    {member.nickname || user.name} {isMe && '(You)'}
                                                </span>
                                                {member.role === 'admin' && <Shield className="w-3 h-3 text-green-500 fill-current" />}
                                            </div>
                                            {member.nickname && <span className="text-xs text-gray-400">@{user.handle}</span>}
                                        </div>
                                    </div>
                                    
                                    {isMe ? (
                                        <button 
                                            onClick={() => {
                                                const newNick = prompt("Enter new nickname:", member.nickname || "");
                                                if (newNick !== null) onAction('set_nickname', { userId: currentUser.id, nickname: newNick });
                                            }}
                                            className="text-xs text-brand-600 hover:underline"
                                        >
                                            Set Nickname
                                        </button>
                                    ) : isAdmin ? (
                                        <div className="flex items-center space-x-1">
                                            <button 
                                                onClick={() => onAction('remove_member', { userId: user.id })}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" 
                                                title="Kick"
                                            >
                                                <UserMinus className="w-4 h-4" />
                                            </button>
                                            {member.role !== 'admin' && (
                                                <button 
                                                    onClick={() => onAction('promote_admin', { userId: user.id })}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded" 
                                                    title="Make Admin"
                                                >
                                                    <Shield className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button 
                    onClick={() => onAction('leave', {})}
                    className="flex items-center justify-center space-x-2 w-full p-3 text-red-600 bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors font-bold"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Leave Group</span>
                </button>
            </div>
        </motion.div>
    );
};

// --- Main Chat System Component ---

const ChatSystem: React.FC<ChatSystemProps> = ({ 
    currentUser, users, messages, groups, 
    onSendMessage, onCreateGroup, onGroupAction, 
    onBlockUser, onUnblockUser, onDeleteMessage 
}) => {
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const [activeChatId, setActiveChatId] = useState<string | null>(routeUserId || null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // States
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  
  // Menu States
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Active Chat Checks
  const activeUser = !activeChatId?.startsWith('g_') ? users.find(u => u.id === activeChatId) : null;
  const activeGroup = activeChatId?.startsWith('g_') ? groups.find(g => g.id === activeChatId) : null;
  
  const chatTitle = activeGroup ? activeGroup.name : activeUser?.name;
  const chatAvatar = activeGroup ? activeGroup.avatar : activeUser?.avatar;
  const isOnline = activeUser?.isOnline ?? false;

  // Blocking Check
  const isBlockedByMe = activeUser && currentUser.blockedUsers?.includes(activeUser.id);
  
  // Sync route
  useEffect(() => { setActiveChatId(routeUserId || null); setShowGroupInfo(false); setShowChatMenu(false); }, [routeUserId]);

  const goToProfile = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  // --- Voice Logic ---
  const startRecording = async () => { /* ... existing impl ... */ setIsRecording(true); }; 
  const stopRecording = () => { setIsRecording(false); };
  const cancelRecording = () => { setIsRecording(false); };
  const sendVoiceNote = () => { setIsRecording(false); onSendMessage("Voice Note", activeChatId || "", { url: "", type: 'audio' }); };

  useEffect(() => {
    let interval: any;
    if (isRecording) interval = setInterval(() => setRecordingDuration(p => p + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  // --- Call Logic ---
  const initiateCall = (type: 'audio' | 'video') => {
    if (!activeChatId) return;
    setCallSession({ id: `call_${Date.now()}`, callerId: currentUser.id, receiverId: activeChatId, type, status: 'dialing' });
    setTimeout(() => setCallSession(prev => prev ? { ...prev, status: 'ringing' } : null), 1500);
    setTimeout(() => setCallSession(prev => prev ? { ...prev, status: 'connected', startTime: Date.now() } : null), 4000);
  };
  const endCall = () => setCallSession(null);

  // --- Render ---
  const conversations = [
      ...users.filter(u => u.id !== currentUser.id).map(user => {
        const msgs = messages.filter(m => (m.senderId === user.id && m.receiverId === currentUser.id) || (m.senderId === currentUser.id && m.receiverId === user.id)).sort((a, b) => b.timestamp - a.timestamp);
        return { id: user.id, type: 'user', data: user, lastMessage: msgs[0], unread: msgs.filter(m => m.senderId === user.id && !m.isRead).length };
      }),
      ...groups.map(group => {
          const msgs = messages.filter(m => m.receiverId === group.id).sort((a, b) => b.timestamp - a.timestamp);
          const unread = msgs.filter(m => !m.isRead && m.senderId !== currentUser.id).length;
          return { id: group.id, type: 'group', data: group, lastMessage: msgs[0], unread };
      })
  ].filter(c => c.lastMessage || c.type === 'group').sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));

  const filteredConversations = conversations.filter(c => 
    ('name' in c.data ? c.data.name : '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-0px)] bg-white dark:bg-black overflow-hidden relative">
      
      {/* Call Overlay */}
      <AnimatePresence>
        {callSession && (
          <motion.div initial={{opacity:0,y:"100%"}} animate={{opacity:1,y:0}} exit={{opacity:0,y:"100%"}} className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center text-white">
             <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent z-10"><div className="text-sm font-medium text-white/80">{callSession.status}</div></div>
             <div className="flex flex-col items-center"><img src={activeUser?.avatar || activeGroup?.avatar} className="w-32 h-32 rounded-full border-4 border-white/20 mb-6 animate-pulse"/> <h2 className="text-2xl font-bold">{activeUser?.name || activeGroup?.name}</h2></div>
             <div className="absolute bottom-12 flex space-x-6"><button onClick={endCall} className="p-4 bg-red-600 rounded-full"><PhoneOff className="w-8 h-8"/></button></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`${activeChatId ? 'hidden md:flex' : 'flex'} w-full md:w-96 flex-col border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-black z-10`}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
           <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold dark:text-white">Messages</h1>
              <div className="relative">
                 <button 
                    onClick={() => setShowSidebarMenu(!showSidebarMenu)} 
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full text-gray-600 dark:text-gray-300"
                 >
                    <MoreHorizontal className="w-6 h-6" />
                 </button>
                 {showSidebarMenu && (
                    <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSidebarMenu(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden">
                        <button 
                            onClick={() => { onCreateGroup(`Group ${groups.length + 1}`, [users[0].id]); setShowSidebarMenu(false); }}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white flex items-center space-x-2"
                        >
                            <Users className="w-4 h-4" /> <span>Create Group</span>
                        </button>
                        <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white flex items-center space-x-2">
                            <CheckCheck className="w-4 h-4" /> <span>Mark all read</span>
                        </button>
                    </div>
                    </>
                 )}
              </div>
           </div>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search..." className="w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto">
           {filteredConversations.map((convo) => (
             <div key={convo.id} onClick={() => { setActiveChatId(convo.id); navigate(`/messages/${convo.id}`); }} className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${activeChatId === convo.id ? 'bg-brand-50 dark:bg-brand-900/10' : ''}`}>
                <div className="relative">
                   <img src={(convo.data as any).avatar} className="w-14 h-14 rounded-full object-cover" />
                   {convo.type === 'user' && (convo.data as User).isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-black rounded-full"></div>}
                </div>
                <div className="ml-4 flex-1 min-w-0">
                   <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`text-sm font-semibold truncate ${convo.unread > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{(convo.data as any).name}</h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{convo.lastMessage ? new Date(convo.lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <p className={`text-sm truncate pr-2 ${convo.unread > 0 ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                         {convo.lastMessage ? (convo.lastMessage.deletedForEveryone ? <i>Message deleted</i> : (convo.lastMessage.senderId === currentUser.id ? 'You: ' : '') + (convo.lastMessage.mediaUrl ? 'Sent a file' : convo.lastMessage.text)) : 'Start chatting'}
                      </p>
                      {convo.unread > 0 && <span className="bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">{convo.unread}</span>}
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Chat Window */}
      {activeChatId ? (
        <div className={`flex-1 flex flex-col bg-white dark:bg-black relative ${activeChatId ? 'flex' : 'hidden md:flex'}`}>
           {/* Header */}
           <div className="h-16 px-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center">
                 <button onClick={() => { setActiveChatId(null); navigate('/messages'); }} className="md:hidden mr-3 text-gray-600 dark:text-gray-300"><ArrowLeft className="w-6 h-6" /></button>
                 <div className="flex items-center cursor-pointer group" onClick={() => activeUser ? goToProfile({} as any, activeUser.id) : setShowGroupInfo(true)}>
                    <div className="relative">
                        <img src={chatAvatar} className="w-10 h-10 rounded-full object-cover" />
                        {isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-black rounded-full"></div>}
                    </div>
                    <div className="ml-3">
                        <h2 className="font-bold text-gray-900 dark:text-white text-sm">{chatTitle}</h2>
                        {activeGroup ? (
                            <p className="text-xs text-gray-500">{activeGroup.members.length} members</p>
                        ) : (
                            <p className="text-xs text-green-500 font-medium">{isOnline ? 'Active now' : 'Offline'}</p>
                        )}
                    </div>
                 </div>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-3">
                 {!activeGroup && (
                     <>
                        <button onClick={() => initiateCall('audio')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-brand-600 dark:text-brand-400"><Phone className="w-5 h-5" /></button>
                        <button onClick={() => initiateCall('video')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-brand-600 dark:text-brand-400"><Video className="w-5 h-5" /></button>
                     </>
                 )}
                 {activeGroup ? (
                     <button onClick={() => setShowGroupInfo(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400"><MoreVertical className="w-5 h-5" /></button>
                 ) : (
                     <div className="relative">
                        <button 
                            onClick={() => setShowChatMenu(!showChatMenu)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>
                        {showChatMenu && (
                            <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowChatMenu(false)}></div>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 z-20">
                                <button onClick={() => { goToProfile({} as any, activeChatId!); setShowChatMenu(false); }} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white flex items-center space-x-2">
                                    <UserIcon className="w-4 h-4" /> <span>View Profile</span>
                                </button>
                                <button onClick={() => { isBlockedByMe ? onUnblockUser(activeChatId!) : onBlockUser(activeChatId!); setShowChatMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2">
                                    {isBlockedByMe ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                    <span>{isBlockedByMe ? 'Unblock User' : 'Block User'}</span>
                                </button>
                            </div>
                            </>
                        )}
                     </div>
                 )}
              </div>
           </div>

           {/* Info Panel */}
           <AnimatePresence>
               {showGroupInfo && activeGroup && (
                   <GroupInfoPanel 
                       group={activeGroup} 
                       currentUser={currentUser}
                       users={users}
                       onClose={() => setShowGroupInfo(false)} 
                       onAction={(action, payload) => onGroupAction(activeGroup.id, action as any, payload)}
                   />
               )}
           </AnimatePresence>

           {/* Messages */}
           <ChatContent 
             messages={messages} 
             currentUser={currentUser} 
             activeChatId={activeChatId} 
             activeGroup={activeGroup || undefined}
             users={users}
             onDelete={onDeleteMessage}
             isAdmin={activeGroup?.members.find(m => m.userId === currentUser.id)?.role === 'admin'}
           />

           {/* Input Area */}
           <div className="p-3 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800">
              {isBlockedByMe ? (
                  <div className="text-center p-3 text-red-500 text-sm bg-red-50 dark:bg-red-900/10 rounded-xl">
                      You have blocked this user. <button onClick={() => onUnblockUser(activeChatId)} className="underline font-bold">Unblock</button> to send messages.
                  </div>
              ) : activeGroup && !activeGroup.members.find(m => m.userId === currentUser.id) ? (
                  <div className="text-center p-3 text-gray-500 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl">
                      You are no longer a participant in this group.
                  </div>
              ) : (
                  isRecording ? (
                     <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-full animate-pulse">
                        <div className="flex items-center space-x-3 text-red-500">
                           <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                           <span className="font-mono font-bold text-sm">{Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                           <button onClick={() => setIsRecording(false)} className="text-gray-500">Cancel</button>
                           <button onClick={() => { setIsRecording(false); onSendMessage("Voice Note", activeChatId); }} className="bg-red-500 text-white p-2 rounded-full"><Send className="w-5 h-5" /></button>
                        </div>
                     </div>
                  ) : (
                     <MessageInput onSendMessage={(text, media) => onSendMessage(text, activeChatId, media)} onStartRecording={() => setIsRecording(true)} />
                  )
              )}
           </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center p-8">
           <div className="w-24 h-24 bg-brand-100 dark:bg-brand-900/20 rounded-full flex items-center justify-center mb-6"><Send className="w-10 h-10 text-brand-600 dark:text-brand-400" /></div>
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Messages</h2>
           <p className="text-gray-500 dark:text-gray-400 max-w-sm">Select a conversation to start chatting.</p>
        </div>
      )}
    </div>
  );
};

const ChatContent = ({ messages, currentUser, activeChatId, activeGroup, users, onDelete, isAdmin }: { messages: Message[], currentUser: User, activeChatId: string, activeGroup?: Group, users: User[], onDelete: (id: string, everyone: boolean) => void, isAdmin?: boolean }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, msgId: string, isSender: boolean } | null>(null);
  const navigate = useNavigate();
  
  const chatMessages = messages.filter(m => 
    (m.receiverId === activeChatId) || 
    (!activeGroup && ((m.senderId === currentUser.id && m.receiverId === activeChatId) || (m.senderId === activeChatId && m.receiverId === currentUser.id)))
  ).sort((a, b) => a.timestamp - b.timestamp);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [chatMessages.length, activeChatId]);

  // Close context menu on click
  useEffect(() => {
      const closeMenu = () => setContextMenu(null);
      window.addEventListener('click', closeMenu);
      return () => window.removeEventListener('click', closeMenu);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black/50 relative" ref={scrollRef}>
       {chatMessages.map((msg, index) => {
         // Skip messages deleted for me
         if (msg.deletedFor?.includes(currentUser.id)) return null;

         const isMe = msg.senderId === currentUser.id;
         const senderMember = activeGroup?.members.find(m => m.userId === msg.senderId);
         const senderUser = users.find(u => u.id === msg.senderId) || (isMe ? currentUser : null);
         const showAvatar = !isMe && (index === 0 || chatMessages[index-1].senderId !== msg.senderId);
         const senderName = senderMember?.nickname || senderUser?.name || "Unknown";
         const isSenderAdmin = senderMember?.role === 'admin';

         return (
           <motion.div 
             key={msg.id} 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className={`flex ${isMe ? 'justify-end' : 'justify-start'} group/msg relative`}
             onContextMenu={(e) => {
                 e.preventDefault();
                 setContextMenu({ x: e.clientX, y: e.clientY, msgId: msg.id, isSender: isMe });
             }}
           >
              {!isMe && (
                 <div className="w-8 mr-2 flex-shrink-0 flex flex-col items-center">
                    {showAvatar && (
                        <div onClick={(e) => { e.stopPropagation(); navigate(`/profile/${msg.senderId}`); }} className="cursor-pointer">
                            <img src={senderUser?.avatar} className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 object-cover"/>
                        </div>
                    )}
                 </div>
              )}
              
              <div className={`max-w-[70%] sm:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}>
                 {!isMe && showAvatar && activeGroup && (
                     <div className="flex items-center space-x-1 ml-1 mb-1">
                         <span className="text-xs text-gray-500 font-medium">{senderName}</span>
                         {isSenderAdmin && <Shield className="w-3 h-3 text-green-500 fill-current" />}
                     </div>
                 )}
                 
                 {/* Message Bubble 3-dot (visible on hover) */}
                 <button 
                    className={`absolute top-2 ${isMe ? '-left-8' : '-right-8'} p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity`}
                    onClick={(e) => { e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, msgId: msg.id, isSender: isMe }); }}
                 >
                    <MoreVertical className="w-4 h-4" />
                 </button>

                 <div className={`relative px-4 py-2.5 text-[15px] shadow-sm ${isMe ? 'bg-brand-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-gray-700'}`}>
                    {msg.deletedForEveryone ? (
                        <span className="italic opacity-60 text-sm flex items-center gap-1"><Ban className="w-3 h-3" /> This message was deleted</span>
                    ) : (
                        <>
                            {msg.mediaUrl && (
                                <div className="mb-2 -mx-2 -mt-2">
                                    {msg.mediaType === 'image' && <img src={msg.mediaUrl} className="rounded-t-xl w-full h-auto max-h-60 object-cover" />}
                                    {msg.mediaType === 'audio' && <div className="px-2 pt-2"><AudioPlayer src={msg.mediaUrl} /></div>}
                                </div>
                            )}
                            {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                        </>
                    )}
                    <div className={`flex items-center justify-end space-x-1 mt-1 text-[10px] ${isMe ? 'text-brand-100' : 'text-gray-400'}`}>
                       <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                       {isMe && !msg.deletedForEveryone && <MessageStatusIcon isRead={msg.isRead} status={msg.status} />}
                    </div>
                 </div>
              </div>
           </motion.div>
         );
       })}

       {contextMenu && (
           <>
           <div className="fixed inset-0 z-50" onClick={() => setContextMenu(null)}></div>
           <div 
             style={{ top: contextMenu.y, left: contextMenu.x }} 
             className="fixed z-[60] bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-100 dark:border-gray-700 py-1 min-w-[160px]"
           >
               <button onClick={() => { onDelete(contextMenu.msgId, false); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm dark:text-white flex items-center gap-2">
                   <Trash2 className="w-4 h-4" /> Delete for me
               </button>
               {(contextMenu.isSender || isAdmin) && (
                   <button onClick={() => { onDelete(contextMenu.msgId, true); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-red-500 flex items-center gap-2">
                       <Trash2 className="w-4 h-4" /> Delete for everyone
                   </button>
               )}
           </div>
           </>
       )}
    </div>
  );
};

const MessageInput = ({ onSendMessage, onStartRecording }: { onSendMessage: (text: string, media?: any) => void, onStartRecording: () => void }) => {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => { if (text.trim()) { onSendMessage(text); setText(''); } };
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) { const reader = new FileReader(); reader.onload = (ev) => onSendMessage('', { url: ev.target?.result as string, type: e.target.files![0].type.startsWith('video') ? 'video' : 'image' }); reader.readAsDataURL(e.target.files[0]); } };

  return (
    <div className="flex items-end space-x-2">
       <button className="p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full hidden sm:block"><Smile className="w-6 h-6" /></button>
       <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><Paperclip className="w-6 h-6" /><input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFile} /></button>
       <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-2xl px-4 py-2 flex items-center min-h-[48px]"><textarea placeholder="Message..." className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white resize-none max-h-32 text-sm py-1" rows={1} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} /></div>
       {text.trim() ? <button onClick={handleSend} className="p-3 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 transition-transform transform active:scale-95"><Send className="w-5 h-5 ml-0.5" /></button> : <button onClick={onStartRecording} className="p-3 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 transition-transform transform active:scale-95"><Mic className="w-5 h-5" /></button>}
    </div>
  );
};

export default ChatSystem;
