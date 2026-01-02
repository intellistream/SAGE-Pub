# 面向国产算力的 sageLLM 模块化推理引擎（提示词合集）

> **状态**：规划中\
> **项目代号**：SAGE-Domestic-Accelerator\
> **核心理念**：极致模块化 + 国产算力优化 + 机制性能领先\
> **更新时间**：2026-01-02

______________________________________________________________________

## 项目概述

### 核心愿景
构建 **sageLLM**：一个面向国产算力优化、机制性能领先的**模块化推理引擎**。通过极致的模块化设计，让前缀复用、KV 管理、调度 IR、通信、加速等子系统可以**独立研究、独立演进、独立优化**，同时保持整体性能达到或超越业界标杆（vLLM/TensorRT-LLM）。

### 设计原则
1. **极致模块化**：每个模块都是独立的"研究课题"，有清晰的 Protocol，可单独 benchmark
2. **协议优先**：模块间通过 Protocol/ABC 通信，禁止直接依赖实现类
3. **可替换性**：支持多种 backend（kv_runtime: lmdeploy/vllm；comm: nccl/gloo/mock）
4. **可观测性**：每个模块都要暴露详细的 metrics/telemetry
5. **国产适配优先**：预留国产算力（昇腾/寒武纪/海光/昆仑）的适配钩子

**核心目录（新）**

```
packages/sage-common/src/sage/common/components/sage_llm/sageLLM/
├── core/            # 基础协议层：Protocol/types/精简 ControlPlaneManager
├── prefix_reuse/    # 独立模块：前缀复用索引与校验（可单独 benchmark）
├── kv_runtime/      # 独立模块：KV 池化/分层/迁移 + backend 协议
├── kv_policy/       # 独立模块：驱逐/迁移策略 + 收益模型
├── scheduler_ir/    # 独立模块：Prefill/Decode 解耦的执行图 IR
├── comm_backend/    # 独立模块：通信后端（拓扑/融合/重叠/KV 传输）
├── accel/           # 独立模块：量化/稀疏/投机解码/CoT 控制器
├── engines/         # 引擎集成层：深度改造 LMDeploy（默认），支持 vLLM 扩展
├── third_party/     # vendor 引擎 + patches（LMDeploy v0.11.0）
└── benchmarks/      # 统一 bench + CI perf gate
```

**模块独立性保证**：
- ✅ 每个模块可单独测试、单独 benchmark、单独优化
- ✅ 模块间零实现依赖，仅通过 core/ 的 Protocol 通信
- ✅ 支持多种 backend 实现（如 comm_backend: nccl/gloo/mock）
- ✅ 6 个研究方向可并行开发（Week 3-4 并行推进）

**关键指标**：MFU ≥ 基线 -1%，TTFT/TPOT 回退 \<5%，KV hit 提升可量化，通信占比下降或持平，单位 token
成本不劣于基线，长上下文（≥32K/64K/128K）稳定。

______________________________________________________________________

## Prompt 导航（强调模块独立性）

### 总览文档
- **[Meta Prompt](./meta-prompt.md)**：全局约束、目录、模块化设计原则、15 个独立子模块详细规划

### 大方向 Prompts（原有）
- [task0-common-infrastructure](./task0-common-infrastructure/prompt.md) — 基础设施：Protocol 定义 + LMDeploy 集成框架
- [task1-kv-transport](./task1-kv-transport/prompt.md) — 大方向 1：通信与传输优化
- [task2-kv-cache-scheduling](./task2-kv-cache-scheduling/prompt.md) — 大方向 2：KV 管理与调度
- [task2-pd-separation](./task2-pd-separation/prompt.md) — 大方向 2 子方向：PD 分离
- [task3-model-compression](./task3-model-compression/prompt.md) — 大方向 3：模型压缩与加速

### 15 个独立子模块 Prompts（新增）

#### 【大方向 1】通信与传输优化 (Task 1)
1. **[1.1 拓扑感知与优化](./task1-kv-transport/1.1-topology-prompt.md)** (`sageLLM-topology`)
   - 探测硬件拓扑（NVLink/PCIe/InfiniBand/国产互联），生成通信成本模型
   - Baseline: Megatron-LM, NCCL topology detection

2. **[1.2 集合通信优化](./task1-kv-transport/1.2-collective-ops-prompt.md)** (`sageLLM-collective-ops`)
   - All_reduce/all_gather/reduce_scatter 融合与重叠，自适应算法选择
   - Baseline: NCCL, Gloo, DeepSpeed ZeRO

3. **[1.3 KV 跨节点传输](./task1-kv-transport/1.3-kv-transfer-prompt.md)** (`sageLLM-kv-transfer`)
   - KV Cache 跨节点传输、chunking、pipeline、压缩
   - Baseline: DistServe, Mooncake

