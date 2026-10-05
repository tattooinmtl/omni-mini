import { useState } from 'react';
import { X, Key, Mic, Brain, MessageSquare, Volume2 } from 'lucide-react';
import { minimaxAPI } from '../services/MiniMaxAPI';
import { PERSONALITY_PRESETS } from '../engines/PersonalityEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    apiKey: string;
    chatModel: string;
    ttsModel: string;
    voiceId: string;
    personalityPreset: string;
    autoListen: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

export default function Settings({ isOpen, onClose, settings, onSettingsChange }: Props) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [testStatus, setTestStatus] = useState('');
  const models = minimaxAPI.getAvailableModels();

  if (!isOpen) return null;

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleTestConnection = async () => {
    setTestStatus('Testing...');
    try {
      minimaxAPI.setApiKey(localSettings.apiKey);
      const result = await minimaxAPI.chatCompletion([
        { role: 'user', content: 'Say "Connection successful" in one sentence.' }
      ], { maxTokens: 20 });
      setTestStatus(`✓ Connected: "${result.content.slice(0, 50)}"`);
    } catch (err: any) {
      setTestStatus(`✗ Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[85vh] bg-gray-900 border border-teal-800/40 rounded-2xl overflow-hidden shadow-2xl shadow-teal-900/20">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-teal-900/30 bg-gray-900/80">
          <h2 className="text-lg font-mono text-teal-400 flex items-center gap-2">
            <Brain size={20} />
            OMNI-MINI SETTINGS
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)] space-y-6">
          {/* API Key */}
          <section className="space-y-3">
            <h3 className="text-sm font-mono text-teal-300 flex items-center gap-2">
              <Key size={14} /> API Configuration
            </h3>
            <div className="space-y-2">
              <input
                type="password"
                value={localSettings.apiKey}
                onChange={e => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                placeholder="Enter MiniMax API Key"
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 font-mono"
              />
              <button
                onClick={handleTestConnection}
                className="px-4 py-2 bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/30 rounded-lg text-teal-400 text-sm transition-all"
              >
                Test Connection
              </button>
              {testStatus && (
                <p className={`text-xs font-mono ${testStatus.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
                  {testStatus}
                </p>
              )}
            </div>
          </section>

          {/* Chat Model */}
          <section className="space-y-3">
            <h3 className="text-sm font-mono text-teal-300 flex items-center gap-2">
              <MessageSquare size={14} /> Chat Model
            </h3>
            <select
              value={localSettings.chatModel}
              onChange={e => setLocalSettings({ ...localSettings, chatModel: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/50"
            >
              {models.chat.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} - {m.desc}
                </option>
              ))}
            </select>
          </section>

          {/* TTS Model */}
          <section className="space-y-3">
            <h3 className="text-sm font-mono text-teal-300 flex items-center gap-2">
              <Volume2 size={14} /> Speech Model
            </h3>
            <select
              value={localSettings.ttsModel}
              onChange={e => setLocalSettings({ ...localSettings, ttsModel: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/50"
            >
              {models.tts.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} - {m.desc}
                </option>
              ))}
            </select>
            <div>
              <label className="text-xs text-gray-400 font-mono block mb-1">Voice ID</label>
              <input
                type="text"
                value={localSettings.voiceId}
                onChange={e => setLocalSettings({ ...localSettings, voiceId: e.target.value })}
                placeholder="male-qn-qingse"
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 font-mono"
              />
            </div>
          </section>

          {/* Personality */}
          <section className="space-y-3">
            <h3 className="text-sm font-mono text-teal-300 flex items-center gap-2">
              <Brain size={14} /> Personality Preset
            </h3>
            <select
              value={localSettings.personalityPreset}
              onChange={e => setLocalSettings({ ...localSettings, personalityPreset: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/50"
            >
              {Object.entries(PERSONALITY_PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.name} - {preset.description}
                </option>
              ))}
            </select>
          </section>

          {/* Voice Settings */}
          <section className="space-y-3">
            <h3 className="text-sm font-mono text-teal-300 flex items-center gap-2">
              <Mic size={14} /> Voice Settings
            </h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.autoListen}
                onChange={e => setLocalSettings({ ...localSettings, autoListen: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-300">Auto-enable microphone when chat is hidden</span>
            </label>
          </section>

          {/* Available Models Info */}
          <section className="space-y-3">
            <h3 className="text-sm font-mono text-teal-300">Available MiniMax Models</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                <p className="text-xs text-purple-400 font-mono mb-1">IMAGE</p>
                <p className="text-xs text-gray-400">image-01 - High-quality generation</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                <p className="text-xs text-orange-400 font-mono mb-1">VIDEO</p>
                <p className="text-xs text-gray-400">H3 / H3-Max - Multimodal video</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-teal-900/30 flex justify-end gap-3 bg-gray-900/80">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-teal-600/30 hover:bg-teal-600/50 border border-teal-500/40 rounded-lg text-teal-300 text-sm font-mono transition-all"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
