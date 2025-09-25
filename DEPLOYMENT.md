# 西北勤務管理系統 - GitHub Pages 部署指南

## 概述

西北勤務管理系統是一個基於 Firebase 的現代化勤務管理系統，支持部署到 GitHub Pages 作為靜態網站。

## 前置要求

1. GitHub 帳號
2. Firebase 帳號和項目
3. 基本的 Git 知識

## 部署步驟

### 1. Fork 或 Clone 項目

```bash
git clone https://github.com/yourusername/nwcom-checkin.git
cd nwcom-checkin
```

### 2. 配置 Firebase

1. 登入 [Firebase Console](https://console.firebase.google.com/)
2. 創建新項目或選擇現有項目
3. 在項目設置中獲取 Firebase 配置
4. 更新 `firebase-config.js` 文件中的配置：

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. 配置 Firestore 安全規則

在 Firebase Console 中設置 Firestore 安全規則，或使用項目中的 `firestore.rules` 文件。

### 4. 啟用身份驗證

在 Firebase Console 中啟用電子郵件/密碼身份驗證。

### 5. 創建 GitHub 倉庫

1. 在 GitHub 上創建新倉庫
2. 將本地代碼推送到 GitHub：

```bash
git remote add origin https://github.com/yourusername/nwcom-checkin.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 6. 啟用 GitHub Pages

1. 進入倉庫的 Settings 頁面
2. 滾動到 Pages 部分
3. Source 選擇 "Deploy from a branch"
4. Branch 選擇 "main" 和 "/ (root)"
5. 點擊 Save

### 7. 配置 GitHub Actions

項目已經包含了 `.github/workflows/deploy.yml` 文件，會自動處理部署。

### 8. 訪問網站

部署完成後，可以通過以下網址訪問：
`https://yourusername.github.io/nwcom-checkin`

## 系統功能

### 核心模組

- **儀表板**: 系統概況和統計數據
- **個人資訊**: 員工個人資料管理
- **定位打卡**: GPS 定位和上下班打卡
- **勤務排班**: 排班管理和查看
- **請假排休**: 請假申請和審批流程
- **獎懲登錄**: 獎懲記錄管理
- **任務指派**: 任務分配和跟蹤
- **教育訓練**: 培訓課程管理
- **社區管理**: 社區信息和排班管理
- **帳號管理**: 用戶、角色和權限管理
- **系統管理**: 系統設定、日誌和備份

### 權限等級

- **系統管理員**: 完整系統訪問權限
- **主管**: 部門管理功能
- **一般員工**: 基本功能訪問

## 技術架構

### 前端技術
- HTML5 + CSS3 + JavaScript
- Font Awesome 圖標
- Vanta.js 背景動畫
- 響應式設計

### 後端服務
- Firebase Authentication
- Firestore 數據庫
- Firebase Storage
- Firebase Hosting (可選)

### 部署
- GitHub Pages 靜態託管
- GitHub Actions 自動部署

## 安全考量

1. **身份驗證**: 使用 Firebase Auth 進行安全認證
2. **數據安全**: Firestore 安全規則保護數據訪問
3. **輸入驗證**: 前端和後端雙重驗證
4. **HTTPS**: GitHub Pages 默認提供 HTTPS

## 維護和更新

### 更新代碼
```bash
git add .
git commit -m "Update features"
git push origin main
```

自動部署將在幾分鐘內完成。

### 監控
- 使用 Firebase Console 監控使用情況
- 查看系統日誌了解運行狀態

## 故障排除

### 常見問題

1. **部署失敗**: 檢查 GitHub Actions 日誌
2. **Firebase 連接問題**: 確認配置正確
3. **權限問題**: 檢查 Firestore 安全規則

### 支援

如需技術支援，請聯繫系統管理員或創建 GitHub Issue。

## 授權

本項目採用 MIT 授權協議。

---

**版本**: 1.0.0  
**最後更新**: 2024年  
**作者**: 西北保全團隊