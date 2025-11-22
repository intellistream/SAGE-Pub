# sage-common API

Common utilities, data types, and base classes used across all SAGE packages.

**Layer**: L1 (Foundation)

## Overview

`sage-common` provides foundational components that all other SAGE packages depend on:

- Core data types and type system
- Configuration management
- Logging utilities
- Base exceptions
- Common decorators and utilities
- Model registry and embedding services

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

### Components

#### Embedding Services

::: sage.common.components.sage_embedding
    options:
      show_root_heading: true
      show_source: false
      members:
        - EmbeddingService
        - EmbeddingFactory
        - OpenAIEmbedding
        - HuggingFaceEmbedding

#### vLLM Integration

::: sage.common.components.sage_llm
    options:
      show_root_heading: true
      show_source: false
      members:
        - VLLMService
        - VLLMClient

### Configuration

#### Output Paths

::: sage.common.config.output_paths
    options:
      show_root_heading: true
      show_source: false
      members:
        - OutputPaths
        - get_output_dir
        - ensure_output_dir

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
