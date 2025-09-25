/**
 * 快速重設管理員密碼腳本
 * 這個腳本會自動重設管理員密碼並提供新的登入資訊
 */

// 自動執行重設功能
async function autoResetPassword() {
    console.log('🔄 開始自動重設管理員密碼...');
    
    try {
        // 等待 Firebase 初始化
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 嘗試重設管理員密碼
        console.log('🔑 嘗試重設 ADMIN001 密碼...');
        const result = await authManager.resetAdminPasswordQuick();
        console.log('✅ 管理員密碼重設成功！');
        
        // 顯示登入資訊
        showLoginInfo('ADMIN001', 'Admin123!');
        
    } catch (error) {
        console.log('❌ 管理員密碼重設失敗:', error.message);
        
        // 嘗試建立測試帳號
        console.log('👤 嘗試建立測試帳號...');
        try {
            await authManager.createTestAccount();
            console.log('✅ 測試帳號建立成功！');
            showLoginInfo('TEST001', 'Test123!');
        } catch (testError) {
            console.error('❌ 測試帳號建立也失敗:', testError.message);
            showError('所有重設方法都失敗了，請手動檢查系統設定。');
        }
    }
}

// 顯示登入資訊
function showLoginInfo(username, password) {
    console.log('');
    console.log('🎉 重設成功！請使用以下資訊登入：');
    console.log('═══════════════════════════════════════');
    console.log(`👤 使用者名稱：${username}`);
    console.log(`🔑 密碼：${password}`);
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('💡 登入後請立即修改密碼以確保安全！');
    console.log('📍 登入頁面：index.html');
    console.log('');
    
    // 創建顯示框
    const loginBox = document.createElement('div');
    loginBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        text-align: center;
        font-family: 'Microsoft JhengHei', Arial, sans-serif;
        max-width: 400px;
        width: 90%;
    `;
    
    loginBox.innerHTML = `
        <div style="margin-bottom: 20px;">
            <i class="fas fa-check-circle" style="font-size: 48px; color: #28a745; margin-bottom: 15px;"></i>
            <h2 style="color: #28a745; margin: 0;">密碼重設成功！</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
            <div style="margin-bottom: 10px;">
                <strong>使用者名稱：</strong>
                <span style="color: #dc3545; font-weight: bold;">${username}</span>
            </div>
            <div>
                <strong>密碼：</strong>
                <span style="color: #dc3545; font-weight: bold;">${password}</span>
            </div>
        </div>
        <div style="margin-bottom: 20px;">
            <p style="color: #6c757d; margin: 0;">請使用以上資訊登入系統</p>
            <p style="color: #dc3545; margin: 10px 0; font-weight: bold;">登入後請立即修改密碼！</p>
        </div>
        <button onclick="window.location.href='index.html'" style="
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            margin-right: 10px;
        ">前往登入</button>
        <button onclick="this.parentElement.parentElement.remove()" style="
            background: #6c757d;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
        ">關閉</button>
    `;
    
    document.body.appendChild(loginBox);
}

// 顯示錯誤
function showError(message) {
    console.error('❌', message);
    alert('錯誤：' + message + '\n\n請嘗試手動重設或聯繫技術支援。');
}

// 頁面載入後自動執行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoResetPassword);
} else {
    // 如果頁面已經載入，等待 2 秒讓 Firebase 初始化
    setTimeout(autoResetPassword, 2000);
}

console.log('🚀 快速重設腳本已載入，等待執行...');