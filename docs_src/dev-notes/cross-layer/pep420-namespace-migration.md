# PEP 420 Namespace 迁移指南

## 概述

SAGE 已迁移到 **PEP 420 隐式命名空间包** (Implicit Namespace Packages)，以支持未来的多仓库拆分和 PyPI 独立发布。

## 为什么迁移到 PEP 420？

### 问题：传统 pkgutil.extend_path 的局限

迁移前，SAGE 使用 `pkgutil.extend_path` 实现命名空间：

```python
# packages/sage-common/src/sage/__init__.py (已删除)
__path__ = __import__("pkgutil").extend_path(__path__, __name__)
```

**问题**：
1. **命名空间劫持**：第一个安装的包会"占领" `sage/` 命名空间
2. **安装顺序依赖**：后安装的包可能无法添加内容到 `sage.*`
3. **文件冲突**：多个包的 `sage/__init__.py` 会互相覆盖
4. **拆仓困难**：独立发布到 PyPI 后，namespace 合并不可靠

### 解决方案：PEP 420 隐式命名空间

PEP 420 (Python 3.3+) 允许**多个包共享同一命名空间**，无需 `__init__.py`：

```
packages/sage-common/src/sage/          ← 无 __init__.py（PEP 420）
    └── common/__init__.py              ← 实际包，有 __init__.py
packages/sage-kernel/src/sage/          ← 无 __init__.py（PEP 420）
    └── kernel/__init__.py              ← 实际包，有 __init__.py
```

**优势**：
- ✅ 无冲突：多个包和平共存
- ✅ 顺序无关：安装顺序不影响结果
- ✅ 拆仓友好：独立发布后自动合并
- ✅ 标准化：现代 Python 原生支持

## 迁移内容

### 1. 删除命名空间层的 `__init__.py`（10个文件）

**删除的文件**（仅命名空间层）：
```bash
packages/sage-common/src/sage/__init__.py          ❌ 删除
packages/sage-platform/src/sage/__init__.py        ❌ 删除
packages/sage-kernel/src/sage/__init__.py          ❌ 删除
packages/sage-libs/src/sage/__init__.py            ❌ 删除
packages/sage-middleware/src/sage/__init__.py      ❌ 删除
packages/sage-apps/src/sage/__init__.py            ❌ 删除
packages/sage-cli/src/sage/__init__.py             ❌ 删除
packages/sage-studio/src/sage/__init__.py          ❌ 删除
packages/sage-tools/src/sage/__init__.py           ❌ 删除
packages/sage/src/sage/__init__.py                 ❌ 删除
```

**保留的文件**（实际包层和子模块层）：
```bash
packages/sage-common/src/sage/common/__init__.py          ✅ 保留
packages/sage-common/src/sage/common/core/__init__.py     ✅ 保留
packages/sage-kernel/src/sage/kernel/__init__.py          ✅ 保留
packages/sage-middleware/src/sage/middleware/__init__.py  ✅ 保留
packages/sage-llm-core/src/sage/llm/__init__.py           ✅ 保留（本来就是 PEP 420）
... 所有其他实际包/子模块的 __init__.py ...
```

### 2. 配置 pyproject.toml

所有包的 `pyproject.toml` 添加：

```toml
[tool.setuptools.packages.find]
where = ["src"]
namespaces = true  # 启用 PEP 420 namespace 发现
```

### 3. 更新验证脚本

所有安装验证脚本从：
```bash
# ❌ 错误（PEP 420 namespace 无 __version__）
python3 -c "import sage; print(sage.__version__)"
```

改为：
```bash
# ✅ 正确（检查实际包）
python3 -c "import sage.common; print(sage.common.__version__)"
```

## 层级区分

### 三层结构

1. **命名空间层**：`src/sage/` ← **无** `__init__.py`（PEP 420）
2. **包层**：`src/sage/common/` ← **有** `__init__.py`（实际包）
3. **子模块层**：`src/sage/common/core/` ← **有** `__init__.py`（子模块）

### 类比理解

- `sage/` = **公共广场**，所有商家都能进来摆摊 → 不能有锁（无 `__init__.py`）
- `sage/common/` = **你的店铺**，只有你管理 → 需要有门（有 `__init__.py`）
- `sage/common/core/` = **店内货架**，也只有你管理 → 需要有标识（有 `__init__.py`）

## 导入行为变化

### PEP 420 后的正确用法

```python
# ✅ 正确：导入实际包
import sage.common
import sage.kernel
import sage.libs
import sage.middleware

# ✅ 正确：访问包的版本
print(sage.common.__version__)    # "0.2.3"
print(sage.kernel.__version__)    # "0.2.3"

# ❌ 错误：sage 是隐式命名空间，无 __version__
print(sage.__version__)            # AttributeError

# ❌ 错误：sage 是 namespace，无 __file__
print(sage.__file__)               # AttributeError (正常，PEP 420 行为)
```

### 检测命名空间劫持

如果 `sage.__file__` 存在，说明有包违反了 PEP 420：

```python
import sage
if hasattr(sage, '__file__'):
    print(f"⚠️ Namespace hijacked by: {sage.__file__}")
    print("This package needs to migrate to PEP 420")
```

## 常见问题

### Q1: 为什么 `import sage` 失败？

**不会失败**，但 `sage` 是隐式命名空间，没有 `__version__` 等属性。应该导入实际包：

```python
import sage.common  # ✅ 正确
import sage         # ⚠️  可以导入，但无用（只是命名空间）
```

### Q2: 如何获取 SAGE 版本？

```python
# 方法 1：各包独立版本
import sage.common
print(sage.common.__version__)

# 方法 2：使用 importlib.metadata
from importlib.metadata import version
print(version('isage-common'))
```

### Q3: sage-benchmark 独立仓库怎么办？

sage-benchmark 已迁移到独立仓库，同样需要删除 `src/sage/__init__.py`：

```bash
# 在 sage-benchmark 仓库中
rm src/sage/__init__.py
```

如果不删除，sage-benchmark 的 `__init__.py` 会劫持整个 `sage.*` 命名空间，导致其他包无法导入。

### Q4: 如何验证 PEP 420 正确配置？

```python
import sage

# 1. 应该是 namespace，不是 module
print(type(sage.__path__))  # <class '_NamespacePath'>

# 2. 不应该有 __file__
print(hasattr(sage, '__file__'))  # False

# 3. 可以导入各个子包
import sage.common
import sage.kernel
print("✅ PEP 420 namespace working correctly!")
```

## 多仓库拆分准备

迁移到 PEP 420 后，SAGE 可以安全地拆分为多个独立仓库并发布到 PyPI：

```bash
# 用户可以独立安装
pip install isage-common    # 提供 sage.common.*
pip install isage-kernel    # 提供 sage.kernel.*
pip install isage-middleware # 提供 sage.middleware.*

# 三个包共享 sage.* 命名空间，互不冲突！
```

## 相关提交

- `refactor: migrate to PEP 420 namespace packages (pre-split preparation)`
- `fix(install): update verification scripts for PEP 420 namespace`
- `fix(install): complete PEP 420 namespace verification fixes`

## 参考资料

- [PEP 420 -- Implicit Namespace Packages](https://peps.python.org/pep-0420/)
- [Python Packaging User Guide - Namespace Packages](https://packaging.python.org/en/latest/guides/packaging-namespace-packages/)
