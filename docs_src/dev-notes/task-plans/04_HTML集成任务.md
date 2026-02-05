# Task 4: HTML 结构与集成

## 📋 任务概述

| 项目 | 内容 |
|------|------|
| **任务编号** | Task 4 |
| **任务名称** | HTML 结构与集成 |
| **负责人** | 待分配 |
| **预计工时** | 4-6 小时 |
| **依赖任务** | Task 1, Task 2, Task 3 |
| **输出产物** | 修改后的 theme/index.html |

---

## 🎯 任务目标

将 Leaderboard 版块集成到 SAGE-Pub 首页，确保：

1. 正确引入 CSS 和 JS 资源
2. HTML 结构完整
3. 插入位置正确（快速开始之后，开发团队之前）
4. 与现有页面样式协调

---

## 📝 详细步骤

### Step 1: 收集前置任务交付物

在开始之前，确认已收到：

| 来源 | 文件 | 状态 |
|-----|------|------|
| Task 1 | theme/leaderboard.css | [ ] 已收到 |
| Task 2 | theme/assets/leaderboard.js | [ ] 已收到 |
| Task 2 | theme/assets/hf-data-loader.js | [ ] 已收到 |
| Task 3 | docs_src/data/leaderboard_*.json | [ ] 已收到 |

### Step 2: 在 head 中引入 CSS

在 theme/index.html 的 head 部分，在 responsive.css 之后添加：

```html
<link rel="stylesheet" href="responsive.css">
<link rel="stylesheet" href="leaderboard.css">  <!-- 新增 -->
```

### Step 3: 在 body 结束前引入 JS

在 theme/index.html 的 body 结束前，在现有脚本之后添加：

```html
<!-- Leaderboard Scripts -->
<script src="assets/hf-data-loader.js"></script>
<script src="assets/leaderboard.js"></script>
</body>
```

### Step 4: 插入 HTML 结构

在 #quickstart section 结束之后、#team section 之前插入以下 HTML：

```html
<!-- Performance Leaderboard Section -->
<section id="leaderboard" class="leaderboard-section section-animate">
    <div class="container">
        <h2 class="section-title">Performance Leaderboard</h2>
        <p class="section-subtitle">SAGE 在各种配置下的推理性能基准测试结果</p>

        <!-- Tab Navigation -->
        <div class="lb-tab-nav">
            <button class="lb-tab-button active" data-tab="single">
                <i class="fas fa-microchip"></i> 单机单卡
            </button>
            <button class="lb-tab-button" data-tab="multi">
                <i class="fas fa-server"></i> 单机多卡
            </button>
            <button class="lb-tab-button" data-tab="distributed">
                <i class="fas fa-network-wired"></i> 多机多卡
            </button>
        </div>

        <!-- Single GPU Tab Content -->
        <div class="lb-tab-content active" data-tab="single">
            <div class="lb-filter-container">
                <div class="lb-filter-group">
                    <label class="lb-filter-label">GPU 型号:</label>
                    <select class="lb-filter-select" data-filter="gpu">
                        <option value="all">全部</option>
                        <option value="A100">NVIDIA A100</option>
                        <option value="H100">NVIDIA H100</option>
                    </select>
                </div>
            </div>

            <div class="lb-loading" style="display: none;">
                <div class="lb-spinner"></div>
                <span>加载数据中...</span>
            </div>
            <div class="lb-empty" style="display: none;">暂无数据</div>
            <div class="lb-error" style="display: none;">数据加载失败</div>

            <div class="lb-table-container" style="display: none;">
                <table class="lb-table">
                    <thead>
                        <tr>
                            <th>排名</th>
                            <th>模型</th>
                            <th>吞吐量</th>
                            <th>延迟</th>
                            <th>显存</th>
                            <th>趋势</th>
                            <th>详情</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>

        <!-- Multi GPU Tab Content -->
        <div class="lb-tab-content" data-tab="multi">
            <div class="lb-filter-container">
                <div class="lb-filter-group">
                    <label class="lb-filter-label">GPU 数量:</label>
                    <select class="lb-filter-select" data-filter="gpuCount">
                        <option value="all">全部</option>
                        <option value="2">2 GPUs</option>
                        <option value="4">4 GPUs</option>
                        <option value="8">8 GPUs</option>
                    </select>
                </div>
            </div>

            <div class="lb-loading" style="display: none;">
                <div class="lb-spinner"></div>
                <span>加载数据中...</span>
            </div>
            <div class="lb-empty" style="display: none;">暂无数据</div>
            <div class="lb-error" style="display: none;">数据加载失败</div>

            <div class="lb-table-container" style="display: none;">
                <table class="lb-table">
                    <thead>
                        <tr>
                            <th>排名</th>
                            <th>模型</th>
                            <th>吞吐量</th>
                            <th>延迟</th>
                            <th>显存</th>
                            <th>趋势</th>
                            <th>详情</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>

        <!-- Distributed Tab Content -->
        <div class="lb-tab-content" data-tab="distributed">
            <div class="lb-filter-container">
                <div class="lb-filter-group">
                    <label class="lb-filter-label">节点数:</label>
                    <select class="lb-filter-select" data-filter="nodeCount">
                        <option value="all">全部</option>
                        <option value="2">2 Nodes</option>
                        <option value="4">4 Nodes</option>
                        <option value="8">8+ Nodes</option>
                    </select>
                </div>
            </div>

            <div class="lb-loading" style="display: none;">
                <div class="lb-spinner"></div>
                <span>加载数据中...</span>
            </div>
            <div class="lb-empty" style="display: none;">暂无数据</div>
            <div class="lb-error" style="display: none;">数据加载失败</div>

            <div class="lb-table-container" style="display: none;">
                <table class="lb-table">
                    <thead>
                        <tr>
                            <th>排名</th>
                            <th>模型</th>
                            <th>吞吐量</th>
                            <th>延迟</th>
                            <th>显存</th>
                            <th>趋势</th>
                            <th>详情</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>

        <div style="text-align: center; margin-top: 2rem;">
            <a href="benchmarks/" class="btn btn-secondary">
                <i class="fas fa-chart-bar"></i> 查看完整基准测试
            </a>
        </div>
    </div>
</section>
```

