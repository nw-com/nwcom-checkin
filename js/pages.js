// 切換側邊欄
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// 初始化頁面管理器
const pageManager = new PageManager();

// 匯出給全域使用
window.pageManager = pageManager;

// 社區管理相關輔助函數
// 顯示新增社區表單
window.pageManager.showAddCommunity = function() {
    window.pageManager.switchPage('community', 'community-add');
};

// 載入社區列表
window.pageManager.loadCommunityList = function() {
    window.pageManager.switchPage('community', 'community-list');
};

// 載入社區班表
window.pageManager.loadCommunitySchedule = function() {
    window.pageManager.switchPage('community', 'community-schedule');
};

// 載入社區總覽
window.pageManager.loadCommunityOverview = function() {
    window.pageManager.switchPage('community', 'community-overview');
};

// 篩選社區
window.pageManager.filterCommunities = function() {
    const statusFilter = document.getElementById('communityStatusFilter').value;
    const searchTerm = document.getElementById('communitySearch').value.toLowerCase();
    const communityCards = document.querySelectorAll('.community-card');

    communityCards.forEach(card => {
        const status = card.dataset.status;
        const name = card.querySelector('h3').textContent.toLowerCase();
        
        let showCard = true;
        
        // 狀態篩選
        if (statusFilter !== 'all' && status !== statusFilter) {
            showCard = false;
        }
        
        // 搜尋篩選
        if (searchTerm && !name.includes(searchTerm)) {
            showCard = false;
        }
        
        card.style.display = showCard ? 'block' : 'none';
    });
};

// 搜尋社區
window.pageManager.searchCommunities = function() {
    window.pageManager.filterCommunities();
};

