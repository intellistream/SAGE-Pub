# Middleware Component Promotion Policy (No Backward Compatibility)

**Date**: 2026-01-11  
**Status**: ✅ Active (Enforced)  
**Scope**: SAGE monorepo (`packages/*`), especially `sage-libs` and `sage-middleware`

## Why this policy exists

SAGE uses a layered architecture (L1–L6). Historically, the most common architectural failure mode is
**“L3 libs → L4 middleware upward dependency”** when an apparently “library” feature actually needs
runtime backends such as Vector DB, Memory, Refiner, or external services.

This policy declares a hard rule:

> **If it needs upward/runtime/backends, it is not a library. Promote it to `sage-middleware`.**

This is considered the cleanest and most scalable way to keep package boundaries correct.

## Definitions

### `sage-libs` (L3) is for

- Pure algorithms and policies
- Data types and interfaces (ABC/Protocol)
- Code that depends only on:
  - `sage-common` / `sage-platform`
  - Python stdlib
  - lightweight third-party deps
- Code that can be unit-tested without external services

### `sage-middleware` (L4) is for

- Runtime-bound implementations and adapters
- Anything that touches or depends on:
  - Vector stores / indices: **SageVDB** (`isage-vdb`), FAISS, Milvus, etc.
  - Memory backends: **Neuromem** (`isage-neuromem`), Redis, RocksDB, etc.
  - Refiners / compressors (LLMLingua, LongRefiner adapters)
  - External services (HTTP APIs), persistent storage, connection pools
  - Long-running/background workers
- Pipeline-as-a-service style orchestration (operators)

## Hard rules

1. **No upward dependency in source**
   - `packages/sage-libs/src/**` must not import `sage.middleware.*`.
   - Any code requiring `sage.middleware.*` must be moved to `sage-middleware`.

2. **No backward compatibility during refactors**
   - When moving code from `sage-libs` → `sage-middleware`, do **NOT** keep re-export shims.
   - Update all in-repo imports in the same change.
   - Let broken imports fail fast.

3. **Optional dependencies live with middleware**
   - Heavy deps (`isage-vdb`, `isage-neuromem`, `faiss-*`, etc.) must be declared in
     `packages/sage-middleware/pyproject.toml` (usually under optional-dependencies).

## Recommended layout inside `sage-middleware`

To avoid `sage-middleware` becoming a “catch-all”, new code should be grouped by domain:

- `sage/middleware/components/retrieval/`
  - `vector_stores/` (SageVDB/FAISS/Milvus adapters)
  - `retrievers/` (dense/hybrid/graph retrievers)
- `sage/middleware/components/memory/`
  - `neuromem_backend/` (Neuromem adapter)
  - `stores/` (session/long-term stores)
- `sage/middleware/operators/rag/`
  - operator wrappers (config schema + input/output contract)

## Refactor workflow (Prompt Checklist)

Use the following prompt as an **internal task plan** for a large refactor.

### Prompt: "Promote libs code to middleware components (no backward compatibility)"

**Goal**: Move runtime/backend-dependent code from `sage-libs` into `sage-middleware` cleanly.

1. **Discovery**
   - Locate candidates (examples): retrievers touching vector stores, memory adapters, refiner adapters.
   - Identify call sites across packages.

2. **Target placement**
   - Decide final module path under `sage.middleware.components.*` or `sage.middleware.operators.*`.

3. **Move code + fix imports**
   - Move modules.
   - Update all imports across repo.
   - Do NOT add re-export modules.

4. **Dependency updates**
   - Move heavy deps to `sage-middleware` (pyproject).
   - Ensure version ranges follow `dependencies-spec.yaml`.

5. **Tests & docs**
   - Move/adjust tests to match new modules.
   - Update docs references (package architecture, user guides).

6. **Quality gates**
   - Run: formatting/lint/typecheck as applicable.
   - Run: unit tests.
   - Ensure no `sage-libs` imports `sage.middleware`.

## Related docs

- `docs-public/docs_src/dev-notes/package-architecture.md`
- `docs-public/docs_src/dev-notes/l4-middleware/README.md`
