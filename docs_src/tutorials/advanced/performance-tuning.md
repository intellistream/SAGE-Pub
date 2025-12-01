# 性能调优

> **目标**：优化 SAGE 应用的性能和资源使用

## 概述

SAGE 应用的性能优化涉及多个层面：Pipeline 吞吐量、LLM 推理延迟、Embedding 批处理效率、GPU 资源利用率等。本教程介绍常见的性能优化技术和最佳实践。

## 性能分析

### 识别瓶颈

首先需要了解系统的性能瓶颈所在：

```python
import time
from sage.common.core.functions.map_function import MapFunction


class ProfiledOperator(MapFunction):
    """带性能分析的算子"""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.total_time = 0
        self.call_count = 0
    
    def execute(self, data):
        start = time.perf_counter()
        
        result = self._process(data)
        
        elapsed = time.perf_counter() - start
        self.total_time += elapsed
        self.call_count += 1
        
        # 每 100 次输出统计
        if self.call_count % 100 == 0:
            avg_time = self.total_time / self.call_count * 1000
            print(f"[{self.__class__.__name__}] "
                  f"调用次数: {self.call_count}, "
                  f"平均耗时: {avg_time:.2f}ms")
        
        return result
    
    def _process(self, data):
        # 子类重写此方法
        return data
```

### 使用 cProfile 分析

```python
import cProfile
import pstats
from io import StringIO

def profile_pipeline():
    """对 Pipeline 进行性能分析"""
    profiler = cProfile.Profile()
    profiler.enable()
    
    # 运行你的 Pipeline
    run_my_pipeline()
    
    profiler.disable()
    
    # 输出分析结果
    stream = StringIO()
    stats = pstats.Stats(profiler, stream=stream)
    stats.sort_stats('cumulative')
    stats.print_stats(20)
    print(stream.getvalue())
```

## LLM 推理优化

### 使用 Control Plane 调度

SAGE 的 Control Plane 提供智能的 LLM 请求调度：

```python
from sage.common.components.sage_llm import UnifiedInferenceClient

# Control Plane 模式：支持多实例负载均衡
client = UnifiedInferenceClient.create_with_control_plane(
    llm_base_url="http://localhost:8901/v1",
    llm_model="Qwen/Qwen2.5-7B-Instruct",
    embedding_base_url="http://localhost:8090/v1",
    embedding_model="BAAI/bge-m3",
)

# 查看状态
print(client.get_status())
```

### 批量请求优化

```python
from sage.common.core.functions.map_function import MapFunction


class BatchLLMOperator(MapFunction):
    """批量 LLM 请求算子"""
    
    def __init__(self, batch_size=8, timeout=5.0, **kwargs):
        super().__init__(**kwargs)
        self.batch_size = batch_size
        self.timeout = timeout
        self.buffer = []
        self.last_flush = time.time()
    
    def execute(self, data):
        self.buffer.append(data)
        
        # 触发批处理条件：达到批量大小或超时
        should_flush = (
            len(self.buffer) >= self.batch_size or
            time.time() - self.last_flush > self.timeout
        )
        
        if should_flush:
            results = self._process_batch(self.buffer)
            self.buffer = []
            self.last_flush = time.time()
            return results
        
        return None  # 等待更多数据
    
    def _process_batch(self, batch):
        """批量处理 - 减少 API 调用次数"""
        prompts = [item["prompt"] for item in batch]
        
        # 使用批量 API（如果支持）
        responses = []
        for prompt in prompts:
            resp = client.generate(prompt, max_tokens=256)
            responses.append(resp)
        
        return [
            {"prompt": p, "response": r} 
            for p, r in zip(prompts, responses)
        ]
```

### 控制生成参数

```python
# 减少 max_tokens 可显著降低延迟
response = client.chat(
    messages=[{"role": "user", "content": query}],
    max_tokens=128,      # 限制输出长度
    temperature=0.0,     # 确定性输出（无采样开销）
)

# 使用流式输出获得首 token 更快响应
# （适合交互式场景）
```

## Embedding 批处理优化

### 批量嵌入

```python
from sage.common.components.sage_llm import UnifiedInferenceClient

client = UnifiedInferenceClient.create_auto()

# 批量处理 - 高效
texts = ["文本1", "文本2", "文本3", ..., "文本100"]
vectors = client.embed(texts)  # 一次调用

# 逐个处理 - 低效（避免）
for text in texts:
    vector = client.embed(text)  # 100 次调用
```

### 分批处理大数据集

```python
def embed_large_dataset(texts, batch_size=32):
    """分批嵌入大数据集"""
    all_vectors = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        vectors = client.embed(batch)
        all_vectors.extend(vectors)
        
        # 可选：显示进度
        print(f"已处理: {min(i + batch_size, len(texts))}/{len(texts)}")
    
    return all_vectors

# 使用
texts = [...]  # 10000 条文本
vectors = embed_large_dataset(texts, batch_size=64)
```

## Pipeline 并行优化

### 设置算子并行度

```python
from sage.kernel.api.local_environment import LocalEnvironment

env = LocalEnvironment("optimized_pipeline")

stream = (
    env.from_source(DataSource())
    .map(
        CPUIntensiveOperator(),
        parallelism=4  # 4 个并行实例
    )
    .map(
        GPUInferenceOperator(),
        parallelism=2  # GPU 算子通常不需要太高并行度
    )
    .sink(OutputSink())
)
```

### 分布式扩展

