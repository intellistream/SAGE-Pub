# 核心概念

理解 SAGE 的核心架构和设计理念。

## 📚 本章内容

本章节帮助您深入理解 SAGE 的架构设计和包组织结构。

### [架构总览](architecture/overview.md)

了解 SAGE 的整体架构设计：

- 🏗️ **分层架构** - 从 L1 基础设施到 L6 接口层的完整架构
- 📦 **9 个核心包** - 各包的职责和定位
- 🔄 **数据流模型** - 流式处理的核心机制
- 🎯 **设计原则** - 模块化、可扩展、高性能

**适合人群**：想要全面了解 SAGE 架构的开发者

👉 [查看架构总览](architecture/overview.md)

### [包结构与依赖](architecture/package-structure.md)

深入了解 SAGE 各包的边界和依赖关系：

- 📊 **完整包列表** - 所有包的职责和规模
- 🔗 **依赖关系图** - 包之间的依赖关系可视化
- 📋 **详细规范** - 每个包的详细职责说明
- ⚠️ **依赖规则** - 跨包依赖的规范和限制

**适合人群**：需要理解代码组织的贡献者和架构师

👉 [查看包结构详情](architecture/package-structure.md)

## 🎯 快速导航

=== "我想了解..."

    **SAGE 的整体设计**
    → [架构总览](architecture/overview.md) - 查看完整的分层架构和设计理念
    
    **包之间的关系**
    → [包结构](architecture/package-structure.md) - 理解依赖关系和模块划分
    
    **设计决策背景**
    → [开发者/设计决策](../developers/commands.md) - 查看重要的架构决策文档

=== "我是..."

    **新手开发者**
    
    1. 先阅读 [架构总览](architecture/overview.md) 了解全局
    2. 然后查看 [入门指南](../getting-started/index.md) 开始实践
    
    **贡献者**
    
    1. 详细阅读 [包结构](architecture/package-structure.md) 了解代码组织
    2. 参考 [开发者指南](../developers/commands.md) 了解贡献流程
    
    **架构师**
    
    1. 研究 [架构总览](architecture/overview.md) 和 [包结构](architecture/package-structure.md)
    2. 深入 [设计决策文档](../developers/commands.md) 了解技术选型

## 🔍 核心概念速览

### 分层架构（Modular Monolith）

```
L6: Interface Layer (sage-studio, sage-tools)
    ↓
L5: Application Layer (sage-apps, sage-benchmark)
    ↓
L4: Middleware Layer (sage-middleware)
    ↓
L3: Core Layer (sage-kernel, sage-libs)
    ↓
L2: Platform Layer (sage-platform)
    ↓
L1: Foundation Layer (sage-common)
```

### 核心包职责

| 包名 | 层级 | 职责 |
|------|------|------|
| **sage-kernel** | L3 | 流式执行引擎，提供 DataStream API |
| **sage-libs** | L3 | AI 算法库，包含 RAG、Agents、Embeddings |
| **sage-middleware** | L4 | 领域算子和中间件服务 |
| **sage-common** | L1 | 基础工具库，日志、配置、类型定义 |
| **sage-platform** | L2 | 平台抽象，队列、存储、服务 |

### 数据流模型

```python
# SAGE 采用声明式的数据流编程模型
env.from_source(Source)      # 数据源
   .map(Transform)            # 转换
   .filter(Condition)         # 过滤
   .sink(Output)              # 输出
```

## 📖 相关阅读

### 入门级
- [快速开始](../getting-started/quickstart.md) - 5 分钟上手 SAGE
- [流式处理 101](../tutorials/basic/streaming-101.md) - 理解数据流编程

### 进阶级
- [Kernel 执行引擎](../guides/packages/sage-kernel/README.md) - 深入理解执行引擎
- [Libs AI 组件库](../guides/packages/sage-libs/README.md) - 了解 AI 组件

### 专家级
- [设计决策：sage-libs 重构](architecture/design-decisions/sage-libs-restructuring.md)
- [设计决策：RPC 队列重构](architecture/design-decisions/rpc-queue-refactoring.md)
- [设计决策：L2 平台层](architecture/design-decisions/l2-platform-layer.md)

## 💡 为什么要了解架构？

### 对开发者的价值

✅ **更快定位代码** - 知道功能在哪个包，快速找到相关代码  
✅ **避免错误设计** - 理解依赖规则，不会违反架构约束  
✅ **更好的贡献** - 按照架构设计添加新功能，保持代码质量  
✅ **深入理解** - 知其然也知其所以然，成为 SAGE 专家

### 对架构师的价值

✅ **技术选型参考** - 了解 SAGE 的设计决策和权衡  
✅ **扩展性评估** - 判断如何基于 SAGE 构建自己的系统  
✅ **架构演进** - 理解架构如何随需求演进  
✅ **最佳实践** - 学习分层架构和模块化设计的实践

## 🚀 下一步

选择您感兴趣的主题深入学习：

<div class="grid cards" markdown>

-   :material-chart-timeline-variant:{ .lg .middle } __架构总览__

    ---

    了解 SAGE 的完整分层架构和设计理念

    [:octicons-arrow-right-24: 查看详情](architecture/overview.md)

-   :material-package-variant:{ .lg .middle } __包结构__

    ---

    深入理解各包的职责边界和依赖关系

    [:octicons-arrow-right-24: 查看详情](architecture/package-structure.md)

-   :material-lightbulb-on:{ .lg .middle } __设计决策__

    ---

    了解重要架构决策的背景和原因

    [:octicons-arrow-right-24: 查看文档](../developers/commands.md)

-   :material-book-open-page-variant:{ .lg .middle } __用户指南__

    ---

    实践中应用架构知识

    [:octicons-arrow-right-24: 用户指南](../guides/packages/sage-kernel/README.md)

</div>
