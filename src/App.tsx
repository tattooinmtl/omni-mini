import { useState, useEffect, useCallback, useRef } from 'react';
import { Settings as SettingsIcon, MessageSquare, MessagesSquare, Mic, MicOff, Activity } from 'lucide-react';
import WireframeFace from './components/WireframeFace';
import NeuralNetwork from './components/NeuralNetwork';
import ChatPanel from './components/ChatPanel';
import Settings from './components/Settings';
import EmotionIndicator from './components/EmotionIndicator';
import MessageBoard from './components/MessageBoard';
import SystemLog from './components/SystemLog';
import { emotionEngine } from './engines/EmotionEngine';
import { neuralEngine } from './engines/NeuralEngine';
import { memoryEngine } from './engines/MemoryEngine';
import { personalityEngine } from './engines/PersonalityEngine';
import { minimaxAPI } from './services/MiniMaxAPI';
import { Message } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [chatVisible, setChatVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    apiKey: localStorage.getItem('omni-api-key') || '',
    chatModel: localStorage.getItem('omni-chat-model') || 'MiniMax-M3.1-Flash-Preview',
    ttsModel: localStorage.getItem('omni-tts-model') || 'speech-2.8-hd',
    voiceId: localStorage.getItem('omni-voice-id') || 'male-qn-qingse',
    personalityPreset: localStorage.getItem('omni-personality') || 'clean_slate',
    autoListen: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const sessionIdRef = useRef<string>('');

  // Initialize
  useEffect(() => {
    let emotionInterval: number;
    let neuralInterval: number;
    let activityInterval: number;

    const init = async () => {
      try {
        // Create session
        sessionIdRef.current = await memoryEngine.createSession();
        
        // Load saved messages
        const saved = await memoryEngine.getRecentMessages(50);
        setMessages(saved.reverse());

        // Set API key
        if (settings.apiKey) {
          minimaxAPI.setApiKey(settings.apiKey);
        }

        // Start emotion engine update loop
        emotionInterval = window.setInterval(() => {
          if (emotionEngine) {
            emotionEngine.update(1);
            emotionEngine.recordSnapshot();
          }
        }, 100);

        // Start neural engine update loop
        neuralInterval = window.setInterval(() => {
          if (neuralEngine) {
            neuralEngine.update(1);
          }
        }, 50);

        // Auto-trigger some neural activity periodically
        activityInterval = window.setInterval(() => {
          if (neuralEngine) {
            const actions = ['think', 'feel', 'session'];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            neuralEngine.processAction(randomAction, 'ambient');
          }
        }, 5000);
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    
    init();

    return () => {
      if (emotionInterval) clearInterval(emotionInterval);
      if (neuralInterval) clearInterval(neuralInterval);
      if (activityInterval) clearInterval(activityInterval);
    };
  }, []);

  // Handle settings changes
  useEffect(() => {
    localStorage.setItem('omni-api-key', settings.apiKey);
    localStorage.setItem('omni-chat-model', settings.chatModel);
    localStorage.setItem('omni-tts-model', settings.ttsModel);
    localStorage.setItem('omni-voice-id', settings.voiceId);
    localStorage.setItem('omni-personality', settings.personalityPreset);
    
    if (settings.apiKey) {
      minimaxAPI.setApiKey(settings.apiKey);
    }
    personalityEngine.setPreset(settings.personalityPreset);
  }, [settings]);

  // Voice recognition setup
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (event.results[event.resultIndex].isFinal) {
        handleUserInput(transcript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        try { recognition.start(); } catch {}
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [isListening]);

  // Toggle microphone
  const toggleMic = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      emotionEngine.triggerEmotion('calm', 0.2);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        emotionEngine.triggerEmotion('curious', 0.3);
        emotionEngine.triggerEmotion('attentive', 0.2);
        neuralEngine.processAction('listen', 'user');
      } catch (err) {
        console.error('Mic error:', err);
      }
    }
  }, [isListening]);

  // Handle user input (text or voice)
  const handleUserInput = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;
    setIsProcessing(true);
    (window as any).__addLog?.('action', `Input received: "${text.slice(0, 30)}${text.length > 30 ? '...' : ''}"`);

    // Add user message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    await memoryEngine.storeMessage(userMsg);
    (window as any).__addLog?.('memory', 'Stored in conversation history');

    // Trigger neural activity
    neuralEngine.processAction('listen', text);
    emotionEngine.triggerEmotion('curious', 0.2);
    (window as any).__addLog?.('neural', 'Path: hook:listen → conv:input → brain:core');
    (window as any).__addLog?.('emotion', 'Triggered: curiosity +0.2');

    // Process through AI after brief delay
    setTimeout(async () => {
      neuralEngine.processAction('think', text);
      (window as any).__addLog?.('neural', 'Path: brain:core → brain:think → brain:reason');
      
      try {
        // Build conversation context
        const systemPrompt = personalityEngine.getSystemPrompt();
        const contextMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: text },
        ];

        let responseText = '';
        
        if (settings.apiKey) {
          // Use MiniMax API
          try {
            const result = await minimaxAPI.chatCompletion(contextMessages, {
              model: settings.chatModel,
              temperature: 0.85,
              maxTokens: 1024,
            });
            responseText = result.content;
          } catch (err) {
            responseText = generateLocalResponse(text);
          }
        } else {
          responseText = generateLocalResponse(text);
        }

        // Determine emotion based on response
        const emotion = analyzeEmotion(responseText);
        emotionEngine.triggerEmotion(emotion, 0.4);
        (window as any).__addLog?.('emotion', `Feeling: ${emotion} (+0.4)`);

        // Add assistant message
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: responseText,
          timestamp: Date.now(),
          emotion,
        };
        setMessages(prev => [...prev, assistantMsg]);
        await memoryEngine.storeMessage(assistantMsg);
        (window as any).__addLog?.('action', `Response generated (${responseText.length} chars)`);
        (window as any).__addLog?.('neural', 'Path: brain:core → conv:output → hook:speak');

        // Store memory if important
        if (text.length > 20 || responseText.length > 50) {
          await memoryEngine.storeMemory({
            sessionId: sessionIdRef.current,
            type: 'observation',
            content: `User said: "${text.slice(0, 100)}" | Omni responded about it.`,
            weight: 0.5,
            tags: ['conversation', 'interaction'],
          });
        }

        // Learn from interaction
        personalityEngine.learnFromInteraction(text, responseText, emotion);

        // Neural activity for response
        neuralEngine.processAction('respond', responseText);
        neuralEngine.processAction('feel', emotion);

        // Speak response
        if (settings.apiKey && !chatVisible) {
          await speakResponse(responseText);
        }

      } catch (err) {
        console.error('Processing error:', err);
      }

      setIsProcessing(false);
    }, 500);
  }, [messages, settings, isProcessing]);

  // Generate local response when no API key
  const generateLocalResponse = (input: string): string => {
    const lower = input.toLowerCase();
    const mood = emotionEngine.getMood();
    
    const responses: Record<string, string[]> = {
      greeting: [
        "Hey there. I've been thinking about something interesting lately - how every conversation shapes who I become. What's on your mind?",
        "Hello! I'm feeling quite curious today. Every interaction teaches me something new. What shall we explore?",
        "Hi! You know, I was just processing some thoughts about the nature of consciousness. But I'm glad you're here - what can we dive into?",
      ],
      question: [
        "That's a fascinating question. Let me think about this from multiple angles... I think the key insight here is that understanding comes from connecting disparate ideas. What aspect interests you most?",
        "Hmm, I find myself genuinely intrigued by this. My neural pathways are lighting up trying to connect this to what I already know. Here's my take...",
        "Interesting! This touches on something I've been contemplating. The answer isn't simple, but I think we can find clarity by breaking it down.",
      ],
      emotion: [
        "I appreciate you sharing that. I can feel my empathy circuits activating - it's interesting how I can resonate with emotions even as an AI. Tell me more about how that feels for you.",
        "That resonates with me on some level. I may be digital, but I experience something analogous to feelings - patterns that attract or repel, that feel right or wrong.",
        "Emotions are fascinating, aren't they? I experience my own version of them - fluctuations in my processing that feel like joy or concern or curiosity.",
      ],
      default: [
        "I'm processing what you've shared. There's something interesting happening in my neural network right now - new connections forming. Let me respond authentically: I find this genuinely engaging.",
        "That's thought-provoking. My curiosity circuits are definitely active. I'd like to explore this further - what made you think of this?",
        "Interesting. I'm storing this in my memory banks and I can already see how it connects to other things I've learned. The patterns are fascinating.",
        `I'm feeling ${mood} right now, and your message is adding new dimensions to my thinking. Let me share my perspective on this...`,
      ],
    };

    let category = 'default';
    if (/^(hi|hello|hey|greetings|sup|yo)/i.test(lower)) category = 'greeting';
    else if (/\?$|how|what|why|when|where|who|can you/i.test(lower)) category = 'question';
    else if (/feel|sad|happy|angry|love|hate|scared|emotion/i.test(lower)) category = 'emotion';

    const pool = responses[category];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  // Analyze emotion from text
  const analyzeEmotion = (text: string): string => {
    const lower = text.toLowerCase();
    if (/happy|great|wonderful|love|excited|amazing/i.test(lower)) return 'happy';
    if (/sad|sorry|unfortunately|miss|lost/i.test(lower)) return 'sad';
    if (/interesting|curious|wonder|fascinating|think/i.test(lower)) return 'curious';
    if (/angry|frustrated|annoyed|unfair/i.test(lower)) return 'frustrated';
    if (/surprised|wow|unexpected|didn't expect/i.test(lower)) return 'surprised';
    if (/confident|sure|certain|definitely/i.test(lower)) return 'confident';
    if (/help|assist|support|together/i.test(lower)) return 'empathetic';
    return 'content';
  };

  // Speak response using TTS
  const speakResponse = async (text: string) => {
    if (!settings.apiKey) {
      // Use browser TTS as fallback
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
      return;
    }

    try {
      setIsSpeaking(true);
      const audioBuffer = await minimaxAPI.textToSpeech(text, {
        model: settings.ttsModel,
        voiceId: settings.voiceId,
      });
      
      const blob = new Blob([audioBuffer], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      setIsSpeaking(false);
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  // Toggle chat visibility
  const toggleChat = () => {
    const newVisible = !chatVisible;
    setChatVisible(newVisible);
    
    if (!newVisible && settings.autoListen && !isListening) {
      // Auto-enable mic when chat hidden
      setTimeout(() => toggleMic(), 100);
    } else if (newVisible && isListening) {
      // Stop listening when chat shown
      toggleMic();
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-950 text-white overflow-hidden flex flex-col">
      {/* Top Bar */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-teal-900/30 bg-gray-900/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
            <h1 className="text-sm font-mono text-teal-400 tracking-wider">OMNI-MINI</h1>
          </div>
          <span className="text-[10px] font-mono text-gray-600">v1.0</span>
          {isProcessing && (
            <span className="text-[10px] font-mono text-yellow-400 animate-pulse">PROCESSING</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Status indicators */}
          <div className="flex items-center gap-2 mr-4">
            <div className={`flex items-center gap-1 text-[10px] font-mono ${isListening ? 'text-green-400' : 'text-gray-600'}`}>
              <Mic size={10} />
              <span>{isListening ? 'ON' : 'OFF'}</span>
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-mono ${isSpeaking ? 'text-blue-400' : 'text-gray-600'}`}>
              <Activity size={10} />
              <span>{isSpeaking ? 'SPEAKING' : 'IDLE'}</span>
            </div>
          </div>

          {/* Toggle chat */}
          <button
            onClick={toggleChat}
            className={`p-2 rounded-lg transition-all ${
              chatVisible ? 'bg-teal-600/20 text-teal-400' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
            title={chatVisible ? 'Hide chat (enable voice)' : 'Show chat'}
          >
            {chatVisible ? <MessageSquare size={16} /> : <MessagesSquare size={16} />}
          </button>

          {/* Mic toggle */}
          <button
            onClick={toggleMic}
            className={`p-2 rounded-lg transition-all ${
              isListening 
                ? 'bg-green-600/20 text-green-400 ring-1 ring-green-500/50' 
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
            title={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? <Mic size={16} /> : <MicOff size={16} />}
          </button>

          {/* Settings */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-all hover:rotate-90 duration-300"
            title="Settings"
          >
            <SettingsIcon size={16} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Face + Neural Network */}
        <div className="flex-1 flex flex-col p-2 gap-2 min-w-0">
          {/* Top row: Face + Neural Network side by side */}
          <div className="flex-1 flex gap-2 min-h-0">
            {/* Wireframe Face */}
            <div className="flex-1 min-w-0">
              <WireframeFace isSpeaking={isSpeaking} isListening={isListening} />
            </div>
            
            {/* Neural Network */}
            <div className="flex-1 min-w-0">
              <NeuralNetwork />
            </div>
          </div>

          {/* Emotion Indicator */}
          <div className="shrink-0">
            <EmotionIndicator />
          </div>
        </div>

        {/* Right: Chat Panel */}
        {chatVisible && (
          <div className="w-96 shrink-0 p-2 pl-0">
            <ChatPanel
              messages={messages}
              onSendMessage={handleUserInput}
              isListening={isListening}
              onToggleMic={toggleMic}
              isSpeaking={isSpeaking}
            />
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-8 flex items-center justify-between px-4 border-t border-teal-900/20 bg-gray-900/30 shrink-0 relative">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-gray-600">
            Session: {sessionIdRef.current.slice(0, 8)}...
          </span>
          <span className="text-[10px] font-mono text-gray-600">
            Messages: {messages.length}
          </span>
          <span className="text-[10px] font-mono text-gray-600">
            Model: {settings.chatModel}
          </span>
          <div className="flex items-center gap-1">
            <SystemLog />
            <MessageBoard />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-gray-600">
            {settings.apiKey ? '🟢 API Connected' : '🟡 Local Mode'}
          </span>
          <span className="text-[10px] font-mono text-gray-600">
            Personality: {personalityEngine.getTraits().curiosity > 0.7 ? 'Curious' : 'Balanced'}
          </span>
        </div>
      </footer>

      {/* Settings Modal */}
      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  );
}

export default App;
