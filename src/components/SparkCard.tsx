import React, { useState, useRef, useEffect } from 'react';
import { Post } from '../types';
import { Heart, MessageCircle, Share2, MoreHorizontal, ShoppingBag, ExternalLink, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SparkCardProps {
  post: Post;
  isActive: boolean;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
}

const SparkCard: React.FC<SparkCardProps> = ({ post, isActive, onLike, onComment, onShare }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(e => console.log("Autoplay prevented", e));
    } else if (!isActive && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive]);

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

  const handleDoubleTap = () => {
    handleLike();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative w-full h-full bg-black snap-start flex-shrink-0 overflow-hidden sm:rounded-none">
      {/* Video Layer */}
      <video
        ref={videoRef}
        src={post.url}
        className="w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        onDoubleClick={handleDoubleTap}
        onClick={(e) => {
            if (videoRef.current?.paused) videoRef.current.play();
            else videoRef.current?.pause();
        }}
      />

      {/* Double Tap Heart Animation */}
      <AnimatePresence>
        {showHeartOverlay && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
          >
            <Heart className="w-24 h-24 text-white fill-white drop-shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dark Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none z-10" />

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-20 sm:pb-6 z-20 flex items-end justify-between">
        
        {/* Left Side: Info */}
        <div className="flex-1 mr-4 mb-2">
          <div className="flex items-center space-x-2 mb-3">
            <img src={post.user.avatar} className="w-10 h-10 rounded-full border-2 border-white" alt={post.user.name} />
            <span className="text-white font-bold text-sm drop-shadow-md">{post.user.handle}</span>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md border border-white/30 transition-colors">
                Follow
            </button>
          </div>
          
          <p className="text-white text-sm mb-4 line-clamp-2 drop-shadow-md">{post.caption}</p>

          {/* Affiliate Deal Button */}
          {post.affiliateLink && (
             <a 
               href={post.affiliateLink}
               target="_blank"
               rel="noopener noreferrer"
               className="inline-flex items-center bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 animate-pulse"
             >
                <ShoppingBag className="w-4 h-4 mr-2" />
                <span>{post.affiliateLabel || 'View Deal'}</span>
                <ExternalLink className="w-3 h-3 ml-2 opacity-70" />
             </a>
          )}
        </div>

        {/* Right Side: Actions */}
        <div className="flex flex-col items-center space-y-6 mb-4">
           <div className="flex flex-col items-center space-y-1">
              <button onClick={handleLike} className="p-2 rounded-full bg-black/20 backdrop-blur-sm active:scale-90 transition-transform hover:bg-black/40">
                 <Heart className={`w-8 h-8 ${liked ? 'text-red-500 fill-current' : 'text-white'}`} />
              </button>
              <span className="text-white text-xs font-medium drop-shadow-md">{likeCount}</span>
           </div>

           <div className="flex flex-col items-center space-y-1">
              <button onClick={() => onComment(post.id)} className="p-2 rounded-full bg-black/20 backdrop-blur-sm active:scale-90 transition-transform hover:bg-black/40">
                 <MessageCircle className="w-8 h-8 text-white" />
              </button>
              <span className="text-white text-xs font-medium drop-shadow-md">{post.comments.length || 12}</span>
           </div>

           <button onClick={() => onShare(post.id)} className="p-2 rounded-full bg-black/20 backdrop-blur-sm active:scale-90 transition-transform hover:bg-black/40">
              <Share2 className="w-8 h-8 text-white" />
           </button>

           <button className="p-2 rounded-full bg-black/20 backdrop-blur-sm active:scale-90 transition-transform hover:bg-black/40">
              <MoreHorizontal className="w-8 h-8 text-white" />
           </button>
           
           <button onClick={toggleMute} className="p-2 rounded-full bg-black/40 backdrop-blur-md mt-4 hover:bg-black/60">
               {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
           </button>
        </div>
      </div>
    </div>
  );
};

export default SparkCard;