import React from 'react';
import { motion } from 'framer-motion';

interface LiveIndicatorProps {
  isConnected: boolean;
  isSpeaking: boolean;
  volume: number;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({ isConnected, isSpeaking, volume }) => {
  if (!isConnected) return null;

  return (
    <div className="flex items-center justify-center gap-1 h-8">
       {/* Visualizer bars */}
       {[...Array(5)].map((_, i) => {
         // If speaking (model), animate randomly. If listening (user), use volume.
         const height = isSpeaking 
            ? Math.random() * 24 + 8 
            : Math.max(4, volume * 100 * (Math.random() + 0.5));
            
         return (
           <motion.div
             key={i}
             className={`w-1.5 rounded-full ${isSpeaking ? 'bg-brand-400' : 'bg-emerald-400'}`}
             animate={{ height: isConnected ? height : 4 }}
             transition={{ type: 'spring', stiffness: 300, damping: 20 }}
           />
         );
       })}
    </div>
  );
};