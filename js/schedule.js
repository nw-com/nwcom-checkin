// 勤務排班管理系統
class ScheduleManager {
    constructor() {
        this.currentWeek = new Date();
        this.scheduleData = {};
        this.users = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUsers();
        this.loadSchedule();
    }

    // 設定事件監聽器
    setupEventListeners() {
        // 這裡可以添加更多事件監聽器
    }

    // 載入使用者列表
    async loadUsers() {
        try {
            const usersSnapshot = await firebaseApp.db.collection('users').get();
            this.users = [];
            usersSnapshot.forEach(doc => {
                this.users.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        } catch (error) {
            console.error('載入使用者列表失敗:', error);
        }
    }

    // 載入排班資料
    async loadSchedule() {
        try {
            const startDate = this.getWeekStart(this.currentWeek);
            const endDate = this.getWeekEnd(this.currentWeek);
            
            const scheduleSnapshot = await firebaseApp.db
                .collection('schedules')
                .where('date', '>=', startDate)
                .where('date', '<=', endDate)
                .get();

            this.scheduleData = {};
            scheduleSnapshot.forEach(doc => {
                const data = doc.data();
                const date = data.date;
                if (!this.scheduleData[date]) {
                    this.scheduleData[date] = [];
                }
                this.scheduleData[date].push(data);
            });

            this.renderSchedule();
        } catch (error) {
            console.error('載入排班資料失敗:', error);
        }
    }

    // 渲染排班表
    renderSchedule() {
        const calendarContainer = document.getElementById('calendar');
        if (!calendarContainer) return;

        const weekStart = this.getWeekStart(this.currentWeek);
        const weekDays = this.getWeekDays(weekStart);

        let html = `
            <div class="schedule-header">
                <h3>本週排班表</h3>
                <div class="week-navigation">
                    <button onclick="window.scheduleManager.previousWeek()" class="btn btn-sm">
                        <i class="fas fa-chevron-left"></i> 上週
                    </button>
                    <span class="week-range">${this.formatWeekRange(weekStart)}</span>
                    <button onclick="window.scheduleManager.nextWeek()" class="btn btn-sm">
                        下週 <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
            <div class="schedule-grid">
                <div class="schedule-header-row">
                    <div class="time-slot">時間</div>
                    ${weekDays.map(day => `
                        <div class="day-column">
                            <div class="day-header">${this.formatDayHeader(day)}</div>
                        </div>
                    `).join('')}
                </div>
                ${this.renderTimeSlots(weekDays)}
            </div>
        `;

        if (window.authManager.hasPermission('schedule', 'edit')) {
            html += `
                <div class="schedule-actions">
                    <button onclick="window.scheduleManager.showAddScheduleModal()" class="btn btn-primary">
                        <i class="fas fa-plus"></i> 新增排班
                    </button>
                </div>
            `;
        }

        calendarContainer.innerHTML = html;
    }

    // 渲染時間槽
    renderTimeSlots(weekDays) {
        const timeSlots = [
            '06:00-08:00', '08:00-10:00', '10:00-12:00',
            '12:00-14:00', '14:00-16:00', '16:00-18:00',
            '18:00-20:00', '20:00-22:00', '22:00-24:00'
        ];

        return timeSlots.map(slot => `
            <div class="schedule-row">
                <div class="time-slot">${slot}</div>
                ${weekDays.map(day => `
                    <div class="schedule-cell" data-date="${day.date}" data-time="${slot}">
                        ${this.renderScheduleCell(day.date, slot)}
                    </div>
                `).join('')}
            </div>
        `).join('');
    }

    // 渲染單個排班單元格
    renderScheduleCell(date, timeSlot) {
        const schedules = this.scheduleData[date] || [];
        const slotSchedules = schedules.filter(s => s.timeSlot === timeSlot);

        if (slotSchedules.length === 0) {
            return '<div class="empty-slot">-</div>';
        }

        return slotSchedules.map(schedule => `
            <div class="schedule-item">
                <div class="staff-name">${schedule.staffName}</div>
                <div class="schedule-type">${schedule.type}</div>
                ${window.authManager.hasPermission('schedule', 'edit') ? `
                    <div class="schedule-actions">
                        <button onclick="window.scheduleManager.editSchedule('${schedule.id}')" class="btn-icon">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="window.scheduleManager.deleteSchedule('${schedule.id}')" class="btn-icon">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    // 新增排班
    async addSchedule(scheduleData) {
        try {
            await firebaseApp.db.collection('schedules').add({
                ...scheduleData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: window.authManager.currentUser.uid
            });
            
            await this.loadSchedule();
            return true;
        } catch (error) {
            console.error('新增排班失敗:', error);
            throw error;
        }
    }

    // 更新排班
    async updateSchedule(scheduleId, scheduleData) {
        try {
            await firebaseApp.db.collection('schedules').doc(scheduleId).update({
                ...scheduleData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: window.authManager.currentUser.uid
            });
            
            await this.loadSchedule();
            return true;
        } catch (error) {
            console.error('更新排班失敗:', error);
            throw error;
        }
    }

    // 刪除排班
    async deleteSchedule(scheduleId) {
        if (!confirm('確定要刪除這個排班嗎？')) {
            return false;
        }

        try {
            await firebaseApp.db.collection('schedules').doc(scheduleId).delete();
            await this.loadSchedule();
            return true;
        } catch (error) {
            console.error('刪除排班失敗:', error);
            throw error;
        }
    }

    // 顯示新增排班對話框
    showAddScheduleModal() {
        const modal = this.createScheduleModal();
        document.body.appendChild(modal);
        
        // 填充員工選項
        const staffSelect = document.getElementById('schedule-staff');
        this.users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            staffSelect.appendChild(option);
        });
    }

    // 建立排班對話框
    createScheduleModal(schedule = null) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${schedule ? '編輯排班' : '新增排班'}</h3>
                    <button onclick="this.closest('.modal').remove()" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="schedule-form">
                        <div class="form-group">
                            <label>員工</label>
                            <select id="schedule-staff" required>
                                <option value="">請選擇員工</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>日期</label>
                            <input type="date" id="schedule-date" required>
                        </div>
                        <div class="form-group">
                            <label>時段</label>
                            <select id="schedule-timeslot" required>
                                <option value="">請選擇時段</option>
                                <option value="06:00-08:00">06:00-08:00</option>
                                <option value="08:00-10:00">08:00-10:00</option>
                                <option value="10:00-12:00">10:00-12:00</option>
                                <option value="12:00-14:00">12:00-14:00</option>
                                <option value="14:00-16:00">14:00-16:00</option>
                                <option value="16:00-18:00">16:00-18:00</option>
                                <option value="18:00-20:00">18:00-20:00</option>
                                <option value="20:00-22:00">20:00-22:00</option>
                                <option value="22:00-24:00">22:00-24:00</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>勤務類型</label>
                            <select id="schedule-type" required>
                                <option value="">請選擇類型</option>
                                <option value="巡邏">巡邏</option>
                                <option value="站崗">站崗</option>
                                <option value="值班">值班</option>
                                <option value="訓練">訓練</option>
                                <option value="其他">其他</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>備註</label>
                            <textarea id="schedule-notes" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" onclick="this.closest('.modal').remove()" class="btn btn-secondary">
                        取消
                    </button>
                    <button type="button" onclick="window.scheduleManager.saveSchedule()" class="btn btn-primary">
                        儲存
                    </button>
                </div>
            </div>
        `;

        // 如果是編輯模式，填充現有資料
        if (schedule) {
            modal.querySelector('#schedule-staff').value = schedule.staffId;
            modal.querySelector('#schedule-date').value = schedule.date;
            modal.querySelector('#schedule-timeslot').value = schedule.timeSlot;
            modal.querySelector('#schedule-type').value = schedule.type;
            modal.querySelector('#schedule-notes').value = schedule.notes || '';
        }

        return modal;
    }

    // 儲存排班
    async saveSchedule() {
        const staffId = document.getElementById('schedule-staff').value;
        const date = document.getElementById('schedule-date').value;
        const timeSlot = document.getElementById('schedule-timeslot').value;
        const type = document.getElementById('schedule-type').value;
        const notes = document.getElementById('schedule-notes').value;

        if (!staffId || !date || !timeSlot || !type) {
            alert('請填寫所有必要欄位');
            return;
        }

        const staff = this.users.find(u => u.id === staffId);
        if (!staff) {
            alert('找不到選擇的員工');
            return;
        }

        const scheduleData = {
            staffId: staffId,
            staffName: staff.name,
            date: date,
            timeSlot: timeSlot,
            type: type,
            notes: notes
        };

        try {
            await this.addSchedule(scheduleData);
            document.querySelector('.modal').remove();
            alert('排班儲存成功！');
        } catch (error) {
            alert('儲存失敗：' + error.message);
        }
    }

    // 上週
    previousWeek() {
        this.currentWeek.setDate(this.currentWeek.getDate() - 7);
        this.loadSchedule();
    }

    // 下週
    nextWeek() {
        this.currentWeek.setDate(this.currentWeek.getDate() + 7);
        this.loadSchedule();
    }

    // 工具函數
    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 調整為週一開始
        return new Date(d.setDate(diff)).toISOString().split('T')[0];
    }

    getWeekEnd(date) {
        const start = new Date(this.getWeekStart(date));
        start.setDate(start.getDate() + 6);
        return start.toISOString().split('T')[0];
    }

    getWeekDays(startDate) {
        const days = [];
        const start = new Date(startDate);
        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            days.push({
                date: date.toISOString().split('T')[0],
                dayName: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'][i]
            });
        }
        return days;
    }

    formatWeekRange(startDate) {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        
        return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`;
    }

    formatDayHeader(day) {
        const date = new Date(day.date);
        return `${day.dayName}<br><small>${date.getMonth() + 1}/${date.getDate()}</small>`;
    }
}

// 初始化排班管理器
window.scheduleManager = new ScheduleManager();

// 添加排班相關 CSS
const style = document.createElement('style');
style.textContent = `
    .schedule-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 15px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .week-navigation {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .week-range {
        font-weight: bold;
        color: #333;
    }
    
    .schedule-grid {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        overflow: hidden;
    }
    
    .schedule-header-row {
        display: grid;
        grid-template-columns: 120px repeat(7, 1fr);
        background: #f8f9fa;
        border-bottom: 2px solid #dee2e6;
    }
    
    .time-slot {
        padding: 15px 10px;
        text-align: center;
        font-weight: bold;
        color: #495057;
        border-right: 1px solid #dee2e6;
    }
    
    .day-column {
        padding: 15px 10px;
        text-align: center;
        font-weight: bold;
        color: #495057;
        border-right: 1px solid #dee2e6;
    }
    
    .schedule-row {
        display: grid;
        grid-template-columns: 120px repeat(7, 1fr);
        border-bottom: 1px solid #dee2e6;
    }
    
    .schedule-cell {
        padding: 10px;
        border-right: 1px solid #dee2e6;
        min-height: 60px;
        position: relative;
    }
    
    .empty-slot {
        color: #6c757d;
        text-align: center;
        line-height: 40px;
    }
    
    .schedule-item {
        background: #e3f2fd;
        border: 1px solid #2196f3;
        border-radius: 4px;
        padding: 8px;
        margin-bottom: 5px;
        font-size: 12px;
    }
    
    .staff-name {
        font-weight: bold;
        color: #1976d2;
        margin-bottom: 2px;
    }
    
    .schedule-type {
        color: #666;
        font-size: 11px;
    }
    
    .schedule-actions {
        margin-top: 20px;
        text-align: right;
    }
    
    .btn-sm {
        padding: 5px 10px;
        font-size: 12px;
    }
    
    .btn-icon {
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 2px 4px;
        margin: 0 2px;
    }
    
    .btn-icon:hover {
        color: #333;
    }
    
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    
    .modal-content {
        background: white;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    .modal-header {
        padding: 20px;
        border-bottom: 1px solid #dee2e6;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .modal-footer {
        padding: 20px;
        border-top: 1px solid #dee2e6;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #666;
    }
`;
document.head.appendChild(style);