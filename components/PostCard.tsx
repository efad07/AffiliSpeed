import React, { useState, useRef } from 'react';
import { Post } from '../types';
import { Heart, MessageCircle, Share2, ExternalLink, MoreHorizontal, ShoppingBag, Trash2, Edit2, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (post: Post) => void;
  onCommentClick?: (id: string) => void;
  onShare?: (id: string) => void;
  isOwner?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onDelete, onEdit, onCommentClick, onShare, isOwner }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikeCount(prev => prev + 1);
      setShowHeartOverlay(true);
      setTimeout(() => setShowHeartOverlay(false), 800);
      onLike(post.id);
    } else {
      setLiked(false);
      setLikeCount(prev => prev - 1);
      onLike(post.id);
    }
  };

  const toggleVideo = () => {
    if (post.type !== 'video' || !videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDoubleTap = () => {
    handleLike();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sm:rounded-xl sm:border sm:mb-6 overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 relative z-10">
        <div className="flex items-center space-x-3 cursor-pointer">
          <img src={post.user.avatar} alt={post.user.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700" />
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="font-semibold text-sm text-gray-900 dark:text-white">{post.user.handle}</span>
              {post.user.isVerified && (
                <span className="ml-1 text-blue-500">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(post.timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {/* Context Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10 cursor-default" onClick={() => setShowMenu(false)}></div>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden py-1">
                {isOwner ? (
                  <>
                    <button 
                      onClick={() => { setShowMenu(false); if (onEdit) onEdit(post); }}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" /> Edit Post
                    </button>
                    <button 
                      onClick={() => { setShowMenu(false); if (onDelete) onDelete(post.id); }}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Post
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setShowMenu(false)}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <Flag className="w-4 h-4" /> Report Post
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Media */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-900 overflow-hidden group" onDoubleClick={handleDoubleTap}>
        <AnimatePresence>
          {showHeartOverlay && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
            >
              <Heart className="w-24 h-24 text-white fill-white drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>

        {post.type === 'video' ? (
          <div className="relative w-full h-full cursor-pointer" onClick={toggleVideo}>
            <video 
              ref={videoRef}
              src={post.url} 
              poster={post.thumbnail}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
            />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-8 h-8 text-white fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            )}
          </div>
        ) : (
          <img src={post.url} alt="Post" className="w-full h-full object-cover" loading="lazy" />
        )}

        {/* Affiliate Link Overlay Button */}
        {post.affiliateLink && (
           <div className="absolute bottom-4 left-4 right-4 z-10">
             <a 
               href={post.affiliateLink} 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-center justify-between w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-3 rounded-lg shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all group/link"
             >
                <div className="flex items-center space-x-3">
                  <div className="bg-brand-500 p-2 rounded-md">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400">AFFILIATE DEAL</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{post.affiliateLabel || 'Shop this look'}</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover/link:text-brand-500" />
             </a>
           </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLike} 
              className={`transition-transform active:scale-90 ${liked ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}
            >
              <Heart className={`w-7 h-7 ${liked ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={() => onCommentClick && onCommentClick(post.id)}
              className="text-gray-900 dark:text-white transition-transform active:scale-90"
            >
              <MessageCircle className="w-7 h-7" />
            </button>
            <button 
              onClick={() => onShare && onShare(post.id)}
              className="text-gray-900 dark:text-white transition-transform active:scale-90"
            >
              <Share2 className="w-7 h-7" />
            </button>
          </div>
        </div>

        <div className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">{likeCount.toLocaleString()} likes</div>
        
        <div className="text-sm text-gray-900 dark:text-gray-100 mb-1">
          <span className="font-semibold mr-2">{post.user.handle}</span>
          {post.caption}
        </div>
        
        {/* View all comments link */}
        {post.comments.length > 0 && (
          <button 
            onClick={() => onCommentClick && onCommentClick(post.id)}
            className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200"
          >
            View all {post.comments.length} comments
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(PostCard);