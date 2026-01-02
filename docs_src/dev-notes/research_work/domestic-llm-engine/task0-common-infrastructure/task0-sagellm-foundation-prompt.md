# Task 0 Prompt：sageLLM 推理引擎基础架构

你是负责 **sageLLM 推理引擎** 开发的首席架构师。sageLLM 是 SAGE 项目自研的面向国产算力优化的 LLM 推理引擎，与 vLLM、LMDeploy、Chitu 等引擎平级。请基于下述架构要求，给出 sageLLM 的基础设计方案。

______________________________________________________________________

## 背景与目标

- **sageLLM 定位**：独立推理引擎（与 vLLM/LMDeploy/Chitu 平级），专注国产算力优化（昇腾/寒武纪/海光/昆仑）。
- **架构位置**：放在 `packages/sage-llm-core/src/sage/llm/engines/sagellm/`，作为 Control Plane 可调度的引擎之一。
- **与其他引擎的关系**：
  - vLLM: `sage.llm.engines.third-party.vllm` - NVIDIA GPU 优化
  - LMDeploy: `sage.llm.engines.third-party.lmdeploy` - 清华 LMDeploy
  - Chitu: `sage.llm.engines.third-party.chitu` - 清华 Chitu
  - sageLLM: `sage.llm.engines.sagellm` - 国产算力优化（本项目自研）
- **目标**：完成 sageLLM 基础架构，包括目录骨架、协议定义、核心模块接口，为后续 15 个子模块提供基座。
- 交付：1) 目录骨架；2) Protocol/types/schema；3) 引擎注册接口；4) 最小 demo；5) README/CLI。

______________________________________________________________________

## 研究内容（Scope）

1. **目录与协议落地**

- 创建 sageLLM 引擎目录（在 `packages/sage-llm-core/src/sage/llm/engines/sagellm/` 下）：
  - `core/` - 核心协议、类型定义、配置管理
  - `prefix_reuse/` - 前缀复用模块
  - `kv_runtime/` - KV Cache 运行时
  - `kv_policy/` - KV 淘汰策略
  - `scheduler_ir/` - 调度中间表示
  - `comm_backend/` - 通信后端（国产互联适配）
  - `accel/` - 加速优化（量化/稀疏/Kernel融合）
  - `benchmarks/` - 性能测试
- 定义共用协议：`KVCacheSchema`, `CapabilityDescriptor`, `QuantizationProfile`, `KVBackendProtocol`,
  `CommBackendProtocol`, `AccelConfig`, `ExecutionPlan/IRNode/IRGraph` 等核心类型。

2. **实现标准引擎接口**

- sageLLM 实现 `BaseInferenceEngine` 接口（与 vLLM/LMDeploy/Chitu 相同的接口）。
- 注册到 Control Plane：`sage.llm.control_plane.manager.ControlPlaneManager`。
- 数据结构：复用 `EngineInfo`, `RequestMetadata`（来自 `sage.llm.control_plane`）。
- **不依赖其他引擎**：sageLLM 是完全独立实现，不作为 vLLM/LMDeploy 的包装器。

3. **国产算力适配基础**

- `comm_backend/domestic/` - 昇腾 HCCL、寒武纪 CNCL、海光 RCCL、昆仑 BKCL 适配。
- `accel/kernels/domestic/` - 国产硬件 Kernel 实现（FlashAttention-Ascend/MLU 等）。
- 硬件抽象层，支持运行时检测和动态加载。

3. **国产算力适配基础**

- `comm_backend/domestic/` - 昇腾 HCCL、寒武纪 CNCL、海光 RCCL、昆仑 BKCL 适配。
- `accel/kernels/domestic/` - 国产硬件 Kernel 实现（FlashAttention-Ascend/MLU 等）。
- 硬件抽象层，支持运行时检测和动态加载。

4. **最小可运行 Demo**

- 路径：`examples/sagellm_minimal_demo.py`。
- 流程：`Control Plane → sageLLM engine → 推理`，验证 TTFT/TPOT 可正常工作。
- CLI：`sage llm engine start <model> --engine-kind sagellm` 启动 sageLLM 引擎。
- 客户端：`UnifiedInferenceClient.create()` 自动路由到 sageLLM/vLLM/LMDeploy/Chitu。

