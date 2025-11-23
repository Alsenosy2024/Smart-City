
import React, { useState, useRef } from 'react';
import { Send, Mic, Sparkles, Paperclip, X, FileText, Image as ImageIcon, StopCircle } from 'lucide-react';
import { LiveIndicator } from './LiveIndicator';
import { motion, AnimatePresence } from 'framer-motion';
import { formatBytes } from '../utils/fileUtils';

interface InputAreaProps {
  onSendMessage: (message: string, file: File | null) => void;
  isLoading: boolean;
  onConnectLive: () => void;
  onDisconnectLive: () => void;
  isLiveConnected: boolean;
  isLiveSpeaking: boolean;
  liveVolume: number;
  isDarkMode: boolean;
}

export const InputArea: React.FC<InputAreaProps> = React.memo(({ 
  onSendMessage, 
  isLoading, 
  onConnectLive, 
  onDisconnectLive, 
  isLiveConnected, 
  isLiveSpeaking, 
  liveVolume,
  isDarkMode
}) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !attachment) || isLoading) return;
    onSendMessage(input, attachment);
    setInput('');
    setAttachment(null);
    // Reset file input value to allow re-selecting the same file
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      console.log("File selected:", e.target.files[0].name);
      setAttachment(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Dynamic Island Animation States
  const isExpanded = isFocused || input.length > 0 || isLiveConnected || attachment !== null;
  
  // Glow Colors
  const glowColor = isLiveConnected 
    ? 'rgba(244, 63, 94, 0.6)' // Rose for Live
    : isFocused 
      ? 'rgba(197, 160, 89, 0.5)' // Gold for Focus
      : 'rgba(0,0,0,0.1)'; // Subtle default

  return (
    <motion.div 
      layout
      className="flex flex-col items-center w-full pointer-events-none px-4 z-[90]"
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept="image/*,.csv,.json,.txt,.pdf"
      />

      <motion.div 
        layout
        initial={false}
        animate={{ 
          width: isExpanded ? '100%' : 'auto',
          maxWidth: isExpanded ? '42rem' : '14rem', // Slightly tighter default
          borderRadius: isFocused || attachment ? '1.25rem' : '3rem',
          boxShadow: isLiveConnected 
            ? `0 0 40px -5px ${glowColor}, 0 0 20px -5px ${glowColor} inset` 
            : isFocused 
              ? `0 10px 40px -10px ${glowColor}, 0 0 0 1px ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(197,160,89,0.2)'}`
              : `0 10px 30px -10px rgba(0,0,0,0.3)`
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 35,
          mass: 0.8 
        }}
        className={`
          relative flex flex-col justify-center backdrop-blur-2xl transition-all duration-500 overflow-hidden pointer-events-auto
          ${isDarkMode 
            ? `bg-slate-950/70 text-white` 
            : `bg-white/80 text-slate-900`
          }
        `}
      >
        {/* Border Gradient Overlay */}
        <div className={`absolute inset-0 rounded-[inherit] border border-transparent pointer-events-none opacity-50 ${isDarkMode ? 'bg-gradient-to-b from-white/10 to-white/5' : 'bg-gradient-to-b from-white/60 to-white/20'}`} style={{ maskImage: 'linear-gradient(#fff, #fff)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' as any }} />

        {/* Live Mode Ambient Pulse */}
        {isLiveConnected && (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               className="absolute inset-0 bg-rose-500/5 pointer-events-none"
             />
        )}

        <div className={`flex items-center ${isFocused || attachment ? 'p-3 px-4' : 'p-2 px-2'} gap-3 h-full relative z-10`}>
          
          {/* 1. Mode Toggle / Live Button */}
          <motion.button
            layout
            onClick={isLiveConnected ? onDisconnectLive : onConnectLive}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className={`
              flex items-center justify-center rounded-full shrink-0 transition-all cursor-pointer relative overflow-hidden
              ${isExpanded ? 'w-10 h-10' : 'w-10 h-10'}
              ${isLiveConnected 
                  ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)]' 
                  : isDarkMode ? 'bg-slate-800/80 text-brand-400 hover:bg-slate-700 border border-white/5' : 'bg-white text-brand-600 hover:bg-slate-50 shadow-sm border border-slate-200'
              }
            `}
          >
             <AnimatePresence mode="wait">
                {isLoading ? (
                   <motion.div key="loading" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                   </motion.div>
                ) : isLiveConnected ? (
                   <motion.div key="live" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <LiveIndicator isConnected={isLiveConnected} isSpeaking={isLiveSpeaking} volume={liveVolume} />
                   </motion.div>
                ) : (
                   <motion.div key="mic" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      {isExpanded ? <Mic size={18} /> : <Sparkles size={18} />}
                   </motion.div>
                )}
             </AnimatePresence>
          </motion.button>

          {/* 2. Input Area with Attachment Preview */}
          <motion.div layout className="flex-1 min-w-0 flex flex-col justify-center">
             {/* Attachment Chip */}
             <AnimatePresence>
               {attachment && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10, height: 0 }}
                   animate={{ opacity: 1, y: 0, height: 'auto' }}
                   exit={{ opacity: 0, y: 10, height: 0 }}
                   className="mb-2 overflow-hidden"
                 >
                    <div className={`flex items-center gap-3 p-2 pr-3 rounded-lg border w-fit ${isDarkMode ? 'bg-brand-500/10 border-brand-500/30 text-brand-400' : 'bg-brand-50 border-brand-200 text-brand-700'}`}>
                        <div className="w-6 h-6 rounded bg-current flex items-center justify-center text-white shrink-0 opacity-20">
                            {attachment.type.startsWith('image/') ? <ImageIcon size={14}/> : <FileText size={14}/>}
                        </div>
                        <div className="flex flex-col min-w-[100px]">
                            <span className="text-[11px] font-bold truncate max-w-[150px] leading-tight">{attachment.name}</span>
                            <span className="text-[9px] opacity-60 leading-tight">{formatBytes(attachment.size)}</span>
                        </div>
                        <button onClick={() => setAttachment(null)} className="p-1 hover:bg-black/10 rounded-full ml-1"><X size={12}/></button>
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>

             {isLiveConnected ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="px-2 w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                     <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Live Agent Active</span>
                  </div>
                  {isLiveSpeaking && <span className="text-[10px] font-mono uppercase tracking-wider opacity-50 animate-pulse">Transmitting...</span>}
                </motion.div>
             ) : (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  rows={1}
                  placeholder={isExpanded ? "Ask complex questions, visualize data..." : "Ask AI..."}
                  className={`
                    w-full bg-transparent border-0 focus:ring-0 p-0 text-[15px] font-medium transition-all resize-none
                    placeholder:text-slate-400/70 placeholder:font-normal leading-relaxed
                    ${!isExpanded ? 'cursor-pointer' : ''}
                  `}
                  style={{ minHeight: '24px' }}
                />
             )}
          </motion.div>

          {/* 3. Action Buttons */}
          <AnimatePresence>
             {!isLiveConnected && (
                <motion.div 
                   className="flex items-center gap-1.5"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                >
                  <button 
                    onClick={triggerFileSelect}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                    title="Attach File"
                  >
                     <Paperclip size={18} />
                  </button>

                  {(input.trim() || attachment) && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => handleSubmit()}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-105 transition-all shrink-0"
                      >
                        <Send size={16} className="ml-0.5" />
                    </motion.button>
                  )}
                </motion.div>
             )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
});
