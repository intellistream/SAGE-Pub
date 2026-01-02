# Meta Prompt：sageLLM 模块化重构（面向国产算力的高性能推理引擎）

> 用途：为各个课题 prompt 提供统一的背景、目标、目录与接口约束，可直接指挥 Agents 产出符合落地要求的设计与实现方案。

______________________________________________________________________

## 全局定位与目标

### 核心愿景
构建 **sageLLM**：一个面向国产算力优化、机制性能领先的模块化推理引擎。不是简单封装现有引擎，而是通过深度模块化设计，在保持引擎集成能力的同时，让每个子系统（前缀复用、KV 管理、调度 IR、通信、加速）都能**独立研究、独立演进、独立优化**。

### 设计原则（CRITICAL）
1. **极致模块化**：每个模块都是独立的"研究课题"，有清晰的输入/输出协议，可单独 benchmark、单独优化
2. **协议优先**：模块间通过 Protocol/ABC 通信，禁止直接依赖实现类；接口即契约，稳定后不轻易修改
3. **可替换性**：每个模块都应支持多种实现（如 kv_runtime 支持 lmdeploy/vllm backend；comm_backend 支持 nccl/gloo/mock）
4. **可观测性**：每个模块都要暴露详细的 metrics/telemetry，便于性能分析和调优
5. **国产适配优先**：通信、量化、调度路径都要预留国产算力（昇腾/寒武纪/海光/昆仑）的适配钩子

### 关键目标
- **性能目标**：MFU/TTFT/TPOT 达到或超越 vLLM baseline；长上下文（≥32K/64K/128K）稳定高效
- **工程目标**：删除 legacy 兼容层；6 个研究方向可并行开发、独立测试、独立部署
- **生态目标**：支持 CUDA GPU + 国产算力；LMDeploy 深度集成（默认），保留 vLLM 等其他引擎扩展能力

______________________________________________________________________

## 模块化架构设计（3 大方向 × 3-5 小方向 = 9-15 独立模块）

### 架构总览
sageLLM 按照 **3 个大研究方向**拆分，每个方向下包含 **3-5 个独立的小方向**，每个小方向都是一个**独立的 git submodule**（可单独开发、单独发布）。

```
sageLLM/
├── core/                          # 公共协议层（Protocol/types/config）
├── engines/                       # 引擎集成层（LMDeploy/vLLM）
├── third_party/                   # vendor 引擎源码 + patches
│
├── direction_1_communication/     # 【大方向 1】通信与传输优化
│   ├── topology/                  # 小方向 1.1：拓扑感知 (git submodule)
│   ├── collective_ops/            # 小方向 1.2：集合通信优化 (git submodule)
│   ├── kv_transfer/               # 小方向 1.3：KV 跨节点传输 (git submodule)
│   ├── overlap_pipeline/          # 小方向 1.4：计算通信重叠 (git submodule)
│   └── domestic_interconnect/     # 小方向 1.5：国产互联适配 (git submodule, 可选)
│
├── direction_2_kv_scheduling/     # 【大方向 2】KV 管理与调度
│   ├── prefix_cache/              # 小方向 2.1：前缀复用 (git submodule)
│   ├── kv_pool/                   # 小方向 2.2：KV 池化与分层 (git submodule)
│   ├── eviction_policy/           # 小方向 2.3：淘汰策略 (git submodule)
│   ├── scheduler_ir/              # 小方向 2.4：调度 IR 与 PD 分离 (git submodule)
│   └── lifetime_predictor/        # 小方向 2.5：生命周期预测 (git submodule, 可选)
│
└── direction_3_acceleration/      # 【大方向 3】模型压缩与加速
    ├── quantization/              # 小方向 3.1：量化（权重/KV/激活）(git submodule)
    ├── sparsity/                  # 小方向 3.2：稀疏化（结构化/非结构化）(git submodule)
    ├── speculative_decoding/      # 小方向 3.3：投机解码 (git submodule)
    ├── kernel_fusion/             # 小方向 3.4：Kernel 融合 (git submodule)
    └── cot_acceleration/          # 小方向 3.5：CoT 加速 (git submodule, 可选)
```

