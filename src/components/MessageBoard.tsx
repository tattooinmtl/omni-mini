import { useState, useEffect } from 'react';
import { memoryEngine } from '../engines/MemoryEngine';
import { StickyNote, Clock } from 'lucide-react';

interface BoardMessage {
  id: string;
  from: string;
  content: string;
  priority: number;
  timestamp: number;
}

export default function MessageBoard() {
  const [messages, setMessages] = useState<BoardMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const msgs = await memoryEngine.readMessages('self');
      setMessages(msgs);
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-teal-500/30 transition-all"
        title="Message Board"
      >
        <StickyNote size={14} className="text-yellow-400" />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full text-[9px] flex items-center justify-center text-black font-bold">
            {messages.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="absolute bottom-12 right-4 w-72 bg-gray-900/95 border border-yellow-900/30 rounded-xl shadow-xl shadow-black/50 z-40 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-yellow-900/20 bg-gray-900/50">
        <span className="text-xs font-mono text-yellow-400 flex items-center gap-1.5">
          <StickyNote size={12} />
          MESSAGE BOARD
        </span>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white text-xs">✕</button>
      </div>
      <div className="max-h-48 overflow-y-auto p-2 space-y-2">
        {messages.length === 0 ? (
          <p className="text-xs text-gray-500 font-mono text-center py-4">No messages yet</p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="bg-gray-800/50 rounded-lg p-2 border border-gray-700/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-yellow-300/70">From: {msg.from}</span>
                <span className="text-[9px] font-mono text-gray-600 flex items-center gap-0.5">
                  <Clock size={8} />
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-gray-300">{msg.content}</p>
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: msg.priority }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
