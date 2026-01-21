import React, { useState, useRef, useEffect } from 'react';
import { Story, User } from '../types';
import { Plus, X, MoreHorizontal, Trash2, Edit2, ShoppingBag, ExternalLink, Heart, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryTrayProps {
  stories: Story[];
  currentUser: User;
  onAddStory: (file: File, caption: string, link?: string, label?: string) => void;
  onDeleteStory: (id: string) => void;
  onEditStory: (id: string, caption: string) => void;
  onReplyToStory?: (storyId: string, text: string) => void;
}

const StoryTray: React.FC<StoryTrayProps> = ({ stories, currentUser, onAddStory, onDeleteStory, onEditStory, onReplyToStory }) => {
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  
  // Interaction states
  const [isPaused, setIsPaused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCaptionText, setEditCaptionText] = useState("");
  const [replyText, setReplyText] = useState("");

  // Upload States
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [newCaption, setNewCaption] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newLabel, setNewLabel] = useState('Get Offer');

  const activeStory = viewingIndex !== null ? stories[viewingIndex] : null;

  useEffect(() => {
    if (!activeStory || isPaused) return;

    const duration = activeStory.type === 'video' ? 10000 : 5000;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + (100 / (duration / 50));
      });
    }, 50);

    return () => clearInterval(interval);
  }, [activeStory, isPaused]);

  const handleNext = () => {
    if (viewingIndex !== null) {
      if (viewingIndex < stories.length - 1) {
        setViewingIndex(viewingIndex + 1);
        setProgress(0);
      } else {
        closeViewer();
      }
    }
  };

  const handlePrev = () => {
    if (viewingIndex !== null) {
      if (viewingIndex > 0) {
        setViewingIndex(viewingIndex - 1);
        setProgress(0);
      } else {
        closeViewer();
      }
    }
  };

  const closeViewer = () => {
    setViewingIndex(null);
    setProgress(0);
    setIsPaused(false);
    setShowMenu(false);
    setReplyText("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setPendingFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPendingPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (pendingFile) {
      onAddStory(pendingFile, newCaption, newLink, newLabel);
      setPendingFile(null);
      setPendingPreview(null);
      setNewCaption('');
      setNewLink('');
      setNewLabel('Get Offer'); // Reset label to default
    }
  };

  const handleDelete = () => {
    if (activeStory) {
      onDeleteStory(activeStory.id);
      closeViewer();
    }
  };

  const handleEdit = () => {
    if (activeStory) {
      setEditCaptionText(activeStory.caption || '');
      setShowEditModal(true);
      setIsPaused(true);
    }
  };

  const saveEdit = () => {
    if (activeStory) {
      onEditStory(activeStory.id, editCaptionText);
      setShowEditModal(false);
      setIsPaused(false);
      setShowMenu(false);
    }
  };

  const handleSendReply = () => {
    if (replyText.trim() && activeStory && onReplyToStory) {
      onReplyToStory(activeStory.id, replyText);
      setReplyText("");
      // Optional: Show some visual feedback or close viewer
      setIsPaused(false);
    }
  };

  return (
    <>
      <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar px-1">
        {/* Add Story Button */}
        <div className="flex flex-col items-center space-y-1 min-w-[72px]">
          <div 
            className="w-[72px] h-[72px] rounded-full p-[2px] border-2 border-dashed border-gray-300 dark:border-gray-600 relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
             <img src={currentUser.avatar} className="w-full h-full rounded-full object-cover opacity-50" alt="Me" />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-brand-600 rounded-full p-1 text-white shadow-md">
                   <Plus className="w-5 h-5" />
                </div>
             </div>
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Add Story</span>
        </div>

        {/* Story List */}
        {stories.map((story, index) => (
          <div 
            key={story.id} 
            className="flex flex-col items-center space-y-1 min-w-[72px] cursor-pointer group"
            onClick={() => { setViewingIndex(index); setProgress(0); }}
          >
            <div className={`w-[72px] h-[72px] rounded-full p-[2px] ${!story.viewed ? 'bg-gradient-to-tr from-brand-500 to-purple-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
               <div className="w-full h-full rounded-full border-2 border-white dark:border-gray-900 overflow-hidden">
                 <img src={story.user.avatar} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={story.user.name} />
               </div>
            </div>
            <span className="text-xs text-gray-900 dark:text-white truncate w-16 text-center">{story.user.handle}</span>
          </div>
        ))}
      </div>

      {/* Story Viewer Overlay */}
      <AnimatePresence>
        {viewingIndex !== null && activeStory && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 bg-black flex items-center justify-center"
           >
              {/* Progress Bar */}
              <div className="absolute top-4 left-4 right-4 flex space-x-1 z-20">
                 {stories.map((s, i) => (
                    <div key={s.id} className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden">
                       <div 
                         className="h-full bg-white transition-all duration-100 ease-linear"
                         style={{ 
                           width: i < viewingIndex ? '100%' : i === viewingIndex ? `${progress}%` : '0%' 
                         }}
                       />
                    </div>
                 ))}
              </div>

              {/* Header */}
              <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-20 text-white">
                 <div className="flex items-center space-x-2">
                    <img src={activeStory.user.avatar} className="w-8 h-8 rounded-full border border-white/50" />
                    <span className="font-semibold text-sm">{activeStory.user.handle}</span>
                    <span className="text-white/60 text-xs">• {new Date(activeStory.expiresAt - 86400000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                 </div>
                 <div className="flex items-center space-x-4">
                    {activeStory.userId === currentUser.id && (
                       <div className="relative">
                          <button onClick={() => { setShowMenu(!showMenu); setIsPaused(true); }}>
                             <MoreHorizontal className="w-6 h-6" />
                          </button>
                          {showMenu && (
                            <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden text-gray-900 dark:text-white">
                               <button onClick={handleEdit} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"><Edit2 className="w-3 h-3"/> Edit</button>
                               <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 flex items-center gap-2"><Trash2 className="w-3 h-3"/> Delete</button>
                            </div>
                          )}
                       </div>
                    )}
                    <button onClick={closeViewer}><X className="w-8 h-8" /></button>
                 </div>
              </div>

              {/* Navigation Zones (Hidden tap areas) */}
              <div className="absolute inset-0 flex z-10">
                 <div className="w-1/3 h-full" onClick={handlePrev}></div>
                 <div className="w-1/3 h-full" onClick={() => setIsPaused(!isPaused)}></div>
                 <div className="w-1/3 h-full" onClick={handleNext}></div>
              </div>

              {/* Content */}
              <div className="w-full h-full max-w-lg aspect-[9/16] bg-gray-900 relative flex flex-col justify-end">
                 <div className="absolute inset-0 z-0">
                    {activeStory.type === 'video' ? (
                        <video 
                        src={activeStory.mediaUrl} 
                        className="w-full h-full object-cover" 
                        autoPlay 
                        playsInline
                        onEnded={handleNext}
                        ref={videoRef}
                        />
                    ) : (
                        <img src={activeStory.mediaUrl} className="w-full h-full object-cover" />
                    )}
                 </div>
                 
                 {/* Dark Overlay for Text Readability */}
                 <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 pointer-events-none"></div>

                 {/* Caption */}
                 {activeStory.caption && (
                    <div className="relative z-20 px-4 mb-4 text-center">
                       <p className="text-white text-lg font-medium drop-shadow-md">{activeStory.caption}</p>
                    </div>
                 )}

                 {/* Affiliate Link (Restored) */}
                 {activeStory.affiliateLink && (
                    <div className="relative z-30 flex justify-center mb-6">
                       <a 
                         href={activeStory.affiliateLink}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm flex items-center space-x-2 shadow-xl hover:scale-105 transition-transform active:scale-95"
                         onClick={(e) => {
                             e.stopPropagation();
                             setIsPaused(true);
                         }}
                       >
                          <ShoppingBag className="w-4 h-4" />
                          <span>{activeStory.affiliateLabel || 'Shop Now'}</span>
                          <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
                       </a>
                    </div>
                 )}

                 {/* Message Reply Input (Instagram Style) */}
                 {activeStory.userId !== currentUser.id && (
                     <div className="relative z-30 px-4 pb-4 pt-2 flex items-center space-x-3">
                        <div className="flex-1 relative">
                            <input 
                                type="text" 
                                placeholder="Send message..." 
                                className="w-full bg-transparent border border-white/40 rounded-full py-3 px-4 text-white placeholder-white/70 focus:outline-none focus:border-white focus:bg-white/10 transition-colors backdrop-blur-sm"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onFocus={() => setIsPaused(true)}
                                onBlur={() => setIsPaused(false)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                            />
                        </div>
                        <button className="p-2 transition-transform active:scale-90">
                            <Heart className="w-7 h-7 text-white" />
                        </button>
                        <button 
                            className="p-2 transition-transform active:scale-90"
                            onClick={handleSendReply}
                        >
                            <Send className="w-7 h-7 text-white -rotate-12" />
                        </button>
                     </div>
                 )}
                 {/* Spacer for bottom safe area if own story */}
                 {activeStory.userId === currentUser.id && <div className="h-8"></div>}
              </div>
           </motion.div>
        )}
      </AnimatePresence>
      
      {/* Upload Preview Modal */}
      {pendingFile && pendingPreview && (
         <div className="fixed inset-0 z-[60] bg-black flex flex-col">
            <div className="flex items-center justify-between p-4 text-white">
               <button onClick={() => setPendingFile(null)}><X className="w-6 h-6" /></button>
               <h3 className="font-bold">New Story</h3>
               <button onClick={handleUpload} className="text-brand-500 font-bold">Share</button>
            </div>
            <div className="flex-1 relative bg-gray-900 flex items-center justify-center overflow-hidden">
               {pendingFile.type.startsWith('video') ? (
                  <video src={pendingPreview} className="max-h-full max-w-full object-contain" controls />
               ) : (
                  <img src={pendingPreview} className="max-h-full max-w-full object-contain" />
               )}
            </div>
            <div className="p-4 bg-gray-900 text-white space-y-3 pb-safe-area">
               <input 
                 type="text" 
                 placeholder="Add a caption..." 
                 className="w-full bg-transparent border-b border-gray-700 p-2 outline-none"
                 value={newCaption}
                 onChange={e => setNewCaption(e.target.value)}
               />
               
               {/* Improved Affiliate Inputs */}
               <div className="bg-gray-800 rounded-xl p-3 space-y-3">
                   <div className="flex items-center space-x-2 text-brand-400 font-semibold text-xs uppercase tracking-wide">
                        <ShoppingBag className="w-3 h-3" />
                        <span>Add Affiliate Deal</span>
                   </div>
                   
                   <div className="space-y-2">
                       <input 
                            type="url" 
                            placeholder="Paste product link here..." 
                            className="w-full bg-gray-900/50 rounded-lg p-2.5 text-sm outline-none border border-transparent focus:border-gray-600 transition-colors placeholder-gray-500"
                            value={newLink}
                            onChange={e => setNewLink(e.target.value)}
                        />
                        
                        {/* Only show Label input and Preview if link is present */}
                        {newLink && (
                            <div className="flex items-center space-x-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="flex-1">
                                    <label className="text-[10px] text-gray-400 ml-1 mb-1 block">Button Text</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Get Offer" 
                                        className="w-full bg-gray-900/50 rounded-lg p-2.5 text-sm outline-none border border-transparent focus:border-gray-600 transition-colors text-center font-medium"
                                        value={newLabel}
                                        onChange={e => setNewLabel(e.target.value)}
                                    />
                                </div>
                                
                                {/* Live Preview of the Button */}
                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <label className="text-[10px] text-gray-400 mb-1 block">Button Preview</label>
                                    <div className="bg-white text-black px-4 py-2 rounded-full font-bold text-xs flex items-center space-x-1 shadow-sm opacity-90">
                                        <ShoppingBag className="w-3 h-3" />
                                        <span>{newLabel || 'Shop Now'}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                   </div>
               </div>
            </div>
         </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
           <div className="bg-white dark:bg-gray-800 rounded-xl p-4 w-full max-w-sm">
              <h3 className="font-bold mb-2 dark:text-white">Edit Caption</h3>
              <input 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
                value={editCaptionText}
                onChange={e => setEditCaptionText(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                 <button onClick={() => { setShowEditModal(false); setIsPaused(false); }} className="px-3 py-1 text-gray-500">Cancel</button>
                 <button onClick={saveEdit} className="px-3 py-1 bg-brand-600 text-white rounded">Save</button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default StoryTray;