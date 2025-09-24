@echo off
echo 🚀 西北勤務管理系統 - 快速部署
echo =================================
echo.

REM 檢查git
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git 未安裝，請先安裝 Git
    echo 📥 下載地址：https://git-scm.com/download/win
    pause
    exit /b 1
)

echo ✅ Git 已安裝
echo.

REM 初始化git倉庫（如果不存在）
if not exist .git (
    echo 📁 初始化 Git 倉庫...
    git init
    echo.
)

REM 添加所有檔案
echo 📂 添加檔案到 Git...
git add .
echo.

REM 提交更改
echo 📝 提交更改...
git commit -m "西北勤務管理系統 - 自動部署" 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  暫無新更改需要提交
)
echo.

REM 檢查是否有遠程倉庫
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔗 設置遠程倉庫...
    echo.
    echo 📋 請先在 GitHub 創建新倉庫，然後複製倉庫 URL
    echo 💡 URL 格式：https://github.com/您的用戶名/倉庫名.git
    echo.
    set /p repo_url="請輸入 GitHub 倉庫 URL："
    git remote add origin %repo_url%
    echo.
    echo 📤 推送到 GitHub...
    git push -u origin main 2>nul || git push -u origin master
) else (
    echo 📤 更新到 GitHub...
    git push origin main 2>nul || git push origin master
)

echo.
echo 🎯 部署步驟完成！
echo.
echo 📋 接下來：
echo 1. 登入 GitHub → 您的倉庫 → Settings → Pages
echo 2. Source 選擇 "Deploy from a branch"
echo 3. Branch 選擇 "main" 或 "master"
echo 4. 點擊 Save
echo.
echo ⏰ 等待 2-5 分鐘後訪問：
echo https://[您的用戶名].github.io/[倉庫名]/
echo.
echo 🔧 然後：
echo 1. 打開 firebase-setup.html 完成 Firebase 設定
echo 2. 使用預設帳號登入測試系統
echo.
echo 🎉 恭喜！您的勤務管理系統即將上線！
echo.
pause