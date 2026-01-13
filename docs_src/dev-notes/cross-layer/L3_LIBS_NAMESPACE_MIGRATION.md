# L3 独立库命名空间迁移方案

## 背景

L3 层的独立库（如 isage-agentic）当前使用顶层命名空间（如 `sage_agentic`），
无法从导入路径看出其属于 SAGE 的哪一层。

## 新命名规范

| 包名 | PyPI 名 | 旧 Import | 新 Import |
|------|---------|-----------|-----------|
| sage-agentic | `isage-agentic` | `sage_agentic` | `sage_libs.sage_agentic` |
| sage-rag | `isage-rag` | `sage_rag` | `sage_libs.sage_rag` |
| sage-privacy | `isage-privacy` | `sage_privacy` | `sage_libs.sage_privacy` |
| sage-eval | `isage-eval` | `sage_eval` | `sage_libs.sage_eval` |
| sage-finetune | `isage-finetune` | `sage_finetune` | `sage_libs.sage_finetune` |
| sage-safety | `isage-safety` | `sage_safety` | `sage_libs.sage_safety` |
| sage-refiner | `isage-refiner` | `sage_refiner` | `sage_libs.sage_refiner` |

## 迁移步骤

### 1. 独立库仓库修改（以 sage-agentic 为例）

#### 1.1 目录结构重构

**旧结构**:
```
sage-agentic/
├── pyproject.toml
├── sage_agentic/       # 直接作为顶层包
│   ├── __init__.py
│   ├── agents/
│   └── ...
```

**新结构**:
```
sage-agentic/
├── pyproject.toml
├── src/
│   └── sage_libs/              # namespace package
│       ├── __init__.py         # namespace package init (empty or minimal)
│       └── sage_agentic/       # 实际实现
│           ├── __init__.py
│           ├── agents/
│           └── ...
```

#### 1.2 pyproject.toml 修改

```toml
[project]
name = "isage-agentic"
version = "0.0.1.0"  # 版本号递增（大版本，因为是 breaking change）

[tool.setuptools.packages.find]
where = ["src"]
include = ["sage_libs*"]

# 使用 namespace packages
[tool.setuptools.package-dir]
"" = "src"
```

#### 1.3 namespace package __init__.py

`src/sage_libs/__init__.py` 应该是空文件或仅包含：
```python
"""SAGE L3 Libraries namespace package."""
__path__ = __import__('pkgutil').extend_path(__path__, __name__)
```

这样多个独立库可以共享 `sage_libs` 命名空间。

### 2. SAGE 核心仓库修改

#### 2.1 更新所有导入

```bash
# 在 SAGE 仓库中执行
sed -i 's/from sage_agentic\./from sage_libs.sage_agentic./g' $(grep -rl "from sage_agentic\." --include="*.py")
sed -i 's/import sage_agentic/import sage_libs.sage_agentic/g' $(grep -rl "import sage_agentic" --include="*.py")
```

#### 2.2 更新 copilot-instructions.md

更新命名规范表格中的 Import 名列。

### 3. 其他独立库同步修改

每个 L3 独立库都需要做类似修改：
- isage-rag → `sage_libs.sage_rag`
- isage-privacy → `sage_libs.sage_privacy`
- isage-eval → `sage_libs.sage_eval`
- isage-finetune → `sage_libs.sage_finetune`
- isage-safety → `sage_libs.sage_safety`
- isage-refiner → `sage_libs.sage_refiner`

## 发布流程

1. 修改独立库目录结构和 pyproject.toml
2. 本地测试：`pip install -e .` 并验证导入
3. 发布到 TestPyPI：验证安装
4. 发布到 PyPI：版本号应该递增 minor 或 major（breaking change）
5. 更新 SAGE 核心仓库中的依赖版本和导入路径

## 向后兼容（可选）

如果需要保持向后兼容，可以在旧的顶层包位置提供重导出：

```python
# sage_agentic/__init__.py (deprecated shim)
import warnings
warnings.warn(
    "sage_agentic is deprecated. Use sage_libs.sage_agentic instead.",
    DeprecationWarning,
    stacklevel=2
)
from sage_libs.sage_agentic import *
```

但根据 SAGE 的"无向后兼容"原则，建议直接迁移。

## 注意事项

1. **Namespace packages 冲突**：多个独立库共享 `sage_libs` 命名空间，需要确保都使用相同的 namespace package 机制
2. **版本协调**：所有 L3 独立库应该同步迁移，避免部分迁移导致的混乱
3. **CI/CD 更新**：更新 GitHub Actions 中的测试和发布流程