### 模块独立性设计
每个小方向（submodule）必须满足：
1. **独立 git repo**：可以单独 clone、开发、测试、发布
2. **统一接口协议**：通过 `core/` 定义的 Protocol 与其他模块通信
3. **独立 baseline**：有明确的性能基线（来自现有工作：vLLM/SGLang/TensorRT-LLM/论文复现）
4. **独立 benchmark**：可以单独测量性能，不依赖完整系统
5. **可替换实现**：支持多种实现（如 quantization 支持 GPTQ/AWQ/SmoothQuant）

### 大方向与 task 映射（CRITICAL）
| 大方向 | Task 编号 | 包含的小方向（独立 submodule） | 对应 Prompt 文件 |
|--------|---------|---------------------------|----------------|
| **通信与传输优化** | Task 1 | 5 个小方向（topology, collective_ops, kv_transfer, overlap_pipeline, domestic_interconnect） | `task1-kv-transport/prompt.md` |
| **KV 管理与调度** | Task 2 | 5 个小方向（prefix_cache, kv_pool, eviction_policy, scheduler_ir, lifetime_predictor） | `task2-kv-cache-scheduling/` + `task2-pd-separation/` |
| **模型压缩与加速** | Task 3 | 5 个小方向（quantization, sparsity, speculative_decoding, kernel_fusion, cot_acceleration） | `task3-model-compression/prompt.md` |

**总计**：3 大方向 × 5 小方向 = **15 个独立 submodule**（其中 12 个核心 + 3 个可选）

______________________________________________________________________

## 15 个小方向详细规划（每个都是独立 submodule）

### 【大方向 1】通信与传输优化 (Task 1)

#### 1.1 topology/ - 拓扑感知与优化
- **职责**：探测硬件拓扑（NVLink/PCIe/InfiniBand/国产互联），生成通信拓扑图
- **Baseline**：Megatron-LM topology manager, NCCL topology detection
- **独立接口**：`TopologyManager.detect() -> TopologyInfo`
- **性能指标**：拓扑探测延迟 <100ms，准确率 100%
- **Git Repo**：`sageLLM-topology` (独立开发)

#### 1.2 collective_ops/ - 集合通信优化
- **职责**：all_reduce/all_gather/reduce_scatter 融合与重叠
- **Baseline**：NCCL, Gloo, DeepSpeed ZeRO communication
- **独立接口**：`CommBackendProtocol.{all_reduce, all_gather, ...}`
- **性能指标**：带宽利用率 ≥85%，延迟 <20µs (节点内)
- **Git Repo**：`sageLLM-collective-ops`

#### 1.3 kv_transfer/ - KV 跨节点传输
- **职责**：KV Cache 跨节点传输、chunking、pipeline、压缩
- **Baseline**：DistServe KV migration, Mooncake disaggregated serving
- **独立接口**：`KVTransferChannel.transfer(blocks, target_node)`
- **性能指标**：传输带宽 ≥50GB/s，overhead <5%
- **Git Repo**：`sageLLM-kv-transfer`

#### 1.4 overlap_pipeline/ - 计算通信重叠
- **职责**：Prefill/Decode 阶段的计算-通信重叠、Stream 管理
- **Baseline**：Megatron-LM pipeline parallelism, FlexFlow
- **独立接口**：`OverlapManager.schedule(compute_tasks, comm_tasks)`
- **性能指标**：重叠效率 ≥70%，idle time <10%
- **Git Repo**：`sageLLM-overlap-pipeline`

#### 1.5 domestic_interconnect/ - 国产互联适配（可选）
- **职责**：昇腾 HCCS、寒武纪 MLU-Link、海光 xGMI 等国产互联协议适配
- **Baseline**：各厂商 SDK 文档，参考 Megatron-LM custom backend
- **独立接口**：`DomesticCommBackend` 实现 `CommBackendProtocol`
- **性能指标**：达到厂商声称带宽的 ≥80%
- **Git Repo**：`sageLLM-domestic-interconnect`

---