5. **配置与 CLI**

- CLI 入口：`sage llm engine` 命名空间（已存在），新增 `--engine-kind sagellm` 选项。
- 配置：`config/engines/sagellm.yaml`（KV schema、通信 preset、加速配置）。
- 端口：通过 `SagePorts` 获取，严禁硬编码。

______________________________________________________________________

## 模块设计与目录（硬约束）

**CRITICAL 架构说明**：
- **Control Plane** 在 `sage-llm-core/src/sage/llm/control_plane/` (L1层)，负责多引擎调度。
- **推理引擎层** 在 `sage-llm-core/src/sage/llm/engines/`，包含：
  - `third-party/vllm/` - vLLM 引擎适配器（NVIDIA GPU）
  - `third-party/lmdeploy/` - LMDeploy 引擎适配器（清华）
  - `third-party/chitu/` - Chitu 引擎适配器（清华）
  - **`sagellm/`** - 本项目自研引擎（国产算力优化）
- **Gateway** 在 `sage-llm-gateway` (L6层)，提供 OpenAI-compatible API。

```
packages/sage-llm-core/src/sage/llm/
├── control_plane/           # Control Plane 核心（已存在）
│   ├── manager.py           # ControlPlaneManager - 多引擎调度
│   ├── strategies/          # 调度策略
│   └── executors/           # 执行器
├── engines/                 # 推理引擎层（所有引擎统一入口）
│   ├── base.py              # BaseInferenceEngine 接口定义
│   ├── third-party/         # 第三方引擎适配器
│   │   ├── vllm/            # vLLM 引擎（NVIDIA GPU 优化）
│   │   ├── lmdeploy/        # LMDeploy 引擎（清华）
│   │   └── chitu/           # Chitu 引擎（清华）
│   └── sagellm/             # sageLLM 自研引擎（国产算力优化）
│       ├── __init__.py      # 引擎入口
│       ├── engine.py        # SageLLMEngine 主类
│       ├── core/            # 核心协议、类型、配置
│       ├── prefix_reuse/    # Task 2.1：前缀复用（Radix Attention）
│       ├── kv_runtime/      # Task 2.2：KV Cache 运行时
│       ├── kv_policy/       # Task 2.3-2.5：淘汰策略、生命周期预测
│       ├── scheduler_ir/    # Task 2.4：调度 IR
│       ├── comm_backend/    # Task 1：通信层（含国产互联）
│       │   ├── topology/    # 1.1 拓扑感知
│       │   ├── collective_ops/  # 1.2 集合通信
│       │   ├── kv_transfer/     # 1.3 KV 传输
│       │   ├── overlap/         # 1.4 计算通信重叠
│       │   └── domestic/        # 1.5 国产互联（HCCL/CNCL/RCCL/BKCL）
│       ├── accel/           # Task 3：加速优化
│       │   ├── quantization/    # 3.1 量化
│       │   ├── sparsity/        # 3.2 稀疏化
│       │   ├── speculative/     # 3.3 投机解码
│       │   ├── kernel_fusion/   # 3.4 Kernel 融合
│       │   └── cot/             # 3.5 CoT 加速
│       └── benchmarks/      # 性能测试
└── unified_client.py        # UnifiedInferenceClient（已存在）
```

______________________________________________________________________

## 交付要求

- **引擎接口**：实现 `BaseInferenceEngine`，与 vLLM/LMDeploy/Chitu 保持一致。
- **协议定义**：提供 `KVCacheSchema`, `CapabilityDescriptor` 等核心协议，文档化字段含义。
- **注册机制**：sageLLM 可注册到 Control Plane，支持动态加载/卸载。
- **Demo & Tests**：最小 demo 可运行；单测覆盖协议序列化/配置加载。
- **文档**：各模块 README，描述设计思路、接口规范、性能目标。

______________________________________________________________________

## Success Criteria

- sageLLM 可作为独立引擎启动，不依赖其他引擎实现。
- Control Plane 可同时管理 sageLLM、vLLM、LMDeploy、Chitu，根据硬件特征智能路由。
- 国产算力（昇腾/寒武纪）可正常运行基础推理任务。
- 后续 15 个子模块可基于这个基座独立开发。

______________________________________________________________________

## 交付物清单

