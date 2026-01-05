# PEP 420 Namespace Package Migration

## 概述

SAGE 已迁移到 **PEP 420 原生命名空间包**（Python 3.3+），移除所有 `src/sage/__init__.py` 文件。

## 为什么使用 PEP 420?

### 问题：命名空间劫持

**旧式 namespace packages**（使用 `pkgutil` 或 `pkg_resources`）存在"首次导入劫持"问题：

```python
# 假设 sage-benchmark 使用旧式 namespace (有 __init__.py)
pip install isage-benchmark  # 安装 sage-benchmark 到 site-packages

# 问题：sage-benchmark 的 __init__.py 会劫持整个 sage 命名空间
import sage  # ✅ 成功，但指向 sage-benchmark 的 __init__.py
import sage.common  # ❌ 可能失败！取决于安装顺序
```

### 解决：PEP 420 原生命名空间

```python
# SAGE 使用 PEP 420 (无 __init__.py)
import sage  # ❌ ImportError (预期行为)
import sage.common  # ✅ 成功
import sage.llm     # ✅ 成功
import sage.benchmark  # ✅ 成功（即使来自外部 PyPI 包）
```

**优势**：
- ✅ **安装顺序无关**: 多个包可以并存，不会互相干扰
- ✅ **多仓库友好**: 独立发布 `isage-*` 包时无需担心冲突
- ✅ **符合标准**: Python 3.3+ 官方推荐方式
- ✅ **自动命名空间组装**: 无需手动管理 `__path__`

## 迁移内容

### 删除的文件

```bash
# 仅删除命名空间层的 __init__.py
packages/*/src/sage/__init__.py  # ❌ 删除（10 个包）
```

### 保留的文件

```bash
# ✅ 保留所有包级和模块级 __init__.py
packages/*/src/sage/<package>/__init__.py       # ✅ 保留
packages/*/src/sage/<package>/<module>/__init__.py  # ✅ 保留
```

### 配置更新

所有 `pyproject.toml` 添加 PEP 420 支持：

```toml
[tool.setuptools.packages.find]
where = ["src"]
namespaces = true  # ← 启用 PEP 420 namespace 发现
```

## 用法变化

### ❌ 错误用法

```python
# 不能直接导入 sage 命名空间
import sage
print(sage.__version__)  # AttributeError
```

### ✅ 正确用法

```python
# 导入具体的子包
import sage.common
import sage.llm
from sage.kernel import Pipeline
from sage.common.config import get_user_paths

print(sage.common.__version__)  # ✅ 正确
```

## 外部包兼容性

### 问题：外部包使用旧式 namespace

如果外部已安装的包（如 `isage-benchmark`）仍使用旧式 namespace：

```python
# /home/user/sage-benchmark/src/sage/__init__.py (旧式)
__path__ = __import__("pkgutil").extend_path(__path__, __name__)
```

**影响**：
- ⚠️ `import sage` 会成功（指向外部包的 `__init__.py`）
- ⚠️ 可能导致命名空间混乱

**检测方法**：

```bash
python3 -c "import sage; print(sage.__file__)"
# 如果输出路径不在 /SAGE/ 内，说明被外部包劫持
```

**解决方案**：

1. **更新外部包到 PEP 420**（推荐）
2. **卸载旧版本外部包**
3. **使用虚拟环境隔离**

### 外部包迁移指南

如果你维护 `sage.*` 命名空间的外部包：

```bash
# 1. 删除 src/sage/__init__.py
rm src/sage/__init__.py

# 2. 更新 pyproject.toml
[tool.setuptools.packages.find]
where = ["src"]
namespaces = true

# 3. 重新构建
python -m build
```

## 验证

```bash
# 1. 检查是否有残留 __init__.py
find packages -type f -path "*/src/sage/__init__.py"
# 应该无输出

# 2. 检查是否被外部包劫持
python3 -c "import sage; print(sage.__file__)" 2>&1
# 如果报错 "No module named 'sage'"，说明 PEP 420 正常
# 如果输出路径，检查是否在 SAGE 项目内

# 3. 验证子包导入
python3 -c "import sage.common; print(sage.common.__version__)"
# 应该输出版本号
```

## CI/CD 影响

### 安装验证脚本

`tools/install/examination_tools/install_verification.sh` 已更新：

```bash
verify_sage_imports() {
    # ❌ 不再验证 'sage' 命名空间
    # ✅ 仅验证具体子包
    
    # 检测命名空间劫持
    if sage.__file__ exists and not in SAGE/; then
        echo "⚠️ sage namespace hijacked by external package"
    fi
}
```

### pytest 配置

无需修改，`pytest` 自动识别 PEP 420 namespace packages。

## 参考

- **PEP 420**: <https://peps.python.org/pep-0420/>
- **Packaging Guide**: <https://packaging.python.org/en/latest/guides/packaging-namespace-packages/>
- **Related Issue**: #1388 (multi-repo split preparation)

## 常见问题

### Q: 为什么 `import sage` 失败？

A: PEP 420 namespace 是隐式的，不能直接导入。必须导入具体子包：

```python
import sage.common  # ✅
import sage         # ❌
```

### Q: 会影响现有代码吗？

A: **不会**。所有 `from sage.xxx import yyy` 的代码无需修改。

### Q: 如何迁移外部包？

A: 删除 `src/sage/__init__.py`，在 `pyproject.toml` 中添加 `namespaces = true`。

### Q: 如何检测命名空间冲突？

A: 运行验证脚本：

```bash
./tools/install/examination_tools/install_verification.sh
# 会检测并报告 namespace hijacking
```

## 时间线

- **2025-01-05**: 完成 PEP 420 迁移（commit: refactor: migrate to PEP 420 namespace packages）
- **准备中**: 多仓库拆分（#1388）
- **未来**: PyPI 独立发布 `isage-*` 系列包
