# L4 Middleware Dev Notes

sage-middleware 属于 L4（中间件层），包含 C++ 扩展、neuromem 内存系统、存储引擎等核心组件。该目录用于追踪这些组件的开发、问题修复及功能增强。

## 目录结构

```
l4-middleware/
├── README.md                          # 本文件
│
├── # === Autostop 功能文档 ===
├── AUTOSTOP_MODE_SUPPORT.md           # Autostop 模式在不同执行环境下的支持
├── REMOTE_AUTOSTOP_IMPLEMENTATION.md  # 远程 Autostop 实现
├── fix-autostop-service-cleanup.md    # Autostop 服务清理修复说明（中文）
├── remote-mode-support.md             # 远程模式支持说明
│
├── # === Document Storage ===
├── DOCUMENT_STORAGE_FEATURE.md        # 文档存储功能架构
├── DOCUMENT_STORAGE_STATUS.md         # 文档存储实现状态 ✅
├── DOCUMENT_STORAGE_USER_GUIDE.md     # 文档存储用户指南（中文）
│
├── # === Neuromem / Graph Memory ===
├── GRAPH_MEMORY_FINAL_STATUS.md       # Graph Memory 实现最终状态 ✅
├── memory-statistics-feature.md       # Memory 统计功能
│
└── song_migration_complete.md         # SONG GPU ANN 后端迁移完成
```

## 核心组件

### 1. Neuromem 内存系统

**位置**: `packages/sage-middleware/src/sage/middleware/components/sage_mem/neuromem/`

| 组件                    | 位置                                    | 功能                  |
| ----------------------- | --------------------------------------- | --------------------- |
| `TextStorage`           | `storage_engine/text_storage.py`        | 原始文档存储          |
| `MetadataStorage`       | `storage_engine/metadata_storage.py`    | 元数据管理            |
| `VectorStorage`         | `storage_engine/vector_storage.py`      | 向量存储              |
| `VDBMemoryCollection`   | `memory_collection/vdb_collection.py`   | 向量数据库集合（RAG） |
| `GraphMemoryCollection` | `memory_collection/graph_collection.py` | 图记忆集合 ✅         |
| `MemoryManager`         | `memory_manager.py`                     | 集合生命周期管理      |

### 2. Multimodal Storage

**位置**:
`packages/sage-middleware/src/sage/middleware/components/sage_db/python/multimodal_sage_db.py`

支持的模态类型：

- TEXT (文本)
- IMAGE (图片)
- AUDIO (音频)
- VIDEO (视频)
- TABULAR (表格)
- TIME_SERIES (时间序列)
- CUSTOM (自定义)

融合策略 (7 种)：CONCATENATION, WEIGHTED_AVERAGE, ATTENTION_BASED, CROSS_MODAL_TRANSFORMER, TENSOR_FUSION,
BILINEAR_POOLING, CUSTOM

### 3. Autostop Service

**功能**: 允许 SAGE 应用在完成任务后自动停止并正确清理后台服务。

支持模式：

- ✅ 本地模式 (LocalEnvironment)
- ✅ Ray 模式 (LocalEnvironment + remote=True)
- ⚠️ 完全远程模式 (RemoteEnvironment) - 部分支持

Autostop 相关的开发与问题修复笔记包括：

- `AUTOSTOP_MODE_SUPPORT.md` - 不同执行环境下 Autostop 模式的支持情况与边界。
- `FIX_AUTOSTOP_SERVICE_CLEANUP.md` - 服务清理与退出流程的修复总结。
- `REMOTE_AUTOSTOP_IMPLEMENTATION.md`、`REMOTE_MODE_SUPPORT.md` - 远程模式下的实现差异与已知限制。

整体建议阅读顺序为：先看本 README 中的概览，再按需查阅上述文档获取细节实现与历史问题背景。

### 4. Document Storage & Memory 统计

文档存储与记忆统计相关的设计与状态追踪集中在以下文档中：

- `DOCUMENT_STORAGE_FEATURE.md` - 文档存储功能架构设计。
- `DOCUMENT_STORAGE_STATUS.md` - 实现进度与完成状态（✅）。
- `DOCUMENT_STORAGE_USER_GUIDE.md` - 面向用户的文档存储使用手册。
- `MEMORY_STATISTICS_FEATURE.md` - Neuromem 记忆统计/监控能力设计。

这些文档共同描述了从「架构设计 → 实现落地 → 用户使用 → 运行时观测」的一条完整链路。

### 5. SONG GPU ANN 后端

**位置**: `packages/sage-middleware/src/sage/middleware/components/sage_db/`

已完成从 `sage-db_outdated` 到现代 `sage_db` 的迁移，移除 LibTorch 依赖，保留 CUDA kernel 实现；迁移过程与验证记录在
`SONG_MIGRATION_COMPLETE.md` 中。

## 已完成的功能

| 功能                      | 状态 | 相关文档                       |
| ------------------------- | :--: | ------------------------------ |
| Document Storage          |  ✅  | `DOCUMENT_STORAGE_STATUS.md`   |
| Graph Memory Collection   |  ✅  | `GRAPH_MEMORY_FINAL_STATUS.md` |
| Autostop Local Mode       |  ✅  | `AUTOSTOP_MODE_SUPPORT.md`     |
| SONG GPU Migration        |  ✅  | `SONG_MIGRATION_COMPLETE.md`   |

## 代码位置参考

```
packages/sage-middleware/src/sage/middleware/
├── components/
│   ├── sage_db/           # 数据库组件（含 multimodal、SONG）
│   ├── sage_mem/          # 内存系统
│   │   └── neuromem/      # 🔗 git submodule
│   ├── sage_flow/         # 数据流组件
│   ├── sage_refiner/      # Refiner 组件
│   └── sage_tsdb/         # 时序数据库
├── operators/             # 中间件算子
├── context/               # 上下文管理
└── utils/                 # 工具函数
```

## 相关资源

- [公共文档](../../guides/packages/sage-middleware/overview.md)
- [L3 Libs Dev Notes](../l3-libs/) - 上游依赖
