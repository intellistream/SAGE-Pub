# 入门指南

欢迎使用 SAGE！本指南将帮助您快速上手 SAGE 框架。

## 🚀 快速开始

如果您是第一次使用 SAGE，我们建议按以下顺序学习：

### 1. 安装 SAGE

首先需要安装 SAGE 及其依赖。我们提供了多种安装方式：

- **从源码安装**（推荐开发者）- 使用 `quickstart.sh` 一键安装，自动配置环境和依赖
- **通过 PyPI 安装** - 适合快速部署和生产环境使用

👉 [查看详细安装指南](installation.md)

### 2. 快速入门教程

安装完成后，通过快速入门教程学习 SAGE 的基本概念和使用方法：

- 创建第一个 SAGE Pipeline
- 理解数据流处理模型
- 运行 Hello World 示例

👉 [开始快速入门教程](quickstart.md)

## 📚 深入学习

完成快速开始后，您可以继续学习：

### 核心概念

深入理解 SAGE 的架构和设计：

- [架构总览](../concepts/architecture/overview.md) - SAGE 整体架构
- [包结构](../concepts/architecture/package-structure.md) - 各包的职责和依赖

### 进阶指南

探索 SAGE 的高级特性与最佳实践：

- [Kernel 指南](../guides/packages/sage-kernel/readme.md)
- [Libs 指南](../guides/packages/sage-libs/readme.md)

## 🎯 学习路径建议

=== "初学者"

```
1. ✅ [安装 SAGE](installation.md)
2. ✅ [快速入门](quickstart.md)
3. ✅ [架构总览](../concepts/architecture/overview.md)
4. ✅ [Kernel 指南](../guides/packages/sage-kernel/readme.md)
```

=== "中级用户"

```
1. ✅ [架构总览](../concepts/architecture/overview.md)
2. ✅ [包结构](../concepts/architecture/package-structure.md)
3. ✅ [Kernel 指南](../guides/packages/sage-kernel/readme.md)
4. ✅ [Libs 指南](../guides/packages/sage-libs/readme.md)
```

=== "高级开发者"

```
1. ✅ [设计决策文档](../concepts/architecture/design-decisions/sage-libs-restructuring.md)
2. ✅ [包结构](../concepts/architecture/package-structure.md)
3. ✅ [贡献指南](../developers/commands.md)
```

## 💡 常见使用场景

### 构建 RAG 应用

```python
from sage.kernel.api import LocalEnvironment
from sage.libs.io import FileSource, TerminalSink
from sage.middleware.operators.rag import ChromaRetriever, OpenAIGenerator

env = LocalEnvironment("rag_app")

(env.from_source(FileSource, {"file_path": "questions.txt"})
    .map(ChromaRetriever, {"collection": "docs", "top_k": 5})
    .map(OpenAIGenerator, {"model": "gpt-3.5-turbo"})
    .sink(TerminalSink))

env.submit()
```

### 流式数据处理

```python
from sage.kernel.api import LocalEnvironment
from sage.common.core.functions import MapFunction

class ProcessData(MapFunction):
    def map(self, record):
        # 自定义处理逻辑
        return record

env = LocalEnvironment("stream_app")
env.from_stream(source).map(ProcessData).sink(sink)
env.submit()
```

### 构建 AI Agent

```python
from sage.libs.agentic.agents.bots import AnswerBot, QuestionBot

# 创建对话 Agent
answer_bot = AnswerBot(model="gpt-4")
question_bot = QuestionBot()

# 构建对话流
env.from_bot(question_bot).connect(answer_bot).sink(output)
```

## 🆘 需要帮助？

- 📖 查看[用户指南](../guides/packages/sage-kernel/readme.md)了解详细功能
- 💬 访问 [GitHub Discussions](https://github.com/intellistream/SAGE/discussions) 提问
- 🐛 在 [GitHub Issues](https://github.com/intellistream/SAGE/issues) 报告问题
- 👥 加入[社区](../community/readme.md)与其他开发者交流

## 📝 下一步

准备好了吗？让我们开始吧！

<div class="grid cards" markdown>

- :material-download:{ .lg .middle } __安装 SAGE__

  ______________________________________________________________________

  了解如何安装 SAGE 及其依赖

  [:octicons-arrow-right-24: 安装指南](installation.md)

- :material-rocket-launch:{ .lg .middle } __快速入门__

  ______________________________________________________________________

  5 分钟内运行第一个 SAGE 应用

  [:octicons-arrow-right-24: 开始教程](quickstart.md)

- :material-book-open-variant:{ .lg .middle } __基础教程__

  ______________________________________________________________________

  学习 SAGE 的核心概念和用法

  [:octicons-arrow-right-24: 查看指南](../guides/index.md)

- :material-rocket:{ .lg .middle } __高级特性__

  ______________________________________________________________________

  探索分布式、自定义算子等高级功能

  [:octicons-arrow-right-24: 进阶指南](../guides/index.md)

</div>
