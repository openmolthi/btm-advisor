import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatInterface = ({ messages, onSendMessage, isTyping, suggestions = [] }) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  
  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages, isTyping]);
  
  const handleSubmit = (e) => { 
    e.preventDefault(); 
    if (input.trim()) { 
      onSendMessage(input); 
      setInput(""); 
    } 
  };
  
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 py-10">
            <Bot size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium mb-4">Ask me anything about the strategy.</p>
            {suggestions.length > 0 && (
              <div className="space-y-2 max-w-md mx-auto">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">💡 Suggested based on your deal gaps</p>
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(s.prompt)}
                    className="w-full text-left px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-blue-400 hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    <span className="mr-1.5">{s.icon}</span>
                    <span className="font-medium">{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
            }`}>
              <div className="flex items-center gap-2 mb-1 opacity-80 text-xs font-bold uppercase tracking-wider border-b border-white/20 pb-1">
                {msg.role === 'user' ? <User size={12} /> : <Sparkles size={12} />}
                {msg.role === 'user' ? 'Advisor' : 'Coach'}
              </div>
              <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex gap-2 shrink-0">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask a follow-up question..." 
          className="flex-grow border-2 border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium" 
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isTyping} 
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
