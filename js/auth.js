// 身份驗證相關功能

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.rememberMe = false;
        this.init();
    }

    init() {
        // 檢查本地儲存的登入資訊
        this.checkStoredCredentials();
        
        // 綁定登入表單事件
        this.bindLoginEvents();
        
        // 監聽認證狀態變化
        this.setupAuthStateListener();
    }

    // 綁定登入表單事件
    bindLoginEvents() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // 記住我功能
        const rememberMeCheckbox = document.getElementById('rememberMe');
        if (rememberMeCheckbox) {
            rememberMeCheckbox.addEventListener('change', (e) => {
                this.rememberMe = e.target.checked;
            });
        }
    }

    // 設定認證狀態監聽器
    setupAuthStateListener() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                // 使用者已登入
                await this.onUserLogin(user);
            } else {
                // 使用者已登出
                this.onUserLogout();
            }
        });
    }

    // 處理登入
    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('loginError');

        // 清除之前的錯誤訊息
        errorElement.textContent = '';

        // 驗證輸入
        if (!username || !password) {
            errorElement.textContent = '請輸入帳號和密碼';
            return;
        }

        try {
            // 顯示載入狀態
            const loginBtn = document.querySelector('.login-btn');
            const originalText = loginBtn.innerHTML;
            loginBtn.innerHTML = '<div class="loading"></div> 登入中...';
            loginBtn.disabled = true;

            // 嘗試登入
            const userCredential = await auth.signInWithEmailAndPassword(
                `${username}@nwcom.com`, 
                password
            );

            // 獲取使用者資料
            const userDoc = await db.collection('users').doc(username).get();
            
            if (!userDoc.exists) {
                throw new Error('使用者資料不存在，請聯絡系統管理員');
            }

            const userData = userDoc.data();
            
            // 檢查使用者狀態
            if (userData.status !== 'active') {
                throw new Error('帳號已被停用，請聯絡系統管理員');
            }

            // 儲存當前使用者資料
            this.currentUser = userData;
            
            // 處理記住我功能
            if (this.rememberMe) {
                localStorage.setItem('rememberedUser', username);
            } else {
                localStorage.removeItem('rememberedUser');
            }

            // 記錄登入時間
            await this.recordLoginActivity(username);

            // 登入成功
            console.log('登入成功:', userData);
            
        } catch (error) {
            console.error('登入失敗:', error);
            
            let errorMessage = '登入失敗，請檢查帳號密碼是否正確';
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = '帳號不存在';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = '密碼錯誤';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = '嘗試次數過多，請稍後再試';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            errorElement.textContent = errorMessage;
            
            // 恢復按鈕狀態
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
    }

    // 使用者登入後處理
    async onUserLogin(user) {
        try {
            // 更新UI
            this.updateUIForLoggedInUser();
            
            // 載入使用者儀表板
            window.pageManager.loadPage('dashboard');
            
            console.log('使用者登入完成:', this.currentUser);
            
        } catch (error) {
            console.error('登入後處理失敗:', error);
            this.showError('登入後處理失敗，請重新整理頁面');
        }
    }

    // 使用者登出處理
    onUserLogout() {
        this.currentUser = null;
        this.updateUIForLoggedOutUser();
        console.log('使用者已登出');
    }

    // 登出功能
    async logout() {
        try {
            // 記錄登出活動
            if (this.currentUser) {
                await this.recordLogoutActivity(this.currentUser.employeeId);
            }
            
            // 執行Firebase登出
            await auth.signOut();
            
            // 清除本地資料
            this.currentUser = null;
            sessionStorage.clear();
            
            console.log('登出成功');
            
        } catch (error) {
            console.error('登出失敗:', error);
            this.showError('登出失敗，請稍後再試');
        }
    }

    // 更新UI為登入狀態
    updateUIForLoggedInUser() {
        // 隱藏登入頁面
        document.getElementById('loginPage').style.display = 'none';
        
        // 顯示主頁面
        document.getElementById('mainPage').style.display = 'flex';
        
        // 更新使用者資訊
        if (this.currentUser) {
            document.getElementById('userDisplayName').textContent = this.currentUser.name;
            document.getElementById('userRole').textContent = firebaseUtils.getRoleDisplayName(this.currentUser.role);
        }
        
        // 根據角色權限更新導航
        this.updateNavigationByRole();
    }

    // 更新UI為登出狀態
    updateUIForLoggedOutUser() {
        // 顯示登入頁面
        document.getElementById('loginPage').style.display = 'flex';
        
        // 隱藏主頁面
        document.getElementById('mainPage').style.display = 'none';
        
        // 重置表單
        document.getElementById('loginForm').reset();
        document.getElementById('loginError').textContent = '';
    }

    // 根據角色更新導航
    updateNavigationByRole() {
        if (!this.currentUser) return;
        
        const navItems = document.querySelectorAll('.nav-item[data-page]');
        const userRole = this.currentUser.role;
        const allowedPages = PERMISSIONS[userRole] || [];
        
        navItems.forEach(item => {
            const page = item.getAttribute('data-page');
            if (page && !allowedPages.includes(page)) {
                item.style.display = 'none';
            } else {
                item.style.display = 'flex';
            }
        });
    }

    // 檢查儲存的憑證
    checkStoredCredentials() {
        const rememberedUser = localStorage.getItem('rememberedUser');
        if (rememberedUser) {
            document.getElementById('username').value = rememberedUser;
            document.getElementById('rememberMe').checked = true;
            this.rememberMe = true;
        }
    }

    // 記錄登入活動
    async recordLoginActivity(userId) {
        try {
            const loginData = {
                userId: userId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                action: 'login',
                ip: await this.getClientIP(),
                userAgent: navigator.userAgent
            };
            
            await db.collection('loginLogs').add(loginData);
            console.log('登入活動已記錄');
            
        } catch (error) {
            console.error('記錄登入活動失敗:', error);
        }
    }

    // 記錄登出活動
    async recordLogoutActivity(userId) {
        try {
            const logoutData = {
                userId: userId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                action: 'logout',
                ip: await this.getClientIP(),
                userAgent: navigator.userAgent
            };
            
            await db.collection('loginLogs').add(logoutData);
            console.log('登出活動已記錄');
            
        } catch (error) {
            console.error('記錄登出活動失敗:', error);
        }
    }

    // 獲取客戶端IP（簡單版本）
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('獲取IP失敗:', error);
            return 'unknown';
        }
    }

    // 顯示錯誤訊息
    showError(message) {
        const errorElement = document.getElementById('loginError');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    // 檢查是否已登入
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // 獲取當前使用者
    getCurrentUser() {
        return this.currentUser;
    }

    // 更新使用者資料
    async updateUserData(userId, updateData) {
        try {
            await db.collection('users').doc(userId).update(updateData);
            
            // 更新本地資料
            if (this.currentUser && this.currentUser.employeeId === userId) {
                this.currentUser = { ...this.currentUser, ...updateData };
            }
            
            console.log('使用者資料更新成功');
            return true;
            
        } catch (error) {
            console.error('更新使用者資料失敗:', error);
            throw error;
        }
    }

    // 修改密碼
    async changePassword(currentPassword, newPassword) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('使用者未登入');
            }

            // 重新驗證使用者
            const credential = firebase.auth.EmailAuthProvider.credential(
                user.email,
                currentPassword
            );
            
            await user.reauthenticateWithCredential(credential);
            
            // 更新密碼
            await user.updatePassword(newPassword);
            
            console.log('密碼修改成功');
            return true;
            
        } catch (error) {
            console.error('修改密碼失敗:', error);
            
            let errorMessage = '修改密碼失敗';
            
            if (error.code === 'auth/wrong-password') {
                errorMessage = '目前密碼錯誤';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = '新密碼強度不足，請使用至少6個字元';
            }
            
            throw new Error(errorMessage);
        }
    }
}

// 初始化身份驗證管理器
const authManager = new AuthManager();

// 全域函數
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

function logout() {
    if (confirm('確定要登出嗎？')) {
        authManager.logout();
    }
}

function showUserProfile() {
    // 切換到個人資訊頁面
    if (window.pageManager) {
        window.pageManager.loadPage('personal');
    }
}

// 匯出給全域使用
window.authManager = authManager;