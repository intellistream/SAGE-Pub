# MkDocs 主题覆盖与模板维护手册

帮助贡献者快速理解并维护 `docs-public/theme` 与 `docs-public/docs_src/templates` 目录。该区域负责 Material for MkDocs 主题的定制首页、全局样式、交互脚本以及 Python API 文档渲染模板。

---

## 目录结构速览

```text
theme/                       # Material 主题覆盖文件（HTML/CSS/JS/片段）
├─ index.html                # 首页重写，包含定制 hero/feature 区块
├─ main.html                 # 扩展 base.html，注入全局脚本与样式
├─ styles.css                # 全局基础与导航样式
├─ hero.css                  # 首页 Hero 模块布局与动效
├─ sections.css              # 分区（Why/Quickstart/Testimonials 等）样式
├─ animations.css            # canvas/卡片/连线等动画细节
├─ responsive.css            # 响应式断点与移动端修饰
├─ script.js                 # 首页动画、交互与滚动行为
├─ article-monitoring.html   # 示例卡片嵌入片段
├─ smart-home.html           # 示例卡片嵌入片段
├─ auto-scaling.html         # 示例卡片嵌入片段
├─ test-*.html               # 片段独立调试页面
└─ animations.css/...        # 其他辅助资源
docs_src/
└─ templates/
   └─ python/material/
      └─ function.html.jinja # Python 函数/方法的 API 渲染模板
```

> 📌 `mkdocs.yml` 通过 `theme.custom_dir = theme` 激活上述覆盖文件，无需额外配置即可生效。

---

## overrides 目录详解

### `index.html` — Landing Page 重写
- 构建自定义首页：大幅动画 Hero、功能拆解（What/Why/Examples/Quickstart）。
- 通过 `<link rel="stylesheet" href="…">` 和 `<script src="…">` 挂载同目录下的样式与脚本。
- 引入 `articleMonitoringAnimation`、`smartHomeAnimation`、`autoScalingAnimation` 容器，与对应 HTML 片段配合形成动态示例。
- 调整导航到常用入口（快速开始、内核文档、示例、GitHub）。

👉 修改建议：
1. 资产路径使用相对路径（与 `index.html` 同级）。构建后会被复制到站点根目录。
2. 减少一次性资源：动画密集区段若显卡顿，可在 `script.js` 内降低粒子数量或刷新频率。
3. 内容文案更新后同步检查响应式表现（见 `responsive.css`）。

### `main.html` — 全局扩展
- 继承 Material `base.html` 以注入：
  - Google Tag Manager 片段（可按需替换或禁用）。
  - “Copy page as Markdown” 按钮，便于快速复制原始 Markdown。
  - 公共字体与颜色变量，统一主站视觉。
- 适合添加全站通用的 meta/script/样式逻辑。

### 样式模块拆解
| 文件 | 作用摘要 | 维护要点 |
|------|---------|---------|
| `styles.css` | 初始化、浮动导航、全局背景/排版基线 | 谨慎改动 `.floating-nav` 相关定位，避免遮挡搜索栏 |
| `hero.css` | 首屏主视觉与背景粒子效果 | 修改尺寸时，同步调整 `script.js` 中的粒子生成范围 |
| `sections.css` | “What/Why/Examples/Quickstart”等区块布局 | 若新增区块，沿用 `.section-animate` 触发滚动动画 |
| `animations.css` | 关键帧动画分类（节点流、发光、渐入等） | 与 JS 中的类名保持一致，避免动画失联 |
| `responsive.css` | 断点适配（≤1200/992/768/576 px） | 变更断点时记得回归测试手机与平板视图 |

### 片段与测试页面
- `article-monitoring.html`、`smart-home.html`、`auto-scaling.html`：实际示例卡片的 HTML 片段，可快速嵌入到主页面或其他文档。
- `test-*.html`：单独预览片段的沙盒，方便调试动画，不参与 MkDocs 构建。

