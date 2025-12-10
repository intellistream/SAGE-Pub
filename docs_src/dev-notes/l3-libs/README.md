# L3 Libs 开发文档

`sage-libs` 属于 L3（核心 & 算法层），包含 SAGE 的核心算法库。本目录记录 sage-libs 的开发文档和历史。

## 📦 主要模块

### 🤖 Agentic 模块 (新增)

位置: `packages/sage-libs/src/sage/libs/agentic/`

提供 Agent 能力的核心组件，支持 benchmark_agent 评测：

```
agentic/
├── agents/
│   ├── action/                    # 动作执行
│   │   ├── tool_selection/        # 工具选择器
│   │   │   ├── keyword_selector.py    # BM25/TF-IDF 关键词选择
│   │   │   ├── embedding_selector.py  # 嵌入相似度选择
│   │   │   ├── hybrid_selector.py     # 混合策略
│   │   │   ├── gorilla_selector.py    # Gorilla (Patil et al., 2023)
│   │   │   └── dfsdt_selector.py      # ToolLLM DFSDT (Qin et al., 2023)
│   │   └── mcp_server.py          # MCP 服务器集成
│   ├── planning/                  # 任务规划器
│   │   ├── hierarchical_planner.py  # 层次化规划
│   │   ├── llm_planner.py          # LLM 基础规划
│   │   ├── react_planner.py        # ReAct (Yao et al., 2023)
│   │   ├── tot_planner.py          # Tree-of-Thoughts
│   │   ├── timing_decider.py       # 时机决策器
│   │   └── schemas.py              # 数据模型
│   ├── profile/                   # Agent 配置
│   ├── runtime/                   # 运行时适配器
│   └── bots/                      # 预置 Bot
└── workflow/                      # 工作流管理
```

**使用示例**:
```python
from sage.libs.agentic.agents.action.tool_selection import (
    KeywordSelector, EmbeddingSelector, HybridSelector
)
from sage.libs.agentic.agents.planning import (
    HierarchicalPlanner, ReActPlanner, TreeOfThoughtsPlanner
)
```

### 🔧 Finetune 模块

位置: `packages/sage-libs/src/sage/libs/finetune/` (libs 层保留核心逻辑)

提供模型微调的核心功能：

| 模块 | 描述 |
|------|------|
| `core.py` | 核心微调逻辑 |
| `trainer.py` | 训练器实现 |
| `data.py` | 数据处理 |
| `config.py` | 配置管理 |
| `models.py` | 模型定义 |

#### 核心文档
- **[FINETUNE_REFACTOR_SUMMARY.md](./FINETUNE_REFACTOR_SUMMARY.md)** - 模块化重构总结（内部实现细节）
- **[CHAT_FINETUNE_INTEGRATION_SUMMARY.md](./CHAT_FINETUNE_INTEGRATION_SUMMARY.md)** - Chat 集成说明
- **[AGENT_FINETUNE_API_REFERENCE.md](./AGENT_FINETUNE_API_REFERENCE.md)** - Agent Finetune API 参考

#### Finetune 文档概览

为避免在多个文档间来回跳转，本小节汇总了 Finetune 相关笔记的关键结论，具体实现细节仍保留在各独立文档中。

- **Finetune 重构总结** (`FINETUNE_REFACTOR_SUMMARY.md`)
    - 记录了从「单文件 1000+ 行」到「按功能拆分为 core/trainer/data/config/models」的重构过程。
    - 重点是目录与模块边界的确定，以及如何在不破坏外部 API 的前提下完成拆分。
- **Chat Finetune 集成** (`CHAT_FINETUNE_INTEGRATION_SUMMARY.md`)
    - 描述了微调后的模型如何在 Chat 后端中被注册、加载与路由。
    - 与 cross-layer 的 `FINETUNE_BACKEND_INTEGRATION.md` 相呼应，前者偏 libs 层实现，后者偏端到端架构。
