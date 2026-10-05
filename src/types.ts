// Core types for the Omni-Mini AI Assistant

export interface Emotion {
  id: string;
  name: string;
  category: EmotionCategory;
  intensity: number; // 0-1
  decay: number; // how fast it fades
  color: string;
}

export type EmotionCategory = 
  | 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' 
  | 'disgust' | 'trust' | 'anticipation' | 'curiosity' 
  | 'confusion' | 'pride' | 'shame' | 'guilt' | 'envy'
  | 'gratitude' | 'hope' | 'despair' | 'serenity' | 'anxiety'
  | 'boredom' | 'excitement' | 'frustration' | 'contentment'
  | 'loneliness' | 'empathy' | 'awe' | 'nostalgia' | 'determination';

export interface NeuralNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  connections: string[];
  activity: number; // 0-1
  lastActivated: number;
}

export type NodeType = 'brain' | 'emotion' | 'skill' | 'tool' | 'hook' | 'session' | 'conversation' | 'memory';

export interface NeuralPath {
  id: string;
  from: string;
  to: string;
  type: NodeType;
  active: boolean;
  progress: number; // 0-1
  timestamp: number;
}

export interface MemoryEntry {
  id: string;
  sessionId: string;
  type: 'fact' | 'preference' | 'secret' | 'message' | 'observation' | 'skill' | 'emotion_log';
  content: string;
  weight: number;
  timestamp: number;
  tags: string[];
  accessCount: number;
  lastAccessed: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  emotion?: string;
  neuralActivity?: NeuralPath[];
}

export interface PersonalityPreset {
  name: string;
  description: string;
  traits: Record<string, number>;
  systemPrompt: string;
}

export interface SessionData {
  id: string;
  startTime: number;
  endTime?: number;
  messages: Message[];
  emotions: Emotion[];
  memoriesCreated: number;
}

export interface Settings {
  apiKey: string;
  voiceEnabled: boolean;
  chatVisible: boolean;
  selectedModel: string;
  ttsModel: string;
  voiceId: string;
  personalityPreset: string;
  wakeWord: string;
  autoListen: boolean;
  theme: 'dark' | 'cyber' | 'matrix';
}

export const NODE_COLORS: Record<NodeType, string> = {
  brain: '#a855f7',
  emotion: '#ef4444',
  skill: '#22c55e',
  tool: '#eab308',
  hook: '#3b82f6',
  session: '#f97316',
  conversation: '#14b8a6',
  memory: '#ec4899',
};
