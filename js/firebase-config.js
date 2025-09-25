// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyCTEQRZYcpzRDJJUPi88DxFmfLZQRBCLTw",
  authDomain: "nwcom-checkin.firebaseapp.com",
  projectId: "nwcom-checkin",
  storageBucket: "nwcom-checkin.firebasestorage.app",
  messagingSenderId: "121673680169",
  appId: "1:121673680169:web:a1ba8d244432053c48a338",
  measurementId: "G-6LDQZJ2MFM"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 取得服務實例
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// 啟用離線持久性
db.enablePersistence()
    .catch((err) => {
        console.error("離線持久性啟用失敗:", err);
    });

// 使用者角色定義
const USER_ROLES = {
    ADMIN: '系統管理員',
    SENIOR_MANAGER: '高階主管',
    JUNIOR_MANAGER: '初階主管',
    STAFF: '勤務人員'
};

// 權限設定
const PERMISSIONS = {
    [USER_ROLES.ADMIN]: [
        'dashboard', 'personal', 'checkin', 'schedule', 'leave', 
        'reward', 'task', 'training', 'community', 'account', 'system'
    ],
    [USER_ROLES.SENIOR_MANAGER]: [
        'dashboard', 'personal', 'checkin', 'schedule', 'leave', 
        'reward', 'task', 'training', 'community'
    ],
    [USER_ROLES.JUNIOR_MANAGER]: [
        'dashboard', 'personal', 'checkin', 'schedule', 'leave', 
        'task', 'training'
    ],
    [USER_ROLES.STAFF]: [
        'dashboard', 'personal', 'checkin', 'leave', 'training'
    ]
};

// 頁面結構定義
const PAGE_STRUCTURE = {
    dashboard: {
        title: '儀表板',
        subPages: []
    },
    personal: {
        title: '個人資訊',
        subPages: ['基本資料', '帳號密碼', '登入紀錄']
    },
    checkin: {
        title: '定位打卡',
        subPages: ['打卡頁面', '打卡紀錄']
    },
    schedule: {
        title: '勤務排班',
        subPages: ['人員排班', '社區排班', '表單印製']
    },
    leave: {
        title: '請假排休',
        subPages: ['請假頁面', '請假紀錄']
    },
    reward: {
        title: '獎懲登錄',
        subPages: ['新增獎懲', '獎懲紀錄']
    },
    task: {
        title: '任務指派',
        subPages: ['新增任務', '任務紀錄']
    },
    training: {
        title: '教育訓練',
        subPages: ['保全', '物業']
    },
    community: {
        title: '社區管理',
        subPages: ['新增社區', '社區列表']
    },
    account: {
        title: '帳號管理',
        subPages: ['新增員工', '員工列表', '登入紀錄']
    },
    system: {
        title: '系統管理',
        subPages: ['社區設定', '員工設定', '獎懲設定']
    }
};

// 預設資料
const DEFAULT_DATA = {
    // 預設管理員帳號
    adminUser: {
        employeeId: 'ADMIN001',
        name: '系統管理員',
        email: 'admin@nwcom.com',
        role: USER_ROLES.ADMIN,
        department: '資訊部',
        phone: '02-12345678',
        status: 'active',
        createdAt: new Date()
    },
    // 新的測試管理員帳號
    testAdmin: {
        employeeId: 'ADMIN002',
        name: '測試管理員',
        email: 'testadmin@nwcom.com',
        role: USER_ROLES.ADMIN,
        department: '資訊部',
        phone: '02-12345678',
        status: 'active',
        createdAt: new Date()
    },
    // 預設社區資料
    defaultCommunities: [
        {
            id: 'community_001',
            name: '西北社區A棟',
            address: '台北市中山區西北路1號',
            manager: 'ADMIN001',
            phone: '02-12345678',
            email: 'community_a@nwcom.com',
            status: 'active',
            createdAt: new Date()
        },
        {
            id: 'community_002',
            name: '西北社區B棟',
            address: '台北市中山區西北路2號',
            manager: 'ADMIN001',
            phone: '02-12345679',
            email: 'community_b@nwcom.com',
            status: 'active',
            createdAt: new Date()
        }
    ]
};

