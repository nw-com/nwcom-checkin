// PageManager 類別 - 負責頁面管理和導航
class PageManager {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentSubPage = '';
        this.pages = {
            'dashboard': { title: '儀表板', icon: 'fas fa-tachometer-alt' },
            'community': { title: '社區管理', icon: 'fas fa-building' },
            'personnel': { title: '人員管理', icon: 'fas fa-users' },
            'checkin': { title: '打卡管理', icon: 'fas fa-clock' },
            'reports': { title: '報表中心', icon: 'fas fa-chart-bar' },
            'system': { title: '系統管理', icon: 'fas fa-cog' },
            'account': { title: '帳號管理', icon: 'fas fa-user' }
        };
    }

    // 切換側邊欄
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    // 載入頁面
    async loadPage(pageName, subPage = '') {
        try {
            // 檢查權限
            if (!this.checkPagePermission(pageName)) {
                this.showError('您沒有權限訪問此頁面');
                return;
            }

            this.currentPage = pageName;
            this.currentSubPage = subPage;

            // 更新活動選單
            this.updateActiveMenu(pageName);

            // 載入頁面內容
            await this.loadPageContent(pageName, subPage);

            // 綁定頁面事件
            this.bindPageEvents(pageName);

            // 更新頁面標題
            this.updatePageTitle(pageName, subPage);

            // 關閉側邊欄（在行動裝置上）
            this.closeSidebar();

        } catch (error) {
            console.error('載入頁面失敗:', error);
            this.showError('載入頁面失敗：' + error.message);
        }
    }

    // 切換子頁面
    async switchPage(pageName, subPage) {
        await this.loadPage(pageName, subPage);
    }

    // 檢查頁面權限
    checkPagePermission(pageName) {
        // 基本頁面不需要特殊權限
        const publicPages = ['dashboard', 'personal', 'checkin'];
        if (publicPages.includes(pageName)) {
            return true;
        }
        
        const userPermissions = window.currentUser?.permissions || {};
        const requiredPermission = this.getRequiredPermission(pageName);
        
        if (!requiredPermission) return true;
        
        return userPermissions[requiredPermission] === true;
    }

    // 獲取頁面所需權限
    getRequiredPermission(pageName) {
        const permissionMap = {
            'community': 'view_community',
            'personnel': 'view_personnel',
            'checkin': 'view_checkin',
            'reports': 'view_reports',
            'system': 'view_system',
            'account': 'view_account'
        };
        
        return permissionMap[pageName];
    }

    // 更新活動選單
    updateActiveMenu(pageName) {
        const menuItems = document.querySelectorAll('.nav-item[data-page]');
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });
    }

    // 載入頁面內容
    async loadPageContent(pageName, subPage) {
        const contentArea = document.getElementById('pageContent');
        if (!contentArea) return;

        // 顯示載入中
        contentArea.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 載入中...</div>';

        try {
            let htmlContent = '';
            
            switch (pageName) {
                case 'dashboard':
                    htmlContent = await this.loadDashboardContent();
                    break;
                case 'community':
                    htmlContent = await this.loadCommunityContent(subPage);
                    break;
                case 'personnel':
                    htmlContent = await this.loadPersonnelContent(subPage);
                    break;
                case 'checkin':
                    htmlContent = await this.loadCheckinContent(subPage);
                    break;
                case 'reports':
                    htmlContent = await this.loadReportsContent(subPage);
                    break;
                case 'system':
                    htmlContent = await this.loadSystemContent(subPage);
                    break;
                case 'account':
                    htmlContent = await this.loadAccountContent(subPage);
                    break;
                default:
                    htmlContent = '<div class="error">頁面不存在</div>';
            }

            contentArea.innerHTML = htmlContent;
            
        } catch (error) {
            console.error('載入頁面內容失敗:', error);
            contentArea.innerHTML = '<div class="error">載入頁面內容失敗</div>';
        }
    }

    // 綁定頁面事件
    bindPageEvents(pageName) {
        // 這裡將根據不同頁面綁定特定事件
        // 實現將根據頁面需求添加
        
        if (pageName === 'community') {
            this.bindCommunityEvents();
        } else if (pageName === 'personnel') {
            this.bindPersonnelEvents();
        } else if (pageName === 'checkin') {
            this.bindCheckinEvents();
        } else if (pageName === 'system') {
            this.bindSystemEvents();
        } else if (pageName === 'account') {
            this.bindAccountEvents();
        }
    }

    // 更新頁面標題
    updatePageTitle(pageName, subPage) {
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle && this.pages[pageName]) {
            let title = this.pages[pageName].title;
            if (subPage) {
                title += ' - ' + this.getSubPageTitle(subPage);
            }
            pageTitle.textContent = title;
        }
    }

    // 獲取子頁面標題
    getSubPageTitle(subPage) {
        const subPageTitles = {
            'community-list': '社區列表',
            'community-add': '新增社區',
            'community-schedule': '班表管理',
            'community-overview': '總覽',
            'personnel-list': '人員列表',
            'personnel-add': '新增人員',
            'personnel-schedule': '班表管理',
            'checkin-history': '打卡記錄',
            'checkin-realtime': '即時打卡',
            'reports-attendance': '出勤報表',
            'reports-performance': '績效報表',
            'system-settings': '系統設定',
            'system-logs': '系統日誌',
            'system-backup': '備份管理',
            'user-list': '使用者列表',
            'user-add': '新增使用者',
            'role-manage': '角色管理'
        };
        
        return subPageTitles[subPage] || subPage;
    }

    // 關閉側邊欄
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    }

    // 顯示錯誤訊息
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    // 格式化日期時間
    formatDateTime(timestamp) {
        if (!timestamp) return '無';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // 載入儀表板內容
    async loadDashboardContent() {
        return `
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h2>儀表板</h2>
                    <div class="dashboard-stats">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-building"></i>
                            </div>
                            <div class="stat-content">
                                <h3>社區總數</h3>
                                <p class="stat-number" id="totalCommunities">0</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-content">
                                <h3>人員總數</h3>
                                <p class="stat-number" id="totalPersonnel">0</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="stat-content">
                                <h3>今日打卡</h3>
                                <p class="stat-number" id="todayCheckins">0</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="stat-content">
                                <h3>出勤率</h3>
                                <p class="stat-number" id="attendanceRate">0%</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-content">
                    <div class="content-section">
                        <h3>最近活動</h3>
                        <div class="activity-list" id="recentActivities">
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <i class="fas fa-user-check"></i>
                                </div>
                                <div class="activity-content">
                                    <p class="activity-title">管理員登入系統</p>
                                    <p class="activity-time">剛剛</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="content-section">
                        <h3>系統狀態</h3>
                        <div class="system-status">
                            <div class="status-item">
                                <span class="status-label">系統狀態：</span>
                                <span class="status-value status-online">正常運行</span>
                            </div>
                            <div class="status-item">
                                <span class="status-label">資料庫連接：</span>
                                <span class="status-value status-online">已連接</span>
                            </div>
                            <div class="status-item">
                                <span class="status-label">最後備份：</span>
                                <span class="status-value">2024-01-15 03:00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 載入社區管理內容
    async loadCommunityContent(subPage) {
        switch (subPage) {
            case 'community-list':
                return await this.loadCommunityList();
            case 'community-add':
                return await this.loadCommunityAddForm();
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
            const snapshot = await db.collection('communities').get();
            const communities = [];
            
            snapshot.forEach(doc => {
                communities.push({ id: doc.id, ...doc.data() });
            });

            let html = `
                <div class="page-header">
                    <h2>社區管理</h2>
                    <div class="page-actions">
                        <button class="btn btn-primary" onclick="pageManager.showAddCommunity()">
                            <i class="fas fa-plus"></i> 新增社區
                        </button>
                    </div>
                </div>
                
                <div class="filter-bar">
                    <div class="filter-group">
                        <label for="communityStatusFilter">狀態篩選：</label>
                        <select id="communityStatusFilter" onchange="pageManager.filterCommunities()">
                            <option value="all">全部</option>
                            <option value="active">活躍</option>
                            <option value="inactive">停用</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="communitySearch">搜尋：</label>
                        <input type="text" id="communitySearch" placeholder="輸入社區名稱..." onkeyup="pageManager.searchCommunities()">
                    </div>
                </div>
                
                <div class="community-grid" id="communityGrid">
            `;

            if (communities.length === 0) {
                html += '<div class="empty-state">尚無社區資料</div>';
            } else {
                communities.forEach(community => {
                    html += `
                        <div class="community-card" data-status="${community.status || 'active'}">
                            <div class="card-header">
                                <h3>${community.name}</h3>
                                <span class="badge badge-${community.status === 'active' ? 'success' : 'danger'}">
                                    ${community.status === 'active' ? '活躍' : '停用'}
                                </span>
                            </div>
                            <div class="card-body">
                                <p><strong>代碼：</strong>${community.code || '無'}</p>
                                <p><strong>類型：</strong>${community.type || '未設定'}</p>
                                <p><strong>地址：</strong>${community.location?.address || community.address || '未設定'}</p>
                                <p><strong>負責人：</strong>${community.manager || '未設定'}</p>
                            </div>
                            <div class="card-actions">
                                <button class="btn btn-sm btn-info" onclick="pageManager.viewCommunityDetail('${community.id}')">
                                    <i class="fas fa-eye"></i> 查看
                                </button>
                                <button class="btn btn-sm btn-warning" onclick="pageManager.editCommunity('${community.id}')">
                                    <i class="fas fa-edit"></i> 編輯
                                </button>
                                <button class="btn btn-sm btn-${community.status === 'active' ? 'danger' : 'success'}" 
                                        onclick="pageManager.toggleCommunityStatus('${community.id}', '${community.status}')">
                                    <i class="fas fa-${community.status === 'active' ? 'pause' : 'play'}"></i>
                                    ${community.status === 'active' ? '停用' : '啟用'}
                                </button>
                            </div>
                        </div>
                    `;
                });
            }

            html += '</div>';
            return html;
            
        } catch (error) {
            console.error('載入社區列表失敗:', error);
            return '<div class="error">載入社區列表失敗</div>';
        }
    }

    // 顯示新增社區表單
    showAddCommunity() {
        this.switchPage('community', 'community-add');
    }

    // 載入新增社區表單
    async loadCommunityAddForm() {
        return `
            <div class="page-header">
                <h2>新增社區</h2>
                <div class="page-actions">
                    <button class="btn btn-secondary" onclick="pageManager.loadCommunityList()">
                        <i class="fas fa-arrow-left"></i> 返回列表
                    </button>
                </div>
            </div>
            
            <form id="communityAddForm" class="form-container" onsubmit="pageManager.submitCommunityForm(event)">
                <div class="form-section">
                    <h3>基本資訊</h3>
                    <div class="form-group">
                        <label for="communityName">社區名稱 <span class="required">*</span></label>
                        <input type="text" id="communityName" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="communityCode">社區代碼</label>
                        <input type="text" id="communityCode" name="code" placeholder="例如：COM001">
                    </div>
                    <div class="form-group">
                        <label for="communityType">社區類型</label>
                        <select id="communityType" name="type">
                            <option value="residential">住宅社區</option>
                            <option value="commercial">商業大樓</option>
                            <option value="mixed">混合用途</option>
                            <option value="industrial">工業園區</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="communityStatus">狀態</label>
                        <select id="communityStatus" name="status">
                            <option value="active">活躍</option>
                            <option value="inactive">停用</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>聯絡資訊</h3>
                    <div class="form-group">
                        <label for="communityAddress">地址</label>
                        <textarea id="communityAddress" name="address" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="communityPhone">電話</label>
                        <input type="tel" id="communityPhone" name="contactPhone">
                    </div>
                    <div class="form-group">
                        <label for="communityEmail">信箱</label>
                        <input type="email" id="communityEmail" name="contactEmail">
                    </div>
                    <div class="form-group">
                        <label for="communityManager">負責人</label>
                        <input type="text" id="communityManager" name="manager">
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>位置設定</h3>
                    <div class="form-group">
                        <label for="communityLatitude">緯度</label>
                        <input type="number" id="communityLatitude" name="latitude" step="0.000001" placeholder="例如：25.0330">
                    </div>
                    <div class="form-group">
                        <label for="communityLongitude">經度</label>
                        <input type="number" id="communityLongitude" name="longitude" step="0.000001" placeholder="例如：121.5654">
                    </div>
                    <div class="form-group">
                        <label for="checkInRadius">打卡範圍（米）</label>
                        <input type="number" id="checkInRadius" name="checkInRadius" value="500" min="50" max="2000">
                    </div>
                    <div class="form-group">
                        <button type="button" class="btn btn-info" onclick="pageManager.getCurrentLocationForCommunity()">
                            <i class="fas fa-location-dot"></i> 獲取當前位置
                        </button>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>其他資訊</h3>
                    <div class="form-group">
                        <label for="communityDescription">描述</label>
                        <textarea id="communityDescription" name="description" rows="4"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="communityNotes">備註</label>
                        <textarea id="communityNotes" name="notes" rows="3"></textarea>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> 儲存社區
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="pageManager.loadCommunityList()">
                        <i class="fas fa-times"></i> 取消
                    </button>
                </div>
            </form>
        `;
    }

    // 篩選社區
    filterCommunities() {
        const statusFilter = document.getElementById('communityStatusFilter')?.value || 'all';
        const searchTerm = document.getElementById('communitySearch')?.value.toLowerCase() || '';
        const communityCards = document.querySelectorAll('.community-card');

        communityCards.forEach(card => {
            const status = card.dataset.status;
            const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
            
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
    }

    // 搜尋社區
    searchCommunities() {
        this.filterCommunities();
    }

    // 查看社區詳情
    async viewCommunityDetail(communityId) {
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
                                        <span>${this.formatDateTime(community.createdAt)}</span>
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
                            <button class="btn btn-primary" onclick="pageManager.editCommunity('${communityId}')">
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
    }

    // 編輯社區
    editCommunity(communityId) {
        // 實現編輯功能，可以重複使用新增表單
        alert('編輯功能開發中...');
    }

    // 切換社區狀態
    async toggleCommunityStatus(communityId, currentStatus) {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await db.collection('communities').doc(communityId).update({
                status: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            alert(`社區已${newStatus === 'active' ? '啟用' : '停用'}`);
            this.loadCommunityList();
            
        } catch (error) {
            console.error('切換社區狀態失敗:', error);
            alert('切換社區狀態失敗');
        }
    }

    // 載入社區列表
    loadCommunityList() {
        this.switchPage('community', 'community-list');
    }

    // 提交社區表單
    async submitCommunityForm(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        try {
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
                location: {
                    latitude: parseFloat(formData.get('latitude')) || null,
                    longitude: parseFloat(formData.get('longitude')) || null,
                    checkInRadius: parseInt(formData.get('checkInRadius')) || 500,
                    address: formData.get('address')
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('communities').add(communityData);
            
            alert('社區新增成功！');
            this.loadCommunityList();
            
        } catch (error) {
            console.error('新增社區失敗:', error);
            alert('新增社區失敗：' + error.message);
        }
    }

    // 獲取當前位置（用於社區設定）
    getCurrentLocationForCommunity() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    document.getElementById('communityLatitude').value = position.coords.latitude.toFixed(6);
                    document.getElementById('communityLongitude').value = position.coords.longitude.toFixed(6);
                },
                (error) => {
                    alert('無法獲取位置資訊：' + error.message);
                }
            );
        } else {
            alert('您的瀏覽器不支援地理位置功能');
        }
    }

    // 獲取當週
    getCurrentWeek() {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const dayOfYear = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
        return Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
    }

    // 載入社區班表
    async loadCommunitySchedule() {
        const currentWeek = this.getCurrentWeek();
        const scheduleData = await this.loadScheduleData(currentWeek);
        
        return `
            <div class="page-header">
                <h2>班表管理</h2>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="pageManager.exportSchedule()">
                        <i class="fas fa-download"></i> 匯出班表
                    </button>
                </div>
            </div>
            
            <div class="schedule-controls">
                <div class="week-selector">
                    <button class="btn btn-secondary" onclick="pageManager.changeWeek(-1)">
                        <i class="fas fa-chevron-left"></i> 上週
                    </button>
                    <span class="week-display">第 ${currentWeek} 週</span>
                    <button class="btn btn-secondary" onclick="pageManager.changeWeek(1)">
                        下週 <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
            
            <div class="schedule-calendar">
                ${this.generateScheduleCalendar(currentWeek, scheduleData)}
            </div>
        `;
    }

    // 載入班表資料
    async loadScheduleData(week) {
        // 這裡應該從資料庫載入實際的班表資料
        // 現在先用模擬資料
        return {
            monday: { morning: [], afternoon: [], evening: [] },
            tuesday: { morning: [], afternoon: [], evening: [] },
            wednesday: { morning: [], afternoon: [], evening: [] },
            thursday: { morning: [], afternoon: [], evening: [] },
            friday: { morning: [], afternoon: [], evening: [] },
            saturday: { morning: [], afternoon: [], evening: [] },
            sunday: { morning: [], afternoon: [], evening: [] }
        };
    }

    // 生成班表日曆
    generateScheduleCalendar(week, scheduleData) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayNames = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
        const timeSlots = ['morning', 'afternoon', 'evening'];
        const slotNames = { morning: '上午', afternoon: '下午', evening: '晚上' };
        
        let html = '<div class="schedule-grid">';
        
        // 生成表頭
        html += '<div class="schedule-header">';
        html += '<div class="time-slot-header">時段</div>';
        days.forEach((day, index) => {
            const date = this.getDateForWeekAndDay(week, index);
            html += `<div class="day-header">${dayNames[index]}<br><small>${date}</small></div>`;
        });
        html += '</div>';
        
        // 生成時段行
        timeSlots.forEach(slot => {
            html += '<div class="schedule-row">';
            html += `<div class="time-slot-label">${slotNames[slot]}</div>`;
            
            days.forEach(day => {
                const employees = scheduleData[day][slot] || [];
                html += `<div class="schedule-cell" data-day="${day}" data-slot="${slot}">`;
                html += '<div class="employee-list">';
                
                employees.forEach(emp => {
                    html += `
                        <div class="employee-item" draggable="true" data-employee-id="${emp.id}">
                            <span class="employee-name">${emp.name}</span>
                            <button class="remove-employee" onclick="pageManager.removeEmployeeFromSchedule('${day}', '${slot}', '${emp.id}')">&times;</button>
                        </div>
                    `;
                });
                
                html += '</div>';
                html += '<div class="add-employee" onclick="pageManager.assignEmployeeToSchedule(\'${day}\', \'${slot}\')">+</div>';
                html += '</div>';
            });
            
            html += '</div>';
        });
        
        html += '</div>';
        return html;
    }

    // 獲取週和日的日期
    getDateForWeekAndDay(week, dayIndex) {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const firstDayOfWeek = startOfYear.getDay();
        const daysToAdd = (week - 1) * 7 + dayIndex - firstDayOfWeek + 1;
        
        const targetDate = new Date(startOfYear);
        targetDate.setDate(startOfYear.getDate() + daysToAdd);
        
        return targetDate.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
    }

    // 獲取週的第一天
    getFirstDayOfWeek(year, week) {
        const startOfYear = new Date(year, 0, 1);
        const firstDayOfWeek = startOfYear.getDay();
        const daysToAdd = (week - 1) * 7 - firstDayOfWeek + 1;
        
        const targetDate = new Date(startOfYear);
        targetDate.setDate(startOfYear.getDate() + daysToAdd);
        
        return targetDate;
    }

    // 分配員工到班表
    async assignEmployeeToSchedule(date, timeSlot, employeeData) {
        // 這裡應該實現分配員工到班表的邏輯
        alert('分配員工功能開發中...');
    }

    // 從班表中移除員工
    async removeEmployeeFromSchedule(date, timeSlot, employeeId) {
        if (confirm('確定要從此時段移除該員工嗎？')) {
            // 實際的移除邏輯
            alert('移除員工功能開發中...');
        }
    }

    // 切換週次
    changeWeek(direction) {
        // 實現切換週次的邏輯
        alert('切換週次功能開發中...');
    }

    // 匯出班表
    exportSchedule() {
        alert('匯出班表功能開發中...');
    }

    // 載入社區總覽
    async loadCommunityOverview() {
        return `
            <div class="page-header">
                <h2>社區總覽</h2>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="pageManager.exportOverview()">
                        <i class="fas fa-download"></i> 匯出總覽
                    </button>
                </div>
            </div>
            
            <div class="overview-container">
                <div class="overview-stats">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-building"></i></div>
                        <div class="stat-content">
                            <h3>社區總數</h3>
                            <p class="stat-number" id="totalCommunities">0</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-user-tie"></i></div>
                        <div class="stat-content">
                            <h3>管理人員</h3>
                            <p class="stat-number" id="totalManagers">0</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-clock"></i></div>
                        <div class="stat-content">
                            <h3>本週打卡</h3>
                            <p class="stat-number" id="weeklyCheckins">0</p>
                        </div>
                    </div>
                </div>
                
                <div class="overview-charts">
                    <div class="chart-container">
                        <h3>社區狀態分布</h3>
                        <canvas id="communityStatusChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>本週出勤趨勢</h3>
                        <canvas id="attendanceTrendChart"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    // 匯出總覽
    exportOverview() {
        alert('匯出總覽功能開發中...');
    }

    // 載入人員管理內容
    async loadPersonnelContent(subPage) {
        switch (subPage) {
            case 'personnel-list':
                return await this.loadPersonnelList();
            case 'personnel-add':
                return await this.loadPersonnelAddForm();
            case 'personnel-schedule':
                return await this.loadPersonnelSchedule();
            default:
                return await this.loadPersonnelList();
        }
    }

    // 載入人員列表
    async loadPersonnelList() {
        return `
            <div class="page-header">
                <h2>人員管理</h2>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="pageManager.showAddPersonnel()">
                        <i class="fas fa-plus"></i> 新增人員
                    </button>
                </div>
            </div>
            
            <div class="filter-bar">
                <div class="filter-group">
                    <label for="personnelStatusFilter">狀態篩選：</label>
                    <select id="personnelStatusFilter" onchange="pageManager.filterPersonnel()">
                        <option value="all">全部</option>
                        <option value="active">在職</option>
                        <option value="inactive">離職</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="personnelSearch">搜尋：</label>
                    <input type="text" id="personnelSearch" placeholder="輸入人員姓名..." onkeyup="pageManager.searchPersonnel()">
                </div>
            </div>
            
            <div class="personnel-list" id="personnelList">
                <div class="empty-state">尚無人員資料</div>
            </div>
        `;
    }

    // 顯示新增人員表單
    showAddPersonnel() {
        alert('新增人員功能開發中...');
    }

    // 篩選人員
    filterPersonnel() {
        alert('篩選人員功能開發中...');
    }

    // 搜尋人員
    searchPersonnel() {
        alert('搜尋人員功能開發中...');
    }

    // 載入人員班表
    async loadPersonnelSchedule() {
        return `
            <div class="page-header">
                <h2>人員班表</h2>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="pageManager.exportPersonnelSchedule()">
                        <i class="fas fa-download"></i> 匯出班表
                    </button>
                </div>
            </div>
            
            <div class="schedule-calendar">
                <div class="empty-state">人員班表功能開發中...</div>
            </div>
        `;
    }

    // 載入打卡管理內容
    async loadCheckinContent(subPage) {
        switch (subPage) {
            case 'checkin-history':
                return await this.loadCheckinHistory();
            case 'checkin-realtime':
                return await this.loadCheckinRealtime();
            default:
                return await this.loadCheckinHistory();
        }
    }

    // 載入打卡記錄
    async loadCheckinHistory() {
        return `
            <div class="page-header">
                <h2>打卡記錄</h2>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="pageManager.exportCheckinHistory()">
                        <i class="fas fa-download"></i> 匯出記錄
                    </button>
                </div>
            </div>
            
            <div class="filter-bar">
                <div class="filter-group">
                    <label for="checkinDateFilter">日期：</label>
                    <input type="date" id="checkinDateFilter" onchange="pageManager.filterCheckins()">
                </div>
                <div class="filter-group">
                    <label for="checkinStatusFilter">狀態：</label>
                    <select id="checkinStatusFilter" onchange="pageManager.filterCheckins()">
                        <option value="all">全部</option>
                        <option value="normal">正常</option>
                        <option value="late">遲到</option>
                        <option value="early">早退</option>
                        <option value="absent">缺勤</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="checkinSearch">搜尋：</label>
                    <input type="text" id="checkinSearch" placeholder="輸入人員姓名..." onkeyup="pageManager.searchCheckins()">
                </div>
            </div>
            
            <div class="checkin-history" id="checkinHistory">
                <div class="empty-state">尚無打卡記錄</div>
            </div>
        `;
    }

    // 載入即時打卡
    async loadCheckinRealtime() {
        return `
            <div class="page-header">
                <h2>即時打卡</h2>
                <div class="page-actions">
                    <button class="btn btn-success" onclick="pageManager.refreshRealtimeCheckin()">
                        <i class="fas fa-sync"></i> 重新整理
                    </button>
                </div>
            </div>
            
            <div class="realtime-checkin">
                <div class="checkin-status">
                    <div class="status-indicator">
                        <i class="fas fa-circle status-online"></i>
                        <span>系統正常運行</span>
                    </div>
                    <div class="last-update">
                        最後更新：<span id="lastUpdate">--</span>
                    </div>
                </div>
                
                <div class="checkin-map" id="checkinMap">
                    <div class="map-placeholder">
                        <i class="fas fa-map"></i>
                        <p>地圖載入中...</p>
                    </div>
                </div>
                
                <div class="recent-checkins">
                    <h3>最近打卡</h3>
                    <div class="checkin-list" id="recentCheckins">
                        <div class="empty-state">尚無打卡記錄</div>
                    </div>
                </div>
            </div>
        `;
    }

    // 篩選打卡記錄
    filterCheckins() {
        alert('篩選打卡功能開發中...');
    }

    // 搜尋打卡記錄
    searchCheckins() {
        alert('搜尋打卡功能開發中...');
    }

    // 匯出打卡記錄
    exportCheckinHistory() {
        alert('匯出打卡記錄功能開發中...');
    }

    // 重新整理即時打卡
    refreshRealtimeCheckin() {
        alert('重新整理功能開發中...');
    }

    // 載入報表中心內容
    async loadReportsContent(subPage) {
        switch (subPage) {
            case 'reports-attendance':
                return await this.loadAttendanceReports();
            case 'reports-performance':
                return await this.loadPerformanceReports();
            default:
                return await this.loadAttendanceReports();
        }
    }

    // 載入出勤報表
    async loadAttendanceReports() {
        return `
            <div class="page-header">
                <h2>出勤報表</h2>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="pageManager.exportAttendanceReport()">
                        <i class="fas fa-download"></i> 匯出報表
                    </button>
                </div>
            </div>
            
            <div class="report-filters">
                <div class="filter-group">
                    <label for="reportMonth">月份：</label>
                    <input type="month" id="reportMonth" value="${new Date().toISOString().slice(0, 7)}">
                </div>
                <div class="filter-group">
                    <label for="reportCommunity">社區：</label>
                    <select id="reportCommunity">
                        <option value="all">全部社區</option>
                    </select>
                </div>
                <div class="filter-group">
                    <button class="btn btn-info" onclick="pageManager.generateAttendanceReport()">
                        <i class="fas fa-chart-bar"></i> 生成報表
                    </button>
                </div>
            </div>
            
            <div class="report-content">
                <div class="report-chart">
                    <canvas id="attendanceChart"></canvas>
                </div>
                <div class="report-table">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>社區名稱</th>
                                <th>應出勤天數</th>
                                <th>實際出勤</th>
                                <th>遲到次數</th>
                                <th>早退次數</th>
                                <th>缺勤天數</th>
                                <th>出勤率</th>
                            </tr>
                        </thead>
                        <tbody id="attendanceTableBody">
                            <tr><td colspan="7" class="empty-state">請先生成報表</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // 載入績效報表
    async loadPerformanceReports() {
        return `
            <div class="page-header">
                <h2>績效報表</h2>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="pageManager.exportPerformanceReport()">
                        <i class="fas fa-download"></i> 匯出報表
                    </button>
                </div>
            </div>
            
            <div class="report-filters">
                <div class="filter-group">
                    <label for="performanceMonth">月份：</label>
                    <input type="month" id="performanceMonth" value="${new Date().toISOString().slice(0, 7)}">
                </div>
                <div class="filter-group">
                    <button class="btn btn-info" onclick="pageManager.generatePerformanceReport()">
                        <i class="fas fa-chart-line"></i> 生成報表
                    </button>
                </div>
            </div>
            
            <div class="report-content">
                <div class="report-chart">
                    <canvas id="performanceChart"></canvas>
                </div>
                <div class="report-table">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>人員姓名</th>
                                <th>負責社區</th>
                                <th>出勤率</th>
                                <th>工作時數</th>
                                <th>評分</th>
                                <th>排名</th>
                            </tr>
                        </thead>
                        <tbody id="performanceTableBody">
                            <tr><td colspan="6" class="empty-state">請先生成報表</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // 生成出勤報表
    generateAttendanceReport() {
        alert('生成出勤報表功能開發中...');
    }

    // 生成績效報表
    generatePerformanceReport() {
        alert('生成績效報表功能開發中...');
    }

    // 匯出出勤報表
    exportAttendanceReport() {
        alert('匯出出勤報表功能開發中...');
    }

    // 匯出績效報表
    exportPerformanceReport() {
        alert('匯出績效報表功能開發中...');
    }

    // 載入系統管理內容
    async loadSystemContent(subPage) {
        switch (subPage) {
            case 'system-settings':
                return await this.loadSystemSettings();
            case 'system-logs':
                return await this.loadSystemLogs();
            case 'system-backup':
                return await this.loadSystemBackup();
            default:
                return await this.loadSystemSettings();
        }
    }

    // 載入系統設定
    async loadSystemSettings() {
        return `
            <div class="page-header">
                <h2>系統設定</h2>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="pageManager.saveSystemSettings()">
                        <i class="fas fa-save"></i> 儲存設定
                    </button>
                </div>
            </div>
            
            <form id="systemSettingsForm" class="form-container">
                <div class="form-section">
                    <h3>基本設定</h3>
                    <div class="form-group">
                        <label for="systemName">系統名稱 <span class="required">*</span></label>
                        <input type="text" id="systemName" name="systemName" value="社區打卡管理系統" required>
                    </div>
                    <div class="form-group">
                        <label for="systemVersion">系統版本</label>
                        <input type="text" id="systemVersion" name="systemVersion" value="v1.0.0" readonly>
                    </div>
                    <div class="form-group">
                        <label for="systemLanguage">系統語言</label>
                        <select id="systemLanguage" name="language">
                            <option value="zh-TW">繁體中文</option>
                            <option value="zh-CN">簡體中文</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="timezone">時區</label>
                        <select id="timezone" name="timezone">
                            <option value="Asia/Taipei">台北 (UTC+8)</option>
                            <option value="Asia/Hong_Kong">香港 (UTC+8)</option>
                            <option value="Asia/Shanghai">上海 (UTC+8)</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>安全設定</h3>
                    <div class="form-group">
                        <label for="sessionTimeout">登入逾時（分鐘）</label>
                        <input type="number" id="sessionTimeout" name="sessionTimeout" value="30" min="5" max="480">
                    </div>
                    <div class="form-group">
                        <label for="maxLoginAttempts">最大登入嘗試次數</label>
                        <input type="number" id="maxLoginAttempts" name="maxLoginAttempts" value="5" min="3" max="10">
                    </div>
                    <div class="form-group">
                        <label for="passwordExpiry">密碼有效期（天）</label>
                        <input type="number" id="passwordExpiry" name="passwordExpiry" value="90" min="30" max="365">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="enableTwoFactor" name="enableTwoFactor">
                            啟用雙因素認證
                        </label>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>通知設定</h3>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="notifyLogin" name="notifyLogin" checked>
                            登入通知
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="notifyFailedLogin" name="notifyFailedLogin" checked>
                            登入失敗通知
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="notifyPasswordChange" name="notifyPasswordChange" checked>
                            密碼變更通知
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="notifySystemError" name="notifySystemError" checked>
                            系統錯誤通知
                        </label>
                    </div>
                </div>
            </form>
        `;
    }

    // 載入系統日誌
    async loadSystemLogs() {
        return `
            <div class="page-header">
                <h2>系統日誌</h2>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="pageManager.exportSystemLogs()">
                        <i class="fas fa-download"></i> 匯出日誌
                    </button>
                    <button class="btn btn-danger" onclick="pageManager.clearSystemLogs()">
                        <i class="fas fa-trash"></i> 清除日誌
                    </button>
                </div>
            </div>
            
            <div class="filter-bar">
                <div class="filter-group">
                    <label for="logLevelFilter">日誌等級：</label>
                    <select id="logLevelFilter" onchange="pageManager.filterSystemLogs()">
                        <option value="all">全部</option>
                        <option value="info">資訊</option>
                        <option value="warning">警告</option>
                        <option value="error">錯誤</option>
                        <option value="debug">除錯</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="logActionFilter">操作類型：</label>
                    <select id="logActionFilter" onchange="pageManager.filterSystemLogs()">
                        <option value="all">全部</option>
                        <option value="login">登入</option>
                        <option value="logout">登出</option>
                        <option value="create">新增</option>
                        <option value="update">更新</option>
                        <option value="delete">刪除</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="logSearch">搜尋：</label>
                    <input type="text" id="logSearch" placeholder="輸入關鍵字..." onkeyup="pageManager.filterSystemLogs()">
                </div>
            </div>
            
            <div class="system-logs">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>時間</th>
                            <th>使用者</th>
                            <th>等級</th>
                            <th>操作</th>
                            <th>目標</th>
                            <th>描述</th>
                            <th>IP 位址</th>
                        </tr>
                    </thead>
                    <tbody id="systemLogsTableBody">
                        <tr><td colspan="7" class="empty-state">尚無系統日誌</td></tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    // 建立系統備份
    async createSystemBackup() {
        try {
            alert('系統備份功能開發中...');
            // 實際應用中需要實現資料庫備份功能
        } catch (error) {
            console.error('建立系統備份失敗:', error);
            alert('建立系統備份失敗：' + error.message);
        }
    }

    // 下載備份
    async downloadBackup(backupId) {
        try {
            alert(`下載備份: ${backupId}（功能開發中...）`);
            // 實際應用中需要實現備份下載功能
        } catch (error) {
            console.error('下載備份失敗:', error);
            alert('下載備份失敗：' + error.message);
        }
    }

    // 刪除備份
    async deleteBackup(backupId) {
        try {
            if (confirm(`確定要刪除備份 ${backupId} 嗎？`)) {
                alert(`備份 ${backupId} 已刪除（功能開發中...）`);
                // 實際應用中需要實現備份刪除功能
            }
        } catch (error) {
            console.error('刪除備份失敗:', error);
            alert('刪除備份失敗：' + error.message);
        }
    }

    // 載入系統備份
    async loadSystemBackup() {
        return `
            <div class="page-header">
                <h2>備份管理</h2>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="pageManager.createSystemBackup()">
                        <i class="fas fa-plus"></i> 立即備份
                    </button>
                </div>
            </div>
            
            <div class="backup-info">
                <div class="info-card">
                    <h3>備份資訊</h3>
                    <div class="info-item">
                        <span class="info-label">最後備份：</span>
                        <span class="info-value">2024-01-15 03:00:00</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">備份大小：</span>
                        <span class="info-value">125.6 MB</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">備份狀態：</span>
                        <span class="info-value status-success">成功</span>
                    </div>
                </div>
                
                <div class="backup-schedule">
                    <h3>自動備份設定</h3>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="enableAutoBackup" checked>
                            啟用自動備份
                        </label>
                    </div>
                    <div class="form-group">
                        <label for="backupFrequency">備份頻率：</label>
                        <select id="backupFrequency">
                            <option value="daily">每日</option>
                            <option value="weekly">每週</option>
                            <option value="monthly">每月</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="backupTime">備份時間：</label>
                        <input type="time" id="backupTime" value="03:00">
                    </div>
                    <div class="form-group">
                        <label for="backupRetention">保留天數：</label>
                        <input type="number" id="backupRetention" value="30" min="7" max="365">
                    </div>
                </div>
            </div>
            
            <div class="backup-list">
                <h3>備份記錄</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>備份時間</th>
                            <th>備份類型</th>
                            <th>檔案大小</th>
                            <th>狀態</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="backupTableBody">
                        <tr>
                            <td>2024-01-15 03:00:00</td>
                            <td>自動備份</td>
                            <td>125.6 MB</td>
                            <td><span class="badge badge-success">成功</span></td>
                            <td>
                                <button class="btn btn-sm btn-info" onclick="pageManager.downloadBackup('backup_20240115_030000')">
                                    <i class="fas fa-download"></i> 下載
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="pageManager.deleteBackup('backup_20240115_030000')">
                                    <i class="fas fa-trash"></i> 刪除
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    // 儲存系統設定
    async saveSystemSettings() {
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
                if (key === 'sessionTimeout' || key === 'maxLoginAttempts' || key === 'passwordExpiry') {
                    settings[key] = parseInt(value) || 0;
                } else if (key === 'enableTwoFactor' || key === 'notifyLogin' || key === 'notifyFailedLogin' || key === 'notifyPasswordChange' || key === 'notifySystemError') {
                    settings[key] = formData.has(key);
                } else {
                    settings[key] = value;
                }
            }

            // 儲存到 Firestore
            await db.collection('systemSettings').doc('general').set(settings, { merge: true });
            
            alert('系統設定儲存成功！');
            
            // 記錄系統日誌
            await this.logSystemEvent('update', 'system_settings', '更新系統設定');
            
        } catch (error) {
            console.error('儲存系統設定失敗:', error);
            alert('儲存系統設定失敗：' + error.message);
        }
    }

    // 篩選系統日誌
    filterSystemLogs() {
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
    }

    // 匯出系統日誌
    async exportSystemLogs() {
        try {
            alert('系統日誌匯出功能開發中...');
            // 實際應用中需要實現 CSV 或 Excel 匯出功能
        } catch (error) {
            console.error('匯出系統日誌失敗:', error);
            alert('匯出系統日誌失敗：' + error.message);
        }
    }
}

// 創建全域頁面管理器實例
const pageManager = new PageManager();

// 匯出給全域使用
window.pageManager = pageManager;

// 確保頁面管理器在 DOM 載入後可用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('頁面管理器已初始化完成');
    });
} else {
    console.log('頁面管理器已初始化完成（DOM 已就緒）');
}