### 【大方向 2】KV 管理与调度 (Task 2)

#### 2.1 prefix_cache/ - 前缀复用
- **职责**：Radix/Trie 索引、token hash → KV block 映射、命中校验
- **Baseline**：SGLang RadixAttention, vLLM Automatic Prefix Caching
- **独立接口**：`PrefixReuseIndex.lookup(tokens) -> PrefixHit`
- **性能指标**：命中率 ≥60%（场景相关），lookup p99 <1ms
- **Git Repo**：`sageLLM-prefix-cache`

#### 2.2 kv_pool/ - KV 池化与分层
- **职责**：KV block 池化、HBM/DDR/NVMe 分层、迁移、碎片整理
- **Baseline**：vLLM PagedAttention, FlashAttention, Mnemosyne tiered KV
- **独立接口**：`KVPool.allocate/free/migrate(plan)`
- **性能指标**：池利用率 ≥90%，碎片率 <10%，迁移带宽 ≥50GB/s
- **Git Repo**：`sageLLM-kv-pool`

#### 2.3 eviction_policy/ - 淘汰策略
- **职责**：LRU/LFU/ARC/S3FIFO/Learned 淘汰策略、收益-代价模型
- **Baseline**：CacheGen, vLLM eviction, S3FIFO paper
- **独立接口**：`EvictionPolicy.select_victims(context) -> victims`
- **性能指标**：命中率提升 ≥10%，决策延迟 <10µs
- **Git Repo**：`sageLLM-eviction-policy`

#### 2.4 scheduler_ir/ - 调度 IR 与 PD 分离
- **职责**：Prefill/Decode 解耦 IR、策略迁移（FIFO/Priority/SLO-aware/Adaptive）
- **Baseline**：DistServe PD separation, Orca scheduler, Aegaeon
- **独立接口**：`IRBuilder.build(requests) -> ExecutionPlan`
- **性能指标**：IR 构建 <1ms，PD 分离后吞吐提升 ≥30%
- **Git Repo**：`sageLLM-scheduler-ir`

#### 2.5 lifetime_predictor/ - 生命周期预测（可选）
- **职责**：预测 KV block 的 TTL（Time-To-Live），辅助淘汰决策
- **Baseline**：CacheGen lifetime prediction, Learned eviction (ML-based)
- **独立接口**：`LifetimePredictor.predict(block_meta) -> ttl`
- **性能指标**：预测准确率 ≥70%，inference 延迟 <5µs
- **Git Repo**：`sageLLM-lifetime-predictor`

---

### 【大方向 3】模型压缩与加速 (Task 3)

#### 3.1 quantization/ - 量化（权重/KV/激活）
- **职责**：GPTQ/AWQ/SmoothQuant，KV Cache on-the-fly 量化，校准工具
- **Baseline**：GPTQ paper, AWQ paper, TensorRT-LLM INT8/FP8, vLLM FP8 KV
- **独立接口**：`Quantizer.quantize(model) -> quantized_model`
- **性能指标**：吞吐 ≥2x，精度损失 <1%，显存 -40%
- **Git Repo**：`sageLLM-quantization`

#### 3.2 sparsity/ - 稀疏化（结构化/非结构化）
- **职责**：2:4/4:8 结构化稀疏、Attention/FFN 剪枝、Sparse kernel
- **Baseline**：SparseGPT, Wanda pruning, 2:4 sparsity (NVIDIA Ampere)
- **独立接口**：`SparsityController.apply_sparsity(model, ratio)`
- **性能指标**：加速比 ≥1.5x，精度损失 <2%
- **Git Repo**：`sageLLM-sparsity`

#### 3.3 speculative_decoding/ - 投机解码
- **职责**：Draft model + Verifier，多 token 接受，回退策略
- **Baseline**：Medusa, SpecInfer, EAGLE
- **独立接口**：`SpeculativeDecoder.generate(draft_model, verifier)`
- **性能指标**：加速比 ≥2x，接受率 ≥60%
- **Git Repo**：`sageLLM-speculative-decoding`