- **Agent Finetune API 参考** (`AGENT_FINETUNE_API_REFERENCE.md`)
    - 定义了 Agent 相关 SFT/RL 训练接口（config、数据格式、结果产物）。
    - 与 `AGENT_TRAINING_PIPELINE.md` 一起，构成 Agent 训练从「概念 → 代码」的完整链路。

> 📁 历史文档已归档到 `archive/l3-libs/`

### 📊 Embedding 系统

Embedding 系统的文档：

- **[EMBEDDING_OPTIMIZATION_PLAN.md](./EMBEDDING_OPTIMIZATION_PLAN.md)** - 优化计划
- **[EMBEDDING_CHANGELOG.md](./EMBEDDING_CHANGELOG.md)** - 变更日志
- **[PIPELINE_BUILDER_EMBEDDING_INTEGRATION.md](./PIPELINE_BUILDER_EMBEDDING_INTEGRATION.md)** - Pipeline 集成

#### Embedding 文档概览

- **Embedding 优化计划** (`EMBEDDING_OPTIMIZATION_PLAN.md`)
    - 讨论了向量维度、批大小、缓存策略等对吞吐与延迟的影响。
    - 给出了在 CPU/GPU 场景下的推荐配置与调优步骤。
- **Embedding 变更日志** (`EMBEDDING_CHANGELOG.md`)
    - 以时间线形式记录了接口变更、默认模型调整以及兼容性注意事项。
    - 在做版本回滚或排查历史行为差异时可快速定位关键变更点。
- **Pipeline Builder 集成** (`PIPELINE_BUILDER_EMBEDDING_INTEGRATION.md`)
    - 描述了在 Pipeline Builder 中使用 Embedding 的最佳实践，包括算子拼接方式与错误处理策略。
    - 适合在搭建端到端 RAG/检索工作流时作为参考。

> 📁 阶段完成报告已归档到 `archive/l3-libs/`

### 🔬 LibAMM 模块

位置: `packages/sage-libs/src/sage/libs/libamm/` (子模块)

C++ 高性能近似矩阵乘法库：

- **[LIBAMM_MEMORY_OPTIMIZATION.md](./LIBAMM_MEMORY_OPTIMIZATION.md)** - 内存优化文档

## 🎯 快速导航

| 想要了解... | 查看 |
|-------------|------|
| Agentic 模块架构 | `packages/sage-libs/src/sage/libs/agentic/` |
| Finetune 使用 | `packages/sage-libs/src/sage/libs/finetune/` |
| 工具选择 SOTA 方法 | [Benchmark adapter_registry.py](../../../../packages/sage-benchmark/src/sage/benchmark/benchmark_agent/adapter_registry.py) |
| Agent Finetune API | [AGENT_FINETUNE_API_REFERENCE.md](./AGENT_FINETUNE_API_REFERENCE.md) |
| Embedding 变更 | [EMBEDDING_CHANGELOG.md](./EMBEDDING_CHANGELOG.md) |

## 📝 开发历史

### v3.0 - Agentic 模块 (2025-11)
- 新增 `agentic/` 模块支持 Agent 能力评测
- 实现 Tool Selection: Keyword, Embedding, Hybrid, Gorilla, DFSDT
- 实现 Planning: Hierarchical, ReAct, ToT
- 实现 Timing Detection: Rule-based, LLM-based, Hybrid

### v2.0 - Finetune 模块化重构 (2025-10)
- 从 1270 行单文件拆分为 9 个模块
- 统一目录结构，删除重复
- 文档合并优化

### v1.5 - Chat 集成 (2025-10)
- 在 `sage chat` 中添加 finetune backend
- 自动服务检测和启动
- 代码简化（减少 85%）

## 🔗 相关资源

- **Agentic 代码**: `packages/sage-libs/src/sage/libs/agentic/`
- **Finetune 代码**: `packages/sage-libs/src/sage/libs/finetune/`
- **Benchmark 集成**: `packages/sage-benchmark/src/sage/benchmark/benchmark_agent/`
- **测试**: `packages/sage-libs/tests/`
- **归档文档**: `docs/dev-notes/archive/l3-libs/`

---

**最后更新**: 2025-11-29
