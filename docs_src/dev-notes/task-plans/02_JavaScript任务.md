# Task 2: JavaScript 逻辑开发

## 📋 任务概述

| 项目 | 内容 |
|------|------|
| **任务编号** | Task 2 |
| **任务名称** | JavaScript 逻辑开发 |
| **负责人** | 待分配 |
| **预计工时** | 6-8 小时 |
| **依赖任务** | 无 |
| **输出产物** | theme/assets/leaderboard.js, theme/assets/hf-data-loader.js |

---

## 🎯 任务目标

开发 Leaderboard 的交互逻辑，包括：

1. Tab 切换功能
2. 筛选器功能
3. 数据加载与渲染
4. 表格排序
5. 详情展开/收起
6. 状态管理（Loading/Empty/Error）

---

## 📝 详细步骤

### Step 1: 创建数据加载器 hf-data-loader.js

文件路径: theme/assets/hf-data-loader.js

```javascript
/**
 * SAGE Leaderboard Data Loader
 * 负责从本地 JSON 文件加载排行榜数据
 */

class LeaderboardDataLoader {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || '/data';
        this.cache = new Map();
    }

    async loadSingleGPU() {
        return this._loadData('leaderboard_single.json');
    }

    async loadMultiGPU() {
        return this._loadData('leaderboard_multi.json');
    }

    async loadDistributed() {
        return this._loadData('leaderboard_distributed.json');
    }

    async _loadData(filename) {
        const url = this.baseUrl + '/' + filename;
        
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('HTTP error! status: ' + response.status);
            }
            const data = await response.json();
            this.cache.set(url, data);
            return data;
        } catch (error) {
            console.error('Failed to load ' + filename + ':', error);
            throw error;
        }
    }

    clearCache() {
        this.cache.clear();
    }
}

window.LeaderboardDataLoader = LeaderboardDataLoader;
```

### Step 2: 创建主逻辑文件 leaderboard.js

文件路径: theme/assets/leaderboard.js

```javascript
/**
 * SAGE Leaderboard Main Logic
 * 注意: 所有选择器使用 lb- 前缀，避免与现有 tab 冲突
 */

(function() {
    'use strict';

    const CONFIG = {
        selectors: {
            section: '.leaderboard-section',
            tabButton: '.lb-tab-button',
            tabContent: '.lb-tab-content',
            filterSelect: '.lb-filter-select',
            tableContainer: '.lb-table-container',
            loading: '.lb-loading',
            empty: '.lb-empty',
            error: '.lb-error'
        },
        activeClass: 'active'
    };

    let currentTab = 'single';
    let currentFilters = {};
    let dataLoader = null;
    let allData = {};

    function init() {
        const section = document.querySelector(CONFIG.selectors.section);
        if (!section) return;

        dataLoader = new LeaderboardDataLoader();
        
        bindTabEvents();
        bindFilterEvents();
        loadTabData('single');
    }

    function bindTabEvents() {
        document.querySelectorAll(CONFIG.selectors.tabButton).forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                if (tab && tab !== currentTab) {
                    switchTab(tab);
                }
            });
        });
    }

    function switchTab(tab) {
        document.querySelectorAll(CONFIG.selectors.tabButton).forEach(btn => {
            btn.classList.toggle(CONFIG.activeClass, btn.dataset.tab === tab);
        });

        document.querySelectorAll(CONFIG.selectors.tabContent).forEach(content => {
            content.classList.toggle(CONFIG.activeClass, content.dataset.tab === tab);
        });

        currentTab = tab;
        loadTabData(tab);
    }

    async function loadTabData(tab) {
        const contentEl = document.querySelector(
            CONFIG.selectors.tabContent + '[data-tab="' + tab + '"]'
        );
        if (!contentEl) return;

        showLoading(contentEl);

        try {
            let data;
            switch (tab) {
                case 'single':
                    data = await dataLoader.loadSingleGPU();
                    break;
                case 'multi':
                    data = await dataLoader.loadMultiGPU();
                    break;
                case 'distributed':
                    data = await dataLoader.loadDistributed();
                    break;
            }

            allData[tab] = data;
            renderTable(contentEl, data);
        } catch (error) {
            showError(contentEl, error.message);
        }
    }

    function bindFilterEvents() {
        document.querySelectorAll(CONFIG.selectors.filterSelect).forEach(select => {
            select.addEventListener('change', (e) => {
                const filterType = e.target.dataset.filter;
                const value = e.target.value;
                currentFilters[filterType] = value;
                applyFilters();
            });
        });
    }

    function applyFilters() {
        const data = allData[currentTab];
        if (!data) return;

        let filteredData = [...data];
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                filteredData = filteredData.filter(item => item[key] === value);
            }
        });

        const contentEl = document.querySelector(
            CONFIG.selectors.tabContent + '[data-tab="' + currentTab + '"]'
        );
        renderTable(contentEl, filteredData);
    }

    function renderTable(container, data) {
        hideAllStates(container);

        if (!data || data.length === 0) {
            showEmpty(container);
            return;
        }

        const tableContainer = container.querySelector(CONFIG.selectors.tableContainer);
        const tbody = tableContainer.querySelector('tbody');
        
        tbody.innerHTML = data.map((item, index) => 
            '<tr>' +
            '<td><span class="lb-rank ' + getRankClass(index + 1) + '">' + (index + 1) + '</span></td>' +
            '<td>' + escapeHtml(item.model || item.name) + '</td>' +
            '<td>' + (item.throughput || '-') + '</td>' +
            '<td>' + (item.latency || '-') + '</td>' +
            '<td>' + (item.memory || '-') + '</td>' +
            '<td><span class="lb-trend ' + getTrendClass(item.trend) + '">' + 
                getTrendIcon(item.trend) + ' ' + (item.trend || '-') + '</span></td>' +
            '<td><button class="lb-expand-btn" data-id="' + item.id + '">' +
                '<i class="fas fa-chevron-down"></i></button></td>' +
            '</tr>'
        ).join('');

        tableContainer.style.display = 'block';
        bindExpandEvents(container);
    }

    function bindExpandEvents(container) {
        container.querySelectorAll('.lb-expand-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                toggleDetail(id, e.currentTarget);
            });
        });
    }

    function toggleDetail(id, button) {
        const row = button.closest('tr');
        const existingDetail = row.nextElementSibling;
        
        if (existingDetail && existingDetail.classList.contains('lb-detail-row')) {
            existingDetail.remove();
            button.querySelector('i').classList.replace('fa-chevron-up', 'fa-chevron-down');
        } else {
            const item = allData[currentTab].find(d => d.id == id);
            if (item) {
                const detailRow = createDetailRow(item);
                row.insertAdjacentHTML('afterend', detailRow);
                button.querySelector('i').classList.replace('fa-chevron-down', 'fa-chevron-up');
            }
        }
    }

    function createDetailRow(item) {
        return '<tr class="lb-detail-row"><td colspan="7"><div class="lb-detail-content">' +
            '<div><strong>框架:</strong> ' + escapeHtml(item.framework || '-') + '</div>' +
            '<div><strong>GPU型号:</strong> ' + escapeHtml(item.gpu || '-') + '</div>' +
            '<div><strong>批次大小:</strong> ' + (item.batchSize || '-') + '</div>' +
            '<div><strong>测试日期:</strong> ' + (item.testDate || '-') + '</div>' +
            '</div></td></tr>';
    }

    function showLoading(container) {
        hideAllStates(container);
        container.querySelector(CONFIG.selectors.loading).style.display = 'flex';
    }

    function showEmpty(container) {
        hideAllStates(container);
        container.querySelector(CONFIG.selectors.empty).style.display = 'block';
    }

    function showError(container, message) {
        hideAllStates(container);
        const errorEl = container.querySelector(CONFIG.selectors.error);
        errorEl.textContent = '加载失败: ' + message;
        errorEl.style.display = 'block';
    }

    function hideAllStates(container) {
        container.querySelector(CONFIG.selectors.loading).style.display = 'none';
        container.querySelector(CONFIG.selectors.empty).style.display = 'none';
        container.querySelector(CONFIG.selectors.error).style.display = 'none';
        var tc = container.querySelector(CONFIG.selectors.tableContainer);
        if (tc) tc.style.display = 'none';
    }

    function getRankClass(rank) {
        if (rank === 1) return 'lb-rank-1';
        if (rank === 2) return 'lb-rank-2';
        if (rank === 3) return 'lb-rank-3';
        return '';
    }

    function getTrendClass(trend) {
        if (!trend) return '';
        if (trend.startsWith('+') || trend.includes('up')) return 'lb-trend-up';
        if (trend.startsWith('-') || trend.includes('down')) return 'lb-trend-down';
        return 'lb-trend-stable';
    }

    function getTrendIcon(trend) {
        if (!trend) return '';
        if (trend.startsWith('+') || trend.includes('up')) return '↑';
        if (trend.startsWith('-') || trend.includes('down')) return '↓';
        return '→';
    }

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('DOMContentSwitch', init);
})();
```

