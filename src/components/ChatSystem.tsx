
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Send, Mic, Phone, Video, MoreVertical, ArrowLeft, Search, 
  Check, CheckCheck, X, PhoneOff, Camera, Trash2, Smile, 
  Paperclip, MoreHorizontal, Play, Pause, User as UserIcon, 
  LogOut, Shield, Users, Ban, Edit2, UserPlus, UserMinus, 
  CornerDownLeft, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Message, CallSession, Group, GroupMember } from '../types';

// --- Interfaces ---

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
    if (isPlaying) audioRef.current.pause(); else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700/50 rounded-full p-2 pr-4 min-w-[150px]">
      <audio ref={audioRef} src={src} className="hidden" />
      <button onClick={togglePlay} className="p-2 bg-white dark:bg-gray-600 rounded-full shadow-sm text-brand-600 dark:text-brand-400">
        {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
      </button>
      <div className="flex-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
        <div className="h-full bg-brand-500 transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

// --- Create Group Modal ---
const CreateGroupModal = ({ users, onClose, onCreate }: { users: User[], onClose: () => void, onCreate: (name: string, ids: string[]) => void }) => {
    const [name, setName] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleUser = (id: string) => {
        if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(uid => uid !== id));
        else setSelectedIds(prev => [...prev, id]);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg dark:text-white">Create New Group</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Group Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Marketing Team" className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Select Members</label>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                            {users.map(u => (
                                <div key={u.id} onClick={() => toggleUser(u.id)} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${selectedIds.includes(u.id) ? 'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                    <div className="flex items-center space-x-3">
                                        <img src={u.avatar} className="w-8 h-8 rounded-full" />
                                        <span className="text-sm font-medium dark:text-white">{u.name}</span>
                                    </div>
                                    {selectedIds.includes(u.id) && <div className="bg-brand-500 text-white rounded-full p-1"><Check className="w-3 h-3" /></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button 
                        disabled={!name.trim() || selectedIds.length === 0}
                        onClick={() => onCreate(name, selectedIds)}
                        className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
                    >
                        Create Group ({selectedIds.length})
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// --- Group Info Panel ---
const GroupInfoPanel = ({ group, currentUser, users, onClose, onAction }: { group: Group, currentUser: User, users: User[], onClose: () => void, onAction: (action: string, payload: any) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(group.name);
    const [isAdding, setIsAdding] = useState(false);
    
    const myMember = group.members.find(m => m.userId === currentUser.id);
    const isAdmin = myMember?.role === 'admin';
    const nonMembers = users.filter(u => !group.members.find(m => m.userId === u.id) && u.id !== currentUser.id);

    return (
        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="absolute inset-y-0 right-0 w-full md:w-80 bg-white dark:bg-black border-l border-gray-100 dark:border-gray-800 z-40 shadow-2xl flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-10">
                <button onClick={onClose} className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" /></button>
                <h2 className="font-bold text-lg dark:text-white">Group Info</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 pb-20">
                {/* Header Info */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer mb-4">
                        <img src={group.avatar} className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 dark:border-gray-900 shadow-lg" />
                        {isAdmin && <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="w-8 h-8 text-white" /></div>}
                    </div>
                    
                    {isEditing ? (
                        <div className="flex items-center space-x-2 w-full max-w-[200px]">
                            <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-center font-bold dark:text-white outline-none" autoFocus />
                            <button onClick={() => { onAction('update_info', { name: editName }); setIsEditing(false); }} className="p-2 bg-green-500 text-white rounded-lg"><Check className="w-4 h-4" /></button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-bold dark:text-white text-center">{group.name}</h3>
                            {isAdmin && <button onClick={() => setIsEditing(true)}><Edit2 className="w-4 h-4 text-gray-400 hover:text-brand-500" /></button>}
                        </div>
                    )}
                    <p className="text-sm text-gray-500 mt-1">{group.members.length} members</p>
                </div>

                {/* Add Member (Admin) */}
                {isAdmin && (
                    <div className="mb-6">
                        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center justify-center w-full py-2.5 bg-brand-50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400 font-bold text-sm rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/20 transition-colors">
                            <UserPlus className="w-4 h-4 mr-2" /> {isAdding ? 'Cancel' : 'Add Members'}
                        </button>
                        <AnimatePresence>
                            {isAdding && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <div className="mt-2 space-y-1 bg-gray-50 dark:bg-gray-900 rounded-xl p-2">
                                        {nonMembers.map(u => (
                                            <div key={u.id} className="flex justify-between items-center p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <img src={u.avatar} className="w-6 h-6 rounded-full" />
                                                    <span className="text-sm dark:text-white">{u.name}</span>
                                                </div>
                                                <button onClick={() => { onAction('add_member', { userId: u.id }); setIsAdding(false); }} className="text-xs bg-brand-600 text-white px-2 py-1 rounded">Add</button>
                                            </div>
                                        ))}
                                        {nonMembers.length === 0 && <p className="text-xs text-center text-gray-500 p-2">No one else to add.</p>}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Members List */}
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Members</h4>
                    <div className="space-y-4">
                        {group.members.map(m => {
                            const user = users.find(u => u.id === m.userId) || (m.userId === currentUser.id ? currentUser : null);
                            if (!user) return null;
                            const isMe = user.id === currentUser.id;
                            
                            return (
                                <div key={user.id} className="flex items-center justify-between group">
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" />
                                            {m.role === 'admin' && <div className="absolute -top-1 -right-1 bg-yellow-400 text-white rounded-full p-[2px] border border-white dark:border-black"><Crown className="w-2 h-2 fill-current" /></div>}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-1">
                                                <span className="text-sm font-semibold dark:text-white">{m.nickname || user.name}</span>
                                                {isMe && <span className="text-xs text-gray-400">(You)</span>}
                                            </div>
                                            <span className="text-xs text-gray-500 block">{m.role}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {isMe ? (
                                            <button onClick={() => { const nick = prompt('New nickname:', m.nickname); if(nick) onAction('set_nickname', { userId: currentUser.id, nickname: nick }); }} className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        ) : isAdmin && (
                                            <>
                                                {m.role !== 'admin' && (
                                                    <button onClick={() => onAction('promote_admin', { userId: user.id })} className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded" title="Promote">
                                                        <Shield className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => onAction('remove_member', { userId: user.id })} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Kick">
                                                    <UserMinus className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Leave Button */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-black">
                <button 
                    onClick={() => { if(window.confirm('Are you sure you want to leave this group?')) onAction('leave', {}); }}
                    className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors font-bold"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Leave Group</span>
                </button>
            </div>
        </motion.div>
    );
};

// --- Chat System ---

const ChatSystem: React.FC<ChatSystemProps> = ({ 
    currentUser, users, messages, groups, 
    onSendMessage, onCreateGroup, onGroupAction, 
    onBlockUser, onUnblockUser, onDeleteMessage 
}) => {
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const [activeChatId, setActiveChatId] = useState<string | null>(routeUserId || null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI States
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  // Data resolution
  const activeUser = !activeChatId?.startsWith('g_') ? users.find(u => u.id === activeChatId) : null;
  const activeGroup = activeChatId?.startsWith('g_') ? groups.find(g => g.id === activeChatId) : null;
  
  const isOnline = activeUser?.isOnline ?? false;
  const isBlocked = activeUser && currentUser.blockedUsers?.includes(activeUser.id);

  useEffect(() => { setActiveChatId(routeUserId || null); setShowGroupInfo(false); }, [routeUserId]);

  // Combine lists
  const conversationList = [
      ...users.filter(u => u.id !== currentUser.id).map(u => ({ type: 'user', data: u, id: u.id })),
      ...groups.map(g => ({ type: 'group', data: g, id: g.id }))
  ].map(item => {
      const msgs = messages.filter(m => 
          item.type === 'group' ? m.receiverId === item.id : 
          ((m.senderId === item.id && m.receiverId === currentUser.id) || (m.senderId === currentUser.id && m.receiverId === item.id))
      ).sort((a,b) => b.timestamp - a.timestamp);
      return { ...item, lastMessage: msgs[0], unread: msgs.filter(m => m.senderId !== currentUser.id && !m.isRead).length };
  }).sort((a,b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));

  const filteredList = conversationList.filter(c => (c.data as any).name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleCreateGroupSubmit = (name: string, members: string[]) => {
      onCreateGroup(name, members);
      setShowCreateGroup(false);
  };

  return (
    <div className="flex h-[calc(100vh-0px)] bg-white dark:bg-black overflow-hidden relative">
      {/* Call Overlay */}
      <AnimatePresence>
        {callSession && (
          <motion.div initial={{opacity:0, y:"100%"}} animate={{opacity:1, y:0}} exit={{opacity:0, y:"100%"}} className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center text-white">
             <div className="absolute top-0 w-full p-6 bg-gradient-to-b from-black/50 to-transparent flex justify-between">
                 <span className="font-mono text-sm opacity-70">{callSession.status.toUpperCase()}</span>
             </div>
             <div className="flex flex-col items-center animate-pulse">
                 <img src={activeUser?.avatar || activeGroup?.avatar} className="w-32 h-32 rounded-full border-4 border-white/20 mb-6 shadow-2xl" /> 
                 <h2 className="text-3xl font-bold">{activeUser?.name || activeGroup?.name}</h2>
                 <p className="mt-2 text-lg opacity-60">AffiliSpeed {callSession.type === 'video' ? 'Video' : 'Audio'} Call...</p>
             </div>
             <div className="absolute bottom-12 flex gap-6">
                 <button onClick={() => setCallSession(null)} className="p-4 bg-red-600 rounded-full shadow-lg hover:scale-110 transition-transform"><PhoneOff className="w-8 h-8" /></button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      {showCreateGroup && <CreateGroupModal users={users.filter(u => u.id !== currentUser.id)} onClose={() => setShowCreateGroup(false)} onCreate={handleCreateGroupSubmit} />}

      {/* Sidebar */}
      <div className={`${activeChatId ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-black z-20`}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
           <div className="flex justify-between items-center mb-4">
               <h1 className="text-xl font-bold dark:text-white">Messages</h1>
               <button onClick={() => setShowCreateGroup(true)} className="p-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-full hover:bg-brand-100 transition-colors"><Users className="w-5 h-5" /></button>
           </div>
           <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-xl text-sm outline-none dark:text-white" />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto">
            {filteredList.map(item => (
                <div key={item.id} onClick={() => { setActiveChatId(item.id); navigate(`/messages/${item.id}`); }} className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 ${activeChatId === item.id ? 'bg-brand-50 dark:bg-brand-900/10' : ''}`}>
                    <div className="relative">
                        <img src={(item.data as any).avatar} className="w-12 h-12 rounded-full object-cover" />
                        {item.type === 'user' && (item.data as User).isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-black rounded-full"></div>}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                            <span className="font-semibold text-sm truncate dark:text-gray-200">{(item.data as any).name}</span>
                            <span className="text-[10px] text-gray-400">{item.lastMessage ? new Date(item.lastMessage.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}</span>
                        </div>
                        <div className="flex justify-between items-center mt-0.5">
                            <p className={`text-xs truncate max-w-[140px] ${item.unread ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                {item.lastMessage ? (
                                    item.lastMessage.deletedForEveryone ? <span className="italic flex items-center gap-1"><Ban className="w-3 h-3"/> Deleted</span> :
                                    (item.lastMessage.senderId === currentUser.id ? 'You: ' : '') + (item.lastMessage.text || 'Sent a file')
                                ) : 'Start chatting'}
                            </p>
                            {item.unread > 0 && <span className="bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{item.unread}</span>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeChatId ? (
          <div className="flex-1 flex flex-col relative bg-white dark:bg-black">
              {/* Header */}
              <div className="h-16 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-30">
                  <div className="flex items-center cursor-pointer" onClick={() => activeGroup ? setShowGroupInfo(true) : null}>
                      <button onClick={() => { setActiveChatId(null); navigate('/messages'); }} className="md:hidden mr-3"><ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" /></button>
                      <img src={activeGroup?.avatar || activeUser?.avatar} className="w-10 h-10 rounded-full" />
                      <div className="ml-3">
                          <h3 className="font-bold text-sm dark:text-white flex items-center gap-2">
                              {activeGroup?.name || activeUser?.name}
                              {activeGroup && <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">{activeGroup.members.length}</span>}
                          </h3>
                          <p className="text-xs text-gray-500">{activeGroup ? 'Tap for info' : (isOnline ? 'Active now' : 'Offline')}</p>
                      </div>
                  </div>
                  <div className="flex items-center space-x-1">
                      <button onClick={() => setCallSession({id:'1', callerId:currentUser.id, receiverId:activeChatId, type:'audio', status:'dialing'})} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-brand-600"><Phone className="w-5 h-5" /></button>
                      <button onClick={() => setCallSession({id:'1', callerId:currentUser.id, receiverId:activeChatId, type:'video', status:'dialing'})} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-brand-600"><Video className="w-5 h-5" /></button>
                      {activeGroup && <button onClick={() => setShowGroupInfo(!showGroupInfo)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500"><MoreVertical className="w-5 h-5" /></button>}
                      {activeUser && (
                          <div className="relative group">
                              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500"><MoreVertical className="w-5 h-5" /></button>
                              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 shadow-xl rounded-xl border border-gray-100 dark:border-gray-800 hidden group-hover:block overflow-hidden z-50">
                                  <button onClick={() => isBlocked ? onUnblockUser(activeUser.id) : onBlockUser(activeUser.id)} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                                      <Ban className="w-4 h-4" /> {isBlocked ? 'Unblock' : 'Block'}
                                  </button>
                              </div>
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
                  chatId={activeChatId} 
                  group={activeGroup || undefined}
                  users={users}
                  onDelete={onDeleteMessage}
              />

              {/* Input */}
              <div className="p-3 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800">
                  {isBlocked ? (
                      <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-xl">You blocked this user. <button onClick={() => onUnblockUser(activeChatId)} className="text-brand-600 font-bold hover:underline">Unblock</button></div>
                  ) : activeGroup && !activeGroup.members.find(m => m.userId === currentUser.id) ? (
                      <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-xl">You are no longer a participant in this group.</div>
                  ) : (
                      <MessageInput 
                          onSend={(text, media) => onSendMessage(text, activeChatId, media)} 
                          isRecording={isRecording} 
                          setRecording={setIsRecording} 
                      />
                  )}
              </div>
          </div>
      ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-900">
              <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/20 rounded-full flex items-center justify-center mb-4 text-brand-600"><Send className="w-8 h-8" /></div>
              <h2 className="text-xl font-bold dark:text-white">Your Messages</h2>
              <p className="text-gray-500">Select a chat to start messaging</p>
          </div>
      )}
    </div>
  );
};

const ChatContent = ({ messages, currentUser, chatId, group, users, onDelete }: { messages: Message[], currentUser: User, chatId: string, group?: Group, users: User[], onDelete: (id: string, all: boolean) => void }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, msgId: string, isSender: boolean } | null>(null);

    const chatMessages = messages.filter(m => 
        group ? m.receiverId === group.id : 
        ((m.senderId === currentUser.id && m.receiverId === chatId) || (m.senderId === chatId && m.receiverId === currentUser.id))
    ).filter(m => !m.deletedFor?.includes(currentUser.id)).sort((a,b) => a.timestamp - b.timestamp);

    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [chatMessages.length, chatId]);
    useEffect(() => { const fn = () => setContextMenu(null); window.addEventListener('click', fn); return () => window.removeEventListener('click', fn); }, []);

    const myRole = group?.members.find(m => m.userId === currentUser.id)?.role;

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50" ref={scrollRef}>
            {chatMessages.map((msg, i) => {
                const isMe = msg.senderId === currentUser.id;
                const senderMember = group?.members.find(m => m.userId === msg.senderId);
                const senderUser = users.find(u => u.id === msg.senderId) || (isMe ? currentUser : null);
                const showAvatar = !isMe && (i === 0 || chatMessages[i-1].senderId !== msg.senderId);
                const senderName = senderMember?.nickname || senderUser?.name;

                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group/msg relative`}>
                        {!isMe && (
                            <div className="w-8 mr-2 flex-shrink-0 flex flex-col items-center">
                                {showAvatar && <img src={senderUser?.avatar} className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 object-cover" />}
                            </div>
                        )}
                        <div 
                            className={`max-w-[70%] relative`}
                            onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, msgId: msg.id, isSender: isMe }); }}
                        >
                            {group && !isMe && showAvatar && (
                                <div className="flex items-center space-x-1 ml-1 mb-1">
                                    <span className="text-[10px] font-bold text-gray-500">{senderName}</span>
                                    {senderMember?.role === 'admin' && <Shield className="w-3 h-3 text-green-500 fill-current" />}
                                </div>
                            )}
                            <div className={`px-4 py-2 rounded-2xl text-[15px] shadow-sm relative ${isMe ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'}`}>
                                {msg.deletedForEveryone ? (
                                    <span className="italic opacity-60 text-sm flex items-center gap-1"><Ban className="w-3 h-3" /> Message deleted</span>
                                ) : (
                                    <>
                                        {msg.mediaUrl && (
                                            <div className="mb-2 -mx-2 -mt-2 rounded-t-xl overflow-hidden">
                                                {msg.mediaType === 'image' ? <img src={msg.mediaUrl} className="w-full h-auto max-h-60 object-cover" /> : <div className="p-2"><AudioPlayer src={msg.mediaUrl} /></div>}
                                            </div>
                                        )}
                                        {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                    </>
                                )}
                                <div className={`text-[10px] text-right mt-1 flex justify-end items-center gap-1 ${isMe ? 'text-brand-100' : 'text-gray-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                    {isMe && !msg.deletedForEveryone && <MessageStatusIcon isRead={msg.isRead} status={msg.status} />}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
            
            {contextMenu && (
                <div style={{ top: contextMenu.y, left: contextMenu.x }} className="fixed z-[70] bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-100 dark:border-gray-700 py-1 min-w-[160px] animate-in fade-in zoom-in duration-100">
                    <button onClick={() => onDelete(contextMenu.msgId, false)} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center gap-2 dark:text-white"><Trash2 className="w-4 h-4" /> Delete for me</button>
                    {(contextMenu.isSender || myRole === 'admin') && (
                        <button onClick={() => onDelete(contextMenu.msgId, true)} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-red-500 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete for everyone</button>
                    )}
                </div>
            )}
        </div>
    );
};

const MessageInput = ({ onSend, isRecording, setRecording }: { onSend: (t: string, m?: any) => void, isRecording: boolean, setRecording: (b: boolean) => void }) => {
    const [text, setText] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);
    const [timer, setTimer] = useState(0);

    useEffect(() => { let i: any; if(isRecording) i = setInterval(() => setTimer(t => t + 1), 1000); return () => clearInterval(i); }, [isRecording]);

    const handleSend = () => { if(text.trim()) { onSend(text); setText(''); } };
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files?.[0]) {
            const f = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => onSend('', { url: ev.target?.result as string, type: f.type.startsWith('video') ? 'video' : 'image' });
            reader.readAsDataURL(f);
        }
    };

    if (isRecording) return (
        <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 rounded-full px-4 py-2 animate-pulse">
            <div className="flex items-center text-red-500 gap-2 font-mono font-bold"><div className="w-3 h-3 bg-red-500 rounded-full animate-ping"/> {Math.floor(timer/60)}:{String(timer%60).padStart(2,'0')}</div>
            <div className="flex gap-4">
                <button onClick={() => { setRecording(false); setTimer(0); }} className="text-gray-500 font-bold text-sm">Cancel</button>
                <button onClick={() => { setRecording(false); setTimer(0); onSend('Voice Message', { type: 'audio', url: '' }); }} className="bg-red-500 text-white p-2 rounded-full"><Send className="w-4 h-4" /></button>
            </div>
        </div>
    );

    return (
        <div className="flex items-end gap-2">
            <button onClick={() => fileRef.current?.click()} className="p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><Paperclip className="w-5 h-5" /><input type="file" ref={fileRef} className="hidden" accept="image/*,video/*" onChange={handleFile} /></button>
            <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-2xl px-4 py-2 min-h-[44px] flex items-center">
                <textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}} placeholder="Message..." className="w-full bg-transparent outline-none text-sm resize-none dark:text-white" rows={1} />
            </div>
            {text.trim() ? (
                <button onClick={handleSend} className="p-3 bg-brand-600 text-white rounded-full shadow-lg hover:scale-105 transition-transform"><Send className="w-5 h-5 ml-0.5" /></button>
            ) : (
                <button onClick={() => setRecording(true)} className="p-3 bg-brand-600 text-white rounded-full shadow-lg hover:scale-105 transition-transform"><Mic className="w-5 h-5" /></button>
            )}
        </div>
    );
};

export default ChatSystem;
