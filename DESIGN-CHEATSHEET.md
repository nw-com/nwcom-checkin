# 🎨 手動設計頁面風格 - 快速參考

## 1. 顏色設計 (Colors)

### 基本顏色代碼
```css
/* 主色調 */
--primary: #667eea;
--secondary: #764ba2;

/* 功能色 */
--success: #28a745;
--warning: #ffc107;
--danger: #dc3545;
--info: #17a2b8;

/* 中性色 */
--dark: #2c3e50;
--gray: #7f8c8d;
--light: #ecf0f1;
--white: #ffffff;
```

### 漸變效果
```css
.gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}
```

## 2. 字體設計 (Typography)

### 字體大小系統
```css
/* 標題 */
h1 { font-size: 32px; font-weight: 700; }
h2 { font-size: 24px; font-weight: 600; }
h3 { font-size: 20px; font-weight: 600; }

/* 正文 */
body { font-size: 16px; font-weight: 400; }
.small { font-size: 14px; }
.tiny { font-size: 12px; }
```

### 字體顏色
```css
.text-primary { color: #667eea; }
.text-success { color: #28a745; }
.text-warning { color: #ffc107; }
.text-danger { color: #dc3545; }
.text-muted { color: #7f8c8d; }
```

## 3. 間距系統 (Spacing)

### 標準間距
```css
.space-xs { padding: 4px; }
.space-sm { padding: 8px; }
.space-md { padding: 16px; }
.space-lg { padding: 24px; }
.space-xl { padding: 32px; }
```

### 邊距系統
```css
.margin-xs { margin: 4px; }
.margin-sm { margin: 8px; }
.margin-md { margin: 16px; }
.margin-lg { margin: 24px; }
.margin-xl { margin: 32px; }
```

## 4. 按鈕設計 (Buttons)

### 基本按鈕樣式
```css
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  font-weight: 500;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}
```

### 不同類型按鈕
```css
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.btn-warning {
  background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
  color: white;
}
```

## 5. 表單設計 (Forms)

### 表單控件樣式
```css
.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
```

### 表單標籤
```css
.form-label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
}
```

## 6. 卡片設計 (Cards)

### 基本卡片樣式
```css
.card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}
```

## 7. 動畫效果 (Animations)

### 過渡效果
```css
.transition-all {
  transition: all 0.3s ease;
}

.transition-transform {
  transition: transform 0.3s ease;
}

.transition-shadow {
  transition: box-shadow 0.3s ease;
}
```

### 懸停效果
```css
.hover-lift:hover {
  transform: translateY(-5px);
}

.hover-shadow:hover {
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.hover-scale:hover {
  transform: scale(1.05);
}
```

## 8. 響應式設計 (Responsive)

### 常用斷點
```css
/* 手機 */
@media (max-width: 576px) {
  /* 手機樣式 */
}

/* 平板 */
@media (max-width: 768px) {
  /* 平板樣式 */
}

/* 桌面 */
@media (min-width: 769px) {
  /* 桌面樣式 */
}
```

## 9. 實用工具類 (Utility Classes)

### 文本對齊
```css
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }
```

### 邊框圓角
```css
.rounded-sm { border-radius: 4px; }
.rounded-md { border-radius: 8px; }
.rounded-lg { border-radius: 16px; }
.rounded-xl { border-radius: 20px; }
```

### 陰影效果
```css
.shadow-sm { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.shadow-md { box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
.shadow-lg { box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
```

## 10. 快速開始模板

### 現代化卡片模板
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">卡片標題</h3>
  </div>
  <div class="card-content">
    <p>卡片內容文字</p>
    <button class="btn btn-primary">操作按鈕</button>
  </div>
</div>
```

### 現代化表單模板
```html
<form>
  <div class="form-group">
    <label class="form-label">電子郵件</label>
    <input type="email" class="form-control" placeholder="請輸入電子郵件">
  </div>
  <div class="form-group">
    <label class="form-label">密碼</label>
    <input type="password" class="form-control" placeholder="請輸入密碼">
  </div>
  <button type="submit" class="btn btn-primary" style="width: 100%;">登入</button>
</form>
```

## 11. 設計原則

### 基本原則
1. **一致性**：保持顏色、字體、間距的一致性
2. **對比度**：確保文字有足夠的對比度
3. **留白**：適當的留白讓設計更清爽
4. **層次**：通過大小、顏色、間距建立視覺層次
5. **響應式**：確保在不同設備上都能正常顯示

### 顏色搭配建議
- 主色調：用於主要元素和品牌識別
- 輔助色：用於次要操作和狀態提示
- 中性色：用於背景和邊框
- 功能色：用於成功、警告、錯誤等狀態

### 字體選擇建議
- 標題：使用較大字體和粗體字重
- 正文：使用標準字體大小和常規字重
- 輔助文字：使用較小字體和灰色
- 保持字體數量最少（通常1-2種）

## 12. 實踐建議

### 開始步驟
1. 確定主色調和輔助色
2. 建立字體大小層次
3. 設計標準間距系統
4. 創建按鈕和表單樣式
5. 添加動畫和過渡效果
6. 實現響應式設計

### 測試建議
- 在不同設備上測試
- 檢查顏色對比度
- 驗證動畫性能
- 確保無障礙訪問

---

## 🚀 下一步行動

1. **查看實際應用**：打開 `index.html` 查看這些設計原則的實際應用
2. **修改現有頁面**：使用這些樣式來美化您的頁面
3. **創建新頁面**：使用提供的模板快速創建新頁面
4. **實驗和創新**：基於這些原則創建您自己的設計風格

記住：**好的設計是簡單、一致且用戶友好的！** 🎨✨