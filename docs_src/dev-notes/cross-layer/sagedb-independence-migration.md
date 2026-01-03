# SageDB 独立化迁移计划

> **状态**: 执行中
> **创建日期**: 2026-01-03
> **目标**: 将 SageDB 从 SAGE 子模块完全独立，发布为 `isagedb` PyPI 包

## 背景

SageDB 是一个自研的高性能 C++ 向量数据库，拥有与 FAISS 完全兼容的 API。作为独立组件，没有必要继续保留在 SAGE 项目中。独立后：

- SAGE 通过 `pip install isagedb` 使用 SageDB
- SageDB 可以被其他项目独立使用
- 简化 SAGE 的构建和依赖管理

## ⚠️ 重要：无向后兼容

**此迁移不保留向后兼容性。** 迁移完成后：

- sageDB 子模块将被完全移除
- `packages/sage-middleware/src/sage/middleware/components/sage_db/python/` 目录将被删除
- 所有代码必须使用 `from sagedb import ...` 或通过兼容层 `from sage.middleware.components.sage_db import ...`

## 迁移进度

### ✅ 已完成

1. **SAGE 侧代码更新**
   - [x] `sage_db/__init__.py` - 直接从 `sagedb` 导入，无 fallback
   - [x] `sage_db/backend.py` - 使用 `from sagedb import SageDB`
   - [x] `sagedb_index.py` - 使用 `from sagedb import SageDB`
   - [x] `rag_pipeline.py` - 使用 `from sagedb import SageDB`
   - [x] `extensions_compat.py` - 检测 `sagedb` 包而非 C++ 扩展

2. **依赖更新**
   - [x] `sage-middleware/pyproject.toml` - 添加 `isagedb>=0.1.0`
   - [x] `sage-llm-gateway/pyproject.toml` - 添加 `isagedb>=0.1.0`

### 🔲 待完成 (sageDB 仓库)

1. **PyPI 发布准备**
   - [ ] 创建/完善 `pyproject.toml`
   - [ ] 配置包名: `isagedb`
   - [ ] 设置版本: `0.1.0`
   - [ ] 配置 CI/CD 自动发布

2. **发布到 PyPI**
   ```bash
   pip install build twine
   python -m build
   twine upload dist/*
   ```

### 🔲 待完成 (SAGE 仓库 - isagedb 发布后)

1. **移除子模块**
   ```bash
   git submodule deinit packages/sage-middleware/src/sage/middleware/components/sage_db/sageDB
   git rm packages/sage-middleware/src/sage/middleware/components/sage_db/sageDB
   rm -rf .git/modules/packages/sage-middleware/src/sage/middleware/components/sage_db/sageDB
   ```

2. **删除旧文件**
   ```bash
   rm -rf packages/sage-middleware/src/sage/middleware/components/sage_db/python/
   rm -rf packages/sage-middleware/src/sage/middleware/components/sage_db/examples/
   ```

3. **更新配置文件**
   - [ ] `.gitmodules` - 移除 sageDB 条目
   - [ ] `quickstart.sh` - 移除 sageDB 子模块处理
   - [ ] `.pre-commit-config.yaml` - 移除 sageDB 排除规则

## 当前状态分析

### SageDB 在 SAGE 中的位置

```
packages/sage-middleware/src/sage/middleware/components/sage_db/
├── __init__.py           # 版本信息
├── backend.py            # SageDBBackend 适配器 (VectorStore 协议)
├── service.py            # SageDB 服务封装
├── examples/             # 示例代码
├── python/               # Python 绑定
│   ├── sage_db.py        # 主 Python API
│   ├── _sage_db.so       # C++ 编译的共享库
│   ├── _sage_db.pyi      # 类型存根
│   ├── micro_service/    # 微服务封装
│   └── multimodal_sage_db.py
└── sageDB/               # C++ 子模块 (git submodule)
    ├── src/              # C++ 源码
    ├── include/          # 头文件
    ├── python/           # pybind11 绑定
    └── CMakeLists.txt
```

### 依赖方 (SAGE 内部使用 SageDB 的位置)

