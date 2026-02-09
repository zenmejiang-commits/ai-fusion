# AI Fusion - 多模型AI聚合插件

<div align="center">

![Chrome Version](https://img.shields.io/badge/Chrome-≥90-blue?style=for-the-badge&logo=google-chrome)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**免费的多模型AI聚合插件 - 使用自己的API Key**

[English](./README_EN.md) | [中文](./README.md)

</div>

---

## ✨ 特性

- 🤖 **多模型支持**: GPT-4 | GPT-3.5 | Claude-3 | DeepSeek | Kimi
- 💬 **侧边栏对话**: 随时呼出AI助手
- 🖱️ **右键菜单**: 选中文字 → AI总结/翻译/优化
- 💾 **本地存储**: 对话历史安全保存在本地
- 🔒 **隐私保护**: API Key本地加密，不上传服务器
- 🎨 **深色模式**: 护眼设计

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式

```bash
npm run dev
```

### 3. 构建发布版

```bash
npm run build
```

### 4. 在Chrome中加载

1. 打开 `chrome://extensions`
2. 开启 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择 `dist` 文件夹

---

## 📖 使用指南

### 配置API Key

1. 点击插件图标，打开侧边栏
2. 点击 ⚙️ **设置**
3. 输入你的API Key
4. 选择默认模型
5. 点击 **保存**

### 快捷键

| 操作 | 说明 |
|------|------|
| 打开侧边栏 | 点击插件图标 |
| 发送消息 | Enter |
| 换行 | Shift+Enter |

### 右键菜单

在任意网页选中文字，右键菜单提供：

- **AI总结**: 快速总结选中内容
- **AI翻译**: 翻译成中文
- **AI优化**: 优化文字表达

---

## 🛠️ 技术栈

- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Vite 5** - 构建工具
- **IndexedDB** - 本地存储
- **Chrome Extension API** - 插件功能

---

## 📁 项目结构

```
ai-fusion/
├── src/
│   ├── manifest.json      # 插件配置
│   ├── background.js      # 后台服务
│   ├── content.js        # 右键菜单
│   ├── App.tsx          # 主界面
│   ├── services/
│   │   ├── api.ts       # API调用
│   │   └── storage.ts   # 数据存储
│   └── types.ts         # 类型定义
├── public/
│   └── icons/           # 图标资源
└── package.json
```

---

## 🔧 添加新模型

在 `src/services/api.ts` 中添加：

```typescript
async function chatWithNewProvider(
  modelId: string,
  apiKey: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  // 实现API调用
}
```

在 `src/App.tsx` 的 `MODELS` 对象中添加配置：

```typescript
const MODELS: Record<string, Model> = {
  'new-model': { 
    name: '新模型', 
    provider: 'newprovider', 
    maxTokens: 4000 
  },
};
```

---

## 📝 更新日志

### v1.0.0 (2024.02)
- ✨ 初始版本
- 🤖 支持4个AI模型
- 💬 侧边栏聊天
- 🖱️ 右键菜单功能
- 💾 本地存储

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

<div align="center">

**如果对你有帮助，欢迎给个 ⭐ Star！**

</div>