#### 3.4 kernel_fusion/ - Kernel 融合
- **职责**：Attention/LayerNorm/FFN 融合，FlashAttention 集成，自定义 CUDA kernel
- **Baseline**：FlashAttention-2/3, xFormers, FasterTransformer
- **独立接口**：`FusedKernel.apply(input) -> output`
- **性能指标**：延迟降低 ≥20%，显存占用 -30%
- **Git Repo**：`sageLLM-kernel-fusion`

#### 3.5 cot_acceleration/ - CoT 加速（可选）
- **职责**：思维链（Chain-of-Thought）推理加速，中间步骤缓存
- **Baseline**：思维链 pruning 研究，self-consistency 优化
- **独立接口**：`CoTAccelerator.accelerate_cot(reasoning_steps)`
- **性能指标**：CoT 推理延迟降低 ≥30%
- **Git Repo**：`sageLLM-cot-acceleration`

______________________________________________________________________

## PR 切分与开发策略（基于 3 大方向 15 小模块）

### 开发顺序（按依赖关系）

```
Phase 0 (Week 1-2, 基础设施):
  PR1 (P0) ─> core/ Protocol/types 定义 + engines/ 骨架
  PR2 (P0) ─> third_party/lmdeploy submodule + 补丁框架

Phase 1 (Week 3-5, 大方向 1 - 通信传输，5 个并行):
  PR3.1 (P1) ─> direction_1/topology/               (独立 submodule)
  PR3.2 (P1) ─> direction_1/collective_ops/         (独立 submodule)
  PR3.3 (P1) ─> direction_1/kv_transfer/            (独立 submodule)
  PR3.4 (P1) ─> direction_1/overlap_pipeline/       (独立 submodule)
  PR3.5 (P2) ─> direction_1/domestic_interconnect/  (独立 submodule, 可选)

Phase 2 (Week 6-8, 大方向 2 - KV 管理调度，5 个并行):
  PR4.1 (P1) ─> direction_2/prefix_cache/           (独立 submodule)
  PR4.2 (P1) ─> direction_2/kv_pool/                (独立 submodule)
  PR4.3 (P1) ─> direction_2/eviction_policy/        (独立 submodule)
  PR4.4 (P0) ─> direction_2/scheduler_ir/           (独立 submodule)
  PR4.5 (P2) ─> direction_2/lifetime_predictor/     (独立 submodule, 可选)

Phase 3 (Week 9-11, 大方向 3 - 模型压缩加速，5 个并行):
  PR5.1 (P1) ─> direction_3/quantization/           (独立 submodule)
  PR5.2 (P1) ─> direction_3/sparsity/               (独立 submodule)
  PR5.3 (P1) ─> direction_3/speculative_decoding/   (独立 submodule)
  PR5.4 (P1) ─> direction_3/kernel_fusion/          (独立 submodule)
  PR5.5 (P2) ─> direction_3/cot_acceleration/       (独立 submodule, 可选)

Phase 4 (Week 12, 集成与验收):
  PR6 (P0) ─> engines/lmdeploy 深度集成 + 所有模块组装
  PR7 (P1) ─> benchmarks/ 统一 runner + CI perf gate
```

### 并行开发能力
- **Phase 1**：5 个人同时开发 5 个通信模块（完全独立）
- **Phase 2**：5 个人同时开发 5 个 KV 管理模块（完全独立）
- **Phase 3**：5 个人同时开发 5 个加速模块（完全独立）
- **每个模块**：独立 git repo → 独立测试 → 独立 benchmark → 独立发布

### Submodule 管理策略
```bash
# 添加新模块（示例：topology）
cd packages/sage-common/src/sage/common/components/sage_llm/sageLLM/
git submodule add https://github.com/IntelliStream/sageLLM-topology.git direction_1_communication/topology

# 初始化所有模块
./tools/maintenance/sage-maintenance.sh submodule init

# 更新某个模块
cd direction_1_communication/topology && git pull origin main
```

______________________________________________________________________

## 关键 Hook 与模块协同（仅通过 Protocol）

