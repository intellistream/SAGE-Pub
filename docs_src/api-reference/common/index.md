# sage-common API

Common utilities, data types, and base classes used across all SAGE packages.

**Layer**: L1 (Foundation)

## Overview

`sage-common` provides foundational components that all other SAGE packages depend on:

- Core data types and type system
- Configuration management (including **SagePorts** for unified port configuration)
- Logging utilities
- Base exceptions
- Common decorators and utilities
- **UnifiedInferenceClient** - Unified LLM + Embedding client (NEW)
- **EmbeddingFactory** and adapters for embedding services
- Model registry and vLLM integration

## Quick Start: UnifiedInferenceClient

The recommended way to interact with LLM and Embedding services:

```python
from sage.common.components.sage_llm import UnifiedInferenceClient

# Auto-detect available services (Simple mode)
client = UnifiedInferenceClient.create_auto()

# Or use Control Plane mode for production (recommended)
client = UnifiedInferenceClient.create_with_control_plane(
    llm_base_url="http://localhost:8901/v1",
    llm_model="Qwen/Qwen2.5-7B-Instruct",
    embedding_base_url="http://localhost:8090/v1",
    embedding_model="BAAI/bge-m3",
)

# Chat completion
response = client.chat([{"role": "user", "content": "Hello"}])

# Text generation
text = client.generate("Once upon a time")

# Embedding
vectors = client.embed(["text1", "text2"])
```

## Modules

### Core Types and Exceptions

#### Data Types

::: sage.common.core.data_types
    options:
      show_root_heading: true
      show_source: false
      members:
        - Message
        - Record
        - Batch

#### Type System

::: sage.common.core.types
    options:
      show_root_heading: true
      show_source: false

#### Exceptions

::: sage.common.core.exceptions
    options:
      show_root_heading: true
      show_source: false
      members:
        - SAGEException
        - ConfigurationError
        - ValidationError
        - ServiceError

#### Constants

::: sage.common.core.constants
    options:
      show_root_heading: true
      show_source: false

### Configuration

#### Port Configuration (SagePorts) ⭐ NEW

::: sage.common.config.ports
    options:
      show_root_heading: true
      show_source: false
      members:
        - SagePorts
        - is_wsl

Centralized port configuration to avoid conflicts:

```python
from sage.common.config.ports import SagePorts

# Standard port allocation
SagePorts.GATEWAY_DEFAULT      # 8000 - sage-gateway (OpenAI-compatible API)
SagePorts.LLM_DEFAULT          # 8001 - vLLM inference service
SagePorts.STUDIO_BACKEND       # 8080 - sage-studio backend
SagePorts.STUDIO_FRONTEND      # 5173 - sage-studio frontend (Vite)
SagePorts.EMBEDDING_DEFAULT    # 8090 - Embedding service
SagePorts.BENCHMARK_LLM        # 8901 - Benchmark LLM (WSL2 fallback)

# Auto-detect for WSL2 compatibility
port = SagePorts.get_recommended_llm_port()

# Check port availability
if SagePorts.is_available(8001):
    # Port is free
    pass
```

#### Output Paths

::: sage.common.config.output_paths
    options:
      show_root_heading: true
      show_source: false
      members:
        - OutputPaths
        - get_output_dir
        - ensure_output_dir

### Components

#### UnifiedInferenceClient ⭐ NEW (Recommended)

::: sage.common.components.sage_llm.unified_client
    options:
      show_root_heading: true
      show_source: false
      members:
        - UnifiedInferenceClient
        - UnifiedClient
        - UnifiedClientConfig
        - UnifiedClientMode
        - InferenceResult

The **UnifiedInferenceClient** provides a single interface for both LLM and Embedding:

| Mode | Description | Use Case |
|------|-------------|----------|
| `Simple` | Direct backend connection | Development, testing |
| `ControlPlane` | Intelligent routing & load balancing | Production |

**Two Creation Methods:**

```python
from sage.common.components.sage_llm import UnifiedInferenceClient

# Method 1: Auto-detect (Simple mode)
client = UnifiedInferenceClient.create_auto()

# Method 2: Control Plane mode (recommended for production)
client = UnifiedInferenceClient.create_with_control_plane(
    llm_base_url="http://localhost:8901/v1",
    llm_model="Qwen/Qwen2.5-7B-Instruct",
    embedding_base_url="http://localhost:8090/v1",
    embedding_model="BAAI/bge-m3",
)
```

