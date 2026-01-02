# sageLLM MVP 路线图：CUDA 优先闭环验证

> **文档状态**: MVP 规划  
> **更新时间**: 2026-01-02  
> **目标**: 无国产硬件条件下完成 sageLLM 基础闭环  
> **策略**: CUDA 实现优先，预留国产硬件适配接口

---

## 🎯 核心理念

**在没有国产硬件的情况下，我们可以先用 NVIDIA GPU 完成 sageLLM 的核心架构和算法验证，为后续国产硬件适配打下基础。**

### 关键原则

1. **架构优先，硬件其次**: 先验证模块化设计、Protocol 定义、调度策略
2. **抽象层设计**: 通信/Kernel 层使用抽象接口，便于后续替换
3. **CUDA as Reference**: CUDA/NCCL 作为参考实现，国产硬件对标
4. **增量演进**: 先 CUDA 闭环，再逐步添加国产硬件支持

---

## 📋 MVP 范围定义

### Phase 0: 最小闭环（2 周）

**目标**: 证明 sageLLM 架构可行，能在 NVIDIA GPU 上运行

#### 必做功能（P0）

| 模块 | 功能范围 | CUDA 实现 | 国产硬件 |
|------|---------|----------|---------|
| **core/** | Protocol/types 定义 | ✅ 完整 | ⏸️ 预留接口 |
| **scheduler_ir/** | Prefill/Decode 分离 IR | ✅ 完整 | ⏸️ 预留接口 |
| **kv_runtime/** | KV block 池化管理 | ✅ CUDA 内存管理 | ⏸️ 预留 NPU 接口 |
| **comm_backend/** | 通信抽象层 | ✅ NCCL 实现 | ⏸️ 预留 HCCL/CNCL 接口 |
| **engines/** | 引擎注册到 Control Plane | ✅ 完整 | N/A |

#### 暂缓功能（P1-P2）

- ❌ prefix_reuse（前缀复用）- 可后续添加
- ❌ kv_policy（淘汰策略）- 先用简单 LRU
- ❌ accel/quantization（量化）- 先用 FP16/BF16
- ❌ accel/sparsity（稀疏化）- 可选优化
- ❌ accel/speculative（投机解码）- 可选优化
- ❌ comm_backend/domestic（国产互联）- 等硬件到位

---

## 🏗️ MVP 架构设计

### 目录结构（最小化）

```
packages/sage-llm-core/src/sage/llm/engines/sagellm/
├── __init__.py                  # 引擎入口
├── engine.py                    # SageLLMEngine 主类（实现 BaseInferenceEngine）
├── core/                        # 核心协议层（硬件无关）
│   ├── __init__.py
│   ├── protocols.py             # Protocol 定义
│   ├── types.py                 # 数据类型（KVBlock, RequestMetadata, etc.）
│   └── config.py                # 配置管理
├── scheduler_ir/                # 调度 IR（硬件无关）
│   ├── __init__.py
│   ├── ir_builder.py            # IR 构建器
│   ├── ir_executor.py           # IR 执行器
│   └── pd_separation.py         # Prefill/Decode 分离逻辑
├── kv_runtime/                  # KV Cache 运行时
│   ├── __init__.py
│   ├── pool_manager.py          # KV block 池化管理
│   ├── backends/                # 后端抽象
│   │   ├── __init__.py
│   │   ├── base.py              # KVBackendProtocol
│   │   ├── cuda_backend.py      # ✅ CUDA 实现（MVP）
│   │   └── npu_backend.py       # ⏸️ 国产 NPU 接口（预留）
│   └── memory_allocator.py      # 内存分配器（CUDA first）
├── comm_backend/                # 通信层
│   ├── __init__.py
│   ├── base.py                  # CommBackendProtocol
│   ├── nccl_backend.py          # ✅ NCCL 实现（MVP）
│   └── domestic/                # ⏸️ 国产互联（预留目录）
│       └── __init__.py
└── benchmarks/                  # 性能测试
    ├── __init__.py
    └── bench_mvp.py             # MVP 基准测试
```

---

## 📐 核心设计：硬件抽象层

### 1. KV Runtime Backend Protocol

```python
# packages/sage-llm-core/src/sage/llm/engines/sagellm/kv_runtime/backends/base.py

from abc import ABC, abstractmethod
from typing import Any

class KVBackendProtocol(ABC):
    """KV Cache 后端抽象协议（硬件无关）"""
    
    @abstractmethod
    def allocate_blocks(self, num_blocks: int, block_size: int) -> list[int]:
        """分配 KV blocks（返回 block IDs）"""
        pass
    
    @abstractmethod
    def free_blocks(self, block_ids: list[int]) -> None:
        """释放 KV blocks"""
        pass
    
    @abstractmethod
    def copy_blocks(self, src_ids: list[int], dst_ids: list[int]) -> None:
        """跨设备/节点拷贝 blocks"""
        pass
    
    @abstractmethod
    def get_memory_usage(self) -> dict[str, Any]:
        """获取显存使用情况"""
        pass
```

### 2. CUDA Backend 实现（MVP）

```python
# packages/sage-llm-core/src/sage/llm/engines/sagellm/kv_runtime/backends/cuda_backend.py

import torch
from .base import KVBackendProtocol

class CUDAKVBackend(KVBackendProtocol):
    """CUDA 版本的 KV Cache 后端（MVP 实现）"""
    
    def __init__(self, device: str = "cuda:0", block_size: int = 16):
        self.device = torch.device(device)
        self.block_size = block_size
        self.blocks = {}  # block_id -> Tensor
        self.free_list = []
        self.next_id = 0
    
    def allocate_blocks(self, num_blocks: int, block_size: int) -> list[int]:
        block_ids = []
        for _ in range(num_blocks):
            if self.free_list:
                block_id = self.free_list.pop()
            else:
                block_id = self.next_id
                self.next_id += 1
                # 分配 CUDA 内存
                self.blocks[block_id] = torch.empty(
                    (block_size, 128, 128),  # (seq_len, num_heads, head_dim)
                    device=self.device,
                    dtype=torch.float16
                )
            block_ids.append(block_id)
        return block_ids
    
    def free_blocks(self, block_ids: list[int]) -> None:
        self.free_list.extend(block_ids)
    
    def copy_blocks(self, src_ids: list[int], dst_ids: list[int]) -> None:
        for src, dst in zip(src_ids, dst_ids):
            self.blocks[dst].copy_(self.blocks[src])
    
    def get_memory_usage(self) -> dict[str, Any]:
        return {
            "allocated_blocks": len(self.blocks),
            "free_blocks": len(self.free_list),
            "memory_mb": torch.cuda.memory_allocated(self.device) / 1024 / 1024
        }
```

### 3. 国产 NPU Backend 接口（预留）

```python
# packages/sage-llm-core/src/sage/llm/engines/sagellm/kv_runtime/backends/npu_backend.py

from .base import KVBackendProtocol

class AscendKVBackend(KVBackendProtocol):
    """昇腾 NPU 版本的 KV Cache 后端（预留接口）"""
    
    def __init__(self, device: str = "npu:0", block_size: int = 16):
        # TODO: 等硬件到位后实现
        raise NotImplementedError("Ascend NPU backend not implemented yet")
    
    def allocate_blocks(self, num_blocks: int, block_size: int) -> list[int]:
        # TODO: 使用 torch_npu 实现
        pass
    
    # ... 其他方法类似


class MLUKVBackend(KVBackendProtocol):
    """寒武纪 MLU 版本的 KV Cache 后端（预留接口）"""
    
    def __init__(self, device: str = "mlu:0", block_size: int = 16):
        # TODO: 等硬件到位后实现
        raise NotImplementedError("MLU backend not implemented yet")
```

---

## 🔧 Comm Backend 抽象设计

### 1. Comm Backend Protocol

```python
# packages/sage-llm-core/src/sage/llm/engines/sagellm/comm_backend/base.py

from abc import ABC, abstractmethod
import torch

class CommBackendProtocol(ABC):
    """通信后端抽象协议"""
    
    @abstractmethod
    def all_reduce(self, tensor: torch.Tensor, op: str = "sum") -> torch.Tensor:
        """All-reduce 操作"""
        pass
    
    @abstractmethod
    def all_gather(self, tensor: torch.Tensor) -> list[torch.Tensor]:
        """All-gather 操作"""
        pass
    
    @abstractmethod
    def send_kv_blocks(self, blocks: list[torch.Tensor], dst_rank: int) -> None:
        """发送 KV blocks 到目标节点"""
        pass
    
    @abstractmethod
    def recv_kv_blocks(self, src_rank: int) -> list[torch.Tensor]:
        """从源节点接收 KV blocks"""
        pass
    
    @abstractmethod
    def get_bandwidth_stats(self) -> dict[str, float]:
        """获取通信带宽统计"""
        pass
```

### 2. NCCL Backend 实现（MVP）

```python
# packages/sage-llm-core/src/sage/llm/engines/sagellm/comm_backend/nccl_backend.py

import torch
import torch.distributed as dist
from .base import CommBackendProtocol

class NCCLCommBackend(CommBackendProtocol):
    """NCCL 版本的通信后端（MVP 实现）"""
    
    def __init__(self, rank: int, world_size: int):
        self.rank = rank
        self.world_size = world_size
        # 初始化 NCCL
        if not dist.is_initialized():
            dist.init_process_group(backend="nccl")
    
    def all_reduce(self, tensor: torch.Tensor, op: str = "sum") -> torch.Tensor:
        op_map = {"sum": dist.ReduceOp.SUM, "max": dist.ReduceOp.MAX}
        dist.all_reduce(tensor, op=op_map[op])
        return tensor
    
    def all_gather(self, tensor: torch.Tensor) -> list[torch.Tensor]:
        tensor_list = [torch.empty_like(tensor) for _ in range(self.world_size)]
        dist.all_gather(tensor_list, tensor)
        return tensor_list
    
    def send_kv_blocks(self, blocks: list[torch.Tensor], dst_rank: int) -> None:
        for block in blocks:
            dist.send(block, dst=dst_rank)
    
    def recv_kv_blocks(self, src_rank: int) -> list[torch.Tensor]:
        # 简化版本：预先知道 block 数量
        blocks = []
        # TODO: 实现动态接收逻辑
        return blocks
    
    def get_bandwidth_stats(self) -> dict[str, float]:
        # TODO: 实现带宽统计
        return {"avg_bandwidth_gbps": 0.0}
```

### 3. 国产互联 Backend（预留）

```python
# packages/sage-llm-core/src/sage/llm/engines/sagellm/comm_backend/domestic/hccl_backend.py

from ..base import CommBackendProtocol

class HCCLCommBackend(CommBackendProtocol):
    """昇腾 HCCL 版本的通信后端（预留接口）"""
    
    def __init__(self, rank: int, world_size: int):
        # TODO: 等硬件到位后实现
        raise NotImplementedError("HCCL backend not implemented yet")
    
    # ... 其他方法
```

---

## 🚀 MVP 实现步骤

### Week 1: 基础架构搭建

**Day 1-2: 目录与 Protocol**
```bash
# 创建目录结构
mkdir -p packages/sage-llm-core/src/sage/llm/engines/sagellm/{core,scheduler_ir,kv_runtime,comm_backend}

# 实现核心 Protocol
- core/protocols.py: KVBackendProtocol, CommBackendProtocol
- core/types.py: KVBlock, RequestMetadata, SchedulingDecision
- core/config.py: SageLLMConfig
```

**Day 3-4: KV Runtime（CUDA）**
```python
# 实现 CUDA KV Backend
- kv_runtime/backends/cuda_backend.py: CUDAKVBackend
- kv_runtime/pool_manager.py: KVPoolManager（使用 CUDAKVBackend）
- 单元测试: tests/test_kv_runtime_cuda.py
```

**Day 5-7: Scheduler IR**
```python
# 实现调度 IR
- scheduler_ir/ir_builder.py: IRBuilder
- scheduler_ir/ir_executor.py: IRExecutor
- scheduler_ir/pd_separation.py: PrefillDecodeScheduler
- 单元测试: tests/test_scheduler_ir.py
```

---

### Week 2: 引擎集成与验证

**Day 8-10: Comm Backend（NCCL）**
```python
# 实现 NCCL 通信后端
- comm_backend/nccl_backend.py: NCCLCommBackend
- 集成测试: tests/test_comm_nccl.py（2 卡测试）
```

**Day 11-12: SageLLMEngine 主类**
```python
# 实现引擎主类
- engine.py: SageLLMEngine (继承 BaseInferenceEngine)
  - setup(): 初始化 KV runtime + Comm backend
  - generate(): 推理入口
  - get_capability(): 报告引擎能力
- 注册到 Control Plane
```

**Day 13-14: 端到端测试**
```bash
# 最小闭环验证
sage llm engine start Qwen/Qwen2.5-1.5B-Instruct \
  --engine-kind sagellm \
  --device cuda:0

# Python 测试
python -m pytest packages/sage-llm-core/tests/test_sagellm_mvp.py -v

# 性能基线测试
python packages/sage-llm-core/src/sage/llm/engines/sagellm/benchmarks/bench_mvp.py
```

---

## 📊 MVP 验收标准

### 功能验收

| 测试项 | 验收标准 | 测试方法 |
|--------|---------|---------|
| **引擎注册** | sageLLM 能注册到 Control Plane | `sage llm engine list` 显示 sagellm |
| **单卡推理** | 能完成 chat/generate 请求 | `UnifiedInferenceClient` 调用成功 |
| **KV 管理** | KV block 分配/释放正常 | 内存泄漏测试（100 次请求） |
| **Prefill/Decode 分离** | IR 构建和执行成功 | 日志显示 PD 分离 |
| **多卡通信** | NCCL all_reduce 正常 | 2 卡 tensor parallel 测试 |

### 性能验收（vs vLLM Baseline）

| 指标 | 目标 | 测试场景 |
|------|------|---------|
| **TTFT** | ≥ vLLM × 0.95 | Qwen2.5-1.5B, prompt=512 tokens |
| **TPOT** | ≥ vLLM × 0.95 | output=256 tokens |
| **吞吐量** | ≥ vLLM × 0.90 | batch_size=8, concurrent=16 |
| **内存效率** | KV cache 碎片率 <10% | 运行 100 次请求 |

**允许的性能损失**: MVP 阶段允许 5-10% 的性能损失（未优化）

---

## 🔄 国产硬件适配路径

### 硬件到位后的迁移步骤

#### Step 1: 昇腾 910B 适配（Week 3-4）

```python
# 1. 实现 Ascend KV Backend
class AscendKVBackend(KVBackendProtocol):
    def __init__(self, device: str = "npu:0"):
        import torch_npu  # 昇腾 PyTorch 适配
        self.device = torch.device(device)
    
    def allocate_blocks(self, num_blocks: int, block_size: int):
        # 使用 torch_npu 分配 NPU 内存
        return torch_npu.npu_alloc(...)

# 2. 实现 HCCL Comm Backend
class HCCLCommBackend(CommBackendProtocol):
    def __init__(self):
        import hccl_binding  # 昇腾 HCCL 绑定
        self.hccl_comm = hccl_binding.init()
    
    def all_reduce(self, tensor):
        return self.hccl_comm.all_reduce(tensor)

# 3. 配置切换
sagellm_config = {
    "kv_backend": "ascend",  # 从 "cuda" 切换到 "ascend"
    "comm_backend": "hccl",  # 从 "nccl" 切换到 "hccl"
}
```

#### Step 2: 寒武纪 MLU 适配（Week 5-6）

类似昇腾流程，实现 `MLUKVBackend` 和 `CNCLCommBackend`

#### Step 3: 性能对齐（Week 7-8）

- 对比 CUDA vs 昇腾 vs 寒武纪性能
- 优化 Kernel（如需要）
- 通信带宽调优

---

## 💰 MVP 硬件需求（最小化）

### 推荐配置

| 硬件 | 规格 | 数量 | 用途 | 预算 |
|------|------|------|------|------|
| **NVIDIA GPU** | RTX 3090/4090 (24GB) | 2 张 | MVP 开发与测试 | ¥20,000 - ¥30,000 |
| 或 | A100 40GB | 1 张 | 性能基线对比 | ¥50,000（租用云服务器）|

### 云服务器方案（更经济）

| 平台 | 实例类型 | 配置 | 价格 | 适用阶段 |
|------|---------|------|------|---------|
| **阿里云** | ecs.gn7i-c16g1.4xlarge | 1 × A10 (24GB) | ¥10/小时 | MVP 开发 |
| **腾讯云** | GN7.2XLARGE32 | 1 × V100 (16GB) | ¥8/小时 | 功能测试 |
| **AWS** | p3.2xlarge | 1 × V100 (16GB) | $3/小时 | 性能基线 |

**MVP 阶段总成本**: ¥5,000 - ¥10,000（云服务器 2 个月）

---

## 📝 开发清单（Checklist）

### Phase 0: MVP 核心（2 周）

- [ ] **Week 1: 基础架构**
  - [ ] Day 1-2: 创建目录 + Protocol 定义
  - [ ] Day 3-4: CUDA KV Backend 实现
  - [ ] Day 5-7: Scheduler IR 实现
  
- [ ] **Week 2: 引擎集成**
  - [ ] Day 8-10: NCCL Comm Backend 实现
  - [ ] Day 11-12: SageLLMEngine 主类
  - [ ] Day 13-14: 端到端测试 + 性能验收

### Phase 1: 国产硬件适配（硬件到位后）

- [ ] **Week 3-4: 昇腾 910B**
  - [ ] Ascend KV Backend
  - [ ] HCCL Comm Backend
  - [ ] 性能对比测试
  
- [ ] **Week 5-6: 寒武纪 MLU370**
  - [ ] MLU KV Backend
  - [ ] CNCL Comm Backend
  - [ ] 性能对比测试

### Phase 2: 高级功能（可选）

- [ ] **Week 7-8: 前缀复用**
  - [ ] Radix Attention 实现
  - [ ] 命中率优化
  
- [ ] **Week 9-10: 淘汰策略**
  - [ ] LRU/LFU/S3FIFO 实现
  - [ ] 收益-代价模型

---

## 🎯 里程碑与交付物

### M1: MVP 核心完成（Week 2）

**交付物**:
- ✅ sageLLM 引擎代码（CUDA 版本）
- ✅ 单元测试覆盖率 ≥80%
- ✅ 端到端测试通过
- ✅ 性能基线报告（vs vLLM）

**验收标准**:
```bash
# 1. 引擎注册成功
sage llm engine start Qwen/Qwen2.5-1.5B-Instruct --engine-kind sagellm

# 2. 推理正常
python -c "
from sage.llm import UnifiedInferenceClient
client = UnifiedInferenceClient.create()
response = client.chat([{'role': 'user', 'content': 'Hello'}])
print(response)
"

# 3. 性能测试
python benchmarks/bench_mvp.py --model Qwen/Qwen2.5-1.5B-Instruct --batch-size 8
```

### M2: 国产硬件适配（硬件到位后 4-6 周）

**交付物**:
- ✅ Ascend/MLU KV Backend
- ✅ HCCL/CNCL Comm Backend
- ✅ 性能对比报告（CUDA vs 昇腾 vs 寒武纪）

---

## 📚 参考文档

### 内部文档
- [SAGE 架构总览](../../package-architecture.md)
- [Control Plane 设计](../../l1-common/control-plane.md)
- [硬件采购清单](./HARDWARE_PROCUREMENT.md)

### 外部参考
- [vLLM 架构](https://github.com/vllm-project/vllm)
- [NCCL 文档](https://docs.nvidia.com/deeplearning/nccl/)
- [昇腾 CANN](https://www.hiascend.com/document)
- [寒武纪 CNToolkit](https://www.cambricon.com/docs)

---

## ❓ FAQ

### Q1: 为什么不直接用 vLLM？
**A**: sageLLM 的目标是：
1. **模块化设计**: 每个子系统独立可替换
2. **国产优先**: 内置国产硬件适配（vLLM 仅支持 NVIDIA）
3. **研究导向**: 验证新的调度/缓存/通信策略

### Q2: MVP 和 vLLM 性能差距有多大？
**A**: MVP 阶段预期性能：
- TTFT/TPOT: vLLM × 0.95（5% 损失可接受）
- 吞吐量: vLLM × 0.90（10% 损失可接受）
- 优化后目标: vLLM × 1.0（性能持平）

### Q3: 硬件到位后多久能完成适配？
**A**: 
- 昇腾 910B: 2 周（HCCL 文档完善）
- 寒武纪 MLU: 2 周（CNCL 类似 NCCL）
- 海光 DCU: 1 周（HIP 兼容 CUDA）
- 昆仑芯: 2 周（需熟悉 XPU SDK）

### Q4: MVP 能用于生产吗？
**A**: MVP 主要用于：
- ✅ 架构验证
- ✅ 算法研究
- ✅ 性能基线建立
- ❌ 不建议直接用于生产（需充分测试和优化）

---

## 🎉 总结

### MVP 核心价值

1. **快速验证**: 2 周完成架构闭环
2. **成本可控**: 云服务器 ¥5,000 - ¥10,000
3. **风险降低**: 硬件到位前验证设计
4. **平滑过渡**: 预留国产硬件接口

### 关键成功因素

- ✅ **抽象设计**: Protocol 驱动，便于后续替换
- ✅ **增量演进**: CUDA 先行，国产硬件跟进
- ✅ **性能基线**: 与 vLLM 对比，量化改进
- ✅ **文档完善**: 降低后续开发者接入成本

---

**文档版本**: v1.0  
**最后更新**: 2026-01-02  
**作者**: SAGE 项目组  
**联系方式**: [填写邮箱]
