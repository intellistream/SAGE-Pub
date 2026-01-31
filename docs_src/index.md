---
title: SAGE - 高性能分布式推理框架
hide:
  - toc
---

<!-- Hero -->
<div align="center">

![SAGE logo](assets/img/isage_light.svg){width="72" height="72"}

# SAGE

**高性能分布式推理框架**  
数据流原生的模块化、透明、可控的 LLM 工作流推理框架。让 AI 应用开发变得简单、高效、可观测。

[快速开始](getting-started/quickstart.md){.md-button .md-button--primary}  
[查看演示](#demo){.md-button .md-button--secondary}  
[GitHub](https://github.com/intellistream/SAGE){.md-button .md-button--secondary}

</div>

---

## 核心特性

- 首创数据流范式（原生流式处理 + 异步执行）
- 生产级 AI 管道（可观测、容错、可扩缩）
- 统一内存与计算接口（向量 DB、NeuroMem）
- 丰富的工具链（RAG、Agents、Pipeline Builder）

---

## 使用示例

### 文章监控系统
源源不断地从 arXiv 拉取文章，经过多级筛选和语义分析，定向推送用户感兴趣的研究进展。  
[查看示例 →](guides/article-monitoring/)

### 分布式智能家居系统
展示 SAGE 在 IoT 场景下的设备编排与事件驱动能力。  
[查看示例 →](guides/smart-home/)

### 智能扩缩容聊天系统
演示基于负载感知的自动扩缩容策略与在线模型服务。  
[查看示例 →](guides/auto-scaling-chat/)

---

## 快速开始

使用 Conda（推荐）：

```bash
conda create -n sage python=3.11.10
conda activate sage
# 克隆仓库并快速安装（开发者模式）
git clone https://github.com/intellistream/SAGE.git
cd SAGE
./quickstart.sh --dev --yes
```

或安装 PyPI 包：

```bash
pip install isage
```

查看完整安装指南： [安装文档 →](getting-started/installation.md)

---

## 开发与贡献

欢迎参与 SAGE 的开发与讨论：

- 阅读开发环境与贡献指南： [开发环境](developers/development-setup.md) / [贡献命令速查](developers/commands.md)
- 提交 PR 前请遵守 `pre-commit` 和 `sage-dev quality` 检查

---

## 开发团队与合作

来自华中科技大学 IntelliStream Lab 与工业界合作伙伴。  
团队负责人：张书豪 教授 — [教师主页](https://faculty.hust.edu.cn/ZHANG_SHUHAO/zh_CN/index/2608525/list/)

---

## 演示（快速预览） {#demo}

> 以下为演示资源链接 —— 在本地或官网环境可以查看交互演示。

- [安装演示 (Asciinema)](assets/demo-install.cast)
- [本地 RAG Pipeline 演示 (Asciinema)](assets/demo-local.cast)
- [分布式演示 (Asciinema)](assets/demo-distributed.cast)
- [Gateway 演示 (Asciinema)](assets/demo-gateway.cast)

> 想要内嵌演示播放器或更丰富的互动内容，请告知，我可以把 Asciinema Player 或视频组件加入此页面。

---

如果你希望我把这份 Markdown 文件更进一步美化（例如添加网格布局、卡片样式、内嵌 Asciinema 播放器或 CTA 按钮样式），告诉我我会继续优化。
