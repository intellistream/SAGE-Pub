# Migration Plan: Promote Upward-Dependent Code from `sage-libs` to `sage-middleware`

**Date**: 2026-01-11  
**Status**: ✅ Complete  
**Core rule**: If it needs upward/runtime backends, it is NOT a lib. Promote to middleware.  
**Compatibility rule**: 🚫 **No backward compatibility** (no re-export shims). Update all call sites.

---

## Progress Summary

| Workstream | Status | Notes |
|------------|--------|-------|
| Agent A (Vector DB) | ✅ Complete | Milvus, Chroma, ChromaAdapter moved to `sage.middleware.components.vector_stores` |
| Agent B (Memory) | ✅ N/A | No issues found - memory backends already in middleware |
| Agent C (Refiner) | ✅ N/A | Context compression already migrated to `isage-refiner` |
| Agent D (Enforcement) | ✅ Complete | Pre-commit hook `libs-middleware-import-check` added |

---

## 0) Scope and success criteria

### Inputs

- Repo: `intellistream/SAGE` (monorepo packages under `packages/`)
- Policy doc: `cross-layer/MIDDLEWARE_COMPONENT_PROMOTION_POLICY.md`

### Success criteria

- No runtime/backend-dependent code remains under `packages/sage-libs/src/**`.
- `packages/sage-libs/src/**` contains only interfaces/types/pure algorithms.
- All repo imports updated to new `sage.middleware.*` locations.
- Test gates: unit tests + quick smoke imports pass.

---

## 1) Workstream decomposition (run multiple agents in parallel)

We’ll run 4 agents in parallel, each owning a bounded refactor set.

### Agent A — RAG Retrieval Promotions (Vector DB / indexing) ✅ COMPLETED

**Goal**: Move any retriever/vector-store adapter that touches VDB/FAISS/SageVDB/Milvus to middleware.

**Completed actions**:
1. Created `packages/sage-middleware/src/sage/middleware/components/vector_stores/`
2. Moved `chroma.py`, `milvus.py`, `chroma_adapter.py` from `sage-libs/integrations/`
3. Updated `__init__.py` exports
4. Updated imports in:
   - `sage-middleware/operators/rag/retriever.py`
   - `sage-llm-gateway/adapters/openai.py`
5. Moved tests to `sage-middleware/tests/components/vector_stores/`
6. Deleted original files from `sage-libs/integrations/`
7. Updated `sage-libs/integrations/__init__.py` (removed vector store exports)

**New namespace**:
- `sage.middleware.components.vector_stores.ChromaBackend`
- `sage.middleware.components.vector_stores.MilvusBackend`
- `sage.middleware.components.vector_stores.ChromaVectorStoreAdapter`

**Verification**:
- No `sage-libs` imports `sage.middleware` (checked)
- All imports work correctly (tested)

---

### Agent B — Memory Promotions (Neuromem / session memory)

**Goal**: Anything that touches Neuromem, session storage, Redis/RocksDB-like persistence belongs to middleware.

**Target namespace**:
- `sage.middleware.components.memory.*` (or consolidate under existing `sage_mem` if preferred)

**Deliverables**:
- Move memory adapters/services from libs (if any) into middleware components
- Ensure gateway/session code imports middleware only
- Update tests for memory services

**Prompt (copy to agent)**

> You are refactoring SAGE.
> Rule: anything that depends on Memory backends (Neuromem/isage-neuromem, Redis/RocksDB, session persistence) must live in `sage-middleware`.
> Task: scan `packages/sage-libs/src/**` for memory backends or adapters, move them to `packages/sage-middleware/src/sage/middleware/components/memory/**` (or existing `components/sage_mem/**` when appropriate).
> Constraints:
> - 🚫 No backward compatibility: do NOT keep old import paths.
> - Update all call sites.
> - Remove any libs→middleware dependency.
> Quality gates:
> - unit tests for middleware memory services pass.

---

### Agent C — Refiner Promotions (LLMLingua / LongRefiner adapters)

**Goal**: Any refiner/compressor adapter that wraps `isage-refiner` or similar belongs to middleware.

**Target namespace**:
- `sage.middleware.components.sage_refiner.*` (existing)

**Deliverables**:
- Ensure refiner adapters are not in libs
- Update call sites and tests

**Prompt (copy to agent)**

> You are refactoring SAGE.
> Rule: anything that touches Refiners/Compressors (LLMLingua, LongRefiner, isage-refiner) must live in `sage-middleware`.
> Task: locate any refiner adapter code under `packages/sage-libs/src/**`, move it into `packages/sage-middleware/src/sage/middleware/components/sage_refiner/**`.
> Constraints:
> - 🚫 No backward compatibility shims.
> - Update all call sites.
> - Keep behavior stable.
> Quality gates:
> - middleware refiner tests pass.

---

### Agent D — Dep Graph & Enforcement (import bans + doc updates)

**Goal**: Prevent regression and ensure docs reflect the new policy.

**Deliverables**:
- Add/extend an architecture check rule (in `sage-tools` if exists) to fail if `sage-libs/src/**` imports `sage.middleware`.
- Update `docs-public/docs_src/dev-notes/package-architecture.md` to reflect rule (briefly).
- Update any developer docs that instruct old imports.

**Prompt (copy to agent)**

> You are implementing enforcement for SAGE layering rules.
> Task:
> 1) Add a repository check that fails CI/dev checks if any file under `packages/sage-libs/src/**` imports `sage.middleware`.
> 2) Update documentation to reflect: "Upward-dependent code must be promoted to middleware; no compat shims".
> Constraints:
> - Keep the check fast.
> - Do not introduce try/except fallback logic.

---

## 2) Milestones and ordering

### Milestone 1 (Day 1)

- Land docs + policy (already done)
- Land migration plan (this doc)
- Land empty target folders under `sage-middleware` (optional, if needed)

### Milestone 2 (Day 2–3)

- Agent A/B/C perform code moves + fix imports + update tests

### Milestone 3 (Day 3–4)

- Agent D adds enforcement check + updates architecture docs

### Milestone 4 (Day 5)

- Full repo quick test suite + quality checks
- Remove any leftover references to old paths

---

## 3) Operational rules for agents

- One agent owns one domain; avoid overlapping file edits.
- Prefer mechanical moves + direct import updates.
- If a module is used by both libs and middleware:
  - split into `sage-libs` (interfaces/types/pure code) + `sage-middleware` (runtime-backed implementation)
- **Do NOT** add compatibility imports.

---

## 4) Quick checklist for PR reviewers

- [ ] No new `try/except ImportError` fallback patterns
- [ ] No `sage-libs` imports `sage.middleware`
- [ ] No re-export shims for moved modules
- [ ] Dependencies updated in the correct `pyproject.toml`
- [ ] Unit tests updated and passing