```python
from sage.kernel.api.remote_environment import RemoteEnvironment

# 使用远程环境支持多节点
env = RemoteEnvironment(
    name="distributed_app",
    host="127.0.0.1",
    port=19001,
    config={
        "ray": {
            "address": "ray://localhost:10001",
            "num_cpus": 32,
            "num_gpus": 4,
        }
    }
)
```

## 内存优化

### 流式处理避免内存峰值

```python
class StreamingProcessor(MapFunction):
    """流式处理，避免一次性加载全部数据"""
    
    def execute(self, data):
        # 处理单条数据，立即输出
        result = process(data)
        return result
        # 不要在算子中累积大量数据
```

### 及时释放资源

```python
class ResourceAwareOperator(MapFunction):
    """资源感知算子"""
    
    def open(self, context):
        """初始化资源"""
        self.model = load_model()
    
    def execute(self, data):
        result = self.model.predict(data)
        return result
    
    def close(self):
        """释放资源"""
        if hasattr(self, 'model'):
            del self.model
            import gc
            gc.collect()  # 触发垃圾回收
```

### 监控内存使用

```python
import psutil
import os

def get_memory_usage():
    """获取当前进程内存使用"""
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / 1024 / 1024  # MB


class MemoryMonitorOperator(MapFunction):
    """内存监控算子"""
    
    def __init__(self, threshold_mb=1000, **kwargs):
        super().__init__(**kwargs)
        self.threshold = threshold_mb
        self.check_interval = 100
        self.counter = 0
    
    def execute(self, data):
        self.counter += 1
        
        if self.counter % self.check_interval == 0:
            memory_mb = get_memory_usage()
            if memory_mb > self.threshold:
                print(f"Warning: 内存使用: {memory_mb:.1f}MB (超过阈值)")
        
        return data
```

## GPU 优化

### 显存管理

```python
import torch

# 清理 GPU 缓存
def clear_gpu_cache():
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        torch.cuda.synchronize()

# 在算子 close() 中调用
class GPUOperator(MapFunction):
    def close(self):
        clear_gpu_cache()
```

### 混合精度推理

```python
# vLLM 启动时使用半精度
# sage llm serve --model <model> --gpu-memory 0.5

# 或在 UnifiedInferenceClient 配置中
client = UnifiedInferenceClient(
    llm_base_url="http://localhost:8901/v1",
    llm_model="Qwen/Qwen2.5-7B-Instruct",
    # vLLM 服务端配置 --dtype bfloat16 或 --dtype half
)
```

## 网络优化

### 连接池复用

```python
from sage.common.components.sage_llm import UnifiedInferenceClient

# 使用单例模式复用客户端
client = UnifiedInferenceClient.get_instance("default")

# 避免在每次请求时创建新客户端
```

### 本地服务优先

```python
# UnifiedInferenceClient 默认优先检测本地服务
client = UnifiedInferenceClient.create_auto(
    prefer_local=True  # 默认为 True
)

# 本地服务延迟更低
# - localhost:8901 (LLM)
# - localhost:8090 (Embedding)
```

## 性能基准测试

### 使用 sage-benchmark

```bash
# LLM 调度性能测试
sage-cp-bench run --mode llm --policy fifo --requests 100

# 混合工作负载测试
sage-cp-bench run --mode hybrid --policy hybrid_slo --llm-ratio 0.7

# 策略对比
sage-cp-bench compare --mode llm --policies fifo,priority,slo_aware
```

### 自定义基准测试

```python
import time
from statistics import mean, stdev


def benchmark_llm(client, prompts, warmup=5):
    """LLM 延迟基准测试"""
    
    # Warmup
    for prompt in prompts[:warmup]:
        client.generate(prompt, max_tokens=50)
    
    # 测试
    latencies = []
    for prompt in prompts:
        start = time.perf_counter()
        client.generate(prompt, max_tokens=50)
        latencies.append(time.perf_counter() - start)
    
    print(f"平均延迟: {mean(latencies)*1000:.1f}ms")
    print(f"标准差: {stdev(latencies)*1000:.1f}ms")
    print(f"P95 延迟: {sorted(latencies)[int(len(latencies)*0.95)]*1000:.1f}ms")


def benchmark_embedding(client, texts, batch_size=32):
    """Embedding 吞吐量基准测试"""
    
    start = time.perf_counter()
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        client.embed(batch)
    
    elapsed = time.perf_counter() - start
    throughput = len(texts) / elapsed
    
    print(f"总耗时: {elapsed:.2f}s")
    print(f"吞吐量: {throughput:.1f} texts/s")
```

## 最佳实践总结

### 推荐做法

| 场景 | 优化方法 |
|------|---------|
| LLM 高并发 | 使用 Control Plane 模式，启用负载均衡 |
| 大量 Embedding | 批量处理，batch_size=32-64 |
| 内存敏感 | 流式处理，及时释放资源 |
| GPU 受限 | 使用半精度，控制并行度 |
| 网络延迟 | 优先使用本地服务，复用连接 |

### 避免的问题

- 逐条调用 Embedding API
- 在算子中累积大量数据
- 忽略 GPU 显存清理
- 每次请求创建新客户端
- 未设置合理的超时时间

## 相关阅读

- [分布式 Pipeline](distributed-pipeline.md) - 多节点扩展
- [自定义算子](custom-operators.md) - 算子生命周期
- [容错与可靠性](fault-tolerance.md) - 生产环境部署
- [sage-benchmark 文档](../../guides/packages/sage-benchmark/index.md)

---

**下一步**：学习 [容错与可靠性](fault-tolerance.md) 构建高可用系统
