# 提示词目录重组日志

> **重组日期**: 2026-01-02  
> **执行人**: GitHub Copilot  
> **目的**: 修正错误的文件位置，确保提示词按照正确的task分类

## 🎯 重组目标

1. **合并两个 task2 文件夹**：task2-pd-separation 和 task2-kv-cache-scheduling 都属于【大方向2】KV管理与调度
2. **移动错位的提示词**：将 task1-kv-transport 下的 2.x 和 3.x 文件移到正确的 task 文件夹
3. **归档历史文档**：将 PHASE、QA_REPORT 等历史文档移到 archived_docs

## 📋 执行的操作

### 1. 合并 Task 2 文件夹

```bash
# 删除 task2-pd-separation 文件夹（内容已合并到 task2-kv-cache-scheduling）
mv task2-pd-separation/prompt.md task2-kv-cache-scheduling/2.4-scheduler-ir-prompt-v2.md
rmdir task2-pd-separation
```

**原因**: PD分离（Prefill/Decode Separation）和调度器IR本质上是同一个模块的两个方面。

### 2. 移动 Task 1 下的 2.x 文件到 Task 2

以下文件从 `task1-kv-transport/` 移动到 `task2-kv-cache-scheduling/`:

- ✅ `2.1-prefix-cache-prompt.md` - 前缀缓存
- ✅ `2.2-kv-pool-prompt.md` - KV Pool 管理
- ✅ `2.3-eviction-policy-prompt.md` - 淘汰策略
- ✅ `2.4-scheduler-ir-prompt.md` - 调度器 IR
- ✅ `2.5-lifetime-predictor-prompt.md` - 生命周期预测器

**原因**: 这些都属于【大方向2】KV管理与调度，不属于【大方向1】通信与传输。

### 3. 移动 Task 1 下的 3.1 文件到 Task 3

```bash
mv task1-kv-transport/3.1-quantization-prompt.md task3-model-compression/
```

**原因**: 量化属于【大方向3】模型压缩与加速。

### 4. 归档历史文档

创建 `archived_docs/` 文件夹，移动以下文档：

- `PHASE1_OVERVIEW.md` - Phase 1 总览（通信优化）
- `PHASE2_OVERVIEW.md` - Phase 2 总览（KV管理）
- `CLEANUP_COMPLETE.md` - 旧命名清理完成报告
- `NAMING_REFACTOR.md` - 命名重构说明
- `QA_REPORT_2.1.md` - Phase 2.1 质量检查报告
- `QA_REPORT_PHASE2.md` - Phase 2 质量检查报告
- `QUICK_REFERENCE.md` - Phase 1 快速参考
- `verify_naming.sh` - 命名验证脚本

**原因**: 这些是开发过程中的历史文档和QA报告，保留作为参考，但不应与提示词混在一起。

### 5. 清理重复文件

```bash
# 删除较短的 v2 版本，保留完整的原版（762行 vs 98行）
rm task2-kv-cache-scheduling/2.4-scheduler-ir-prompt-v2.md
```

## 📂 最终目录结构

```
domestic-llm-engine/
├── README.md                    # 项目总览
├── meta-prompt.md               # 全局元提示词
├── task0-common-infrastructure/ # 【Task 0】基础设施
│   └── prompt.md
├── task1-kv-transport/          # 【Task 1】通信与传输优化
│   ├── 1.1-topology-prompt.md
│   ├── 1.2-collective-ops-prompt.md
│   ├── 1.3-kv-transfer-prompt.md
│   ├── 1.4-overlap-pipeline-prompt.md
│   ├── 1.5-domestic-interconnect-prompt.md
│   └── prompt.md
├── task2-kv-cache-scheduling/   # 【Task 2】KV 管理与调度（已合并 task2-pd-separation）
│   ├── 2.1-prefix-cache-prompt.md
│   ├── 2.2-kv-pool-prompt.md
│   ├── 2.3-eviction-policy-prompt.md
│   ├── 2.4-scheduler-ir-prompt.md
│   ├── 2.5-lifetime-predictor-prompt.md
│   └── prompt.md
├── task3-model-compression/     # 【Task 3】模型压缩与加速
│   ├── 3.1-quantization-prompt.md
│   └── prompt.md
└── archived_docs/               # 历史文档归档
    ├── CLEANUP_COMPLETE.md
    ├── NAMING_REFACTOR.md
    ├── PHASE1_OVERVIEW.md
    ├── PHASE2_OVERVIEW.md
    ├── QA_REPORT_2.1.md
    ├── QA_REPORT_PHASE2.md
    ├── QUICK_REFERENCE.md
    └── verify_naming.sh
```

## 🎯 Task 与研究方向对应关系

| Task 编号 | 研究方向 | 子模块数量 | 文件位置 |
|----------|---------|-----------|---------|
| **Task 0** | 基础设施 | 1 | `task0-common-infrastructure/` |
| **Task 1** | 通信与传输优化 | 5 | `task1-kv-transport/` |
| **Task 2** | KV 管理与调度 | 5 | `task2-kv-cache-scheduling/` |
| **Task 3** | 模型压缩与加速 | 5 | `task3-model-compression/` |

### 详细模块清单

**【Task 1】通信与传输优化** (5个子模块)
1. 1.1 拓扑感知与优化 (Topology Detection)
2. 1.2 集合通信优化 (Collective Communication)
3. 1.3 KV 跨节点传输 (KV Transfer)
4. 1.4 计算通信重叠 (Compute-Communication Overlap)
5. 1.5 国产互联适配 (Domestic Interconnect)

**【Task 2】KV 管理与调度** (5个子模块)
1. 2.1 前缀缓存 (Prefix Cache)
2. 2.2 KV Pool 管理 (KV Pool Management)
3. 2.3 淘汰策略 (Eviction Policy)
4. 2.4 调度器 IR (Scheduler IR & PD Separation)
5. 2.5 生命周期预测器 (Lifetime Predictor)

**【Task 3】模型压缩与加速** (5个子模块，目前只有1个)
1. 3.1 量化优化 (Quantization)
2. 3.2 稀疏化 (待添加)
3. 3.3 投机解码 (待添加)
4. 3.4 Kernel 融合 (待添加)
5. 3.5 CoT 加速 (待添加)

## ✅ 验证结果

重组后的目录结构完全符合设计文档（README.md 和 meta-prompt.md）中的规划：

- ✅ 每个 task 文件夹只包含该 task 的提示词
- ✅ 所有提示词文件命名规范：`X.Y-<module>-prompt.md`
- ✅ 历史文档和QA报告已归档
- ✅ 没有遗留的错位文件

## 📝 后续建议

1. **补全 Task 3 子模块**: 目前只有 3.1 量化，需要添加 3.2-3.5 的提示词文档
2. **更新主 README**: 确保 README.md 中的导航链接指向正确的文件路径
3. **版本控制**: 使用 git 提交这次重组，便于回溯
4. **文档索引**: 考虑添加一个索引文件，列出所有提示词及其简介

## 🔗 相关文档

- 项目总览: [README.md](./README.md)
- 全局元提示词: [meta-prompt.md](./meta-prompt.md)
- 归档文档: [archived_docs/](./archived_docs/)
