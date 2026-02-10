# Speculative Decoding 架构迁移说明

## 概述

Speculative decoding 策略已从 `sage-libs` (L3) 迁移到 `sage-llm-core` (L1)，以更好地对齐其作为引擎优化策略的本质。

## 迁移原因

### 之前的架构问题 (L3 算法库)

1. **职责错位**：
   - L3 `sage-libs` 定位是通用算法实现（ANN、RAG等）
   - Speculative decoding 是推理引擎的优化策略，不是独立算法
   - 需要与 vLLM/sageLLM 引擎紧密耦合

2. **依赖关系违反分层原则**：
   ```python
   # ❌ L3 → L1 反向依赖
   from sage.llm.speculative import SpeculativeStrategy
   ```

3. **管理不便**：
   - Control Plane 已有完善的引擎生命周期管理
   - Speculative decoding 应该是这些机制的一部分

### 新架构优势 (L1 引擎层)

1. **职责明确**：引擎优化属于引擎层
2. **依赖合理**：L1 内部依赖，不违反分层原则
3. **易于管理**：Control Plane 可以直接配置和调度
4. **引擎特定**：不同引擎可以有不同实现

## 架构变更

### 之前 (已废弃)
```
packages/sage-libs/src/sage/libs/algorithms/speculative/
└── dynamic_lookahead.py  # ❌ 已删除
```

### 现在 (推荐)
```
packages/sage-llm-core/src/sage/llm/engines/vllm/
├── speculative.py  # ✅ 所有策略的统一位置
│   ├── SpeculativeStrategy (基类)
│   ├── DraftModelStrategy
│   ├── NgramStrategy
│   └── DynamicLookaheadStrategy  # ← 新位置
└── examples/
    └── speculative_decoding_demo.py  # 使用示例
```

## 导入路径变更

### ❌ 旧的导入 (已废弃)
```python
from sage.libs.algorithms.speculative import DynamicLookaheadStrategy
```

### ✅ 新的导入 (推荐)
```python
# 方式 1: 从顶层 sage.llm 导入 (推荐)
from sage.llm import DynamicLookaheadStrategy

# 方式 2: 从引擎模块导入
from sage.llm.engines.vllm import DynamicLookaheadStrategy

# 方式 3: 直接从 speculative 模块导入
from sage.llm.engines.vllm.speculative import DynamicLookaheadStrategy
```

## 使用示例

### 基础使用
```python
from sage.llm import VLLMService, VLLMServiceConfig, DynamicLookaheadStrategy

# 创建策略
strategy = DynamicLookaheadStrategy(min_tokens=3, max_tokens=10)

# 配置服务
config = VLLMServiceConfig(
    model_id="Qwen/Qwen2.5-7B-Instruct",
    auto_download=True,
    speculative_strategy=strategy,
)

# 创建服务
service = VLLMService(config)
service.setup()
```

### Control Plane 集成
```python
from sage.llm.control_plane import ControlPlaneManager
from sage.llm import NgramStrategy

cp = ControlPlaneManager(scheduling_policy="adaptive")

# 启动引擎时配置 speculative decoding
engine_id = cp.start_engine(
    model_id="Qwen/Qwen2.5-7B-Instruct",
    speculative_strategy=NgramStrategy(n=5),
)
```

## 可用策略

### 1. NgramStrategy (轻量级)
```python
from sage.llm import NgramStrategy

strategy = NgramStrategy(
    n=5,                        # N-gram 窗口大小
    num_speculative_tokens=5,   # 预测 token 数量
)
```
- **优点**：无需额外模型，开销小
- **适用**：通用场景，快速启用

### 2. DraftModelStrategy (高性能)
```python
from sage.llm import DraftModelStrategy

strategy = DraftModelStrategy(
    draft_model_id="Qwen/Qwen2.5-0.5B-Instruct",  # 小型 draft 模型
    num_speculative_tokens=5,
    auto_download=True,
)
```
- **优点**：更准确的预测，加速比更高
- **要求**：vLLM >= 0.14.0
- **适用**：高性能场景

### 3. DynamicLookaheadStrategy (研究级)
```python
from sage.llm import DynamicLookaheadStrategy

strategy = DynamicLookaheadStrategy(
    min_tokens=3,   # 最小预测 token 数
    max_tokens=10,  # 最大预测 token 数
)
```
- **优点**：可扩展，适合研究
- **适用**：需要自适应优化的场景

## 扩展自定义策略

```python
from sage.llm.engines.vllm.speculative import SpeculativeStrategy
from typing import Any

class MyCustomStrategy(SpeculativeStrategy):
    """自定义 speculative decoding 策略"""
    
    def __init__(self, **kwargs):
        self.config = kwargs
    
    def apply(self, engine_config: dict[str, Any]) -> None:
        """应用策略到引擎配置"""
        # 实现自定义逻辑
        engine_config["num_speculative_tokens"] = self._compute_optimal_k()
        # 配置其他参数...
    
    def _compute_optimal_k(self) -> int:
        # 自定义算法
        return 5
```

## 迁移清单

- [x] 将 `DynamicLookaheadStrategy` 移动到 `sage-llm-core/engines/vllm/speculative.py`
- [x] 更新 `sage.llm.engines.vllm.__init__.py` 导出
- [x] 更新 `sage.llm.__init__.py` 顶层导出
- [x] 删除 `sage-libs/algorithms/speculative/` 目录
- [x] 创建使用示例文档
- [x] 创建迁移说明文档

## 测试验证

```bash
# 运行测试确保迁移成功
cd /home/shuhao/SAGE
sage-dev project test packages/sage-llm-core/tests/
```

## 相关文档

- vLLM Engine: `packages/sage-llm-core/src/sage/llm/engines/vllm/readme.md`
- Control Plane: `docs-public/docs_src/dev-notes/l1-common/control-plane-enhancement.md`
- 示例代码: `packages/sage-llm-core/src/sage/llm/engines/vllm/examples/speculative_decoding_demo.py`

## 未来计划

1. **Control Plane 智能调度**：
   - 根据系统负载自动启用/禁用 speculative decoding
   - 动态选择最优策略

2. **sageLLM 集成**：
   - 为 sageLLM 引擎实现专用策略
   - 统一 vLLM 和 sageLLM 的 speculative decoding 接口

3. **性能监控**：
   - 集成到 Control Plane 的 metrics 系统
   - 实时监控加速比和准确率

## 问题反馈

如有问题，请提交 Issue 或联系开发团队。
