
# SAGE 扩展体系概览

SAGE 的 C++ 扩展通过 Python 包命名空间统一暴露，核心目录位于：

- `packages/sage/src/sage`
- `packages/sage-common/src/sage`
- `packages/sage-libs/src/sage`
- `packages/sage-kernel/src/sage`
- `packages/sage-middleware/src/sage`

这些目录下的 `__init__.py` 文件会通过如下语句扩展命名空间，以便语言服务器能够识别并补全各个子模块：

```python
# 扩展命名空间包路径以支持子包
__path__ = __import__("pkgutil").extend_path(__path__, __name__)
```

版本信息由 `packages/sage/src/sage/_version.py` 统一维护，并在 `packages/sage/pyproject.toml` 中通过 `version = { attr = "sage._version.__version__" }` 自动注入，确保所有扩展使用一致的版本号。

当前重点维护的原生扩展包括 **SAGE DB** 与 **SAGE Flow**，后续还会陆续扩展更多高性能能力。

## 🔍 SAGE DB — 高性能向量数据库扩展

SAGE DB 是基于 FAISS 的原生向量数据库扩展，提供高维向量检索与复杂查询能力。

- **核心能力**
	- 向量索引管理：支持 `IndexType.AUTO`、IVF、HNSW 等多种索引类型，可按需切换。
	- 元数据与混合检索：提供 `filtered_search`、`hybrid_search` 等 API 同时处理向量与文本条件。
	- 多模态增强：在 `multimodal_sage_db` 中扩展了多模态处理、融合算法与加权策略。
	- Python/CPP 双栈：`python/sage_db.py` 暴露 Python API，同时维护 C++ 测试与示例。
- **典型场景**
	- 构建企业级向量检索服务。
	- 支持 RAG、语义搜索与多模态数据融合。
	- 大规模批量导入与离线索引构建。
- **目录与资源**
	- `packages/sage-middleware/src/sage/middleware/components/sage_db/`
	- 文档：`docs/multimodal_fusion_design.md`
	- 示例：`examples/`、`tests/`
- **安装与检测**
	- `sage extensions install sage_db`
	- `sage extensions status` 可查看扩展编译结果，`tools/tests/test_cpp_extensions.py` 含有可用性自检。

## 🌊 SAGE Flow — 向量流式处理引擎

SAGE Flow 面向实时流场景，提供向量级别的窗口计算与状态快照能力。

- **核心能力**
	- 向量流算子：内置 `StreamEnvironment`、`Stream`、`SimpleStreamSource` 等，支持 TopK、Filter、Join 等逻辑。
	- 低延迟更新：通过三阶段流水线（写入、状态物化、快照暴露）实现毫秒级增量更新。
	- RAG 友好：在处理流数据的同时与向量数据库保持实时同步，适合 LLM 场景。
	- Python API：`python/sage_flow.py` 对外提供 `SageFlow` 类与快捷工厂方法，简化上层集成。
- **典型场景**
	- 实时对话/Agent 系统的动态语境维护。
	- 高速传感器/行为日志的实时聚合。
	- 结合 SAGE DB 的联动处理与实时推理。
- **目录与资源**
	- `packages/sage-middleware/src/sage/middleware/components/sage_flow/`
	- 文档：`docs/Design.md`、`docs/Structure.md`
	- 示例：`examples/`、`test/` 中的集成案例。
- **安装与检测**
	- `sage extensions install sage_flow`
	- 构建脚本 `build.sh` 可自动拉起依赖；`tools/tests/test_cpp_extensions.py` 覆盖加载校验。

## 🛠️ 扩展安装与排障

使用 `sage extensions` CLI 可以统一安装、查看和清理扩展：

- `sage extensions install`：安装全部已支持扩展。
- `sage extensions install sage_db` / `sage extensions install sage_flow`：按需安装单个扩展。
- `sage extensions status`：检查扩展编译状态与系统依赖。
- `sage extensions clean`：清理历史构建产物，方便重新编译。

扩展在运行时通过 `sage.middleware.components.extensions_compat` 模块自动检测可用性，若缺失会给出安装提示。

## 🚀 演进计划

为了更好地支撑多模态、实时和企业级场景，我们会持续引入更多扩展能力，例如：

- 更丰富的向量算子与 GPU 加速算子。
- 针对行业场景的专用索引与融合策略。
- 与外部系统联动的流式 connector、调度器等。

欢迎在 `packages/sage-middleware/src/sage/middleware/components/` 下提交新的扩展方案或 Issue，一起完善 SAGE 的扩展生态。


