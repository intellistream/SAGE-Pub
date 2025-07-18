# Neuromem Memory API 使用说明

## 背景
Neuromem 是一个内存控制层，介于底层索引、数据存储与上层应用之间。它通过 `MemoryManager` 管理 `Collection` 的生命周期，`Collection` 是具体存储数据和创建索引的单元。用户通过 API 向 `MemoryManager` 申请服务，操作不同类型的 `Collection`。

## 功能概述
- **MemoryManager**: 单例模式，负责管理所有 `Collection` 的创建和访问。
- **Collection**: 数据存储单元，支持两种类型：
  - **VDB**: 向量数据库，适合需要嵌入模型的场景。
  - **KV**: 键值存储，适合简单键值对存储。
- **API 功能**: 创建、获取 `Collection`，支持本地或远程（Ray Actor）模式。
- **Embedding 模型**: 用于 VDB 类型 `Collection` 的向量嵌入，支持多种预训练模型。



## 使用方法

### 1. 获取 MemoryManager
通过 `get_manager()` 获取全局唯一的 `MemoryManager` 实例：
```python
from sage_memory.memory_api import get_manager

manager = get_manager()
```

### 2. 获取或创建 Collection
使用 `get_memory()` 方法获取或创建 `Collection`，支持以下参数：
- `config`: 字典，配置 `Collection` 的参数。
- `remote`: 布尔值，是否以 Ray Actor 模式运行（默认 `False`）。
- `env_name`: 可选字符串，指定环境名称。

#### 配置示例
- **VDB 类型 Collection**（使用 `embed-english-light-v3.0` 模型）:
```python
config = {
    "collection_name": "memprompt_collection",
    "backend_type": "VDB",
    "embedding_model_name": "embed-english-light-v3.0",
    "dim": 384,
    "description": "A collection for locomo experiment"
}
```

- **KV 类型 Collection**:
```python
config = {
    "collection_name": "kvtest_collection",
    "backend_type": "KV",
    "description": "A collection for key-value storage"
}
```

#### 调用示例
```python
from sage_memory.memory_api import get_memory

# 获取或创建 VDB Collection（使用 jina-embeddings-v3）
collection = get_memory(config={
    "collection_name": "memprompt_collection",
    "backend_type": "VDB",
    "embedding_model_name": "jina-embeddings-v3",
    "dim": 1024,
    "description": "A collection for locomo experiment"
}, remote=False)

# 获取或创建 KV Collection
collection = get_memory(config={
    "collection_name": "kvtest_collection",
    "backend_type": "KV",
    "description": "A collection for key-value storage"
}, remote=True, env_name="test_env")
```

### 注意事项
- 如果 `config` 中指定的 `collection_name` 已存在，`get_memory()` 将直接返回对应的 `Collection`。
- 如果 `backend_type` 不是 `VDB` 或 `KV`，会抛出 `ValueError`。
- `remote=True` 时，需确保 `CustomLogger.get_session_folder()` 可用以支持 Ray Actor 模式。
- `VDB` 类型需要指定 `embedding_model_name` 和 `dim`，且 `dim` 必须与所选嵌入模型的向量维度一致。
- `mockembedder` 仅用于测试，生产环境中请使用其他模型。

## Embedding 模型
`VDB` 类型的 `Collection` 需要通过嵌入模型将数据转换为向量。以下是支持的嵌入模型及其对应的向量维度：
- **mistral_embed**: 1024 维，适用于通用嵌入场景。
- **embed-multilingual-v3.0**: 1024 维，支持多语言文本嵌入。
- **embed-english-v3.0**: 1024 维，优化用于英语文本嵌入。
- **embed-english-light-v3.0**: 384 维，轻量级英语文本嵌入模型，适合资源受限场景。
- **embed-multilingual-light-v3.0**: 384 维，轻量级多语言文本嵌入模型。
- **embed-english-v2.0**: 4096 维，高维度英语文本嵌入，适合复杂任务。
- **embed-english-light-v2.0**: 1024 维，较轻量的英语文本嵌入模型。
- **embed-multilingual-v2.0**: 768 维，支持多语言的嵌入模型。
- **jina-embeddings-v3**: 1024 维，通用高性能嵌入模型。
- **BAAI/bge-m3**: 1024 维，适用于多种语言和任务的嵌入模型。
- **sentence-transformers/all-MiniLM-L6-v2**: 384 维，轻量高效的英语嵌入模型。
- **mockembedder**: 128 维，仅用于测试环境，非生产用途。

在配置 `VDB` 类型 `Collection` 时，需在 `config` 中指定 `embedding_model_name` 和对应的 `dim`，以确保嵌入模型与向量维度匹配。
