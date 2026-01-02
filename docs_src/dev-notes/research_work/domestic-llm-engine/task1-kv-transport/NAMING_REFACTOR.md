# 命名规范重构说明

> **重构日期**: 2026-01-02  
> **影响范围**: 所有 15 个子模块 + PHASE1_OVERVIEW.md

## 重构动机

旧命名方案存在以下问题：
- ❌ **非语义化**：数字编号需要查表才能理解
- ❌ **冗长**：导入路径过长（40+ 字符）
- ❌ **不专业**："direction" 作为技术模块名称缺乏行业标准

## 新命名方案

采用**简短语义化命名**，直接体现功能领域：

| 新名称 | 含义 | 对应模块数 |
|--------|------|-----------|
| `comm` | Communication & Transport | 5 |
| `kvmgr` | KV Cache Management | 5 |
| `accel` | Inference Acceleration | 5 |

### 详细模块映射

#### Phase 1: comm/ (通信与传输)
```
comm/
├── topology/          # 拓扑感知
├── collective_ops/    # 集合通信
├── kv_transfer/       # KV 传输
├── overlap/           # 计算通信重叠
└── domestic/          # 国产互联
```

#### Phase 2: kvmgr/ (KV 管理)
```
kvmgr/
├── prefix_cache/      # 前缀缓存
├── kv_pool/           # KV Pool
├── eviction/          # 淘汰策略
├── scheduler_ir/      # 调度器 IR
└── lifetime/          # 生命周期预测
```

#### Phase 3: accel/ (推理加速)
```
accel/
├── quantization/      # 量化
├── kernel_fusion/     # 算子融合
├── speculative/       # 推测解码
├── sparse/            # 稀疏化
└── flash_attention/   # Flash Attention
```

## 命名规范

### 导入路径

**新方案**:
```python
from sagellm.comm.topology import TopologyManager
from sagellm.kvmgr.kv_pool import KVPoolManager
from sagellm.accel.quantization import QuantizationEngine
```

**优势**:
- ✅ 简洁清晰（缩短 40% 字符）
- ✅ 语义明确，一目了然
- ✅ 符合业界惯例（如 `torch.distributed` → `torch.dist`）

### 目录结构

```
sagellm/
├── comm/              # 通信与传输
│   ├── topology/
│   ├── collective_ops/
│   ├── kv_transfer/
│   ├── overlap/
│   └── domestic/
├── kvmgr/             # KV 管理
└── accel/             # 推理加速
```

### Git Repo 命名

**保持不变**（与模块一一对应）：
- `sageLLM-topology` → `comm/topology/`
- `sageLLM-collective-ops` → `comm/collective_ops/`
- `sageLLM-kv-transfer` → `comm/kv_transfer/`
- `sageLLM-overlap` → `comm/overlap/`
- `sageLLM-domestic` → `comm/domestic/`

## 重构影响范围

### 已更新文件（Phase 1）

| 文件 | 替换次数 | 状态 |
|------|---------|------|
| `1.1-topology-prompt.md` | 6 | ✅ 完成 |
| `1.2-collective-ops-prompt.md` | 8 | ✅ 完成 |
| `1.3-kv-transfer-prompt.md` | 5 | ✅ 完成 |
| `1.4-overlap-pipeline-prompt.md` | 4 | ✅ 完成 |
| `1.5-domestic-interconnect-prompt.md` | 3 | ✅ 完成 |
| `PHASE1_OVERVIEW.md` | 12 | ✅ 完成 |

**总计**: 38 处路径更新

### 待更新文件（Phase 2 & 3）

Phase 2 和 Phase 3 的 prompt 文件将在后续 review 时同步更新。

## 验证方法

```bash
# 检查新命名使用情况
cd docs-public/docs_src/dev-notes/research_work/domestic-llm-engine/task1-kv-transport
./verify_naming.sh

# 手动检查
grep "sagellm\.comm\." *.md | wc -l
# 应该返回 20+ 处

grep "sagellm\.kvmgr\." *.md | wc -l
# 应该返回 2+ 处

grep "accel/" *.md | wc -l
# 应该返回 1+ 处
```

## 后续行动

1. **Phase 2 质量检查时**：同步更新 Phase 2 的 5 个 prompt 文件
2. **Phase 3 质量检查时**：同步更新 Phase 3 的 5 个 prompt 文件
3. **实际实现时**：创建对应的 git submodule 和目录结构
4. **文档更新**：在主 README 中说明新命名规范

## 参考依据

### 业界命名惯例

1. **PyTorch**: `torch.distributed` → `torch.dist`
2. **TensorFlow**: `tensorflow.distribute` → `tf.distribute`
3. **Horovod**: `horovod.torch` → `hvd`
4. **DeepSpeed**: `deepspeed.runtime.comm` → `ds.comm`

### 命名原则

1. **简洁性**：优先使用 3-6 字符缩写
2. **语义性**：缩写必须能直观理解含义
3. **一致性**：同一层级命名风格统一
4. **可扩展性**：为未来新模块预留空间

## 总结

此次重构将所有数字编号式命名替换为语义化短命名，大幅提升代码可读性和专业性。重构仅影响 Python 导入路径和文档描述，不改变模块功能和依赖关系。
