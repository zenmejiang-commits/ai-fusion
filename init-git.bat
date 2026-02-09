@echo off
cd /d "%~dp0"
echo AI Fusion - Git初始化脚本

echo [1/5] 初始化Git仓库...
git init

echo [2/5] 添加文件...
git add .

echo [3/5] 提交...
git commit -m "Initial commit: AI Fusion Chrome Extension

Features:
- Multi-model support (GPT/Claude/DeepSeek/Kimi)
- Sidebar chat interface
- Context menu actions (summarize/translate/improve)
- Local storage with IndexedDB
- Dark mode UI"

echo [4/5] 创建主分支...
git branch -M main

echo.
echo 请输入你的GitHub仓库URL (例如: https://github.com/用户名/ai-fusion.git)
echo 或者按Enter跳过，稍后手动推送
echo.
set /p repo_url="GitHub仓库URL: "

if not "%repo_url%"=="" (
    echo [5/5] 添加远程仓库并推送...
    git remote add origin "%repo_url%"
    git push -u origin main
    echo 完成！仓库已推送至GitHub
) else (
    echo.
    echo 已跳过远程推送。
    echo 稍后可以手动执行:
    echo   git remote add origin https://github.com/用户名/ai-fusion.git
    echo   git push -u origin main
)

echo.
echo ========== 下一步 ==========
echo 1. 安装依赖: npm install
echo 2. 开发测试: npm run dev
echo 3. 构建发布: npm run build
echo 4. Chrome加载: 打开 chrome://extensions 选择 dist 文件夹
echo.
pause
