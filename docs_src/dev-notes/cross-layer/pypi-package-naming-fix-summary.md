# PyPI 包名修复总结

## 问题描述

在 PyPI 安装 `isage-middleware` 后，导入时出现包名混乱的警告：

```bash
UserWarning: SageVDB not available: cannot import name 'DatabaseConfig' from 'sagevdb'
Install with: pip install isagevdb  # ❌ 错误的包名
```

## 根本原因

**包名不一致**：
- 代码中混用了 `isagevdb`（错误拼写）、`isage-vdb`（正确）、`sagedb`（错误导入名）
- 错误提示信息使用了错误的包名 `isagevdb`

**正确的包名规范**：
- **PyPI 包名**: `isage-vdb` (带连字符，因为 `sage` 在 PyPI 已被 SageMath 占用)
- **Python 导入名**: `sagevdb` (不带 `i`，不带连字符)

## 修复内容

### 1. 修复 `extensions_compat.py`

**位置**: `packages/sage-middleware/src/sage/middleware/components/extensions_compat.py`

**修改**:
```python
# ❌ 修复前
import sagedb  # 错误：导入名应该是 sagevdb
raise ImportError("请安装: pip install isage-vdb")  # 缺少说明

# ✅ 修复后
import sagevdb  # ✅ 正确的 Python 导入名
raise ImportError(
    "此功能需要 SageVDB。请安装:\n"
    "  pip install isage-vdb\n"
    "注意: PyPI 包名是 'isage-vdb'，Python 导入名是 'sagevdb'"
)
```

### 2. 修复 `sage_db/__init__.py`

**位置**: `packages/sage-middleware/src/sage/middleware/components/sage_db/__init__.py`

**修改**:
```python
# ❌ 修复前
"""
Installation:
    pip install isagevdb  # 错误的包名
"""

# ✅ 修复后
"""
Installation:
    pip install isage-vdb  # 正确的 PyPI 包名

Important:
    - PyPI package name: isage-vdb (with hyphen and 'i' prefix)
    - Python import name: sagevdb (no 'i', no hyphen)
"""

# 添加友好的错误提示
def __getattr__(name):
    if name in __all__ and not _SAGE_DB_AVAILABLE:
        raise ImportError(
            f"Cannot import '{name}' from sage.middleware.components.sage_db. "
            "SageVDB is not installed. Please install it using:\n"
            "  pip install isage-vdb\n"
            "Note: PyPI package name is 'isage-vdb', Python import name is 'sagevdb'"
        )
    raise AttributeError(f"module '{__name__}' has no attribute '{name}'")
```

### 3. 修复 `backend.py`

**位置**: `packages/sage-middleware/src/sage/middleware/components/sage_db/backend.py`

**修改**:
```python
# ❌ 修复前
Dependencies: isagevdb (PyPI package)
Install with: pip install isagevdb

# ✅ 修复后
Dependencies: isage-vdb (PyPI package, Python import: sagevdb)
Install with: pip install isage-vdb
```

### 4. 更新 `copilot-instructions.md`

**位置**: `.github/copilot-instructions.md`

**修改**:
- 将所有 `isagevdb` 改为 `isage-vdb`
- 明确说明包名规范：PyPI `isage-vdb` ≠ Python `sagevdb`
- 添加注释说明为什么使用 `isage-*` 前缀（`sage` 在 PyPI 已被占用）

### 5. 创建包名规范文档

**新文件**: `docs-public/docs_src/dev-notes/cross-layer/pypi-package-naming.md`

**内容**:
- 详细说明 PyPI 包名和 Python 导入名的区别
- 列出所有 SAGE 组件的正确包名
- 提供常见错误示例和正确用法
- 说明历史遗留问题（`isagevdb` 拼写错误）

## 验证测试

### 1. 扩展状态检测

```bash
$ python -c "from sage.middleware.components import extensions_compat; print(extensions_compat.get_extension_status())"
{'sage_db': True, 'sage_flow': True, 'sage_tsdb': True, 'total_available': 3, 'total_extensions': 3}
```

### 2. 错误提示正确性

```bash
$ python -c "from sage.middleware.components import extensions_compat; extensions_compat.require_sage_db()"
ImportError: 此功能需要 SageVDB。请安装:
  pip install isage-vdb
注意: PyPI 包名是 'isage-vdb'，Python 导入名是 'sagevdb'
```

## 影响范围

### 修改的文件

1. `packages/sage-middleware/src/sage/middleware/components/extensions_compat.py`
2. `packages/sage-middleware/src/sage/middleware/components/sage_db/__init__.py`
3. `packages/sage-middleware/src/sage/middleware/components/sage_db/backend.py`
4. `.github/copilot-instructions.md`
5. 新增: `docs-public/docs_src/dev-notes/cross-layer/pypi-package-naming.md`

### 不需要修改的文件

- 测试文件已经使用正确的包名 `isage-vdb`
- `__init__.py` 中的 Python 导入语句已经正确使用 `sagevdb`

## 下一步建议

### 1. 添加 CI 测试验证 PyPI 安装

在 `.github/workflows/` 中添加测试：

```yaml
- name: Test PyPI installation
  run: |
    # 在干净环境中安装
    pip install isage-middleware --no-deps
    
    # 验证导入
    python -c "from sage.middleware.components import sage_db"
    python -c "from sagevdb import SageVDB"
    
    # 验证错误提示
    python -c "
    from sage.middleware.components import extensions_compat
    status = extensions_compat.get_extension_status()
    assert status['sage_db'] == True
    "
```

### 2. 更新其他独立包的文档

确保其他独立包（SageFlow, SageTSDB, NeuroMem）的文档也使用一致的包名规范。

### 3. 搜索并修复其他地方的 `isagevdb`

```bash
# 搜索可能遗漏的地方
git grep -i 'isagevdb'
```

## 总结

**核心原则**:
- **PyPI 包名**: `isage-*` (带连字符，因为 `sage` 被占用)
- **Python 导入名**: 自然名称（如 `sagevdb`，不带 `i` 前缀）
- **错误提示**: 必须同时说明 PyPI 包名和 Python 导入名的区别

**修复效果**:
- ✅ 统一所有错误提示使用正确的包名 `isage-vdb`
- ✅ 修正 Python 导入名从 `sagedb` 到 `sagevdb`
- ✅ 添加详细的包名规范文档
- ✅ 提供友好的错误提示，说明包名差异

**验证方法**:
```bash
# 测试导入
python -c "from sage.middleware.components import extensions_compat"

# 测试错误提示
python -c "from sage.middleware.components.extensions_compat import require_sage_db; require_sage_db()"
```
