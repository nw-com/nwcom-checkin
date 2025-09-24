# 🚀 西北勤務管理系統 - 快速部署指南

## 📋 部署前準備

### 必要條件
- ✅ Git 已安裝
- ✅ GitHub 帳號
- ✅ Firebase 帳號

### 可選但建議
- 📝 Python（用於本地測試）
- 📝 Node.js（備用本地測試）

---

## 🎯 三步驟快速部署

### 步驟 1：一鍵部署到 GitHub Pages

**方法一：自動腳本**（推薦）
```bash
double-click deploy.bat
```

**方法二：手動操作**
```bash
git add .
git commit -m "西北勤務管理系統完整版"
git push origin main
```

### 步驟 2：配置 Firebase

1. **開啟 Firebase 設定助手**
   - 雙擊開啟 `firebase-setup.html`
   - 或直接訪問：file:///path/to/your/project/firebase-setup.html

2. **跟隨指引完成設定**
   - 創建 Firebase 專案
   - 啟用 Authentication
   - 啟用 Firestore Database
   - 獲取配置代碼
   - 貼到 `js/firebase-config.js`

### 步驟 3：啟用 GitHub Pages

1. **登入 GitHub**
2. **進入您的倉庫**
3. **點擊 Settings → Pages**
4. **設定部署來源**
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)
5. **點擊 Save**

---

## 🎉 部署成功！

### 系統網址
```
https://[您的用戶名].github.io/[倉庫名稱]/
```

### 預設測試帳號
```
管理員：
- 帳號：admin@nwcom.com
- 密碼：admin123

員工：
- 帳號：user@nwcom.com  
- 密碼：user123
```

---

## 🔧 常見問題

### Q1: GitHub Pages 顯示 404
**解決方案：**
- 確認倉庫是 Public
- 等待 5-10 分鐘
- 檢查 GitHub Pages 設定

### Q2: Firebase 連接失敗
**解決方案：**
- 檢查 `js/firebase-config.js` 配置
- 確認 Firestore 規則已設置
- 檢查網路連接

### Q3: 本地測試失敗
**解決方案：**
- 使用 `test.html` 測試
- 執行 `start-server.bat`
- 或直接使用 `index.html`

---

## 📞 技術支援

### 快速檢查清單
- [ ] GitHub Pages 已啟用
- [ ] Firebase 專案已創建
- [ ] Authentication 已啟用
- [ ] Firestore 已啟用
- [ ] 配置檔案已更新
- [ ] 資料庫規則已設置

### 需要幫助？
1. 查看 `README.md` 完整文檔
2. 使用 `test.html` 診斷問題
3. 檢查瀏覽器開發者工具 (F12)

---

## 🌟 系統特色

✅ **零成本部署** - 完全免費託管  
✅ **即時上線** - 3分鐘完成部署  
✅ **專業功能** - 完整勤務管理系統  
✅ **響應設計** - 支援手機/平板  
✅ **安全可靠** - Firebase 認證  
✅ **易於維護** - 自動化部署  

---

**🎊 恭喜！您的西北勤務管理系統已經準備就緒！**

**下一步：**
- 使用預設帳號登入測試
- 創建您的組織和員工帳號
- 開始使用 GPS 打卡功能
- 探索數據分析報表

**享受您的專業勤務管理系統！** 🚀