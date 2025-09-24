// 數據分析管理系統
class AnalyticsManager {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAnalyticsData();
    }

    // 設定事件監聽器
    setupEventListeners() {
        // 日期範圍選擇器
        const dateRange = document.getElementById('analytics-date-range');
        if (dateRange) {
            dateRange.addEventListener('change', () => {
                this.loadAnalyticsData();
            });
        }

        // 匯出報表按鈕
        const exportBtn = document.getElementById('export-report');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportReport();
            });
        }

        // 更新報表按鈕
        const updateBtn = document.getElementById('update-analytics');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => {
                this.loadAnalyticsData();
            });
        }
    }

    // 載入分析數據
    async loadAnalyticsData() {
        try {
            this.showLoading(true);
            
            const dateRange = this.getDateRange();
            const userRole = window.authManager.currentUserRole;
            const userId = window.authManager.currentUser?.uid;

            // 根據角色載入不同的數據
            let checkinData, scheduleData, userData;

            if (userRole === 'admin' || userRole === 'manager') {
                // 管理員和經理可以看到所有數據
                checkinData = await this.loadAllCheckinData(dateRange);
                scheduleData = await this.loadAllScheduleData(dateRange);
                userData = await this.loadUserStatistics();
            } else {
                // 其他人只能看到自己的數據
                checkinData = await this.loadUserCheckinData(userId, dateRange);
                scheduleData = await this.loadUserScheduleData(userId, dateRange);
                userData = await this.loadUserPersonalStatistics(userId);
            }

            // 更新統計卡片
            this.updateStatisticsCards(checkinData, scheduleData, userData);

            // 更新圖表
            this.updateCharts(checkinData, scheduleData, userData);

            // 更新詳細表格
            this.updateDetailTables(checkinData, scheduleData);

            this.showLoading(false);
            
        } catch (error) {
            console.error('載入分析數據失敗:', error);
            this.showLoading(false);
            window.app.showError('載入分析數據失敗');
        }
    }

    // 取得日期範圍
    getDateRange() {
        const dateRangeSelect = document.getElementById('analytics-date-range');
        const range = dateRangeSelect ? dateRangeSelect.value : '7days';
        
        const endDate = new Date();
        let startDate = new Date();
        
        switch (range) {
            case '7days':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30days':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90days':
                startDate.setDate(endDate.getDate() - 90);
                break;
            case 'thisMonth':
                startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
                break;
            case 'lastMonth':
                startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
                endDate.setDate(0); // 上個月的最後一天
                break;
            default:
                startDate.setDate(endDate.getDate() - 7);
        }

        return { startDate, endDate };
    }

    // 載入所有打卡數據
    async loadAllCheckinData(dateRange) {
        const checkinsSnapshot = await firebaseApp.db
            .collection('checkins')
            .where('checkinTimestamp', '>=', dateRange.startDate)
            .where('checkinTimestamp', '<=', dateRange.endDate)
            .orderBy('checkinTimestamp', 'desc')
            .get();

        return checkinsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    // 載入個人打卡數據
    async loadUserCheckinData(userId, dateRange) {
        const checkinsSnapshot = await firebaseApp.db
            .collection('checkins')
            .where('userId', '==', userId)
            .where('checkinTimestamp', '>=', dateRange.startDate)
            .where('checkinTimestamp', '<=', dateRange.endDate)
            .orderBy('checkinTimestamp', 'desc')
            .get();

        return checkinsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    // 載入所有排班數據
    async loadAllScheduleData(dateRange) {
        const schedulesSnapshot = await firebaseApp.db
            .collection('schedules')
            .where('date', '>=', dateRange.startDate.toISOString().split('T')[0])
            .where('date', '<=', dateRange.endDate.toISOString().split('T')[0])
            .orderBy('date', 'desc')
            .get();

        return schedulesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    // 載入個人排班數據
    async loadUserScheduleData(userId, dateRange) {
        const schedulesSnapshot = await firebaseApp.db
            .collection('schedules')
            .where('staffId', '==', userId)
            .where('date', '>=', dateRange.startDate.toISOString().split('T')[0])
            .where('date', '<=', dateRange.endDate.toISOString().split('T')[0])
            .orderBy('date', 'desc')
            .get();

        return schedulesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    // 載入使用者統計數據
    async loadUserStatistics() {
        const usersSnapshot = await firebaseApp.db.collection('users').get();
        return usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    // 載入個人統計數據
    async loadUserPersonalStatistics(userId) {
        const userDoc = await firebaseApp.db.collection('users').doc(userId).get();
        return userDoc.exists ? [userDoc.data()] : [];
    }

    // 更新統計卡片
    updateStatisticsCards(checkinData, scheduleData, userData) {
        // 總打卡次數
        const totalCheckins = checkinData.length;
        document.getElementById('total-checkins').textContent = totalCheckins;

        // 準時率
        const onTimeCheckins = checkinData.filter(c => c.isOnTime !== false).length;
        const onTimeRate = totalCheckins > 0 ? Math.round((onTimeCheckins / totalCheckins) * 100) : 0;
        document.getElementById('on-time-rate').textContent = `${onTimeRate}%`;

        // 總排班次數
        const totalSchedules = scheduleData.length;
        document.getElementById('total-schedules').textContent = totalSchedules;

        // 活躍人數
        const activeUsers = new Set(checkinData.map(c => c.userId)).size;
        document.getElementById('active-users').textContent = activeUsers;

        // 異常提醒數量
        const alertsSnapshot = checkinData.filter(c => c.alertId).length;
        document.getElementById('total-alerts').textContent = alertsSnapshot;

        // 平均工作時長
        const avgWorkHours = this.calculateAverageWorkHours(checkinData);
        document.getElementById('avg-work-hours').textContent = `${avgWorkHours.toFixed(1)} 小時`;
    }

    // 計算平均工作時長
    calculateAverageWorkHours(checkinData) {
        const validCheckins = checkinData.filter(c => c.checkoutTimestamp);
        if (validCheckins.length === 0) return 0;

        const totalHours = validCheckins.reduce((sum, c) => {
            const checkinTime = new Date(c.checkinTimestamp);
            const checkoutTime = new Date(c.checkoutTimestamp);
            const hours = (checkoutTime - checkinTime) / (1000 * 60 * 60);
            return sum + hours;
        }, 0);

        return totalHours / validCheckins.length;
    }

    // 更新圖表
    updateCharts(checkinData, scheduleData, userData) {
        this.updateCheckinTrendChart(checkinData);
        this.updateUserActivityChart(userData, checkinData);
        this.updateScheduleChart(scheduleData);
        this.updateWorkHoursChart(checkinData);
    }

    // 更新打卡趨勢圖
    updateCheckinTrendChart(checkinData) {
        const ctx = document.getElementById('checkin-trend-chart');
        if (!ctx) return;

        // 按日期分組數據
        const dailyData = {};
        checkinData.forEach(checkin => {
            const date = new Date(checkin.checkinTimestamp).toLocaleDateString();
            dailyData[date] = (dailyData[date] || 0) + 1;
        });

        const labels = Object.keys(dailyData).sort();
        const data = labels.map(date => dailyData[date]);

        // 銷毀舊圖表
        if (this.charts.checkinTrend) {
            this.charts.checkinTrend.destroy();
        }

        // 創建新圖表
        this.charts.checkinTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '每日打卡次數',
                    data: data,
                    borderColor: '#dc2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // 更新使用者活動圖
    updateUserActivityChart(userData, checkinData) {
        const ctx = document.getElementById('user-activity-chart');
        if (!ctx) return;

        // 統計每個使用者的打卡次數
        const userCheckins = {};
        checkinData.forEach(checkin => {
            userCheckins[checkin.userId] = (userCheckins[checkin.userId] || 0) + 1;
        });

        const labels = Object.keys(userCheckins).slice(0, 10); // 只顯示前10名
        const data = labels.map(userId => userCheckins[userId]);

        // 銷毀舊圖表
        if (this.charts.userActivity) {
            this.charts.userActivity.destroy();
        }

        // 創建新圖表
        this.charts.userActivity = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.map(userId => {
                    const user = userData.find(u => u.id === userId);
                    return user ? user.name : userId;
                }),
                datasets: [{
                    label: '打卡次數',
                    data: data,
                    backgroundColor: '#28a745'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // 更新排班圖
    updateScheduleChart(scheduleData) {
        const ctx = document.getElementById('schedule-chart');
        if (!ctx) return;

        // 按班次分組
        const shiftData = {};
        scheduleData.forEach(schedule => {
            const shift = schedule.shift || '日班';
            shiftData[shift] = (shiftData[shift] || 0) + 1;
        });

        const labels = Object.keys(shiftData);
        const data = Object.values(shiftData);

        // 銷毀舊圖表
        if (this.charts.schedule) {
            this.charts.schedule.destroy();
        }

        // 創建新圖表
        this.charts.schedule = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: ['#dc2626', '#28a745', '#ffc107', '#dc3545']
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    // 更新工作時長圖
    updateWorkHoursChart(checkinData) {
        const ctx = document.getElementById('work-hours-chart');
        if (!ctx) return;

        // 按日期分組工作時長
        const dailyHours = {};
        checkinData.forEach(checkin => {
            if (checkin.checkoutTimestamp) {
                const date = new Date(checkin.checkinTimestamp).toLocaleDateString();
                const checkinTime = new Date(checkin.checkinTimestamp);
                const checkoutTime = new Date(checkin.checkoutTimestamp);
                const hours = (checkoutTime - checkinTime) / (1000 * 60 * 60);
                
                dailyHours[date] = (dailyHours[date] || 0) + hours;
            }
        });

        const labels = Object.keys(dailyHours).sort();
        const data = labels.map(date => dailyHours[date]);

        // 銷毀舊圖表
        if (this.charts.workHours) {
            this.charts.workHours.destroy();
        }

        // 創建新圖表
        this.charts.workHours = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '每日工作時長（小時）',
                    data: data,
                    backgroundColor: '#dc2626'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // 更新詳細表格
    updateDetailTables(checkinData, scheduleData) {
        this.updateCheckinTable(checkinData);
        this.updateScheduleTable(scheduleData);
    }

    // 更新打卡詳情表
    updateCheckinTable(checkinData) {
        const tableBody = document.getElementById('checkin-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        
        checkinData.slice(0, 10).forEach(checkin => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(checkin.checkinTimestamp).toLocaleDateString()}</td>
                <td>${checkin.userName || checkin.userId}</td>
                <td>${new Date(checkin.checkinTimestamp).toLocaleTimeString()}</td>
                <td>${checkin.checkoutTimestamp ? new Date(checkin.checkoutTimestamp).toLocaleTimeString() : '未打卡'}</td>
                <td>${checkin.location || 'N/A'}</td>
                <td>${checkin.alertId ? '<span class="badge badge-danger">異常</span>' : '<span class="badge badge-success">正常</span>'}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 更新排班詳情表
    updateScheduleTable(scheduleData) {
        const tableBody = document.getElementById('schedule-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        
        scheduleData.slice(0, 10).forEach(schedule => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${schedule.date}</td>
                <td>${schedule.staffName || schedule.staffId}</td>
                <td>${schedule.shift || '日班'}</td>
                <td>${schedule.startTime || 'N/A'}</td>
                <td>${schedule.endTime || 'N/A'}</td>
                <td>${schedule.status || '已排班'}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 匯出報表
    async exportReport() {
        try {
            const dateRange = this.getDateRange();
            const userRole = window.authManager.currentUserRole;
            const userId = window.authManager.currentUser?.uid;

            let checkinData, scheduleData, userData;

            if (userRole === 'admin' || userRole === 'manager') {
                checkinData = await this.loadAllCheckinData(dateRange);
                scheduleData = await this.loadAllScheduleData(dateRange);
                userData = await this.loadUserStatistics();
            } else {
                checkinData = await this.loadUserCheckinData(userId, dateRange);
                scheduleData = await this.loadUserScheduleData(userId, dateRange);
                userData = await this.loadUserPersonalStatistics(userId);
            }

            const reportData = {
                generatedAt: new Date().toISOString(),
                dateRange: {
                    start: dateRange.startDate.toISOString(),
                    end: dateRange.endDate.toISOString()
                },
                statistics: {
                    totalCheckins: checkinData.length,
                    onTimeRate: this.calculateOnTimeRate(checkinData),
                    totalSchedules: scheduleData.length,
                    activeUsers: new Set(checkinData.map(c => c.userId)).size,
                    totalAlerts: checkinData.filter(c => c.alertId).length,
                    avgWorkHours: this.calculateAverageWorkHours(checkinData)
                },
                checkinData: checkinData,
                scheduleData: scheduleData,
                userData: userData
            };

            // 轉換為 JSON 並下載
            const jsonData = JSON.stringify(reportData, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            window.app.showSuccess('報表匯出成功！');
            
        } catch (error) {
            console.error('匯出報表失敗:', error);
            window.app.showError('匯出報表失敗');
        }
    }

    // 計算準時率
    calculateOnTimeRate(checkinData) {
        if (checkinData.length === 0) return 0;
        const onTimeCheckins = checkinData.filter(c => c.isOnTime !== false).length;
        return Math.round((onTimeCheckins / checkinData.length) * 100);
    }

    // 顯示/隱藏載入狀態
    showLoading(show) {
        const loadingElement = document.getElementById('analytics-loading');
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
    }
}

// 初始化分析管理器
window.analyticsManager = new AnalyticsManager();