| 位置 | 用途 | 迁移难度 |
|------|------|---------|
| `sage-llm-gateway/rag_pipeline.py` | RAG Pipeline 向量存储 | 低 |
| `sage-llm-gateway/adapters/openai.py` | OpenAI 适配器 | 低 |
| `sage_mem/neuromem/vdb_index/sagedb_index.py` | NeuroMem VDB 后端 | 低 |
| `sage-middleware/components/sage_db/backend.py` | VectorStore 适配器 | 中 |
| `sage-middleware/components/extensions_compat.py` | 扩展兼容层 | 中 |

### 外部引用

- `.gitmodules` - 子模块定义
- `quickstart.sh` - 安装脚本
- `.pre-commit-config.yaml` - 排除规则
- `docs-public/` - 文档引用
- `.github/copilot-instructions.md` - Copilot 指令

## 迁移计划

### 阶段 1: SageDB 独立仓库准备 (sageDB 仓库)

**负责人**: sageDB 仓库维护者

1. **完善 PyPI 发布配置**
   - [ ] 创建 `pyproject.toml` (如果没有)
   - [ ] 配置 PyPI 包名: `isagedb`
   - [ ] 设置版本号: `0.1.0`
   - [ ] 添加依赖: `numpy`, `pybind11`

2. **确保 API 兼容性**
   - [ ] 验证 FAISS-like API 完整性
   - [ ] 添加类型存根 (`py.typed`, `.pyi`)
   - [ ] 完善文档字符串

3. **设置 CI/CD**
   - [ ] 配置 GitHub Actions 构建
   - [ ] 配置 PyPI 自动发布
   - [ ] 添加跨平台构建 (Linux, macOS, Windows)

4. **发布到 PyPI**
   ```bash
   # 在 sageDB 仓库
   pip install build twine
   python -m build
   twine upload dist/*
   ```

### 阶段 2: SAGE 适配层准备

**负责人**: SAGE 团队

1. **创建兼容层** (`packages/sage-middleware/src/sage/middleware/components/sage_db/`)
   
   ```python
   # __init__.py - 新版本
   """SageDB compatibility layer for SAGE.
   
   This module provides backward-compatible imports for SageDB.
   SageDB is now an independent package: pip install isagedb
   """
   
   try:
       # 优先使用独立安装的 isagedb
       from sagedb import SageDB, IndexType, DistanceMetric, DatabaseConfig
       from sagedb import SearchParams, QueryResult
       SAGEDB_INDEPENDENT = True
   except ImportError:
       # 回退到子模块版本 (过渡期)
       from .python.sage_db import SageDB, IndexType, DistanceMetric, DatabaseConfig
       from .python.sage_db import SearchParams, QueryResult
       SAGEDB_INDEPENDENT = False
   
   __all__ = [
       "SageDB", "IndexType", "DistanceMetric", "DatabaseConfig",
       "SearchParams", "QueryResult", "SAGEDB_INDEPENDENT"
   ]
   ```

2. **更新依赖声明** (`packages/sage-middleware/pyproject.toml`)
   
   ```toml
   [project.optional-dependencies]
   sagedb = ["isagedb>=0.1.0"]
   full = ["isagedb>=0.1.0", ...]
   ```

3. **保留 backend.py 适配器**
   - `SageDBBackend` 类保留在 SAGE 中
   - 它是 SAGE 特定的 VectorStore 协议实现
   - 只需更新导入路径

### 阶段 3: 迁移执行

1. **移除子模块** (在 isagedb 发布后)
   ```bash
   # 移除子模块
   git submodule deinit packages/sage-middleware/src/sage/middleware/components/sage_db/sageDB
   git rm packages/sage-middleware/src/sage/middleware/components/sage_db/sageDB
   rm -rf .git/modules/packages/sage-middleware/src/sage/middleware/components/sage_db/sageDB
   
   # 更新 .gitmodules
   # 删除 sageDB 相关条目
   ```

2. **更新安装脚本**
   - `quickstart.sh`: 移除 sageDB 子模块处理
   - 添加 `pip install isagedb` 到相关安装步骤

3. **更新文档**
   - `.github/copilot-instructions.md`
   - `docs-public/docs_src/dev-notes/`
   - `DEVELOPER.md`, `CONTRIBUTING.md`

### 阶段 4: 清理与验证

