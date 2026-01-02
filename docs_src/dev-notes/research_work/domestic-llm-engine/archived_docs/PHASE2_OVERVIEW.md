# Phase 2 总览：KV 管理与调度 (kvmgr)

> **Phase 编号**: 2/3  
> **模块数量**: 5 个子模块  
> **代码行数**: 3519 行  
> **开发周期**: Week 6-12 (6 周)

## 📋 目录

- [架构总览](#架构总览)
- [模块清单](#模块清单)
- [数据流图](#数据流图)
- [依赖关系](#依赖关系)
- [集成示例](#集成示例)
- [性能目标](#性能目标)
- [开发路线图](#开发路线图)
- [FAQ](#faq)

______________________________________________________________________

## 架构总览

### Phase 2 定位

**Phase 2 (kvmgr)** 是 sageLLM 的 **KV Cache 管理与调度层**，负责：
1. **前缀缓存** - 减少重复 Prefill 计算
2. **内存池管理** - 高效的 GPU 显存分配
3. **驱逐策略** - 智能选择驱逐对象
4. **调度器 IR** - 统一的调度抽象层
5. **生命周期预测** - 主动式内存管理

### 架构图

```
┌────────────────────────────────────────────────────────────────────┐
│                    Phase 2: kvmgr (KV 管理与调度)                   │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │ 2.1 Prefix  │  │ 2.2 KV Pool │  │ 2.3 Eviction│                │
│  │   Cache     │  │             │  │   Policy    │                │
│  │             │  │             │  │             │                │
│  │ Radix Tree  │  │ Buddy System│  │ LRU/LFU/ARC │                │
│  │ 60% Hit Rate│  │ 90% Memory  │  │ <20% Refill │                │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                │
│         │                 │                 │                       │
│         └─────────┬───────┴─────────┬───────┘                       │
│                   │                 │                               │
│              ┌────▼─────────────────▼────┐                          │
│              │  2.4 Scheduler IR         │                          │
│              │  (统一调度层)              │                          │
│              │  • Prefix Cache Aware     │                          │
│              │  • Memory Aware           │                          │
│              │  • Priority Based         │                          │
│              └────────────┬──────────────┘                          │
│                           │                                         │
│                   ┌───────▼────────┐                                │
│                   │ 2.5 Lifetime   │                                │
│                   │   Predictor    │                                │
│                   │ LSTM/Transformer│                               │
│                   │ MAE <10 tokens │                                │
│                   └────────────────┘                                │
│                                                                     │
├────────────────────────────────────────────────────────────────────┤
│                      跨 Phase 依赖                                  │
│  • comm/kv_transfer (跨节点 KV Block 迁移)                         │
│  • comm/topology (GPU 拓扑信息)                                     │
└────────────────────────────────────────────────────────────────────┘
```

______________________________________________________________________

## 模块清单

### 2.1 前缀缓存 (Prefix Cache) ✅

**文件**: `2.1-prefix-cache-prompt.md` (593 行)  
**Git Repo**: `sageLLM-prefix-cache`  
**Priority**: P1

**核心职责**:
- Radix Tree 实现前缀匹配
- 多租户 KV Cache 共享
- LRU 驱逐 + System Prompt 固定

**关键指标**:
- 缓存命中率: ≥60% (vs vLLM ~40%)
- 查询延迟: <10µs
- Token 节省率: ≥30%

**依赖**:
- 上游: `core/protocols/prefix_cache.py`
- 下游: `engines/lmdeploy`, `kvmgr/scheduler_ir`
- 跨 Phase: `comm/kv_transfer` (跨节点缓存同步)

______________________________________________________________________

### 2.2 KV Pool 管理 (KV Pool Management) ✅

**文件**: `2.2-kv-pool-prompt.md` (664 行)  
**Git Repo**: `sageLLM-kv-pool`  
**Priority**: P1

**核心职责**:
- Buddy System 内存分配
- 碎片整理 (Compaction)
- 跨节点 Block 迁移

**关键指标**:
- 分配延迟: <20µs (vs vLLM ~30µs)
- 碎片率: <10% (vs vLLM ~20%)
- 内存利用率: ≥90%

**依赖**:
- 上游: `core/protocols/kv_pool.py`, `comm/topology`
- 下游: `kvmgr/prefix_cache`, `kvmgr/eviction`, `kvmgr/scheduler_ir`
- 跨 Phase: `comm/kv_transfer` (跨节点迁移)

______________________________________________________________________

### 2.3 淘汰策略 (Eviction Policy) ✅

**文件**: `2.3-eviction-policy-prompt.md` (752 行)  
**Git Repo**: `sageLLM-eviction-policy`  
**Priority**: P2

**核心职责**:
- 多种驱逐策略 (LRU/LFU/ARC/预测式/QoS 感知)
- 内存不足时智能选择驱逐对象
- 最小化 Re-prefill 率

**关键指标**:
- 驱逐延迟: <100µs
- Re-prefill 率: <20% (vs vLLM ~35%)
- 公平性得分: ≥0.8 (Jain's Index)

**依赖**:
- 上游: `core/protocols/eviction.py`, `kvmgr/kv_pool`
- 下游: `kvmgr/kv_pool` (触发驱逐)
- 可选: `kvmgr/lifetime` (预测式驱逐)

______________________________________________________________________

### 2.4 调度器 IR (Scheduler IR) ✅

**文件**: `2.4-scheduler-ir-prompt.md` (762 行)  
**Git Repo**: `sageLLM-scheduler-ir`  
**Priority**: P1

**核心职责**:
- 统一的调度中间表示
- 优化 Pass 框架 (类似 MLIR)
- 跨引擎兼容 (vLLM/TGI/LMDeploy)

**关键指标**:
- 调度延迟: <200µs (vs vLLM ~500µs)
- 吞吐量提升: +20% (vs 原始调度)
- 批处理效率: ≥0.85

**依赖**:
- 上游: `core/protocols/scheduler_ir.py`, `kvmgr/prefix_cache`, `kvmgr/kv_pool`
- 下游: `engines/lmdeploy`, `engines/vllm_adapter`
- 可选: `kvmgr/lifetime` (Lifetime Aware Pass)

**优化 Passes**:
- `PrefixCacheAwarePass` - 优先调度有缓存命中的请求
- `PriorityBasedPass` - QoS 感知调度
- `BatchingEfficiencyPass` - 相似长度请求分组
- `MemoryAwarePreemptionPass` - 内存不足时抢占

______________________________________________________________________

### 2.5 生命周期预测器 (Lifetime Predictor) ✅

**文件**: `2.5-lifetime-predictor-prompt.md` (748 行)  
**Git Repo**: `sageLLM-lifetime-predictor`  
**Priority**: P2

**核心职责**:
- LSTM/Transformer 预测剩余生成长度
- 在线学习 (Online Learning)
- 为驱逐和调度提供预测信号

**关键指标**:
- 预测 MAE: <10 tokens
- 10% 准确率: ≥70%
- 推理延迟: <1ms

**依赖**:
- 上游: `core/protocols/lifetime.py`
- 下游: `kvmgr/eviction` (预测式驱逐), `kvmgr/scheduler_ir` (Lifetime Aware Pass)

______________________________________________________________________

## 数据流图

### 完整请求生命周期

```
1. 请求到达
   ↓
2. Scheduler IR 调度
   ├─→ PrefixCacheAwarePass 查询缓存
   │   └─→ 2.1 Prefix Cache (match_prefix)
   ├─→ MemoryAwarePass 检查内存
   │   └─→ 2.2 KV Pool (get_free_blocks)
   └─→ 选择批处理请求
   
3. 内存分配
   ├─→ 2.2 KV Pool (allocate)
   │   ├─→ 成功: 分配 Blocks
   │   └─→ 失败: 触发驱逐
   │       └─→ 2.3 Eviction Policy (select_victims)
   │           ├─→ 可选: 2.5 Lifetime Predictor (预测剩余生命)
   │           └─→ 驱逐选中的 Sequences
   
4. Prefill/Decode
   ├─→ Prefill: 检查 Prefix Cache
   │   └─→ 命中: 复用 KV Blocks
   └─→ Decode: 更新 KV Cache
   
5. 完成/驱逐
   ├─→ 完成: 释放 Blocks
   │   └─→ 2.2 KV Pool (free)
   └─→ 更新预测器
       └─→ 2.5 Lifetime Predictor (update)
```

### Phase 内模块交互

```
┌──────────────┐
│ 2.4          │  schedule()
│ Scheduler IR ├────────────┐
└──────┬───────┘            │
       │                    │
       │ apply_pass()       │
       │                    │
       ▼                    ▼
┌──────────────┐      ┌──────────────┐
│ 2.1 Prefix   │      │ 2.2 KV Pool  │
│    Cache     │◄─────┤              │
└──────────────┘      └──────┬───────┘
       │                     │
       │                     │ evict_if_needed()
       │                     │
       │                     ▼
       │              ┌──────────────┐
       │              │ 2.3 Eviction │
       │              │    Policy    │
       │              └──────┬───────┘
       │                     │
       │                     │ predict()
       │                     │
       │                     ▼
       │              ┌──────────────┐
       │              │ 2.5 Lifetime │
       └──────────────┤  Predictor   │
                      └──────────────┘
```

______________________________________________________________________

## 依赖关系

### Phase 内依赖矩阵

|           | 2.1 Prefix | 2.2 KV Pool | 2.3 Eviction | 2.4 Scheduler IR | 2.5 Lifetime |
|-----------|------------|-------------|--------------|------------------|--------------|
| **2.1**   | -          | ✅ 查询元数据 | ❌           | ❌               | ❌           |
| **2.2**   | ❌         | -           | ✅ 触发驱逐   | ❌               | ❌           |
| **2.3**   | ❌         | ✅ 释放 Blocks | -         | ❌               | ⚠️ 预测生命周期 |
| **2.4**   | ✅ 缓存感知 | ✅ 内存感知   | ⚠️ 预测优化   | -                | ⚠️ 预测优化   |
| **2.5**   | ❌         | ❌           | ❌           | ❌               | -            |

**图例**:
- ✅ 强依赖 (必需)
- ⚠️ 弱依赖 (可选)
- ❌ 无依赖

### 跨 Phase 依赖

**Phase 2 → Phase 1 (comm)**:
- `2.2 KV Pool` → `comm/kv_transfer` (跨节点 Block 迁移)
- `2.1 Prefix Cache` → `comm/kv_transfer` (跨节点缓存同步)
- `2.2 KV Pool` → `comm/topology` (GPU 拓扑信息)

**Phase 1 → Phase 2**: 无 (单向依赖)

______________________________________________________________________

## 集成示例

### 端到端示例：使用所有 Phase 2 模块

```python
from sagellm.kvmgr.prefix_cache import RadixPrefixCache
from sagellm.kvmgr.kv_pool import GPUKVPool
from sagellm.kvmgr.eviction import LRUEvictionPolicy
from sagellm.kvmgr.scheduler_ir import BaseSchedulerIR, ScheduleRequest
from sagellm.kvmgr.scheduler_ir.passes import PrefixCacheAwarePass, PriorityBasedPass
from sagellm.kvmgr.lifetime import LSTMLifetimePredictor

# 1. 初始化所有模块
prefix_cache = RadixPrefixCache(max_blocks=1000)
kv_pool = GPUKVPool(total_blocks=10000, block_size=16)
eviction_policy = LRUEvictionPolicy()
lifetime_predictor = LSTMLifetimePredictor()

# 2. 配置调度器 IR
scheduler = BaseSchedulerIR()
scheduler.add_optimization_pass(PrefixCacheAwarePass(prefix_cache))
scheduler.add_optimization_pass(PriorityBasedPass())

# 3. 处理推理请求
def process_request(token_ids: List[int], max_tokens: int, priority: int):
    """完整的请求处理流程"""
    
    # Step 1: 创建调度请求
    req = ScheduleRequest(
        request_id=str(uuid.uuid4()),
        token_ids=token_ids,
        max_tokens=max_tokens,
        priority=priority,
        arrived_time=time.time(),
    )
    
    # Step 2: 查询前缀缓存
    prefix_match = prefix_cache.match_prefix(token_ids)
    req.prefix_cache_hit = prefix_match.match_length
    
    # Step 3: 调度器选择批处理
    available_memory = kv_pool.get_free_blocks() * 16  # MB
    result = scheduler.schedule(
        pending_requests=[req],
        running_requests=[],
        available_memory=available_memory
    )
    
    if not result.scheduled_requests:
        print("No requests scheduled (memory insufficient)")
        return None
    
    # Step 4: 分配 KV Cache 内存
    try:
        block_ids = kv_pool.allocate(BlockAllocationRequest(
            num_blocks=req.kv_blocks_needed,
            sequence_id=int(req.request_id),
            priority=req.priority,
        ))
    except MemoryError:
        # 内存不足：触发驱逐
        print("Memory full, triggering eviction...")
        
        # 构建候选列表
        candidates = [
            EvictionCandidate(
                sequence_id=int(bid),
                block_ids=[bid],
                last_access_time=kv_pool.block_info[bid].last_access_time,
                access_count=1,
                priority=0,
                is_pinned=False,
            )
            for bid in kv_pool.block_info.keys()
        ]
        
        # 使用生命周期预测增强驱逐决策
        for candidate in candidates:
            pred_result = lifetime_predictor.predict(PredictionRequest(
                sequence_id=candidate.sequence_id,
                token_ids=[],
                current_length=10,  # 简化
                max_length=100,
            ))
            candidate.estimated_lifetime = pred_result.estimated_time
        
        # 选择驱逐对象
        victims = eviction_policy.select_victims(candidates, required_blocks=req.kv_blocks_needed)
        
        # 释放被驱逐的 Blocks
        for vid in victims:
            victim_blocks = [bid for bid, info in kv_pool.block_info.items() if info.sequence_id == vid]
            kv_pool.free(victim_blocks)
        
        # 重试分配
        block_ids = kv_pool.allocate(BlockAllocationRequest(
            num_blocks=req.kv_blocks_needed,
            sequence_id=int(req.request_id),
            priority=req.priority,
        ))
    
    # Step 5: Prefill/Decode
    if prefix_match.match_length > 0:
        # 复用缓存的 KV Blocks
        print(f"Reusing {prefix_match.match_length} cached blocks")
        new_blocks = block_ids[prefix_match.match_length:]
    else:
        # 完整 Prefill
        new_blocks = block_ids
    
    # Step 6: 插入前缀缓存
    prefix_cache.insert_prefix(token_ids, block_ids)
    
    # Step 7: 完成后更新预测器
    actual_length = len(token_ids) + max_tokens
    lifetime_predictor.update(
        sequence_id=int(req.request_id),
        actual_length=actual_length,
        actual_time=actual_length * 0.02
    )
    
    return block_ids

# 示例：处理 3 个请求
requests = [
    ([1, 2, 3, 4, 5] + [10, 11, 12], 20, 1),  # 共享前缀 [1,2,3,4,5]
    ([1, 2, 3, 4, 5] + [20, 21, 22], 30, 1),  # 共享前缀
    ([100, 101, 102], 10, 0),                  # 无共享前缀
]

for token_ids, max_tokens, priority in requests:
    blocks = process_request(token_ids, max_tokens, priority)
    print(f"Allocated blocks: {blocks}")
```

______________________________________________________________________

## 性能目标

### 模块级指标汇总

| 模块 | 关键指标 | 目标值 | vLLM Baseline | 提升 |
|------|---------|--------|---------------|------|
| **2.1 Prefix Cache** | 缓存命中率 | ≥60% | ~40% | +50% |
|                      | 查询延迟 | <10µs | ~15µs | +33% |
|                      | Token 节省率 | ≥30% | ~15% | +100% |
| **2.2 KV Pool**      | 分配延迟 | <20µs | ~30µs | +33% |
|                      | 碎片率 | <10% | ~20% | +50% |
|                      | 内存利用率 | ≥90% | ~80% | +12.5% |
| **2.3 Eviction**     | 驱逐延迟 | <100µs | ~150µs | +33% |
|                      | Re-prefill 率 | <20% | ~35% | +43% |
|                      | 公平性得分 | ≥0.8 | ~0.6 | +33% |
| **2.4 Scheduler IR** | 调度延迟 | <200µs | ~500µs | +60% |
|                      | 吞吐量 | +20% | Baseline | +20% |
|                      | 批处理效率 | ≥0.85 | ~0.7 | +21% |
| **2.5 Lifetime**     | 预测 MAE | <10 tokens | ~25 tokens | +60% |
|                      | 10% 准确率 | ≥70% | ~50% | +40% |
|                      | 推理延迟 | <1ms | ~5ms | +80% |

### 系统级指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| **端到端吞吐量** | +25% | vs vLLM baseline (所有优化叠加) |
| **P99 延迟** | <500ms | 高优先级请求 |
| **内存利用率** | ≥90% | GPU 显存有效利用率 |
| **Token 节省率** | ≥30% | Prefill token 数减少 |
| **Re-prefill 率** | <15% | 系统级（驱逐后重新请求） |

______________________________________________________________________

## 开发路线图

### Week 6-8: 核心模块（P1）

**Week 6**:
- ✅ 2.1 Prefix Cache: Radix Tree + 基础 LRU
- ✅ 2.2 KV Pool: Free List 分配器

**Week 7**:
- ✅ 2.2 KV Pool: Buddy System + 碎片整理
- ✅ 2.4 Scheduler IR: Base Scheduler + Pass Infrastructure

**Week 8**:
- ✅ 2.4 Scheduler IR: Prefix Cache Aware Pass + Priority Pass
- ✅ 集成测试: 2.1 + 2.2 + 2.4

### Week 9-10: 高级特性（P2）

**Week 9**:
- ✅ 2.3 Eviction: LRU/LFU/ARC 实现
- ✅ 2.5 Lifetime: Baseline Predictor (统计方法)

**Week 10**:
- ✅ 2.5 Lifetime: LSTM Predictor + 在线学习
- ✅ 2.3 Eviction: 预测式驱逐集成

### Week 11-12: 优化与集成

**Week 11**:
- ⏳ 性能优化: 并发安全、批量操作
- ⏳ 跨节点迁移: 与 comm/kv_transfer 集成
- ⏳ 完整 Benchmark Suite

**Week 12**:
- ⏳ 引擎适配器: vLLM/TGI/LMDeploy
- ⏳ 文档完善: API 文档、集成指南
- ⏳ 最终验收: 端到端性能测试

### 里程碑

- ✅ **M1 (Week 6)**: Prefix Cache MVP
- ✅ **M2 (Week 8)**: Scheduler IR + 基础集成
- ⏳ **M3 (Week 10)**: 所有模块完成
- ⏳ **M4 (Week 12)**: 性能目标达成

______________________________________________________________________

## FAQ

### 1. Phase 2 模块可以独立使用吗？

**答**: 可以。每个模块都设计为独立可测试：
- **Prefix Cache**: 独立的缓存数据结构，无需其他模块
- **KV Pool**: 独立的内存分配器
- **Eviction**: 策略模式，可插拔
- **Scheduler IR**: 独立的调度抽象层
- **Lifetime Predictor**: 独立的预测模型

### 2. 如何选择合适的驱逐策略？

**答**: 根据工作负载特性：
- **交互式对话**: LRU（用户可能反复修改输入）
- **批处理推理**: 预测式（序列生命周期可预测）
- **多租户场景**: QoS 感知（保证公平性）
- **混合场景**: ARC（自适应调整 LRU/LFU 权重）

### 3. Scheduler IR 与 vLLM/TGI 的调度器有什么区别？

**答**:
- **vLLM/TGI**: 调度逻辑耦合在引擎内部，难以扩展
- **Scheduler IR**: 统一抽象层 + Pass Infrastructure，类似 MLIR
- **优势**: 优化策略可跨引擎复用，方便 A/B 测试

### 4. 生命周期预测的准确率能达到多少？

**答**: 取决于工作负载规律性：
- **规律批处理**: MAE 5-10 tokens，10% 准确率 80%+
- **随机对话**: MAE 20+ tokens，10% 准确率 50%-60%
- **建议**: 设置置信度阈值（如 0.8），只有高置信度才使用预测

### 5. Phase 2 对 Phase 1 有什么要求？

**答**: 跨 Phase 依赖：
- **必需**: `comm/topology` (GPU 拓扑信息)
- **可选**: `comm/kv_transfer` (跨节点迁移，分布式场景)
- **独立开发**: Phase 2 可以先用 mock 替代 Phase 1

### 6. 如何评估 Phase 2 的整体性能？

**答**: 端到端 Benchmark：
```bash
# 运行完整 Benchmark
sage llm benchmark \
  --enable-prefix-cache \
  --enable-predictive-eviction \
  --scheduler-ir base \
  --duration 300 \
  --workload mixed
```

**关键指标**:
- 吞吐量: ≥ +25% vs vLLM baseline
- P99 延迟: < 500ms (高优先级)
- 内存利用率: ≥ 90%

### 7. Phase 2 开发的最大挑战是什么？

**答**:
1. **并发安全**: KV Pool 的分配/释放可能并发调用
2. **预测准确率**: Lifetime Predictor 对异构工作负载的泛化能力
3. **跨引擎兼容**: Scheduler IR 需要适配不同引擎的调度语义
4. **性能优化**: 在保证正确性的前提下，降低调度开销 (<200µs)

______________________________________________________________________

## 下一步

- ✅ **Phase 2 模块创建完成** (5 个子模块，3519 行)
- ⏳ **质量检查** (命名一致性、依赖关系、代码示例)
- ⏳ **Phase 3 启动** (加速优化模块：量化、融合、稀疏、投机、FlashAttention)

**进度**: Phase 1 (comm) ✅ | Phase 2 (kvmgr) ✅ | Phase 3 (accel) ⏳
