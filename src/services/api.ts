// API Service - 多模型统一调用
import type { Model } from '../types';

const TIMEOUT = 30000; // 30秒超时

export async function chatWithAI(
  model: Model,
  apiKey: string,
  messages: Array<{ role: string; content: string; timestamp?: number }>
): Promise<string> {
  switch (model.provider) {
    case 'openai':
      return chatWithOpenAI(model.id, apiKey, messages);
    case 'anthropic':
      return chatWithAnthropic(model.id, apiKey, messages);
    case 'deepseek':
      return chatWithDeepSeek(model.id, apiKey, messages);
    case 'moonshot':
      return chatWithMoonshot(model.id, apiKey, messages);
    default:
      throw new Error(`不支持的模型: ${model.provider}`);
  }
}

async function chatWithOpenAI(
  modelId: string,
  apiKey: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      max_tokens: 2000,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(TIMEOUT),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API错误');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function chatWithAnthropic(
  modelId: string,
  apiKey: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  // Anthropic需要特殊的消息格式
  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 2000,
      messages: userMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      })),
      system: systemMessage?.content,
    }),
    signal: AbortSignal.timeout(TIMEOUT),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Anthropic API错误');
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

async function chatWithDeepSeek(
  modelId: string,
  apiKey: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      max_tokens: 2000,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(TIMEOUT),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'DeepSeek API错误');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function chatWithMoonshot(
  modelId: string,
  apiKey: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      max_tokens: 2000,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(TIMEOUT),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Moonshot API错误');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}
