# Migration Guide: vLLM → sageLLM

> **Date**: 2026-01-13
> **Status**: Active
> **Applies to**: SAGE v0.3.0+

## Overview

SAGE is migrating from `vLLM` (via `VLLMGenerator`) to **sageLLM** (via `SageLLMGenerator`) as the default LLM inference engine. This migration provides:

1. **Unified Backend Abstraction** - Single API for multiple hardware backends (CUDA, Ascend, CPU)
2. **Simplified Configuration** - Consistent parameters across all backends
3. **Better Testing Support** - Built-in mock backend for unit tests
4. **Hardware Portability** - Seamless deployment across different accelerators

## Migration Timeline

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | `SageLLMGenerator` available, vLLM still default |
| Phase 2 | 🚧 Current | `sagellm` is default, vLLM deprecated with warnings |
| Phase 3 | ⏳ v0.4.0 | `VLLMGenerator` removed, use sageLLM only |

## Quick Migration

### Before (vLLM)

```python
from sage.middleware.operators.llm import VLLMGenerator

generator = VLLMGenerator(
    model_name="Qwen/Qwen2.5-7B-Instruct",
    base_url="http://localhost:8001/v1",
    temperature=0.7,
    max_tokens=2048,
)

result = generator.execute("写一首诗")
```

### After (sageLLM) ✅ Recommended

```python
from sage.middleware.operators.llm import SageLLMGenerator

generator = SageLLMGenerator(
    model_path="Qwen/Qwen2.5-7B-Instruct",
    backend_type="auto",  # or "cuda", "ascend", "mock"
    temperature=0.7,
    max_tokens=2048,
)

result = generator.execute("写一首诗")
```

## Configuration Parameter Mapping

### Core Parameters

| vLLM (`VLLMGenerator`) | sageLLM (`SageLLMGenerator`) | Notes |
|------------------------|------------------------------|-------|
| `model_name` | `model_path` | HuggingFace model ID or local path |
| `base_url` | *(removed)* | sageLLM manages engine internally |
| `api_key` | *(removed)* | Not needed for local inference |
| `temperature` | `temperature` | Same (default: 0.7) |
| `max_tokens` | `max_tokens` | Same (default: 2048) |
| `top_p` | `top_p` | Same (default: 0.95) |
| *(N/A)* | `top_k` | **New**: top-k sampling (default: 50) |
| *(N/A)* | `backend_type` | **New**: "auto"/"cuda"/"ascend"/"mock" |
| *(N/A)* | `device_map` | **New**: "auto"/"cuda:0"/"cpu" |
| *(N/A)* | `dtype` | **New**: "auto"/"float16"/"bfloat16" |

### New Parameters in sageLLM

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `backend_type` | str | `"auto"` | Engine backend selection |
| `model_path` | str | `""` | Model path or HuggingFace ID |
| `device_map` | str | `"auto"` | Device mapping strategy |
| `dtype` | str | `"auto"` | Data type for inference |
| `max_tokens` | int | `2048` | Maximum generation tokens |
| `temperature` | float | `0.7` | Sampling temperature |
| `top_p` | float | `0.95` | Nucleus sampling parameter |
| `top_k` | int | `50` | Top-k sampling parameter |
| `engine_id` | str | `""` | Custom engine identifier |
| `timeout` | float | `120.0` | Request timeout (seconds) |
| `default_options` | dict | `{}` | Default generation options |

### `backend_type` Values

| Value | Description | Use Case |
|-------|-------------|----------|
| `"auto"` | Auto-detect best available backend | **Recommended** for production |
| `"mock"` | Mock backend (no GPU required) | Unit tests, CI/CD |
| `"cuda"` | NVIDIA CUDA backend | NVIDIA GPU deployment |
| `"ascend"` | Huawei Ascend NPU backend | Ascend hardware deployment |

### `engine_type` Values (for Operators)

When configuring operators like `PlanningOperator`, `TimingOperator`, `ToolSelectionOperator`:

| Value | Generator | Status |
|-------|-----------|--------|
| `"sagellm"` | `SageLLMGenerator` | ✅ **Default**, Recommended |
| `"vllm"` | `VLLMGenerator` | ⚠️ **Deprecated** |
| `"openai"` | `OpenAIGenerator` | ✅ For OpenAI-compatible APIs |
| `"hf"` | `HFGenerator` | ✅ For HuggingFace pipelines |

## Migration Examples

### 1. Basic Generator Migration

```python
# ❌ OLD (deprecated)
from sage.middleware.operators.llm import VLLMGenerator

generator = VLLMGenerator(
    model_name="Qwen/Qwen2.5-7B-Instruct",
    base_url="http://localhost:8001/v1",
)

# ✅ NEW (recommended)
from sage.middleware.operators.llm import SageLLMGenerator

generator = SageLLMGenerator(
    model_path="Qwen/Qwen2.5-7B-Instruct",
    backend_type="auto",
)
```

### 2. RAG Pipeline Migration

```python
# ❌ OLD (deprecated)
from sage.middleware.operators.rag import SageLLMRAGGenerator

rag = SageLLMRAGGenerator(engine_type="vllm")

# ✅ NEW (recommended)
from sage.middleware.operators.rag import SageLLMRAGGenerator

rag = SageLLMRAGGenerator(
    engine_type="sagellm",
    backend_type="auto",
)
```

