import { useState, useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

interface LogEntry {
  timestamp: number;
  type: 'info' | 'action' | 'emotion' | 'neural' | 'memory' | 'system';
  message: string;
}

const typeColors: Record<string, string> = {
  info: 'text-blue-400',
  action: 'text-green-400',
  emotion: 'text-purple-400',
  neural: 'text-teal-400',
  memory: 'text-yellow-400',
  system: 'text-gray-400',
};

export default function SystemLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add initial system messages
    const initialLogs: LogEntry[] = [
      { timestamp: Date.now(), type: 'system', message: 'OMNI-MINI initialized' },
      { timestamp: Date.now() + 100, type: 'system', message: 'Emotion Engine loaded (100+ emotions)' },
      { timestamp: Date.now() + 200, type: 'system', message: 'Neural Engine active (28 nodes)' },
      { timestamp: Date.now() + 300, type: 'system', message: 'Memory Engine connected (IndexedDB)' },
      { timestamp: Date.now() + 400, type: 'system', message: 'Personality Engine ready' },
      { timestamp: Date.now() + 500, type: 'info', message: 'Awaiting interaction...' },
    ];
    setLogs(initialLogs);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Expose addLog function globally
  useEffect(() => {
    (window as any).__addLog = (type: LogEntry['type'], message: string) => {
      setLogs(prev => [...prev.slice(-100), { timestamp: Date.now(), type, message }]);
    };
    return () => { delete (window as any).__addLog; };
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-teal-500/30 transition-all"
        title="System Log"
      >
        <Terminal size={14} className="text-green-400" />
      </button>
    );
  }

  return (
    <div className="absolute bottom-12 left-4 w-80 bg-gray-950/95 border border-green-900/30 rounded-xl shadow-xl shadow-black/50 z-40 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-green-900/20 bg-gray-900/50">
        <span className="text-xs font-mono text-green-400 flex items-center gap-1.5">
          <Terminal size={12} />
          SYSTEM LOG
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLogs([])}
            className="text-[10px] text-gray-500 hover:text-white font-mono"
          >
            CLEAR
          </button>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white text-xs">✕</button>
        </div>
      </div>
      <div ref={scrollRef} className="max-h-48 overflow-y-auto p-2 font-mono text-[11px] space-y-0.5">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-gray-600 shrink-0">
              {new Date(log.timestamp).toLocaleTimeString('en', { hour12: false })}
            </span>
            <span className={`shrink-0 ${typeColors[log.type]}`}>
              [{log.type.toUpperCase()}]
            </span>
            <span className="text-gray-300">{log.message}</span>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-gray-600 text-center py-4">Log cleared</p>
        )}
      </div>
    </div>
  );
}