// 工具函數
const firebaseUtils = {
    // 格式化時間戳
    formatTimestamp: (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleString('zh-TW');
    },
    
    // 生成唯一ID
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // 驗證電子郵件格式
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // 獲取使用者角色中文名稱
    getRoleDisplayName: (role) => {
        return USER_ROLES[role] || role;
    },
    
    // 檢查使用者權限
    checkPermission: (userRole, page) => {
        const allowedPages = PERMISSIONS[userRole] || [];
        return allowedPages.includes(page);
    }
};

// 初始化預設資料（僅在第一次使用時）
async function initializeDefaultData() {
    try {
        // 檢查是否已有管理員帳號
        const adminQuery = await db.collection('users')
            .where('role', '==', USER_ROLES.ADMIN)
            .limit(1)
            .get();
        
        if (adminQuery.empty) {
            // 創建預設管理員帳號
            const adminData = {
                ...DEFAULT_DATA.adminUser,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('users').doc(DEFAULT_DATA.adminUser.employeeId).set(adminData);
            console.log('預設管理員帳號已創建');
        }
        
        // 創建測試管理員帳號（如果不存在）
        const testAdminDoc = await db.collection('users').doc('ADMIN002').get();
        if (!testAdminDoc.exists) {
            const testAdminData = {
                ...DEFAULT_DATA.testAdmin,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('users').doc('ADMIN002').set(testAdminData);
            console.log('測試管理員帳號已創建');
            
            // 創建 Firebase 認證帳號
            try {
                await auth.createUserWithEmailAndPassword('testadmin@nwcom.com', 'TestAdmin123!');
                console.log('測試管理員 Firebase 帳號已創建');
            } catch (authError) {
                console.log('Firebase 帳號可能已存在或創建失敗:', authError.message);
            }
        }
        
        // 檢查是否已有社區資料
        const communityQuery = await db.collection('communities').limit(1).get();
        
        if (communityQuery.empty) {
            // 創建預設社區資料
            for (const community of DEFAULT_DATA.defaultCommunities) {
                const communityData = {
                    ...community,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                await db.collection('communities').doc(community.id).set(communityData);
            }
            console.log('預設社區資料已創建');
        }
    } catch (error) {
        console.error('初始化預設資料失敗:', error);
    }
}

// 快速重設管理員密碼的函數
async function resetAdminPassword(employeeId, newPassword) {
    try {
        console.log(`正在重設 ${employeeId} 的密碼...`);
        
        // 獲取使用者資料
        const userDoc = await db.collection('users').doc(employeeId).get();
        if (!userDoc.exists) {
            console.error(`使用者 ${employeeId} 不存在`);
            return false;
        }
        
        const userData = userDoc.data();
        const email = userData.email;
        
        // 更新 Firebase 認證密碼
        try {
            // 先嘗試登入現有帳號來獲取使用者
            await auth.signInWithEmailAndPassword(email, 'temporary123');
            const currentUser = auth.currentUser;
            await currentUser.updatePassword(newPassword);
            console.log(`密碼重設成功: ${employeeId}`);
            return true;
        } catch (loginError) {
            // 如果登入失敗，可能是密碼錯誤或帳號不存在
            console.log(`無法登入現有帳號，可能需要手動在 Firebase 主控台重設: ${loginError.message}`);
            
            // 創建新帳號（如果不存在）
            try {
                await auth.createUserWithEmailAndPassword(email, newPassword);
                console.log(`已創建新的 Firebase 帳號: ${email}`);
                return true;
            } catch (createError) {
                console.error(`創建 Firebase 帳號失敗: ${createError.message}`);
                return false;
            }
        }
    } catch (error) {
        console.error(`重設密碼失敗: ${error.message}`);
        return false;
    }
}

// 監聽認證狀態變化
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // 使用者已登入
        console.log('使用者已登入:', user.email);
        
        // 初始化預設資料
        await initializeDefaultData();
        
        // 獲取使用者資料
        const userDoc = await db.collection('users').doc(user.email.split('@')[0]).get();
        if (userDoc.exists) {
            window.currentUser = userDoc.data();
            console.log('當前使用者資料:', window.currentUser);
        }
    } else {
        // 使用者已登出
        console.log('使用者已登出');
        window.currentUser = null;
    }
});

// 匯出給全域使用
window.firebaseUtils = firebaseUtils;
window.USER_ROLES = USER_ROLES;
window.PERMISSIONS = PERMISSIONS;
window.PAGE_STRUCTURE = PAGE_STRUCTURE;