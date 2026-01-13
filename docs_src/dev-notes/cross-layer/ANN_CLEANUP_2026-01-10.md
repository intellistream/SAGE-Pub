# ANN vs ANNS Cleanup Summary

**Date**: 2026-01-10  
**Action**: Removed duplicate `ann/` folder, kept `anns/` as canonical location

## 🎯 Problem

There were two duplicate folders for ANN (Approximate Nearest Neighbor) algorithms:

1. **`packages/sage-libs/src/sage/libs/ann/`** (REMOVED ❌)
   - Incomplete legacy implementation
   - Only contained:
     - `docs/README.md`
     - `interface/implementations/dummy.py`
     - `__init__.py` (deprecation warning)
   - Missing: `base.py`, `factory.py` (core functionality)

2. **`packages/sage-libs/src/sage/libs/anns/`** (KEPT ✅)
   - Complete, actively used implementation
   - Contains:
     - Full interface: `base.py`, `factory.py`, `__init__.py`
     - Complete implementations structure
     - Active development

## ✅ Actions Taken

1. **Removed `ann/` folder** completely using `tools/cleanup/remove_duplicate_ann_folder.sh`
2. **Updated documentation**:
   - `.github/copilot-instructions.md`: Changed `sage.libs.ann` → `sage.libs.anns`
   - `docs-public/docs_src/dev-notes/l3-libs/ANN_MIGRATION_PLAN.md`: Added outdated notice
   - `docs-public/docs_src/dev-notes/cross-layer/ANNS_REFACTOR_PLAN.md`: Updated status
3. **Verified**: Only `anns/` (plural) remains in the codebase

## 📋 Current State

### ✅ Correct Import Path (Use This)
```python
from sage.libs.anns import create, register, registered
from sage.libs.anns.interface import AnnIndex, AnnIndexMeta
```

### ❌ Old Import Path (REMOVED)
```python
from sage.libs.ann import ...  # ❌ NO LONGER EXISTS
```

## 🗂️ Current Structure

```
packages/sage-libs/src/sage/libs/
├── anns/                          # ✅ KEPT (Canonical location)
│   ├── __init__.py
│   ├── README.md
│   └── interface/
│       ├── __init__.py
│       ├── base.py               # AnnIndex, AnnIndexMeta
│       ├── factory.py            # create(), register(), registered()
│       └── implementations/
│           ├── __init__.py
│           └── dummy.py
└── ann/                          # ❌ REMOVED (Was duplicate)
```

## 📚 Documentation Updates

All documentation now correctly references `sage.libs.anns`:

- User guides: `docs-public/docs_src/dev-notes/l3-libs/README.md`
- Quick reference: `packages/sage-libs/docs/QUICK_REFERENCE.md`
- Copilot instructions: `.github/copilot-instructions.md`

## 🔍 Search for Remaining References

```bash
# Should return no results in code (only in docs/history)
rg "sage\.libs\.ann[^s]" --type py packages/
```

## ⚠️ Note on External Package

The actual ANN algorithm implementations have been externalized to the `isage-anns` package.
`sage.libs.anns` now serves as the **interface/registry layer only**.

To use ANN algorithms:
```bash
pip install isage-anns
# or
pip install -e packages/sage-libs[anns]
```

## ✅ Benefits

1. **No more confusion** between `ann` and `anns`
2. **Single source of truth**: All ANN interfaces in `anns/`
3. **Cleaner codebase**: Removed incomplete legacy code
4. **Better documentation**: Clear, consistent references
5. **Easier maintenance**: One location to update

## 🔗 Related Documents

- Current structure: `packages/sage-libs/src/sage/libs/anns/README.md`
- Historical context: `docs-public/docs_src/dev-notes/l3-libs/ANN_MIGRATION_PLAN.md`
- Refactor plan: `docs-public/docs_src/dev-notes/cross-layer/ANNS_REFACTOR_PLAN.md`
- Quick reference: `packages/sage-libs/docs/QUICK_REFERENCE.md`
