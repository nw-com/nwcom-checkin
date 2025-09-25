# 西北勤務管理系統

一個基於 Firebase 和 GitHub Pages 的低成本勤務管理系統，專為西北保全公司設計。

## 系統特色

- 🔒 **安全可靠** - 使用 Firebase 身份驗證和 Firestore 資料庫
- 📱 **響應式設計** - 完美支援電腦版和手機版
- 🎨 **現代化介面** - 紅色系主題搭配動畫效果
- 👥 **角色權限管理** - 支援多種使用者角色和權限控制
- 💰 **低成本** - 使用免費的 Firebase 和 GitHub Pages 服務

## 系統角色

1. **系統管理員** - 擁有所有功能的完整權限
2. **高階主管** - 管理社區、員工、任務和報表
3. **初階主管** - 管理基本勤務和任務指派
4. **勤務人員** - 查看個人資訊、打卡、請假等基本功能

## 主要功能

### 📊 儀表板
- 目前班表顯示
- 任務訊息通知
- 個人績效統計
- 上班狀態追蹤

### 👤 個人資訊
- 基本資料管理
- 帳號密碼修改
- 登入系統紀錄
- 個人設定

### 📍 定位打卡
- GPS定位打卡
- 打卡紀錄查詢
- 異常打卡提醒

### 📅 勤務排班
- 人員排班管理
- 社區排班規劃
- 表單列印功能

### 🛏️ 請假排休
- 線上請假申請
- 請假紀錄查詢
- 假別餘額管理

### 🏆 獎懲登錄
- 獎懲紀錄新增
- 歷史紀錄查詢
- 統計報表產生

### 📋 任務指派
- 任務建立與指派
- 任務進度追蹤
- 任務完成回報

### 🏢 社區管理
- 社區資料維護
- 社區列表管理
- 聯絡資訊管理

### 👥 帳號管理
- 員工資料新增
- 員工列表管理
- 系統登入紀錄

### ⚙️ 系統管理
- 社區設定
- 員工設定
- 獎懲設定

## 技術架構

### 前端技術
- HTML5 + CSS3 + JavaScript
- 響應式設計 (Bootstrap概念)
- Three.js 動畫效果
- Font Awesome 圖示

### 後端技術
- Firebase Authentication (身份驗證)
- Firebase Firestore (資料庫)
- Firebase Storage (檔案儲存)
- Firebase Hosting (網站託管)

### 部署平台
- GitHub Pages (免費靜態網站託管)
- Firebase (後端服務)

## 快速開始

### 1. 前置需求
- GitHub 帳號
- Firebase 帳號
- 基本的網頁開發知識

### 2. Firebase 設定

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 建立新的 Firebase 專案
3. 啟用以下服務：
   - Authentication (身份驗證)
   - Firestore Database (資料庫)
   - Storage (儲存空間)

4. 在專案設定中取得 Firebase 設定資訊
5. 更新 `firebase-config.js` 檔案中的設定值

### 3. 部署到 GitHub Pages

#### 方法一：使用 GitHub Actions（推薦）

1. Fork 這個專案到你的 GitHub 帳號
2. 進入專案的 Settings > Pages
3. Source 選擇 "GitHub Actions"
4. 推送代碼到 main 分支，系統會自動部署

#### 方法二：手動部署

1. Fork 這個專案到你的 GitHub 帳號
2. 在專案設定中啟用 GitHub Pages
3. Source 選擇 "Deploy from a branch"
4. Branch 選擇 "main" 和 "/ (root)"
5. 點擊 Save

詳細部署說明請參考 [DEPLOYMENT.md](DEPLOYMENT.md) 文件。

### 4. Firebase CLI 部署（選擇性）

```bash
# 安裝 Firebase CLI
npm install -g firebase-tools

# 登入 Firebase
firebase login

# 初始化專案
firebase init

# 部署到 Firebase Hosting
firebase deploy
```

## 檔案結構

```
nwcom-checkin/
├── index.html              # 主要 HTML 檔案
├── styles.css              # 樣式表
├── firebase-config.js      # Firebase 設定
├── auth.js                 # 身份驗證邏輯
├── pages.js                # 頁面管理
├── app.js                  # 主要應用程式邏輯
├── firebase.json           # Firebase 部署設定
├── firestore.rules         # Firestore 安全規則
├── firestore.indexes.json  # Firestore 索引設定
├── storage.rules           # Storage 安全規則
└── README.md               # 說明文件
```

## 安全考量

- 所有資料存取都經過 Firebase 安全規則驗證
- 使用者密碼使用 Firebase Authentication 加密儲存
- 實作角色權限控制，確保資料安全
- 定期更新安全規則和依賴套件

## 效能優化

- 使用 Firebase 離線持久性功能
- 實作懶載入和快取機制
- 優化圖片和資源載入
- 使用 CDN 加速靜態資源

## 瀏覽器支援

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- 手機瀏覽器 (iOS Safari, Chrome Mobile)

## 常見問題

### Q: 如何新增管理員帳號？
A: 系統會自動建立預設管理員帳號，員工編號為 ADMIN001，密碼請聯絡系統管理員。

### Q: 忘記密碼怎麼辦？
A: 請聯絡系統管理員重設密碼。

### Q: 支援離線使用嗎？
A: 部分功能支援離線使用，打卡和基本資料查看在離線時仍可操作，會在連線後自動同步。

### Q: 如何備份資料？
A: Firebase 會自動備份資料，也可以透過 Firebase Console 匯出資料。

## 聯絡支援

如有任何問題或建議，請透過以下方式聯絡：

- Email: support@nwcom.com
- 電話: 02-12345678
- 問題回報: [GitHub Issues](https://github.com/your-repo/issues)

## 授權

本專案採用 MIT 授權條款，詳細內容請參閱 LICENSE 檔案。

## 更新日誌

### v1.0.0 (2024-01-01)
- 初始版本發布
- 基本功能完整實作
- 支援多角色權限管理
- 響應式設計完成

---

**西北勤務管理系統** - 讓勤務管理更簡單、更有效率！