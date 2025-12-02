# sage-common: Foundation Layer (L1)

## Overview

`sage-common` 是 SAGE 的 L1 基础层，负责提供统一的端口/网络配置、Control Plane 推理栈、Embedding 工厂以及共享数据类型。2025 Q4 之后，`UnifiedInferenceClient.create()` 成为唯一入口，所有 Chat/Generate/Embed 请求默认经过 Control Plane 以复用智能调度与 SLO 策略。

### 服务栈速览

| 场景 | 推荐入口 | 说明 |
|------|---------|------|
| 启动/管理本地 vLLM + Embedding 服务 | `sage llm serve [--no-embedding]` | CLI 守护进程，会在 `SagePorts.LLM_DEFAULT`/`SagePorts.EMBEDDING_DEFAULT` 上暴露 OpenAI 兼容接口，可配合 `sage llm status/logs/engine`。|
| 统一消费 LLM + Embedding | `UnifiedInferenceClient.create()` | Control Plane First：自动探测本地/远端端点或挂到外部 Gateway (`control_plane_url`)；支持嵌入式 Control Plane (`embedded=True`) 与 `create_for_model()` 动态拉起引擎。|
| 无服务模式、直接调用本地模型 | `EmbeddingFactory + EmbeddingClientAdapter` | `EmbeddingFactory` 返回单文本 `BaseEmbedding` 接口，需配合 `EmbeddingClientAdapter` 提供批量 `embed(list[str])`，适合离线批处理或单元测试。|

## Key Components

### LLM 推理服务 (sage_llm)

统一的 LLM 和 Embedding 推理接口：

```python
from sage.common.components.sage_llm import UnifiedInferenceClient

# Control Plane First：自动探测本地 vLLM/Embedding，再回退云端 API
client = UnifiedInferenceClient.create()

# 指定 Gateway（如 UnifiedAPIServer 或集群 Control Plane）
cp_client = UnifiedInferenceClient.create(
    control_plane_url="http://localhost:8000/v1",
    default_llm_model="Qwen/Qwen2.5-7B-Instruct",
    default_embedding_model="BAAI/bge-m3",
)

# 需要在当前进程内运行 Control Plane，可打开 embedded 模式
embedded_client = UnifiedInferenceClient.create(embedded=True)

# Chat / Generate / Embed API
def ask(messages: list[dict[str, str]]):
    return client.chat(messages)

text = client.generate("Once upon a time")
vectors = client.embed(["text1", "text2"])

# 针对特定模型自动拉起/复用引擎
model_bound = UnifiedInferenceClient.create_for_model("Qwen/Qwen2.5-7B-Instruct")
```

#### 请求路径（ASCII）

```
User Code ──► UnifiedInferenceClient.create()
                 │ prefer_local + env auto detection
                 ▼
            RequestClassifier
                 ▼
          HybridSchedulingPolicy ──► Embedding Batcher
                 │                        │
                 │                        └─► EmbeddingExecutor (batch to /v1/embeddings)
                 ▼
      ExecutionCoordinator (HttpExecutionCoordinator)
                 ▼
     vLLM / TEI Instances on SagePorts.LLM_* & SagePorts.EMBEDDING_*
```

- `RequestClassifier`：根据 `RequestMetadata` 判断是 `LLM_CHAT / LLM_GENERATE / EMBEDDING`，并选择可处理的实例类型。
- `HybridSchedulingPolicy`：混合策略，内置 `embedding` 批处理、`Adaptive/SLO_Aware` 落地 (`sage.common.components.sage_llm.sageLLM.control_plane.strategies.hybrid_policy`)。
- `HttpExecutionCoordinator`：通过 HTTP 将请求路由到注册的 vLLM/Embedding 实例；Embedding 分支由 `EmbeddingExecutor` 聚合批量。
- Control Plane Manager (`manager.py`) 还可以启用 Autoscaler/SLA 监控。

### Embedding 服务 (sage_embedding)

多种 Embedding 方法的统一接口：

