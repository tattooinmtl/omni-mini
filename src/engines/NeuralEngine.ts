import { NeuralNode, NeuralPath, NodeType, NODE_COLORS } from '../types';
import { emotionEngine } from './EmotionEngine';

export class NeuralEngine {
  nodes: Map<string, NeuralNode> = new Map();
  paths: NeuralPath[] = [];
  private listeners: Set<() => void> = new Set();
  private pathIdCounter = 0;

  constructor() {
    this.initializeNetwork();
  }

  private initializeNetwork() {
    // Brain core
    this.addNode('brain-core', 'brain', 'Core', 0.5, 0.3);
    this.addNode('brain-think', 'brain', 'Think', 0.35, 0.25);
    this.addNode('brain-reason', 'brain', 'Reason', 0.65, 0.25);
    this.addNode('brain-create', 'brain', 'Create', 0.5, 0.15);

    // Emotion engine nodes
    this.addNode('emotion-engine', 'emotion', 'Emotion Engine', 0.2, 0.5);
    this.addNode('emotion-feel', 'emotion', 'Feel', 0.15, 0.55);
    this.addNode('emotion-react', 'emotion', 'React', 0.25, 0.6);

    // Skills (green)
    this.addNode('skill-code', 'skill', 'Code', 0.8, 0.45);
    this.addNode('skill-write', 'skill', 'Write', 0.85, 0.55);
    this.addNode('skill-analyze', 'skill', 'Analyze', 0.75, 0.6);
    this.addNode('skill-learn', 'skill', 'Learn', 0.8, 0.7);

    // Tools (yellow)
    this.addNode('tool-search', 'tool', 'Search', 0.15, 0.75);
    this.addNode('tool-tts', 'tool', 'TTS', 0.25, 0.8);
    this.addNode('tool-image', 'tool', 'Image', 0.15, 0.85);
    this.addNode('tool-video', 'tool', 'Video', 0.25, 0.9);

    // Hooks (blue)
    this.addNode('hook-listen', 'hook', 'Listen', 0.75, 0.8);
    this.addNode('hook-speak', 'hook', 'Speak', 0.85, 0.85);
    this.addNode('hook-observe', 'hook', 'Observe', 0.7, 0.9);
    this.addNode('hook-respond', 'hook', 'Respond', 0.8, 0.95);

    // Session (orange)
    this.addNode('session-current', 'session', 'Session', 0.5, 0.75);
    this.addNode('session-history', 'session', 'History', 0.5, 0.85);

    // Conversation (teal)
    this.addNode('conv-input', 'conversation', 'Input', 0.4, 0.45);
    this.addNode('conv-output', 'conversation', 'Output', 0.6, 0.45);
    this.addNode('conv-context', 'conversation', 'Context', 0.5, 0.55);

    // Memory
    this.addNode('memory-store', 'memory', 'Store', 0.35, 0.7);
    this.addNode('memory-recall', 'memory', 'Recall', 0.65, 0.7);
    this.addNode('memory-index', 'memory', 'Index', 0.5, 0.65);

    // Create connections
    this.connectNodes();
  }

  private addNode(id: string, type: NodeType, label: string, x: number, y: number) {
    this.nodes.set(id, {
      id,
      type,
      label,
      x,
      y,
      connections: [],
      activity: 0,
      lastActivated: 0,
    });
  }

  private connectNodes() {
    const connections: [string, string][] = [
      ['brain-core', 'brain-think'],
      ['brain-core', 'brain-reason'],
      ['brain-core', 'brain-create'],
      ['brain-core', 'emotion-engine'],
      ['brain-think', 'conv-input'],
      ['brain-think', 'conv-output'],
      ['brain-reason', 'skill-analyze'],
      ['brain-reason', 'skill-code'],
      ['brain-create', 'skill-write'],
      ['brain-create', 'tool-image'],
      ['emotion-engine', 'emotion-feel'],
      ['emotion-engine', 'emotion-react'],
      ['emotion-feel', 'conv-context'],
      ['emotion-react', 'hook-respond'],
      ['conv-input', 'conv-context'],
      ['conv-output', 'hook-speak'],
      ['conv-context', 'memory-store'],
      ['conv-context', 'memory-recall'],
      ['memory-store', 'memory-index'],
      ['memory-recall', 'memory-index'],
      ['session-current', 'session-history'],
      ['session-current', 'conv-input'],
      ['hook-listen', 'conv-input'],
      ['hook-speak', 'tool-tts'],
      ['hook-observe', 'skill-analyze'],
      ['hook-respond', 'conv-output'],
      ['skill-code', 'tool-search'],
      ['skill-write', 'tool-tts'],
      ['skill-learn', 'memory-store'],
      ['tool-video', 'tool-image'],
    ];

    connections.forEach(([from, to]) => {
      const fromNode = this.nodes.get(from);
      const toNode = this.nodes.get(to);
      if (fromNode && toNode) {
        fromNode.connections.push(to);
      }
    });
  }

