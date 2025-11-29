# sage-common: Foundation Layer (L1)

## Overview

`sage-common` provides foundational utilities, data types, and core components used across the entire SAGE system. This is the **foundation layer** that all other packages depend on.

## Key Components

### LLM 推理服务 (sage_llm)

统一的 LLM 和 Embedding 推理接口：

```python
from sage.common.components.sage_llm import UnifiedInferenceClient

# 自动检测本地服务或云端 API
client = UnifiedInferenceClient.create_auto()

# Chat 对话
response = client.chat([{"role": "user", "content": "Hello"}])

# 文本生成
text = client.generate("Once upon a time")

# Embedding
vectors = client.embed(["text1", "text2"])
```

**两种模式**:

| 模式 | 创建方式 | 特点 |
|------|---------|------|
| Simple | `create_auto()` | 直连后端，适合开发测试 |
| Control Plane | `create_with_control_plane()` | 智能调度，支持多实例、负载均衡 |

### Embedding 服务 (sage_embedding)

多种 Embedding 方法的统一接口：

```python
from sage.common.components.sage_embedding import (
    EmbeddingFactory,
    EmbeddingClientAdapter,
)

# 本地 HuggingFace 模型
embedder = EmbeddingFactory.create("hf", model="BAAI/bge-small-zh-v1.5")
client = EmbeddingClientAdapter(embedder)
vectors = client.embed(["Hello", "World"])
```

**支持的方法**: `hash`, `hf`, `openai`, `jina`, `zhipu`, `cohere`, `ollama`, `siliconcloud`, `bedrock`, `nvidia_openai`

### 端口配置 (SagePorts)

统一的端口管理，避免硬编码：

```python
from sage.common.config.ports import SagePorts

# 使用预定义端口
llm_port = SagePorts.LLM_DEFAULT           # 8001
gateway_port = SagePorts.GATEWAY_DEFAULT   # 8000
embedding_port = SagePorts.EMBEDDING_DEFAULT  # 8090

# WSL2 环境自动选择
port = SagePorts.get_recommended_llm_port()
```

### Data Types

- **BaseDocument**: Foundation for all document types
- **Vector Types**: Dense and sparse vector representations
- **Metadata**: Document metadata management

### Utilities

- **Logger**: Structured logging system
- **Config**: Configuration management
- **Exceptions**: Custom exception hierarchy

### Core Interfaces

- Common protocols and abstract base classes
- Serialization/deserialization interfaces
- Type definitions and validators

## Architecture

```
sage-common/
├── components/
│   ├── sage_llm/          # LLM 统一推理服务
│   │   ├── unified_client.py    # UnifiedInferenceClient
│   │   ├── sageLLM/            # Control Plane 核心
│   │   └── ...
│   └── sage_embedding/     # Embedding 统一接口
│       ├── factory.py          # EmbeddingFactory
│       ├── protocols.py        # EmbeddingProtocol
│       └── ...
├── config/
│   └── ports.py           # SagePorts 端口配置
├── types/                 # Data type definitions
├── utils/                 # Utility functions
└── exceptions/            # Exception classes
```

## sageLLM Control Plane

高级调度系统，支持 LLM + Embedding 混合工作负载：

```
┌─────────────────────────────────────────────────────────────────┐
│                      UnifiedInferenceClient                      │
│                  chat() | generate() | embed()                   │
├─────────────────────────────────────────────────────────────────┤
│                    sageLLM Control Plane                         │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  RequestClassifier → HybridSchedulingPolicy             │   │
│   │  ExecutionCoordinator | EmbeddingExecutor               │   │
│   └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                     统一资源池 (GPU Pool)                        │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│   │ vLLM (LLM)  │  │ vLLM (Mixed)│  │  Embedding  │           │
│   └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

## Usage Examples

### 统一推理客户端

```python
from sage.common.components.sage_llm import UnifiedInferenceClient

# 方式 1: 自动检测（推荐）
client = UnifiedInferenceClient.create_auto()

# 方式 2: 显式配置
client = UnifiedInferenceClient(
    llm_base_url="http://localhost:8901/v1",
    llm_model="Qwen/Qwen2.5-7B-Instruct",
    embedding_base_url="http://localhost:8090/v1",
    embedding_model="BAAI/bge-m3",
)

# 方式 3: Control Plane 模式
client = UnifiedInferenceClient.create_with_control_plane(
    llm_base_url="http://localhost:8901/v1",
    embedding_base_url="http://localhost:8090/v1",
)

# 检查服务状态
status = client.get_status()
print(f"LLM available: {status['llm_available']}")
print(f"Embedding available: {status['embedding_available']}")
```

### 本地 Embedding

```python
from sage.common.components.sage_embedding import (
    EmbeddingFactory,
    EmbeddingClientAdapter,
    list_embedding_models,
)

# 查看可用方法
for method, info in list_embedding_models().items():
    print(f"{method}: {info['description']}")

# 创建 embedder
embedder = EmbeddingFactory.create("hash", dim=384)
client = EmbeddingClientAdapter(embedder)
vectors = client.embed(["Hello", "World"])
```

## Dependencies

- **External**: `openai`, `httpx`, `torch` (optional for HF models)
- **Internal**: None (foundation layer)

## Environment Variables

```bash
# LLM 配置
SAGE_CHAT_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
SAGE_CHAT_MODEL=qwen-turbo-2025-02-11
SAGE_CHAT_API_KEY=sk-xxx

# Embedding 配置
SAGE_EMBEDDING_BASE_URL=http://localhost:8090/v1
SAGE_EMBEDDING_MODEL=BAAI/bge-m3

# HuggingFace
HF_TOKEN=hf_xxx
HF_ENDPOINT=https://hf-mirror.com  # 中国镜像
```

## See Also

- [Embedding 模块](../sage-libs/embedding.md) - 详细的 Embedding 用法
- [部署指南](../../deployment/index.md) - LLM/Embedding 服务部署
- [Architecture Overview](../../../concepts/architecture/overview.md)
- [Package Structure](../../../concepts/architecture/package-structure.md)
