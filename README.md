# 西北勤務管理系統

一個基於 GitHub Pages 和 Firebase 的低成本勤務管理系統，支援角色權限管理、定位打卡、勤務排班、數據分析等功能。

## 系統特色

- 🎯 **多角色權限管理**：系統管理員、高階主管、初階主管、勤務人員
- 📍 **GPS 定位打卡**：精確記錄打卡位置
- 📅 **智能排班系統**：自動化勤務排班管理
- 📊 **數據分析報表**：多維度數據分析與視覺化
- 🔒 **安全認證**：基於 Firebase 的身份驗證
- 📱 **響應式設計**：適配各種裝置尺寸
- 🌐 **免費託管**：使用 GitHub Pages 零成本部署

## 技術架構

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **後端服務**：Firebase (Authentication, Firestore, Storage)
- **地圖服務**：OpenStreetMap
- **圖表庫**：Chart.js
- **部署平台**：GitHub Pages
- **CI/CD**：GitHub Actions

## 快速開始

### 1. 前置準備

- GitHub 帳號
- Firebase 帳號（Google 帳號）
- 基本的 HTML/CSS/JavaScript 知識

### 2. Firebase 設定

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 創建新專案
3. 啟用以下服務：
   - Authentication（電子郵件/密碼登入）
   - Firestore Database
   - Storage（可選）
4. 在專案設定中取得 Firebase 配置資訊
5. 更新 `js/firebase-config.js` 中的配置

### 3. 本地開發

```bash
# 複製專案
git clone https://github.com/your-username/nwcom-checkin.git
cd nwcom-checkin

# 使用本地伺服器開發（需要 Python）
python -m http.server 8000
# 或使用 Node.js
npx http-server

# 開啟瀏覽器訪問 http://localhost:8000
```

### 4. 部署到 GitHub Pages

1. Fork 這個專案到你的 GitHub
2. 進入專案的 Settings > Pages
3. Source 選擇 "Deploy from a branch"
4. Branch 選擇 "main" 分支，資料夾選擇 "/ (root)"
5. 點擊 Save，GitHub Actions 會自動部署
6. 等待幾分鐘後，訪問提供的 GitHub Pages URL

### 5. 系統初始化

1. 使用預設管理員帳號登入：
   - 電子郵件：admin@example.com
   - 密碼：admin123
2. 進入「帳號設定」修改管理員資訊
3. 創建其他使用者帳號
4. 設定角色權限

## 檔案結構

```
nwcom-checkin/
├── index.html              # 主頁面
├── css/
│   └── style.css          # 樣式表
├── js/
│   ├── firebase-config.js # Firebase 配置
│   ├── auth.js           # 認證管理
│   ├── role-manager.js   # 角色權限
│   ├── app.js            # 主應用程式
│   ├── dashboard.js      # 儀表板
│   ├── checkin.js        # 打卡系統
│   ├── schedule.js       # 排班管理
│   ├── settings.js       # 帳號設定
│   └── analytics.js      # 數據分析
├── pages/                 # 其他頁面（可擴展）
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Actions 部署
└── README.md             # 說明文件
```

## 角色權限說明

| 角色 | 儀表板 | 打卡 | 排班 | 設定 | 分析 |
|------|--------|------|------|------|------|
| 系統管理員 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 高階主管 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 初階主管 | ✅ | ✅ | ✅ | ✅ | ❌ |
| 勤務人員 | ✅ | ✅ | ❌ | ✅ | ❌ |

## 主要功能

### 📊 儀表板
- 即時統計數據
- 系統狀態監控
- 異常提醒管理

### 📍 定位打卡
- GPS 位置獲取
- 打卡記錄管理
- 異常位置提醒

### 📅 勤務排班
- 週排班檢視
- 排班新增/編輯/刪除
- 班次管理

### 👤 帳號設定
- 個人資料管理
- 密碼變更
- 通知設定
- 資料匯出

### 📈 數據分析
- 打卡趨勢分析
- 使用者活動統計
- 工作時長分析
- 報表匯出

## 自定義設定

### Firebase 配置
編輯 `js/firebase-config.js`：

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

### 角色權限設定
編輯 `js/role-manager.js` 中的 `rolePermissions` 物件來自定義權限。

### 樣式自定義
編輯 `css/style.css` 來修改系統外觀和主題色彩。

## 常見問題

### Q: 如何重設忘記的密碼？
A: 在登入頁面點擊「忘記密碼」連結，系統會發送重設郵件到註冊信箱。

### Q: 打卡位置不準確怎麼辦？
A: 確保裝置開啟了 GPS 定位服務，並允許瀏覽器訪問位置資訊。

### Q: 如何新增使用者？
A: 管理員可以在「帳號設定」頁面創建新使用者，或使用者自行註冊後由管理員分配角色。

### Q: 系統支援離線使用嗎？
A: 目前版本需要網路連接才能正常使用所有功能。

## 技術支援

如有問題或建議，請在 GitHub Issues 中提出。

## 授權

MIT License - 詳見 LICENSE 檔案。

## 更新日誌

### v1.0.0 (2024-01-XX)
- 初始版本發布
- 基本功能完整實現
- GitHub Pages 部署支援