# API 参考

SAGE 各个包的完整 API 文档。

## 📚 API 文档概览

API 文档按照 SAGE 的 **L1-L6 分层架构**组织，帮助您快速找到所需的 API 接口。

## 🏗️ 按架构层级浏览

### 🔹 L1: 基础设施层

#### [sage-common API](common/index.md)

基础工具库，提供通用的数据类型、配置管理和工具函数。

**主要模块**：
- `sage.common.core` - 核心类型和异常
- `sage.common.components` - Embedding 服务、vLLM 集成
- `sage.common.config` - 配置管理
- `sage.common.utils` - 日志、序列化等工具

👉 [查看 Common API](common/index.md)

---

### 🔹 L2: 平台服务层

#### [sage-platform API](platform/index.md)

平台抽象层，提供队列、存储、服务等基础设施抽象。

**主要模块**：
- `sage.platform.queue` - 队列抽象（Python Queue、Ray Queue、RPC Queue）
- `sage.platform.storage` - Key-Value 存储后端
- `sage.platform.service` - 服务基类

👉 [查看 Platform API](platform/index.md)

---

### 🔹 L3: 核心层

#### [sage-kernel API](kernel/index.md)

执行引擎和流式处理核心。

**主要模块**：
- `sage.kernel.api` - DataStream API、Environment、Functions
- `sage.kernel.operators` - Map、Filter、Join 等算子
- `sage.kernel.runtime` - 运行时系统（通信、任务管理）
- `sage.kernel.graph` - 图编译器

**详细 API 文档**：
- [DataStreams API](../guides/packages/sage-kernel/api/datastreams.md) - 数据流 API
- [Functions API](../guides/packages/sage-kernel/api/functions.md) - 函数接口
- [Environments API](../guides/packages/sage-kernel/api/environments.md) - 执行环境
- [Connected Streams API](../guides/packages/sage-kernel/api/connected-streams.md) - 连接流

👉 [查看 Kernel API](kernel/index.md)

---

#### [sage-libs API](libs/index.md)

AI 组件库，包含 RAG、Agents、Embeddings 等高级功能。

**主要模块**：
- `sage.libs.agentic.agents` - Agent 框架（Profile、Planner、Action、Runtime）
- `sage.libs.rag` - RAG Pipeline（检索、生成、评估）
- `sage.libs.embedding` - 向量嵌入
- `sage.libs.tools` - 工具集（搜索、图像、文本处理）
- `sage.libs.context` - 上下文管理

**详细 API 文档**：
- [RAG API 参考](../guides/packages/sage-libs/rag/api_reference.md) - RAG 组件 API
- [算子参考](../guides/packages/sage-libs/operators_reference.md) - Libs 算子 API

👉 [查看 Libs API](libs/index.md)

---

### 🔹 L4: 中间件层

#### [sage-middleware API](middleware/index.md)

领域特定的中间件服务。

**主要模块**：
- `sage.middleware.neuromem` - 向量数据库和记忆管理
- `sage.middleware.sage_db` - 时序数据库
- `sage.middleware.services` - 中间件服务

**详细 API 文档**：
- [服务 API](../guides/packages/sage-middleware/service/service_api.md) - 中间件服务接口

👉 [查看 Middleware API](middleware/index.md)

---

### 🔹 L5-L6: 应用层和接口层

应用层（sage-apps、sage-benchmark）和接口层（sage-studio、sage-cli、sage-tools）的文档请参考 [用户指南](../guides/index.md)。

---

## 📖 API 文档生成

API 文档通过以下方式自动生成：

- **mkdocstrings** - 从 Python docstrings 自动生成文档
- **Google style** - 使用 Google 风格的 docstring 格式
- **类型提示** - 完整的类型注解支持

## 🚀 快速开始

### 基础使用示例

```python
# L1: 使用 Common 工具
from sage.common.components.sage_embedding import EmbeddingFactory

embedding = EmbeddingFactory.create_embedding(
    provider="openai",
    model_name="text-embedding-3-small"
)

# L3: 创建 Kernel Pipeline
from sage.kernel.api.local_environment import LocalStreamEnvironment

env = LocalStreamEnvironment("my_app")
stream = (env
    .from_source(data_source)
    .map(transform_function)
    .filter(filter_function)
    .sink(output_sink)
)
env.execute()

# L3: 使用 Libs RAG
from sage.libs.rag import RAGPipeline

rag = RAGPipeline(
    retriever=my_retriever,
    generator=my_generator
)
result = rag.query("What is SAGE?")
```

## 📋 快速链接

### 按层级查找

| 层级 | 包 | API 文档 |
|------|-----|----------|
| L1 | sage-common | [Common API](common/index.md) |
| L2 | sage-platform | [Platform API](platform/index.md) |
| L3 | sage-kernel | [Kernel API](kernel/index.md) |
| L3 | sage-libs | [Libs API](libs/index.md) |
| L4 | sage-middleware | [Middleware API](middleware/index.md) |

### 常用 API

- [DataStream API](../guides/packages/sage-kernel/api/datastreams.md) - 构建数据流
- [Functions API](../guides/packages/sage-kernel/api/functions.md) - 自定义函数
- [RAG API](../guides/packages/sage-libs/rag/api_reference.md) - RAG 组件
- [算子参考](../guides/packages/sage-libs/operators_reference.md) - Libs 算子
- [服务 API](../guides/packages/sage-middleware/service/service_api.md) - 中间件服务

## 📚 相关文档

- [用户指南](../guides/index.md) - 各层级的详细使用指南
- [快速入门](../getting-started/quickstart.md) - 快速开始使用 SAGE
- [包架构](../dev-notes/package-architecture.md) - 了解 SAGE 的架构设计
- [核心概念](../concepts/index.md) - 理解 SAGE 的核心概念

## 🤝 贡献 API 文档

要改进 API 文档：

1. 在代码中编写清晰的 docstrings
2. 遵循 [Google docstring 格式](https://google.github.io/styleguide/pyguide.html#38-comments-and-docstrings)
3. 在 docstrings 中包含示例代码
4. 为所有公共 API 编写文档
5. 添加类型提示以提高文档质量

示例 docstring：

```python
def process_data(data: List[str], threshold: int = 10) -> Dict[str, int]:
    """处理输入数据并返回统计结果。

    Args:
        data: 要处理的字符串列表
        threshold: 过滤阈值，默认为 10

    Returns:
        包含统计信息的字典，键为字符串，值为计数

    Raises:
        ValueError: 当 threshold 为负数时

    Examples:
        >>> result = process_data(["a", "b", "a"], threshold=1)
        >>> print(result)
        {'a': 2, 'b': 1}
    """
    # Implementation here
    pass
```
