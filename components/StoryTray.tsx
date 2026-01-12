import React, { useState, useRef, useEffect } from 'react';
import { Story, User } from '../types';
import { Plus, X, MoreHorizontal, Trash2, Edit2, Check, ShoppingBag, ExternalLink, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryTrayProps {
  stories: Story[];
  currentUser: User;
  onAddStory: (file: File, caption: string, link?: string, label?: string) => void;
  onDeleteStory: (id: string) => void;
  onEditStory: (id: string, caption: string) => void;
}

const StoryTray: React.FC<StoryTrayProps> = ({ stories, currentUser, onAddStory, onDeleteStory, onEditStory }) => {
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  
  // Interaction states
  const [isPaused, setIsPaused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCaptionText, setEditCaptionText] = useState("");

  // Upload States
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [newStoryCaption, setNewStoryCaption] = useState("Just added this! ✨");
  const [newStoryLink, setNewStoryLink] = useState("");
  const [newStoryLabel, setNewStoryLabel] = useState("Get Offer");

  const activeStory = viewingIndex !== null ? stories[viewingIndex] : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPendingFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPendingPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePostStory = () => {
    if (pendingFile) {
      onAddStory(pendingFile, newStoryCaption, newStoryLink, newStoryLabel);
      setPendingFile(null);
      setPendingPreview(null);
      setNewStoryCaption("Just added this! ✨");
      setNewStoryLink("");
      setNewStoryLabel("Get Offer");
    }
  };

  const cancelUpload = () => {
    setPendingFile(null);
    setPendingPreview(null);
  };

  const closeStory = () => {
    setViewingIndex(null);
    setProgress(0);
    setShowMenu(false);
    setShowDeleteConfirm(false);
    setShowEditModal(false);
    setIsPaused(false);
  };

  const nextStory = () => {
    if (viewingIndex !== null && viewingIndex < stories.length - 1) {
      setViewingIndex(viewingIndex + 1);
      setProgress(0);
    } else {
      closeStory();
    }
  };

  const prevStory = () => {
    if (viewingIndex !== null && viewingIndex > 0) {
      setViewingIndex(viewingIndex - 1);
      setProgress(0);
    }
  };

  // Timer Logic
  useEffect(() => {
    if (!activeStory || isPaused || showMenu || showDeleteConfirm || showEditModal) return;

    const duration = activeStory.type === 'video' ? (videoRef.current?.duration || 15) * 1000 : 5000;
    const intervalTime = 50;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activeStory, viewingIndex, isPaused, showMenu, showDeleteConfirm, showEditModal]);

  // Handle completion when progress hits 100
  useEffect(() => {
    if (progress >= 100) {
      nextStory();
    }
  }, [progress]);

  // Handle Edit
  const handleEditClick = () => {
    if (!activeStory) return;
    setEditCaptionText(activeStory.caption || "");
    setShowMenu(false);
    setShowEditModal(true);
    setIsPaused(true);
  };

  const handleSaveEdit = () => {
    if (activeStory) {
      onEditStory(activeStory.id, editCaptionText);
      setShowEditModal(false);
      setIsPaused(false);
    }
  };

  // Handle Delete
  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteConfirm(true);
    setIsPaused(true);
  };

  const confirmDelete = () => {
    if (activeStory) {
      onDeleteStory(activeStory.id);
      closeStory();
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 sm:rounded-xl border-b border-gray-100 dark:border-gray-700 sm:border p-4 mb-6 overflow-x-auto no-scrollbar">
        <div className="flex space-x-4 min-w-max">
          {/* My Story Add Button */}
          <div className="flex flex-col items-center space-y-1 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="relative w-16 h-16">
              <img 
                src={currentUser.avatar} 
                alt="My Story" 
                className="w-full h-full rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700 p-0.5"
              />
              <div className="absolute bottom-0 right-0 bg-brand-500 text-white rounded-full p-1 border-2 border-white dark:border-gray-800">
                <Plus className="w-3 h-3" />
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Your Story</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,video/*" 
              onChange={handleFileChange}
            />
          </div>

          {/* Other Stories */}
          {stories.map((story, idx) => (
            <div 
              key={story.id} 
              className="flex flex-col items-center space-y-1 cursor-pointer group"
              onClick={() => setViewingIndex(idx)}
            >
              <div className={`w-16 h-16 rounded-full p-[2px] ${story.viewed ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600 group-hover:from-yellow-300 group-hover:to-fuchsia-500'}`}>
                <img 
                  src={story.user.avatar} 
                  alt={story.user.handle} 
                  className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-900" 
                />
              </div>
              <span className="text-xs text-gray-900 dark:text-gray-300 w-16 truncate text-center">
                {story.user.handle}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Story Modal */}
      <AnimatePresence>
        {pendingPreview && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] bg-white dark:bg-gray-900 flex flex-col"
          >
             <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10">
                <button onClick={cancelUpload} className="text-gray-600 dark:text-gray-300"><X className="w-6 h-6" /></button>
                <h2 className="text-lg font-bold dark:text-white">New Story</h2>
                <button onClick={handlePostStory} className="text-brand-600 font-bold">Share</button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="aspect-[9/16] w-full max-w-sm mx-auto bg-black rounded-xl overflow-hidden shadow-xl">
                   {pendingFile?.type.startsWith('video') ? (
                     <video src={pendingPreview} className="w-full h-full object-contain" autoPlay loop muted playsInline />
                   ) : (
                     <img src={pendingPreview} className="w-full h-full object-contain" />
                   )}
                </div>

                <div className="space-y-4 max-w-sm mx-auto">
                    <div className="space-y-2">
                        <label className="text-sm font-medium dark:text-gray-300">Caption</label>
                        <input 
                          type="text" 
                          className="w-full p-3 rounded-xl border dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                          value={newStoryCaption}
                          onChange={e => setNewStoryCaption(e.target.value)}
                        />
                    </div>

                    <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-xl space-y-3">
                        <div className="flex items-center space-x-2 text-brand-700 dark:text-brand-400 font-semibold mb-1">
                          <Briefcase className="w-4 h-4" />
                          <span>Affiliate Details (Optional)</span>
                        </div>
                        <div>
                          <label className="text-xs font-medium dark:text-gray-400">Product Link</label>
                          <input 
                            type="url" 
                            className="w-full p-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                            placeholder="https://..."
                            value={newStoryLink}
                            onChange={e => setNewStoryLink(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium dark:text-gray-400">Button Label</label>
                          <input 
                            type="text" 
                            className="w-full p-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                            placeholder="e.g. 50% OFF"
                            value={newStoryLabel}
                            onChange={e => setNewStoryLabel(e.target.value)}
                          />
                        </div>
                    </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Story Viewer */}
      <AnimatePresence>
        {activeStory && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            {/* Top Controls Container */}
            <div className="absolute top-4 left-0 right-0 z-[60] px-4 flex justify-between items-start pointer-events-none">
                {/* Header User Info */}
                <div className="flex items-center space-x-2 mt-2 pointer-events-auto">
                   <img src={activeStory.user.avatar} className="w-8 h-8 rounded-full border border-white/50" />
                   <div className="flex flex-col">
                     <span className="text-white font-semibold text-sm drop-shadow-md leading-none">{activeStory.user.handle}</span>
                     <span className="text-white/70 text-xs drop-shadow-md mt-0.5">• {new Date(activeStory.expiresAt - 86400000).getHours()}h</span>
                   </div>
                </div>

                {/* Right Side Buttons */}
                <div className="flex items-center space-x-2 pointer-events-auto">
                    {activeStory.userId === currentUser.id && (
                      <div className="relative">
                        <button 
                           onClick={() => {
                             setShowMenu(!showMenu);
                             setIsPaused(!showMenu);
                           }}
                           className="text-white p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40"
                        >
                          <MoreHorizontal className="w-6 h-6" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {showMenu && (
                          <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden py-1 z-[70]">
                            <button 
                              onClick={handleEditClick}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4" /> Edit Caption
                            </button>
                            <button 
                              onClick={handleDeleteClick}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <button onClick={closeStory} className="text-white p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40">
                      <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Progress Bar Container */}
            <div className="absolute top-0 left-0 right-0 p-2 z-[60] flex space-x-1 pointer-events-none">
               {stories.map((_, idx) => (
                 <div key={idx} className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-100 ease-linear"
                      style={{ 
                        width: idx < (viewingIndex || 0) ? '100%' : idx === viewingIndex ? `${progress}%` : '0%' 
                      }}
                    />
                 </div>
               ))}
            </div>

            {/* Tap Navigation Areas */}
            <div className="absolute inset-y-0 left-0 w-1/3 z-40" onClick={prevStory} onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)} onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}></div>
            <div className="absolute inset-y-0 right-0 w-1/3 z-40" onClick={nextStory} onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)} onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}></div>

            {/* Content */}
            <div className="w-full h-full md:max-w-md md:h-[90vh] md:rounded-2xl overflow-hidden relative bg-gray-900 flex items-center justify-center">
               {activeStory.type === 'video' ? (
                 <video 
                   ref={videoRef}
                   src={activeStory.mediaUrl} 
                   className="w-full h-full object-cover" 
                   autoPlay 
                   muted={false} 
                   playsInline
                   onEnded={nextStory}
                   onTimeUpdate={(e) => {
                      if(activeStory.type === 'video' && !isPaused && !showMenu && !showDeleteConfirm && !showEditModal) {
                        const pct = (e.currentTarget.currentTime / e.currentTarget.duration) * 100;
                        setProgress(pct);
                      }
                   }}
                 />
               ) : (
                 <img src={activeStory.mediaUrl} className="w-full h-full object-cover" />
               )}
               
               {/* Caption & Affiliate Link Overlay */}
               {(!showEditModal && (activeStory.caption || activeStory.affiliateLink)) && (
                 <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white z-50 pointer-events-auto flex flex-col items-center gap-4">
                    
                    {/* Affiliate Button */}
                    {activeStory.affiliateLink && (
                        <a 
                        href={activeStory.affiliateLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full max-w-xs bg-white/10 backdrop-blur-md border border-white/20 p-2.5 rounded-xl shadow-lg hover:bg-white/20 transition-all group/link cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="bg-brand-500 p-2 rounded-lg">
                                    <ShoppingBag className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-[10px] font-bold text-brand-300 uppercase tracking-wider">Affiliate Deal</span>
                                    <span className="text-sm font-bold text-white leading-tight">{activeStory.affiliateLabel || 'Shop Now'}</span>
                                </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-white/70 group-hover/link:text-white" />
                        </a>
                    )}

                    {/* Caption */}
                    {activeStory.caption && (
                        <p className="text-center font-medium drop-shadow-md text-lg leading-relaxed max-w-xs">{activeStory.caption}</p>
                    )}
                 </div>
               )}
            </div>

            {/* Edit Caption Modal */}
            {showEditModal && (
              <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                 <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-xs shadow-2xl transform scale-100">
                    <div className="flex flex-col space-y-4">
                       <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">Edit Caption</h3>
                       <textarea 
                          value={editCaptionText}
                          onChange={(e) => setEditCaptionText(e.target.value)}
                          className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                          rows={3}
                          placeholder="Write a caption..."
                          autoFocus
                       />
                       <div className="flex space-x-3 w-full">
                          <button 
                            onClick={() => {
                              setShowEditModal(false);
                              setIsPaused(false);
                            }}
                            className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleSaveEdit}
                            className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4" /> Save
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && (
               <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-xs shadow-2xl transform scale-100">
                     <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                           <Trash2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Story?</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Are you sure you want to delete this story? This action cannot be undone.
                          </p>
                        </div>
                        <div className="flex space-x-3 w-full">
                           <button 
                             onClick={() => {
                               setShowDeleteConfirm(false);
                               setIsPaused(false);
                             }}
                             className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700"
                           >
                             Cancel
                           </button>
                           <button 
                             onClick={confirmDelete}
                             className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-500/30"
                           >
                             Delete
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StoryTray;