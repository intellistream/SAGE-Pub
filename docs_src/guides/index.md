# 用户指南

深入了解 SAGE 各个组件的使用方法和最佳实践。

## 📚 本章内容

用户指南提供了 SAGE 各个包和组件的详细文档，帮助您充分利用 SAGE 的功能。

## 🎯 核心组件

### [Kernel 执行引擎](packages/sage-kernel/README.md)

SAGE 的流式处理核心，提供 DataStream API 和执行运行时。

**核心功能**：
- 🌊 DataStream API - 声明式数据流编程
- ⚙️ 执行引擎 - 本地和分布式执行
- 🔧 算子系统 - Map、Filter、Join 等数据转换
- 📡 运行时服务 - 通信、任务管理、状态管理

**适合场景**：
- 构建流式数据处理应用
- 实现实时数据转换和分析
- 开发复杂的数据处理 Pipeline

👉 [查看 Kernel 文档](packages/sage-kernel/README.md)

---

### [Libs AI 组件库](packages/sage-libs/README.md)

高级 AI 算法库，包含 RAG、Agents、Embeddings 等开箱即用的组件。

**核心功能**：
- 🤖 **Agents** - 智能 Agent 框架，支持 ReAct、Plan-Execute 等模式
- 📚 **RAG** - 检索增强生成，包含完整的 RAG Pipeline
- 🔍 **Embeddings** - 向量嵌入和相似度搜索
- 🛠️ **Tools** - 预置工具集（搜索、图像识别、文本提取等）
- 💾 **Context** - 上下文管理和记忆系统

**适合场景**：
- 构建 AI Agent 应用
- 实现 RAG 问答系统
- 集成 LLM 能力到数据流

👉 [查看 Libs 文档](packages/sage-libs/README.md)

---

### [Middleware 中间件](packages/sage-middleware/overview.md)

领域特定的算子和中间件服务，提供数据库、向量存储等能力。

**核心功能**：
- 🧠 **NeuroMem** - 向量数据库和记忆管理
- 💾 **SageDB** - 时序数据库
- 🚀 **SageFlow** - 高性能流式算子（C++ 实现）
- 🎯 **GPU 加速** - CUDA 加速的向量操作

**适合场景**：
- 需要高性能向量检索
- 时序数据存储和查询
- GPU 加速的数据处理

👉 [查看 Middleware 文档](packages/sage-middleware/overview.md)

---

### [Platform & Tools](packages/sage-tools/cli_reference.md)

平台服务和开发工具，提升开发效率。

**包含**：
- 🔧 **sage-common** - 基础工具库
- 🏗️ **sage-platform** - 平台抽象层
- 💻 **CLI 工具** - 命令行管理工具
- 🎨 **Pipeline Builder** - 可视化 Pipeline 构建

👉 [查看工具文档](packages/sage-tools/cli_reference.md)

## 📖 专题指南

### [部署运维](deployment/)

生产环境部署和运维最佳实践：

- 🚀 部署架构设计
- 🔒 安全性配置
- 📊 监控和日志
- 🔄 持续集成/部署

### [最佳实践](best-practices/)

SAGE 开发的最佳实践和常见模式：

- ✅ 代码组织规范
- 🎯 性能优化技巧
- 🐛 常见问题解决
- 🔧 调试和测试

## 🗺️ 学习路径

### 初学者路径

1. **开始使用 Kernel**
   - [Kernel 快速开始](packages/sage-kernel/guides/quickstart.md)
   - [基本操作](packages/sage-kernel/guides/operations.md)
   - [示例代码](packages/sage-kernel/examples/)

2. **探索 Libs 组件**
   - [Libs 概览](packages/sage-libs/README.md)
   - [RAG 入门](packages/sage-libs/rag.md)
   - [Agent 示例](packages/sage-libs/agents.md)

3. **实践项目**
   - [最佳实践](best-practices/)
   - [部署指南](deployment/)

### 进阶路径

1. **深入 Kernel**
   - [架构设计](packages/sage-kernel/architecture.md)
   - [核心概念](packages/sage-kernel/concepts.md)
   - [性能优化](packages/sage-kernel/guides/improvements.md)

2. **高级 Libs 功能**
   - [设计哲学](packages/sage-libs/philosophy.md)
   - [自定义 Agents](packages/sage-libs/agents.md)
   - [算子参考](packages/sage-libs/operators_reference.md)

3. **Middleware 和扩展**
   - [NeuroMem 深入](packages/sage-middleware/components/neuromem.md)
   - [GPU 加速](packages/sage-middleware/hardware/gpu_acceleration.md)
   - [自定义服务](packages/sage-middleware/service/service_intro.md)

## 📊 快速参考

### 常用操作

| 任务 | 参考文档 |
|------|----------|
| 创建数据流 Pipeline | [Kernel 快速开始](packages/sage-kernel/guides/quickstart.md) |
| 实现 RAG 应用 | [RAG 指南](packages/sage-libs/rag.md) |
| 构建 AI Agent | [Agents 文档](packages/sage-libs/agents.md) |
| 使用向量数据库 | [NeuroMem 文档](packages/sage-middleware/components/neuromem.md) |
| 部署到生产环境 | [部署指南](deployment/) |
| 性能优化 | [性能优化](packages/sage-kernel/guides/improvements.md) |

### API 快速入口

- [Kernel API](packages/sage-kernel/api/datastreams.md) - DataStream、Environment、Functions
- [Libs API](packages/sage-libs/operators_reference.md) - Agents、RAG、Embeddings 算子
- [Middleware API](packages/sage-middleware/service/service_api.md) - 中间件服务接口

## 💡 使用建议

### 按使用场景选择

**构建数据处理应用**  
→ 重点学习 [Kernel](packages/sage-kernel/README.md)

**开发 AI Agent**  
→ 重点学习 [Libs - Agents](packages/sage-libs/agents.md)

**实现 RAG 系统**  
→ 学习 [Libs - RAG](packages/sage-libs/rag.md) + [Middleware - NeuroMem](packages/sage-middleware/components/neuromem.md)

**高性能需求**  
→ 学习 [Middleware](packages/sage-middleware/overview.md) + [GPU 加速](packages/sage-middleware/hardware/gpu_acceleration.md)

## 🆘 获取帮助

- 📖 查看 [常见问题](packages/sage-kernel/faq.md)
- 💬 访问 [GitHub Discussions](https://github.com/intellistream/SAGE/discussions)
- 🐛 报告 [GitHub Issues](https://github.com/intellistream/SAGE/issues)
- 👥 加入 [社区](../community/README.md)

## 🚀 下一步

选择您感兴趣的组件开始学习：

<div class="grid cards" markdown>

-   :material-water:{ .lg .middle } __Kernel 执行引擎__

    ---

    流式处理核心，DataStream API

    [:octicons-arrow-right-24: 查看文档](packages/sage-kernel/README.md)

-   :material-robot:{ .lg .middle } __Libs AI 组件库__

    ---

    RAG、Agents、Embeddings 等 AI 组件

    [:octicons-arrow-right-24: 查看文档](packages/sage-libs/README.md)

-   :material-database:{ .lg .middle } __Middleware 中间件__

    ---

    向量数据库、时序数据库、GPU 加速

    [:octicons-arrow-right-24: 查看文档](packages/sage-middleware/overview.md)

-   :material-toolbox:{ .lg .middle } __Platform & Tools__

    ---

    CLI 工具、Pipeline Builder 等

    [:octicons-arrow-right-24: 查看文档](packages/sage-tools/cli_reference.md)

</div>
