// 儀表板管理系統
class DashboardManager {
    constructor() {
        this.refreshInterval = null;
        this.init();
    }

    init() {
        this.setupAutoRefresh();
    }

    // 載入儀表板資料
    async loadDashboardData() {
        try {
            this.showLoading(true);
            
            // 同時載入多項資料
            const [
                activeStaffCount,
                todayAttendanceCount,
                alertsCount
            ] = await Promise.all([
                this.getActiveStaffCount(),
                this.getTodayAttendanceCount(),
                this.getAlertsCount()
            ]);

            // 更新顯示
            this.updateDashboardDisplay({
                activeStaffCount,
                todayAttendanceCount,
                alertsCount
            });

            this.showLoading(false);
        } catch (error) {
            console.error('載入儀表板資料失敗:', error);
            this.showLoading(false);
            window.app.showError('載入儀表板資料失敗');
        }
    }

    // 取得在勤人數
    async getActiveStaffCount() {
        try {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            
            // 查詢今天的打卡記錄，找出目前還在勤的人員
            const checkinSnapshot = await firebaseApp.db
                .collection('checkins')
                .where('date', '==', today)
                .where('checkoutTime', '==', null) // 還沒有簽退
                .get();

            return checkinSnapshot.size;
        } catch (error) {
            console.error('取得在勤人數失敗:', error);
            return 0;
        }
    }

    // 取得今日出勤人數
    async getTodayAttendanceCount() {
        try {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            
            // 查詢今天有打卡記錄的獨特使用者
            const checkinSnapshot = await firebaseApp.db
                .collection('checkins')
                .where('date', '==', today)
                .get();

            // 使用 Set 來取得獨特的使用者 ID
            const uniqueUsers = new Set();
            checkinSnapshot.forEach(doc => {
                const data = doc.data();
                uniqueUsers.add(data.userId);
            });

            return uniqueUsers.size;
        } catch (error) {
            console.error('取得今日出勤人數失敗:', error);
            return 0;
        }
    }

    // 取得異常提醒數量
    async getAlertsCount() {
        try {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            
            // 查詢今天的異常記錄
            const alertsSnapshot = await firebaseApp.db
                .collection('alerts')
                .where('date', '==', today)
                .where('status', '==', 'active')
                .get();

            return alertsSnapshot.size;
        } catch (error) {
            console.error('取得異常提醒數量失敗:', error);
            return 0;
        }
    }

    // 更新儀表板顯示
    updateDashboardDisplay(data) {
        const { activeStaffCount, todayAttendanceCount, alertsCount } = data;

        // 更新統計卡片
        const activeStaffElement = document.getElementById('active-staff');
        if (activeStaffElement) {
            activeStaffElement.textContent = activeStaffCount;
        }

        const todayAttendanceElement = document.getElementById('today-attendance');
        if (todayAttendanceElement) {
            todayAttendanceElement.textContent = todayAttendanceCount;
        }

        const alertsElement = document.getElementById('alerts');
        if (alertsElement) {
            alertsElement.textContent = alertsCount;
            
            // 如果有異常提醒，添加警告樣式
            if (alertsCount > 0) {
                alertsElement.parentElement.classList.add('alert-active');
            } else {
                alertsElement.parentElement.classList.remove('alert-active');
            }
        }
    }

    // 設定自動重新整理
    setupAutoRefresh() {
        // 每 30 秒自動重新整理一次
        this.refreshInterval = setInterval(() => {
            if (window.authManager.currentUser && 
                window.app.currentPage === 'dashboard') {
                this.loadDashboardData();
            }
        }, 30000);
    }

    // 顯示載入狀態
    showLoading(show) {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            const statInfo = card.querySelector('.stat-info span');
            if (statInfo) {
                if (show) {
                    statInfo.innerHTML = '<div class="loading"></div>';
                }
            }
        });
    }

    // 建立異常提醒
    async createAlert(alertData) {
        try {
            const now = new Date();
            const alert = {
                ...alertData,
                date: now.toISOString().split('T')[0],
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'active'
            };

            await firebaseApp.db.collection('alerts').add(alert);
            
            // 重新載入儀表板資料
            this.loadDashboardData();
            
        } catch (error) {
            console.error('建立異常提醒失敗:', error);
            throw error;
        }
    }

    // 解決異常提醒
    async resolveAlert(alertId) {
        try {
            await firebaseApp.db.collection('alerts').doc(alertId).update({
                status: 'resolved',
                resolvedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // 重新載入儀表板資料
            this.loadDashboardData();
            
        } catch (error) {
            console.error('解決異常提醒失敗:', error);
            throw error;
        }
    }

    // 取得最近的異常提醒
    async getRecentAlerts(limit = 5) {
        try {
            const alertsSnapshot = await firebaseApp.db
                .collection('alerts')
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            const alerts = [];
            alertsSnapshot.forEach(doc => {
                alerts.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return alerts;
        } catch (error) {
            console.error('取得最近異常提醒失敗:', error);
            return [];
        }
    }

    // 清理資源
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
}

// 初始化儀表板管理器
window.dashboardManager = new DashboardManager();

// 添加 CSS 樣式來顯示異常狀態
const style = document.createElement('style');
style.textContent = `
    .stat-card.alert-active {
        background-color: #fff3cd;
        border: 2px solid #ffc107;
    }
    
    .stat-card.alert-active i {
        color: #dc3545;
    }
`;
document.head.appendChild(style);