1. **删除冗余文件**
   ```
   packages/sage-middleware/src/sage/middleware/components/sage_db/
   ├── python/                 # 删除 (使用 isagedb)
   │   ├── sage_db.py          # 删除
   │   ├── _sage_db.so         # 删除
   │   ├── _sage_db.pyi        # 删除
   │   └── multimodal_sage_db.py  # 删除
   └── examples/               # 移动到 isagedb 仓库
   ```

2. **保留的文件** (SAGE 特定适配层)
   ```
   packages/sage-middleware/src/sage/middleware/components/sage_db/
   ├── __init__.py             # 兼容层 (导入 isagedb)
   ├── backend.py              # SageDBBackend (VectorStore 协议)
   └── service.py              # SageDB 服务封装 (如需要)
   ```

3. **运行测试**
   ```bash
   # 安装 isagedb
   pip install isagedb
   
   # 运行 SageDB 相关测试
   sage-dev project test --coverage -k sagedb
   
   # 运行全量测试
   sage-dev project test --coverage
   ```

4. **更新 pre-commit 排除规则**
   - 移除 `sageDB` 相关排除

## 时间表

| 阶段 | 预计时间 | 里程碑 |
|------|---------|--------|
| 阶段 1 | 1-2 周 | isagedb 发布到 PyPI |
| 阶段 2 | 1 周 | SAGE 兼容层准备完成 |
| 阶段 3 | 1 周 | 子模块移除，依赖切换 |
| 阶段 4 | 1 周 | 清理完成，测试通过 |

**总计**: 4-5 周

## API 对照表

确保 `isagedb` 提供以下 FAISS-like API:

```python
# 核心类
from sagedb import SageDB, IndexType, DistanceMetric

# 创建数据库
db = SageDB(dimension=128, index_type=IndexType.AUTO, metric=DistanceMetric.L2)

# 添加向量
db.add(vector, metadata={"id": "doc_1"})
db.add_batch(vectors, metadata=[...])

# 构建索引
db.build_index()

# 搜索
results = db.search(query_vector, k=10)

# 过滤搜索
results = db.filtered_search(query_vector, params, filter_fn)

# 持久化
db.save("/path/to/index")
db.load("/path/to/index")

# 属性
db.size
db.dimension
db.index_type
```

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| API 不兼容 | 高 | 在阶段 1 完整验证 API 兼容性 |
| 构建失败 | 中 | 保留兼容层支持子模块回退 |
| 性能差异 | 低 | 运行基准测试验证 |
| 文档不同步 | 低 | 统一更新时机 |

## 回滚计划

如果迁移过程中出现问题:

1. 恢复 `.gitmodules` 中的 sageDB 条目
2. 重新初始化子模块: `git submodule update --init`
3. 恢复 `python/` 目录下的文件
4. 更新兼容层导入回子模块版本

## 相关文档

- [SageDB 仓库](https://github.com/intellistream/sageDB)
- [VDB Backend Selection](./vdb-backend-selection.md)
- [Package Architecture](../package-architecture.md)

## 附录: 需要更新的文件清单

### 代码文件

- [ ] `packages/sage-middleware/src/sage/middleware/components/sage_db/__init__.py`
- [ ] `packages/sage-middleware/src/sage/middleware/components/sage_db/backend.py`
- [ ] `packages/sage-middleware/src/sage/middleware/components/sage_db/service.py`
- [ ] `packages/sage-middleware/src/sage/middleware/components/extensions_compat.py`
- [ ] `packages/sage-middleware/pyproject.toml`
- [ ] `packages/sage-llm-gateway/src/sage/llm/gateway/rag_pipeline.py`
- [ ] `packages/sage-llm-gateway/src/sage/llm/gateway/adapters/openai.py`
- [ ] `packages/sage-middleware/src/sage/middleware/components/sage_mem/neuromem/search_engine/vdb_index/sagedb_index.py`

### 配置文件

- [ ] `.gitmodules`
- [ ] `quickstart.sh`
- [ ] `.pre-commit-config.yaml`
- [ ] `tools/pre-commit-config.yaml`

### 文档文件

- [ ] `.github/copilot-instructions.md`
- [ ] `DEVELOPER.md`
- [ ] `CONTRIBUTING.md`
- [ ] `docs-public/docs_src/dev-notes/package-architecture.md`
- [ ] `docs-public/docs_src/guides/packages/sage-middleware/components/sage_db.md`
- [ ] `docs-public/docs_src/guides/packages/sage-libs/rag/components/index_build.md`
