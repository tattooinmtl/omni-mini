// MiniMax API Service - Integrates all MiniMax models
// Base URL: https://api.minimax.io

export interface MiniMaxConfig {
  apiKey: string;
  chatModel: string;
  ttsModel: string;
  imageModel: string;
  videoModel: string;
}

const DEFAULT_CONFIG: MiniMaxConfig = {
  apiKey: '',
  chatModel: 'MiniMax-M3.1-Flash-Preview',
  ttsModel: 'speech-2.8-hd',
  imageModel: 'image-01',
  videoModel: 'MiniMax-H3',
};

export class MiniMaxAPI {
  private config: MiniMaxConfig;
  private baseUrl = 'https://api.minimax.io';

  constructor(config?: Partial<MiniMaxConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  setApiKey(key: string) {
    this.config.apiKey = key;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  // ========== CHAT / TEXT GENERATION ==========
  // Models: MiniMax-M3.1-Flash-Preview, MiniMax-M3, MiniMax-M2.7, MiniMax-M2.5, etc.
  // OpenAI-compatible endpoint
  
  async chatCompletion(
    messages: Array<{ role: string; content: string }>,
    options?: {
      stream?: boolean;
      temperature?: number;
      maxTokens?: number;
      tools?: any[];
      model?: string;
    }
  ): Promise<{ content: string; toolCalls?: any[] }> {
    if (!this.config.apiKey) throw new Error('API key not set');

    const model = options?.model || this.config.chatModel;
    
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.8,
        max_tokens: options?.maxTokens ?? 2048,
        stream: options?.stream ?? false,
        tools: options?.tools,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`MiniMax API Error: ${error}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    
    return {
      content: choice?.message?.content || '',
      toolCalls: choice?.message?.tool_calls,
    };
  }

  async *chatCompletionStream(
    messages: Array<{ role: string; content: string }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    }
  ): AsyncGenerator<string> {
    if (!this.config.apiKey) throw new Error('API key not set');

    const model = options?.model || this.config.chatModel;
    
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.8,
        max_tokens: options?.maxTokens ?? 2048,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`MiniMax API Error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch {}
        }
      }
    }
  }

  // ========== TEXT-TO-SPEECH ==========
  // Models: speech-2.8-hd, speech-2.8-turbo, speech-2.6-hd, speech-2.6-turbo
  // Endpoint: /v1/t2a_v2

  async textToSpeech(
    text: string,
    options?: {
      voiceId?: string;
      model?: string;
      speed?: number;
      vol?: number;
      pitch?: number;
      languageBoost?: string;
    }
  ): Promise<ArrayBuffer> {
    if (!this.config.apiKey) throw new Error('API key not set');

    const model = options?.model || this.config.ttsModel;
    
    const response = await fetch(`${this.baseUrl}/v1/t2a_v2`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model,
        text,
        voice_setting: {
          voice_id: options?.voiceId || 'male-qn-qingse',
          speed: options?.speed ?? 1.0,
          vol: options?.vol ?? 1.0,
          pitch: options?.pitch ?? 0,
        },
        audio_setting: {
          format: 'mp3',
          sample_rate: 32000,
        },
        language_boost: options?.languageBoost,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TTS API Error: ${error}`);
    }

    return response.arrayBuffer();
  }

  // ========== IMAGE GENERATION ==========
  // Model: image-01
  // Endpoint: /v1/image_generation

  async generateImage(
    prompt: string,
    options?: {
      model?: string;
      width?: number;
      height?: number;
      n?: number;
    }
  ): Promise<{ images: string[]; taskId?: string }> {
    if (!this.config.apiKey) throw new Error('API key not set');

    const model = options?.model || this.config.imageModel;
    
    const response = await fetch(`${this.baseUrl}/v1/image_generation`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model,
        prompt,
        width: options?.width || 1024,
        height: options?.height || 1024,
        n: options?.n || 1,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Image API Error: ${error}`);
    }

    const data = await response.json();
    return {
      images: data.data?.map((d: any) => d.url) || [],
      taskId: data.task_id,
    };
  }

  // ========== VIDEO GENERATION ==========
  // Models: MiniMax-H3, MiniMax-H3-Max
  // Endpoint: /v1/video/generation

  async createVideoTask(
    content: Array<{ type: string; text?: string; image?: string }>,
    options?: {
      model?: string;
      resolution?: string;
      duration?: number;
    }
  ): Promise<{ taskId: string }> {
    if (!this.config.apiKey) throw new Error('API key not set');

    const model = options?.model || this.config.videoModel;
    
    const response = await fetch(`${this.baseUrl}/v1/video/generation`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model,
        content,
        resolution: options?.resolution || '768p',
        duration: options?.duration || 6,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Video API Error: ${error}`);
    }

    const data = await response.json();
    return { taskId: data.task_id };
  }

  async queryVideoTask(taskId: string): Promise<{ status: string; url?: string }> {
    if (!this.config.apiKey) throw new Error('API key not set');

    const response = await fetch(`${this.baseUrl}/v1/video/query?task_id=${taskId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Video Query Error: ${error}`);
    }

    const data = await response.json();
    return {
      status: data.status,
      url: data.content?.url,
    };
  }

  // ========== VOICE CLONING ==========
  
  async uploadCloneAudio(audioFile: File): Promise<{ fileId: string }> {
    if (!this.config.apiKey) throw new Error('API key not set');

    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('purpose', 'voice_clone');

    const response = await fetch(`${this.baseUrl}/v1/files/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.config.apiKey}` },
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return { fileId: data.file?.id };
  }

  async cloneVoice(fileId: string, voiceName: string): Promise<{ voiceId: string }> {
    if (!this.config.apiKey) throw new Error('API key not set');

    const response = await fetch(`${this.baseUrl}/v1/voice_clone`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        file_id: fileId,
        voice_name: voiceName,
      }),
    });

    if (!response.ok) throw new Error('Clone failed');
    const data = await response.json();
    return { voiceId: data.voice_id };
  }

  // ========== VOICE DESIGN ==========
  
  async designVoice(description: string): Promise<{ voiceId: string }> {
    if (!this.config.apiKey) throw new Error('API key not set');

    const response = await fetch(`${this.baseUrl}/v1/voice_design`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        description,
      }),
    });

    if (!response.ok) throw new Error('Voice design failed');
    const data = await response.json();
    return { voiceId: data.voice_id };
  }

  // ========== AVAILABLE MODELS ==========
  
  getAvailableModels() {
    return {
      chat: [
        { id: 'MiniMax-M3.1-Flash-Preview', name: 'M3.1 Flash Preview', desc: 'Frontier multimodal coding, 1M context, tunable thinking' },
        { id: 'MiniMax-M3', name: 'M3', desc: 'Frontier multimodal coding, 1M context, 100+ tps' },
        { id: 'MiniMax-M2.7', name: 'M2.7', desc: 'Recursive self-improvement, 60 tps' },
        { id: 'MiniMax-M2.7-highspeed', name: 'M2.7 Highspeed', desc: 'Same as M2.7, ~100 tps' },
        { id: 'MiniMax-M2.5', name: 'M2.5', desc: 'Peak performance, 60 tps' },
        { id: 'MiniMax-M2.5-highspeed', name: 'M2.5 Highspeed', desc: 'Same as M2.5, ~100 tps' },
      ],
      tts: [
        { id: 'speech-2.8-hd', name: 'Speech 2.8 HD', desc: 'Ultra-realistic, sound tags' },
        { id: 'speech-2.8-turbo', name: 'Speech 2.8 Turbo', desc: 'Fast, natural flow' },
        { id: 'speech-2.6-hd', name: 'Speech 2.6 HD', desc: 'Outstanding prosody, cloning' },
        { id: 'speech-2.6-turbo', name: 'Speech 2.6 Turbo', desc: '40 languages support' },
      ],
      image: [
        { id: 'image-01', name: 'Image-01', desc: 'High-quality, fine-grained details' },
      ],
      video: [
        { id: 'MiniMax-H3', name: 'H3', desc: 'Multimodal video, 768P/2K, 4-15s' },
        { id: 'MiniMax-H3-Max', name: 'H3-Max', desc: 'Fast generation, 480P/768P' },
      ],
    };
  }
}

export const minimaxAPI = new MiniMaxAPI();
