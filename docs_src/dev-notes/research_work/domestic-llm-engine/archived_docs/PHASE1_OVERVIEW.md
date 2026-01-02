# Phase 1 模块总览与集成指南

> **Phase**: Week 3-5 | **大方向**: 通信与传输优化 | **模块数**: 5 个独立子模块

## 架构概览

Phase 1 专注于**分布式推理的通信优化**，包含 5 个完全独立的子模块：

```
comm/  (通信与传输优化)
├── topology/              # 1.1 拓扑感知与优化（基础层）
├── collective_ops/        # 1.2 集合通信优化（核心层）
├── kv_transfer/           # 1.3 KV 跨节点传输（应用层）
├── overlap/               # 1.4 计算通信重叠（调度层）
└── domestic/              # 1.5 国产互联适配（可选层）
```

### 模块依赖关系（自下而上）

```
┌─────────────────────────────────────────────────┐
│  engines/lmdeploy (引擎集成层)                   │
└─────────────────────────────────────────────────┘
                     ▲
                     │
┌────────────────────┴────────────────────────────┐
│  comm/overlap (调度层)                          │
│  - 调度计算-通信重叠                             │
│  - CUDA Stream 管理                             │
└────────────────────┬────────────────────────────┘
                     ▲
                     │
┌────────────────────┴────────────────────────────┐
│  comm/kv_transfer (应用层)                      │
│  - KV Cache 跨节点传输                          │
│  - Disaggregated serving                        │
└────────────────────┬────────────────────────────┘
                     ▲
                     │
┌────────────────────┴────────────────────────────┐
│  comm/collective_ops (核心层)                   │
│  - All_reduce/all_gather/reduce_scatter         │
│  - 通信融合                                     │
│  - 支持: NCCL/Gloo/HCCL/CNCL                    │
└────────────────────┬────────────────────────────┘
                     ▲
         ┌───────────┴───────────┐
         │                       │
┌────────┴──────────┐  ┌────────┴──────────────┐
│  comm/topology    │  │  comm/domestic        │
│  (基础层)         │  │  (可选层)              │
│  - 硬件拓扑探测   │  │  - 国产加速器适配      │
│  - 通信成本模型   │  │  - HCCL/CNCL 后端      │
└───────────────────┘  └─────────────────────────┘
```

______________________________________________________________________

## 关键设计决策

### 1. 命名空间规范（CRITICAL）

**统一前缀**: `sagellm.comm.*`

| 模块 | Python 包路径 | Git Repo |
|------|--------------|----------|
| topology | `sagellm.comm.topology` | `sageLLM-topology` |
| collective_ops | `sagellm.comm.collective_ops` | `sageLLM-collective-ops` |
| kv_transfer | `sagellm.comm.kv_transfer` | `sageLLM-kv-transfer` |
| overlap | `sagellm.comm.overlap` | `sageLLM-overlap` |
| domestic | `sagellm.comm.domestic` | `sageLLM-domestic` |

**示例**:
```python
# 典型导入
from sagellm.comm.topology import TopologyManager
from sagellm.comm.collective_ops import create_comm_backend
from sagellm.comm.kv_transfer import KVTransferChannel
```

### 2. 模块独立性原则

每个模块必须满足：

1. **可单独测试**
   ```bash
   pytest comm/topology/tests/ --no-cov
   ```

2. **可单独 benchmark**
   ```bash
   python -m sagellm.comm.topology.benchmarks.bench_detection
   ```

3. **可用 Mock 替代依赖**
   ```python
   from unittest.mock import Mock
   mock_topo = Mock(spec=TopologyManagerProtocol)
   backend = NCCLBackend(topology_manager=mock_topo)
   ```

4. **支持多种实现**
   ```python
   # collective_ops 支持多后端
   backend = create_comm_backend("nccl")  # 或 "gloo", "hccl", "cncl"
   ```

### 3. 循环依赖避免

**禁止的依赖**:
- ❌ `kv_transfer` → `kv_pool` (会导致循环依赖)
- ❌ `collective_ops` → `overlap` (应该反过来)

**允许的依赖**:
- ✅ `collective_ops` → `topology` (可选，用于优化)
- ✅ `kv_transfer` → `collective_ops` (底层通信原语)
- ✅ `overlap` → `collective_ops` (调度异步通信)

______________________________________________________________________

## 核心协议定义

### Protocol 文件位置（core/）

