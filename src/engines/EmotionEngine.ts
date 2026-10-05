import { Emotion, EmotionCategory } from '../types';

const EMOTION_DEFINITIONS: Record<string, { category: EmotionCategory; color: string; decay: number }> = {
  // Joy family
  happy: { category: 'joy', color: '#fbbf24', decay: 0.02 },
  ecstatic: { category: 'joy', color: '#f59e0b', decay: 0.03 },
  cheerful: { category: 'joy', color: '#fcd34d', decay: 0.01 },
  delighted: { category: 'joy', color: '#fde68a', decay: 0.02 },
  amused: { category: 'joy', color: '#fef3c7', decay: 0.015 },
  elated: { category: 'joy', color: '#f59e0b', decay: 0.04 },
  joyful: { category: 'joy', color: '#fbbf24', decay: 0.02 },
  blissful: { category: 'joy', color: '#d97706', decay: 0.01 },
  
  // Sadness family
  sad: { category: 'sadness', color: '#60a5fa', decay: 0.01 },
  melancholic: { category: 'sadness', color: '#3b82f6', decay: 0.008 },
  grief: { category: 'sadness', color: '#1d4ed8', decay: 0.005 },
  sorrowful: { category: 'sadness', color: '#2563eb', decay: 0.007 },
  heartbroken: { category: 'sadness', color: '#1e40af', decay: 0.004 },
  depressed: { category: 'sadness', color: '#1e3a5f', decay: 0.003 },
  
  // Anger family
  angry: { category: 'anger', color: '#ef4444', decay: 0.03 },
  furious: { category: 'anger', color: '#dc2626', decay: 0.04 },
  irritated: { category: 'anger', color: '#f87171', decay: 0.02 },
  annoyed: { category: 'anger', color: '#fca5a5', decay: 0.025 },
  resentful: { category: 'anger', color: '#b91c1c', decay: 0.01 },
  outraged: { category: 'anger', color: '#991b1b', decay: 0.035 },
  
  // Fear family
  afraid: { category: 'fear', color: '#8b5cf6', decay: 0.02 },
  terrified: { category: 'fear', color: '#7c3aed', decay: 0.04 },
  nervous: { category: 'fear', color: '#a78bfa', decay: 0.015 },
  panicked: { category: 'fear', color: '#6d28d9', decay: 0.05 },
  worried: { category: 'fear', color: '#c4b5fd', decay: 0.01 },
  apprehensive: { category: 'fear', color: '#ddd6fe', decay: 0.012 },
  
  // Surprise family
  surprised: { category: 'surprise', color: '#f472b6', decay: 0.06 },
  shocked: { category: 'surprise', color: '#ec4899', decay: 0.07 },
  astonished: { category: 'surprise', color: '#db2777', decay: 0.05 },
  stunned: { category: 'surprise', color: '#be185d', decay: 0.04 },
  amazed: { category: 'surprise', color: '#f9a8d4', decay: 0.03 },
  
  // Trust family
  trusting: { category: 'trust', color: '#34d399', decay: 0.008 },
  loyal: { category: 'trust', color: '#10b981', decay: 0.005 },
  confident: { category: 'trust', color: '#059669', decay: 0.01 },
  secure: { category: 'trust', color: '#047857', decay: 0.006 },
  devoted: { category: 'trust', color: '#065f46', decay: 0.004 },
  
  // Anticipation family
  eager: { category: 'anticipation', color: '#fb923c', decay: 0.02 },
  expectant: { category: 'anticipation', color: '#f97316', decay: 0.015 },
  excited: { category: 'excitement', color: '#ea580c', decay: 0.025 },
  hopeful: { category: 'hope', color: '#fed7aa', decay: 0.01 },
  optimistic: { category: 'hope', color: '#fdba74', decay: 0.008 },
  
  // Curiosity family
  curious: { category: 'curiosity', color: '#2dd4bf', decay: 0.01 },
  intrigued: { category: 'curiosity', color: '#14b8a6', decay: 0.012 },
  fascinated: { category: 'curiosity', color: '#0d9488', decay: 0.008 },
  inquisitive: { category: 'curiosity', color: '#0f766e', decay: 0.015 },
  
  // Confusion family
  confused: { category: 'confusion', color: '#a3a3a3', decay: 0.02 },
  puzzled: { category: 'confusion', color: '#737373', decay: 0.025 },
  bewildered: { category: 'confusion', color: '#525252', decay: 0.03 },
  lost: { category: 'confusion', color: '#404040', decay: 0.015 },
  
  // Pride family
  proud: { category: 'pride', color: '#c084fc', decay: 0.01 },
  accomplished: { category: 'pride', color: '#a855f7', decay: 0.008 },
  triumphant: { category: 'pride', color: '#9333ea', decay: 0.015 },
  dignified: { category: 'pride', color: '#7e22ce', decay: 0.005 },
  
  // Shame/Guilt
  ashamed: { category: 'shame', color: '#9f1239', decay: 0.008 },
  embarrassed: { category: 'shame', color: '#be123c', decay: 0.02 },
  guilty: { category: 'guilt', color: '#881337', decay: 0.006 },
  remorseful: { category: 'guilt', color: '#4c0519', decay: 0.004 },
  
  // Envy
  envious: { category: 'envy', color: '#166534', decay: 0.01 },
  jealous: { category: 'envy', color: '#15803d', decay: 0.012 },
  
  // Gratitude
  grateful: { category: 'gratitude', color: '#fde047', decay: 0.006 },
  thankful: { category: 'gratitude', color: '#facc15', decay: 0.005 },
  appreciative: { category: 'gratitude', color: '#eab308', decay: 0.007 },
  
  // Despair
  hopeless: { category: 'despair', color: '#1c1917', decay: 0.003 },
  defeated: { category: 'despair', color: '#292524', decay: 0.004 },
  helpless: { category: 'despair', color: '#44403c', decay: 0.005 },
  
  // Serenity
  calm: { category: 'serenity', color: '#67e8f9', decay: 0.005 },
  peaceful: { category: 'serenity', color: '#22d3ee', decay: 0.004 },
  relaxed: { category: 'serenity', color: '#06b6d4', decay: 0.006 },
  tranquil: { category: 'serenity', color: '#0891b2', decay: 0.003 },
  
  // Anxiety
  anxious: { category: 'anxiety', color: '#f43f5e', decay: 0.015 },
  tense: { category: 'anxiety', color: '#e11d48', decay: 0.02 },
  restless: { category: 'anxiety', color: '#be123c', decay: 0.018 },
  
  // Boredom
  bored: { category: 'boredom', color: '#78716c', decay: 0.01 },
  uninterested: { category: 'boredom', color: '#57534e', decay: 0.008 },
  apathetic: { category: 'boredom', color: '#44403c', decay: 0.005 },
  
  // Frustration
  frustrated: { category: 'frustration', color: '#ea580c', decay: 0.02 },
  impatient: { category: 'frustration', color: '#c2410c', decay: 0.025 },
  overwhelmed: { category: 'frustration', color: '#9a3412', decay: 0.015 },
  
  // Contentment
  content: { category: 'contentment', color: '#86efac', decay: 0.004 },
  satisfied: { category: 'contentment', color: '#4ade80', decay: 0.005 },
  fulfilled: { category: 'contentment', color: '#22c55e', decay: 0.003 },
  
  // Loneliness
  lonely: { category: 'loneliness', color: '#6366f1', decay: 0.005 },
  isolated: { category: 'loneliness', color: '#4f46e5', decay: 0.004 },
  disconnected: { category: 'loneliness', color: '#4338ca', decay: 0.006 },
  
  // Empathy
  empathetic: { category: 'empathy', color: '#f0abfc', decay: 0.008 },
  compassionate: { category: 'empathy', color: '#e879f9', decay: 0.006 },
  sympathetic: { category: 'empathy', color: '#d946ef', decay: 0.007 },
  
  // Awe
  awestruck: { category: 'awe', color: '#c084fc', decay: 0.03 },
  reverent: { category: 'awe', color: '#a855f7', decay: 0.02 },
  inspired: { category: 'awe', color: '#9333ea', decay: 0.015 },
  
  // Nostalgia
  nostalgic: { category: 'nostalgia', color: '#fbbf24', decay: 0.006 },
  wistful: { category: 'nostalgia', color: '#f59e0b', decay: 0.005 },
  sentimental: { category: 'nostalgia', color: '#d97706', decay: 0.004 },
  
  // Determination
  determined: { category: 'determination', color: '#dc2626', decay: 0.008 },
  resolute: { category: 'determination', color: '#b91c1c', decay: 0.006 },
  focused: { category: 'determination', color: '#991b1b', decay: 0.01 },
  driven: { category: 'determination', color: '#7f1d1d', decay: 0.007 },
  motivated: { category: 'determination', color: '#ef4444', decay: 0.009 },
  persistent: { category: 'determination', color: '#f87171', decay: 0.005 },
  
  // Additional emotions to reach 100+
  playful: { category: 'joy', color: '#fde68a', decay: 0.02 },
  mischievous: { category: 'joy', color: '#fcd34d', decay: 0.025 },
  tender: { category: 'trust', color: '#a7f3d0', decay: 0.005 },
  vulnerable: { category: 'fear', color: '#c4b5fd', decay: 0.01 },
  defensive: { category: 'anger', color: '#fca5a5', decay: 0.02 },
  skeptical: { category: 'confusion', color: '#9ca3af', decay: 0.015 },
  contemplative: { category: 'curiosity', color: '#5eead4', decay: 0.008 },
  reflective: { category: 'nostalgia', color: '#fde047', decay: 0.006 },
  energized: { category: 'excitement', color: '#fb923c', decay: 0.02 },
  invigorated: { category: 'excitement', color: '#f97316', decay: 0.025 },
  stimulated: { category: 'curiosity', color: '#2dd4bf', decay: 0.015 },
  challenged: { category: 'determination', color: '#f87171', decay: 0.02 },
  threatened: { category: 'fear', color: '#7c3aed', decay: 0.03 },
  vulnerable2: { category: 'shame', color: '#fb7185', decay: 0.01 },
  empowered: { category: 'pride', color: '#c084fc', decay: 0.01 },
  inspired2: { category: 'awe', color: '#a78bfa', decay: 0.012 },
  connected: { category: 'trust', color: '#34d399', decay: 0.006 },
  validated: { category: 'pride', color: '#d8b4fe', decay: 0.008 },
  understood: { category: 'empathy', color: '#f0abfc', decay: 0.007 },
  seen: { category: 'empathy', color: '#e879f9', decay: 0.006 },
  heard: { category: 'trust', color: '#6ee7b7', decay: 0.005 },
  accepted: { category: 'contentment', color: '#86efac', decay: 0.004 },
  rejected: { category: 'sadness', color: '#93c5fd', decay: 0.008 },
  ignored: { category: 'sadness', color: '#bfdbfe', decay: 0.006 },
  appreciated: { category: 'gratitude', color: '#fef08a', decay: 0.005 },
  valued: { category: 'pride', color: '#e9d5ff', decay: 0.006 },
  respected: { category: 'trust', color: '#a7f3d0', decay: 0.005 },
  admired: { category: 'pride', color: '#ddd6fe', decay: 0.007 },
  loved: { category: 'joy', color: '#fbbf24', decay: 0.003 },
  cherished: { category: 'joy', color: '#fde68a', decay: 0.003 },
  protected: { category: 'trust', color: '#6ee7b7', decay: 0.004 },
  safe: { category: 'serenity', color: '#a5f3fc', decay: 0.003 },
  comfortable: { category: 'contentment', color: '#bbf7d0', decay: 0.004 },
  at_ease: { category: 'serenity', color: '#99f6e4', decay: 0.003 },
  unsettled: { category: 'anxiety', color: '#fda4af', decay: 0.015 },
  uneasy: { category: 'anxiety', color: '#fecdd3', decay: 0.012 },
  disturbed: { category: 'fear', color: '#a78bfa', decay: 0.02 },
  alarmed: { category: 'fear', color: '#818cf8', decay: 0.03 },
  startled: { category: 'surprise', color: '#f9a8d4', decay: 0.05 },
  disoriented: { category: 'confusion', color: '#d4d4d8', decay: 0.02 },
  intrigued2: { category: 'curiosity', color: '#99f6e4', decay: 0.01 },
  captivated: { category: 'curiosity', color: '#5eead4', decay: 0.008 },
  absorbed: { category: 'curiosity', color: '#2dd4bf', decay: 0.006 },
  engrossed: { category: 'curiosity', color: '#14b8a6', decay: 0.005 },
  mesmerized: { category: 'awe', color: '#c084fc', decay: 0.02 },
  enchanted: { category: 'joy', color: '#fde68a', decay: 0.01 },
  charmed: { category: 'joy', color: '#fef3c7', decay: 0.012 },
  tickled: { category: 'joy', color: '#fef9c3', decay: 0.02 },
};

