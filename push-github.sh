#!/bin/bash
# AI Fusion - Git初始化并推送到GitHub

echo "🚀 AI Fusion - Git推送脚本"
echo "=========================="

# 初始化Git（如果尚未初始化）
if [ ! -d ".git" ]; then
    echo "[1/4] 初始化Git仓库..."
    git init
    git add .
    git commit -m "Initial commit: AI Fusion Chrome Extension

Features:
- Multi-model support (GPT/Claude/DeepSeek/Kimi)
- Sidebar chat interface
- Context menu actions (summarize/translate/improve)
- Local storage with IndexedDB
- Dark mode UI"
    git branch -M main
else
    echo "[1/4] Git仓库已存在，跳过初始化"
fi

echo "[2/4] 添加远程仓库..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/zenmejiang-commits/ai-fusion.git

echo "[3/4] 拉取并合并..."
git fetch origin main 2>/dev/null
if [ $? -eq 0 ]; then
    git merge origin/main --allow-unrelated-histories -m "Merge from GitHub"
else
    echo "远程仓库为空，直接推送"
fi

echo "[4/4] 推送到GitHub..."
git push -u origin main

echo ""
echo "=========================="
echo "✅ 完成！"
echo "仓库地址: https://github.com/zenmejiang-commits/ai-fusion"
echo ""
echo "下一步:"
echo "1. 安装依赖: npm install"
echo "2. 开发测试: npm run dev"
echo "3. 构建发布: npm run build"
