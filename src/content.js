// Content Script - 右键菜单处理
// 注意：由于浏览器安全限制，content script无法直接访问window.reactFlow等库
// 这里实现简化的选中文字处理

let isSidePanelOpen = false;

// 监听来自background的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action && request.text) {
    handleAIAction(request.action, request.text);
  }
});

async function handleAIAction(action: string, text: string) {
  try {
    // 从storage获取API key和设置
    const settings = await chrome.storage.local.get(['apiKeys', 'defaultModel', 'lastModel']);
    const apiKey = settings.apiKeys?.[settings.defaultModel?.provider || 'openai'];
    
    if (!apiKey) {
      showNotification('请先在设置中配置API Key');
      return;
    }
    
    // 显示加载状态
    showNotification('AI处理中...', 'loading');
    
    // 调用API处理选中文字
    let result = '';
    const model = settings.defaultModel || 'gpt-3.5-turbo';
    
    switch (action) {
      case 'ai-fusion-summarize':
        result = await summarizeText(apiKey, text, model);
        break;
      case 'ai-fusion-translate':
        result = await translateText(apiKey, text, model);
        break;
      case 'ai-fusion-improve':
        result = await improveText(apiKey, text, model);
        break;
      default:
        throw new Error('未知操作');
    }
    
    // 显示结果
    showResultModal(result);
    showNotification('处理完成！', 'success');
    
  } catch (error) {
    console.error('AI Action Error:', error);
    showNotification(`错误: ${error instanceof Error ? error.message : '处理失败'}`);
  }
}

async function summarizeText(apiKey: string, text: string, model: string): Promise<string> {
  const response = await callAI(apiKey, model, [
    { role: 'user', content: `请用中文总结以下内容（100字以内）：\n\n${text}` }
  ]);
  return response;
}

async function translateText(apiKey: string, text: string, model: string): Promise<string> {
  const response = await callAI(apiKey, model, [
    { role: 'user', content: `请将以下内容翻译成中文，保持原文格式：\n\n${text}` }
  ]);
  return response;
}

async function improveText(apiKey: string, text: string, model: string): Promise<string> {
  const response = await callAI(apiKey, model, [
    { role: 'user', content: `请优化以下文字，使其更清晰、简洁、专业：\n\n${text}` }
  ]);
  return response;
}

async function callAI(
  apiKey: string, 
  model: string, 
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  // 简化的API调用（实际项目中需要根据不同provider调用不同API）
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model.includes('gpt') ? model : 'gpt-3.5-turbo',
      messages,
      max_tokens: 1000,
    }),
  });
  
  if (!response.ok) {
    throw new Error('API调用失败');
  }
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '无结果';
}

function showNotification(message: string, type: 'loading' | 'success' | 'error' = 'success') {
  // 创建通知元素
  const notification = document.createElement('div');
  notification.className = `ai-fusion-notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === 'error' ? '#ef4444' : type === 'loading' ? '#3b82f6' : '#22c55e'};
    color: white;
    border-radius: 8px;
    font-size: 14px;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100px)';
    notification.style.transition = 'all 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function showResultModal(content: string) {
  // 移除已存在的modal
  const existing = document.querySelector('.ai-fusion-result-modal');
  if (existing) existing.remove();
  
  const modal = document.createElement('div');
  modal.className = 'ai-fusion-result-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>AI处理结果</h3>
        <button class="close-btn">&times;</button>
      </div>
      <div class="modal-body">${content.replace(/\n/g, '<br>')}</div>
      <div class="modal-footer">
        <button class="copy-btn">复制</button>
        <button class="close-btn2">关闭</button>
      </div>
    </div>
  `;
  
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
  `;
  
  const contentEl = modal.querySelector('.modal-content') as HTMLElement;
  contentEl.style.cssText = `
    background: #1a1a2e;
    border-radius: 12px;
    padding: 20px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
  `;
  
  document.body.appendChild(modal);
  
  // 事件处理
  modal.querySelector('.close-btn')?.addEventListener('click', () => modal.remove());
  modal.querySelector('.close-btn2')?.addEventListener('click', () => modal.remove());
  modal.querySelector('.copy-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(content);
    showNotification('已复制到剪贴板');
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(100px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;
document.head.appendChild(style);