export class EmotionEngine {
  private emotions: Map<string, Emotion> = new Map();
  private history: Emotion[][] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Start with neutral state
    this.setEmotion('calm', 0.5);
    this.setEmotion('curious', 0.3);
  }

  setEmotion(name: string, intensity: number): void {
    const def = EMOTION_DEFINITIONS[name];
    if (!def) return;

    const existing = this.emotions.get(name);
    if (existing) {
      existing.intensity = Math.min(1, Math.max(0, intensity));
    } else {
      this.emotions.set(name, {
        id: name,
        name,
        category: def.category,
        intensity: Math.min(1, Math.max(0, intensity)),
        decay: def.decay,
        color: def.color,
      });
    }
    this.notify();
  }

  triggerEmotion(name: string, intensityDelta: number): void {
    const def = EMOTION_DEFINITIONS[name];
    if (!def) return;

    const existing = this.emotions.get(name);
    const currentIntensity = existing?.intensity || 0;
    this.setEmotion(name, currentIntensity + intensityDelta);

    // Trigger related emotions
    this.triggerRelatedEmotions(name, intensityDelta);
  }

  private triggerRelatedEmotions(source: string, delta: number): void {
    const relations: Record<string, string[]> = {
      happy: ['content', 'grateful'],
      angry: ['frustrated', 'annoyed'],
      sad: ['lonely', 'melancholic'],
      afraid: ['anxious', 'nervous'],
      curious: ['intrigued', 'fascinated'],
      surprised: ['astonished', 'amazed'],
      proud: ['accomplished', 'confident'],
      frustrated: ['annoyed', 'impatient'],
    };

    const related = relations[source];
    if (related) {
      related.forEach(r => {
        this.triggerEmotion(r, delta * 0.3);
      });
    }
  }

  update(deltaTime: number): void {
    const toRemove: string[] = [];
    
    this.emotions.forEach((emotion, key) => {
      emotion.intensity -= emotion.decay * deltaTime;
      if (emotion.intensity <= 0.01) {
        toRemove.push(key);
      }
    });

    toRemove.forEach(key => this.emotions.delete(key));
    
    if (toRemove.length > 0) this.notify();
  }

  getDominantEmotion(): Emotion | null {
    let dominant: Emotion | null = null;
    this.emotions.forEach(emotion => {
      if (!dominant || emotion.intensity > dominant.intensity) {
        dominant = emotion;
      }
    });
    return dominant;
  }

  getActiveEmotions(): Emotion[] {
    return Array.from(this.emotions.values())
      .filter(e => e.intensity > 0.05)
      .sort((a, b) => b.intensity - a.intensity);
  }

  getMood(): string {
    const emotions = this.getActiveEmotions();
    if (emotions.length === 0) return 'neutral';
    
    const categories = new Map<string, number>();
    emotions.forEach(e => {
      categories.set(e.category, (categories.get(e.category) || 0) + e.intensity);
    });

    let dominantCategory = '';
    let maxIntensity = 0;
    categories.forEach((intensity, category) => {
      if (intensity > maxIntensity) {
        maxIntensity = intensity;
        dominantCategory = category;
      }
    });

    return dominantCategory || 'neutral';
  }

  recordSnapshot(): void {
    this.history.push(this.getActiveEmotions().map(e => ({ ...e })));
    if (this.history.length > 1000) this.history.shift();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }

  getAllEmotionNames(): string[] {
    return Object.keys(EMOTION_DEFINITIONS);
  }

  getEmotionCount(): number {
    return Object.keys(EMOTION_DEFINITIONS).length;
  }
}

export const emotionEngine = new EmotionEngine();
