@echo off
echo 🚀 啟動西北勤務管理系統本地測試伺服器...
echo.

REM 檢查Python是否可用
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ 使用 Python 啟動伺服器...
    python -m http.server 8000
) else (
    echo ❌ Python 未找到，嘗試使用 Node.js...
    
    REM 檢查Node.js是否可用
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo ✅ 使用 Node.js 啟動伺服器...
        npx http-server -p 8000
    ) else (
        echo ❌ Node.js 也未找到
        echo.
        echo 💡 替代方案：
        echo    1. 直接雙擊開啟 test.html 查看系統介紹
        echo    2. 使用瀏覽器開啟 index.html （部分功能可能受限）
        echo    3. 安裝 Python 或 Node.js 後再試
        echo.
        pause
    )
)

echo.
echo 🌐 伺服器已啟動！
echo 📱 請開啟瀏覽器訪問：http://localhost:8000
echo.
pause