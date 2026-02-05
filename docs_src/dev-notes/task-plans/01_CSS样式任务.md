# Task 1: CSS 样式迁移与适配

## 📋 任务概述

| 项目 | 内容 |
|------|------|
| **任务编号** | Task 1 |
| **任务名称** | CSS 样式迁移与适配 |
| **负责人** | 待分配 |
| **预计工时** | 4-6 小时 |
| **依赖任务** | 无 |
| **输出产物** | theme/leaderboard.css |

---

## 🎯 任务目标

将参考项目 /home/shuhao/sagellm-website/assets/leaderboard.css 中的样式迁移到 SAGE-Pub 项目，并进行必要的适配，确保：

1. 避免与现有样式冲突
2. 保持响应式布局
3. 适配 SAGE-Pub 主题风格

---

## 📝 详细步骤

### Step 1: 分析原始样式文件

1. 阅读 /home/shuhao/sagellm-website/assets/leaderboard.css
2. 记录所有使用的类名
3. 识别可能与 SAGE-Pub 冲突的类名（特别是 .tab-button, .tab-content 等）

### Step 2: 创建新样式文件

在 theme/leaderboard.css 创建新文件，参考结构如下：

```css
/* ============================================
   SAGE Leaderboard Styles
   前缀: lb- (leaderboard)
   避免与现有 .tab-button 等类名冲突
   ============================================ */

/* 1. Leaderboard Section Container */
.leaderboard-section {
    padding: 6rem 0;
    background: linear-gradient(180deg, #0c101a 0%, #1a1f2e 100%);
}

/* 2. Tab Navigation - 使用 lb- 前缀 */
.lb-tab-nav {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
}

.lb-tab-button {
    padding: 0.75rem 1.5rem;
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    background: rgba(30, 41, 59, 0.6);
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.3s ease;
}

.lb-tab-button.active {
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    border-color: transparent;
    color: #ffffff;
}

/* 3. Tab Content */
.lb-tab-content {
    display: none;
}

.lb-tab-content.active {
    display: block;
}

/* 4. Filters */
.lb-filter-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    justify-content: center;
}

.lb-filter-select {
    padding: 0.5rem 1rem;
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 6px;
    background: rgba(30, 41, 59, 0.8);
    color: #ffffff;
}

/* 5. Table Styles */
.lb-table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: 12px;
    border: 1px solid rgba(59, 130, 246, 0.2);
}

.lb-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 800px;
}

.lb-table th, .lb-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

/* 6. States */
.lb-loading, .lb-empty, .lb-error {
    text-align: center;
    padding: 3rem;
    color: #94a3b8;
}

.lb-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(59, 130, 246, 0.2);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: lb-spin 1s linear infinite;
}

@keyframes lb-spin {
    to { transform: rotate(360deg); }
}

/* 7. Trends */
.lb-trend-up { color: #10b981; }
.lb-trend-down { color: #ef4444; }
.lb-trend-stable { color: #94a3b8; }

/* 8. Rank Badge */
.lb-rank-1 { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000; }
.lb-rank-2 { background: linear-gradient(135deg, #9ca3af, #6b7280); color: #fff; }
.lb-rank-3 { background: linear-gradient(135deg, #d97706, #b45309); color: #fff; }

/* 9. Responsive */
@media (max-width: 768px) {
    .lb-tab-nav { gap: 0.5rem; }
    .lb-tab-button { padding: 0.5rem 1rem; font-size: 0.85rem; }
}

@media (max-width: 320px) {
    .lb-table-container {
        margin: 0 -10px;
        border-radius: 0;
    }
}
```

### Step 3: 类名替换映射表

| 原始类名 | 新类名 | 说明 |
|---------|--------|------|
| .tab-button | .lb-tab-button | Tab 按钮 |
| .tab-nav | .lb-tab-nav | Tab 导航栏 |
| .tab-content | .lb-tab-content | Tab 内容区 |
| .filter-group | .lb-filter-group | 筛选组 |
| .filter-select | .lb-filter-select | 筛选下拉框 |
| .data-table | .lb-table | 数据表格 |
| .loading-state | .lb-loading | 加载状态 |
| .empty-state | .lb-empty | 空状态 |
| .error-state | .lb-error | 错误状态 |

### Step 4: 主题风格适配

参考 SAGE-Pub 现有颜色：

| 用途 | 颜色值 |
|-----|--------|
| 主色调 | #3b82f6 (蓝色) |
| 次要色 | #10b981 (绿色) |
| 强调色 | #8b5cf6 (紫色) |
| 背景深色 | #0c101a |
| 文字主色 | #ffffff |
| 文字次色 | #94a3b8 |

---

## ✅ 完成检查清单

- [ ] 样式文件 theme/leaderboard.css 已创建
- [ ] 所有类名已添加 lb- 前缀
- [ ] 与现有 .tab-button 无冲突
- [ ] 颜色风格与 SAGE-Pub 主题一致
- [ ] 响应式布局在 320px 宽度下表格可横向滚动
- [ ] Loading/Empty/Error 状态样式完整
- [ ] 趋势指示器样式完整

---

## 📎 参考资源

- 源样式文件: /home/shuhao/sagellm-website/assets/leaderboard.css
- SAGE-Pub 现有样式: theme/styles.css, theme/sections.css

---

## 🔄 交付给 Task 4

完成后需向 Task 4 负责人提供：
1. theme/leaderboard.css 文件
2. 类名映射表

---

## 📝 任务状态

- [ ] 未开始
- [ ] 进行中
- [ ] 已完成
- [ ] 已验收

**更新时间**: ___________
