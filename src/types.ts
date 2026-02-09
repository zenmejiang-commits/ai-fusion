export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  model: string;
  messages: Message[];
  createdAt: number;
}

export interface Model {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'deepseek' | 'moonshot';
  maxTokens: number;
}

export interface Settings {
  apiKeys: Record<string, string>;
  defaultModel: string;
  theme: 'light' | 'dark';
}
