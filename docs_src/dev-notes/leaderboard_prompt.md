# 首页 Leaderboard 改造提示词

请参考 /home/shuhao/sagellm-website 里的实现，把 SAGE-Pub 首页增加一个「Performance Leaderboard」版块，并保证样式与交互在 SAGE-Pub 主题中可用。

## 参考素材（必须对齐）
- 页面结构与逻辑：/home/shuhao/sagellm-website/index.html
- 样式：/home/shuhao/sagellm-website/assets/leaderboard.css
- 脚本：/home/shuhao/sagellm-website/assets/leaderboard.js
- 数据加载器：/home/shuhao/sagellm-website/assets/hf-data-loader.js
- 本地数据：/home/shuhao/sagellm-website/data/leaderboard_single.json、leaderboard_multi.json

## 目标
- 在 SAGE-Pub 首页（theme/index.html）新增一个 leaderboard 版块。
- 版块包括：tab 切换（单机单卡/单机多卡/多机多卡）、筛选器、表格、空状态、加载状态、详情展开。
- 结构、样式、功能与 sagellm-website 保持一致，但需适配 SAGE-Pub 的主题结构。

## 必须遵循的适配要求
1. **避免与现有 tabs 样式/脚本冲突**：
   - SAGE-Pub 已有 `.tab-button`（快速开始区域）。
   - Leaderboard 相关类名需加前缀（如 `.lb-tab-button`、`.lb-tab-nav`、`.leaderboard-section .lb-tab-button`），并同步修改 JS 选择器。
2. **静态资源路径正确**：
   - CSS/JS 放到 `theme/assets/` 或 `docs_src/assets/`，并在 `theme/index.html` 里引用正确路径。
   - leaderboard JSON 数据放到 `docs_src/data/`（最终会生成 `/data/leaderboard_*.json`），与 JS 里的 fetch 路径一致。
3. **插入位置**：
   - 建议放在“快速开始”之后、“开发团队与合作”之前；保持页面滚动体验。
4. **保持响应式**：
   - 继承 leaderboard.css 的移动端样式规则，并保证在 320px 宽度下可横向滚动表格。
5. **可观测状态**：
   - 保留 loading/error/empty 状态 DOM 节点。
6. **不改动现有首页结构的其他部分**。

## 修改清单（按顺序做）
1. **复制样式**：将 sagellm-website 的 `assets/leaderboard.css` 迁移到 SAGE-Pub（建议新文件 `theme/leaderboard.css`），并把所有类名加前缀以避免冲突。
2. **复制脚本**：将 `assets/leaderboard.js` 迁移到 SAGE-Pub（建议 `theme/assets/leaderboard.js`），并同步更新类名与选择器。
3. **数据加载器**：将 `assets/hf-data-loader.js` 迁移到 SAGE-Pub（建议 `theme/assets/hf-data-loader.js`），保持逻辑一致；若不使用 HF，可删掉 HF 逻辑并仅保留本地 JSON 读取。
4. **插入 HTML 结构**：在 `theme/index.html` 里加入 leaderboard 版块的 HTML 结构（参考 sagellm-website 的 section），并替换 CSS 类名。
5. **引用资源**：在 `theme/index.html` 的 `<head>` 引入 leaderboard 样式；在 `<body>` 底部引入 `hf-data-loader.js` 和 `leaderboard.js`。
6. **拷贝数据**：从 sagellm-website/data 复制 leaderboard_single.json、leaderboard_multi.json 到 SAGE-Pub 的 `docs_src/data/`。

## 验收标准
- 首页正常显示 leaderboard 版块，tab 切换和筛选可用。
- 表格可滚动，趋势显示正常，详情展开正常。
- 快速开始区域原有 tab 行为不受影响。
- 无控制台报错（404/JS 错误）。

## 允许的轻微调整
- 文案可从 “sageLLM” 改为 “SAGE” 或更中性措辞。
- 图标可保留 emoji 或替换为 Font Awesome。

请按以上要求完成改造，并确保所有引用路径在 `mkdocs build` 后仍可正常访问。