更新片段后：
1. 先在测试页中验证视觉效果。
2. 再将 `<div id="…">` 容器同步到 `index.html` 或目标文档。

### `script.js` — 行为与动画
- 负责滚动显隐、IntersectionObserver 动画、Hero 粒子、标签流、Tab 切换、卡片 hover 等交互。
- 内置节流器保护滚动监听，避免性能问题。
- 若需要增加新动画，首选追加在 `create*` 系列函数内；共用的动画曲线放入 `animations.css`。

调试建议：在浏览器 DevTools Performance 面板观察帧率，必要时减少 `setInterval` 调度频次。

### 调试与构建
1. 在仓库根目录执行 `mkdocs serve -f docs-public/mkdocs.yml` 可实时预览。
2. 若需部署静态资源，使用 `mkdocs build -f docs-public/mkdocs.yml` 或项目提供的 `docs-public/build.sh`。
3. 变更 JS/CSS 后记得刷新缓存（Ctrl+F5）以加载新版本。

---

## `templates/python/material/function.html.jinja`

该模板覆盖 Material 提供的 Python 函数渲染逻辑（由 `mkdocstrings[python]` 使用），实现以下定制：

- **标题控制**：根据 `config.show_root_full_path` 决定展示完整路径或短函数名。
- **不同上下文**：`root` 和 `root_members` 参数区分首页引用与子成员渲染。
- **标签渲染**：复用 `labels` 模板块展示 experimental/deprecated 等标识。
- **分离签名模式**：若启用 `config.separate_signature`，标题仅展示名称，签名移至下方。
- **源码折叠**：当 `config.show_source` 且存在源码时，渲染 `<details>` 组件 + 行号高亮。

### 常用定制点
1. **调整标题层级**：修改 `heading()` 调用参数 `heading_level` 或追加自定义 `class`。
2. **调节路径展示**：通过 `config.show_root_full_path`、`config.show_object_full_path` 控制。
3. **扩展标签**：在 `labels` 块新增自定义标签（确保与 `mkdocstrings` 配置匹配）。
4. **源码展示**：可以将 `<details>` 替换为轻量标题或移除，减少页面长度。

> 修改前建议备份文件，并在本地运行 `mkdocs serve` 查看生成效果；模板语法错误会在生成时抛出 `jinja2.exceptions.TemplateSyntaxError`。

### 示例：为方法标题补充图标

```jinja
{% block heading scoped %}
  {% if config.show_symbol_type_heading %}
    <code class="doc-symbol doc-symbol-heading doc-symbol-{{ symbol_type }}"></code>
  {% endif %}
  <span class="doc doc-object-name doc-function-name">
    {% if function.parent.is_class %}:material-cog:{% endif %}
    {{ config.heading if config.heading and root else function_name }}
  </span>
{% endblock heading %}
```

---

## 维护流程与最佳实践

1. **统一规范**：CSS 命名使用 BEM 风格（如 `.example-card__title`）可读性更佳；JS 中尽量封装函数，避免全局变量冲突。
2. **多语言兼容**：页面文本默认中文，如需中英双语，可在 `index.html` 中引入 `<span lang="en">` 并配合 i18n 开关。
3. **性能提示**：动画过多时，适当降低 `createStreamingData`、`createDataLabels` 的粒子数量或延长 `setInterval`。
4. **回归验证**：修改模板后检查 API 文档（例如 `kernel/core/functions/functions_overview.md`）以确认函数渲染未受影响。
5. **版本控制**：每次提交前运行 `mkdocs build`，确保没有语法错误、资源缺失或 404。

---

## 关联阅读
- `docs-public/mkdocs.yml`：主题配置、导航及扩展。
- [`join_sage/template.md`](template.md)：Markdown 写作高阶示例。
- [`docs-public/docs_src/get_start/quickstart.md`](../get_start/quickstart.md)：验证首页 CTA 链接指向的内容是否最新。

如需新增主题覆盖，请先在此文补充用途说明，确保后续维护者能够快速定位。