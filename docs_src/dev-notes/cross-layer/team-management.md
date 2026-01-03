# Team Management & Project Incubation Policy

> 目的：明### 2.1 sageLLM：已独立为私有仓库

**结论**：### 2.3 全量子模块扫描与分档（独立潜力）

> 结论先行：**`sageLLM` 已独立为私有仓库 (P0)；其余包/子模块暂不宜着急独立（保持在 SAGE 内继续孵化）。**

- **P0（已独立）**
	- `sageLLM` 引擎：已独立为私有仓库 `intellistream/sageLLM`，接口对齐 vLLM/LMDeploy。LM` 已从 SAGE 体系中独立，成为单独的私有仓库（`intellistream/sageLLM`）。

**对齐强调**：

- 引擎能力通过统一的引擎抽象层暴露（对齐 `vLLM` / `LMDeploy` / 其他第三方引擎适配器的接口范式）
- 运行与调度必须在 SAGE 的 Control Plane 口径下工作（即：引擎实现不改变控制面原则）

> 说明：独立不意味着脱离 SAGE 的控制面原则；而是意味着 **工程边界清晰、接口可承诺、可版本化发布**。sageLLM 作为 SAGE 生态的推理引擎，仍需遵循 Control Plane 的调度协议。GE 主项目** 下的默认协作方式，以及子项目（sageLLM / sageMem / s## 3. "保留文档"的位置与引用

### 3.1 sageLLM 独立仓库

> **重要**：sageLLM 已独立为 private repo（`intellistream/sageLLM`），不再作为 SAGE 子模块存在。

- **仓库地址**：`git@github.com:intellistream/sageLLM.git`（私有仓库）
- **本体文档**：`sageLLM/docs/README.md`
- **人员与任务匹配**：`sageLLM/docs/TEAM_ASSIGNMENT.md`

### 3.2 历史文档归档

- 原 SAGE 内的 sageLLM 引擎代码已迁移至独立仓库
- 历史文档如需查阅，请联系项目负责人获取仓库访问权限

> 要求：历史文档不覆盖；如需更新，请在 sageLLM 仓库内新增版本化文件（例如 `TEAM_ASSIGNMENT_2026Q1.md`）。孵化与独立** 口径，为后续分工、里程碑与资源投入提供一致标准。
>
> **原则**：
> - SAGE 是课题组的“主项目”（默认所有成员都在 SAGE 项目协作）。
> - 子项目是否独立，以“**接口是否成型且可对外承诺**”为核心判断标准。
> - 文档与决策需要可追溯：重要变更必须落到文档 + issue/PR。

---

## 1. 总览：主项目 + 孵化项目

### 1.1 两大组：SAGE 主项目 vs. sageLLM 项目

- **组别划分**：
	- **sageLLM 项目**：推理引擎方向，已独立为私有仓库（`intellistream/sageLLM`）。
	- **SAGE 主项目**：除 sageLLM 引擎外的全部包与 submodule（即当前 SAGE 仓库内的 packages 与 submodules 总体）。

- **分配优先级**：
	- **优先考虑 sageLLM 项目** 的人员/任务编排；未分配到 sageLLM 的同学默认归属 **SAGE 主项目**。

- **SAGE 主项目职责（保持不变）**：
	- 统一工程与质量标准（架构层级 L1-L6、CI、测试、发布规范）
	- 统一运行时与控制面（Control Plane）
	- 统一对外叙事与文档入口

**默认规则**：除非明确标注到 sageLLM 项目，其余成员/任务均归属 SAGE 主项目，通过 issue/PR 协作。

---

## 2. 孵化与独立的判定标准（关键口径）

我们把子项目分为两类：

1. **接口已成型，可与生态对齐** → 可以直接独立为“大项目”，仓库/发布节奏可独立。
2. **接口未完全成型** → 暂不独立；代码继续留在 SAGE 内孵化，避免过早锁死 API。

### 2.1 sageLLM：可以开始独立

**结论**：`sageLLM` 的接口必须与其他推理引擎（如 vLLM、LMDeploy 等）完全对齐，因此具备“可直接独立”的前提，可以开始从 SAGE 体系中独立成为单独的大项目。

**对齐强调**：

- 引擎能力通过统一的引擎抽象层暴露（对齐 `vLLM` / `LMDeploy` / 其他第三方引擎适配器的接口范式）
- 运行与调度必须在 SAGE 的 Control Plane 口径下工作（即：引擎实现不改变控制面原则）

> 说明：独立不意味着脱离 SAGE 的控制面原则；而是意味着 **工程边界清晰、接口可承诺、可版本化发布**。

---

### 2.2 sageMem / sageFlow：接近孵化成功，但暂留 SAGE

**结论**：`sageMem` 与 `sageFlow` 已接近孵化成功，但由于接口还未完全成型，暂不独立；代码继续留在 SAGE 项目内，优先把接口“磨成型”。

**原因**（共同点）：

- 接口尚处于快速演进阶段，过早独立会导致 API 负债与兼容成本激增
- 需要与 SAGE 其他组件（Kernel/Middleware/Gateway 等）持续联调与共同演进

**当期目标**：接口稳定后再按独立标准推进（见下文里程碑建议）。

### 2.3 全量子模块扫描与分档（独立潜力）

> 结论先行：**只有 `sageLLM` 属于“可立即独立 (P0)”；其余包/子模块暂不宜着急独立（保持在 SAGE 内继续孵化）。**

- **P0（可立即独立）**
	- `sage-llm-core` 下的 `sageLLM` 引擎：接口对齐 vLLM/LMDeploy，满足对外承诺/版本化前提。

- **P1（中期可独立，但需先磨接口）**
	- `sage-middleware` 内：`sageMem`（NeuroMem/向量记忆体系）、`sageFlow`（向量流/流式语义状态）。接口快速演进中，仍需与 Kernel/Middleware/Gateway 联调，暂留 SAGE。

- **P2（长期潜力，暂留 SAGE 主战场）**
	- L1 基础：`sage-common`、`sage-llm-core`（除 sageLLM 引擎外的控制面与客户端）
	- L2 平台：`sage-platform`
	- L3 核心：`sage-kernel`、`sage-libs`
	- L4 中间件：`sage-middleware` 其他子系统（算子/存储/TSDB/Refiner 等）
	- L5 应用与评测：`sage-apps`、`sage-benchmark`
	- L6 接口与工具：`sage-gateway`、`sage-llm-gateway`、`sage-edge`、`sage-cli`、`sage-studio`、`sage-tools`

> 说明：上述 P1/P2 也具备独立潜力，但当前不建议分仓。待接口稳定、对外叙事清晰、CI/发布闭环完善后再评估。

### 2.4 Git submodule 视角（当前仓库）

> 仅从 **git submodule** 角度再对齐一次独立潜力；**`sageLLM` 已独立为私有仓库，不再作为 SAGE 子模块存在；其余子模块暂不建议急于分仓。**

- **P0（已独立）**
	- `sageLLM` 引擎：已迁移至独立私有仓库 `intellistream/sageLLM`。

- **P1（中期可独立，先磨接口）**
	- `packages/sage-middleware/src/sage/middleware/components/sage_flow/sageFlow`
	- `packages/sage-middleware/src/sage/middleware/components/sage_mem/neuromem`
	- `packages/sage-middleware/src/sage/middleware/components/sage_db/sageDB`
	- `packages/sage-middleware/src/sage/middleware/components/sage_refiner/sageRefiner`
	- `packages/sage-middleware/src/sage/middleware/components/sage_tsdb/sageTSDB`
	- 以上均在接口/联调快速演进阶段，建议继续留在 SAGE 内孵化。

- **P2（长期潜力，暂留 SAGE 主战场）**
	- `docs-public`（文档子模块，作为主项目文档站）
	- `packages/sage-benchmark/src/sage/benchmark/benchmark_anns`
	- `packages/sage-benchmark/src/sage/benchmark/benchmark_amm`
	- `packages/sage-benchmark/src/sage/data`
	- 以上更偏基准/数据/文档，独立价值在叙事或数据治理上，但短期保持随主项目发布、避免分叉。

> 若未来接口稳定、对外叙事清晰、CI/发布闭环完善，可按 P1/P2 再评估独立节奏。

---

## 3. “保留文档”的位置与引用

### 3.1 sageLLM 本体文档（保留）

- `packages/sage-llm-core/src/sage/llm/engines/sagellm/docs/README.md`

### 3.2 国产算力方向研究工作（保留）

- `docs-public/docs_src/dev-notes/research_work/domestic-llm-engine/`
- 人员与任务匹配：`docs-public/docs_src/dev-notes/research_work/domestic-llm-engine/TEAM_ASSIGNMENT.md`

> 要求：历史文档不覆盖；如需更新，请新增版本化文件（例如 `TEAM_ASSIGNMENT_2026Q1.md`）。

---

## 4. 分工与协作机制（用于后续准备）

### 4.1 角色定义（建议口径）

- **Maintainer（维护者）**：对主线/子系统的路线、代码质量、合入结果负责。
- **Owner（模块负责人）**：对模块的设计、实现与验收标准负责（可为学生/工程师）。
- **Contributor（贡献者）**：按 issue/任务交付代码、文档、测试或 benchmark。
- **Reviewer（评审）**：审查 API 契约、架构层级约束、性能/稳定性。

### 4.2 协作边界（必须遵守）

- **严禁绕过 Control Plane**：所有 LLM 引擎相关运行与调用必须走 Control Plane。
- **层级依赖约束（L1-L6）**：不得引入向上依赖。
- **禁止隐式 fallback**：配置缺失/能力不支持必须显式失败。

### 4.3 权益与义务

#### 4.3.1 sageLLM 项目成员

| 项目 | 说明 |
|------|------|
| **额外补贴** | 硕士生 3000 元/月；博士生 5000 元/月 |
| **汇报义务** | 定期汇报项目进度（具体频率由项目负责人确定） |

#### 4.3.2 全员福利（sageLLM / SAGE 项目成员均可申请）

- 报销 GitHub Copilot Pro 订阅费用
- 其他课题组福利（按课题组规定申请）

> **说明**：具体福利政策以课题组最新通知为准。

### 4.4 人员分工（概览，详表见 sageLLM 仓库）

> 详情与后续版本请以 `sageLLM/docs/TEAM_ASSIGNMENT.md`（私有仓库）为准；下表为当前主要分工概览。
>
> **⚠️ 草稿状态**：本分工表为初步草稿，将发送给各位同学确认。如有异议或建议，请及时反馈。

#### 4.4.0 分配原则（两大组）

- **sageLLM 项目优先**：推理引擎方向，独立私有仓库（`intellistream/sageLLM`）。
- **SAGE 主项目（默认归属）**：其余全部包与 submodule。
- **每人最多出现在两处**：sageLLM 的一个课题 + SAGE 的一个 package/submodule。

---

#### 4.4.1 sageLLM 项目（推理引擎方向）

| 姓名 | sageLLM 任务 | 备注 |
|------|-------------|------|
| 程序员 A | Task0 协作 + Task1 通信层（1.1-1.5） | 全职（Q1 入职，3 年） |
| 程序员 B | Task0 协作 + Task2/Task3 调度与加速层 | 全职（Q1 入职，3 年） |
| 王明琪 | 2.1 前缀复用 | 25 届硕士 |
| 高西岭 | 2.1 前缀复用（协作） | 26 届硕士（未入学） |
| 刘沛林 | 2.2 KV 池化与分层 | 26 届硕士（未入学） |
| 陈彦博 | 2.2 KV 池化与分层（协作：KV 压缩路径） | 25 届硕士 |
| 张睿诚 | 2.3 淘汰策略 | 24 届硕士 |
| 徐天翊 | 2.5 生命周期预测 | 26 届硕士（未入学） |
| 张澹潇 | 3.2 稀疏化 | 26 届硕士（未入学） |
| 杨锦昀 | 1.4 计算通信重叠 | 24 届硕士 |
| 刘俊 | 2.4 调度 IR | 25 届博士 |
| 张森磊 | 3.3 投机解码 | 25 届硕士 |
| 李昶吾 | 3.5 CoT 加速 | 25 届博士 |

---

#### 4.4.2 SAGE 主项目（按 package/submodule 归属）

| 姓名 | SAGE 归属 package/submodule | 备注 |
|------|---------------------------|------|
| 王子澳 | `sage-middleware` → `sageFlow`（向量流） | 24 届硕士 |
| 朱鑫材 | `sage-middleware` → `sageFlow`（向量流） | 25 届硕士 |
| 陈德斌 | `sage-middleware` → `sageTSDB`（时序数据库） | 26 届硕士 |
| 高鸿儒 | `sage-libs` → `anns`（Graph-based ANNS 内存访问优化） | 20 届博士 |
| Xinyi Li | `sage-benchmark` → 大模型记忆细粒度基准（数据集/评测） | |
| Yutong Zhou | `sage-libs` → 时序敏感 RAG | |
| Yuyue Guo | `sage-libs` → 智能体工具规划 | |

> **说明**：
> - 上述同学如同时参与 sageLLM 课题，请在 4.4.1 表中补充（每人最多各出现一次）。
> - 其余未列入的成员/贡献者，默认归属 SAGE 主项目，按 issue/PR 协作。

---

> 若分工调整，请在 sageLLM 仓库的 `docs/TEAM_ASSIGNMENT.md` 下新增版本化文件，并在此处同步摘要。

---

## 5. 里程碑模板（建议）

为便于“孵化 → 独立”可执行，建议对每个子项目使用相同模板：

1. **API 冻结草案**：列出最小对外接口、兼容策略与版本号策略
2. **E2E Demo**：固定 workload + 固定指标输出（JSON）
3. **CI 最小闭环**：lint/typecheck/unit + 至少 1 条集成 smoke
4. **Release 准备**：CHANGELOG、版本号、打包/发布脚本

---

## 6. 变更记录

- 2026-01-03：建立本文件，明确“**SAGE 主项目 + 子项目孵化/独立**”口径：sageLLM 可开始独立；sageMem/sageFlow 暂留 SAGE 直至接口成型。
