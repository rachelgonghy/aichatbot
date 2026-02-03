
import React, { useState, useRef, useEffect } from 'react';
import { Message, Role, Attachment } from './types';
import { sendMessageStream } from './services/geminiService';
import ChatMessage from './components/ChatMessage';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: Role.MODEL,
      text: "Hello! I'm your Education & Career Guidance Assistant. How can I help you explore your future today?",
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const data = base64.split(',')[1];
        const attachment: Attachment = {
          mimeType: file.type,
          data,
          url: URL.createObjectURL(file)
        };
        setAttachments(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && attachments.length === 0) || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: inputText,
      attachments: [...attachments],
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setAttachments([]);
    setIsTyping(true);

    const botMessageId = (Date.now() + 1).toString();
    const botPlaceholder: Message = {
      id: botMessageId,
      role: Role.MODEL,
      text: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, botPlaceholder]);

    try {
      await sendMessageStream([...messages, userMessage], (streamedText) => {
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, text: streamedText } 
            : msg
        ));
      });
      
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, isStreaming: false } 
          : msg
      ));
    } catch (err) {
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, text: "Sorry, I encountered an error. Please try again.", isStreaming: false } 
          : msg
      ));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto shadow-2xl border-x border-gray-200 bg-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <i className="fa-solid fa-graduation-cap text-white text-xl"></i>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 tracking-tight text-sm sm:text-base">Education & Career Guidance Assistant</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Online</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setMessages([{ id: 'welcome', role: Role.MODEL, text: "Chat history cleared. How can I help you explore your future today?", timestamp: new Date() }])}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          title="Clear Chat"
        >
          <i className="fa-solid fa-rotate-right"></i>
        </button>
      </header>

      {/* Messages View */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth bg-[#f8fafc]"
      >
        <div className="max-w-3xl mx-auto">
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isTyping && messages[messages.length-1].isStreaming === false && (
            <div className="flex justify-start mb-6 animate-pulse">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-white border-t border-gray-100 sticky bottom-0">
        <div className="max-w-3xl mx-auto">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 animate-in slide-in-from-bottom-2">
              {attachments.map((att, idx) => (
                <div key={idx} className="relative group">
                  <img src={att.url} alt="preview" className="w-16 h-16 object-cover rounded-lg border-2 border-blue-100" />
                  <button 
                    onClick={() => removeAttachment(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm hover:bg-red-600 transition-colors"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2 transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <i className="fa-solid fa-paperclip"></i>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                multiple 
                accept="image/*"
              />
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask about careers or education..."
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 px-1 text-sm max-h-32 min-h-[40px]"
                rows={1}
              />
              <button 
                type="submit"
                disabled={(!inputText.trim() && attachments.length === 0) || isTyping}
                className={`p-2.5 rounded-xl transition-all shadow-md ${
                  (!inputText.trim() && attachments.length === 0) || isTyping
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-200'
                }`}
              >
                {isTyping ? (
                  <i className="fa-solid fa-spinner animate-spin"></i>
                ) : (
                  <i className="fa-solid fa-paper-plane"></i>
                )}
              </button>
            </div>
          </form>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            Powered by Google Gemini • Education & Career Specialist
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
