// 角色權限管理系統
class RoleManager {
    constructor() {
        this.permissions = {
            'admin': {
                name: '系統管理員',
                permissions: {
                    dashboard: ['view', 'edit', 'delete'],
                    checkin: ['view', 'edit', 'delete'],
                    schedule: ['view', 'edit', 'delete'],
                    settings: ['view', 'edit', 'delete'],
                    analytics: ['view', 'edit', 'delete'],
                    userManagement: ['view', 'edit', 'delete'],
                    roleManagement: ['view', 'edit', 'delete']
                }
            },
            'manager': {
                name: '高階主管',
                permissions: {
                    dashboard: ['view'],
                    checkin: ['view'],
                    schedule: ['view', 'edit'],
                    settings: ['view', 'edit'],
                    analytics: ['view'],
                    userManagement: ['view'],
                    roleManagement: []
                }
            },
            'supervisor': {
                name: '初階主管',
                permissions: {
                    dashboard: ['view'],
                    checkin: ['view', 'edit'],
                    schedule: ['view', 'edit'],
                    settings: ['view', 'edit'],
                    analytics: ['view'],
                    userManagement: [],
                    roleManagement: []
                }
            },
            'staff': {
                name: '勤務人員',
                permissions: {
                    dashboard: ['view'],
                    checkin: ['view', 'edit'],
                    schedule: ['view'],
                    settings: ['view', 'edit'],
                    analytics: [],
                    userManagement: [],
                    roleManagement: []
                }
            }
        };
    }

    // 檢查使用者是否有特定權限
    hasPermission(userRole, module, action) {
        if (!userRole || !module || !action) {
            return false;
        }

        const rolePermissions = this.permissions[userRole];
        if (!rolePermissions) {
            return false;
        }

        const modulePermissions = rolePermissions.permissions[module];
        if (!modulePermissions) {
            return false;
        }

        return modulePermissions.includes(action);
    }

    // 取得使用者的所有權限
    getUserPermissions(userRole) {
        if (!userRole) {
            return {};
        }

        const rolePermissions = this.permissions[userRole];
        return rolePermissions ? rolePermissions.permissions : {};
    }

    // 取得角色名稱
    getRoleName(userRole) {
        const role = this.permissions[userRole];
        return role ? role.name : userRole;
    }

    // 取得所有角色
    getAllRoles() {
        return Object.keys(this.permissions);
    }

    // 取得角色列表（用於下拉選單）
    getRoleOptions() {
        return Object.entries(this.permissions).map(([key, role]) => ({
            value: key,
            label: role.name
        }));
    }

    // 根據權限更新介面
    updateUIBasedOnRole(userRole) {
        if (!userRole) return;

        const userPermissions = this.getUserPermissions(userRole);

        // 檢查各模組的檢視權限
        Object.keys(userPermissions).forEach(module => {
            const moduleElement = document.querySelector(`[data-page="${module}"]`);
            if (moduleElement) {
                if (userPermissions[module].includes('view')) {
                    moduleElement.style.display = 'flex';
                } else {
                    moduleElement.style.display = 'none';
                }
            }
        });

        // 特殊處理：數據分析只有主管以上才能看到
        if (!this.hasPermission(userRole, 'analytics', 'view')) {
            const analyticsElement = document.querySelector('[data-page="analytics"]');
            if (analyticsElement) {
                analyticsElement.style.display = 'none';
            }
        }

        // 特殊處理：勤務排班只有主管以上才能編輯
        if (!this.hasPermission(userRole, 'schedule', 'edit')) {
            // 隱藏排班編輯功能
            const scheduleEditElements = document.querySelectorAll('.schedule-edit');
            scheduleEditElements.forEach(element => {
                element.style.display = 'none';
            });
        }
    }

    // 檢查是否可以編輯使用者角色
    canEditRole(currentUserRole, targetUserRole) {
        if (!currentUserRole || !targetUserRole) {
            return false;
        }

        // 只有系統管理員可以編輯所有角色
        if (currentUserRole === 'admin') {
            return true;
        }

        // 高階主管只能編輯初階主管和勤務人員
        if (currentUserRole === 'manager') {
            return targetUserRole === 'supervisor' || targetUserRole === 'staff';
        }

        // 初階主管只能編輯勤務人員
        if (currentUserRole === 'supervisor') {
            return targetUserRole === 'staff';
        }

        // 勤務人員不能編輯任何人的角色
        return false;
    }

    // 取得可以編輯的角色選項
    getEditableRoles(currentUserRole) {
        const allRoles = this.getRoleOptions();
        
        if (currentUserRole === 'admin') {
            return allRoles;
        }
        
        if (currentUserRole === 'manager') {
            return allRoles.filter(role => role.value === 'supervisor' || role.value === 'staff');
        }
        
        if (currentUserRole === 'supervisor') {
            return allRoles.filter(role => role.value === 'staff');
        }
        
        return [];
    }
}

// 初始化角色管理器
window.roleManager = new RoleManager();