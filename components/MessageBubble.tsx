import React from 'react';
import { User, Bot, Download } from 'lucide-react';
import { ChartConfig, ChartType, Message } from '../types';
import { ChartRenderer } from './ChartRenderer';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  const renderContent = () => {
    if (typeof message.content === 'string') {
      return <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>;
    }

    const chartConfig = message.content as ChartConfig;

    if (chartConfig.type === ChartType.TEXT) {
        return (
            <div className="space-y-2">
                <p className="text-lg font-medium text-slate-200">{chartConfig.title}</p>
                <p className="text-slate-300 leading-relaxed">{chartConfig.summary}</p>
            </div>
        )
    }

    return (
      <div className="w-full space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-100 bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
              {chartConfig.title}
            </h3>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {chartConfig.summary}
            </p>
          </div>
          <button 
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
            title="Download Data (Mock)"
          >
            <Download size={16} />
          </button>
        </div>

        <div className="w-full h-[350px] bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 shadow-inner">
          <ChartRenderer config={chartConfig} />
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex gap-4 w-full max-w-5xl mx-auto mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20">
          <Bot size={20} className="text-white" />
        </div>
      )}

      <div className={`flex-1 max-w-3xl ${isUser ? 'flex justify-end' : ''}`}>
        <div 
          className={`
            rounded-2xl p-6 shadow-md backdrop-blur-sm
            ${isUser 
              ? 'bg-slate-800 text-slate-100 rounded-tr-none border border-slate-700' 
              : 'bg-slate-900/60 text-slate-100 rounded-tl-none border border-slate-800 w-full'
            }
          `}
        >
          {renderContent()}
        </div>
      </div>

      {isUser && (
        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
          <User size={20} className="text-slate-300" />
        </div>
      )}
    </motion.div>
  );
};