// 侧边栏事件监听
chrome.sidePanel.setOptions({
  path: 'sidepanel.html',
  enabled: true
});

// 右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'ai-fusion-summarize',
    title: 'AI总结选中文字',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'ai-fusion-translate',
    title: 'AI翻译选中文字',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'ai-fusion-improve',
    title: 'AI优化选中文字',
    contexts: ['selection']
  });
});

// 右键菜单点击处理
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = info.selectionText;
  
  if (selectedText) {
    // 打开侧边栏并发送消息
    chrome.sidePanel.open({ tabId: tab.id });
    chrome.tabs.sendMessage(tab.id, {
      action: info.menuItemId,
      text: selectedText
    });
  }
});

// 消息转发（content script <-> side panel）
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (sender.tab) {
    // 来自content script，转发到side panel
    chrome.runtime.sendMessage(request);
  } else {
    // 来自side panel，转发到active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, request);
      }
    });
  }
});