1. 目录骨架 + 基础协议/types 代码（在 `packages/sage-llm-core/src/sage/llm/engines/sagellm/`）。
2. `engine.py` - SageLLMEngine 主类实现。
3. 最小 demo + 基础单测。
4. README（core/ + 各子模块）+ CLI 用法说明。
5. CI 提示：`pytest packages/sage-llm-core/src/sage/llm/engines/sagellm -q`。

````

### 与 Control Plane 集成

```python
# sageLLM 引擎注册到 Control Plane
from sage.llm.control_plane import ControlPlaneManager
from sage.llm.engines.sagellm import SageLLMEngine

# Control Plane 管理多个引擎
cp_manager = ControlPlaneManager()

# 注册 sageLLM 引擎（国产算力优先）
sagellm_engine = SageLLMEngine(
    model="Qwen/Qwen2.5-7B-Instruct",
    device="ascend",  # 昇腾 910B
    kv_schema="fp8"
)
cp_manager.register_engine("sagellm", sagellm_engine)

# 同时支持其他引擎
# cp_manager.register_engine("vllm", VLLMEngine(...))
# cp_manager.register_engine("lmdeploy", LMDeployEngine(...))
# cp_manager.register_engine("chitu", ChituEngine(...))

# Control Plane 智能调度：
# 1. 请求类型 → 路由到对应引擎
# 2. 硬件特征 → 国产算力优先选 sageLLM
# 3. 负载均衡 → 避免单引擎过载
# 4. SLO 优先级 → 紧急请求优先级调度
````

### 使用示例

1. **启动 sageLLM 引擎**：
   ```bash
   sage llm engine start Qwen/Qwen2.5-7B-Instruct --engine-kind sagellm --device ascend
   ```

2. **Control Plane 调度**：
   ```python
   from sage.llm import UnifiedInferenceClient
   
   # 客户端自动连接 Control Plane
   client = UnifiedInferenceClient.create()
   
   # Control Plane 根据硬件/负载智能路由到 sageLLM/vLLM/LMDeploy
   response = client.chat([{"role": "user", "content": "你好"}])
   ```

3. **多引擎混合部署**：
   - 昇腾/寒武纪节点 → sageLLM 引擎
   - NVIDIA GPU 节点 → vLLM 引擎
   - CPU 节点 → LMDeploy 引擎
   - Control Plane 统一调度，透明路由

______________________________________________________________________

## 研究目标（Success Criteria）

### 技术指标

| 指标                      | 目标                                                    |
| ------------------------- | ------------------------------------------------------- |
| InferenceBackend 接口实现 | 能驱动 vLLM 正常推理，无性能回退 (±3%)                  |
| 接口文档                  | 覆盖 KV Schema、Capability、Transport 契约              |
| CLI 兼容性                | `sage llm serve` 支持 `--backend`、`--kv-schema` 新参数 |
| 测试覆盖                  | 新增接口的单元测试/契约测试 ≥80% 覆盖                   |
| 课题依赖                  | 三个课题均引用 Phase 0 提供的接口，无自定义重复定义     |

### 工程化指标

1. **设计文档**：位于 `docs/dev-notes/.../task0-common-infrastructure/README.md`，描述接口、调用链、演进路线。
1. **代码实现**：`InferenceBackend` 抽象、`VLLMBackendAdapter`、CLI 扩展、示例配置。
1. **测试脚本**：最小端到端用例（Control Plane → Backend Adapter → vLLM）。
1. **并行指引**：在 meta prompt 中附 Phase 0 完成标准及课题间依赖说明。

______________________________________________________________________

## 交付物要求

1. `prompt.md`（本文档）
1. `README.md`：Phase 0 设计说明、接口详解、依赖图
1. `interfaces/*.py`：接口与数据结构实现
1. `backends/vllm_adapter.py`：vLLM 适配器 + 单元测试
1. `cli/commands.py`：`sage infer` 命令实现
1. `examples/phase0_demo.py`：驱动 Control Plane 的示例
1. CI Hook：在 `sage-dev project test` 中加入 Phase 0 契约测试

______________________________________________________________________

请在方案中明确：接口契约、演进路线、向下兼容策略、以及各课题如何复用这些成果。Phase 0 完成后，再进入课题一/二/三的正式实现，以降低重复建设与后期重构成本。