4. **[1.4 计算通信重叠](./task1-kv-transport/1.4-overlap-pipeline-prompt.md)** (`sageLLM-overlap-pipeline`)
   - Prefill/Decode 阶段的计算-通信重叠、CUDA Stream 管理
   - Baseline: Megatron-LM pipeline, FlexFlow

5. **[1.5 国产互联适配](./task1-kv-transport/1.5-domestic-interconnect-prompt.md)** (`sageLLM-domestic-interconnect`, P2可选)
   - 昇腾 HCCS、寒武纪 MLU-Link、海光 xGMI 适配
   - Baseline: 各厂商 SDK 文档

#### 【大方向 2】KV 管理与调度 (Task 2)
6. **[2.1 前缀复用](./task2-kv-cache-scheduling/2.1-prefix-cache-prompt.md)** (`sageLLM-prefix-cache`)
   - Radix/Trie 索引、token hash → KV block 映射、命中校验
   - Baseline: SGLang RadixAttention, vLLM Automatic Prefix Caching

7. **[2.2 KV 池化与分层](./task2-kv-cache-scheduling/2.2-kv-pool-prompt.md)** (`sageLLM-kv-pool`)
   - KV block 池化管理、HBM/DDR/NVMe 分层存储、自动迁移
   - Baseline: vLLM PagedAttention, FlashAttention, Mnemosyne

8. **[2.3 淘汰策略](./task2-kv-cache-scheduling/2.3-eviction-policy-prompt.md)** (`sageLLM-eviction-policy`)
   - LRU/LFU/ARC/S3FIFO/Learned 淘汰策略、收益-代价模型
   - Baseline: CacheGen, vLLM eviction, S3FIFO

9. **[2.4 调度 IR 与 PD 分离](./task2-pd-separation/2.4-scheduler-ir-prompt.md)** (`sageLLM-scheduler-ir`)
   - Prefill/Decode 解耦 IR、策略迁移（FIFO/Priority/SLO-aware/Adaptive）
   - Baseline: DistServe, Orca, Aegaeon

10. **[2.5 生命周期预测](./task2-kv-cache-scheduling/2.5-lifetime-predictor-prompt.md)** (`sageLLM-lifetime-predictor`, P2可选)
    - 预测 KV block 的 TTL（Time-To-Live），辅助淘汰决策
    - Baseline: CacheGen lifetime prediction, Learned eviction

#### 【大方向 3】模型压缩与加速 (Task 3)
11. **[3.1 量化](./task3-model-compression/3.1-quantization-prompt.md)** (`sageLLM-quantization`)
    - GPTQ/AWQ/SmoothQuant，KV Cache on-the-fly 量化（INT8/FP8）
    - Baseline: GPTQ, AWQ, TensorRT-LLM, vLLM FP8 KV

12. **[3.2 稀疏化](./task3-model-compression/3.2-sparsity-prompt.md)** (`sageLLM-sparsity`)
    - 2:4/4:8 结构化稀疏、Attention/FFN 剪枝、Sparse kernel
    - Baseline: SparseGPT, Wanda, NVIDIA 2:4 Sparsity

13. **[3.3 投机解码](./task3-model-compression/3.3-speculative-decoding-prompt.md)** (`sageLLM-speculative-decoding`)
    - Draft model + Verifier，多 token 接受，回退策略
    - Baseline: Medusa, SpecInfer, EAGLE

14. **[3.4 Kernel 融合](./task3-model-compression/3.4-kernel-fusion-prompt.md)** (`sageLLM-kernel-fusion`)
    - Attention/LayerNorm/FFN 融合，FlashAttention 集成，自定义 CUDA kernel
    - Baseline: FlashAttention-2/3, xFormers, FasterTransformer

15. **[3.5 CoT 加速](./task3-model-compression/3.5-cot-acceleration-prompt.md)** (`sageLLM-cot-acceleration`, P2可选)
    - 思维链（Chain-of-Thought）推理加速，中间步骤缓存
    - Baseline: CoT pruning, Self-Consistency

**并行开发策略（3×5 结构）**：
- **Phase 0 (Week 1-2)**：基础设施（core/ Protocol + engines/ 骨架）
- **Phase 1 (Week 3-5)**：大方向 1 的 5 个模块并行开发（5 人同时工作）
- **Phase 2 (Week 6-8)**：大方向 2 的 5 个模块并行开发（5 人同时工作）
- **Phase 3 (Week 9-11)**：大方向 3 的 5 个模块并行开发（5 人同时工作）
- **Phase 4 (Week 12)**：集成测试 + 性能验收

______________________________________________________________________

## 模块独立性验证

### 如何验证模块是否真正独立？
每个模块必须通过以下测试：

1. **零依赖测试**：
   ```bash
   # 只安装 core/ 和当前模块，不安装其他功能模块
   pytest packages/.../prefix_reuse/tests/  # 应该全部通过
   ```

