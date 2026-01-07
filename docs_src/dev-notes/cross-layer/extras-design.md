# Package Extras Design (Simplified Scheme)

**Status**: Active (2026-01-08)  
**Type**: Architecture Decision  
**Scope**: All SAGE packages

## Overview

SAGE packages use a **simplified extras scheme** with 2-5 clear options per package. This design prioritizes **user experience** over feature granularity, making installation intuitive without requiring documentation.

## Design Principles

1. **Cognitive simplicity**: ≤5 extras per package, typically 2-3
2. **Intuitive naming**: Users can guess meaning without docs
3. **Role-based**: Organized by user role (dev), hardware (gpu/cpu), or feature (vdb)
4. **Maintainable**: Fewer extras = easier version management
5. **No backward compatibility**: Clean break from legacy extras

## Standard Extras

### Core Extras (All Packages)

| Extra | Purpose | Typical Contents |
|-------|---------|------------------|
| `dev` | Development dependencies | `pytest`, `ruff`, `mypy`, `pre-commit` |
| `all` | All optional features | Package-specific aggregation |

### Hardware-Specific (LLM/Compute Packages)

| Extra | Purpose | Packages |
|-------|---------|----------|
| `gpu` | GPU acceleration | `sage-llm-core`, `sage-kernel` |
| `cpu` | CPU-only inference | `sage-llm-core`, `sage-kernel` |

### Feature-Specific (Middleware/Component Packages)

| Extra | Purpose | Packages |
|-------|---------|----------|
| `vdb` | SageVDB vector database | `sage-middleware` |
| `neuromem` | NeuroMem memory system | `sage-middleware` |
| `embedding` | Embedding service | `sage-common` |

## Per-Package Extras

### L1: Foundation

#### `sage-common`
```bash
pip install isage-common[dev]        # Development
pip install isage-common[embedding]  # Embedding service
pip install isage-common[all]        # All features
```

#### `sage-llm-core`
```bash
pip install isage-llm-core[dev]  # Development
pip install isage-llm-core[gpu]  # GPU inference (vLLM + torch CUDA)
pip install isage-llm-core[cpu]  # CPU inference
pip install isage-llm-core[all]  # All features (includes GPU)
```

### L2: Platform

#### `sage-platform`
```bash
pip install isage-platform[dev]  # Development
pip install isage-platform[all]  # All features (no heavy deps)
```

### L3: Kernel & Libs

#### `sage-kernel`
```bash
pip install isage-kernel[dev]  # Development
pip install isage-kernel[gpu]  # GPU acceleration
pip install isage-kernel[cpu]  # CPU-only
pip install isage-kernel[all]  # All features
```

#### `sage-libs`
```bash
pip install isage-libs[dev]  # Development
pip install isage-libs[all]  # All features
```

### L4: Middleware

#### `sage-middleware`
```bash
pip install isage-middleware[dev]      # Development
pip install isage-middleware[vdb]      # SageVDB support
pip install isage-middleware[neuromem] # NeuroMem support
pip install isage-middleware[all]      # All middleware features
```

### L6: Interfaces & Gateways

#### `sage-llm-gateway`
```bash
pip install isage-llm-gateway[dev]  # Development
pip install isage-llm-gateway[all]  # Production features (redis, monitoring)
```

#### `sage-edge`
```bash
pip install isage-edge[dev]  # Development
pip install isage-edge[all]  # All features (simple aggregator)
```

#### `sage-cli`
```bash
pip install isage-cli[dev]  # Development
pip install isage-cli[all]  # All features
```

#### `sage-studio`
```bash
pip install isage-studio[dev]  # Development
pip install isage-studio[all]  # All features
```

#### `sage-tools`
```bash
pip install isage-tools[dev]  # Development
pip install isage-tools[all]  # All features
```

### Meta Package

#### `sage`
```bash
pip install isage[dev]  # Full development stack
pip install isage[all]  # All SAGE packages
```

## Common Use Cases

| Scenario | Command | Description |
|----------|---------|-------------|
| **Minimal deployment** | `pip install isage-llm-core` | Only required dependencies |
| **Local development** | `pip install -e .[dev]` | Includes lint/test tools |
| **GPU inference** | `pip install isage-llm-core[gpu]` | Auto-installs vLLM + CUDA torch |
| **CPU inference** | `pip install isage-llm-core[cpu]` | CPU-only torch |
| **Full features** | `pip install isage-llm-core[all]` | All optional features |
| **CI testing** | `pip install -e .[dev]` | Dev extras include test deps |
| **Production gateway** | `pip install isage-llm-gateway[all]` | Redis + monitoring |