### Hook 位置与协议约束
每个模块通过 engines/ 层的 Hook 与 LMDeploy 集成，但**模块间不直接依赖**，仅通过 Protocol 通信。

| 模块 | Hook 位置 | 提供的 Protocol | 消费的 Protocol | 独立性验证 |
|------|----------|----------------|----------------|-----------|
| **prefix_reuse** | `SequenceManager.fetch/store` | `PrefixReuseIndex`, `PrefixMatcher` | 无 | ✅ 可单独 benchmark 命中率 |
| **kv_runtime** | 块分配/释放/迁移 API | `KVBackendProtocol` | 无 | ✅ 可单独 benchmark 分配/迁移性能 |
| **kv_policy** | 淘汰/迁移回调 | `EvictionPolicy`, `MigrationPolicy` | `KVBackendProtocol` | ✅ 可用 mock backend 测试策略 |
| **scheduler_ir** | 请求队列/调度决策下发 | `ExecutorAPI`, `IRGraph` | 无 | ✅ 可单独测试 IR 构建/优化 |
| **comm_backend** | TP/PP 通信拦截 | `CommBackendProtocol`, `KVTransferChannel` | 无 | ✅ 可单独 benchmark 通信带宽 |
| **accel** | Kernel 调用/量化加载 | `AccelController`, `QuantizationProfile` | 无 | ✅ 可单独测试量化精度/加速比 |
| **engines** | 所有上述 Hook 的集成 | 无（消费者） | 所有上述 Protocol | ⚠️ 集成测试点 |

### 协同模式（通过 engines/ 编排）
```python
# engines/lmdeploy/engine.py 伪代码示例
class LMDeployEngine:
    def __init__(self, config):
        # 通过 Protocol 组装各模块（依赖注入）
        self.prefix_index: PrefixReuseIndex = create_prefix_index(config)
        self.kv_backend: KVBackendProtocol = create_kv_backend(config)
        self.kv_policy: EvictionPolicy = create_kv_policy(config)
        self.scheduler: ExecutorAPI = create_scheduler_ir(config)
        self.comm: CommBackendProtocol = create_comm_backend(config)
        self.accel: AccelController = create_accel_controller(config)
        
    def generate(self, request):
        # 1. scheduler_ir 生成执行计划
        plan = self.scheduler.build_plan(request)
        
        # 2. prefix_reuse 查找前缀
        prefix_hit = self.prefix_index.lookup(request.tokens)
        
        # 3. kv_runtime 分配 KV blocks (通过 kv_policy 决策)
        blocks = self.kv_backend.allocate(plan.kv_demand)
        if blocks is None:
            victims = self.kv_policy.select_victims()
            self.kv_backend.free(victims)
        
        # 4. comm_backend 处理跨节点传输
        if plan.requires_migration:
            self.comm.transfer_kv(blocks, target_node)
        
        # 5. accel 应用量化/投机解码
        model = self.accel.get_quantized_model()
        
        # 6. 实际推理...
```

**关键约束**：
- ✅ engines/ 可以依赖所有模块的 Protocol
- ❌ 功能模块之间禁止直接依赖（即 prefix_reuse 不能 `from kv_runtime import KVPool`）
- ✅ 功能模块可以依赖 core/ 的 Protocol（如 `KVBackendProtocol`）

______________________________________________________________________

## 课题映射（3 大方向 → Task Prompts）

