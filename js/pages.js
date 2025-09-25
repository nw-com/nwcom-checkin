// 頁面管理系統

class PageManager {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentSubPage = '';
        this.init();
    }

    // 載入帳號管理內容
    async loadAccountContent(subPage) {
        if (!window.currentUser) return '<div class="error">請先登入</div>';

        // 檢查權限 - 只有管理員可以訪問帳號管理
        if (!window.currentUser.role || window.currentUser.role !== 'admin') {
            return '<div class="error">您沒有權限訪問此頁面</div>';
        }

        switch (subPage) {
            case 'user-list':
                return await this.loadUserList();
            case 'user-add':
                return this.loadUserAddForm();
            case 'role-manage':
                return await this.loadRoleManagement();
            case 'permission-manage':
                return await this.loadPermissionManagement();
            default:
                return await this.loadUserList();
        }
    }

    // 載入系統管理內容
    async loadSystemContent(subPage) {
        if (!window.currentUser) return '<div class="error">請先登入</div>';

        // 檢查權限 - 只有管理員可以訪問系統管理
        if (!window.currentUser.role || window.currentUser.role !== 'admin') {
            return '<div class="error">您沒有權限訪問此頁面</div>';
        }

        switch (subPage) {
            case 'settings':
                return await this.loadSystemSettings();
            case 'logs':
                return await this.loadSystemLogs();
            case 'backup':
                return await this.loadSystemBackup();
            case 'notifications':
                return await this.loadSystemNotifications();
            default:
                return await this.loadSystemSettings();
        }
    }

    // 載入系統設定
    async loadSystemSettings() {
        try {
            // 獲取系統設定
            const settingsDoc = await db.collection('systemSettings').doc('general').get();
            const settings = settingsDoc.exists ? settingsDoc.data() : {};

            let settingsHtml = `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">系統設定</h3>
                        <div class="card-tools">
                            <button class="btn btn-primary" onclick="window.pageManager.saveSystemSettings()">
                                <i class="fas fa-save"></i> 儲存設定
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <form id="systemSettingsForm">
                            <div class="form-section">
                                <h4>基本設定</h4>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label>系統名稱</label>
                                        <input type="text" name="systemName" class="form-control" value="${settings.systemName || '社區打卡管理系統'}" required>
                                    </div>
                                    <div class="form-group">
                                        <label>系統版本</label>
                                        <input type="text" name="systemVersion" class="form-control" value="${settings.systemVersion || '1.0.0'}" readonly>
                                    </div>
                                    <div class="form-group">
                                        <label>時區設定</label>
                                        <select name="timezone" class="form-control">
                                            <option value="Asia/Taipei" ${settings.timezone === 'Asia/Taipei' ? 'selected' : ''}>台北時間 (UTC+8)</option>
                                            <option value="Asia/Tokyo" ${settings.timezone === 'Asia/Tokyo' ? 'selected' : ''}>東京時間 (UTC+9)</option>
                                            <option value="Asia/Hong_Kong" ${settings.timezone === 'Asia/Hong_Kong' ? 'selected' : ''}>香港時間 (UTC+8)</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>語言設定</label>
                                        <select name="language" class="form-control">
                                            <option value="zh-TW" ${settings.language === 'zh-TW' ? 'selected' : ''}>繁體中文</option>
                                            <option value="zh-CN" ${settings.language === 'zh-CN' ? 'selected' : ''}>簡體中文</option>
                                            <option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="form-section">
                                <h4>安全設定</h4>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label>密碼最小長度</label>
                                        <input type="number" name="minPasswordLength" class="form-control" value="${settings.minPasswordLength || '6'}" min="4" max="20">
                                    </div>
                                    <div class="form-group">
                                        <label>密碼複雜度要求</label>
                                        <select name="passwordComplexity" class="form-control">
                                            <option value="none" ${settings.passwordComplexity === 'none' ? 'selected' : ''}>無特殊要求</option>
                                            <option value="medium" ${settings.passwordComplexity === 'medium' ? 'selected' : ''}>中等（需包含大小寫和數字）</option>
                                            <option value="strong" ${settings.passwordComplexity === 'strong' ? 'selected' : ''}>高強度（需包含大小寫、數字和特殊符號）</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>登入嘗試次數限制</label>
                                        <input type="number" name="maxLoginAttempts" class="form-control" value="${settings.maxLoginAttempts || '5'}" min="3" max="10">
                                    </div>
                                    <div class="form-group">
                                        <label>帳號鎖定時間（分鐘）</label>
                                        <input type="number" name="lockoutDuration" class="form-control" value="${settings.lockoutDuration || '30'}" min="5" max="1440">
                                    </div>
                                </div>
                            </div>

                            <div class="form-section">
                                <h4>系統維護</h4>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label>系統維護模式</label>
                                        <select name="maintenanceMode" class="form-control">
                                            <option value="false" ${settings.maintenanceMode === false ? 'selected' : ''}>正常運行</option>
                                            <option value="true" ${settings.maintenanceMode === true ? 'selected' : ''}>維護模式</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>維護訊息</label>
                                        <textarea name="maintenanceMessage" class="form-control" rows="3" placeholder="系統維護時顯示的訊息">${settings.maintenanceMessage || '系統正在維護中，請稍後再試。'}</textarea>
                                    </div>
                                    <div class="form-group">
                                        <label>日誌保留天數</label>
                                        <input type="number" name="logRetentionDays" class="form-control" value="${settings.logRetentionDays || '30'}" min="7" max="365">
                                    </div>
                                    <div class="form-group">
                                        <label>自動備份</label>
                                        <select name="autoBackup" class="form-control">
                                            <option value="true" ${settings.autoBackup !== false ? 'selected' : ''}>啟用</option>
                                            <option value="false" ${settings.autoBackup === false ? 'selected' : ''}>停用</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            return settingsHtml;

        } catch (error) {
            console.error('載入系統設定失敗:', error);
            return '<div class="error">載入系統設定失敗</div>';
        }
    }

    // 載入系統日誌
    async loadSystemLogs() {
        try {
            // 獲取系統日誌（最近100條）
            const logsSnapshot = await db.collection('systemLogs')
                .orderBy('timestamp', 'desc')
                .limit(100)
                .get();

            let logsHtml = `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">系統日誌</h3>
                        <div class="card-tools">
                            <button class="btn btn-outline" onclick="window.pageManager.exportSystemLogs()">
                                <i class="fas fa-download"></i> 匯出日誌
                            </button>
                            <button class="btn btn-outline btn-danger" onclick="window.pageManager.clearSystemLogs()">
                                <i class="fas fa-trash"></i> 清除日誌
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="filter-section">
                            <div class="filter-grid">
                                <div class="filter-group">
                                    <label>日誌等級</label>
                                    <select id="logLevelFilter" class="form-control" onchange="window.pageManager.filterSystemLogs()">
                                        <option value="all">全部</option>
                                        <option value="info">資訊</option>
                                        <option value="warning">警告</option>
                                        <option value="error">錯誤</option>
                                        <option value="debug">除錯</option>
                                    </select>
                                </div>
                                <div class="filter-group">
                                    <label>操作類型</label>
                                    <select id="logActionFilter" class="form-control" onchange="window.pageManager.filterSystemLogs()">
                                        <option value="all">全部</option>
                                        <option value="login">登入</option>
                                        <option value="logout">登出</option>
                                        <option value="create">新增</option>
                                        <option value="update">更新</option>
                                        <option value="delete">刪除</option>
                                    </select>
                                </div>
                                <div class="filter-group">
                                    <label>搜尋</label>
                                    <input type="text" id="logSearch" class="form-control" placeholder="搜尋用戶或操作描述" onkeyup="window.pageManager.filterSystemLogs()">
                                </div>
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>時間</th>
                                        <th>用戶</th>
                                        <th>等級</th>
                                        <th>操作</th>
                                        <th>描述</th>
                                        <th>IP地址</th>
                                    </tr>
                                </thead>
                                <tbody id="systemLogsTableBody">
            `;

            if (logsSnapshot.empty) {
                logsHtml += `
                    <tr>
                        <td colspan="6" style="text-align: center; color: #6c757d;">暫無日誌資料</td>
                    </tr>
                `;
            } else {
                logsSnapshot.forEach(doc => {
                    const log = doc.data();
                    logsHtml += `
                        <tr data-level="${log.level || 'info'}" data-action="${log.action || ''}">
                            <td>${log.timestamp ? firebaseUtils.formatTimestamp(log.timestamp) : '-'}</td>
                            <td>${log.userName || log.userId || '系統'}</td>
                            <td><span class="badge badge-${log.level === 'error' ? 'danger' : log.level === 'warning' ? 'warning' : 'info'}">${log.level || 'info'}</span></td>
                            <td><span class="badge badge-outline">${log.action || '-'}</span></td>
                            <td>${log.description || '-'}</td>
                            <td><small>${log.ipAddress || '-'}</small></td>
                        </tr>
                    `;
                });
            }

            logsHtml += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            return logsHtml;

        } catch (error) {
            console.error('載入系統日誌失敗:', error);
            return '<div class="error">載入系統日誌失敗</div>';
        }
    }

    // 載入系統備份
    async loadSystemBackup() {
        try {
            // 獲取備份記錄
            const backupsSnapshot = await db.collection('systemBackups')
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();

            let backupHtml = `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">系統備份管理</h3>
                        <div class="card-tools">
                            <button class="btn btn-primary" onclick="window.pageManager.createSystemBackup()">
                                <i class="fas fa-plus"></i> 立即備份
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="backup-info">
                            <div class="info-item">
                                <h4>自動備份設定</h4>
                                <p>系統將每日凌晨 2:00 自動執行備份</p>
                            </div>
                            <div class="info-item">
                                <h4>備份保留政策</h4>
                                <p>保留最近 30 天的備份檔案</p>
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>備份時間</th>
                                        <th>檔案大小</th>
                                        <th>備份類型</th>
                                        <th>狀態</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
            `;

            if (backupsSnapshot.empty) {
                backupHtml += `
                    <tr>
                        <td colspan="5" style="text-align: center; color: #6c757d;">暫無備份記錄</td>
                    </tr>
                `;
            } else {
                backupsSnapshot.forEach(doc => {
                    const backup = doc.data();
                    backupHtml += `
                        <tr>
                            <td>${backup.createdAt ? firebaseUtils.formatTimestamp(backup.createdAt) : '-'}</td>
                            <td>${backup.fileSize || '未知'}</td>
                            <td><span class="badge badge-info">${backup.backupType || '完整備份'}</span></td>
                            <td><span class="badge badge-${backup.status === 'completed' ? 'success' : backup.status === 'failed' ? 'danger' : 'warning'}">${backup.status || 'unknown'}</span></td>
                            <td>
                                <button class="btn btn-sm btn-outline" onclick="window.pageManager.downloadBackup('${doc.id}')" ${backup.status !== 'completed' ? 'disabled' : ''}>
                                    <i class="fas fa-download"></i> 下載
                                </button>
                                <button class="btn btn-sm btn-outline btn-danger" onclick="window.pageManager.deleteBackup('${doc.id}')">
                                    <i class="fas fa-trash"></i> 刪除
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }

            backupHtml += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            return backupHtml;

        } catch (error) {
            console.error('載入系統備份失敗:', error);
            return '<div class="error">載入系統備份失敗</div>';
        }
    }

    // 載入系統通知設定
    async loadSystemNotifications() {
        try {
            // 獲取通知設定
            const notificationsDoc = await db.collection('systemSettings').doc('notifications').get();
            const notifications = notificationsDoc.exists ? notificationsDoc.data() : {};

            let notificationsHtml = `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">系統通知設定</h3>
                        <div class="card-tools">
                            <button class="btn btn-primary" onclick="window.pageManager.saveNotificationSettings()">
                                <i class="fas fa-save"></i> 儲存設定
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <form id="notificationSettingsForm">
                            <div class="form-section">
                                <h4>郵件通知設定</h4>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label>SMTP 伺服器</label>
                                        <input type="text" name="smtpServer" class="form-control" value="${notifications.smtpServer || ''}" placeholder="smtp.gmail.com">
                                    </div>
                                    <div class="form-group">
                                        <label>SMTP 端口</label>
                                        <input type="number" name="smtpPort" class="form-control" value="${notifications.smtpPort || '587'}" min="1" max="65535">
                                    </div>
                                    <div class="form-group">
                                        <label>SMTP 用戶名</label>
                                        <input type="text" name="smtpUsername" class="form-control" value="${notifications.smtpUsername || ''}" placeholder="your-email@gmail.com">
                                    </div>
                                    <div class="form-group">
                                        <label>SMTP 密碼</label>
                                        <input type="password" name="smtpPassword" class="form-control" value="" placeholder="留空表示不變更">
                                    </div>
                                    <div class="form-group">
                                        <label>啟用 SSL/TLS</label>
                                        <select name="smtpSSL" class="form-control">
                                            <option value="true" ${notifications.smtpSSL !== false ? 'selected' : ''}>啟用</option>
                                            <option value="false" ${notifications.smtpSSL === false ? 'selected' : ''}>停用</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>寄件者名稱</label>
                                        <input type="text" name="senderName" class="form-control" value="${notifications.senderName || '社區打卡系統'}">
                                    </div>
                                </div>
                            </div>

                            <div class="form-section">
                                <h4>通知觸發條件</h4>
                                <div class="notification-rules">
                                    <div class="rule-item">
                                        <label class="rule-label">
                                            <input type="checkbox" name="notifyLogin" ${notifications.notifyLogin !== false ? 'checked' : ''}>
                                            <span class="checkmark"></span>
                                            用戶登入通知
                                        </label>
                                        <p class="rule-description">當用戶登入系統時發送通知</p>
                                    </div>
                                    <div class="rule-item">
                                        <label class="rule-label">
                                            <input type="checkbox" name="notifyFailedLogin" ${notifications.notifyFailedLogin !== false ? 'checked' : ''}>
                                            <span class="checkmark"></span>
                                            登入失敗通知
                                        </label>
                                        <p class="rule-description">當用戶登入失敗時發送通知</p>
                                    </div>
                                    <div class="rule-item">
                                        <label class="rule-label">
                                            <input type="checkbox" name="notifyPasswordChange" ${notifications.notifyPasswordChange !== false ? 'checked' : ''}>
                                            <span class="checkmark"></span>
                                            密碼變更通知
                                        </label>
                                        <p class="rule-description">當用戶變更密碼時發送通知</p>
                                    </div>
                                    <div class="rule-item">
                                        <label class="rule-label">
                                            <input type="checkbox" name="notifySystemError" ${notifications.notifySystemError !== false ? 'checked' : ''}>
                                            <span class="checkmark"></span>
                                            系統錯誤通知
                                        </label>
                                        <p class="rule-description">當系統發生錯誤時發送通知</p>
                                    </div>
                                </div>
                            </div>

                            <div class="form-section">
                                <h4>管理員通知設定</h4>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label>管理員郵箱</label>
                                        <input type="email" name="adminEmail" class="form-control" value="${notifications.adminEmail || ''}" placeholder="admin@example.com">
                                        <small class="form-text text-muted">多個郵箱請用逗號分隔</small>
                                    </div>
                                    <div class="form-group">
                                        <label>通知時間範圍</label>
                                        <select name="notificationHours" class="form-control">
                                            <option value="24" ${notifications.notificationHours === '24' ? 'selected' : ''}>24小時</option>
                                            <option value="08-18" ${notifications.notificationHours === '08-18' ? 'selected' : ''}>上班時間 (08:00-18:00)</option>
                                            <option value="09-17" ${notifications.notificationHours === '09-17' ? 'selected' : ''}>辦公時間 (09:00-17:00)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            return notificationsHtml;

        } catch (error) {
            console.error('載入系統通知設定失敗:', error);
            return '<div class="error">載入系統通知設定失敗</div>';
        }
    }

    // 載入用戶列表
    async loadUserList() {
        try {
            const usersSnapshot = await db.collection('users')
                .orderBy('createdAt', 'desc')
                .get();

            let usersHtml = `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">用戶管理</h3>
                        <div class="card-tools">
                            <button class="btn btn-primary" onclick="window.pageManager.showAddUser()">
                                <i class="fas fa-plus"></i> 新增用戶
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="filter-section">
                            <div class="filter-grid">
                                <div class="filter-group">
                                    <label>狀態篩選</label>
                                    <select id="userStatusFilter" class="form-control" onchange="window.pageManager.filterUsers()">
                                        <option value="all">全部</option>
                                        <option value="active">啟用</option>
                                        <option value="inactive">停用</option>
                                    </select>
                                </div>
                                <div class="filter-group">
                                    <label>角色篩選</label>
                                    <select id="userRoleFilter" class="form-control" onchange="window.pageManager.filterUsers()">
                                        <option value="all">全部角色</option>
                                        <option value="admin">管理員</option>
                                        <option value="manager">主管</option>
                                        <option value="employee">員工</option>
                                    </select>
                                </div>
                                <div class="filter-group">
                                    <label>搜尋</label>
                                    <input type="text" id="userSearch" class="form-control" placeholder="搜尋姓名或員工編號" onkeyup="window.pageManager.searchUsers()">
                                </div>
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>員工編號</th>
                                        <th>姓名</th>
                                        <th>部門</th>
                                        <th>職位</th>
                                        <th>角色</th>
                                        <th>狀態</th>
                                        <th>建立時間</th>
                                        <th>最後登入</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody id="userTableBody">
            `;

            if (usersSnapshot.empty) {
                usersHtml += `
                    <tr>
                        <td colspan="9" style="text-align: center; color: #6c757d;">暫無用戶資料</td>
                    </tr>
                `;
            } else {
                usersSnapshot.forEach(doc => {
                    const user = doc.data();
                    const userId = doc.id;
                    usersHtml += `
                        <tr data-user-id="${userId}" data-status="${user.status || 'active'}" data-role="${user.role || 'employee'}">
                            <td>${user.employeeId || '-'}</td>
                            <td>${user.name || '-'}</td>
                            <td>${user.department || '-'}</td>
                            <td>${user.position || '-'}</td>
                            <td><span class="badge badge-${user.role === 'admin' ? 'danger' : user.role === 'manager' ? 'warning' : 'info'}">${firebaseUtils.getRoleDisplayName(user.role)}</span></td>
                            <td><span class="badge badge-${user.status === 'active' ? 'success' : 'secondary'}">${user.status === 'active' ? '啟用' : '停用'}</span></td>
                            <td>${user.createdAt ? firebaseUtils.formatTimestamp(user.createdAt) : '-'}</td>
                            <td>${user.lastLoginAt ? firebaseUtils.formatTimestamp(user.lastLoginAt) : '從未登入'}</td>
                            <td>
                                <button class="btn btn-sm btn-outline" onclick="window.pageManager.viewUserDetail('${userId}')" title="查看詳情">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-outline" onclick="window.pageManager.editUser('${userId}')" title="編輯">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline ${user.status === 'active' ? 'btn-warning' : 'btn-success'}" onclick="window.pageManager.toggleUserStatus('${userId}', '${user.status || 'active'}')" title="${user.status === 'active' ? '停用' : '啟用'}">
                                    <i class="fas fa-${user.status === 'active' ? 'pause' : 'play'}"></i>
                                </button>
                                <button class="btn btn-sm btn-outline btn-danger" onclick="window.pageManager.resetUserPassword('${userId}')" title="重設密碼">
                                    <i class="fas fa-key"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }

            usersHtml += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            return usersHtml;

        } catch (error) {
            console.error('載入用戶列表失敗:', error);
            return '<div class="error">載入用戶列表失敗</div>';
        }
    }

    // 載入新增用戶表單
    loadUserAddForm() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">新增用戶</h3>
                    <div class="card-tools">
                        <button class="btn btn-secondary" onclick="window.pageManager.loadUserList()">
                            <i class="fas fa-arrow-left"></i> 返回列表
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <form id="userAddForm" onsubmit="window.pageManager.submitUserAddForm(event)">
                        <div class="form-section">
                            <h4>基本資訊</h4>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>員工編號 <span class="required">*</span></label>
                                    <input type="text" name="employeeId" class="form-control" required pattern="[A-Z0-9]{6,10}" title="請輸入6-10位英數字">
                                </div>
                                <div class="form-group">
                                    <label>姓名 <span class="required">*</span></label>
                                    <input type="text" name="name" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label>部門</label>
                                    <select name="department" class="form-control">
                                        <option value="">請選擇部門</option>
                                        <option value="管理處">管理處</option>
                                        <option value="人資部">人資部</option>
                                        <option value="財務部">財務部</option>
                                        <option value="業務部">業務部</option>
                                        <option value="技術部">技術部</option>
                                        <option value="客服部">客服部</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>職位</label>
                                    <input type="text" name="position" class="form-control" placeholder="例如：專員、主管、經理">
                                </div>
                                <div class="form-group">
                                    <label>角色 <span class="required">*</span></label>
                                    <select name="role" class="form-control" required>
                                        <option value="">請選擇角色</option>
                                        <option value="employee">員工</option>
                                        <option value="manager">主管</option>
                                        <option value="admin">管理員</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>狀態</label>
                                    <select name="status" class="form-control">
                                        <option value="active">啟用</option>
                                        <option value="inactive">停用</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <h4>聯絡資訊</h4>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>電話</label>
                                    <input type="tel" name="phone" class="form-control" pattern="[0-9]{10}" title="請輸入10位電話號碼">
                                </div>
                                <div class="form-group">
                                    <label>電子郵件</label>
                                    <input type="email" name="email" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label>緊急聯絡人</label>
                                    <input type="text" name="emergencyContact" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label>緊急聯絡電話</label>
                                    <input type="tel" name="emergencyPhone" class="form-control" pattern="[0-9]{10}" title="請輸入10位電話號碼">
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <h4>系統設定</h4>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>初始密碼 <span class="required">*</span></label>
                                    <input type="password" name="password" class="form-control" required minlength="6" value="Temp123456">
                                    <small class="form-text text-muted">預設密碼：Temp123456（建議用戶首次登入後修改）</small>
                                </div>
                                <div class="form-group">
                                    <label>備註</label>
                                    <textarea name="notes" class="form-control" rows="3"></textarea>
                                </div>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> 新增用戶
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="window.pageManager.loadUserList()">
                                <i class="fas fa-times"></i> 取消
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    // 載入角色管理
    async loadRoleManagement() {
        try {
            // 獲取所有角色配置
            const rolesSnapshot = await db.collection('roles').get();
            
            let rolesHtml = `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">角色管理</h3>
                        <div class="card-tools">
                            <button class="btn btn-primary" onclick="window.pageManager.showAddRole()">
                                <i class="fas fa-plus"></i> 新增角色
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>角色代碼</th>
                                        <th>角色名稱</th>
                                        <th>描述</th>
                                        <th>權限數量</th>
                                        <th>用戶數量</th>
                                        <th>狀態</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
            `;

            const roleData = [];
            rolesSnapshot.forEach(doc => {
                roleData.push({ id: doc.id, ...doc.data() });
            });

            // 內建角色
            const builtInRoles = [
                { id: 'admin', code: 'admin', name: '管理員', description: '系統管理員，擁有所有權限', permissions: [], userCount: 0, status: 'active' },
                { id: 'manager', code: 'manager', name: '主管', description: '部門主管，管理團隊成員', permissions: [], userCount: 0, status: 'active' },
                { id: 'employee', code: 'employee', name: '員工', description: '一般員工，基本功能權限', permissions: [], userCount: 0, status: 'active' }
            ];

            const allRoles = [...builtInRoles, ...roleData];

            for (const role of allRoles) {
                // 計算用戶數量
                const userCountSnapshot = await db.collection('users').where('role', '==', role.code).get();
                role.userCount = userCountSnapshot.size;

                rolesHtml += `
                    <tr data-role-id="${role.id}">
                        <td>${role.code}</td>
                        <td>${role.name}</td>
                        <td>${role.description}</td>
                        <td>${role.permissions?.length || 0}</td>
                        <td>${role.userCount}</td>
                        <td><span class="badge badge-${role.status === 'active' ? 'success' : 'secondary'}">${role.status === 'active' ? '啟用' : '停用'}</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline" onclick="window.pageManager.editRolePermissions('${role.id}')" title="編輯權限">
                                <i class="fas fa-shield-alt"></i>
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="window.pageManager.viewRoleDetail('${role.id}')" title="查看詳情">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${!['admin', 'manager', 'employee'].includes(role.code) ? `
                                <button class="btn btn-sm btn-outline btn-danger" onclick="window.pageManager.deleteRole('${role.id}')" title="刪除">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </td>
                    </tr>
                `;
            }

            rolesHtml += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            return rolesHtml;

        } catch (error) {
            console.error('載入角色管理失敗:', error);
            return '<div class="error">載入角色管理失敗</div>';
        }
    }

    // 載入權限管理
    async loadPermissionManagement() {
        try {
            // 系統內建模組權限
            const systemPermissions = [
                { module: 'dashboard', name: '儀表板', permissions: ['view'] },
                { module: 'personal', name: '個人資訊', permissions: ['view', 'edit'] },
                { module: 'checkin', name: '打卡管理', permissions: ['view', 'add', 'edit', 'delete'] },
                { module: 'leave', name: '請假管理', permissions: ['view', 'add', 'edit', 'approve'] },
                { module: 'reward', name: '獎懲管理', permissions: ['view', 'add', 'edit'] },
                { module: 'task', name: '任務指派', permissions: ['view', 'add', 'edit', 'assign'] },
                { module: 'community', name: '社區管理', permissions: ['view', 'add', 'edit', 'delete'] },
                { module: 'account', name: '帳號管理', permissions: ['view', 'add', 'edit', 'delete'] },
                { module: 'system', name: '系統管理', permissions: ['view', 'edit'] }
            ];

            let permissionsHtml = `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">系統權限管理</h3>
                        <div class="card-tools">
                            <button class="btn btn-primary" onclick="window.pageManager.showAddPermission()">
                                <i class="fas fa-plus"></i> 新增權限
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="permission-matrix">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>模組</th>
                                        <th>檢視</th>
                                        <th>新增</th>
                                        <th>編輯</th>
                                        <th>刪除</th>
                                        <th>審核</th>
                                        <th>指派</th>
                                    </tr>
                                </thead>
                                <tbody>
            `;

            systemPermissions.forEach(module => {
                permissionsHtml += `
                    <tr data-module="${module.module}">
                        <td><strong>${module.name}</strong></td>
                `;

                const allPermissions = ['view', 'add', 'edit', 'delete', 'approve', 'assign'];
                allPermissions.forEach(permission => {
                    const hasPermission = module.permissions.includes(permission);
                    permissionsHtml += `
                        <td>
                            <label class="permission-checkbox">
                                <input type="checkbox" ${hasPermission ? 'checked' : ''} 
                                       onchange="window.pageManager.toggleModulePermission('${module.module}', '${permission}', this.checked)">
                                <span class="checkmark"></span>
                            </label>
                        </td>
                    `;
                });

                permissionsHtml += `
                    </tr>
                `;
            });

            permissionsHtml += `
                                </tbody>
                            </table>
                        </div>
                        <div class="permission-actions">
                            <button class="btn btn-primary" onclick="window.pageManager.savePermissionSettings()">
                                <i class="fas fa-save"></i> 儲存設定
                            </button>
                            <button class="btn btn-secondary" onclick="window.pageManager.resetPermissions()">
                                <i class="fas fa-undo"></i> 重設為預設值
                            </button>
                        </div>
                    </div>
                </div>
            `;

            return permissionsHtml;

        } catch (error) {
            console.error('載入權限管理失敗:', error);
            return '<div class="error">載入權限管理失敗</div>';
        }
    }

    init() {
        this.bindNavigationEvents();
        this.loadPage('dashboard'); // 預設載入儀表板
    }

    // 綁定導航事件
    bindNavigationEvents() {
        // 主導航按鈕
        const navItems = document.querySelectorAll('.nav-item[data-page]');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                if (page) {
                    this.loadPage(page);
                }
            });
        });
    }

    // 載入頁面
    async loadPage(pageName, subPage = '') {
        try {
            // 檢查權限
            if (!this.checkPagePermission(pageName)) {
                this.showError('您沒有權限訪問此頁面');
                return;
            }

            // 更新當前頁面
            this.currentPage = pageName;
            this.currentSubPage = subPage;

            // 更新導航狀態
            this.updateNavigationState(pageName);

            // 更新頁面標題
            this.updatePageTitle(pageName);

            // 載入子頁面導航
            this.loadSubNavigation(pageName);

            // 載入頁面內容
            await this.loadPageContent(pageName, subPage);

            // 關閉手機版側邊欄
            if (window.innerWidth <= 768) {
                this.closeSidebar();
            }

        } catch (error) {
            console.error('載入頁面失敗:', error);
            this.showError('載入頁面失敗，請稍後再試');
        }
    }

    // 檢查頁面權限
    checkPagePermission(pageName) {
        if (!window.currentUser) return false;
        
        const userRole = window.currentUser.role;
        const allowedPages = PERMISSIONS[userRole] || [];
        
        return allowedPages.includes(pageName);
    }

    // 更新導航狀態
    updateNavigationState(pageName) {
        // 移除所有活動狀態
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // 設定當前頁面為活動狀態
        const currentNavItem = document.querySelector(`[data-page="${pageName}"]`);
        if (currentNavItem) {
            currentNavItem.classList.add('active');
        }
    }

    // 更新頁面標題
    updatePageTitle(pageName) {
        const pageTitle = document.getElementById('pageTitle');
        const pageConfig = PAGE_STRUCTURE[pageName];
        
        if (pageTitle && pageConfig) {
            pageTitle.textContent = pageConfig.title;
        }
    }

    // 載入子頁面導航
    loadSubNavigation(pageName) {
        const subNav = document.getElementById('subNav');
        const pageConfig = PAGE_STRUCTURE[pageName];
        
        if (!subNav || !pageConfig) return;

        // 清空現有子導航
        subNav.innerHTML = '';

        // 如果沒有子頁面，隱藏子導航
        if (!pageConfig.subPages || pageConfig.subPages.length === 0) {
            subNav.style.display = 'none';
            return;
        }

        // 顯示子導航
        subNav.style.display = 'flex';

        // 創建子頁面按鈕
        pageConfig.subPages.forEach((subPage, index) => {
            const button = document.createElement('button');
            button.className = 'sub-nav-btn';
            button.textContent = subPage;
            button.onclick = () => this.loadSubPage(pageName, subPage);
            
            // 設定第一個子頁面為預設
            if (index === 0 && !this.currentSubPage) {
                button.classList.add('active');
                this.currentSubPage = subPage;
            } else if (subPage === this.currentSubPage) {
                button.classList.add('active');
            }
            
            subNav.appendChild(button);
        });
    }

    // 載入子頁面
    loadSubPage(pageName, subPageName) {
        this.currentSubPage = subPageName;
        
        // 更新子頁面按鈕狀態
        document.querySelectorAll('.sub-nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent === subPageName) {
                btn.classList.add('active');
            }
        });
        
        // 載入子頁面內容
        this.loadPageContent(pageName, subPageName);
    }

    // 載入頁面內容
    async loadPageContent(pageName, subPageName = '') {
        const contentArea = document.getElementById('pageContent');
        
        if (!contentArea) return;

        // 顯示載入中
        contentArea.innerHTML = '<div class="loading"></div>';

        try {
            let content = '';

            // 根據頁面名稱載入對應內容
            switch (pageName) {
                case 'dashboard':
                    content = await this.loadDashboardContent();
                    break;
                case 'personal':
                    content = await this.loadPersonalContent(subPageName);
                    break;
                case 'checkin':
                    content = await this.loadCheckinContent(subPageName);
                    break;
                case 'schedule':
                    content = await this.loadScheduleContent(subPageName);
                    break;
                case 'leave':
                    content = await this.loadLeaveContent(subPageName);
                    break;
                case 'reward':
                    content = await this.loadRewardContent(subPageName);
                    break;
                case 'task':
                    content = await this.loadTaskContent(subPageName);
                    break;
                case 'training':
                    content = await this.loadTrainingContent(subPageName);
                    break;
                case 'community':
                    content = await this.loadCommunityContent(subPageName);
                    break;
                case 'account':
                    content = await this.loadAccountContent(subPageName);
                    break;
                case 'system':
                    content = await this.loadSystemContent(subPageName);
                    break;
                default:
                    content = '<div class="error">頁面不存在</div>';
            }

            contentArea.innerHTML = content;

            // 綁定頁面內容的事件
            this.bindPageEvents(pageName, subPageName);

        } catch (error) {
            console.error('載入頁面內容失敗:', error);
            contentArea.innerHTML = '<div class="error">載入頁面內容失敗，請稍後再試</div>';
        }
    }

    // 載入儀表板內容
    async loadDashboardContent() {
        if (!window.currentUser) return '<div class="error">請先登入</div>';

        return `
            <div class="dashboard-content">
                <div class="form-grid">
                    <div class="form-card">
                        <h3><i class="fas fa-calendar-day"></i> 目前班表</h3>
                        <div id="currentSchedule">
                            ${await this.loadCurrentSchedule()}
                        </div>
                    </div>
                    
                    <div class="form-card">
                        <h3><i class="fas fa-tasks"></i> 任務訊息</h3>
                        <div id="taskMessages">
                            ${await this.loadTaskMessages()}
                        </div>
                    </div>
                    
                    <div class="form-card">
                        <h3><i class="fas fa-chart-line"></i> 個人績效</h3>
                        <div id="personalPerformance">
                            ${await this.loadPersonalPerformance()}
                        </div>
                    </div>
                    
                    <div class="form-card">
                        <h3><i class="fas fa-clock"></i> 上班狀態</h3>
                        <div id="workStatus">
                            ${await this.loadWorkStatus()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 載入個人資訊內容
    async loadPersonalContent(subPage) {
        if (!window.currentUser) return '<div class="error">請先登入</div>';

        switch (subPage) {
            case '基本資料':
                return this.loadPersonalInfo();
            case '帳號密碼':
                return this.loadAccountPassword();
            case '登入紀錄':
                return await this.loadLoginHistory();
            default:
                return this.loadPersonalInfo();
        }
    }

    // 載入基本資料
    loadPersonalInfo() {
        const user = window.currentUser;
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">基本資料</h3>
                    <button class="btn btn-primary" onclick="window.pageManager.editPersonalInfo()">
                        <i class="fas fa-edit"></i> 編輯
                    </button>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>員工編號</label>
                        <input type="text" value="${user.employeeId}" readonly class="form-control">
                    </div>
                    <div class="form-group">
                        <label>姓名</label>
                        <input type="text" value="${user.name}" readonly class="form-control">
                    </div>
                    <div class="form-group">
                        <label>部門</label>
                        <input type="text" value="${user.department || ''}" readonly class="form-control">
                    </div>
                    <div class="form-group">
                        <label>職位</label>
                        <input type="text" value="${firebaseUtils.getRoleDisplayName(user.role)}" readonly class="form-control">
                    </div>
                    <div class="form-group">
                        <label>電話</label>
                        <input type="text" value="${user.phone || ''}" readonly class="form-control">
                    </div>
                    <div class="form-group">
                        <label>電子郵件</label>
                        <input type="text" value="${user.email || ''}" readonly class="form-control">
                    </div>
                </div>
            </div>
        `;
    }

    // 載入帳號密碼
    loadAccountPassword() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">修改密碼</h3>
                </div>
                <form id="changePasswordForm" onsubmit="window.pageManager.handlePasswordChange(event)">
                    <div class="form-group">
                        <label>目前密碼</label>
                        <input type="password" id="currentPassword" required class="form-control">
                    </div>
                    <div class="form-group">
                        <label>新密碼</label>
                        <input type="password" id="newPassword" required class="form-control" minlength="6">
                    </div>
                    <div class="form-group">
                        <label>確認新密碼</label>
                        <input type="password" id="confirmPassword" required class="form-control" minlength="6">
                    </div>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-key"></i> 修改密碼
                    </button>
                </form>
                <div id="passwordChangeMessage" class="error-message"></div>
            </div>
        `;
    }

    // 載入登入紀錄
    async loadLoginHistory() {
        try {
            const userId = window.currentUser.employeeId;
            const logsSnapshot = await db.collection('loginLogs')
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get();

            let logsHtml = `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">最近登入紀錄</h3>
                    </div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>時間</th>
                                <th>動作</th>
                                <th>IP位址</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            if (logsSnapshot.empty) {
                logsHtml += `
                    <tr>
                        <td colspan="3" style="text-align: center; color: #6c757d;">暫無登入紀錄</td>
                    </tr>
                `;
            } else {
                logsSnapshot.forEach(doc => {
                    const log = doc.data();
                    logsHtml += `
                        <tr>
                            <td>${firebaseUtils.formatTimestamp(log.timestamp)}</td>
                            <td>${log.action === 'login' ? '登入' : '登出'}</td>
                            <td>${log.ip || '未知'}</td>
                        </tr>
                    `;
                });
            }

            logsHtml += `
                        </tbody>
                    </table>
                </div>
            `;

            return logsHtml;

        } catch (error) {
            console.error('載入登入紀錄失敗:', error);
            return '<div class="error">載入登入紀錄失敗</div>';
        }
    }

    // 載入目前班表（簡化版本）
    async loadCurrentSchedule() {
        return `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-calendar-day" style="font-size: 48px; color: #dc3545; margin-bottom: 15px;"></i>
                <h4>今日班表</h4>
                <p style="color: #6c757d;">早班 08:00-16:00</p>
                <p style="color: #28a745;">出勤中</p>
            </div>
        `;
    }

    // 載入任務訊息（簡化版本）
    async loadTaskMessages() {
        return `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-tasks" style="font-size: 48px; color: #007bff; margin-bottom: 15px;"></i>
                <h4>待辦任務</h4>
                <p style="color: #6c757d;">您有 3 項待辦任務</p>
                <button class="btn btn-primary" style="margin-top: 10px;">查看詳情</button>
            </div>
        `;
    }

    // 載入個人績效（簡化版本）
    async loadPersonalPerformance() {
        return `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-chart-line" style="font-size: 48px; color: #28a745; margin-bottom: 15px;"></i>
                <h4>本月績效</h4>
                <p style="color: #6c757d;">出勤率: 98%</p>
                <p style="color: #28a745;">表現優秀</p>
            </div>
        `;
    }

    // 載入上班狀態（簡化版本）
    async loadWorkStatus() {
        return `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-clock" style="font-size: 48px; color: #ffc107; margin-bottom: 15px;"></i>
                <h4>上班狀態</h4>
                <p style="color: #6c757d;">已上班 4小時 32分</p>
                <p style="color: #28a745;">正常出勤</p>
            </div>
        `;
    }

    // 載入教育訓練內容
    async loadTrainingContent(subPage) {
        if (!window.currentUser) return '<div class="error">請先登入</div>';

        switch (subPage) {
            case '保全':
                return this.loadSecurityTraining();
            case '物業':
                return this.loadPropertyTraining();
            default:
                return this.loadSecurityTraining();
        }
    }

    // 載入定位打卡內容
    async loadCheckinContent(subPage) {
        if (!window.currentUser) return '<div class="error">請先登入</div>';

        switch (subPage) {
            case '打卡頁面':
                return this.loadCheckinPage();
            case '打卡紀錄':
                return this.loadCheckinHistory();
            default:
                return this.loadCheckinPage();
        }
    }

    // 載入勤務排班內容
    async loadScheduleContent(subPage) {
        if (!window.currentUser) return '<div class="error">請先登入</div>';

        switch (subPage) {
            case '人員排班':
                return this.loadPersonnelSchedule();
            case '社區排班':
                return this.loadCommunitySchedule();
            case '表單印製':
                return this.loadScheduleForms();
            default:
                return this.loadPersonnelSchedule();
        }
    }

    // 載入打卡頁面
    async loadCheckinPage() {
        setTimeout(() => {
            this.initLocationServices();
        }, 500);
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-map-marker-alt"></i> 定位打卡
                    </h3>
                </div>
                <div class="card-body">
                    <div class="checkin-container">
                        <div class="location-status" id="locationStatus">
                            <i class="fas fa-crosshairs"></i>
                            <p>正在獲取您的位置...</p>
                        </div>
                        
                        <div class="current-time" id="currentTime">
                            <i class="fas fa-clock"></i>
                            <span>--:--:--</span>
                        </div>
                        
                        <div class="map-container" id="mapContainer" style="display: none;">
                            <div id="miniMap" style="height: 300px; border-radius: 8px;"></div>
                        </div>
                        
                        <div class="checkin-info" id="checkinInfo" style="display: none;">
                            <div class="info-item">
                                <i class="fas fa-map-pin"></i>
                                <span id="locationText">位置載入中...</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-building"></i>
                                <span id="communityText">社區載入中...</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-user"></i>
                                <span id="statusText">狀態載入中...</span>
                            </div>
                        </div>
                        
                        <div class="checkin-actions">
                            <button class="btn btn-success btn-lg" id="checkinBtn" onclick="window.pageManager.handleCheckin()" disabled>
                                <i class="fas fa-sign-in-alt"></i> 上班打卡
                            </button>
                            <button class="btn btn-warning btn-lg" id="checkoutBtn" onclick="window.pageManager.handleCheckout()" disabled>
                                <i class="fas fa-sign-out-alt"></i> 下班打卡
                            </button>
                        </div>
                        
                        <div class="checkin-status" id="checkinStatus" style="display: none;">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i>
                                <span id="statusMessage">準備打卡...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 載入打卡紀錄
    async loadCheckinHistory() {
        setTimeout(() => {
            this.loadCheckinHistoryData();
        }, 500);
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-history"></i> 打卡紀錄
                    </h3>
                    <div class="card-tools">
                        <div class="input-group input-group-sm" style="width: 200px;">
                            <input type="date" class="form-control" id="historyDateFilter" value="${new Date().toISOString().split('T')[0]}">
                            <div class="input-group-append">
                                <button class="btn btn-default" onclick="window.pageManager.loadCheckinHistoryData()">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div id="checkinHistoryList">
                        <div class="text-center">
                            <i class="fas fa-spinner fa-spin"></i> 載入中...
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 載入保全訓練內容
    loadSecurityTraining() {
        const user = window.currentUser;
        const role = user.role;
        
        let trainingContent = '';
        
        if (role === USER_ROLES.ADMIN) {
            trainingContent = `
                <div class="training-module">
                    <h4><i class="fas fa-shield-alt"></i> 保全管理進階課程</h4>
                    <ul>
                        <li>保全服務品質管理與提升策略</li>
                        <li>風險評估與危機處理進階</li>
                        <li>保全人員績效管理與考核</li>
                        <li>保全服務標準作業程序制定</li>
                    </ul>
                    <button class="btn btn-primary">開始訓練</button>
                </div>
            `;
        } else if (role === USER_ROLES.SENIOR_MANAGER) {
            trainingContent = `
                <div class="training-module">
                    <h4><i class="fas fa-users-cog"></i> 團隊管理訓練</h4>
                    <ul>
                        <li>保全團隊領導與激勵技巧</li>
                        <li>人員招聘與培訓規劃</li>
                        <li>績效評估與回饋技巧</li>
                        <li>衝突處理與溝通協調</li>
                    </ul>
                    <button class="btn btn-primary">開始訓練</button>
                </div>
            `;
        } else if (role === USER_ROLES.JUNIOR_MANAGER) {
            trainingContent = `
                <div class="training-module">
                    <h4><i class="fas fa-user-tie"></i> 基礎管理技能</h4>
                    <ul>
                        <li>保全人員日常工作指導</li>
                        <li>班表編排與人力調配</li>
                        <li>基本督導與考核技巧</li>
                        <li>工作報告撰寫與呈報</li>
                    </ul>
                    <button class="btn btn-primary">開始訓練</button>
                </div>
            `;
        } else {
            trainingContent = `
                <div class="training-module">
                    <h4><i class="fas fa-shield-alt"></i> 基礎保全訓練</h4>
                    <ul>
                        <li>保全服務基本禮儀與態度</li>
                        <li>門禁管制與訪客登記</li>
                        <li>巡邏技巧與注意事項</li>
                        <li>緊急事件通報流程</li>
                        <li>消防安全基本知識</li>
                    </ul>
                    <button class="btn btn-primary">開始訓練</button>
                </div>
            `;
        }

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">保全教育訓練</h3>
                </div>
                <div class="training-content">
                    ${trainingContent}
                </div>
            </div>
        `;
    }

    // 載入物業訓練內容
    loadPropertyTraining() {
        const user = window.currentUser;
        const role = user.role;
        
        let trainingContent = '';
        
        if (role === USER_ROLES.ADMIN) {
            trainingContent = `
                <div class="training-module">
                    <h4><i class="fas fa-building"></i> 物業管理進階</h4>
                    <ul>
                        <li>物業管理策略規劃</li>
                        <li>設施維護與更新管理</li>
                        <li>物業服務品質提升</li>
                        <li>客戶關係管理進階</li>
                    </ul>
                    <button class="btn btn-primary">開始訓練</button>
                </div>
            `;
        } else if (role === USER_ROLES.SENIOR_MANAGER) {
            trainingContent = `
                <div class="training-module">
                    <h4><i class="fas fa-tools"></i> 設施管理訓練</h4>
                    <ul>
                        <li>建築設施維護管理</li>
                        <li>機電設備保養規劃</li>
                        <li>節能減碳措施實施</li>
                        <li>設備更新與採購管理</li>
                    </ul>
                    <button class="btn btn-primary">開始訓練</button>
                </div>
            `;
        } else if (role === USER_ROLES.JUNIOR_MANAGER) {
            trainingContent = `
                <div class="training-module">
                    <h4><i class="fas fa-wrench"></i> 基礎維護訓練</h4>
                    <ul>
                        <li>日常維護工作督導</li>
                        <li>維修品質檢查</li>
                        <li>維護記錄管理</li>
                        <li>供應商協調管理</li>
                    </ul>
                    <button class="btn btn-primary">開始訓練</button>
                </div>
            `;
        } else {
            trainingContent = `
                <div class="training-module">
                    <h4><i class="fas fa-home"></i> 基礎物業訓練</h4>
                    <ul>
                        <li>物業服務基本禮儀</li>
                        <li>公共區域維護保養</li>
                        <li>環境清潔維護標準</li>
                        <li>設備操作安全須知</li>
                        <li>住戶服務基本態度</li>
                    </ul>
                    <button class="btn btn-primary">開始訓練</button>
                </div>
            `;
        }

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">物業管理訓練</h3>
                </div>
                <div class="training-content">
                    ${trainingContent}
                </div>
            </div>
        `;
    }

    // 綁定頁面事件
    bindPageEvents(pageName, subPageName) {
        // 這裡可以根據不同頁面綁定特定事件
        // 例如表單提交、按鈕點擊等
        
        // 社區管理相關事件綁定
        if (pageName === 'community') {
            // 社區表單提交
            const communityForm = document.getElementById('communityForm');
            if (communityForm) {
                communityForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.submitCommunityForm();
                });
            }

            // 獲取當前位置按鈕
            const getLocationBtn = document.querySelector('[onclick="window.pageManager.getCurrentLocation()"]');
            if (getLocationBtn) {
                getLocationBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.getCurrentLocationForCommunity();
                });
            }

            // 班表管理相關事件
            const scheduleCommunity = document.getElementById('scheduleCommunity');
            if (scheduleCommunity) {
                scheduleCommunity.addEventListener('change', () => {
                    this.loadScheduleData();
                });
            }

            const scheduleWeek = document.getElementById('scheduleWeek');
            if (scheduleWeek) {
                scheduleWeek.addEventListener('change', () => {
                    this.loadScheduleData();
                });
            }

            // 設置當前週次
            if (scheduleWeek) {
                const currentWeek = this.getCurrentWeek();
                scheduleWeek.value = currentWeek;
            }
        }

        // 系統管理相關事件綁定
        if (pageName === 'system') {
            // 系統設定表單提交
            const systemSettingsForm = document.getElementById('systemSettingsForm');
            if (systemSettingsForm) {
                systemSettingsForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.saveSystemSettings();
                });
            }

            // 通知設定表單提交
            const notificationSettingsForm = document.getElementById('notificationSettingsForm');
            if (notificationSettingsForm) {
                notificationSettingsForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.saveNotificationSettings();
                });
            }

            // 系統日誌篩選
            const logLevelFilter = document.getElementById('logLevelFilter');
            if (logLevelFilter) {
                logLevelFilter.addEventListener('change', () => {
                    this.filterSystemLogs();
                });
            }

            const logActionFilter = document.getElementById('logActionFilter');
            if (logActionFilter) {
                logActionFilter.addEventListener('change', () => {
                    this.filterSystemLogs();
                });
            }

            const logSearch = document.getElementById('logSearch');
            if (logSearch) {
                logSearch.addEventListener('keyup', () => {
                    this.filterSystemLogs();
                });
            }
        }

        // 班表管理相關事件綁定（在community頁面下）
        if (pageName === 'community') {
            // 可拖拽員工項目
            const employeeItems = document.querySelectorAll('.employee-item');
            employeeItems.forEach(item => {
                item.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify({
                        employeeId: item.dataset.employeeId,
                        employeeName: item.dataset.employeeName
                    }));
                });
            });

            // 日曆格子接收拖拽
            const calendarCells = document.querySelectorAll('.calendar-cell');
            calendarCells.forEach(cell => {
                cell.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    cell.classList.add('drag-over');
                });

                cell.addEventListener('dragleave', (e) => {
                    cell.classList.remove('drag-over');
                });

                cell.addEventListener('drop', (e) => {
                    e.preventDefault();
                    cell.classList.remove('drag-over');
                    
                    const employeeData = JSON.parse(e.dataTransfer.getData('text/plain'));
                    this.assignEmployeeToSchedule(cell.dataset.date, cell.dataset.timeSlot, employeeData);
                });
            });
        }

        // 帳號管理相關事件綁定
        if (pageName === 'account') {
            // 用戶表單提交
            const userAddForm = document.getElementById('userAddForm');
            if (userAddForm) {
                userAddForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.submitUserAddForm();
                });
            }

            // 用戶篩選器
            const userStatusFilter = document.getElementById('userStatusFilter');
            if (userStatusFilter) {
                userStatusFilter.addEventListener('change', () => {
                    this.filterUsers();
                });
            }

            const userRoleFilter = document.getElementById('userRoleFilter');
            if (userRoleFilter) {
                userRoleFilter.addEventListener('change', () => {
                    this.filterUsers();
                });
            }

            // 用戶搜尋
            const userSearch = document.getElementById('userSearch');
            if (userSearch) {
                userSearch.addEventListener('keyup', () => {
                    this.searchUsers();
                });
            }
        }
    }

    // 關閉側邊欄
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    // 顯示錯誤訊息
    showError(message) {
        const contentArea = document.getElementById('pageContent');
        if (contentArea) {
            contentArea.innerHTML = `<div class="error">${message}</div>`;
        }
    }

    // 定位打卡相關功能
    initLocationServices() {
        if (!navigator.geolocation) {
            this.updateLocationStatus('您的瀏覽器不支援定位功能', 'error');
            return;
        }

        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 1000);

        this.getCurrentLocation();
    }

    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-TW');
        const timeElement = document.querySelector('#currentTime span');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }

    getCurrentLocation() {
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.handleLocationSuccess(position);
            },
            (error) => {
                this.handleLocationError(error);
            },
            options
        );
    }

    handleLocationSuccess(position) {
        const { latitude, longitude, accuracy } = position.coords;
        
        this.updateLocationStatus('位置獲取成功', 'success');
        this.currentLocation = { latitude, longitude, accuracy };
        
        this.updateLocationDisplay();
        this.checkNearbyCommunities();
        this.enableCheckinButtons();
    }

    handleLocationError(error) {
        let message = '';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = '定位功能被拒絕，請允許網站使用您的位置';
                break;
            case error.POSITION_UNAVAILABLE:
                message = '無法獲取您的位置，請檢查網路連接';
                break;
            case error.TIMEOUT:
                message = '獲取位置超時，請重試';
                break;
            default:
                message = '獲取位置時發生未知錯誤';
                break;
        }
        
        this.updateLocationStatus(message, 'error');
        this.disableCheckinButtons();
    }

    updateLocationStatus(message, type) {
        const statusElement = document.getElementById('locationStatus');
        if (statusElement) {
            statusElement.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
                <p>${message}</p>
            `;
            statusElement.className = `location-status ${type}`;
        }
    }

    updateLocationDisplay() {
        if (!this.currentLocation) return;

        const locationText = document.getElementById('locationText');
        if (locationText) {
            locationText.textContent = `緯度: ${this.currentLocation.latitude.toFixed(6)}, 經度: ${this.currentLocation.longitude.toFixed(6)}`;
        }

        // 顯示簡易地圖
        this.showSimpleMap(this.currentLocation.latitude, this.currentLocation.longitude);

        document.getElementById('checkinInfo').style.display = 'block';
    }

    // 顯示簡易地圖
    showSimpleMap(latitude, longitude) {
        const mapContainer = document.getElementById('mapContainer');
        const miniMap = document.getElementById('miniMap');

        if (mapContainer && miniMap) {
            mapContainer.style.display = 'block';

            // 創建簡單的地圖顯示
            miniMap.innerHTML = `
                <div style="position: relative; height: 100%; background: linear-gradient(45deg, #f0f8ff, #e6f3ff); border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid #dc3545;">
                    <div style="text-align: center;">
                        <div style="font-size: 48px; color: #dc3545; margin-bottom: 10px;">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <div style="font-size: 14px; color: #495057; font-weight: bold;">
                            當前位置
                        </div>
                        <div style="font-size: 12px; color: #6c757d; margin-top: 5px;">
                            ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
                        </div>
                        <div style="font-size: 11px; color: #28a745; margin-top: 10px;">
                            <i class="fas fa-wifi"></i> GPS定位成功
                        </div>
                    </div>
                    <div style="position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.9); padding: 5px; border-radius: 4px; font-size: 10px; color: #495057;">
                        <i class="fas fa-crosshairs"></i> 準確度: ±10m
                    </div>
                </div>
            `;
        }
    }

    async checkNearbyCommunities() {
        try {
            const communities = await this.getNearbyCommunities();
            const communityText = document.getElementById('communityText');
            const statusText = document.getElementById('statusText');

            if (communities.length > 0) {
                communityText.textContent = communities[0].name;
                statusText.textContent = '在允許打卡範圍內';
                this.nearbyCommunity = communities[0];
            } else {
                communityText.textContent = '附近無服務社區';
                statusText.textContent = '不在打卡範圍內';
                this.nearbyCommunity = null;
            }
        } catch (error) {
            console.error('獲取附近社區失敗:', error);
            document.getElementById('communityText').textContent = '無法獲取社區資訊';
            document.getElementById('statusText').textContent = '檢查失敗';
        }
    }

    async getNearbyCommunities() {
        if (!this.currentLocation) return [];

        const snapshot = await db.collection('communities')
            .where('status', '==', 'active')
            .get();

        const nearbyCommunities = [];
        snapshot.forEach(doc => {
            const community = doc.data();
            if (community.location) {
                const distance = this.calculateDistance(
                    this.currentLocation.latitude,
                    this.currentLocation.longitude,
                    community.location.latitude,
                    community.location.longitude
                );
                
                if (distance <= 0.5) { // 500米內
                    nearbyCommunities.push({
                        id: doc.id,
                        ...community,
                        distance
                    });
                }
            }
        });

        return nearbyCommunities.sort((a, b) => a.distance - b.distance);
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // 地球半徑（公里）
        const dLat = this.degreesToRadians(lat2 - lat1);
        const dLon = this.degreesToRadians(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    enableCheckinButtons() {
        const checkinBtn = document.getElementById('checkinBtn');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (this.nearbyCommunity) {
            checkinBtn.disabled = false;
            checkoutBtn.disabled = false;
        } else {
            checkinBtn.disabled = true;
            checkoutBtn.disabled = true;
        }
    }

    disableCheckinButtons() {
        document.getElementById('checkinBtn').disabled = true;
        document.getElementById('checkoutBtn').disabled = true;
    }

    async handleCheckin() {
        await this.handleCheckinCheckout('checkin', '上班打卡');
    }

    async handleCheckout() {
        await this.handleCheckinCheckout('checkout', '下班打卡');
    }

    async handleCheckinCheckout(type, actionName) {
        if (!this.currentLocation || !this.nearbyCommunity) {
            this.showError(`無法${actionName}：位置或社區資訊不完整`);
            return;
        }

        try {
            this.showCheckinStatus(`正在處理${actionName}...`, 'info');
            
            const checkinData = {
                userId: window.currentUser.uid,
                employeeId: window.currentUser.employeeId,
                name: window.currentUser.name,
                type: type,
                communityId: this.nearbyCommunity.id,
                communityName: this.nearbyCommunity.name,
                location: {
                    latitude: this.currentLocation.latitude,
                    longitude: this.currentLocation.longitude,
                    accuracy: this.currentLocation.accuracy
                },
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'completed',
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform
                }
            };

            await db.collection('checkinLogs').add(checkinData);
            
            this.showCheckinStatus(`${actionName}成功！`, 'success');
            this.showSuccessToast(`${actionName}成功！`);
            
            // 重新獲取位置以更新狀態
            setTimeout(() => {
                this.getCurrentLocation();
            }, 2000);
            
        } catch (error) {
            console.error(`${actionName}失敗:`, error);
            this.showError(`${actionName}失敗：${error.message}`);
            this.showCheckinStatus(`${actionName}失敗，請重試`, 'error');
        }
    }

    showCheckinStatus(message, type) {
        const statusElement = document.getElementById('checkinStatus');
        const messageElement = document.getElementById('statusMessage');
        
        if (statusElement && messageElement) {
            statusElement.style.display = 'block';
            messageElement.textContent = message;
            
            const alertClass = type === 'success' ? 'alert-success' : 
                             type === 'error' ? 'alert-danger' : 'alert-info';
            statusElement.querySelector('.alert').className = `alert ${alertClass}`;
        }
    }

    async loadCheckinHistoryData() {
        const dateFilter = document.getElementById('historyDateFilter')?.value;
        const historyList = document.getElementById('checkinHistoryList');
        
        if (!historyList) return;
        
        try {
            historyList.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> 載入中...</div>';
            
            let query = db.collection('checkinLogs')
                .where('userId', '==', window.currentUser.uid);
            
            if (dateFilter) {
                const startDate = new Date(dateFilter);
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 1);
                
                query = query.where('timestamp', '>=', startDate)
                           .where('timestamp', '<', endDate);
            }
            
            const snapshot = await query.orderBy('timestamp', 'desc').limit(50).get();
            
            if (snapshot.empty) {
                historyList.innerHTML = '<div class="text-center text-muted">暫無打卡紀錄</div>';
                return;
            }
            
            let html = '<div class="checkin-history-list">';
            snapshot.forEach(doc => {
                const data = doc.data();
                const time = data.timestamp ? firebaseUtils.formatTimestamp(data.timestamp) : '未知時間';
                const typeText = data.type === 'checkin' ? '上班' : '下班';
                const typeClass = data.type === 'checkin' ? 'text-success' : 'text-warning';
                
                html += `
                    <div class="checkin-history-item">
                        <div class="checkin-type ${typeClass}">
                            <i class="fas fa-${data.type === 'checkin' ? 'sign-in-alt' : 'sign-out-alt'}"></i>
                            ${typeText}打卡
                        </div>
                        <div class="checkin-time">${time}</div>
                        <div class="checkin-location">
                            <i class="fas fa-building"></i> ${data.communityName || '未知社區'}
                        </div>
                        <div class="checkin-coordinates">
                            <small class="text-muted">
                                <i class="fas fa-map-marker-alt"></i>
                                ${data.location?.latitude?.toFixed(6) || 0}, ${data.location?.longitude?.toFixed(6) || 0}
                            </small>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            
            historyList.innerHTML = html;
            
        } catch (error) {
            console.error('載入打卡紀錄失敗:', error);
            historyList.innerHTML = '<div class="text-center text-danger">載入失敗，請重試</div>';
        }
    }

    showSuccessToast(message) {
        if (window.app && window.app.showSuccessToast) {
            window.app.showSuccessToast(message);
        } else {
            alert(message);
        }
    }

    // 載入人員排班
    async loadPersonnelSchedule() {
        setTimeout(() => {
            this.initPersonnelSchedule();
        }, 500);
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-users"></i> 人員排班管理
                    </h3>
                    <div class="card-tools">
                        <button class="btn btn-primary btn-sm" onclick="window.pageManager.addSchedule()">
                            <i class="fas fa-plus"></i> 新增排班
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="schedule-filters">
                        <div class="form-row">
                            <div class="form-group">
                                <label>選擇月份</label>
                                <input type="month" class="form-control" id="scheduleMonth" value="${new Date().toISOString().slice(0, 7)}" onchange="window.pageManager.loadScheduleData()">
                            </div>
                            <div class="form-group">
                                <label>選擇社區</label>
                                <select class="form-control" id="scheduleCommunity" onchange="window.pageManager.loadScheduleData()">
                                    <option value="">全部社區</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>選擇員工</label>
                                <select class="form-control" id="scheduleEmployee" onchange="window.pageManager.loadScheduleData()">
                                    <option value="">全部員工</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="schedule-calendar" id="scheduleCalendar">
                        <div class="text-center">
                            <i class="fas fa-spinner fa-spin"></i> 載入排班資料中...
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 新增排班模態框 -->
            <div class="modal" id="addScheduleModal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4>新增排班</h4>
                        <span class="close" onclick="window.pageManager.closeAddScheduleModal()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="addScheduleForm">
                            <div class="form-group">
                                <label>員工</label>
                                <select class="form-control" id="scheduleEmployeeSelect" required>
                                    <option value="">請選擇員工</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>社區</label>
                                <select class="form-control" id="scheduleCommunitySelect" required>
                                    <option value="">請選擇社區</option>
                                </select>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>日期</label>
                                    <input type="date" class="form-control" id="scheduleDate" required>
                                </div>
                                <div class="form-group">
                                    <label>班次</label>
                                    <select class="form-control" id="scheduleShift" required>
                                        <option value="早班">早班 (08:00-16:00)</option>
                                        <option value="中班">中班 (16:00-00:00)</option>
                                        <option value="夜班">夜班 (00:00-08:00)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>備註</label>
                                <textarea class="form-control" id="scheduleNote" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="window.pageManager.closeAddScheduleModal()">取消</button>
                        <button type="button" class="btn btn-primary" onclick="window.pageManager.saveSchedule()">儲存</button>
                    </div>
                </div>
            </div>
        `;
    }

    // 載入社區排班
    async loadCommunitySchedule() {
        setTimeout(() => {
            this.initCommunitySchedule();
        }, 500);
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-building"></i> 社區排班管理
                    </h3>
                    <div class="card-tools">
                        <button class="btn btn-primary btn-sm" onclick="window.pageManager.generateCommunitySchedule()">
                            <i class="fas fa-magic"></i> 自動排班
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="community-schedule-overview">
                        <div class="form-row">
                            <div class="form-group">
                                <label>選擇週期</label>
                                <select class="form-control" id="scheduleWeek" onchange="window.pageManager.loadCommunityScheduleData()">
                                    <option value="${this.getCurrentWeek()}">本週</option>
                                    <option value="${this.getNextWeek()}">下週</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>社區</label>
                                <select class="form-control" id="overviewCommunity" onchange="window.pageManager.loadCommunityScheduleData()">
                                    <option value="">全部社區</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="community-overview-grid" id="communityOverview">
                        <div class="text-center">
                            <i class="fas fa-spinner fa-spin"></i> 載入社區排班概況中...
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 載入表單印製
    async loadScheduleForms() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-print"></i> 排班表單印製
                    </h3>
                </div>
                <div class="card-body">
                    <div class="form-print-options">
                        <div class="form-row">
                            <div class="form-group">
                                <label>表單類型</label>
                                <select class="form-control" id="formType">
                                    <option value="monthly">月排班表</option>
                                    <option value="weekly">週排班表</option>
                                    <option value="daily">日勤務表</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>月份/週次</label>
                                <input type="month" class="form-control" id="formMonth" value="${new Date().toISOString().slice(0, 7)}">
                            </div>
                            <div class="form-group">
                                <label>社區</label>
                                <select class="form-control" id="formCommunity">
                                    <option value="">全部社區</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <button class="btn btn-primary" onclick="window.pageManager.previewScheduleForm()">
                                <i class="fas fa-eye"></i> 預覽表單
                            </button>
                            <button class="btn btn-success" onclick="window.pageManager.printScheduleForm()">
                                <i class="fas fa-print"></i> 列印表單
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-preview" id="formPreview">
                        <div class="text-center text-muted" style="padding: 40px;">
                            <i class="fas fa-file-alt" style="font-size: 48px; margin-bottom: 15px;"></i>
                            <p>請選擇表單類型並點擊預覽按鈕</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 初始化人員排班
    async initPersonnelSchedule() {
        await this.loadScheduleData();
        await this.loadEmployeesAndCommunities();
    }

    // 初始化社區排班
    async initCommunitySchedule() {
        await this.loadCommunityScheduleData();
        await this.loadCommunitiesForSelect();
    }

    // 載入排班資料
    async loadScheduleData() {
        const month = document.getElementById('scheduleMonth')?.value;
        const communityId = document.getElementById('scheduleCommunity')?.value;
        const employeeId = document.getElementById('scheduleEmployee')?.value;
        
        if (!month) return;
        
        try {
            const calendar = document.getElementById('scheduleCalendar');
            if (!calendar) return;
            
            calendar.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> 載入中...</div>';
            
            // 獲取該月份的排班資料
            const startDate = new Date(month + '-01');
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
            
            let query = db.collection('schedules')
                .where('date', '>=', startDate)
                .where('date', '<=', endDate);
            
            if (communityId) {
                query = query.where('communityId', '==', communityId);
            }
            if (employeeId) {
                query = query.where('employeeId', '==', employeeId);
            }
            
            const snapshot = await query.orderBy('date', 'asc').get();
            
            const schedules = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                const date = data.date.toDate().toISOString().split('T')[0];
                if (!schedules[date]) schedules[date] = [];
                schedules[date].push(data);
            });
            
            this.renderScheduleCalendar(month, schedules);
            
        } catch (error) {
            console.error('載入排班資料失敗:', error);
            document.getElementById('scheduleCalendar').innerHTML = '<div class="text-center text-danger">載入失敗，請重試</div>';
        }
    }

    // 載入員工和社區選項
    async loadEmployeesAndCommunities() {
        try {
            // 載入員工
            const employeesSnapshot = await db.collection('users')
                .where('status', '==', 'active')
                .orderBy('name')
                .get();
            
            let employeeOptions = '<option value="">全部員工</option>';
            employeesSnapshot.forEach(doc => {
                const data = doc.data();
                employeeOptions += `<option value="${doc.id}">${data.name} (${data.employeeId})</option>`;
            });
            
            const employeeSelect = document.getElementById('scheduleEmployee');
            if (employeeSelect) employeeSelect.innerHTML = employeeOptions;
            
            // 載入社區
            const communitiesSnapshot = await db.collection('communities')
                .where('status', '==', 'active')
                .orderBy('name')
                .get();
            
            let communityOptions = '<option value="">全部社區</option>';
            communitiesSnapshot.forEach(doc => {
                const data = doc.data();
                communityOptions += `<option value="${doc.id}">${data.name}</option>`;
            });
            
            const communitySelect = document.getElementById('scheduleCommunity');
            if (communitySelect) communitySelect.innerHTML = communityOptions;
            
            // 為模態框也載入選項
            const modalEmployeeSelect = document.getElementById('scheduleEmployeeSelect');
            if (modalEmployeeSelect) modalEmployeeSelect.innerHTML = employeeOptions.replace('全部員工', '請選擇員工');
            
            const modalCommunitySelect = document.getElementById('scheduleCommunitySelect');
            if (modalCommunitySelect) modalCommunitySelect.innerHTML = communityOptions.replace('全部社區', '請選擇社區');
            
        } catch (error) {
            console.error('載入員工和社區資料失敗:', error);
        }
    }

    // 載入社區排班資料
    async loadCommunityScheduleData() {
        try {
            const overview = document.getElementById('communityOverview');
            if (!overview) return;
            
            overview.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> 載入中...</div>';
            
            // 載入所有社區
            const communitiesSnapshot = await db.collection('communities')
                .where('status', '==', 'active')
                .get();
            
            let html = '<div class="community-grid">';
            
            for (const doc of communitiesSnapshot.docs) {
                const community = doc.data();
                const communityId = doc.id;
                
                // 獲取本週排班統計
                const weekStart = this.getWeekStart();
                const weekEnd = this.getWeekEnd();
                
                const scheduleQuery = await db.collection('schedules')
                    .where('communityId', '==', communityId)
                    .where('date', '>=', weekStart)
                    .where('date', '<=', weekEnd)
                    .get();
                
                const totalShifts = scheduleQuery.size;
                const assignedShifts = scheduleQuery.docs.filter(doc => doc.data().employeeId).length;
                const coverageRate = totalShifts > 0 ? Math.round((assignedShifts / totalShifts) * 100) : 0;
                
                html += `
                    <div class="community-card">
                        <div class="community-header">
                            <h5>${community.name}</h5>
                            <span class="coverage-badge ${coverageRate >= 80 ? 'good' : coverageRate >= 60 ? 'warning' : 'bad'}">
                                ${coverageRate}% 覆蓋率
                            </span>
                        </div>
                        <div class="community-stats">
                            <div class="stat-item">
                                <span class="stat-label">總班表</span>
                                <span class="stat-value">${totalShifts}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">已指派</span>
                                <span class="stat-value">${assignedShifts}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">待指派</span>
                                <span class="stat-value">${totalShifts - assignedShifts}</span>
                            </div>
                        </div>
                        <div class="community-actions">
                            <button class="btn btn-sm btn-primary" onclick="window.pageManager.viewCommunityDetail('${communityId}')">
                                <i class="fas fa-eye"></i> 詳情
                            </button>
                            <button class="btn btn-sm btn-outline-primary" onclick="window.pageManager.editCommunitySchedule('${communityId}')">
                                <i class="fas fa-edit"></i> 編輯
                            </button>
                        </div>
                    </div>
                `;
            }
            
            html += '</div>';
            overview.innerHTML = html;
            
        } catch (error) {
            console.error('載入社區排班資料失敗:', error);
            document.getElementById('communityOverview').innerHTML = '<div class="text-center text-danger">載入失敗，請重試</div>';
        }
    }

    // 渲染排班日曆
    renderScheduleCalendar(month, schedules) {
        const calendar = document.getElementById('scheduleCalendar');
        if (!calendar) return;
        
        const year = parseInt(month.split('-')[0]);
        const monthIndex = parseInt(month.split('-')[1]) - 1;
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const firstDay = new Date(year, monthIndex, 1).getDay();
        
        let html = '<div class="schedule-calendar">';
        html += '<div class="calendar-header">';
        html += '<div class="calendar-nav">';
        html += '<button class="btn btn-sm btn-outline-primary" onclick="window.pageManager.previousMonth()"><i class="fas fa-chevron-left"></i></button>';
        html += `<h4>${year}年${monthIndex + 1}月</h4>`;
        html += '<button class="btn btn-sm btn-outline-primary" onclick="window.pageManager.nextMonth()"><i class="fas fa-chevron-right"></i></button>';
        html += '</div>';
        html += '</div>';
        
        html += '<div class="calendar-grid">';
        html += '<div class="calendar-weekday">日</div>';
        html += '<div class="calendar-weekday">一</div>';
        html += '<div class="calendar-weekday">二</div>';
        html += '<div class="calendar-weekday">三</div>';
        html += '<div class="calendar-weekday">四</div>';
        html += '<div class="calendar-weekday">五</div>';
        html += '<div class="calendar-weekday">六</div>';
        
        // 空白日期
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // 日期
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${month}-${day.toString().padStart(2, '0')}`;
            const daySchedules = schedules[dateStr] || [];
            
            html += `<div class="calendar-day" data-date="${dateStr}">`;
            html += `<div class="day-number">${day}</div>`;
            
            if (daySchedules.length > 0) {
                html += '<div class="day-schedules">';
                daySchedules.slice(0, 3).forEach(schedule => {
                    const shiftColor = this.getShiftColor(schedule.shift);
                    html += `<div class="schedule-item ${shiftColor}">${schedule.shift}</div>`;
                });
                if (daySchedules.length > 3) {
                    html += `<div class="more-schedules">+${daySchedules.length - 3} 更多</div>`;
                }
                html += '</div>';
            }
            
            html += `<button class="add-schedule-btn" onclick="window.pageManager.addScheduleForDate('${dateStr}')" title="新增排班">+</button>`;
            html += '</div>';
        }
        
        html += '</div>';
        html += '</div>';
        
        calendar.innerHTML = html;
    }

    // 獲取班次顏色
    getShiftColor(shift) {
        const colors = {
            '早班': 'morning',
            '中班': 'afternoon',
            '夜班': 'night'
        };
        return colors[shift] || 'default';
    }

    // 新增排班
    addSchedule() {
        document.getElementById('addScheduleModal').style.display = 'block';
        document.getElementById('addScheduleForm').reset();
    }

    // 為特定日期新增排班
    addScheduleForDate(date) {
        this.addSchedule();
        document.getElementById('scheduleDate').value = date;
    }

    // 關閉新增排班模態框
    closeAddScheduleModal() {
        document.getElementById('addScheduleModal').style.display = 'none';
    }

    // 儲存排班
    async saveSchedule() {
        const employeeId = document.getElementById('scheduleEmployeeSelect').value;
        const communityId = document.getElementById('scheduleCommunitySelect').value;
        const date = document.getElementById('scheduleDate').value;
        const shift = document.getElementById('scheduleShift').value;
        const note = document.getElementById('scheduleNote').value;
        
        if (!employeeId || !communityId || !date || !shift) {
            alert('請填寫所有必填欄位');
            return;
        }
        
        try {
            const scheduleData = {
                employeeId: employeeId,
                communityId: communityId,
                date: new Date(date),
                shift: shift,
                note: note,
                createdBy: window.currentUser.employeeId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'active'
            };
            
            await db.collection('schedules').add(scheduleData);
            
            this.showSuccessToast('排班新增成功！');
            this.closeAddScheduleModal();
            this.loadScheduleData();
            
        } catch (error) {
            console.error('儲存排班失敗:', error);
            alert('儲存排班失敗，請重試');
        }
    }

    // 預覽排班表單
    async previewScheduleForm() {
        const formType = document.getElementById('formType').value;
        const month = document.getElementById('formMonth').value;
        const communityId = document.getElementById('formCommunity').value;
        
        try {
            const preview = document.getElementById('formPreview');
            preview.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> 產生預覽中...</div>';
            
            // 根據表單類型產生預覽
            let html = `<div class="form-preview-content">`;
            html += `<h4>${formType === 'monthly' ? '月排班表' : formType === 'weekly' ? '週排班表' : '日勤務表'}</h4>`;
            html += `<p class="text-muted">月份: ${month}</p>`;
            html += `<div class="preview-table">`;
            html += `<table class="table">`;
            html += `<thead><tr><th>日期</th><th>員工</th><th>班次</th><th>社區</th></tr></thead>`;
            html += `<tbody>`;
            html += `<tr><td colspan="4" class="text-center text-muted">預覽資料範例</td></tr>`;
            html += `</tbody></table>`;
            html += `</div></div>`;
            
            preview.innerHTML = html;
            
        } catch (error) {
            console.error('預覽表單失敗:', error);
            document.getElementById('formPreview').innerHTML = '<div class="text-center text-danger">預覽失敗，請重試</div>';
        }
    }

    // 列印排班表單
    printScheduleForm() {
        const printContent = document.getElementById('formPreview').innerHTML;
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(`
            <html>
                <head>
                    <title>排班表單列印</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .form-preview-content { background: white; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; font-weight: bold; }
                        @media print { body { margin: 0; } }
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    // 工具函數
    getCurrentWeek() {
        return this.getWeekString(new Date());
    }

    getNextWeek() {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        return this.getWeekString(nextWeek);
    }

    getWeekString(date) {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()} - ${endOfWeek.getMonth() + 1}/${endOfWeek.getDate()}`;
    }

    getWeekStart() {
        const date = new Date();
        date.setDate(date.getDate() - date.getDay());
        return date;
    }

    getWeekEnd() {
        const date = this.getWeekStart();
        date.setDate(date.getDate() + 6);
        return date;
    }

    loadCommunitiesForSelect() {
        // 為各種下拉選單載入社區資料
        this.loadEmployeesAndCommunities();
    }

    viewCommunityDetail(communityId) {
        alert(`查看社區詳情: ${communityId}`);
    }

    editCommunitySchedule(communityId) {
        alert(`編輯社區排班: ${communityId}`);
    }

    previousMonth() {
        const currentMonth = document.getElementById('scheduleMonth').value;
        const date = new Date(currentMonth + '-01');
        date.setMonth(date.getMonth() - 1);
        document.getElementById('scheduleMonth').value = date.toISOString().slice(0, 7);
        this.loadScheduleData();
    }

    nextMonth() {
        const currentMonth = document.getElementById('scheduleMonth').value;
        const date = new Date(currentMonth + '-01');
        date.setMonth(date.getMonth() + 1);
        document.getElementById('scheduleMonth').value = date.toISOString().slice(0, 7);
        this.loadScheduleData();
    }

    generateCommunitySchedule() {
        alert('自動排班功能開發中...');
    }

    // 載入請假排休內容
    async loadLeaveContent(subPage) {
        if (!window.currentUser) return '<div class="error">請先登入</div>';

        switch (subPage) {
            case '請假頁面':
                return await this.loadLeaveApplication();
            case '請假紀錄':
                return await this.loadLeaveRecords();
            default:
                return await this.loadLeaveApplication();
        }
    }

    // 載入請假申請頁面
    async loadLeaveApplication() {
        const today = new Date().toISOString().split('T')[0];
        
        return `
            <div class="leave-container">
                <div class="leave-header">
                    <h2><i class="fas fa-calendar-times"></i> 請假申請</h2>
                    <div class="leave-stats">
                        <div class="stat-card">
                            <div class="stat-number" id="annualLeaveRemaining">--</div>
                            <div class="stat-label">年假剩餘</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="sickLeaveRemaining">--</div>
                            <div class="stat-label">病假剩餘</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="personalLeaveRemaining">--</div>
                            <div class="stat-label">事假剩餘</div>
                        </div>
                    </div>
                </div>
                
                <div class="leave-form-container">
                    <form id="leaveApplicationForm" class="leave-form">
                        <div class="form-section">
                            <h3>假別資訊</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="leaveType">假別 <span class="required">*</span></label>
                                    <select id="leaveType" class="form-control" required onchange="window.pageManager.onLeaveTypeChange()">
                                        <option value="">請選擇假別</option>
                                        <option value="annual">年假</option>
                                        <option value="sick">病假</option>
                                        <option value="personal">事假</option>
                                        <option value="official">公假</option>
                                        <option value="maternity">產假</option>
                                        <option value="paternity">陪產假</option>
                                        <option value="bereavement">喪假</option>
                                        <option value="marriage">婚假</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="leaveDays">申請天數 <span class="required">*</span></label>
                                    <input type="number" id="leaveDays" class="form-control" min="0.5" max="30" step="0.5" required onchange="window.pageManager.calculateLeaveDays()">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h3>請假時間</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="leaveStartDate">開始日期 <span class="required">*</span></label>
                                    <input type="date" id="leaveStartDate" class="form-control" min="${today}" required onchange="window.pageManager.onLeaveDateChange()">
                                </div>
                                <div class="form-group">
                                    <label for="leaveStartTime">開始時間</label>
                                    <select id="leaveStartTime" class="form-control" onchange="window.pageManager.calculateLeaveDays()">
                                        <option value="morning">上午 (08:00)</option>
                                        <option value="afternoon">下午 (13:00)</option>
                                        <option value="evening">晚上 (18:00)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="leaveEndDate">結束日期 <span class="required">*</span></label>
                                    <input type="date" id="leaveEndDate" class="form-control" min="${today}" required onchange="window.pageManager.onLeaveDateChange()">
                                </div>
                                <div class="form-group">
                                    <label for="leaveEndTime">結束時間</label>
                                    <select id="leaveEndTime" class="form-control" onchange="window.pageManager.calculateLeaveDays()">
                                        <option value="morning">上午 (12:00)</option>
                                        <option value="afternoon">下午 (17:00)</option>
                                        <option value="evening">晚上 (22:00)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h3>請假原因</h3>
                            <div class="form-group">
                                <label for="leaveReason">請假原因 <span class="required">*</span></label>
                                <textarea id="leaveReason" class="form-control" rows="4" placeholder="請詳細說明請假原因..." required></textarea>
                            </div>
                            <div class="form-group" id="proofUploadSection" style="display: none;">
                                <label for="leaveProof">證明文件</label>
                                <input type="file" id="leaveProof" class="form-control" accept=".jpg,.jpeg,.png,.pdf" onchange="window.pageManager.handleFileUpload()">
                                <small class="form-text text-muted">支援 JPG、PNG、PDF 格式，檔案大小不超過 5MB</small>
                                <div id="proofPreview" class="proof-preview"></div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h3>代理人資訊</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="substituteEmployee">代理人</label>
                                    <select id="substituteEmployee" class="form-control">
                                        <option value="">請選擇代理人</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="substituteNote">交辦事項</label>
                                    <textarea id="substituteNote" class="form-control" rows="2" placeholder="請說明需要代理人處理的事項..."></textarea>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="window.pageManager.resetLeaveForm()">
                                <i class="fas fa-redo"></i> 重設表單
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-paper-plane"></i> 送出申請
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- 申請預覽模態框 -->
                <div id="leavePreviewModal" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>請假申請預覽</h3>
                            <span class="close" onclick="window.pageManager.closeLeavePreview()">&times;</span>
                        </div>
                        <div class="modal-body" id="leavePreviewContent">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="window.pageManager.closeLeavePreview()">取消</button>
                            <button type="button" class="btn btn-primary" onclick="window.pageManager.confirmLeaveApplication()">確認申請</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 載入請假紀錄頁面
    async loadLeaveRecords() {
        return `
            <div class="leave-container">
                <div class="leave-header">
                    <h2><i class="fas fa-history"></i> 請假紀錄</h2>
                    <div class="leave-filters">
                        <div class="filter-group">
                            <label for="recordYear">年度</label>
                            <select id="recordYear" class="form-control" onchange="window.pageManager.loadLeaveRecordsData()">
                                ${this.getYearOptions()}
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="recordStatus">狀態</label>
                            <select id="recordStatus" class="form-control" onchange="window.pageManager.loadLeaveRecordsData()">
                                <option value="">全部</option>
                                <option value="pending">待審核</option>
                                <option value="approved">已核准</option>
                                <option value="rejected">已拒絕</option>
                                <option value="cancelled">已取消</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="recordType">假別</label>
                            <select id="recordType" class="form-control" onchange="window.pageManager.loadLeaveRecordsData()">
                                <option value="">全部</option>
                                <option value="annual">年假</option>
                                <option value="sick">病假</option>
                                <option value="personal">事假</option>
                                <option value="official">公假</option>
                                <option value="maternity">產假</option>
                                <option value="paternity">陪產假</option>
                                <option value="bereavement">喪假</option>
                                <option value="marriage">婚假</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="leave-records-container">
                    <div class="leave-summary">
                        <div class="summary-card">
                            <div class="summary-number" id="totalLeaveDays">--</div>
                            <div class="summary-label">總請假天數</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-number" id="approvedLeaveDays">--</div>
                            <div class="summary-label">已核准天數</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-number" id="pendingLeaveDays">--</div>
                            <div class="summary-label">待審核天數</div>
                        </div>
                    </div>
                    
                    <div class="records-table-container">
                        <table class="records-table">
                            <thead>
                                <tr>
                                    <th>申請日期</th>
                                    <th>假別</th>
                                    <th>請假時間</th>
                                    <th>天數</th>
                                    <th>狀態</th>
                                    <th>審核人</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody id="leaveRecordsTableBody">
                                <tr>
                                    <td colspan="7" class="text-center">
                                        <i class="fas fa-spinner fa-spin"></i> 載入中...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="pagination-container" id="leaveRecordsPagination">
                    </div>
                </div>
                
                <!-- 請假詳情模態框 -->
                <div id="leaveDetailModal" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>請假申請詳情</h3>
                            <span class="close" onclick="window.pageManager.closeLeaveDetail()">&times;</span>
                        </div>
                        <div class="modal-body" id="leaveDetailContent">
                        </div>
                        <div class="modal-footer" id="leaveDetailActions">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 取得年度選項
    getYearOptions() {
        const currentYear = new Date().getFullYear();
        let options = '';
        for (let year = currentYear - 2; year <= currentYear + 1; year++) {
            const selected = year === currentYear ? 'selected' : '';
            options += `<option value="${year}" ${selected}>${year}年</option>`;
        }
        return options;
    }

    // 載入員工假期餘額
    async loadEmployeeLeaveBalance() {
        try {
            const employeeId = window.currentUser.employeeId;
            const currentYear = new Date().getFullYear();
            
            // 查詢員工假期餘額
            const balanceQuery = await db.collection('leaveBalance')
                .where('employeeId', '==', employeeId)
                .where('year', '==', currentYear)
                .limit(1)
                .get();
            
            if (!balanceQuery.empty) {
                const balance = balanceQuery.docs[0].data();
                document.getElementById('annualLeaveRemaining').textContent = balance.annual || 0;
                document.getElementById('sickLeaveRemaining').textContent = balance.sick || 0;
                document.getElementById('personalLeaveRemaining').textContent = balance.personal || 0;
            } else {
                // 如果沒有餘額記錄，顯示預設值
                document.getElementById('annualLeaveRemaining').textContent = '14';
                document.getElementById('sickLeaveRemaining').textContent = '30';
                document.getElementById('personalLeaveRemaining').textContent = '14';
            }
        } catch (error) {
            console.error('載入假期餘額失敗:', error);
            // 顯示預設值
            document.getElementById('annualLeaveRemaining').textContent = '14';
            document.getElementById('sickLeaveRemaining').textContent = '30';
            document.getElementById('personalLeaveRemaining').textContent = '14';
        }
    }

    // 載入代理人列表
    async loadSubstituteEmployees() {
        try {
            const employeesQuery = await db.collection('users')
                .where('status', '==', 'active')
                .where('employeeId', '!=', window.currentUser.employeeId)
                .get();
            
            const select = document.getElementById('substituteEmployee');
            select.innerHTML = '<option value="">請選擇代理人</option>';
            
            employeesQuery.forEach(doc => {
                const employee = doc.data();
                const option = document.createElement('option');
                option.value = employee.employeeId;
                option.textContent = `${employee.name} (${employee.employeeId})`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('載入代理人列表失敗:', error);
        }
    }

    // 假別變更處理
    onLeaveTypeChange() {
        const leaveType = document.getElementById('leaveType').value;
        const proofSection = document.getElementById('proofUploadSection');
        
        // 某些假別需要證明文件
        if (['sick', 'maternity', 'paternity', 'bereavement', 'marriage'].includes(leaveType)) {
            proofSection.style.display = 'block';
        } else {
            proofSection.style.display = 'none';
        }
    }

    // 計算請假天數
    calculateLeaveDays() {
        const startDate = document.getElementById('leaveStartDate').value;
        const endDate = document.getElementById('leaveEndDate').value;
        const startTime = document.getElementById('leaveStartTime').value;
        const endTime = document.getElementById('leaveEndTime').value;
        
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (end >= start) {
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                
                // 調整天數（根據開始和結束時間）
                let adjustedDays = diffDays;
                if (diffDays === 1) {
                    // 同一天請假，根據時間調整
                    if (startTime === 'afternoon' && endTime === 'morning') {
                        adjustedDays = 0.5;
                    } else if (startTime === 'morning' && endTime === 'afternoon') {
                        adjustedDays = 1;
                    }
                }
                
                document.getElementById('leaveDays').value = adjustedDays;
            }
        }
    }

    // 請假日期變更處理
    onLeaveDateChange() {
        this.calculateLeaveDays();
        this.validateLeaveDates();
    }

    // 驗證請假日期
    validateLeaveDates() {
        const startDate = document.getElementById('leaveStartDate').value;
        const endDate = document.getElementById('leaveEndDate').value;
        
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (end < start) {
                alert('結束日期不能早於開始日期');
                document.getElementById('leaveEndDate').value = startDate;
                this.calculateLeaveDays();
            }
        }
    }

    // 處理文件上傳
    handleFileUpload() {
        const fileInput = document.getElementById('leaveProof');
        const preview = document.getElementById('proofPreview');
        
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            
            // 檢查檔案大小（5MB）
            if (file.size > 5 * 1024 * 1024) {
                alert('檔案大小不能超過 5MB');
                fileInput.value = '';
                return;
            }
            
            // 顯示預覽
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" alt="證明文件預覽">`;
                };
                reader.readAsDataURL(file);
            } else {
                preview.innerHTML = `<div class="file-info"><i class="fas fa-file"></i> ${file.name}</div>`;
            }
        }
    }

    // 重設請假表單
    resetLeaveForm() {
        document.getElementById('leaveApplicationForm').reset();
        document.getElementById('proofUploadSection').style.display = 'none';
        document.getElementById('proofPreview').innerHTML = '';
    }

    // 處理請假申請表單提交
    async handleLeaveApplication(event) {
        event.preventDefault();
        
        const formData = {
            leaveType: document.getElementById('leaveType').value,
            leaveDays: parseFloat(document.getElementById('leaveDays').value),
            startDate: document.getElementById('leaveStartDate').value,
            endDate: document.getElementById('leaveEndDate').value,
            startTime: document.getElementById('leaveStartTime').value,
            endTime: document.getElementById('leaveEndTime').value,
            reason: document.getElementById('leaveReason').value,
            substituteEmployee: document.getElementById('substituteEmployee').value,
            substituteNote: document.getElementById('substituteNote').value
        };
        
        // 驗證表單
        if (!formData.leaveType || !formData.leaveDays || !formData.startDate || !formData.endDate || !formData.reason) {
            alert('請填寫所有必填欄位');
            return;
        }
        
        // 顯示預覽
        this.showLeavePreview(formData);
    }

    // 顯示請假申請預覽
    showLeavePreview(formData) {
        const leaveTypeNames = {
            annual: '年假',
            sick: '病假',
            personal: '事假',
            official: '公假',
            maternity: '產假',
            paternity: '陪產假',
            bereavement: '喪假',
            marriage: '婚假'
        };
        
        const timeNames = {
            morning: '上午',
            afternoon: '下午',
            evening: '晚上'
        };
        
        const previewContent = document.getElementById('leavePreviewContent');
        previewContent.innerHTML = `
            <div class="leave-preview">
                <div class="preview-section">
                    <h4>假別資訊</h4>
                    <div class="preview-item">
                        <span class="preview-label">假別：</span>
                        <span class="preview-value">${leaveTypeNames[formData.leaveType]}</span>
                    </div>
                    <div class="preview-item">
                        <span class="preview-label">申請天數：</span>
                        <span class="preview-value">${formData.leaveDays} 天</span>
                    </div>
                </div>
                
                <div class="preview-section">
                    <h4>請假時間</h4>
                    <div class="preview-item">
                        <span class="preview-label">開始時間：</span>
                        <span class="preview-value">${formData.startDate} ${timeNames[formData.startTime]}</span>
                    </div>
                    <div class="preview-item">
                        <span class="preview-label">結束時間：</span>
                        <span class="preview-value">${formData.endDate} ${timeNames[formData.endTime]}</span>
                    </div>
                </div>
                
                <div class="preview-section">
                    <h4>請假原因</h4>
                    <div class="preview-item">
                        <span class="preview-label">原因：</span>
                        <span class="preview-value">${formData.reason}</span>
                    </div>
                </div>
                
                ${formData.substituteEmployee ? `
                <div class="preview-section">
                    <h4>代理人資訊</h4>
                    <div class="preview-item">
                        <span class="preview-label">代理人：</span>
                        <span class="preview-value">${formData.substituteEmployee}</span>
                    </div>
                    ${formData.substituteNote ? `
                    <div class="preview-item">
                        <span class="preview-label">交辦事項：</span>
                        <span class="preview-value">${formData.substituteNote}</span>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
            </div>
        `;
        
        document.getElementById('leavePreviewModal').style.display = 'block';
    }

    // 關閉請假預覽
    closeLeavePreview() {
        document.getElementById('leavePreviewModal').style.display = 'none';
    }

    // 確認請假申請
    async confirmLeaveApplication() {
        try {
            const formData = {
                employeeId: window.currentUser.employeeId,
                employeeName: window.currentUser.name,
                leaveType: document.getElementById('leaveType').value,
                leaveDays: parseFloat(document.getElementById('leaveDays').value),
                startDate: document.getElementById('leaveStartDate').value,
                endDate: document.getElementById('leaveEndDate').value,
                startTime: document.getElementById('leaveStartTime').value,
                endTime: document.getElementById('leaveEndTime').value,
                reason: document.getElementById('leaveReason').value,
                substituteEmployee: document.getElementById('substituteEmployee').value,
                substituteNote: document.getElementById('substituteNote').value,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                applicantNotes: []
            };
            
            // 處理文件上傳
            const fileInput = document.getElementById('leaveProof');
            if (fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                const storageRef = firebase.storage().ref();
                const fileName = `leave_proofs/${formData.employeeId}_${Date.now()}_${file.name}`;
                const fileRef = storageRef.child(fileName);
                
                await fileRef.put(file);
                formData.proofUrl = await fileRef.getDownloadURL();
                formData.proofFileName = file.name;
            }
            
            // 儲存請假申請
            await db.collection('leaveRecords').add(formData);
            
            this.showSuccessToast('請假申請已送出！');
            this.closeLeavePreview();
            this.resetLeaveForm();
            
            // 重新載入假期餘額
            this.loadEmployeeLeaveBalance();
            
        } catch (error) {
            console.error('送出請假申請失敗:', error);
            alert('送出請假申請失敗，請重試');
        }
    }

    // 載入請假紀錄資料
    async loadLeaveRecordsData() {
        try {
            const employeeId = window.currentUser.employeeId;
            const year = document.getElementById('recordYear').value;
            const status = document.getElementById('recordStatus').value;
            const type = document.getElementById('recordType').value;
            
            let query = db.collection('leaveRecords')
                .where('employeeId', '==', employeeId)
                .where('createdAt', '>=', new Date(`${year}-01-01`))
                .where('createdAt', '<=', new Date(`${year}-12-31`))
                .orderBy('createdAt', 'desc');
            
            if (status) {
                query = query.where('status', '==', status);
            }
            
            if (type) {
                query = query.where('leaveType', '==', type);
            }
            
            const snapshot = await query.get();
            
            this.renderLeaveRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            this.updateLeaveStatistics(snapshot.docs.map(doc => doc.data()));
            
        } catch (error) {
            console.error('載入請假紀錄失敗:', error);
            document.getElementById('leaveRecordsTableBody').innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-danger">
                        <i class="fas fa-exclamation-triangle"></i> 載入失敗，請重試
                    </td>
                </tr>
            `;
        }
    }

    // 渲染請假紀錄表格
    renderLeaveRecords(records) {
        const tbody = document.getElementById('leaveRecordsTableBody');
        const leaveTypeNames = {
            annual: '年假',
            sick: '病假',
            personal: '事假',
            official: '公假',
            maternity: '產假',
            paternity: '陪產假',
            bereavement: '喪假',
            marriage: '婚假'
        };
        
        const statusNames = {
            pending: { text: '待審核', class: 'status-pending' },
            approved: { text: '已核准', class: 'status-approved' },
            rejected: { text: '已拒絕', class: 'status-rejected' },
            cancelled: { text: '已取消', class: 'status-cancelled' }
        };
        
        if (records.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        <i class="fas fa-inbox"></i> 暫無請假紀錄
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = records.map(record => {
            const applyDate = record.createdAt?.toDate ? record.createdAt.toDate().toLocaleDateString('zh-TW') : '-';
            const statusInfo = statusNames[record.status] || { text: '未知', class: 'status-unknown' };
            
            return `
                <tr>
                    <td>${applyDate}</td>
                    <td><span class="leave-type-badge leave-type-${record.leaveType}">${leaveTypeNames[record.leaveType]}</span></td>
                    <td>${record.startDate} ~ ${record.endDate}</td>
                    <td>${record.leaveDays} 天</td>
                    <td><span class="status-badge ${statusInfo.class}">${statusInfo.text}</span></td>
                    <td>${record.reviewerName || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="window.pageManager.viewLeaveDetail('${record.id}')">
                            <i class="fas fa-eye"></i> 查看
                        </button>
                        ${record.status === 'pending' ? `
                        <button class="btn btn-sm btn-warning" onclick="window.pageManager.cancelLeaveApplication('${record.id}')">
                            <i class="fas fa-times"></i> 取消
                        </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    }

    // 更新請假統計
    updateLeaveStatistics(records) {
        const totalDays = records.reduce((sum, record) => sum + (record.leaveDays || 0), 0);
        const approvedDays = records.filter(r => r.status === 'approved').reduce((sum, record) => sum + (record.leaveDays || 0), 0);
        const pendingDays = records.filter(r => r.status === 'pending').reduce((sum, record) => sum + (record.leaveDays || 0), 0);
        
        document.getElementById('totalLeaveDays').textContent = totalDays;
        document.getElementById('approvedLeaveDays').textContent = approvedDays;
        document.getElementById('pendingLeaveDays').textContent = pendingDays;
    }

    // 查看請假詳情
    async viewLeaveDetail(recordId) {
        try {
            const doc = await db.collection('leaveRecords').doc(recordId).get();
            if (!doc.exists) {
                alert('請假紀錄不存在');
                return;
            }
            
            const record = doc.data();
            const leaveTypeNames = {
                annual: '年假',
                sick: '病假',
                personal: '事假',
                official: '公假',
                maternity: '產假',
                paternity: '陪產假',
                bereavement: '喪假',
                marriage: '婚假'
            };
            
            const statusNames = {
                pending: { text: '待審核', class: 'status-pending' },
                approved: { text: '已核准', class: 'status-approved' },
                rejected: { text: '已拒絕', class: 'status-rejected' },
                cancelled: { text: '已取消', class: 'status-cancelled' }
            };
            
            const statusInfo = statusNames[record.status] || { text: '未知', class: 'status-unknown' };
            const applyDate = record.createdAt?.toDate ? record.createdAt.toDate().toLocaleDateString('zh-TW') : '-';
            const reviewDate = record.reviewedAt?.toDate ? record.reviewedAt.toDate().toLocaleDateString('zh-TW') : '-';
            
            const content = `
                <div class="leave-detail">
                    <div class="detail-section">
                        <h4>基本資訊</h4>
                        <div class="detail-item">
                            <span class="detail-label">申請人：</span>
                            <span class="detail-value">${record.employeeName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">假別：</span>
                            <span class="detail-value">${leaveTypeNames[record.leaveType]}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">申請日期：</span>
                            <span class="detail-value">${applyDate}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>請假時間</h4>
                        <div class="detail-item">
                            <span class="detail-label">開始日期：</span>
                            <span class="detail-value">${record.startDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">結束日期：</span>
                            <span class="detail-value">${record.endDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">申請天數：</span>
                            <span class="detail-value">${record.leaveDays} 天</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>請假原因</h4>
                        <div class="detail-item">
                            <span class="detail-label">原因：</span>
                            <span class="detail-value">${record.reason}</span>
                        </div>
                    </div>
                    
                    ${record.substituteEmployee ? `
                    <div class="detail-section">
                        <h4>代理人資訊</h4>
                        <div class="detail-item">
                            <span class="detail-label">代理人：</span>
                            <span class="detail-value">${record.substituteEmployee}</span>
                        </div>
                        ${record.substituteNote ? `
                        <div class="detail-item">
                            <span class="detail-label">交辦事項：</span>
                            <span class="detail-value">${record.substituteNote}</span>
                        </div>
                        ` : ''}
                    </div>
                    ` : ''}
                    
                    <div class="detail-section">
                        <h4>審核資訊</h4>
                        <div class="detail-item">
                            <span class="detail-label">狀態：</span>
                            <span class="detail-value"><span class="status-badge ${statusInfo.class}">${statusInfo.text}</span></span>
                        </div>
                        ${record.reviewerName ? `
                        <div class="detail-item">
                            <span class="detail-label">審核人：</span>
                            <span class="detail-value">${record.reviewerName}</span>
                        </div>
                        ` : ''}
                        ${reviewDate !== '-' ? `
                        <div class="detail-item">
                            <span class="detail-label">審核日期：</span>
                            <span class="detail-value">${reviewDate}</span>
                        </div>
                        ` : ''}
                        ${record.reviewNote ? `
                        <div class="detail-item">
                            <span class="detail-label">審核意見：</span>
                            <span class="detail-value">${record.reviewNote}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${record.proofUrl ? `
                    <div class="detail-section">
                        <h4>證明文件</h4>
                        <div class="detail-item">
                            <span class="detail-label">文件：</span>
                            <span class="detail-value"><a href="${record.proofUrl}" target="_blank" class="proof-link"><i class="fas fa-file"></i> ${record.proofFileName || '查看證明文件'}</a></span>
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
            
            document.getElementById('leaveDetailContent').innerHTML = content;
            
            // 設置操作按鈕
            const actions = document.getElementById('leaveDetailActions');
            if (record.status === 'pending') {
                actions.innerHTML = `
                    <button type="button" class="btn btn-secondary" onclick="window.pageManager.closeLeaveDetail()">關閉</button>
                    <button type="button" class="btn btn-warning" onclick="window.pageManager.cancelLeaveApplication('${recordId}')">
                        <i class="fas fa-times"></i> 取消申請
                    </button>
                `;
            } else {
                actions.innerHTML = `
                    <button type="button" class="btn btn-secondary" onclick="window.pageManager.closeLeaveDetail()">關閉</button>
                `;
            }
            
            document.getElementById('leaveDetailModal').style.display = 'block';
            
        } catch (error) {
            console.error('載入請假詳情失敗:', error);
            alert('載入詳情失敗，請重試');
        }
    }

    // 關閉請假詳情
    closeLeaveDetail() {
        document.getElementById('leaveDetailModal').style.display = 'none';
    }

    // 取消請假申請
    async cancelLeaveApplication(recordId) {
        if (!confirm('確定要取消這筆請假申請嗎？')) {
            return;
        }
        
        try {
            await db.collection('leaveRecords').doc(recordId).update({
                status: 'cancelled',
                cancelledAt: firebase.firestore.FieldValue.serverTimestamp(),
                cancelledBy: window.currentUser.employeeId
            });
            
            this.showSuccessToast('請假申請已取消');
            this.closeLeaveDetail();
            this.loadLeaveRecordsData();
            this.loadEmployeeLeaveBalance();
            
        } catch (error) {
            console.error('取消請假申請失敗:', error);
            alert('取消申請失敗，請重試');
        }
    }

    // 載入社區管理內容
    async loadCommunityContent(subPage) {
        if (!window.currentUser) return '<div class="error">請先登入</div>';

        switch (subPage) {
            case 'community-list':
                return await this.loadCommunityList();
            case 'community-add':
                return this.loadCommunityAddForm();
            case 'community-schedule':
                return await this.loadCommunitySchedule();
            case 'community-overview':
                return await this.loadCommunityOverview();
            default:
                return await this.loadCommunityList();
        }
    }

    // 載入社區列表
    async loadCommunityList() {
        try {
            const snapshot = await db.collection('communities')
                .orderBy('createdAt', 'desc')
                .get();

            let communitiesHtml = '';
            let activeCount = 0;
            let inactiveCount = 0;

            snapshot.forEach(doc => {
                const community = doc.data();
                if (community.status === 'active') {
                    activeCount++;
                } else {
                    inactiveCount++;
                }
                communitiesHtml += this.generateCommunityCard(doc.id, community);
            });

            return `
                <div class="community-management">
                    <div class="page-header">
                        <h2><i class="fas fa-building"></i> 社區管理</h2>
                        <div class="header-actions">
                            <button class="btn btn-primary" onclick="window.pageManager.showAddCommunity()">
                                <i class="fas fa-plus"></i> 新增社區
                            </button>
                            <button class="btn btn-outline" onclick="window.pageManager.loadCommunitySchedule()">
                                <i class="fas fa-calendar-alt"></i> 班表管理
                            </button>
                            <button class="btn btn-outline" onclick="window.pageManager.loadCommunityOverview()">
                                <i class="fas fa-chart-bar"></i> 總覽統計
                            </button>
                        </div>
                    </div>

                    <div class="stats-cards">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-building"></i>
                            </div>
                            <div class="stat-info">
                                <h3>${activeCount}</h3>
                                <p>活躍社區</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-building"></i>
                            </div>
                            <div class="stat-info">
                                <h3>${inactiveCount}</h3>
                                <p>停用社區</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-info">
                                <h3>${snapshot.size}</h3>
                                <p>總社區數</p>
                            </div>
                        </div>
                    </div>

                    <div class="filter-section">
                        <div class="filter-group">
                            <label>狀態篩選：</label>
                            <select id="communityStatusFilter" class="form-control" onchange="window.pageManager.filterCommunities()">
                                <option value="all">全部</option>
                                <option value="active">活躍</option>
                                <option value="inactive">停用</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>搜尋：</label>
                            <input type="text" id="communitySearch" class="form-control" placeholder="輸入社區名稱..." onkeyup="window.pageManager.searchCommunities()">
                        </div>
                    </div>

                    <div class="community-grid" id="communityGrid">
                        ${communitiesHtml || '<div class="no-data">暫無社區資料</div>'}
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('載入社區列表失敗:', error);
            return '<div class="error">載入社區列表失敗</div>';
        }
    }

    // 生成社區卡片HTML
    generateCommunityCard(communityId, community) {
        const statusBadge = community.status === 'active' 
            ? '<span class="badge badge-success">活躍</span>'
            : '<span class="badge badge-danger">停用</span>';

        const locationText = community.location 
            ? `${community.location.address || '未設定地址'}`
            : '未設定位置';

        return `
            <div class="community-card" data-id="${communityId}" data-status="${community.status}">
                <div class="card-header">
                    <h3>${community.name}</h3>
                    ${statusBadge}
                </div>
                <div class="card-body">
                    <div class="info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${locationText}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-phone"></i>
                        <span>${community.contactPhone || '無聯絡電話'}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-user"></i>
                        <span>負責人：${community.manager || '未設定'}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-users"></i>
                        <span>員工數：${community.employeeCount || 0}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-calendar"></i>
                        <span>建立時間：${this.formatDateTime(community.createdAt)}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-sm btn-outline" onclick="window.pageManager.viewCommunityDetail('${communityId}')">
                        <i class="fas fa-eye"></i> 查看詳情
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="window.pageManager.editCommunity('${communityId}')">
                        <i class="fas fa-edit"></i> 編輯
                    </button>
                    <button class="btn btn-sm ${community.status === 'active' ? 'btn-warning' : 'btn-success'}" 
                            onclick="window.pageManager.toggleCommunityStatus('${communityId}', '${community.status}')">
                        <i class="fas fa-${community.status === 'active' ? 'pause' : 'play'}"></i> 
                        ${community.status === 'active' ? '停用' : '啟用'}
                    </button>
                </div>
            </div>
        `;
    }

    // 載入新增社區表單
    loadCommunityAddForm() {
        return `
            <div class="community-form">
                <div class="page-header">
                    <h2><i class="fas fa-plus"></i> 新增社區</h2>
                    <button class="btn btn-secondary" onclick="window.pageManager.loadCommunityList()">
                        <i class="fas fa-arrow-left"></i> 返回列表
                    </button>
                </div>

                <form id="communityForm" class="form-container">
                    <div class="form-section">
                        <h3>基本資訊</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="communityName">社區名稱 <span class="required">*</span></label>
                                <input type="text" id="communityName" name="name" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="communityCode">社區代碼</label>
                                <input type="text" id="communityCode" name="code" class="form-control" placeholder="例如：COM001">
                            </div>
                            <div class="form-group">
                                <label for="communityType">社區類型</label>
                                <select id="communityType" name="type" class="form-control">
                                    <option value="residential">住宅社區</option>
                                    <option value="commercial">商業大樓</option>
                                    <option value="mixed">混合用途</option>
                                    <option value="industrial">工業園區</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="communityStatus">狀態</label>
                                <select id="communityStatus" name="status" class="form-control">
                                    <option value="active">活躍</option>
                                    <option value="inactive">停用</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>聯絡資訊</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="communityAddress">地址 <span class="required">*</span></label>
                                <input type="text" id="communityAddress" name="address" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="communityPhone">聯絡電話</label>
                                <input type="tel" id="communityPhone" name="contactPhone" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="communityEmail">聯絡信箱</label>
                                <input type="email" id="communityEmail" name="contactEmail" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="communityManager">負責人</label>
                                <input type="text" id="communityManager" name="manager" class="form-control">
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>位置資訊</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="communityLatitude">緯度</label>
                                <input type="number" id="communityLatitude" name="latitude" class="form-control" step="0.000001">
                            </div>
                            <div class="form-group">
                                <label for="communityLongitude">經度</label>
                                <input type="number" id="communityLongitude" name="longitude" class="form-control" step="0.000001">
                            </div>
                            <div class="form-group">
                                <label for="communityRadius">打卡範圍（米）</label>
                                <input type="number" id="communityRadius" name="checkInRadius" class="form-control" value="500" min="50" max="1000">
                            </div>
                        </div>
                        <button type="button" class="btn btn-outline" onclick="window.pageManager.getCurrentLocation()">
                            <i class="fas fa-location-arrow"></i> 獲取當前位置
                        </button>
                    </div>

                    <div class="form-section">
                        <h3>其他設定</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="communityDescription">社區描述</label>
                                <textarea id="communityDescription" name="description" class="form-control" rows="3"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="communityNotes">備註</label>
                                <textarea id="communityNotes" name="notes" class="form-control" rows="3"></textarea>
                            </div>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> 儲存社區
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="window.pageManager.loadCommunityList()">
                            <i class="fas fa-times"></i> 取消
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    // 載入社區班表管理
    async loadCommunitySchedule() {
        try {
            // 獲取所有活躍社區
            const communitiesSnapshot = await db.collection('communities')
                .where('status', '==', 'active')
                .orderBy('name')
                .get();

            const communities = [];
            communitiesSnapshot.forEach(doc => {
                communities.push({ id: doc.id, ...doc.data() });
            });

            // 獲取員工列表
            const employeesSnapshot = await db.collection('users')
                .where('role', 'in', ['employee', 'manager'])
                .orderBy('name')
                .get();

            const employees = [];
            employeesSnapshot.forEach(doc => {
                employees.push({ id: doc.id, ...doc.data() });
            });

            return `
                <div class="community-schedule">
                    <div class="page-header">
                        <h2><i class="fas fa-calendar-alt"></i> 社區班表管理</h2>
                        <button class="btn btn-primary" onclick="window.pageManager.addSchedule()">
                            <i class="fas fa-plus"></i> 新增班表
                        </button>
                    </div>

                    <div class="schedule-controls">
                        <div class="control-group">
                            <label for="scheduleCommunity">選擇社區：</label>
                            <select id="scheduleCommunity" class="form-control" onchange="window.pageManager.loadScheduleData()">
                                <option value="">請選擇社區</option>
                                ${communities.map(community => `
                                    <option value="${community.id}">${community.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="control-group">
                            <label for="scheduleWeek">選擇週次：</label>
                            <input type="week" id="scheduleWeek" class="form-control" onchange="window.pageManager.loadScheduleData()">
                        </div>
                        <div class="control-group">
                            <button class="btn btn-outline" onclick="window.pageManager.exportSchedule()">
                                <i class="fas fa-download"></i> 匯出班表
                            </button>
                        </div>
                    </div>

                    <div class="schedule-calendar" id="scheduleCalendar">
                        <div class="calendar-header">
                            <div class="calendar-day">週一</div>
                            <div class="calendar-day">週二</div>
                            <div class="calendar-day">週三</div>
                            <div class="calendar-day">週四</div>
                            <div class="calendar-day">週五</div>
                            <div class="calendar-day">週六</div>
                            <div class="calendar-day">週日</div>
                        </div>
                        <div class="calendar-body" id="calendarBody">
                            <!-- 班表內容將在這裡動態生成 -->
                        </div>
                    </div>

                    <div class="schedule-employees">
                        <h3>可排班員工</h3>
                        <div class="employee-list" id="availableEmployees">
                            ${employees.map(employee => `
                                <div class="employee-item" draggable="true" data-employee-id="${employee.id}" data-employee-name="${employee.name}">
                                    <div class="employee-info">
                                        <div class="employee-name">${employee.name}</div>
                                        <div class="employee-department">${employee.department || '未設定部門'}</div>
                                    </div>
                                    <div class="employee-role">${employee.role}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('載入社區班表失敗:', error);
            return '<div class="error">載入社區班表失敗</div>';
        }
    }

    // 載入社區總覽統計
    async loadCommunityOverview() {
        try {
            // 獲取所有社區
            const communitiesSnapshot = await db.collection('communities').get();
            
            // 獲取本月的打卡記錄
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            
            const checkinSnapshot = await db.collection('checkins')
                .where('timestamp', '>=', startOfMonth)
                .get();

            // 統計數據
            let totalCommunities = 0;
            let activeCommunities = 0;
            let totalCheckins = 0;
            let totalEmployees = 0;

            const communityStats = {};

            communitiesSnapshot.forEach(doc => {
                const community = doc.data();
                totalCommunities++;
                if (community.status === 'active') {
                    activeCommunities++;
                }
                totalEmployees += community.employeeCount || 0;
                
                communityStats[doc.id] = {
                    name: community.name,
                    checkinCount: 0,
                    employeeCount: community.employeeCount || 0,
                    status: community.status
                };
            });

            checkinSnapshot.forEach(doc => {
                const checkin = doc.data();
                totalCheckins++;
                if (communityStats[checkin.communityId]) {
                    communityStats[checkin.communityId].checkinCount++;
                }
            });

            return `
                <div class="community-overview">
                    <div class="page-header">
                        <h2><i class="fas fa-chart-bar"></i> 社區總覽統計</h2>
                        <div class="header-actions">
                            <select id="overviewCommunity" class="form-control" onchange="window.pageManager.loadCommunityScheduleData()">
                                <option value="">全部社區</option>
                                ${Object.entries(communityStats).map(([id, stats]) => `
                                    <option value="${id}">${stats.name}</option>
                                `).join('')}
                            </select>
                            <button class="btn btn-outline" onclick="window.pageManager.exportOverview()">
                                <i class="fas fa-download"></i> 匯出報表
                            </button>
                        </div>
                    </div>

                    <div class="overview-stats">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-building"></i>
                            </div>
                            <div class="stat-info">
                                <h3>${totalCommunities}</h3>
                                <p>總社區數</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="stat-info">
                                <h3>${activeCommunities}</h3>
                                <p>活躍社區</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-user-check"></i>
                            </div>
                            <div class="stat-info">
                                <h3>${totalCheckins}</h3>
                                <p>本月打卡次數</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-info">
                                <h3>${totalEmployees}</h3>
                                <p>總員工數</p>
                            </div>
                        </div>
                    </div>

                    <div class="overview-charts">
                        <div class="chart-container">
                            <h3>社區打卡統計</h3>
                            <canvas id="checkinChart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>員工分布統計</h3>
                            <canvas id="employeeChart"></canvas>
                        </div>
                    </div>

                    <div class="overview-table">
                        <h3>詳細統計資料</h3>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>社區名稱</th>
                                    <th>狀態</th>
                                    <th>員工數</th>
                                    <th>本月打卡次數</th>
                                    <th>平均打卡率</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(communityStats).map(([id, stats]) => `
                                    <tr>
                                        <td>${stats.name}</td>
                                        <td>${stats.status === 'active' ? '<span class="badge badge-success">活躍</span>' : '<span class="badge badge-danger">停用</span>'}</td>
                                        <td>${stats.employeeCount}</td>
                                        <td>${stats.checkinCount}</td>
                                        <td>${stats.employeeCount > 0 ? ((stats.checkinCount / (stats.employeeCount * 30)) * 100).toFixed(1) + '%' : '0%'}</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline" onclick="window.pageManager.viewCommunityDetail('${id}')">
                                                <i class="fas fa-eye"></i> 查看
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('載入社區總覽失敗:', error);
            return '<div class="error">載入社區總覽失敗</div>';
        }
    }

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