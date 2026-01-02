# Phase 1 快速参考

> **最后更新**: 2026-01-02 | **状态**: ✅ 命名规范已统一

## 🚀 快速导入示例

```python
# === Phase 1: comm (通信与传输) ===

# 1.1 拓扑感知
from sagellm.comm.topology import TopologyManager
manager = TopologyManager()
topo_info = manager.detect()

# 1.2 集合通信
from sagellm.comm.collective_ops import create_comm_backend
backend = create_comm_backend("nccl")
result = backend.all_reduce(tensor)

# 1.3 KV 传输
from sagellm.comm.kv_transfer import KVTransferChannel
channel = KVTransferChannel()
channel.transfer(kv_blocks, target_node=1)

# 1.4 计算通信重叠
from sagellm.comm.overlap import OverlapManager
overlap_mgr = OverlapManager()
overlap_mgr.schedule(compute_fn, comm_fn)

# 1.5 国产互联
from sagellm.comm.domestic import create_domestic_backend
backend = create_domestic_backend("hccl")  # 昇腾 HCCL
```

## 📁 目录结构

```
sagellm/comm/
├── topology/
│   ├── __init__.py
│   ├── manager.py          # TopologyManager
│   ├── detector.py         # 拓扑探测
│   └── cost_model.py       # 通信成本模型
├── collective_ops/
│   ├── __init__.py
│   ├── nccl_backend.py     # NCCL 实现
│   ├── gloo_backend.py     # Gloo 实现
│   └── fusion.py           # 通信融合
├── kv_transfer/
│   ├── __init__.py
│   ├── channel.py          # KVTransferChannel
│   └── compression.py      # LZ4/Zstd 压缩
├── overlap/
│   ├── __init__.py
│   ├── manager.py          # OverlapManager
│   └── scheduler.py        # DAG 调度
└── domestic/
    ├── __init__.py
    ├── hccl_backend.py     # 昇腾 HCCL
    └── cncl_backend.py     # 寒武纪 CNCL
```

## 🔗 跨模块协作

### 典型集成场景

```python
# 场景 1: 拓扑感知的集合通信
from sagellm.comm.topology import TopologyManager
from sagellm.comm.collective_ops import NCCLBackend

topo_mgr = TopologyManager()
backend = NCCLBackend(topology_manager=topo_mgr)
# 自动选择最优算法（Ring/Tree）

# 场景 2: Disaggregated Serving
from sagellm.comm.kv_transfer import KVTransferChannel
from sagellm.kvmgr.kv_pool import KVPoolManager

kv_pool = KVPoolManager()
transfer_channel = KVTransferChannel()
# Prefill 节点生成 KV → Decode 节点接收

# 场景 3: Tensor Parallel + 重叠
from sagellm.comm.collective_ops import create_comm_backend
from sagellm.comm.overlap import OverlapManager

backend = create_comm_backend("nccl")
overlap_mgr = OverlapManager(comm_backend=backend)
# 自动调度计算-通信重叠
```

## 📋 Git Repo 对应关系

| Python 包路径 | Git Submodule | 功能 |
|--------------|---------------|------|
| `sagellm.comm.topology` | `sageLLM-topology` | 拓扑探测 |
| `sagellm.comm.collective_ops` | `sageLLM-collective-ops` | 集合通信 |
| `sagellm.comm.kv_transfer` | `sageLLM-kv-transfer` | KV 传输 |
| `sagellm.comm.overlap` | `sageLLM-overlap` | 计算通信重叠 |
| `sagellm.comm.domestic` | `sageLLM-domestic` | 国产互联 |

## 🔧 开发环境设置

```bash
# 克隆所有 Phase 1 submodules
git submodule update --init --recursive

# 或使用 SAGE 管理脚本
./manage.sh submodule init

# 进入某个模块开发
cd sagellm/comm/topology
git checkout -b feature/my-feature
```

## 📚 相关文档

- **总览**: `PHASE1_OVERVIEW.md` - 架构、依赖、集成指南
- **重构说明**: `NAMING_REFACTOR.md` - 命名变更历史
- **完成报告**: `CLEANUP_COMPLETE.md` - 清理状态
- **各模块详细设计**:
  - `1.1-topology-prompt.md`
  - `1.2-collective-ops-prompt.md`
  - `1.3-kv-transfer-prompt.md`
  - `1.4-overlap-pipeline-prompt.md`
  - `1.5-domestic-interconnect-prompt.md`

## ⚠️ 注意事项

1. **禁止直接使用旧命名**
   ```python
   # ❌ 错误
   from sagellm.direction_1_communication.topology import ...
   
   # ✅ 正确
   from sagellm.comm.topology import ...
   ```

2. **模块独立性**
   - 每个模块可以单独测试和 benchmark
   - 使用 Mock 替代未实现的依赖

3. **循环依赖避免**
   - `comm/kv_transfer` 不依赖 `kvmgr/kv_pool`
   - `comm/collective_ops` 不依赖 `comm/overlap`

## 🎯 下一步

- ✅ **Phase 1 已完成**: 命名统一、文档齐全
- ⏳ **Phase 2 进行中**: KV 管理与调度（5 个模块）
- 📅 **Phase 3 待开始**: 推理加速（5 个模块）
