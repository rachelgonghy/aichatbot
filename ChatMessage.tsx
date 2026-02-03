
import React from 'react';
import { Message, Role } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
        isUser 
          ? 'bg-blue-600 text-white rounded-tr-none' 
          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
      }`}>
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {message.attachments.map((att, idx) => (
              <img 
                key={idx} 
                src={att.url} 
                alt="Upload" 
                className="max-h-48 rounded-lg object-cover border border-gray-100 shadow-sm"
              />
            ))}
          </div>
        )}
        <div className="prose prose-sm break-words whitespace-pre-wrap leading-relaxed">
          {message.text}
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-blue-400 animate-pulse align-middle" />
          )}
        </div>
        <div className={`text-[10px] mt-1 opacity-50 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
