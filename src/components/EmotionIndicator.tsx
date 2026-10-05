import { useState, useEffect } from 'react';
import { emotionEngine } from '../engines/EmotionEngine';
import { Emotion } from '../types';

export default function EmotionIndicator() {
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [mood, setMood] = useState('neutral');

  useEffect(() => {
    const update = () => {
      setEmotions(emotionEngine.getActiveEmotions().slice(0, 8));
      setMood(emotionEngine.getMood());
    };
    update();
    const interval = setInterval(update, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900/60 rounded-xl border border-teal-900/20 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-teal-500/70">EMOTION ENGINE</span>
        <span className="text-[10px] font-mono text-gray-500">
          {emotionEngine.getEmotionCount()} emotions loaded
        </span>
      </div>
      
      {/* Current mood */}
      <div className="mb-3">
        <span className="text-xs font-mono text-gray-400">Mood: </span>
        <span className="text-xs font-mono text-teal-300 capitalize">{mood}</span>
      </div>

      {/* Active emotions */}
      <div className="space-y-1.5">
        {emotions.map(emotion => (
          <div key={emotion.id} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: emotion.color, opacity: emotion.intensity }}
            />
            <span className="text-[11px] font-mono text-gray-300 w-24 truncate">
              {emotion.name}
            </span>
            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${emotion.intensity * 100}%`,
                  backgroundColor: emotion.color,
                }}
              />
            </div>
            <span className="text-[10px] font-mono text-gray-500 w-8 text-right">
              {Math.round(emotion.intensity * 100)}%
            </span>
          </div>
        ))}
        {emotions.length === 0 && (
          <p className="text-[11px] text-gray-600 font-mono">No active emotions</p>
        )}
      </div>
    </div>
  );
}
