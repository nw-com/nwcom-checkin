// 主要應用程式邏輯

class NWComApp {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('西北勤務管理系統初始化中...');
        
        // 初始化Vanta背景
        this.initVantaBackground();
        
        // 設定全域事件監聽器
        this.setupGlobalEventListeners();
        
        // 設定響應式處理
        this.setupResponsiveHandlers();
        
        // 設定鍵盤快捷鍵
        this.setupKeyboardShortcuts();
        
        this.isInitialized = true;
        console.log('西北勤務管理系統初始化完成');
    }

    // 初始化Vanta背景
    initVantaBackground() {
        try {
            if (typeof VANTA !== 'undefined') {
                VANTA.WAVES({
                    el: "#vanta-bg",
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    scale: 1.00,
                    scaleMobile: 1.00,
                    color: 0xdc3545,
                    shininess: 30.00,
                    waveHeight: 15.00,
                    waveSpeed: 0.75,
                    zoom: 0.75
                });
                console.log('Vanta背景初始化成功');
            }
        } catch (error) {
            console.warn('Vanta背景初始化失敗:', error);
        }
    }

    // 設定全域事件監聽器
    setupGlobalEventListeners() {
        // 視窗大小改變事件
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });

        // 頁面載入完成事件
        window.addEventListener('load', () => {
            this.handlePageLoad();
        });

        // 頁面可見性改變事件
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // 點擊事件處理（用於關閉下拉選單等）
        document.addEventListener('click', (e) => {
            this.handleDocumentClick(e);
        });

        // 錯誤處理
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e);
        });

        // 未處理的Promise拒絕
        window.addEventListener('unhandledrejection', (e) => {
            this.handleUnhandledRejection(e);
        });
    }

    // 設定響應式處理
    setupResponsiveHandlers() {
        // 監聽媒體查詢
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        
        const handleMediaQueryChange = (e) => {
            if (e.matches) {
                // 手機版
                this.setupMobileLayout();
            } else {
                // 桌面版
                this.setupDesktopLayout();
            }
        };
        
        mediaQuery.addListener(handleMediaQueryChange);
        handleMediaQueryChange(mediaQuery); // 初始檢查
    }

    // 設定手機版佈局
    setupMobileLayout() {
        console.log('切換到手機版佈局');
        
        // 確保側邊欄預設是關閉的
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    // 設定桌面版佈局
    setupDesktopLayout() {
        console.log('切換到桌面版佈局');
        
        // 確保側邊欄是顯示的
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    // 設定鍵盤快捷鍵
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + / 顯示幫助
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                this.showHelp();
            }
            
            // ESC 關閉側邊欄/彈窗
            if (e.key === 'Escape') {
                this.closeAllModals();
                this.closeSidebar();
            }
            
            // Ctrl + L 登出
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                if (confirm('確定要登出嗎？')) {
                    authManager.logout();
                }
            }
        });
    }

    // 處理視窗大小改變
    handleWindowResize() {
        // 重新計算佈局
        this.adjustLayout();
        
        // 重新初始化Vanta背景（如果需要）
        if (document.getElementById('loginPage').style.display !== 'none') {
            setTimeout(() => {
                this.initVantaBackground();
            }, 100);
        }
    }

    // 處理頁面載入完成
    handlePageLoad() {
        console.log('頁面載入完成');
        
        // 移除載入動畫（如果有的話）
        const loadingElement = document.querySelector('.app-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // 顯示主要內容
        document.body.style.opacity = '1';
    }

    // 處理頁面可見性改變
    handleVisibilityChange() {
        if (document.hidden) {
            // 頁面隱藏
            console.log('應用程式進入背景');
        } else {
            // 頁面顯示
            console.log('應用程式回到前景');
            
            // 可以重新整理資料
            if (window.pageManager && window.currentUser) {
                // 重新載入當前頁面
                window.pageManager.loadPage(window.pageManager.currentPage);
            }
        }
    }

    // 處理文件點擊
    handleDocumentClick(e) {
        // 關閉所有下拉選單
        const dropdowns = document.querySelectorAll('.dropdown.open');
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });
    }

    // 處理全域錯誤
    handleGlobalError(e) {
        console.error('全域錯誤:', e.error);
        
        // 顯示友善的錯誤訊息
        if (e.error && e.error.message) {
            this.showErrorToast(`發生錯誤: ${e.error.message}`);
        }
    }

    // 處理未處理的Promise拒絕
    handleUnhandledRejection(e) {
        console.error('未處理的Promise拒絕:', e.reason);
        
        // 顯示友善的錯誤訊息
        if (e.reason && e.reason.message) {
            this.showErrorToast(`發生錯誤: ${e.reason.message}`);
        }
    }

    // 調整佈局
    adjustLayout() {
        const windowWidth = window.innerWidth;
        
        if (windowWidth <= 768) {
            this.setupMobileLayout();
        } else {
            this.setupDesktopLayout();
        }
    }

    // 關閉所有彈窗
    closeAllModals() {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            modal.classList.remove('show');
        });
        
        // 移除背景遮罩
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
    }

    // 關閉側邊欄
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    // 顯示錯誤提示
    showErrorToast(message) {
        // 創建錯誤提示元素
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;
        
        // 設定樣式
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            font-size: 14px;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        
        // 添加到頁面
        document.body.appendChild(toast);
        
        // 3秒後自動移除
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // 顯示成功提示
    showSuccessToast(message) {
        // 創建成功提示元素
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.textContent = message;
        
        // 設定樣式
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            font-size: 14px;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        
        // 添加到頁面
        document.body.appendChild(toast);
        
        // 3秒後自動移除
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // 顯示幫助
    showHelp() {
        const helpContent = `
            <div style="max-width: 500px;">
                <h4 style="color: #dc3545; margin-bottom: 15px;">鍵盤快捷鍵</h4>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 8px;"><kbd>Ctrl</kbd> + <kbd>/</kbd> - 顯示此幫助</li>
                    <li style="margin-bottom: 8px;"><kbd>ESC</kbd> - 關閉側邊欄/彈窗</li>
                    <li style="margin-bottom: 8px;"><kbd>Ctrl</kbd> + <kbd>L</kbd> - 登出</li>
                </ul>
                <hr style="margin: 15px 0;">
                <p style="color: #6c757d; font-size: 14px;">
                    如需更多幫助，請聯絡系統管理員。
                </p>
            </div>
        `;
        
        // 創建簡單的彈窗
        const modal = document.createElement('div');
        modal.className = 'help-modal';
        modal.innerHTML = `
            <div class="modal-content" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #dc3545;">系統幫助</h3>
                    <button onclick="this.closest('.help-modal').remove()" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #6c757d;
                    ">×</button>
                </div>
                ${helpContent}
            </div>
            <div class="modal-backdrop" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 9999;
            " onclick="this.parentElement.remove()"></div>
        `;
        
        document.body.appendChild(modal);
    }

    // 顯示載入中動畫
    showLoading(message = '載入中...') {
        const loading = document.createElement('div');
        loading.className = 'app-loading';
        loading.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 99999;
                color: white;
            ">
                <div class="loading" style="width: 40px; height: 40px; margin-bottom: 20px;"></div>
                <p style="font-size: 16px;">${message}</p>
            </div>
        `;
        
        document.body.appendChild(loading);
        return loading;
    }

    // 隱藏載入中動畫
    hideLoading(loadingElement) {
        if (loadingElement && loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }
    }
}

// 添加CSS動畫
const additionalStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    kbd {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 3px;
        padding: 2px 6px;
        font-size: 12px;
        font-family: monospace;
    }
`;

// 添加樣式到頁面
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// 初始化應用程式
const nwComApp = new NWComApp();

// 匯出給全域使用
window.nwComApp = nwComApp;

// 頁面載入完成後的處理
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM載入完成，應用程式準備就緒');
    
    // 設定頁面初始狀態
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    
    // 顯示載入完成
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// 重設密碼嘗試計數器
let resetPasswordClickCount = 0;
let resetPasswordTimeout = null;

// 重設密碼函數（連點版本號5次）
async function resetPasswordAttempts() {
    resetPasswordClickCount++;
    
    // 清除之前的計時器
    if (resetPasswordTimeout) {
        clearTimeout(resetPasswordTimeout);
    }
    
    // 設定新的計時器，3秒後重置計數
    resetPasswordTimeout = setTimeout(() => {
        resetPasswordClickCount = 0;
        console.log('重設密碼計數器已重置');
    }, 3000);
    
    console.log(`重設密碼點擊次數: ${resetPasswordClickCount}`);
    
    if (resetPasswordClickCount >= 5) {
        // 重置計數器
        resetPasswordClickCount = 0;
        
        // 顯示載入中
        const loading = nwComApp.showLoading('正在重設管理員密碼...');
        
        try {
            // 呼叫重設密碼功能
            const result = await authManager.resetAdminPasswordQuick();
            
            // 隱藏載入中
            nwComApp.hideLoading(loading);
            
            // 顯示成功訊息
            nwComApp.showSuccessToast(result.message);
            
            // 自動填入登入表單
            document.getElementById('username').value = result.username;
            document.getElementById('password').value = result.password;
            
            // 顯示提示
            setTimeout(() => {
                alert(`管理員帳號已重設完成！\n\n使用者名稱: ${result.username}\n密碼: ${result.password}\n\n請點擊登入按鈕登入系統。`);
            }, 500);
            
        } catch (error) {
            // 隱藏載入中
            nwComApp.hideLoading(loading);
            
            console.error('重設密碼失敗:', error);
            nwComApp.showError('重設密碼失敗: ' + error.message);
            
            // 嘗試建立測試帳號作為備案
            try {
                const testResult = await authManager.createTestAccount();
                nwComApp.showSuccessToast(testResult.message);
                
                // 自動填入登入表單
                document.getElementById('username').value = testResult.username;
                document.getElementById('password').value = testResult.password;
                
            } catch (testError) {
                console.error('建立測試帳號也失敗:', testError);
                alert('無法重設密碼或建立測試帳號，請聯絡系統管理員。');
            }
        }
    } else if (resetPasswordClickCount >= 3) {
        // 點擊3次後顯示提示
        nwComApp.showSuccessToast(`再點擊 ${5 - resetPasswordClickCount} 次即可重設管理員密碼`);
    }
}