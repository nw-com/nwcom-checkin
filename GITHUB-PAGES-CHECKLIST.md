# 🌐 GitHub Pages 快速設定檢查表

## 📋 5步驟完成設定

### ✅ 步驟1：推送代碼
```batch
雙擊執行：quick-deploy.bat
```

### ✅ 步驟2：進入GitHub設定
1. 登入 [GitHub.com](https://github.com)
2. 進入您的倉庫
3. 點擊 **Settings**

### ✅ 步驟3：找到Pages設定
在左側選單點擊 **Pages**

### ✅ 步驟4：設定部署來源
```
Source: Deploy from a branch
Branch: main (或 master)
Folder: / (root)
```

### ✅ 步驟5：保存並等待
點擊 **Save**，等待2-5分鐘

---

## 🎯 成功指標
- ✅ 看到 "Your site is ready to be published"
- ✅ 獲得網址：`https://[用戶名].github.io/[倉庫]/`
- ✅ 能正常訪問您的系統

---

## ⚠️ 常見問題

| 問題 | 解決方案 |
|------|----------|
| 404錯誤 | 確認倉庫是Public，等待10分鐘 |
| 找不到Pages | 確認倉庫所有權和權限 |
| 部署失敗 | 檢查分支名稱(main vs master) |

---

## 🚀 下一步
1. **設定Firebase** → 開啟 `firebase-setup.html`
2. **測試系統** → 使用預設帳號登入
3. **創建組織** → 添加部門和員工

**🎉 3分鐘內完成部署！**