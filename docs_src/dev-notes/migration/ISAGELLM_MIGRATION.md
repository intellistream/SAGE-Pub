# Migration Guide: sage-llm-core/gateway → isagellm

> **Date**: 2026-01-12
> **Status**: In Progress
> **Target**: isagellm v0.1.0

## Overview

`sage-llm-core` (Control Plane & Unified Client) and `sage-llm-gateway` (OpenAI-compatible API Gateway) are being migrated to the standalone **isagellm** inference engine.

This allows:
1. **Independent development** of the LLM inference engine
2. **Cleaner dependency management** for SAGE
3. **Broader adoption** via `pip install isagellm`

## Migration Timeline

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Current | Deprecation warnings added; both paths work |
| Phase 2 | 🚧 In Progress | isagellm provides equivalent functionality |
| Phase 3 | ⏳ Pending | sage-llm-core/gateway archived; SAGE uses isagellm |

## For SAGE Users

### Before Migration (Current)

```python
# Control Plane
from sage.llm import UnifiedInferenceClient
from sage.llm.control_plane.manager import ControlPlaneManager

# Gateway
from sage.llm.gateway.server import create_app
```

### After Migration (Future)

```python
# Control Plane
from sagellm import UnifiedInferenceClient
from sagellm_control_plane.manager import ControlPlaneManager

# Gateway
from sagellm_gateway.server import create_app
```

### Package Installation

**Before:**
```bash
pip install isage                      # Includes isage-llm-core
pip install isage-llm-gateway          # Separate gateway package
```

**After:**
```bash
pip install isagellm                   # Core engine + control plane
pip install isagellm[gateway]          # With gateway support
```

## For SAGE Developers

### Current Architecture

```
SAGE/packages/
├── sage-llm-core/        # ❌ DEPRECATED
│   └── src/sage/llm/
│       ├── control_plane/
│       ├── engines/
│       └── unified_client.py
└── sage-llm-gateway/     # ❌ DEPRECATED
    └── src/sage/llm/gateway/
```

### Target Architecture

```
# External package (pip install isagellm)
isagellm/
├── sagellm_protocol/     # Protocol definitions
├── sagellm_backend/      # Backend abstraction
├── sagellm_core/         # Engine core
├── sagellm_control_plane/ # Control plane (migrated)
├── sagellm_gateway/      # Gateway (migrated)
└── sagellm/              # Umbrella CLI

# SAGE (consumes isagellm)
SAGE/packages/
├── sage/                 # Uses: pip install isagellm
└── sage-cli/             # Uses: from sagellm import ...
```

## Migration Checklist

### Phase 1: Deprecation (Current)

- [x] Add `_deprecation.py` to sage-llm-core
- [x] Add `_deprecation.py` to sage-llm-gateway
- [x] Update pyproject.toml with migration notices
- [x] Create this migration document

### Phase 2: isagellm Implementation

- [ ] Migrate Control Plane to sagellm-control-plane repo
- [ ] Migrate Gateway to sagellm-gateway repo
- [ ] Update isagellm umbrella dependencies
- [ ] Verify mock mode works

### Phase 3: SAGE Cleanup

- [ ] Replace `isage-llm-core` dependency with `isagellm`
- [ ] Replace `isage-llm-gateway` dependency with `isagellm[gateway]`
- [ ] Update all imports in sage-cli
- [ ] Update all imports in sage-common tests
- [ ] Remove sage-llm-core directory
- [ ] Remove sage-llm-gateway directory
- [ ] Update architecture checker

## Breaking Changes

| Old | New | Notes |
|-----|-----|-------|
| `sage.llm.*` | `sagellm.*` | Namespace change |
| `sage.llm.control_plane.*` | `sagellm_control_plane.*` | Module restructure |
| `sage.llm.gateway.*` | `sagellm_gateway.*` | Module restructure |
| `isage-llm-core` | `isagellm` | Package rename |
| `isage-llm-gateway` | `isagellm[gateway]` | Merged as extra |

## References

- isagellm repository: https://github.com/intellistream/sagellm-docs/repos/
- Protocol specification: `docs/internal/protocol_v0.1.md`
- Task 0.12 prompt: `docs/internal/prompts/task0_12_*.md`
