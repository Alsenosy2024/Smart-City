
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Settings, Menu } from 'lucide-react';

interface Department {
  id: string;
  en: string;
  ar: string;
  icon: any;
}

interface SidebarProps {
  departments: Department[];
  activeDept: string;
  setActiveDept: (id: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isDarkMode: boolean;
  lang: 'en' | 'ar';
  onSettingsClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  departments,
  activeDept,
  setActiveDept,
  isCollapsed,
  setIsCollapsed,
  isDarkMode,
  lang,
  onSettingsClick
}) => {
  const isRtl = lang === 'ar';

  return (
    <motion.div 
      layout
      initial={false}
      animate={{ 
        width: isCollapsed ? '5.5rem' : '18rem',
        transition: { type: "spring", stiffness: 300, damping: 30 }
      }}
      className={`
        relative z-40 h-full border-s shrink-0 flex flex-col transition-colors
        ${isDarkMode 
          ? 'bg-slate-950 border-white/5' 
          : 'bg-white border-slate-200 shadow-xl'}
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`
          absolute top-8 -end-3 w-7 h-7 rounded-full border flex items-center justify-center z-50 transition-all shadow-lg cursor-pointer
          ${isDarkMode 
            ? 'bg-slate-900 border-slate-700 text-brand-500 hover:text-white hover:bg-brand-600' 
            : 'bg-white border-slate-200 text-slate-600 hover:text-brand-600'}
        `}
      >
        {isRtl ? (
            isCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />
        ) : (
            isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />
        )}
      </button>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-8 scrollbar-thin">
        {/* TMG LOGO AREA */}
        <div className={`px-4 mb-12 flex items-center ${isCollapsed ? 'justify-center' : 'pl-6'}`}>
           <div className={`
              w-12 h-12 flex items-center justify-center shrink-0 transition-colors
           `}>
              {/* CSS-based TMG Logo representation */}
              <div className={`flex flex-col items-center justify-center border-2 border-brand-500 p-1 rounded-sm w-10 h-10 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-900'}`}>
                 <span className="font-serif font-bold text-brand-500 text-lg leading-none tracking-tighter">TMG</span>
                 <div className="w-full h-[1px] bg-brand-500 my-[1px]"></div>
                 <div className="flex gap-[1px]">
                   <div className="w-[2px] h-[4px] bg-brand-500"></div>
                   <div className="w-[2px] h-[6px] bg-brand-500"></div>
                   <div className="w-[2px] h-[4px] bg-brand-500"></div>
                 </div>
              </div>
           </div>
           <AnimatePresence mode="wait">
             {!isCollapsed && (
               <motion.div 
                 initial={{ opacity: 0, width: 0 }}
                 animate={{ opacity: 1, width: 'auto' }}
                 exit={{ opacity: 0, width: 0 }}
                 className="overflow-hidden whitespace-nowrap ms-3"
               >
                  <div className="flex flex-col">
                    <h1 className={`text-xl font-serif font-bold tracking-widest text-brand-500`}>
                        TMG
                    </h1>
                    <span className={`text-[9px] uppercase tracking-[0.3em] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Holding
                    </span>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Section Label */}
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="px-6 mb-4"
          >
             <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 ${isDarkMode ? 'text-brand-500' : 'text-slate-500'}`}>
              {lang === 'ar' ? 'قطاعات الأعمال' : 'Business Units'}
            </h3>
          </motion.div>
        )}

        <div className="space-y-2 px-3">
          {departments.map((dept) => {
            const isActive = activeDept === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setActiveDept(dept.id)}
                className={`
                  relative w-full flex items-center p-3.5 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? (isDarkMode ? 'bg-gradient-to-r from-brand-600/20 to-transparent text-brand-500 border-l-2 border-brand-500' : 'bg-brand-50 text-brand-700 border-l-2 border-brand-600') 
                    : (isDarkMode ? 'text-slate-400 hover:bg-slate-800/50 hover:text-brand-400 border-l-2 border-transparent' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent')
                  }
                  ${isCollapsed ? 'justify-center px-0 border-l-0' : 'gap-4'}
                `}
              >
                <div className={`shrink-0 relative ${isCollapsed && isActive ? 'bg-brand-500/10 p-2 rounded-lg text-brand-500' : ''}`}>
                  <dept.icon size={20} className={`${isActive ? '' : 'opacity-70'}`} />
                </div>
                
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="whitespace-nowrap text-sm font-bold font-sans text-start tracking-wide"
                  >
                    {lang === 'ar' ? dept.ar : dept.en}
                  </motion.span>
                )}

                {/* Tooltip */}
                {isCollapsed && (
                  <div className={`
                    absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-full mr-4' : 'left-full ml-4'} 
                    px-4 py-2 rounded-lg text-xs font-serif font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 
                    pointer-events-none transition-all duration-200 z-50 shadow-2xl translate-x-2 group-hover:translate-x-0 border
                    ${isDarkMode ? 'bg-slate-900 text-brand-500 border-brand-500/30' : 'bg-white text-navy-900 border-slate-200'}
                  `}>
                    {lang === 'ar' ? dept.ar : dept.en}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Settings */}
      <div className={`p-4 mt-auto border-t ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
        <button 
          onClick={onSettingsClick}
          className={`
            w-full flex items-center p-3 rounded-xl transition-colors
            ${isDarkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-brand-400' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}
            ${isCollapsed ? 'justify-center' : 'gap-3'}
          `}
        >
          <Settings size={20} />
          {!isCollapsed && <span className="text-xs font-bold uppercase tracking-wider">Config</span>}
        </button>
      </div>
    </motion.div>
  );
};
