# 分布式 Pipeline

> **目标**：学习如何构建可扩展的分布式流式处理应用

## 概述

SAGE 基于 Ray 构建分布式执行能力，支持在多节点集群上运行大规模流式处理任务。

## 分布式环境配置

### 启动 Ray 集群

```bash
# 启动 Head 节点
sage cluster start --head

# 在其他机器上启动 Worker 节点
sage cluster start --worker --head-address=<head-node-ip>:10001
```

### 配置分布式环境

```python
from sage.kernel.api import LocalEnvironment

# 创建分布式执行环境
env = LocalEnvironment(
    "distributed_app",
    config={
        "execution_mode": "distributed",
        "ray": {
            "address": "ray://localhost:10001",  # Ray 集群地址
            "num_cpus": 16,                       # 总 CPU 数
            "num_gpus": 4,                        # 总 GPU 数
        }
    }
)
```

## 并行处理

### 设置并行度

```python
from sage.libs.io import FileSource, ConsoleSink

# 并行读取和处理
stream = (
    env.from_source(FileSource("large_dataset/"))
    .map(
        ProcessFunction(), 
        parallelism=8  # 8 个并行实例
    )
    .filter(FilterFunction(), parallelism=4)
    .sink(ConsoleSink())
)

env.execute()
```

### 资源分配

```python
# 为算子分配特定资源
stream = (
    env.from_source(source)
    .map(
        HeavyComputeOperator(),
        parallelism=4,
        resources={
            "num_cpus": 4,      # 每个实例 4 核
            "memory": "8GB"      # 每个实例 8GB 内存
        }
    )
    .map(
        GPUInferenceOperator(),
        parallelism=2,
        resources={
            "num_gpus": 1       # 每个实例 1 个 GPU
        }
    )
    .sink(sink)
)
```

## 分布式 RAG Pipeline

### 并行 Embedding

```python
from sage.middleware.operators.rag import VLLMEmbeddingOperator, ChromaUpsertOperator

# 大规模文档并行嵌入
stream = (
    env.from_source(ChunkedFileSource("documents/"))
    .map(
        VLLMEmbeddingOperator(
            model="sentence-transformers/all-MiniLM-L6-v2"
        ),
        parallelism=8  # 8 个并行 embedding 实例
    )
    .sink(
        ChromaUpsertOperator(collection="distributed_docs")
    )
)

env.execute()
```

### 并行检索和生成

```python
from sage.middleware.operators.rag import ChromaRetrieverOperator, OpenAIGeneratorOperator

# 高并发查询处理
stream = (
    env.from_source(QuerySource())
    .map(
        ChromaRetrieverOperator(collection="docs", top_k=5),
        parallelism=4  # 4 个并行检索实例
    )
    .map(
        OpenAIGeneratorOperator(model="gpt-4"),
        parallelism=8  # 8 个并行生成实例
    )
    .sink(ResponseSink())
)

env.execute()
```

## 数据分区策略

### Key-Based 分区

```python
# 按 key 分区，确保相同 key 的数据到同一个实例
stream = (
    env.from_source(source)
    .key_by(lambda record: record["user_id"])  # 按用户 ID 分区
    .map(UserSessionOperator(), parallelism=4)
    .sink(sink)
)
```

### 自定义分区

```python
from sage.kernel.api.partitioner import Partitioner

class CustomPartitioner(Partitioner):
    def partition(self, record, num_partitions):
        # 自定义分区逻辑
        hash_value = hash(record["key"])
        return hash_value % num_partitions

stream = (
    env.from_source(source)
    .partition_custom(CustomPartitioner(), parallelism=4)
    .map(operator)
    .sink(sink)
)
```

## 监控和调试

### 查看集群状态

```bash
# 查看 Ray 集群状态
sage cluster status

# 查看作业状态
sage job list
sage job status <job-id>
```

### 资源使用监控

```python
# 在代码中获取资源使用情况
from sage.kernel.api.runtime import RuntimeContext

class MonitoredOperator(MapFunction):
    def open(self, context: RuntimeContext):
        self.metrics = context.get_metrics()
    
    def map(self, record):
        # 记录处理时间
        start = time.time()
        result = self.process(record)
        duration = time.time() - start
        
        self.metrics.record("processing_time", duration)
        return result
```

## 最佳实践

### ✅ 推荐做法

- **合理设置并行度** - 根据数据量和资源情况设置，避免过度并行
- **资源预估** - 提前评估每个算子的资源需求
- **数据分区** - 使用 key_by 保证有状态操作的正确性
- **监控指标** - 持续监控资源使用和处理延迟

### ❌ 避免的问题

- 并行度设置过高导致调度开销增加
- 未考虑数据倾斜导致部分节点过载
- GPU 资源分配不均导致利用率低
- 忽略网络传输开销

## 故障排查

### 常见问题

**问题 1：任务启动慢**

- 检查 Ray 集群连接状态
- 确认资源配置是否合理
- 查看是否有资源争用

**问题 2：部分节点空闲**

- 检查数据分区是否均衡
- 调整并行度配置
- 使用 key-based 分区避免数据倾斜

**问题 3：内存溢出**

- 减少单个算子实例的并行度
- 增加每个实例的内存配置
- 优化算子的内存使用（见[性能调优](performance-tuning.md)）

## 相关阅读

- [Kernel 用户指南](../../guides/packages/sage-kernel/README.md) - 执行引擎详解
- [性能调优](performance-tuning.md) - 优化分布式性能
- [容错与可靠性](fault-tolerance.md) - 分布式容错机制

---

**下一步**：学习 [自定义算子](custom-operators.md) 封装业务逻辑