**API Methods:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `chat()` | `chat(messages, model=None, **kwargs)` | Chat completion |
| `generate()` | `generate(prompt, model=None, **kwargs)` | Text generation |
| `embed()` | `embed(texts, model=None)` | Batch embedding |

#### IntelligentLLMClient

::: sage.common.components.sage_llm.client
    options:
      show_root_heading: true
      show_source: false
      members:
        - IntelligentLLMClient
        - check_llm_service
        - get_llm_client

#### vLLM Service

::: sage.common.components.sage_llm.service
    options:
      show_root_heading: true
      show_source: false
      members:
        - VLLMService
        - VLLMServiceConfig

#### Control Plane Service

::: sage.common.components.sage_llm.control_plane_service
    options:
      show_root_heading: true
      show_source: false
      members:
        - ControlPlaneVLLMService
        - ControlPlaneVLLMServiceConfig

#### Unified API Server

::: sage.common.components.sage_llm.unified_api_server
    options:
      show_root_heading: true
      show_source: false
      members:
        - UnifiedAPIServer
        - UnifiedServerConfig
        - BackendInstanceConfig
        - SchedulingPolicyType
        - create_unified_server

#### Compatibility Adapters ⭐ NEW

::: sage.common.components.sage_llm.compat
    options:
      show_root_heading: true
      show_source: false
      members:
        - LLMClientAdapter
        - EmbeddingClientAdapter
        - create_llm_client_compat
        - create_embedding_client_compat

Adapters for integrating with legacy code:

```python
from sage.common.components.sage_llm import (
    EmbeddingClientAdapter,
    create_embedding_client_compat
)

# Wrap an existing embedding implementation
adapted = EmbeddingClientAdapter(existing_embedder)
vectors = adapted.embed(["text1", "text2"])  # Batch interface
```

#### Embedding Services

::: sage.common.components.sage_embedding
    options:
      show_root_heading: true
      show_source: false
      members:
        - EmbeddingFactory
        - EmbeddingService
        - EmbeddingServiceConfig
        - BaseEmbedding
        - EmbeddingRegistry
        - EmbeddingProtocol
        - EmbeddingClientAdapter
        - get_embedding_model
        - list_embedding_models
        - check_model_availability

**Supported Embedding Providers:**

| Provider | Method | Description |
|----------|--------|-------------|
| HuggingFace | `hf` | Local models (BGE, MiniLM, etc.) |
| OpenAI | `openai` | text-embedding-3-small/large |
| Jina | `jina` | Multilingual, late chunking |
| Zhipu | `zhipu` | Chinese-optimized |
| Cohere | `cohere` | Multilingual |
| Bedrock | `bedrock` | AWS Bedrock |
| Ollama | `ollama` | Local deployment |
| SiliconCloud | `siliconcloud` | China-accessible |
| Hash | `hash` | Lightweight (testing) |
| Mock | `mockembedder` | Unit tests |

```python
from sage.common.components.sage_embedding import (
    EmbeddingFactory, 
    EmbeddingClientAdapter,
    get_embedding_model
)

# Create embedding model
embedder = get_embedding_model("hf", model="BAAI/bge-small-zh-v1.5")
vector = embedder.embed("hello world")  # Single text

# For batch interface, wrap with adapter
adapter = EmbeddingClientAdapter(embedder)
vectors = adapter.embed(["text1", "text2"])  # Batch
```

### Model Registry

::: sage.common.model_registry
    options:
      show_root_heading: true
      show_source: false
      members:
        - ModelRegistry
        - register_model
        - get_model

### Utilities

#### Logging

::: sage.common.utils.logging
    options:
      show_root_heading: true
      show_source: false
      members:
        - setup_logger
        - get_logger
        - LogLevel

#### Serialization

::: sage.common.utils.serialization
    options:
      show_root_heading: true
      show_source: false
      members:
        - serialize
        - deserialize
        - to_json
        - from_json

#### System Utilities

::: sage.common.utils.system
    options:
      show_root_heading: true
      show_source: false
      members:
        - get_cpu_count
        - get_memory_info
        - check_gpu_available

#### Network Utilities

::: sage.common.utils.network
    options:
      show_root_heading: true
      show_source: false
      members:
        - get_free_port
        - check_port_available
        - get_local_ip