---

## 🧪 测试步骤

### 本地测试

```bash
# 1. 构建网站
mkdocs build

# 2. 启动本地服务器
mkdocs serve

# 3. 访问 http://127.0.0.1:8000 进行测试
```

### 功能测试清单

| 测试项 | 预期结果 | 通过 |
|-------|---------|------|
| 页面加载 | Leaderboard 版块正常显示 | [ ] |
| Tab 切换 | 三个 Tab 可正常切换 | [ ] |
| 快速开始 Tab | 原有 Tab 功能不受影响 | [ ] |
| 数据加载 | 表格正确显示数据 | [ ] |
| 筛选功能 | 筛选器可正常过滤数据 | [ ] |
| 详情展开 | 点击可展开/收起详情 | [ ] |
| 响应式 - 桌面 | 1920px 宽度下布局正常 | [ ] |
| 响应式 - 手机 | 375px 宽度下布局正常 | [ ] |
| 响应式 - 小屏 | 320px 宽度下表格可横向滚动 | [ ] |
| 控制台 | 无 404 或 JS 错误 | [ ] |

---

## ⚠️ 常见问题排查

### 1. CSS 不生效
- 检查 leaderboard.css 路径是否正确
- 检查 CSS 文件是否有语法错误
- 清除浏览器缓存后刷新

### 2. JS 不执行
- 检查控制台是否有错误
- 确认 hf-data-loader.js 在 leaderboard.js 之前加载
- 检查脚本路径是否正确

### 3. 数据加载失败
- 检查 docs_src/data/ 目录是否存在
- 验证 JSON 文件格式是否正确
- 确认 mkdocs build 后数据文件被复制到 site/data/

### 4. Tab 冲突
- 确认所有 Leaderboard 相关类名都使用 lb- 前缀
- 检查 JS 选择器是否使用正确的前缀类名

---

## ✅ 完成检查清单

- [ ] CSS 文件正确引入
- [ ] JS 文件正确引入（顺序正确）
- [ ] HTML 结构完整插入
- [ ] 插入位置正确
- [ ] mkdocs serve 测试通过
- [ ] Leaderboard Tab 切换正常
- [ ] 快速开始区 Tab 不受影响
- [ ] 数据正确加载和显示
- [ ] 响应式布局正常
- [ ] 无控制台错误

---

## 🔄 最终验收

完成所有测试后，通知项目负责人进行最终验收。

验收内容：
1. 功能完整性
2. 视觉一致性
3. 性能表现
4. 代码质量

---

## 📝 任务状态

- [ ] 未开始
- [ ] 等待前置任务
- [ ] 进行中
- [ ] 已完成
- [ ] 已验收

**更新时间**: ___________
