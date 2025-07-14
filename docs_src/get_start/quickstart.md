# 快速开始 Quickstart

本节将引导你在几分钟内完成 SAGE 系统的最小化运行，了解核心模块的调用方式和执行流程。我们提供两种推荐的入门方式：

- 使用 Memory Toolkit 构造最小存储任务流
- 使用 Fluent API 构建声明式流水线执行图

---

## ✅ 前提要求

!!! note "环境要求"
    在执行示例前，请确保已完成基本安装（参考 [安装指南](install.md)），并激活相应的 Python/Conda 环境。

---
### (1). 初始化向量库和嵌入模型

```python
from sage.core.neuromem.memory_manager import MemoryManager
from sage.core.models.mock_model import MockTextEmbedder

mgr = MemoryManager()
embedder = MockTextEmbedder(fixed_dim=16)
col = mgr.create_collection(
    name="test_vdb",
    backend_type="VDB",
    description="test VDB",
    embedding_model=embedder,
    dim=16
)
```

### (2). 插入文本及元数据

```python
col.add_metadata_field("tag")
col.insert("Alpha", {"tag": "A"})
col.insert("Beta", {"tag": "B"})
col.insert("Gamma", {"tag": "A"})
```

### (3). 创建索引（含元数据过滤）

```python
col.create_index("global_index")
col.create_index("tag_A_index", metadata_filter_func=lambda m: m.get("tag") == "A")
```

### (4). 检索相似文本

```python
res1 = col.retrieve("Alpha", topk=1, index_name="global_index")
res2 = col.retrieve("Alpha", topk=5, index_name="tag_A_index")
```

### (5). 持久化 Collection 至本地

```python
mgr.store_collection()
print("Saved to:", mgr.data_dir)
```

### (6). 重新加载 Collection

```python
mgr2 = MemoryManager()
embedder2 = MockTextEmbedder(fixed_dim=16)
col2 = mgr2.connect_collection("test_vdb", embedding_model=embedder2)
```

### (7). 删除所有本地数据（可选）

```python
from sage.core.neuromem.memory_collection.vdb_collection import VDBMemoryCollection
import os

VDBMemoryCollection.clear("test_vdb", mgr.data_dir)
manager_json = os.path.join(mgr.data_dir, "manager.json")
if os.path.exists(manager_json):
    os.remove(manager_json)
```

---

## 🔧 使用 Fluent API 构建 RAG 流水线

SAGE 提供声明式、可组合的 API 接口构建数据流，以下为典型 RAG 管线：

```python
from sage import Environment, FileSource, DenseRetriever, QAPromptor, OpenAIGenerator, TerminalSink

pipeline = Environment(name="example_pipeline", use_ray=False)

query_stream = (pipeline
   .from_source(FileSource, config)
   .map(DenseRetriever, config)
   .map(QAPromptor, config)
   .map(OpenAIGenerator, config)
   .sink(TerminalSink, config)
   )

# 提交任务
pipeline.submit(config={"is_long_running": False})
```

### 📘 config 配置说明

每个 Operator 的运行需传入 config 参数，你可在项目中的 `config/` 文件夹中找到示例。

### 📘 分布式执行（Ray）

若需启用分布式执行，只需设置：
```python
pipeline = Environment(name="example_pipeline", use_ray=True)
```

### 📘 长生命周期服务

若管线需长期运行，请设置：
```python
pipeline.submit(config={"is_long_running": True})
```

---

## ⚠️ 注意事项

!!! warning "模块路径变化提示"
    若你基于不同版本运行上述代码，部分模块路径或参数可能有所调整。请参阅 [`mkdocs.yml`] 中 Reference 区的最新 API 文档。

---

## 🧠 更多建议

- 若希望使用 YAML 配置运行流水线，请参阅 Dashboard 模块与编译器部分。
- 若希望自定义 Operator（如 Embedding、Retrieval、Ranking），请前往 `operator` 模块阅读详细接口说明。

---

如需获取更多示例，请前往 [Examples](../examples/minimal.md) 页面。
