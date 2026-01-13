# PyPI Package Naming Convention

## Problem: 'sage' is Already Taken on PyPI

The namespace `sage` is already occupied on PyPI by the SageMath project. Therefore, all SAGE packages published to PyPI must use the `isage-*` prefix.

## Naming Convention

### Rule: PyPI Package Name ≠ Python Import Name

| Component | PyPI Package Name | Python Import Name | Install Command |
|-----------|------------------|-------------------|-----------------|
| SageVDB | `isage-vdb` | `sagevdb` | `pip install isage-vdb` |
| SageTSDB | `isage-tsdb` | `sage_tsdb` | `pip install isage-tsdb` |
| SageFlow | `isage-flow` | `sageflow` | `pip install isage-flow` |
| SageRefiner | `isage-refiner` | `sagerefiner` | `pip install isage-refiner` |
| NeuroMem | `isage-neuromem` | `neuromem` | `pip install isage-neuromem` |
| SAGE Middleware | `isage-middleware` | `sage.middleware` | `pip install isage-middleware` |
| SAGE LLM Core | `isage-llm-core` | `sage.llm` | `pip install isage-llm-core` |
| SAGE LLM Gateway | `isage-llm-gateway` | `sage.llm.gateway` | `pip install isage-llm-gateway` |

### Key Points

1. **PyPI package names**: Always use `isage-*` prefix with hyphens
   - Example: `isage-vdb`, `isage-llm-core`
   - Reason: `sage` is already taken by SageMath

2. **Python import names**: Use the natural name without `i` prefix
   - Example: `sagevdb`, `sage.llm`
   - Reason: Python convention, cleaner imports

3. **pip install**: Always use the PyPI package name
   ```bash
   pip install isage-vdb        # ✅ Correct
   pip install isagevdb         # ❌ Wrong (old typo)
   pip install sage-vdb         # ❌ Wrong (name conflict)
   ```

4. **Python imports**: Use the natural import name
   ```python
   from sagevdb import SageVDB  # ✅ Correct
   from isage_vdb import SageVDB  # ❌ Wrong
   ```

## Common Mistakes to Avoid

### ❌ Don't Mix Up Package Names

```bash
# Wrong: Using typo 'isagevdb' instead of 'isage-vdb'
pip install isagevdb

# Wrong: Missing 'i' prefix
pip install sage-vdb

# Correct: Use hyphenated isage-vdb
pip install isage-vdb
```

### ❌ Don't Add 'i' Prefix to Python Imports

```python
# Wrong: Adding 'i' prefix to Python import
from isagevdb import SageVDB
from isage_vdb import SageVDB

# Correct: Use natural name without 'i'
from sagevdb import SageVDB
```

## Error Messages Should Be Consistent

When showing installation instructions in error messages, always use the correct PyPI package name:

```python
# ✅ Correct error message
raise ImportError(
    "SageVDB is not installed. Please install it using:\n"
    "  pip install isage-vdb\n"
    "Note: PyPI package name is 'isage-vdb', Python import name is 'sagevdb'"
)

# ❌ Wrong error message
raise ImportError("Install with: pip install isagevdb")  # Old typo
raise ImportError("Install with: pip install sage-vdb")  # Name conflict
```

## Package Name History

### Why 'isagevdb' Was Used (Typo)

Early versions mistakenly used `isagevdb` (without hyphen) in some places. This was a typo and has been corrected to `isage-vdb`.

### Migration Path

If you see `isagevdb` anywhere in code or documentation, it should be updated to `isage-vdb`:

```bash
# Find old references
git grep -i 'isagevdb'

# Should be: isage-vdb (in pip install commands)
# Should be: sagevdb (in Python imports)
```

## Verification

To verify the correct package names:

```bash
# Check PyPI
pip search isage-vdb  # Should find the package
pip search isagevdb   # Should not find anything (typo)

# Check Python import
python -c "import sagevdb; print(sagevdb.__version__)"  # ✅ Works
python -c "import isagevdb"  # ❌ ModuleNotFoundError
```

## See Also

- [SageVDB Independence Migration](./sagedb-independence-migration.md)
- [Middleware Components](../l4-middleware/README.md)
- [PyPI Publishing](./../../CONTRIBUTING.md#pypi-publishing)
