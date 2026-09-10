import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import api from '../api/client';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: 'Hi! Ask me anything about your customer churn trends, at-risk customers, or specific concerns.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [chatHistory, isOpen]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    const userMessage = message;
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);
    try {
      const res = await api.chatWithData(userMessage);
      setChatHistory(prev => [...prev, { role: 'assistant', text: res.response }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error. Please ensure your AI provider is connected.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-3.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-2xl shadow-lg transition-transform ${isOpen ? 'scale-0 pointer-events-none' : 'scale-100'} z-50`}
      >
        <MessageSquare className="w-5 h-5" />
      </button>
      <div className={`fixed bottom-6 right-6 w-80 sm:w-96 h-[480px] max-h-[80vh] bg-white dark:bg-[#141414] rounded-2xl flex flex-col shadow-2xl transition-all duration-250 origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        <div className="px-4 py-3.5 bg-zinc-900 dark:bg-zinc-800 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-zinc-300" />
            <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg">
            <X className="w-4 h-4 text-zinc-300" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-zinc-50 dark:bg-[#0f0f0f]">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-br-sm'
                  : 'bg-white dark:bg-[#1c1c1c] text-zinc-800 dark:text-zinc-200 rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-3 bg-white dark:bg-[#141414] rounded-b-2xl border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about churn risks..."
              className="flex-1 max-h-24 min-h-[40px] bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm rounded-xl px-3 py-2.5 resize-none outline-none"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className="p-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-40 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
