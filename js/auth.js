// 認證管理系統
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.init();
    }

    init() {
        // 監聽認證狀態變化
        firebaseApp.auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.loadUserRole(user.uid);
            } else {
                this.currentUser = null;
                this.userRole = null;
                this.showLoginPage();
            }
        });
    }

    // 載入使用者角色
    async loadUserRole(userId) {
        try {
            const userDoc = await firebaseApp.db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                this.userRole = userData.role;
                this.updateUI();
                this.showMainPage();
            } else {
                // 新使用者，設定預設角色
                await this.createNewUser(userId);
            }
        } catch (error) {
            console.error('載入使用者角色失敗:', error);
            this.showLoginError('系統錯誤，請聯絡管理員');
        }
    }

    // 建立新使用者
    async createNewUser(userId) {
        try {
            // 預設為勤務人員角色
            const userData = {
                role: 'staff',
                name: this.currentUser.email.split('@')[0],
                email: this.currentUser.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await firebaseApp.db.collection('users').doc(userId).set(userData);
            this.userRole = 'staff';
            this.updateUI();
            this.showMainPage();
        } catch (error) {
            console.error('建立新使用者失敗:', error);
        }
    }

    // 登入
    async login(email, password) {
        try {
            const result = await firebaseApp.auth.signInWithEmailAndPassword(email, password);
            return result.user;
        } catch (error) {
            console.error('登入失敗:', error);
            throw error;
        }
    }

    // 登出
    async logout() {
        try {
            await firebaseApp.auth.signOut();
            this.currentUser = null;
            this.userRole = null;
            this.showLoginPage();
        } catch (error) {
            console.error('登出失敗:', error);
        }
    }

    // 更新使用者資訊
    async updateUserProfile(name, email, newPassword) {
        try {
            const updates = {};
            
            if (name) {
                updates.name = name;
            }
            
            if (email && email !== this.currentUser.email) {
                await this.currentUser.updateEmail(email);
                updates.email = email;
            }
            
            if (newPassword) {
                await this.currentUser.updatePassword(newPassword);
            }
            
            if (Object.keys(updates).length > 0) {
                await firebaseApp.db.collection('users').doc(this.currentUser.uid).update(updates);
            }
            
            return true;
        } catch (error) {
            console.error('更新使用者資訊失敗:', error);
            throw error;
        }
    }

    // 更新 UI
    updateUI() {
        if (this.currentUser && this.userRole) {
            document.getElementById('user-name').textContent = this.currentUser.email;
            document.getElementById('user-role').textContent = this.getRoleDisplayName(this.userRole);
        }
    }

    // 取得角色顯示名稱
    getRoleDisplayName(role) {
        const roleNames = {
            'admin': '系統管理員',
            'manager': '高階主管',
            'supervisor': '初階主管',
            'staff': '勤務人員'
        };
        return roleNames[role] || role;
    }

    // 顯示登入頁面
    showLoginPage() {
        document.getElementById('login-page').classList.remove('hidden');
        document.getElementById('main-page').classList.add('hidden');
    }

    // 顯示主頁面
    showMainPage() {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        
        // 載入儀表板資料
        if (window.dashboardManager) {
            window.dashboardManager.loadDashboardData();
        }
    }

    // 顯示登入錯誤
    showLoginError(message) {
        const errorElement = document.getElementById('login-error');
        errorElement.textContent = message;
        setTimeout(() => {
            errorElement.textContent = '';
        }, 5000);
    }

    // 檢查權限
    hasPermission(requiredRole) {
        if (!this.userRole) return false;
        
        const roleHierarchy = {
            'staff': 1,
            'supervisor': 2,
            'manager': 3,
            'admin': 4
        };
        
        const userLevel = roleHierarchy[this.userRole] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;
        
        return userLevel >= requiredLevel;
    }
}

// 初始化認證管理器
window.authManager = new AuthManager();