2. **Mock Backend 测试**：
   ```python
   # 使用 mock 替代其他模块
   from unittest.mock import Mock
   mock_kv_backend = Mock(spec=KVBackendProtocol)
   policy = LRUEvictionPolicy(backend=mock_kv_backend)
   policy.select_victims()  # 应该正常工作
   ```

3. **独立 Benchmark**：
   ```bash
   # 单独测量模块性能
   python -m sageLLM.prefix_reuse.benchmarks.bench_lookup
   python -m sageLLM.kv_runtime.benchmarks.bench_allocation
   python -m sageLLM.comm_backend.benchmarks.bench_bandwidth
   ```

4. **多实现切换**：
   ```python
   # 应支持多种 backend 实现
   kv_runtime = KVRuntime(backend="lmdeploy")  # 或 "vllm", "mock"
   comm = CommBackend(backend="nccl")          # 或 "gloo", "mock"
   ```

______________________________________________________________________

## 验收与协作提示

### 工程规范
- **端口管理**：统一使用 `SagePorts`，严禁硬编码
- **Submodule 管理**：`third_party/lmdeploy`（tag v0.11.0）+ `third_party/patches/lmdeploy/0001-0004`，使用 `apply_patches.sh`；禁止 `git submodule update --init`
- **迁移策略**：删除 legacy/compat；旧策略/路由文件需重新设计并放入对应模块
- **测试要求**：每个模块需提供单测、集成测、benchmark；CI perf gate 强制检查性能回退

### 模块独立性检查（Code Review 必查项）
在 PR review 时，必须验证：
- ✅ 该模块是否只依赖 core/ 的 Protocol？（检查 import 语句）
- ✅ 是否提供了 mock backend 的测试？（检查 tests/test_*_mock.py）
- ✅ 是否可以单独运行 benchmark？（运行 `python -m sageLLM.<module>.benchmarks.*`）
- ✅ README 是否包含独立测试的说明？
- ✅ 是否支持多种实现（检查 backend 参数）？

### 性能基线（整体目标）
- **吞吐**：MFU ≥ vLLM baseline -1%；长上下文（≥32K/64K/128K）吞吐 ≥ vLLM ×1.5
- **延迟**：TTFT/TPOT p50/p95 回退 <5%
- **KV 效率**：KV hit 提升可量化；池利用率 ≥90%；碎片率 <10%
- **通信效率**：带宽利用率 ≥85%；通信占比下降或持平
- **成本效率**：单位 token 成本（GPU·s/token 或 ￥/token）不劣于基线

### 模块级性能目标（独立可测）
| 模块 | 核心指标 | 目标值 | 独立测试方法 |
|------|---------|--------|-------------|
| prefix_reuse | 命中率、匹配长度、lookup 延迟 | hit ≥60%（场景相关），p99 <1ms | `bench_lookup.py` |
| kv_runtime | 分配延迟、迁移带宽、碎片率 | alloc p99 <100µs，迁移 ≥50GB/s | `bench_allocation.py` |
| kv_policy | 淘汰准确率、决策延迟 | 误杀率 <5%，决策 <10µs | `bench_eviction.py` |
| scheduler_ir | IR 构建/优化时间、计划执行率 | 构建 <1ms，执行成功率 ≥99% | `bench_ir_build.py` |
| comm_backend | 带宽利用率、延迟 | 带宽 ≥85%，节点内 <20µs | `bench_bandwidth.py` |
| accel | 加速比、精度回退 | 吞吐 ≥2x，精度损失 <1% | `bench_quantization.py` |

## 实施建议

### 优先级与依赖
1. **起步阶段（Week 1-2）**：PR1（骨架+类型）+ PR8（LMDeploy 集成/补丁），跑通最小 demo
2. **核心阶段（Week 2-3）**：PR5（scheduler_ir）完成迁移与可插拔策略
3. **并行阶段（Week 3-4）**：PR2/PR3（prefix_reuse, kv_runtime）+ PR4/PR6（kv_policy, comm_backend）并行推进
4. **收尾阶段（Week 5）**：PR7（accel）+ PR9（perf gate）

### 关键里程碑
- **M1（Week 1）**：目录骨架完成，LMDeploy 补丁可应用，最小 demo 可运行
- **M2（Week 2）**：scheduler_ir 可插拔，现有策略迁移完成
- **M3（Week 4）**：所有模块功能完成，集成测试通过
- **M4（Week 5）**：性能测试达标，CI perf gate 上线

### 常见陷阱
- **避免过度设计**：先实现核心功能，后续迭代优化
- **保持接口稳定**：公共 Protocol 定义后避免频繁修改
- **性能优先**：每个 PR 都需验证性能不回退
- **文档同步**：代码与文档同步更新，避免过时