```python
from sage.common.components.sage_embedding import (
    EmbeddingFactory,
    EmbeddingClientAdapter,
)

# EmbeddingFactory 返回单文本接口 → 通过 Adapter 获得批量 embed(list[str])
raw_embedder = EmbeddingFactory.create("hf", model="BAAI/bge-small-zh-v1.5")
client = EmbeddingClientAdapter(raw_embedder)
vectors = client.embed(["Hello", "World"])

# 直接消费 BaseEmbedding 时需逐条调用：raw_embedder.embed("only-one-text")
```

**支持的方法**: `hash`, `hf`, `openai`, `jina`, `zhipu`, `cohere`, `ollama`, `siliconcloud`, `bedrock`, `nvidia_openai`

### 端口配置 (SagePorts)

统一的端口管理，避免硬编码：

```python
from sage.common.config.ports import SagePorts

# 统一端口常量（不要硬编码）
PORT_MAP = {
    "Gateway": (SagePorts.GATEWAY_DEFAULT, "OpenAI 兼容 API"),
    "LLM": (SagePorts.LLM_DEFAULT, "主推理服务"),
    "Embedding": (SagePorts.EMBEDDING_DEFAULT, "Embedding Server"),
    "Benchmark": (SagePorts.BENCHMARK_LLM, "WSL2 fallback / benchmark"),
}

recommended = SagePorts.get_recommended_llm_port()
print(f"LLM 在此机器使用端口: {recommended}")

if SagePorts.is_wsl():
    # 8001 在 WSL2 可能出现监听但拒绝连接 → 回退 8901
    recommended = SagePorts.LLM_WSL_FALLBACK
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
┌────────────────────────────────────────────────────────────────────────────┐
│                           UnifiedInferenceClient                            │
│ create() / create(embedded=True) / create(control_plane_url=...)             │
├──────────────────────────────┬──────────────────────────────────────────────┤
│  RequestClassifier           │  分类: LLM_CHAT / LLM_GENERATE / EMBEDDING    │
├──────────────────────────────┼──────────────────────────────────────────────┤
│  HybridSchedulingPolicy      │  批量 Embedding + SLO_Aware/FIFO/Fair 选路    │
├───────────────────────┬──────┴──────────────┬──────────────────────────────┤
│ ExecutionCoordinator  │ EmbeddingExecutor  │ Metrics/Autoscaler/PD Routing │
├───────────────────────┴────────────────────┴──────────────────────────────┤
│             vLLM / TEI / Embedding instances (SagePorts.*)                  │
└────────────────────────────────────────────────────────────────────────────┘
```

- `control_plane/manager.py`：路由 + 负载均衡 + Autoscaler
- `strategies/hybrid_policy.py`：LLM/Embedding 混合批调度
- `executors/http_client.py` & `embedding_executor.py`：对接 OpenAI 兼容后端
- `metrics_collector.py`：SLA/P95 监控，可驱动 `SLOAwarePolicy`

## Usage Examples

### 统一推理客户端

```python
from sage.common.components.sage_llm import UnifiedInferenceClient
from sage.common.config.ports import SagePorts

# 推荐：自动检测（Control Plane First）
client = UnifiedInferenceClient.create()

# 显式连接本地 Gateway（如 UnifiedAPIServer）
gateway = UnifiedInferenceClient.create(control_plane_url=f"http://localhost:{SagePorts.GATEWAY_DEFAULT}/v1")

# 内嵌模式适合批处理脚本
embedded = UnifiedInferenceClient.create(embedded=True)

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

for method, info in list_embedding_models().items():
    print(f"{method}: {info['description']}")

embedder = EmbeddingFactory.create("hash", dim=384)
client = EmbeddingClientAdapter(embedder)  # 获得批量接口
vectors = client.embed(["Hello", "World"])
single_vector = embedder.embed("single-text")  # 仍可按需单条调用

# 离线模式：配合 UnifiedInferenceClient 只负责 embedding，LLM 仍可走 Control Plane
```

### 环境变量示例

