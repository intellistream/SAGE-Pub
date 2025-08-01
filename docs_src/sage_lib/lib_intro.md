# SAGE Lib: 核心组件库介绍

欢迎使用 SAGE Lib，这是一个为构建高级、模块化的数据流处理与人工智能应用而设计的核心组件库。SAGE Lib 的设计哲学是将复杂的 AI 任务分解为一系列可独立管理、可自由组合的功能模块。通过这些模块，开发者可以像搭积木一样，快速、灵活地构建出从简单的数据处理到复杂的检索增强生成 (RAG) 和智能代理 (Agent) 的各类应用。

SAGE Lib 主要由以下几个核心模块组成：

---

### 1. RAG (Retrieval-Augmented Generation) 模块

这是 SAGE Lib 的核心，专为构建强大的问答和内容生成系统而设计。RAG 模块提供了一套完整的、端到端的工具链，覆盖了从原始数据到最终答案生成的每一个环节：

* **数据准备**: 包括多种文本分块 (`Chunking`)策略。
* **信息检索**: 结合了基于关键词的稀疏检索 (`BM25sRetriever`) 和基于向量的密集检索 (`DenseRetriever`)，并支持在线搜索 (`BochaWebSearch`)。
* **结果优化**: 通过先进的重排模型 (`Reranker`) 提升检索结果的精度。
* **查询理解**: 能够对用户输入进行深度分析 (`Query Profiler`)，以选择最优的处理路径。
* **智能生成**: 集成了灵活的提示词工程 (`Prompting`) 和可对接多种大语言模型（本地或云端）的生成器 (`Generator`)。
* **全面评估**: 内置了从文本相似度到性能延迟的多种评估工具 (`Evaluation`)，方便开发者对系统进行量化分析和持续优化。

简而言之，RAG 模块是您构建下一代智能问答应用的“瑞士军刀”。

---

### 2. IO (Input/Output) 模块

IO 模块是 SAGE 流水线的“门户”，负责管理数据的流入与流出。它定义了数据处理的起点和终点，是连接 SAGE 系统与外部世界的桥梁。

* **Source (数据源)**: 如 `FileSource`，负责从文件、数据库或 API 等外部来源读取数据，启动数据流。
* **Sink (数据汇聚)**: 如 `FileSink` 和 `TerminalSink`，负责将处理完成的结果输出到控制台、文件或其他目标系统。

通过解耦数据处理逻辑与数据源/目标，IO 模块极大地增强了 SAGE 应用的灵活性和可移植性。

---

### 3. Tools (工具) 模块

如果说 RAG 模块提供了构建 AI 应用的“方法论”，那么 Tools 模块就是提供具体“行动能力”的工具箱。它包含了一系列即插即用的、原子化的功能组件。

* **功能**: 每个工具都为执行一个特定任务而设计，例如搜索学术论文 (`Arxiv Paper Searcher`)、为图片生成描述 (`Image Captioner`) 或从网页提取文本 (`URL Text Extractor`)。
* **用途**: 这些工具可以被无缝集成到任何 SAGE 流水线中，尤其是作为智能代理 (Agent) 可调用的“技能”。

---

### 4. Agents (智能代理) 模块

Agents 模块是 SAGE Lib 中实现更高层次智能的核心。一个 Agent 被设计用来模拟一个能够自主思考和行动的实体。

* **核心能力**:
    * **规划与决策**: Agent 能够理解复杂的用户意图，将其分解为一系列可执行的步骤。
    * **工具调用**: Agent 能够根据任务需求，动态地选择并调用 `Tools` 模块中的一个或多个工具来完成子任务。
    * **结果整合**: Agent 能够整合来自不同工具的返回结果，并最终形成一个连贯的、完整的答案。

通过 Agents 模块，您可以构建出能够处理复杂、多步任务的自动化工作流。

---

### 5. Context (上下文) 模块

Context 模块是整个 SAGE Lib 的“神经中枢”和“记忆中心”。它定义了数据流在运行时的环境和状态，确保了不同组件之间的顺畅通信和状态共享。

* **状态管理**: Context 负责管理流水线的全局状态，包括短期记忆 (STM) 和长期记忆 (LTM)。
* **资源访问**: 它为流水线中的所有组件提供了访问系统级资源（如知识库、配置信息）的统一接口。
* **生命周期**: Context 贯穿于整个数据流的生命周期，是实现有状态计算（如带历史记录的对话）和组件间协同工作的基石。

**总结**: SAGE Lib 通过 `IO` 模块与世界交互，利用 `RAG` 和 `Tools` 模块提供强大的信息处理和执行能力，并通过 `Agents` 模块实现智能决策，最后由 `Context` 模块将这一切有机地串联起来，共同构成了一个高度灵活、功能完备的 AI 应用开发库。
