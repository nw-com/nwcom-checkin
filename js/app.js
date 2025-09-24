// 主應用程式
class App {
    constructor() {
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        console.log('🚀 西北勤務管理系統初始化中...');
        
        // 創建背景粒子效果
        this.createParticles();
        
        // 載入記住的電子郵件
        this.loadRememberedEmail();
        
        this.setupEventListeners();
        this.setupNavigation();
        
        console.log('✅ 系統初始化完成！');
    }

    // 創建背景粒子效果
    createParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;
        
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    // 載入記住的電子郵件
    loadRememberedEmail() {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            const emailInput = document.getElementById('email');
            const rememberMeCheckbox = document.getElementById('remember-me');
            if (emailInput) {
                emailInput.value = rememberedEmail;
            }
            if (rememberMeCheckbox) {
                rememberMeCheckbox.checked = true;
            }
        }
    }

    // 設定事件監聽器
    setupEventListeners() {
        // 登入表單
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // 登出按鈕
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // 設定表單
        const settingsForm = document.getElementById('settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSettingsUpdate();
            });
        }
    }

    // 設定導航
    setupNavigation() {
        const navLinks = document.querySelectorAll('.sidebar-menu a[data-page]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateToPage(page);
            });
        });
    }

    // 處理登入
    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginButton = document.getElementById('login-button');
        const loginText = document.getElementById('login-text');
        const errorMessage = document.getElementById('error-message');
        const successMessage = document.getElementById('success-message');
        const rememberMe = document.getElementById('remember-me');

        try {
            // 隱藏之前的訊息
            errorMessage.classList.remove('show');
            successMessage.classList.remove('show');
            
            if (!email || !password) {
                errorMessage.textContent = '請輸入電子郵件和密碼';
                errorMessage.classList.add('show');
                return;
            }

            // 顯示載入狀態
            loginButton.classList.add('loading');
            loginText.textContent = '登入中...';

            // 處理記住我功能
            if (rememberMe && rememberMe.checked) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            await window.authManager.login(email, password);
            
            // 顯示成功訊息
            successMessage.textContent = '登入成功！正在跳轉...';
            successMessage.classList.add('show');
            
        } catch (error) {
            console.error('登入錯誤:', error);
            let errorMessageText = '登入失敗';
            
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessageText = '電子郵件格式錯誤';
                    break;
                case 'auth/user-disabled':
                    errorMessageText = '帳號已被停用';
                    break;
                case 'auth/user-not-found':
                    errorMessageText = '找不到此帳號';
                    break;
                case 'auth/wrong-password':
                    errorMessageText = '密碼錯誤';
                    break;
                default:
                    errorMessageText = '登入失敗，請稍後再試';
            }
            
            errorMessage.textContent = errorMessageText;
            errorMessage.classList.add('show');
            
        } finally {
            // 重置按鈕狀態
            if (loginButton) {
                loginButton.classList.remove('loading');
                loginText.textContent = '登入系統';
            }
        }
    }

    // 處理登出
    async handleLogout() {
        try {
            await window.authManager.logout();
            this.currentPage = 'dashboard';
        } catch (error) {
            console.error('登出錯誤:', error);
        }
    }

    // 導航到指定頁面
    navigateToPage(page) {
        // 檢查權限
        if (!window.authManager.hasPermission(page, 'view')) {
            alert('您沒有權限訪問此頁面');
            return;
        }

        // 隱藏所有頁面
        const allPages = document.querySelectorAll('.content-page');
        allPages.forEach(p => p.classList.add('hidden'));

        // 顯示目標頁面
        const targetPage = document.getElementById(page);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            this.currentPage = page;
            
            // 更新導航選單的啟用狀態
            this.updateNavigationState(page);
            
            // 載入頁面特定資料
            this.loadPageData(page);
        }
    }

    // 更新導航選單狀態
    updateNavigationState(activePage) {
        const navLinks = document.querySelectorAll('.sidebar-menu a[data-page]');
        navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (page === activePage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // 載入頁面資料
    loadPageData(page) {
        switch (page) {
            case 'dashboard':
                if (window.dashboardManager) {
                    window.dashboardManager.loadDashboardData();
                }
                break;
            case 'checkin':
                if (window.checkinManager) {
                    window.checkinManager.init();
                }
                break;
            case 'schedule':
                if (window.scheduleManager) {
                    window.scheduleManager.loadSchedule();
                }
                break;
            case 'analytics':
                if (window.analyticsManager) {
                    window.analyticsManager.loadAnalytics();
                }
                break;
        }
    }

    // 處理設定更新
    async handleSettingsUpdate() {
        const name = document.getElementById('settings-name').value;
        const email = document.getElementById('settings-email').value;
        const newPassword = document.getElementById('settings-new-password').value;

        try {
            await window.authManager.updateUserProfile(name, email, newPassword);
            alert('設定更新成功！');
            
            // 清空密碼欄位
            document.getElementById('settings-new-password').value = '';
            
        } catch (error) {
            console.error('設定更新失敗:', error);
            alert('設定更新失敗：' + error.message);
        }
    }

    // 顯示錯誤訊息
    showError(message) {
        alert('錯誤：' + message);
    }

    // 顯示成功訊息
    showSuccess(message) {
        alert('成功：' + message);
    }

    // 顯示載入中狀態
    showLoading(elementId, show = true) {
        const element = document.getElementById(elementId);
        if (element) {
            if (show) {
                element.innerHTML = '<div class="loading"></div>';
            }
        }
    }

    // 格式化日期時間
    formatDateTime(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // 格式化日期
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    // 取得今天的日期字串
    getTodayDateString() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }
}

// 初始化應用程式
window.app = new App();