```
core/protocols/
├── topology.py              # TopologyManagerProtocol
├── comm_backend.py          # CommBackendProtocol
├── kv_transfer.py           # KVTransferChannelProtocol
└── overlap_manager.py       # OverlapManagerProtocol
```

### 典型 Protocol 模式

```python
# core/protocols/comm_backend.py
from abc import ABC, abstractmethod
import torch

class CommBackendProtocol(ABC):
    """集合通信后端协议（所有实现必须遵守）"""
    
    @abstractmethod
    def all_reduce(
        self,
        tensor: torch.Tensor,
        op: str = "sum",
        async_op: bool = False
    ) -> torch.Tensor | torch.futures.Future:
        """All-reduce 操作"""
        pass
    
    @abstractmethod
    def get_stats(self) -> dict:
        """获取通信统计信息"""
        pass
```

**实现示例**:
```python
# comm/collective_ops/nccl_backend.py
from core.protocols.comm_backend import CommBackendProtocol

class NCCLBackend(CommBackendProtocol):
    """NCCL 后端实现"""
    
    def all_reduce(self, tensor, op="sum", async_op=False):
        # 实现 NCCL all_reduce
        ...
```

______________________________________________________________________

## 并行开发策略

### Week 3-5 任务分配

| 人员 | 模块 | 优先级 | 预计工作量 |
|------|------|--------|-----------|
| A | 1.1 topology | P1 | 3 周 |
| B | 1.2 collective_ops | P1 | 3 周 |
| C | 1.3 kv_transfer | P1 | 3 周 |
| D | 1.4 overlap | P1 | 3 周 |
| E | 1.5 domestic | P2 | 2 周（如有硬件）|

**并行条件**:
- ✅ Week 1-2 完成 `core/protocols/` 定义（阻塞项）
- ✅ 每个模块使用 Mock 替代未完成的依赖
- ✅ 集成测试延后到 Week 5

### Week-by-Week Milestones

**Week 3**: MVP + 单元测试
- 每个模块完成核心接口实现
- 单元测试覆盖率 ≥60%
- 可用 Mock 运行

**Week 4**: 优化 + Benchmark
- 性能优化（满足指标）
- 独立 benchmark 通过
- 集成测试准备

**Week 5**: 集成 + 文档
- 模块间集成测试
- API 文档完善
- 示例代码验证

______________________________________________________________________

## 常见问题（FAQ）

### Q1: topology 模块是否必须？collective_ops 能否独立工作？

**A**: 可以独立工作。`topology` 是可选优化项：

```python
# 无 topology（使用默认算法）
backend = create_comm_backend("nccl")
result = backend.all_reduce(tensor)  # ✅ 正常工作

# 有 topology（算法选择优化）
backend = create_comm_backend("nccl", topology_manager=TopologyManager())
result = backend.all_reduce(tensor)  # ✅ 性能更优
```

### Q2: kv_transfer 如何避免与 kv_pool 的循环依赖？

**A**: `kv_transfer` 只负责**传输**，不负责**管理**：

```python
# kv_transfer 提供传输通道
channel = KVTransferChannel()
channel.transfer(blocks, target_node=1)

# kv_pool 调用 kv_transfer（单向依赖）
class KVPoolManager:
    def migrate_to_node(self, blocks, target):
        self.kv_transfer_channel.transfer(blocks, target)
```

### Q3: domestic 是否影响 NCCL 用户？

**A**: 不影响。通过 `backend_type="auto"` 自动选择：

```python
backend = create_comm_backend("auto")
# CUDA GPU → NCCL
# 昇腾 NPU → HCCL
# 寒武纪 MLU → CNCL
```

### Q4: overlap 如何与现有 Tensor Parallel 集成？

**A**: 替换同步 all_reduce 为异步：

```python
# 原始代码（同步）
output = layer(input)
output = comm_backend.all_reduce(output)  # 阻塞

# 改进代码（异步重叠）
output = layer(input)
handle = comm_backend.all_reduce(output, async_op=True)
# ... 下一层计算 ...
handle.wait()
```

### Q5: 如何测试没有多卡硬件的模块？

**A**: 使用 Mock + 单进程模拟：