| Task/Prompt 文件 | 大方向 | 包含的小方向（独立 submodule） | 人员分工建议 |
|----------------|-------|---------------------------|-----------|
| **task1-kv-transport/** | 通信与传输优化 | 1.1 topology<br>1.2 collective_ops<br>1.3 kv_transfer<br>1.4 overlap_pipeline<br>1.5 domestic_interconnect | 5 人并行<br>（每人负责 1 个 submodule） |
| **task2-kv-cache-scheduling/** | KV 管理与调度 | 2.1 prefix_cache<br>2.2 kv_pool<br>2.3 eviction_policy<br>2.4 scheduler_ir<br>2.5 lifetime_predictor | 5 人并行<br>（每人负责 1 个 submodule） |
| **task3-model-compression/** | 模型压缩与加速 | 3.1 quantization<br>3.2 sparsity<br>3.3 speculative_decoding<br>3.4 kernel_fusion<br>3.5 cot_acceleration | 5 人并行<br>（每人负责 1 个 submodule） |

### 分工策略示例

**Task 1 团队（通信传输，5 人）**
- 👨‍💻 A: topology (拓扑感知) - 熟悉硬件架构
- 👩‍💻 B: collective_ops (集合通信) - 熟悉 NCCL/MPI
- 👨‍💻 C: kv_transfer (KV 传输) - 熟悉网络编程
- 👩‍💻 D: overlap_pipeline (计算通信重叠) - 熟悉调度
- 👨‍💻 E: domestic_interconnect (国产互联) - 熟悉国产硬件

**Task 2 团队（KV 管理，5 人）**
- 👩‍💻 F: prefix_cache (前缀复用) - 熟悉 Radix Tree/Trie
- 👨‍💻 G: kv_pool (KV 池化) - 熟悉内存管理
- 👩‍💻 H: eviction_policy (淘汰策略) - 熟悉缓存算法
- 👨‍💻 I: scheduler_ir (调度 IR) - 熟悉编译器/IR
- 👩‍💻 J: lifetime_predictor (生命周期预测) - 熟悉 ML

**Task 3 团队（模型压缩，5 人）**
- 👨‍💻 K: quantization (量化) - 熟悉低精度计算
- 👩‍💻 L: sparsity (稀疏化) - 熟悉剪枝/稀疏
- 👨‍💻 M: speculative_decoding (投机解码) - 熟悉推理优化
- 👩‍💻 N: kernel_fusion (Kernel 融合) - 熟悉 CUDA/Triton
- 👨‍💻 O: cot_acceleration (CoT 加速) - 熟悉推理链优化

### 独立性验证清单（每个小方向必查）

每个 submodule 在提交前必须通过：
- ✅ **独立 git repo**：可以单独 clone 和开发
- ✅ **独立 README**：包含 baseline 对比、快速开始、性能指标
- ✅ **独立测试**：tests/ 可脱离其他模块运行（用 mock）
- ✅ **独立 benchmark**：benchmarks/ 可单独测量性能
- ✅ **统一接口**：实现 core/ 定义的 Protocol
- ✅ **Baseline 对比**：性能不劣于现有工作（vLLM/SGLang/TensorRT-LLM）

______________________________________________________________________

## Prompt 结构模板（强化模块独立性）

每个课题的 prompt 必须包含以下部分：

### 必需章节
1. **背景与目标**：明确模块的单一职责，说明为什么需要独立设计
2. **前置依赖**：列出依赖的 Protocol（仅来自 core/），禁止依赖其他功能模块的实现
3. **研究内容（Scope）**：按子任务拆分，每个子任务可独立实现和测试
4. **模块设计**：
   - 目录结构（包含 tests/、benchmarks/）
   - 核心接口（Protocol/ABC 定义）
   - 数据结构（dataclass/pydantic）
   - **独立性验证清单**（如何证明该模块可脱离其他模块运行）
5. **Success Criteria**：
   - **性能指标**：模块单独的性能目标（如 prefix_reuse 命中率，kv_runtime 分配延迟）
   - **工程化要求**：独立测试覆盖率、benchmark 输出格式、mock backend 支持
   - **集成验证**：与 engines/ 集成后的 E2E 测试
6. **交付物**：
   - 设计文档（架构图、协议定义、独立性说明）
   - 核心代码（含 tests/、benchmarks/）
   - README（问题/局限、快速开始、独立测试方法、性能基线）
   - 集成示例（如何在 engines/ 中使用该模块）

### 独立性检查清单（每个 prompt 必须回答）
- ✅ **零实现依赖**：该模块是否不依赖其他功能模块的实现类？
- ✅ **Protocol 隔离**：所有依赖是否通过 Protocol/ABC 定义？
- ✅ **Mock 测试**：能否用 mock backend 独立测试核心逻辑？
- ✅ **独立 Benchmark**：能否单独测量该模块的性能（不依赖完整系统）？
- ✅ **多实现支持**：接口是否支持多种实现（如 nccl/gloo/mock）？
- ✅ **国产适配预留**：是否预留国产算力的适配钩子？

______________________________________________________________________

## 统一指标基线（用于 Success Criteria）

- MFU ≥ 基线 -1%
- TTFT/TPOT p50/p95 回退 \<5%
- KV hit 提升需量化；长上下文（≥32K/64K/128K）稳定运行
- 通信占比下降或持平；单位 token 成本（GPU·s/token 或 ￥/token）不劣于基线
- Bench & CI：`sage.common.components.sage_llm.sageLLM.benchmarks` runner + `ci_gate` perf gate

______________________________________________________________________

## 工程最佳实践

### 模块开发规范
- **目录结构**：每个模块需包含 `__init__.py`、README.md、tests/、benchmarks/ (可选)
- **README 模板**：说明要解决的问题与局限、快速开始（依赖安装 + 最小 Demo）、如何运行测试/benchmark、关键指标表（目标值）、接口文档引用
- **接口设计**：使用 Protocol/ABC 定义抽象接口；数据类使用 pydantic 或 dataclass；暴露清晰的公共 API
- **配置管理**：统一使用 `SagePorts` 管理端口；配置文件使用 YAML + pydantic 验证；支持环境变量覆盖

### 测试策略
- **单元测试**：各模块 tests/ 覆盖核心逻辑；使用 mock 后端；覆盖边界与异常路径
- **集成测试**：
  - prefix_reuse ↔ kv_runtime ↔ engines.lmdeploy（前缀命中复用）
  - kv_policy ↔ kv_runtime（淘汰/迁移决策生效）
  - scheduler_ir ↔ engines.lmdeploy（IR 下发执行）
  - comm_backend ↔ engines.lmdeploy（多卡 TP 通信钩子）
  - accel ↔ engines.lmdeploy（量化/投机解码开启）
- **Benchmark**：长上下文、混合负载、通信吞吐、加速比；输出 JSON/Markdown
- **性能回归门禁**：`ci_gate` 检查 MFU/TTFT/TPOT/KV hit/通信占比/成本

### 第三方集成规范
- **Submodule 管理**：使用 `tools/maintenance/sage-maintenance.sh`；禁止 `git submodule update --init`
- **补丁管理**：存于 `third_party/patches/<vendor>/`；提供 `apply_patches.sh` 支持幂等；补丁编号格式 `0001-<description>.patch`
- **版本控制**：`VERSION` 文件记录 tag/commit；`patches/README.md` 说明补丁目的与应用顺序
- **许可证合规**：明确记录第三方代码许可证（如 LMDeploy Apache-2.0）

### CI 集成步骤
1. 安装：`./tools/install/ci_install_wrapper.sh --dev --yes`
2. 单测：`pytest packages/sage-common/src/sage/common/components/sage_llm/sageLLM -q`
3. Lint：`sage-dev quality --check-only`
4. Benchmark（可选慢）：`python -m sage.common.components.sage_llm.sageLLM.benchmarks.runner --preset ci`
5. Perf gate：`python -m sage.common.components.sage_llm.sageLLM.benchmarks.ci_gate --baseline baseline.json --current output.json`

### 风险应对
- **多路径支持**：关键组件提供 mock/真实双路径；CI 走 mock，手动验证真实环境
- **性能基线**：固化基线版本；perf gate 强制阈值；回退需明确理由
- **接口稳定性**：公共 Protocol 避免破坏性修改；使用版本化 API；提供迁移指南
- **维护成本**：模块化设计降低耦合；充分的文档与测试；定期 review 技术债务

______________________________________________________________________

## 文档/实现迁移提示

- 删除 legacy/compat 层；旧文件迁移：`control_plane/strategies/*` → `scheduler_ir/strategies/`；`pd_routing.py`
  → `scheduler_ir/pd_separation.py`；`parallelism.py` → `scheduler_ir/`；`topology.py` →
  `comm_backend/`；`router.py` → scheduler_ir；`engine_lifecycle.py` →
  engines；`executors/http_client.py` → 引擎层替代。
- 第三方：`third_party/lmdeploy` (tag v0.11.0, Apache-2.0) + `third_party/patches/lmdeploy/0001-0004`，提供
  `apply_patches.sh`。
- 端口：统一使用 `SagePorts`，禁止硬编码。

______________________________________________________________________

## 交付与验证矩阵

- 单测：各模块 tests/ 覆盖核心逻辑；mock 后端；异常与边界。
- 集成测：prefix_reuse↔kv_runtime↔engines.lmdeploy；kv_policy↔kv_runtime；scheduler_ir↔engines；comm_backend↔engines；accel↔engines。
- Benchmark：长上下文、混合负载、通信吞吐、加速比；输出 JSON/Markdown。
- Perf gate：`ci_gate` 检查 MFU/TTFT/TPOT/KV hit/通信占比/成本。

______________________________________________________________________

## 模块交互模式与数据流

### 请求处理流程
```
用户请求 → scheduler_ir (策略/IR构建) → engines/lmdeploy (Scheduler 注入) →
    prefix_reuse (命中前缀→复用 KV block) → kv_runtime (池化/分层/迁移) →
    kv_policy (选淘汰/迁移) → comm_backend (TP/PP/跨节点 KV 传输/融合) →
    accel (量化/稀疏/投机解码/CoT) → TurboMind kernel → 返回
```

### 关键交互点（引擎 Hook）
| 模块 | Hook 位置 | 作用 | 数据流向 |
|------|----------|------|---------|
| prefix_reuse | `SequenceManager.fetch/store` | token hash → KV block 映射查找与更新 | LMDeploy ↔ prefix_reuse |
| kv_runtime | 块分配/释放/迁移 API | 池化资源管理、碎片/利用率查询 | LMDeploy → kv_runtime |
| kv_policy | 淘汰候选选择、迁移触发回调 | 策略驱动的 KV 生命周期管理 | kv_runtime → kv_policy → kv_runtime |
| scheduler_ir | 请求队列、调度决策下发 | 外部 IR/策略注入引擎 | scheduler_ir → LMDeploy Scheduler |
| comm_backend | TP/PP 通信拦截 | 带宽/拓扑感知、融合优化 | LMDeploy → comm_backend |
| accel | Kernel 调用路径 | 量化/投机解码入口 | LMDeploy → accel |

### 引擎补丁明细（按顺序应用）
1. **0001-extend-kv-manager-api.patch**
   - 扩展：`get_block_info()`, `register_eviction_callback(cb)`, `migrate_blocks(plan)`
   - 目的：暴露块元数据、支持外部策略触发迁移

2. **0002-add-prefix-reuse-hooks.patch**
   - 位置：`fetch()` 前调用 prefix lookup；`store()` 后更新索引
   - 目的：前缀命中时复用 KV block，减少 prefill

3. **0003-scheduler-ir-integration.patch**
   - 扩展：Scheduler 支持外部决策/IR；添加决策回调接口
   - 目的：让 scheduler_ir 将计划直接下发引擎

4. **0004-comm-backend-hooks.patch**
   - 位置：NCCL 调用前后插入钩子
   - 目的：收集带宽/时延；可注入通信融合策略

______________________________________________________________________

## 参考资源

### SAGE 代码库位置
- sageLLM 新架构: `packages/sage-common/src/sage/common/components/sage_llm/sageLLM/`
- Control Plane: `packages/sage-llm-core/src/sage/llm/control_plane/`

### 相关论文/项目
- **LMDeploy/TurboMind**: 国产推理引擎，支持多种量化与优化
- **vLLM**: PagedAttention, Prefix Caching
- **SGLang**: RadixAttention
- **TensorRT-LLM**: 量化推理
- **FlashAttention**: 高效注意力计算
- **DistServe/Mooncake**: PD 分离

### SAGE 文档
- 架构文档: `docs-public/docs_src/dev-notes/package-architecture.md`
- Copilot 指南: `.github/copilot-instructions.md`