Control Plane 自动探测优先读取 `SAGE_*` 前缀，随后才会尝试本地端口与云 API：

```bash
# .env（示例，数值来自 SagePorts 常量）
SAGE_CHAT_BASE_URL=http://localhost:8901/v1   # SagePorts.get_recommended_llm_port()
SAGE_CHAT_MODEL=Qwen/Qwen2.5-7B-Instruct
SAGE_CHAT_API_KEY=token-optional
SAGE_EMBEDDING_BASE_URL=http://localhost:8090/v1  # SagePorts.EMBEDDING_DEFAULT
SAGE_EMBEDDING_MODEL=BAAI/bge-m3
HF_TOKEN=hf_xxx
# detect_china_mainland() 会在 CLI 中自动调用 ensure_hf_mirror_configured()
# 如果在中国大陆，可提前设置：
HF_ENDPOINT=https://hf-mirror.com
```

> CLI 入口如 `sage llm serve` 和 `sage llm model download` 均会调用
> `sage.common.config.network.ensure_hf_mirror_configured()`，自动根据
> `detect_china_mainland()` 调整 `HF_ENDPOINT`。

### 端口 & WSL2 指南

```python
from sage.common.config.ports import SagePorts

if SagePorts.is_wsl():
    llm_port = SagePorts.LLM_WSL_FALLBACK  # 8901
else:
    llm_port = SagePorts.LLM_DEFAULT       # 8001

print("启动命令:", f"sage llm serve --port {llm_port} --embedding-port {SagePorts.EMBEDDING_DEFAULT}")
```

- `SagePorts.get_llm_ports()` 返回按优先级排列的端口列表，`UnifiedInferenceClient.create()` 会依次探测。
- `SagePorts.is_available(port)` 可在脚本内检测端口是否被占用。
- `sage llm serve --port <LLM_PORT> --embedding-port <EMBED_PORT>` 会自动写入 `.sage/llm/daemon.json`，供 CLI 与 Control Plane 共享。

### 服务启动示例

```bash
# recommended: 通过 CLI 在 SagePorts 上启动服务栈
sage llm serve \
  --model Qwen/Qwen2.5-7B-Instruct \
  --embedding-model BAAI/bge-m3 \
  --port $(python -c "from sage.common.config.ports import SagePorts; print(SagePorts.get_recommended_llm_port())") \
    --embedding-port 8090  # SagePorts.EMBEDDING_DEFAULT

# 无需 Embedding 时：
sage llm serve --no-embedding

# 查看状态/日志
sage llm status && sage llm logs --tail 100
```

## Dependencies

- **External**: `openai`, `httpx`, `torch` (optional for HF models)
- **Internal**: None (foundation layer)

## Environment Variables

参考 `.env.template`：

```bash
# Chat / LLM 回退
SAGE_CHAT_API_KEY=sk-dashscope-or-openai
SAGE_CHAT_MODEL=qwen-turbo-2025-02-11
SAGE_CHAT_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# Embedding 回退
SAGE_EMBEDDING_BASE_URL=http://localhost:8090/v1  # SagePorts.EMBEDDING_DEFAULT
SAGE_EMBEDDING_MODEL=BAAI/bge-m3

# 本地端口（CLI 会写入）
SAGE_LLM_PORT=8001    # SagePorts.LLM_DEFAULT（WSL2 可改为 8901）
SAGE_EMBEDDING_PORT=8090

# HF 下载
HF_TOKEN=hf_xxx
# CLI 入口会调用 ensure_hf_mirror_configured() 自动判断是否需要 HF_ENDPOINT
```

## See Also

- [Embedding 模块](../sage-libs/embedding.md) - 详细的 Embedding 用法
- [部署指南](../../deployment/index.md) - LLM/Embedding 服务部署
- [Architecture Overview](../../../concepts/architecture/overview.md)
- [Package Structure](../../../concepts/architecture/package-structure.md)

> 网络/镜像：参见 `sage.common.config.network` 中的 `detect_china_mainland()`、`ensure_hf_mirror_configured()`。