```python
# 单进程测试
@pytest.mark.skipif(not torch.cuda.is_available(), reason="No GPU")
def test_topology_detection_single_gpu():
    manager = TopologyManager()
    topo_info = manager.detect()
    assert topo_info.num_devices == 1

# Mock 多卡场景
def test_topology_multinode_mock():
    mock_devices = [0, 1, 2, 3]
    with patch('topology.detect_devices', return_value=mock_devices):
        manager = TopologyManager()
        topo_info = manager.detect()
        assert topo_info.num_devices == 4
```

______________________________________________________________________

## 性能目标汇总

| 模块 | 关键指标 | 目标值 | 测量方法 |
|------|---------|--------|---------|
| topology | 探测延迟 | <100ms | 8 卡系统首次探测 |
| topology | 带宽预测误差 | <5% | vs NCCL benchmark |
| collective_ops | All_reduce 延迟 | <20µs | 1MB, 节点内 |
| collective_ops | 带宽利用率 | ≥85% | 实际/理论带宽 |
| kv_transfer | 传输带宽 | ≥50GB/s | InfiniBand |
| kv_transfer | 压缩比 | ≥2x | KV Cache |
| overlap | 重叠效率 | ≥70% | 重叠时间/总通信时间 |
| domestic | 带宽利用率 | ≥80% | vs 厂商声称带宽 |

______________________________________________________________________

## 集成验证清单

### Phase 1 完成标准

- [ ] 所有 5 个模块独立测试通过（单元测试覆盖率 ≥80%）
- [ ] 所有模块独立 benchmark 达到性能目标
- [ ] 模块间集成测试通过（topology + collective_ops + kv_transfer）
- [ ] 与 engines/lmdeploy 集成成功（Tensor Parallel 层正常工作）
- [ ] API 文档完整（每个公共接口有 docstring）
- [ ] 示例代码可运行（examples/ 下有完整示例）
- [ ] CI/CD 通过（所有测试 + 性能回归检测）

### 集成测试场景

1. **端到端 Tensor Parallel**
   ```python
   # 使用 Phase 1 所有模块
   model = LlamaTP(tp_size=4)
   model.load_state_dict(...)
   output = model.generate("Hello")  # 触发 all_reduce + 重叠
   ```

2. **Disaggregated Serving**
   ```python
   # Prefill 节点 → KV Transfer → Decode 节点
   prefill_engine.process(prompt)  # 使用 collective_ops
   kv_blocks = prefill_engine.export_kv()
   kv_transfer_channel.transfer(kv_blocks, decode_node)
   decode_engine.process(kv_blocks)
   ```

3. **国产加速器部署**
   ```python
   # 自动选择 HCCL（昇腾）或 CNCL（寒武纪）
   backend = create_comm_backend("auto")
   result = backend.all_reduce(tensor)  # 透明切换
   ```

______________________________________________________________________

## 参考资源汇总

### 核心论文
1. **NCCL: Optimized Primitives for Collective Multi-GPU Communication** (NVIDIA, 2019)
2. **DistServe: Disaggregating Prefill and Decoding for Serving LLMs** (OSDI 2024)
3. **Mooncake: KVCache-centric Disaggregated Architecture** (SOSP 2024)

### 开源项目
1. [NVIDIA/nccl](https://github.com/NVIDIA/nccl) - NCCL 官方实现
2. [NVIDIA/Megatron-LM](https://github.com/NVIDIA/Megatron-LM) - Tensor/Pipeline Parallel 参考
3. [facebookincubator/gloo](https://github.com/facebookincubator/gloo) - Gloo 通信库
4. [microsoft/DeepSpeed](https://github.com/microsoft/DeepSpeed) - DeepSpeed ZeRO 通信优化

### 工具
- `nvidia-smi topo -m` - NVIDIA GPU 拓扑查询
- `npu-smi info -t topology` - 昇腾拓扑查询
- `iperf3` - 网络带宽测试
- `torch.distributed.launch` - PyTorch 分布式启动器

______________________________________________________________________

## 下一步行动

1. **Review Protocol 定义** (Week 2 末)
   - 召集所有 5 人 review `core/protocols/*.py`
   - 确认接口无歧义、可测试

2. **Kickoff 并行开发** (Week 3 初)
   - 每人 clone 对应的 git submodule
   - 创建开发分支 `feature/module-name`

3. **每周 Sync** (Week 3-5)
   - 周一：进度同步，阻塞问题讨论
   - 周五：代码 review，接口对齐

4. **Week 5 集成测试**
   - 合并所有模块到 main branch
   - 运行完整集成测试套件
   - 准备 Phase 2 (大方向 2: KV 管理与调度)