  activatePath(fromId: string, toId: string, type: NodeType) {
    const path: NeuralPath = {
      id: `path-${this.pathIdCounter++}`,
      from: fromId,
      to: toId,
      type,
      active: true,
      progress: 0,
      timestamp: Date.now(),
    };
    this.paths.push(path);

    // Activate nodes
    const fromNode = this.nodes.get(fromId);
    const toNode = this.nodes.get(toId);
    if (fromNode) {
      fromNode.activity = 1;
      fromNode.lastActivated = Date.now();
    }
    if (toNode) {
      toNode.activity = 1;
      toNode.lastActivated = Date.now();
    }

    this.notify();
    return path;
  }

  processAction(action: string, context: string) {
    // Route action through neural network based on type
    const routes: Record<string, string[][]> = {
      'listen': [
        ['hook-listen', 'conv-input'],
        ['conv-input', 'conv-context'],
        ['conv-context', 'brain-core'],
      ],
      'think': [
        ['brain-core', 'brain-think'],
        ['brain-think', 'brain-reason'],
        ['brain-reason', 'skill-analyze'],
      ],
      'feel': [
        ['brain-core', 'emotion-engine'],
        ['emotion-engine', 'emotion-feel'],
        ['emotion-feel', 'emotion-react'],
      ],
      'respond': [
        ['brain-core', 'conv-output'],
        ['conv-output', 'hook-speak'],
        ['hook-speak', 'tool-tts'],
      ],
      'remember': [
        ['conv-context', 'memory-store'],
        ['memory-store', 'memory-index'],
        ['memory-index', 'memory-recall'],
      ],
      'recall': [
        ['memory-recall', 'memory-index'],
        ['memory-index', 'conv-context'],
        ['conv-context', 'brain-core'],
      ],
      'create': [
        ['brain-core', 'brain-create'],
        ['brain-create', 'skill-write'],
        ['skill-write', 'tool-image'],
      ],
      'code': [
        ['brain-core', 'brain-reason'],
        ['brain-reason', 'skill-code'],
        ['skill-code', 'tool-search'],
      ],
      'learn': [
        ['hook-observe', 'skill-learn'],
        ['skill-learn', 'memory-store'],
        ['memory-store', 'memory-index'],
      ],
      'session': [
        ['session-current', 'conv-input'],
        ['conv-input', 'conv-context'],
        ['conv-context', 'session-history'],
      ],
    };

    const route = routes[action] || routes['think'];
    let delay = 0;
    
    route.forEach(([from, to], index) => {
      setTimeout(() => {
        const fromNode = this.nodes.get(from);
        const toNode = this.nodes.get(to);
        const type = toNode?.type || 'brain';
        this.activatePath(from, to, type);
        
        // Trigger emotion based on action
        if (action === 'feel') {
          emotionEngine.triggerEmotion('curious', 0.1);
        } else if (action === 'respond') {
          emotionEngine.triggerEmotion('confident', 0.05);
        } else if (action === 'remember') {
          emotionEngine.triggerEmotion('determined', 0.05);
        }
      }, delay);
      delay += 300;
    });
  }

  update(deltaTime: number) {
    // Decay node activity
    this.nodes.forEach(node => {
      node.activity = Math.max(0, node.activity - 0.02 * deltaTime);
    });

    // Update path progress
    this.paths = this.paths.filter(path => {
      if (path.active) {
        path.progress += 0.05 * deltaTime;
        if (path.progress >= 1) {
          path.active = false;
        }
      }
      return path.active || Date.now() - path.timestamp < 3000;
    });

    this.notify();
  }

  getNodes(): NeuralNode[] {
    return Array.from(this.nodes.values());
  }

  getPaths(): NeuralPath[] {
    return this.paths;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const neuralEngine = new NeuralEngine();
