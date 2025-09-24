// 帳號設定管理系統
class SettingsManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadUserSettings();
        this.setupEventListeners();
    }

    // 設定事件監聽器
    setupEventListeners() {
        const settingsForm = document.getElementById('settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSettingsUpdate();
            });
        }
    }

    // 載入使用者設定
    async loadUserSettings() {
        try {
            const user = window.authManager.currentUser;
            if (!user) return;

            // 從 Firestore 載入使用者資料
            const userDoc = await firebaseApp.db.collection('users').doc(user.uid).get();
            const userData = userDoc.data() || {};

            // 填充表單
            this.populateSettingsForm(userData);
            
        } catch (error) {
            console.error('載入使用者設定失敗:', error);
            window.app.showError('載入設定失敗');
        }
    }

    // 填充設定表單
    populateSettingsForm(userData) {
        const nameInput = document.getElementById('settings-name');
        const emailInput = document.getElementById('settings-email');

        if (nameInput) {
            nameInput.value = userData.name || '';
        }
        
        if (emailInput) {
            emailInput.value = userData.email || window.authManager.currentUser.email || '';
        }
    }

    // 處理設定更新
    async handleSettingsUpdate() {
        try {
            const name = document.getElementById('settings-name').value.trim();
            const email = document.getElementById('settings-email').value.trim();
            const newPassword = document.getElementById('settings-new-password').value;

            // 驗證輸入
            if (!name) {
                alert('請輸入姓名');
                return;
            }

            if (!email || !this.isValidEmail(email)) {
                alert('請輸入有效的電子郵件地址');
                return;
            }

            // 更新使用者資料
            await this.updateUserProfile(name, email, newPassword);
            
            // 顯示成功訊息
            window.app.showSuccess('設定更新成功！');
            
            // 清空密碼欄位
            document.getElementById('settings-new-password').value = '';
            
        } catch (error) {
            console.error('設定更新失敗:', error);
            window.app.showError('設定更新失敗：' + error.message);
        }
    }

    // 更新使用者檔案
    async updateUserProfile(name, email, newPassword) {
        const user = window.authManager.currentUser;
        if (!user) {
            throw new Error('使用者未登入');
        }

        const updates = {};
        
        // 更新顯示名稱
        if (name) {
            updates.name = name;
            await user.updateProfile({ displayName: name });
        }
        
        // 更新電子郵件
        if (email && email !== user.email) {
            updates.email = email;
            await user.updateEmail(email);
        }
        
        // 更新密碼
        if (newPassword) {
            if (newPassword.length < 6) {
                throw new Error('密碼長度至少需 6 個字元');
            }
            await user.updatePassword(newPassword);
        }
        
        // 更新 Firestore 中的使用者資料
        if (Object.keys(updates).length > 0) {
            updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await firebaseApp.db.collection('users').doc(user.uid).update(updates);
        }

        // 更新 UI
        window.authManager.updateUI();
    }

    // 驗證電子郵件格式
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // 變更密碼
    async changePassword(currentPassword, newPassword) {
        try {
            const user = window.authManager.currentUser;
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
            
            return true;
        } catch (error) {
            console.error('變更密碼失敗:', error);
            throw error;
        }
    }

    // 重設密碼
    async resetPassword(email) {
        try {
            await firebaseApp.auth.sendPasswordResetEmail(email);
            return true;
        } catch (error) {
            console.error('重設密碼失敗:', error);
            throw error;
        }
    }

    // 更新通知設定
    async updateNotificationSettings(settings) {
        try {
            const user = window.authManager.currentUser;
            if (!user) {
                throw new Error('使用者未登入');
            }

            await firebaseApp.db.collection('users').doc(user.uid).update({
                notificationSettings: settings,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return true;
        } catch (error) {
            console.error('更新通知設定失敗:', error);
            throw error;
        }
    }

    // 取得通知設定
    async getNotificationSettings() {
        try {
            const user = window.authManager.currentUser;
            if (!user) {
                throw new Error('使用者未登入');
            }

            const userDoc = await firebaseApp.db.collection('users').doc(user.uid).get();
            const userData = userDoc.data() || {};
            
            return userData.notificationSettings || {
                emailNotifications: true,
                pushNotifications: false,
                scheduleReminders: true,
                alertNotifications: true
            };
        } catch (error) {
            console.error('取得通知設定失敗:', error);
            throw error;
        }
    }

    // 匯出使用者資料
    async exportUserData() {
        try {
            const user = window.authManager.currentUser;
            if (!user) {
                throw new Error('使用者未登入');
            }

            // 收集使用者相關的所有資料
            const userData = {
                profile: null,
                checkins: [],
                schedules: [],
                alerts: []
            };

            // 使用者檔案
            const userDoc = await firebaseApp.db.collection('users').doc(user.uid).get();
            userData.profile = userDoc.data();

            // 打卡記錄
            const checkinsSnapshot = await firebaseApp.db
                .collection('checkins')
                .where('userId', '==', user.uid)
                .orderBy('checkinTimestamp', 'desc')
                .limit(100)
                .get();

            checkinsSnapshot.forEach(doc => {
                userData.checkins.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // 排班資料
            const schedulesSnapshot = await firebaseApp.db
                .collection('schedules')
                .where('staffId', '==', user.uid)
                .orderBy('date', 'desc')
                .limit(100)
                .get();

            schedulesSnapshot.forEach(doc => {
                userData.schedules.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // 異常提醒
            const alertsSnapshot = await firebaseApp.db
                .collection('alerts')
                .where('userId', '==', user.uid)
                .orderBy('timestamp', 'desc')
                .limit(100)
                .get();

            alertsSnapshot.forEach(doc => {
                userData.alerts.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // 轉換為 JSON 並下載
            const jsonData = JSON.stringify(userData, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `user_data_${user.uid}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('匯出使用者資料失敗:', error);
            throw error;
        }
    }

    // 刪除帳號
    async deleteAccount() {
        try {
            const user = window.authManager.currentUser;
            if (!user) {
                throw new Error('使用者未登入');
            }

            // 確認刪除
            if (!confirm('確定要刪除帳號嗎？此操作無法復原，所有資料將被永久刪除。')) {
                return false;
            }

            // 要求重新驗證
            const password = prompt('請輸入您的密碼以確認刪除帳號：');
            if (!password) {
                return false;
            }

            // 重新驗證
            const credential = firebase.auth.EmailAuthProvider.credential(
                user.email,
                password
            );
            await user.reauthenticateWithCredential(credential);

            // 刪除 Firestore 中的使用者資料
            await firebaseApp.db.collection('users').doc(user.uid).delete();

            // 刪除打卡記錄
            const checkinsSnapshot = await firebaseApp.db
                .collection('checkins')
                .where('userId', '==', user.uid)
                .get();

            const batch = firebaseApp.db.batch();
            checkinsSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            // 刪除使用者帳號
            await user.delete();

            // 登出
            await window.authManager.logout();

            return true;
        } catch (error) {
            console.error('刪除帳號失敗:', error);
            throw error;
        }
    }
}

// 初始化設定管理器
window.settingsManager = new SettingsManager();

// 添加設定頁面的額外功能
const settingsHTML = `
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
        <h4>其他設定</h4>
        <div style="margin-top: 15px;">
            <button onclick="window.settingsManager.exportUserData()" class="btn btn-info" style="margin-right: 10px;">
                <i class="fas fa-download"></i> 匯出我的資料
            </button>
            <button onclick="window.settingsManager.deleteAccount()" class="btn btn-danger">
                <i class="fas fa-user-times"></i> 刪除帳號
            </button>
        </div>
    </div>
`;

// 在設定頁面載入後添加額外功能
setTimeout(() => {
    const settingsContainer = document.querySelector('.settings-container');
    if (settingsContainer) {
        settingsContainer.insertAdjacentHTML('beforeend', settingsHTML);
    }
}, 1000);