## Migration from Legacy Extras

**Breaking Change**: No backward compatibility. Update your installation commands:

| Old Extra | New Extra | Package |
|-----------|-----------|---------|
| `vllm` | `gpu` | `sage-llm-core` |
| `vllm-minimal` | `cpu` | `sage-llm-core` |
| `full` | `all` | `sage` (meta) |
| `standard` | `all` | `sage` (meta) |
| `core` | `all` | `sage` (meta) |
| `minimal` | *(default)* | `sage` (meta) |
| `sage-deps` | *(removed)* | All packages |
| `database` | *(removed)* | `sage-middleware` |
| `messagequeue` | *(removed)* | `sage-middleware` |
| `monitoring` | `all` | `sage-llm-gateway` |
| `llm` | *(removed)* | `sage-middleware` |
| `docs` | *(removed)* | All packages |

## Version Management

All extras dependencies **must** reference versions from `dependencies-spec.yaml`:

```toml
# ✅ Correct: Use version ranges from spec
[project.optional-dependencies]
dev = [
    "ruff==0.14.6",           # Exact version (pinned in spec)
    "pytest>=7.4.0",          # Minimum version (coordinated)
    "torch>=2.7.0,<3.0.0",    # Range (coordinated)
]

# ❌ Wrong: Arbitrary versions
dev = [
    "ruff>=0.1.0",  # Don't invent versions
]
```

Check consistency:
```bash
python tools/scripts/check_dependency_consistency.py
```

## CI Validation

GitHub Actions workflows test key extras combinations:

```yaml
- name: Test extras installation
  run: |
    pip install -e packages/sage-llm-core[dev]
    pip install -e packages/sage-llm-core[gpu]
    pip install -e packages/sage-middleware[vdb]
    pytest packages/*/tests/unit/ --quick
```

## Implementation

Migration script: `tools/scripts/migrate_extras.py`

```bash
# View what changed
git show 814e36f8 --stat

# Revert if needed (not recommended)
git revert 814e36f8
```

## Rationale

### Why Simplify?

**Problem**: Old scheme had 11+ extras per package (minimal, core, standard, full, vllm, vllm-minimal, sage-deps, database, messagequeue, monitoring, llm, docs, etc.)

**Issues**:
- Users confused about which extras to install
- Maintenance burden (version conflicts across many extras)
- Documentation lag (extras changed faster than docs)
- Circular dependency issues with `sage-deps`

**Solution**: Reduce to 2-5 clear options based on:
- **Role**: `dev` (developer) vs default (user)
- **Hardware**: `gpu` vs `cpu` (explicit choice)
- **Features**: `vdb`, `neuromem`, `embedding` (domain-specific)
- **Aggregation**: `all` (convenience)

### Why No Backward Compatibility?

1. **Clean architecture**: Remove technical debt from old design
2. **Clear migration path**: Users must consciously update (no silent failures)
3. **Faster adoption**: No dual-maintenance period
4. **Project stage**: SAGE is pre-1.0, breaking changes acceptable

## Future Considerations

### When to Add New Extras?

Only add extras if:
1. **Optional dependency** ≥50MB or requires system libs (e.g., CUDA)
2. **Clear user choice** (gpu vs cpu, not "feature A" vs "feature B")
3. **Stays under 5 extras** per package

### When NOT to Add Extras?

Don't add extras for:
- Small Python packages (<10MB)
- Internal dependencies (use `dependencies`)
- Feature flags (use config, not install-time choice)
- Every new feature (maintain simplicity)

## Related Documentation

- Installation guide: `docs-public/docs_src/getting-started/installation.md`
- Dependency management: `docs-public/docs_src/dev-notes/cross-layer/vllm-dependency-management.md`
- Package architecture: `docs-public/docs_src/dev-notes/package-architecture.md`
- PyPI publishing: See `.github/copilot-instructions.md` → PyPI Publishing

## Changelog

- **2026-01-08**: Initial simplified extras scheme (commit `814e36f8`)
- **2025-xx-xx**: Legacy extras (11+ per package, complex hierarchy)
