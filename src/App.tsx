import { useState, useEffect } from 'react';
import { getConversations, saveConversation, getSettings, saveSettings } from './services/storage';
import { chatWithAI } from './services/api';
import type { Message, Conversation, Model } from './types';
import './App.css';

const MODELS: Record<string, Model> = {
  'gpt-4': { id: 'gpt-4', name: 'GPT-4', provider: 'openai', maxTokens: 8192 },
  'gpt-3.5-turbo': { id: 'gpt-3.5-turbo', name: 'GPT-3.5', provider: 'openai', maxTokens: 4096 },
  'claude-3-sonnet': { id: 'claude-3-sonnet', name: 'Claude-3-Sonnet', provider: 'anthropic', maxTokens: 200000 },
  'deepseek-chat': { id: 'deepseek-chat', name: 'DeepSeek', provider: 'deepseek', maxTokens: 16384 },
  'moonshot-v1-8k': { id: 'moonshot-v1-8k', name: 'Kimi', provider: 'moonshot', maxTokens: 8192 },
};

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentModel, setCurrentModel] = useState('gpt-3.5-turbo');
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const savedConvs = await getConversations();
    const savedSettings = await getSettings();
    
    if (Array.isArray(savedConvs)) {
      setConversations(savedConvs);
    }
    setApiKeys(savedSettings.apiKeys || {});
    if (savedSettings.defaultModel) {
      setCurrentModel(savedSettings.defaultModel);
    }
  }

  async function handleSend() {
    if (!input.trim() || isLoading) return;
    
    const model = MODELS[currentModel];
    const apiKey = apiKeys[model.provider];
    
    if (!apiKey) {
      alert(`请先在设置中配置 ${model.name} 的API Key`);
      setShowSettings(true);
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAI(model, apiKey, [...messages, userMessage]);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // 保存到历史
      const newConversation: Conversation = {
        id: Date.now().toString(),
        model: currentModel,
        messages: [...messages, userMessage, assistantMessage],
        createdAt: Date.now()
      };
      
      setConversations(prev => [newConversation, ...prev.slice(0, 9)]);
      await saveConversation(newConversation);
      
    } catch (error) {
      console.error('API Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `错误: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveSettings(newKeys: Record<string, string>, defaultModel: string) {
    setApiKeys(newKeys);
    setCurrentModel(defaultModel);
    await saveSettings({ apiKeys: newKeys, defaultModel });
    setShowSettings(false);
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🤖 AI Fusion</h1>
        <select 
          value={currentModel} 
          onChange={(e) => setCurrentModel(e.target.value)}
          className="model-select"
        >
          {Object.entries(MODELS).map(([id, model]) => (
            <option key={id} value={id}>{model.name}</option>
          ))}
        </select>
        <button onClick={() => setShowSettings(true)} className="settings-btn">⚙️</button>
      </header>

      {showSettings && (
        <SettingsPanel 
          apiKeys={apiKeys}
          currentModel={currentModel}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      <div className="chat-container">
        <div className="messages">
          {messages.length === 0 ? (
            <div className="welcome">
              <p>👋 欢迎使用 AI Fusion</p>
              <p>选择模型，配置API Key，开始对话</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="message-content">{msg.content}</div>
              </div>
            ))
          )}
          {isLoading && <div className="loading">思考中...</div>}
        </div>

        <div className="input-area">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="输入消息... (Enter发送，Shift+Enter换行)"
            rows={3}
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()}>
            发送
          </button>
        </div>
      </div>

      {conversations.length > 0 && (
        <div className="history">
          <h3>历史对话</h3>
          {conversations.slice(0, 5).map(conv => (
            <div key={conv.id} className="history-item" onClick={() => {
              setMessages(conv.messages);
              setCurrentModel(conv.model);
            }}>
              <span>{MODELS[conv.model]?.name}</span>
              <span className="time">{new Date(conv.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsPanel({ 
  apiKeys, 
  currentModel, 
  onSave, 
  onClose 
}: { 
  apiKeys: Record<string, string>;
  currentModel: string;
  onSave: (keys: Record<string, string>, model: string) => void;
  onClose: () => void;
}) {
  const [keys, setKeys] = useState(apiKeys);
  const [model, setModel] = useState(currentModel);

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <h2>⚙️ API设置</h2>
        <p>您的API Key本地加密存储，不会发送到我们的服务器</p>
        
        <div className="form-group">
          <label>OpenAI API Key</label>
          <input
            type="password"
            value={keys.openai || ''}
            onChange={(e) => setKeys({...keys, openai: e.target.value})}
            placeholder="sk-..."
          />
        </div>
        
        <div className="form-group">
          <label>Anthropic API Key</label>
          <input
            type="password"
            value={keys.anthropic || ''}
            onChange={(e) => setKeys({...keys, anthropic: e.target.value})}
            placeholder="sk-ant-..."
          />
        </div>
        
        <div className="form-group">
          <label>DeepSeek API Key</label>
          <input
            type="password"
            value={keys.deepseek || ''}
            onChange={(e) => setKeys({...keys, deepseek: e.target.value})}
            placeholder="sk-..."
          />
        </div>
        
        <div className="form-group">
          <label>Moonshot (Kimi) API Key</label>
          <input
            type="password"
            value={keys.moonshot || ''}
            onChange={(e) => setKeys({...keys, moonshot: e.target.value})}
            placeholder="sk-..."
          />
        </div>
        
        <div className="form-group">
          <label>默认模型</label>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="gpt-3.5-turbo">GPT-3.5</option>
            <option value="gpt-4">GPT-4</option>
            <option value="claude-3-sonnet">Claude-3-Sonnet</option>
            <option value="deepseek-chat">DeepSeek</option>
            <option value="moonshot-v1-8k">Kimi</option>
          </select>
        </div>
        
        <div className="buttons">
          <button onClick={onClose}>取消</button>
          <button onClick={() => onSave(keys, model)} className="primary">保存</button>
        </div>
      </div>
    </div>
  );
}

export default App;
