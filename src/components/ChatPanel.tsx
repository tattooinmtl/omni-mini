import { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { Send, Mic, MicOff, Volume2 } from 'lucide-react';

interface Props {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isListening: boolean;
  onToggleMic: () => void;
  isSpeaking: boolean;
}

export default function ChatPanel({ messages, onSendMessage, isListening, onToggleMic, isSpeaking }: Props) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950/80 rounded-xl border border-teal-900/30 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 border-b border-teal-900/30 flex items-center justify-between bg-gray-900/50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-teal-500'}`} />
          <span className="text-xs font-mono text-teal-400">CONVERSATION</span>
        </div>
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <Volume2 size={14} className="text-green-400 animate-pulse" />
          )}
          <button
            onClick={onToggleMic}
            className={`p-1.5 rounded-lg transition-all ${
              isListening 
                ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/50' 
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {isListening ? <Mic size={14} /> : <MicOff size={14} />}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-8 font-mono">
            <p className="text-teal-500/60 text-lg mb-2">◈</p>
            <p>Omni is awake and listening...</p>
            <p className="text-xs mt-1 text-gray-600">Speak or type to begin</p>
          </div>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                msg.role === 'user'
                  ? 'bg-teal-900/40 text-teal-100 border border-teal-700/30'
                  : 'bg-gray-800/60 text-gray-200 border border-gray-700/30'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.emotion && (
                <span className="text-[10px] text-gray-500 mt-1 block font-mono">
                  [{msg.emotion}]
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-teal-900/30 bg-gray-900/30">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isListening ? 'Listening...' : 'Type a message...'}
            className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 font-mono"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-3 py-2 bg-teal-600/30 hover:bg-teal-600/50 border border-teal-500/30 rounded-lg text-teal-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
