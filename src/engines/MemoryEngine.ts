import Dexie, { Table } from 'dexie';
import { MemoryEntry, Message, SessionData } from '../types';

class OmniMiniDB extends Dexie {
  memories!: Table<MemoryEntry>;
  messages!: Table<Message>;
  sessions!: Table<SessionData>;
  secrets!: Table<{ id: string; key: string; value: string; encrypted: boolean; timestamp: number }>;
  messageBoard!: Table<{ id: string; from: string; to: string; content: string; priority: number; timestamp: number; read: boolean }>;

  constructor() {
    super('OmniMiniDB');
    this.version(1).stores({
      memories: 'id, sessionId, type, weight, timestamp, *tags',
      messages: 'id, role, timestamp',
      sessions: 'id, startTime, endTime',
      secrets: 'id, key, timestamp',
      messageBoard: 'id, from, to, priority, timestamp, read',
    });
  }
}

let _db: OmniMiniDB | null = null;
function getDB(): OmniMiniDB {
  if (!_db) {
    _db = new OmniMiniDB();
  }
  return _db;
}

export class MemoryEngine {
  private weights: Map<string, number> = new Map();
  
  async storeMemory(entry: Omit<MemoryEntry, 'id' | 'timestamp' | 'accessCount' | 'lastAccessed'>): Promise<string> {
    const db = getDB();
    const id = crypto.randomUUID();
    const memory: MemoryEntry = {
      ...entry,
      id,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now(),
    };
    await db.memories.add(memory);
    this.updateWeight(id, entry.weight);
    return id;
  }

  async storeSecret(key: string, value: string): Promise<void> {
    const db = getDB();
    await db.secrets.add({
      id: crypto.randomUUID(),
      key,
      value: btoa(value),
      encrypted: true,
      timestamp: Date.now(),
    });
  }

  async getSecret(key: string): Promise<string | null> {
    const db = getDB();
    const secret = await db.secrets.where('key').equals(key).first();
    return secret ? atob(secret.value) : null;
  }

  async leaveMessage(from: string, to: string, content: string, priority: number = 1): Promise<void> {
    const db = getDB();
    await db.messageBoard.add({
      id: crypto.randomUUID(),
      from,
      to,
      content,
      priority,
      timestamp: Date.now(),
      read: false,
    });
  }

  async readMessages(to: string): Promise<Array<{ id: string; from: string; content: string; priority: number; timestamp: number }>> {
    const db = getDB();
    const messages = await db.messageBoard.where('to').equals(to).filter((m: any) => !m.read).toArray();
    await Promise.all(messages.map((m: any) => db.messageBoard.update(m.id, { read: true })));
    return messages.map((m: any) => ({
      id: m.id,
      from: m.from,
      content: m.content,
      priority: m.priority,
      timestamp: m.timestamp,
    }));
  }

  async recallMemories(query: string, type?: string): Promise<MemoryEntry[]> {
    const db = getDB();
    let memories: MemoryEntry[];
    
    if (type) {
      memories = await db.memories.where('type').equals(type).toArray();
    } else {
      memories = await db.memories.toArray();
    }

    const queryTerms = query.toLowerCase().split(/\s+/);
    const scored = memories.map(m => {
      let score = m.weight;
      const content = m.content.toLowerCase();
      queryTerms.forEach(term => {
        if (content.includes(term)) score += 0.5;
        if (m.tags.some(t => t.toLowerCase().includes(term))) score += 0.3;
      });
      const age = Date.now() - m.timestamp;
      score += Math.max(0, 1 - age / (7 * 24 * 60 * 60 * 1000)) * 0.2;
      score += m.accessCount * 0.05;
      return { memory: m, score };
    });

    scored.sort((a, b) => b.score - a.score);
    
    const topResults = scored.slice(0, 5);
    await Promise.all(topResults.map(async ({ memory }) => {
      await db.memories.update(memory.id, {
        accessCount: memory.accessCount + 1,
        lastAccessed: Date.now(),
      });
    }));

    return topResults.map(s => s.memory);
  }

  async storeMessage(message: Message): Promise<void> {
    const db = getDB();
    await db.messages.add(message);
  }

  async getRecentMessages(limit: number = 50): Promise<Message[]> {
    const db = getDB();
    return db.messages.orderBy('timestamp').reverse().limit(limit).toArray();
  }

  async createSession(): Promise<string> {
    const db = getDB();
    const id = crypto.randomUUID();
    await db.sessions.add({
      id,
      startTime: Date.now(),
      messages: [],
      emotions: [],
      memoriesCreated: 0,
    });
    return id;
  }

  async endSession(sessionId: string): Promise<void> {
    const db = getDB();
    await db.sessions.update(sessionId, { endTime: Date.now() });
  }

  private updateWeight(id: string, weight: number) {
    this.weights.set(id, weight);
  }

  async getStats(): Promise<{ totalMemories: number; totalMessages: number; totalSessions: number; unreadMessages: number }> {
    const db = getDB();
    const [totalMemories, totalMessages, totalSessions, unreadMessages] = await Promise.all([
      db.memories.count(),
      db.messages.count(),
      db.sessions.count(),
      db.messageBoard.where('read').equals(0).count(),
    ]);
    return { totalMemories, totalMessages, totalSessions, unreadMessages };
  }
}

export const memoryEngine = new MemoryEngine();
