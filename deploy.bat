@echo off
echo 🚀 西北勤務管理系統 - GitHub Pages 部署工具
echo ==================================================
echo.

REM 檢查git是否安裝
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git 未安裝，請先安裝 Git
    pause
    exit /b 1
)

echo ✅ Git 已安裝
echo.

REM 檢查當前目錄是否為git倉庫
git rev-parse --git-dir >nul 2>&1
if %errorlevel% neq 0 (
    echo 📁 初始化 Git 倉庫...
    git init
    echo.
    
    echo 📝 創建初始提交...
    git add .
    git commit -m "初始提交：西北勤務管理系統完整版"
    echo.
    
    echo 🔗 設置遠程倉庫...
    set /p repo_url="請輸入您的GitHub倉庫URL（例如：https://github.com/yourname/nwcom-checkin.git）："
    git remote add origin %repo_url%
    
    echo 📤 推送到GitHub...
    git push -u origin main
) else (
    echo ✅ Git 倉庫已存在
    echo.
    echo 📤 更新代碼到GitHub...
    git add .
    git commit -m "更新：西北勤務管理系統功能完善"
    git push
)

echo.
echo 🎯 部署步驟完成！
echo.
echo 📋 接下來請完成以下步驟：
echo 1. 登入 GitHub 並進入您的倉庫
echo 2. 點擊 Settings → Pages
echo 3. Source 選擇 "Deploy from a branch"
echo 4. Branch 選擇 "main" 和 "/ (root)"
echo 5. 點擊 Save
echo.
echo ⏰ 等待幾分鐘後，您的系統將在以下網址可用：
echo https://[您的用戶名].github.io/[倉庫名稱]/
echo.
echo 🔧 下一步：設定 Firebase
echo 請參考 README.md 中的 Firebase 設定指南
echo.
pause