### 3. Agentic Operator Migration

```python
# ❌ OLD (deprecated)
from sage.middleware.operators.agentic import PlanningOperator

op = PlanningOperator(config={
    "engine_type": "vllm",
    "model_name": "Qwen/Qwen2.5-7B-Instruct",
    "base_url": "http://localhost:8001/v1",
})

# ✅ NEW (recommended)
from sage.middleware.operators.agentic import PlanningOperator

op = PlanningOperator(config={
    "engine_type": "sagellm",
    "backend_type": "auto",
    "model_path": "Qwen/Qwen2.5-7B-Instruct",
})
```

### 4. Unit Testing with Mock Backend

```python
# ✅ Use mock backend for tests (no GPU required)
from sage.middleware.operators.llm import SageLLMGenerator

generator = SageLLMGenerator(
    backend_type="mock",
    model_path="mock-model",
)

# Works without actual model or GPU
result = generator.execute("Test prompt")
assert result is not None
```

### 5. CLI Commands Migration

```bash
# ❌ OLD (deprecated)
sage llm model list --engine vllm

# ✅ NEW (recommended)
sage llm model list --engine sagellm
sage llm model list  # sagellm is default
```

## Deprecation Warnings

When using deprecated `vllm` engine, you will see warnings:

```
DeprecationWarning: engine_type='vllm' is deprecated.
Use engine_type='sagellm' with backend_type='cuda' instead.
This will be removed in SAGE v0.4.0.
```

To suppress warnings during migration:

```python
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning, module="sage.middleware")
```

## FAQ

### Q1: Do I need to run a separate vLLM server?

**A**: No. Unlike `VLLMGenerator` which requires an external vLLM server, `SageLLMGenerator` manages the inference engine internally through the EngineFactory. Just specify the model path and backend type.

### Q2: How do I choose the right `backend_type`?

**A**: Use `"auto"` (default) for most cases. It automatically selects the best available backend:

- If NVIDIA GPU is available → uses `cuda`
- If Ascend NPU is available → uses `ascend`
- For testing without hardware → use `"mock"` explicitly

### Q3: Can I still use OpenAI-compatible APIs?

**A**: Yes. For OpenAI-compatible endpoints (including DashScope, local vLLM servers), use `OpenAIGenerator`:

```python
from sage.middleware.operators.rag import OpenAIGenerator

generator = OpenAIGenerator(
    model_name="qwen-turbo",
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    api_key="sk-xxx",
)
```

### Q4: What if I need `VLLMGenerator` features not in sageLLM?

**A**: File an issue on GitHub. Most features should be available through `SageLLMGenerator` with appropriate configuration. For edge cases, `VLLMGenerator` will remain available (with deprecation warnings) until v0.4.0.

### Q5: How do I migrate tests that depend on vLLM?

**A**: Use the mock backend for unit tests:

```python
# Replace any engine_type="vllm" with:
generator = SageLLMGenerator(
    backend_type="mock",
    model_path="test-model",
)
```

This eliminates the need for actual GPU hardware in CI/CD pipelines.

### Q6: Is there a performance difference?

**A**: `SageLLMGenerator` with `backend_type="cuda"` uses the same underlying inference optimizations. For most workloads, performance should be equivalent or better due to improved memory management.

### Q7: How do I handle environment variables?

**A**: Environment variable mapping:

| OLD | NEW | Description |
|-----|-----|-------------|
| `VLLM_MODEL` | `SAGELLM_MODEL_PATH` | Default model path |
| `VLLM_BASE_URL` | *(removed)* | Not needed |
| - | `SAGELLM_BACKEND_TYPE` | Default backend |
| - | `SAGELLM_DEVICE_MAP` | Default device map |

## Troubleshooting

### Error: "No backend available"

```python
RuntimeError: No suitable backend found for SageLLMGenerator
```

**Solution**: Install the required backend or use mock mode:

```bash
# For CUDA
pip install sagellm-backend[cuda]

# Or use mock for testing
generator = SageLLMGenerator(backend_type="mock")
```

### Error: "Model not found"

```python
FileNotFoundError: Model 'xxx' not found
```

**Solution**: Ensure model is downloaded or use a valid HuggingFace ID:

```python
generator = SageLLMGenerator(
    model_path="Qwen/Qwen2.5-7B-Instruct",  # HuggingFace ID
    # OR local path
    model_path="/path/to/local/model",
)
```

### Error: "CUDA out of memory"

**Solution**: Adjust device mapping or use quantization:

```python
generator = SageLLMGenerator(
    model_path="Qwen/Qwen2.5-7B-Instruct",
    dtype="float16",  # Use half precision
    device_map="auto",  # Let it manage GPU memory
)
```

## Related Documentation

- [ISAGELLM Migration](./ISAGELLM_MIGRATION.md) - sage-llm-core/gateway to isagellm migration
- [API Reference: SageLLMGenerator](../../api-reference/middleware/index.md#sagellmgenerator)

## Support

- **GitHub Issues**: [intellistream/SAGE/issues](https://github.com/intellistream/SAGE/issues)
- **Discussions**: [intellistream/SAGE/discussions](https://github.com/intellistream/SAGE/discussions)
