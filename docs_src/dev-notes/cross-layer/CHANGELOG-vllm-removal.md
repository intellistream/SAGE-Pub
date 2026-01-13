# vLLM Removal - Breaking Change v0.3.0

**Date**: 2025-01-XX  
**Type**: Breaking Change  
**Affects**: sage-middleware, sage-common, sage-cli

## Summary

vLLM support has been completely removed from SAGE in v0.3.0. All LLM inference is now handled through **sagellm-backend**, which provides a unified interface for multiple hardware backends (CUDA, Ascend, DCU, etc.).

## Breaking Changes

### Removed Modules

| Module | Location | Replacement |
|--------|----------|-------------|
| `VLLMGenerator` | `sage.middleware.operators.llm` | `SageLLMGenerator` |
| `VLLMEmbedding` | `sage.middleware.operators.llm` | `SageLLMGenerator` + EmbeddingEngine |
| `vllm_registry` | `sage.common.model_registry` | `sagellm_registry` |

### Removed CLI Options

- `--vllm` flag removed from `sage pipeline create`
- `--engine vllm` removed from embedding pipeline options
- `--prefer vllm` replaced with `--prefer sagellm` in `sage llm config auto`

### Code Migration Guide

#### Before (v0.2.x)
```python
# Using VLLMGenerator
from sage.middleware.operators.llm import VLLMGenerator
gen = VLLMGenerator(service_name="vllm_service")
result = gen.execute(prompt)

# Using vllm registry
from sage.common.model_registry import vllm_registry
path = vllm_registry.get_model_path("model-id")
```

#### After (v0.3.0)
```python
# Using SageLLMGenerator with CUDA backend
from sage.middleware.operators.llm import SageLLMGenerator
gen = SageLLMGenerator(
    backend_type="cuda",  # or "auto", "mock", "ascend"
    model_path="Qwen/Qwen2.5-7B-Instruct",
)
result = gen.execute(prompt)

# Using sagellm registry
from sage.common.model_registry import sagellm_registry
path = sagellm_registry.get_model_path("model-id")
```

### Configuration Migration

#### Before (v0.2.x)
```yaml
# config.yaml
generator:
  vllm:
    method: openai
    base_url: http://localhost:8000/v1
    model_name: Qwen2.5-7B-Instruct
```

#### After (v0.3.0)
```yaml
# config.yaml
generator:
  sagellm:
    backend_type: cuda
    model_path: Qwen/Qwen2.5-7B-Instruct
    max_tokens: 2048
```

## Rationale

1. **Unified Backend Abstraction**: sagellm-backend provides a clean abstraction layer that supports multiple hardware vendors (NVIDIA, Huawei Ascend, AMD DCU, etc.)

2. **Simplified Dependency**: Removes heavy vLLM dependency (~2GB+), making SAGE more lightweight

3. **Hardware Vendor Responsibility**: Hardware-specific provider implementations should be maintained by vendors, not SAGE core

4. **Better Testing**: Mock backend enables GPU-free testing in CI/CD

## Migration Checklist

- [ ] Replace `VLLMGenerator` imports with `SageLLMGenerator`
- [ ] Update config files from `vllm` section to `sagellm` section
- [ ] Update CLI scripts using `--vllm` or `--engine vllm` flags
- [ ] Install sagellm-backend: `pip install sagellm-backend` (or from source)
- [ ] Test with mock backend first: `backend_type="mock"`

## Related Documentation

- [SageLLM Architecture](../l4-middleware/sagellm-architecture.md)
- [Backend Provider Guide](../l4-middleware/backend-providers.md)
- [sagellm-backend Repository](https://github.com/intellistream/sagellm-backend)