// 查看社區詳情
window.pageManager.viewCommunityDetail = async function(communityId) {
    try {
        const doc = await db.collection('communities').doc(communityId).get();
        if (doc.exists) {
            const community = doc.data();
            
            const detailHtml = `
                <div class="community-detail-modal">
                    <div class="modal-header">
                        <h3>${community.name}</h3>
                        <button class="btn-close" onclick="this.closest('.community-detail-modal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="detail-section">
                            <h4>基本資訊</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>社區代碼：</label>
                                    <span>${community.code || '無'}</span>
                                </div>
                                <div class="detail-item">
                                    <label>社區類型：</label>
                                    <span>${community.type || '未設定'}</span>
                                </div>
                                <div class="detail-item">
                                    <label>狀態：</label>
                                    <span class="badge badge-${community.status === 'active' ? 'success' : 'danger'}">
                                        ${community.status === 'active' ? '活躍' : '停用'}
                                    </span>
                                </div>
                                <div class="detail-item">
                                    <label>建立時間：</label>
                                    <span>${window.pageManager.formatDateTime(community.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h4>聯絡資訊</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>地址：</label>
                                    <span>${community.location?.address || community.address || '未設定'}</span>
                                </div>
                                <div class="detail-item">
                                    <label>電話：</label>
                                    <span>${community.contactPhone || '無'}</span>
                                </div>
                                <div class="detail-item">
                                    <label>信箱：</label>
                                    <span>${community.contactEmail || '無'}</span>
                                </div>
                                <div class="detail-item">
                                    <label>負責人：</label>
                                    <span>${community.manager || '未設定'}</span>
                                </div>
                            </div>
                        </div>
                        
                        ${community.location ? `
                        <div class="detail-section">
                            <h4>位置資訊</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>緯度：</label>
                                    <span>${community.location.latitude || '無'}</span>
                                </div>
                                <div class="detail-item">
                                    <label>經度：</label>
                                    <span>${community.location.longitude || '無'}</span>
                                </div>
                                <div class="detail-item">
                                    <label>打卡範圍：</label>
                                    <span>${community.location.checkInRadius || 500} 米</span>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                        
                        ${community.description || community.notes ? `
                        <div class="detail-section">
                            <h4>其他資訊</h4>
                            <div class="detail-grid">
                                ${community.description ? `
                                <div class="detail-item">
                                    <label>描述：</label>
                                    <span>${community.description}</span>
                                </div>
                                ` : ''}
                                ${community.notes ? `
                                <div class="detail-item">
                                    <label>備註：</label>
                                    <span>${community.notes}</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="window.pageManager.editCommunity('${communityId}')">
                            <i class="fas fa-edit"></i> 編輯
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.community-detail-modal').remove()">
                            <i class="fas fa-times"></i> 關閉
                        </button>
                    </div>
                </div>
            `;
            
            // 創建模態框覆蓋層
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'modal-overlay';
            modalOverlay.innerHTML = detailHtml;
            document.body.appendChild(modalOverlay);
        }
    } catch (error) {
        console.error('查看社區詳情失敗:', error);
        alert('查看社區詳情失敗');
    }
};

// 編輯社區
window.pageManager.editCommunity = function(communityId) {
    // 實現編輯功能，可以重複使用新增表單
    alert('編輯功能開發中...');
};

// 切換社區狀態
window.pageManager.toggleCommunityStatus = async function(communityId, currentStatus) {
    try {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        await db.collection('communities').doc(communityId).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // 重新載入列表
        window.pageManager.loadCommunityList();
        
        alert(`社區已${newStatus === 'active' ? '啟用' : '停用'}`);
    } catch (error) {
        console.error('切換社區狀態失敗:', error);
        alert('切換社區狀態失敗');
    }
};

// 提交社區表單
window.pageManager.submitCommunityForm = async function() {
    try {
        const form = document.getElementById('communityForm');
        const formData = new FormData(form);
        
        const communityData = {
            name: formData.get('name'),
            code: formData.get('code'),
            type: formData.get('type'),
            status: formData.get('status'),
            address: formData.get('address'),
            contactPhone: formData.get('contactPhone'),
            contactEmail: formData.get('contactEmail'),
            manager: formData.get('manager'),
            description: formData.get('description'),
            notes: formData.get('notes'),
            employeeCount: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // 位置資訊
        const latitude = parseFloat(formData.get('latitude'));
        const longitude = parseFloat(formData.get('longitude'));
        const checkInRadius = parseInt(formData.get('checkInRadius'));
        
        if (latitude && longitude) {
            communityData.location = {
                latitude: latitude,
                longitude: longitude,
                address: formData.get('address'),
                checkInRadius: checkInRadius || 500
            };
        }
        
        // 驗證必填欄位
        if (!communityData.name || !communityData.address) {
            alert('請填寫所有必填欄位');
            return;
        }
        
        await db.collection('communities').add(communityData);
        
        alert('社區新增成功！');
        window.pageManager.loadCommunityList();
        
    } catch (error) {
        console.error('提交社區表單失敗:', error);
        alert('提交社區表單失敗');
    }
};

// 獲取當前位置（用於社區表單）
window.pageManager.getCurrentLocationForCommunity = function() {
    if (!navigator.geolocation) {
        alert('您的瀏覽器不支援定位功能');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            document.getElementById('communityLatitude').value = latitude.toFixed(6);
            document.getElementById('communityLongitude').value = longitude.toFixed(6);
            alert('位置獲取成功！');
        },
        (error) => {
            alert('獲取位置失敗：' + error.message);
        }
    );
};

// 獲取當前週次
window.pageManager.getCurrentWeek = function() {
    const now = new Date();
    const year = now.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (now - firstDayOfYear) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
};

// 載入班表數據
window.pageManager.loadScheduleData = async function() {
    const communityId = document.getElementById('scheduleCommunity').value;
    const week = document.getElementById('scheduleWeek').value;
    
    if (!communityId || !week) {
        return;
    }
    
    try {
        // 獲取該週的班表數據
        const scheduleSnapshot = await db.collection('schedules')
            .where('communityId', '==', communityId)
            .where('week', '==', week)
            .get();
        
        const scheduleData = {};
        scheduleSnapshot.forEach(doc => {
            const data = doc.data();
            const key = `${data.date}_${data.timeSlot}`;
            scheduleData[key] = data;
        });
        
        // 更新日曆顯示
        const calendarBody = document.getElementById('calendarBody');
        if (calendarBody) {
            calendarBody.innerHTML = this.generateScheduleCalendar(week, scheduleData);
        }
        
    } catch (error) {
        console.error('載入班表數據失敗:', error);
    }
};

// 生成班表日曆
window.pageManager.generateScheduleCalendar = function(week, scheduleData) {
    const [year, weekNum] = week.split('-W');
    const firstDayOfWeek = this.getFirstDayOfWeek(parseInt(year), parseInt(weekNum));
    
    let html = '';
    const timeSlots = ['morning', 'afternoon', 'evening'];
    const timeSlotLabels = { morning: '早班', afternoon: '午班', evening: '晚班' };
    
    timeSlots.forEach(timeSlot => {
        html += '<div class="schedule-row">';
        html += `<div class="time-slot-header">${timeSlotLabels[timeSlot]}</div>`;
        
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(firstDayOfWeek);
            currentDate.setDate(firstDayOfWeek.getDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];
            const key = `${dateStr}_${timeSlot}`;
            
            const assignedEmployees = scheduleData[key] ? scheduleData[key].employees : [];
            
            html += `
                <div class="calendar-cell" data-date="${dateStr}" data-time-slot="${timeSlot}">
                    <div class="cell-content">
                        ${assignedEmployees.map(emp => `
                            <div class="assigned-employee" data-employee-id="${emp.id}">
                                <span>${emp.name}</span>
                                <button class="remove-employee" onclick="window.pageManager.removeEmployeeFromSchedule('${dateStr}', '${timeSlot}', '${emp.id}')">&times;</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
    });
    
    return html;
};

// 獲取週的第一天
window.pageManager.getFirstDayOfWeek = function(year, week) {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (week - 1) * 7 - firstDayOfYear.getDay() + 1;
    return new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + daysOffset));
};

// 分配員工到班表
window.pageManager.assignEmployeeToSchedule = async function(date, timeSlot, employeeData) {
    try {
        const communityId = document.getElementById('scheduleCommunity').value;
        
        // 檢查是否已存在該時段的班表記錄
        const existingSchedule = await db.collection('schedules')
            .where('communityId', '==', communityId)
            .where('date', '==', date)
            .where('timeSlot', '==', timeSlot)
            .get();
        
        if (existingSchedule.empty) {
            // 創建新班表記錄
            await db.collection('schedules').add({
                communityId: communityId,
                date: date,
                timeSlot: timeSlot,
                employees: [employeeData],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // 更新現有記錄
            const doc = existingSchedule.docs[0];
            const currentData = doc.data();
            
            // 檢查員工是否已經存在
            const employeeExists = currentData.employees.some(emp => emp.id === employeeData.employeeId);
            if (!employeeExists) {
                currentData.employees.push(employeeData);
                await doc.ref.update({
                    employees: currentData.employees,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        }
        
        // 重新載入班表數據
        window.pageManager.loadScheduleData();
        
    } catch (error) {
        console.error('分配員工到班表失敗:', error);
        alert('分配員工失敗');
    }
};

// 從班表移除員工
window.pageManager.removeEmployeeFromSchedule = async function(date, timeSlot, employeeId) {
    try {
        const communityId = document.getElementById('scheduleCommunity').value;
        
        const scheduleSnapshot = await db.collection('schedules')
            .where('communityId', '==', communityId)
            .where('date', '==', date)
            .where('timeSlot', '==', timeSlot)
            .get();
        
        if (!scheduleSnapshot.empty) {
            const doc = scheduleSnapshot.docs[0];
            const currentData = doc.data();
            
            // 移除員工
            currentData.employees = currentData.employees.filter(emp => emp.id !== employeeId);
            
            if (currentData.employees.length === 0) {
                // 如果沒有員工了，刪除整個記錄
                await doc.ref.delete();
            } else {
                // 更新記錄
                await doc.ref.update({
                    employees: currentData.employees,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            // 重新載入班表數據
            window.pageManager.loadScheduleData();
        }
        
    } catch (error) {
        console.error('從班表移除員工失敗:', error);
        alert('移除員工失敗');
    }
};

// 匯出班表
window.pageManager.exportSchedule = function() {
    alert('班表匯出功能開發中...');
};

// 匯出總覽報表
window.pageManager.exportOverview = function() {
    alert('總覽報表匯出功能開發中...');
};

// 帳號管理相關輔助函數
// 顯示新增用戶表單
window.pageManager.showAddUser = function() {
    window.pageManager.loadPage('account', 'user-add');
};

// 返回用戶列表
window.pageManager.loadUserList = function() {
    window.pageManager.loadPage('account', 'user-list');
};

// 篩選用戶
window.pageManager.filterUsers = function() {
    const statusFilter = document.getElementById('userStatusFilter')?.value;
    const roleFilter = document.getElementById('userRoleFilter')?.value;
    const rows = document.querySelectorAll('#userTableBody tr');
    
    rows.forEach(row => {
        const status = row.dataset.status;
        const role = row.dataset.role;
        
        let showRow = true;
        
        if (statusFilter && statusFilter !== 'all' && status !== statusFilter) {
            showRow = false;
        }
        
        if (roleFilter && roleFilter !== 'all' && role !== roleFilter) {
            showRow = false;
        }
        
        row.style.display = showRow ? '' : 'none';
    });
};

// 搜尋用戶
window.pageManager.searchUsers = function() {
    const searchTerm = document.getElementById('userSearch')?.value.toLowerCase();
    const rows = document.querySelectorAll('#userTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
};

// 提交新增用戶表單
window.pageManager.submitUserAddForm = async function(event) {
    if (event) {
        event.preventDefault();
    }
    
    const form = document.getElementById('userAddForm');
    const formData = new FormData(form);
    
    try {
        // 檢查員工編號是否已存在
        const existingUser = await db.collection('users')
            .where('employeeId', '==', formData.get('employeeId'))
            .get();
        
        if (!existingUser.empty) {
            alert('此員工編號已存在！');
            return;
        }
        
        // 創建新用戶
        const userData = {
            employeeId: formData.get('employeeId'),
            name: formData.get('name'),
            department: formData.get('department'),
            position: formData.get('position'),
            role: formData.get('role'),
            status: formData.get('status') || 'active',
            phone: formData.get('phone'),
            email: formData.get('email'),
            emergencyContact: formData.get('emergencyContact'),
            emergencyPhone: formData.get('emergencyPhone'),
            notes: formData.get('notes'),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLoginAt: null
        };
        
        // 使用 Firebase Auth 創建用戶帳號
        const email = formData.get('email') || `${formData.get('employeeId')}@company.com`;
        const password = formData.get('password');
        
        try {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            userData.uid = userCredential.user.uid;
            
            // 保存用戶資料到 Firestore
            await db.collection('users').doc(userCredential.user.uid).set(userData);
            
            alert('用戶新增成功！');
            window.pageManager.loadUserList();
            
        } catch (authError) {
            console.error('創建用戶帳號失敗:', authError);
            alert('創建用戶帳號失敗：' + authError.message);
        }
        
    } catch (error) {
        console.error('新增用戶失敗:', error);
        alert('新增用戶失敗：' + error.message);
    }
};

// 查看用戶詳情
window.pageManager.viewUserDetail = async function(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        if (!userData) {
            alert('找不到用戶資料');
            return;
        }
        
        const detailHtml = `
            <div class="modal" id="userDetailModal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>用戶詳情</h3>
                        <span class="close" onclick="document.getElementById('userDetailModal').style.display='none'">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="detail-section">
                            <h4>基本資訊</h4>
                            <p><strong>員工編號：</strong>${userData.employeeId}</p>
                            <p><strong>姓名：</strong>${userData.name}</p>
                            <p><strong>部門：</strong>${userData.department || '-'}</p>
                            <p><strong>職位：</strong>${userData.position || '-'}</p>
                            <p><strong>角色：</strong>${firebaseUtils.getRoleDisplayName(userData.role)}</p>
                            <p><strong>狀態：</strong>${userData.status === 'active' ? '啟用' : '停用'}</p>
                        </div>
                        <div class="detail-section">
                            <h4>聯絡資訊</h4>
                            <p><strong>電話：</strong>${userData.phone || '-'}</p>
                            <p><strong>電子郵件：</strong>${userData.email || '-'}</p>
                            <p><strong>緊急聯絡人：</strong>${userData.emergencyContact || '-'}</p>
                            <p><strong>緊急聯絡電話：</strong>${userData.emergencyPhone || '-'}</p>
                        </div>
                        <div class="detail-section">
                            <h4>系統資訊</h4>
                            <p><strong>建立時間：</strong>${userData.createdAt ? firebaseUtils.formatTimestamp(userData.createdAt) : '-'}</p>
                            <p><strong>最後登入：</strong>${userData.lastLoginAt ? firebaseUtils.formatTimestamp(userData.lastLoginAt) : '從未登入'}</p>
                            <p><strong>備註：</strong>${userData.notes || '-'}</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="document.getElementById('userDetailModal').style.display='none'">關閉</button>
                    </div>
                </div>
            </div>
        `;
        
        // 創建或更新模態框
        let modal = document.getElementById('userDetailModal');
        if (modal) {
            modal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', detailHtml);
        
    } catch (error) {
        console.error('查看用戶詳情失敗:', error);
        alert('查看用戶詳情失敗');
    }
};

// 編輯用戶
window.pageManager.editUser = function(userId) {
    alert('編輯用戶功能開發中...');
};

// 切換用戶狀態
window.pageManager.toggleUserStatus = async function(userId, currentStatus) {
    try {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const confirmMessage = `確定要${newStatus === 'active' ? '啟用' : '停用'}此用戶嗎？`;
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        await db.collection('users').doc(userId).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert(`用戶已${newStatus === 'active' ? '啟用' : '停用'}`);
        window.pageManager.loadUserList();
        
    } catch (error) {
        console.error('切換用戶狀態失敗:', error);
        alert('切換用戶狀態失敗：' + error.message);
    }
};

// 重設用戶密碼
window.pageManager.resetUserPassword = async function(userId) {
    try {
        if (!confirm('確定要重設此用戶的密碼嗎？重設後的密碼為：Temp123456')) {
            return;
        }
        
        // 注意：實際應用中需要通過後端 API 來重設密碼
        // 這裡只是前端演示
        alert('密碼重設功能需要後端支援，當前為演示版本');
        
    } catch (error) {
        console.error('重設密碼失敗:', error);
        alert('重設密碼失敗：' + error.message);
    }
};

// 顯示新增角色表單
window.pageManager.showAddRole = function() {
    alert('新增角色功能開發中...');
};

// 編輯角色權限
window.pageManager.editRolePermissions = function(roleId) {
    alert('編輯角色權限功能開發中...');
};

// 查看角色詳情
window.pageManager.viewRoleDetail = function(roleId) {
    alert('查看角色詳情功能開發中...');
};

// 刪除角色
window.pageManager.deleteRole = async function(roleId) {
    try {
        if (!confirm('確定要刪除此角色嗎？此操作不可恢復。')) {
            return;
        }
        
        await db.collection('roles').doc(roleId).delete();
        alert('角色刪除成功');
        window.pageManager.loadPage('account', 'role-manage');
        
    } catch (error) {
        console.error('刪除角色失敗:', error);
        alert('刪除角色失敗：' + error.message);
    }
};

// 顯示新增權限表單
window.pageManager.showAddPermission = function() {
    alert('新增權限功能開發中...');
};

// 切換模組權限
window.pageManager.toggleModulePermission = function(module, permission, checked) {
    console.log(`模組 ${module} 的 ${permission} 權限：${checked ? '啟用' : '停用'}`);
};

// 儲存權限設定
window.pageManager.savePermissionSettings = function() {
    alert('權限設定已儲存');
};

// 重設權限為預設值
window.pageManager.resetPermissions = function() {
    if (confirm('確定要重設所有權限為預設值嗎？')) {
        alert('權限已重設為預設值');
    }
};

// 系統管理相關函數

// 儲存系統設定
window.pageManager.saveSystemSettings = async function() {
    try {
        const form = document.getElementById('systemSettingsForm');
        if (!form) {
            alert('找不到系統設定表單');
            return;
        }

        const formData = new FormData(form);
        const settings = {};
        
        // 收集表單數據
        for (let [key, value] of formData.entries()) {
            if (key === 'minPasswordLength' || key === 'maxLoginAttempts' || key === 'lockoutDuration' || key === 'logRetentionDays' || key === 'smtpPort') {
                settings[key] = parseInt(value) || 0;
            } else if (key === 'maintenanceMode' || key === 'autoBackup' || key === 'smtpSSL') {
                settings[key] = value === 'true';
            } else {
                settings[key] = value;
            }
        }

        // 驗證必要欄位
        if (!settings.systemName || !settings.systemVersion) {
            alert('請填寫所有必填欄位');
            return;
        }

        // 儲存到 Firestore
        await db.collection('systemSettings').doc('general').set(settings, { merge: true });
        
        alert('系統設定儲存成功！');
        
        // 記錄系統日誌
        await logSystemEvent('update', 'system_settings', '更新系統設定');
        
    } catch (error) {
        console.error('儲存系統設定失敗:', error);
        alert('儲存系統設定失敗：' + error.message);
    }
};

// 儲存通知設定
window.pageManager.saveNotificationSettings = async function() {
    try {
        const form = document.getElementById('notificationSettingsForm');
        if (!form) {
            alert('找不到通知設定表單');
            return;
        }

        const formData = new FormData(form);
        const notifications = {};
        
        // 收集表單數據
        for (let [key, value] of formData.entries()) {
            if (key === 'smtpPort') {
                notifications[key] = parseInt(value) || 587;
            } else if (key === 'notifyLogin' || key === 'notifyFailedLogin' || key === 'notifyPasswordChange' || key === 'notifySystemError' || key === 'smtpSSL') {
                notifications[key] = formData.has(key);
            } else {
                notifications[key] = value;
            }
        }

        // 儲存到 Firestore
        await db.collection('systemSettings').doc('notifications').set(notifications, { merge: true });
        
        alert('通知設定儲存成功！');
        
        // 記錄系統日誌
        await logSystemEvent('update', 'notification_settings', '更新通知設定');
        
    } catch (error) {
        console.error('儲存通知設定失敗:', error);
        alert('儲存通知設定失敗：' + error.message);
    }
};

// 篩選系統日誌
window.pageManager.filterSystemLogs = function() {
    const levelFilter = document.getElementById('logLevelFilter')?.value || 'all';
    const actionFilter = document.getElementById('logActionFilter')?.value || 'all';
    const searchTerm = document.getElementById('logSearch')?.value.toLowerCase() || '';
    
    const tableBody = document.getElementById('systemLogsTableBody');
    if (!tableBody) return;
    
    const rows = tableBody.getElementsByTagName('tr');
    
    for (let row of rows) {
        let showRow = true;
        
        // 檢查日誌等級篩選
        if (levelFilter !== 'all') {
            const rowLevel = row.getAttribute('data-level');
            if (rowLevel !== levelFilter) {
                showRow = false;
            }
        }
        
        // 檢查操作類型篩選
        if (showRow && actionFilter !== 'all') {
            const rowAction = row.getAttribute('data-action');
            if (rowAction !== actionFilter) {
                showRow = false;
            }
        }
        
        // 檢查搜尋詞彙
        if (showRow && searchTerm) {
            const rowText = row.textContent.toLowerCase();
            if (!rowText.includes(searchTerm)) {
                showRow = false;
            }
        }
        
        row.style.display = showRow ? '' : 'none';
    }
};

// 匯出系統日誌
window.pageManager.exportSystemLogs = async function() {
    try {
        alert('系統日誌匯出功能開發中...');
        // 實際應用中需要實現 CSV 或 Excel 匯出功能
    } catch (error) {
        console.error('匯出系統日誌失敗:', error);
        alert('匯出系統日誌失敗：' + error.message);
    }
};

// 清除系統日誌
window.pageManager.clearSystemLogs = async function() {
    try {
        if (!confirm('確定要清除所有系統日誌嗎？此操作不可恢復。')) {
            return;
        }
        
        alert('清除系統日誌功能需要後端支援，當前為演示版本');
        // 實際應用中需要後端 API 來批量刪除日誌
        
    } catch (error) {
        console.error('清除系統日誌失敗:', error);
        alert('清除系統日誌失敗：' + error.message);
    }
};

// 創建系統備份
window.pageManager.createSystemBackup = async function() {
    try {
        if (!confirm('確定要立即執行系統備份嗎？')) {
            return;
        }
        
        alert('系統備份功能需要後端支援，當前為演示版本');
        // 實際應用中需要後端 API 來執行備份
        
    } catch (error) {
        console.error('創建系統備份失敗:', error);
        alert('創建系統備份失敗：' + error.message);
    }
};

// 下載備份
window.pageManager.downloadBackup = async function(backupId) {
    try {
        alert('下載備份功能需要後端支援，當前為演示版本');
        // 實際應用中需要後端 API 來提供下載
        
    } catch (error) {
        console.error('下載備份失敗:', error);
        alert('下載備份失敗：' + error.message);
    }
};

// 刪除備份
window.pageManager.deleteBackup = async function(backupId) {
    try {
        if (!confirm('確定要刪除此備份嗎？此操作不可恢復。')) {
            return;
        }
        
        await db.collection('systemBackups').doc(backupId).delete();
        alert('備份刪除成功');
        window.pageManager.loadPage('system', 'backup');
        
    } catch (error) {
        console.error('刪除備份失敗:', error);
        alert('刪除備份失敗：' + error.message);
    }
};

// 系統日誌記錄函數
async function logSystemEvent(action, target, description, level = 'info') {
    try {
        const user = window.currentUser;
        const logData = {
            action: action,
            target: target,
            description: description,
            level: level,
            userId: user?.uid || 'system',
            userName: user?.name || '系統',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            ipAddress: await getClientIP()
        };
        
        await db.collection('systemLogs').add(logData);
        
    } catch (error) {
        console.error('記錄系統日誌失敗:', error);
    }
}

// 獲取客戶端 IP 地址（簡化版本）
async function getClientIP() {
    // 實際應用中需要後端 API 來獲取真實 IP
    return '127.0.0.1';
}

    showSuccessToast(message) {
        if (window.app && window.app.showSuccessToast) {
            window.app.showSuccessToast(message);
        } else {
            alert(message);
        }
    }
}