### Step 3: 选择器与类名对照表

| 功能 | 选择器 |
|-----|--------|
| Section 容器 | .leaderboard-section |
| Tab 按钮 | .lb-tab-button |
| Tab 内容 | .lb-tab-content |
| 筛选下拉框 | .lb-filter-select |
| 表格容器 | .lb-table-container |
| 加载状态 | .lb-loading |
| 空状态 | .lb-empty |
| 错误状态 | .lb-error |

### Step 4: 数据格式规范

JSON 数据应遵循以下格式：

```json
[
    {
        "id": 1,
        "name": "Model Name",
        "model": "Model Variant",
        "throughput": "1000 tokens/s",
        "latency": "50ms",
        "memory": "8GB",
        "trend": "+5%",
        "framework": "SAGE",
        "gpu": "NVIDIA A100",
        "batchSize": 32,
        "testDate": "2026-02-01"
    }
]
```

---

## ✅ 完成检查清单

- [ ] theme/assets/hf-data-loader.js 已创建
- [ ] theme/assets/leaderboard.js 已创建
- [ ] Tab 切换功能正常（不影响快速开始区的 Tab）
- [ ] 筛选器功能正常
- [ ] 数据加载成功时正确渲染表格
- [ ] Loading/Empty/Error 状态显示正常
- [ ] 详情展开/收起功能正常
- [ ] 无控制台 JS 错误

---

## 📎 参考资源

- 源 JS 文件: /home/shuhao/sagellm-website/assets/leaderboard.js
- 数据加载器: /home/shuhao/sagellm-website/assets/hf-data-loader.js

---

## 🔄 交付给 Task 4

完成后需向 Task 4 负责人提供：
1. theme/assets/leaderboard.js 文件
2. theme/assets/hf-data-loader.js 文件
3. 需要在 HTML 中引用的脚本顺序说明

---

## 📝 任务状态

- [ ] 未开始
- [ ] 进行中
- [ ] 已完成
- [ ] 已验收

**更新时间**: ___________