## Quick Examples

### Using Core Data Types

```python
from sage.common.core.data_types import Message, Record

# Create a message
msg = Message(
    key="user123",
    value={"text": "Hello, world!"},
    timestamp=1234567890
)

# Create a record
record = Record(data="sample data", metadata={"source": "api"})
```

### Using Embedding Service

```python
from sage.common.components.sage_embedding import EmbeddingFactory

# Create OpenAI embedding service
embedding = EmbeddingFactory.create_embedding(
    provider="openai",
    model_name="text-embedding-3-small"
)

# Encode text
vector = embedding.encode("Hello, world!")
print(f"Embedding dimension: {len(vector)}")

# Batch encode
texts = ["text1", "text2", "text3"]
vectors = embedding.encode_batch(texts)
```

### Using vLLM Service

```python
from sage.common.components.sage_llm import VLLMService

# Initialize vLLM service
vllm = VLLMService(
    model_name="meta-llama/Llama-2-7b-chat-hf",
    base_url="http://localhost:8000"
)

# Generate text
response = vllm.generate(
    prompt="What is SAGE?",
    max_tokens=100,
    temperature=0.7
)
print(response)
```

### Configuration Management

```python
from sage.common.config.output_paths import OutputPaths, ensure_output_dir

# Get output directory
output_dir = OutputPaths.get_output_dir("my_app")

# Ensure directory exists
data_dir = ensure_output_dir("my_app/data")

# Use in your code
output_file = output_dir / "results.json"
```

### Logging

```python
from sage.common.utils.logging import setup_logger, get_logger

# Setup logger
setup_logger(level="INFO", log_file="app.log")

# Get logger
logger = get_logger(__name__)

# Use logger
logger.info("Application started")
logger.warning("This is a warning")
logger.error("An error occurred")
```

### Serialization

```python
from sage.common.utils.serialization import to_json, from_json

# Serialize to JSON
data = {"name": "SAGE", "version": "1.0.0"}
json_str = to_json(data)

# Deserialize from JSON
loaded_data = from_json(json_str)
```

### System Utilities

```python
from sage.common.utils.system import (
    get_cpu_count,
    get_memory_info,
    check_gpu_available
)

# Get system info
cpu_count = get_cpu_count()
memory_info = get_memory_info()
has_gpu = check_gpu_available()

print(f"CPUs: {cpu_count}")
print(f"Memory: {memory_info['total'] / 1024**3:.2f} GB")
print(f"GPU available: {has_gpu}")
```

### Network Utilities

```python
from sage.common.utils.network import get_free_port, get_local_ip

# Get a free port
port = get_free_port()
print(f"Free port: {port}")

# Get local IP
ip = get_local_ip()
print(f"Local IP: {ip}")
```

### Exception Handling

```python
from sage.common.core.exceptions import (
    SAGEException,
    ConfigurationError,
    ValidationError
)

try:
    # Your code here
    if not config_valid:
        raise ConfigurationError("Invalid configuration")
except SAGEException as e:
    logger.error(f"SAGE error: {e}")
```

## Module Organization

```
sage.common/
├── core/                    # Core types and exceptions
│   ├── data_types.py       # Message, Record, Batch
│   ├── types.py            # Type definitions
│   ├── exceptions.py       # Exception classes
│   └── constants.py        # Constants
├── components/              # Reusable components
│   ├── sage_embedding.py   # Embedding services
│   └── sage_llm.py        # vLLM integration
├── config/                  # Configuration
│   └── output_paths.py     # Output path management
├── model_registry/          # Model registry
│   └── ...                 # Model management
└── utils/                   # Utilities
    ├── logging/            # Logging utilities
    ├── serialization/      # Serialization utils
    ├── system/             # System utilities
    └── network/            # Network utilities
```

## Architecture Notes

**Layer**: L1 (Foundation)

**Can be imported by**: L2-L6 (all upper layers)

**Must NOT import from**: sage.kernel, sage.middleware, sage.libs, sage.apps

**Dependencies**: Only standard library and external packages (e.g., openai, transformers)

## See Also

- [Package Architecture](../../dev-notes/package-architecture.md)
- [Common Utilities Guide](../../guides/packages/sage-common/overview.md)
- [L1 Layer Overview](../../guides/index.md#l1-基础设施层)
