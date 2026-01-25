#!/bin/bash
# Git Commit Guide for Speculative Decoding Migration

cat << 'EOF'
═══════════════════════════════════════════════════════════════════════════════
                    Speculative Decoding 架构迁移
                           Git 提交指南
═══════════════════════════════════════════════════════════════════════════════

🎯 提交类型: refactor
📦 影响范围: sage-llm-core, sage-libs, docs

═══════════════════════════════════════════════════════════════════════════════
推荐的 Git 提交命令
═══════════════════════════════════════════════════════════════════════════════

# 1. 查看变更
git status

# 2. 添加文件
git add packages/sage-llm-core/src/sage/llm/engines/vllm/speculative.py
git add packages/sage-llm-core/src/sage/llm/engines/vllm/__init__.py
git add packages/sage-llm-core/src/sage/llm/__init__.py
git add packages/sage-llm-core/tests/engines/test_speculative_strategies.py
git add packages/sage-llm-core/src/sage/llm/engines/vllm/examples/speculative_decoding_demo.py
git add docs-public/docs_src/dev-notes/l1-common/speculative-decoding-migration.md
git add docs-public/docs_src/dev-notes/l1-common/CHANGELOG-speculative-migration.md
git add docs-public/docs_src/dev-notes/l1-common/MIGRATION-REPORT-speculative.md
git add .github/copilot-instructions.md

# 3. 删除旧目录（如果还存在）
git rm -r packages/sage-libs/src/sage/libs/algorithms/speculative/

# 4. 提交变更
git commit -m "refactor(llm-core): migrate speculative decoding from L3 to L1

BREAKING CHANGE: None (internal refactor, no public API changes)

Motivation:
- Speculative decoding is an engine optimization, not a general algorithm
- Previous L3 (sage-libs) placement caused L3 -> L1 dependency violation
- Control Plane should manage engine strategies directly

Changes:
- Move DynamicLookaheadStrategy from sage-libs to sage-llm-core
- Consolidate all speculative strategies in sage.llm.engines.vllm.speculative
- Add comprehensive unit tests (14 tests, all passing)
- Update exports: sage.llm.engines.vllm and sage.llm
- Remove sage.libs.algorithms.speculative/ directory

Architecture:
Before: L3 sage-libs/algorithms/speculative/ (❌ wrong layer)
After:  L1 sage-llm-core/engines/vllm/speculative.py (✅ correct layer)

Benefits:
- ✅ Eliminate L3 -> L1 reverse dependency
- ✅ Clear responsibility: engine optimizations belong to engine layer
- ✅ Better Control Plane integration
- ✅ Support engine-specific implementations

Testing:
- Unit tests: 14/14 passed (test_speculative_strategies.py)
- Import tests: All strategies importable from sage.llm
- No external usage affected (feature was internal)

Documentation:
- Migration guide: docs-public/docs_src/dev-notes/l1-common/speculative-decoding-migration.md
- Usage examples: packages/sage-llm-core/src/sage/llm/engines/vllm/examples/speculative_decoding_demo.py
- Updated copilot-instructions.md with new import paths

Related: #1284 (Control Plane Enhancement)
"

═══════════════════════════════════════════════════════════════════════════════
或使用简化版本
═══════════════════════════════════════════════════════════════════════════════

git commit -m "refactor(llm-core): migrate speculative decoding from L3 to L1

- Move DynamicLookaheadStrategy to sage.llm.engines.vllm.speculative
- Consolidate all speculative strategies in L1 engine layer
- Add 14 unit tests (all passing)
- Remove sage.libs.algorithms.speculative/ directory
- Update documentation and import paths

Architecture fix: Engine optimizations should be in engine layer (L1),
not algorithm library (L3). Eliminates L3 -> L1 dependency violation.

No breaking changes: Feature was internal, never publicly documented.
"

═══════════════════════════════════════════════════════════════════════════════
验证提交
═══════════════════════════════════════════════════════════════════════════════

# 查看提交
git log -1 --stat

# 验证测试
sage-dev project test --coverage

# 验证代码质量
sage-dev quality --check-only

═══════════════════════════════════════════════════════════════════════════════
创建 Pull Request (可选)
═══════════════════════════════════════════════════════════════════════════════

# 创建分支
git checkout -b refactor/speculative-decoding-migration

# 推送到远程
git push origin refactor/speculative-decoding-migration

# 在 GitHub 上创建 PR，标题:
"refactor(llm-core): Migrate speculative decoding from L3 to L1"

# PR 描述模板:
"""
## 概述
将 Speculative Decoding 策略从 L3 算法层迁移到 L1 引擎层，修复架构依赖违规。

## 动机
- Speculative decoding 是引擎优化策略，不是通用算法
- 原 L3 放置导致 L3 → L1 反向依赖违规
- Control Plane 应直接管理引擎策略

## 变更
- ✅ 移动 `DynamicLookaheadStrategy` 到 `sage.llm.engines.vllm.speculative`
- ✅ 统一所有 speculative 策略在 L1 引擎层
- ✅ 添加 14 个单元测试（全部通过）
- ✅ 更新导出和文档
- ✅ 删除 `sage.libs.algorithms.speculative/`

## 测试
- [x] 单元测试: 14/14 passed
- [x] 导入测试: 所有策略可从 `sage.llm` 导入
- [x] 代码质量: `sage-dev quality` 通过
- [ ] CI/CD: 等待自动验证

## 破坏性变更
无。该功能为内部实现，从未公开文档化。

## 文档
- 迁移指南: [speculative-decoding-migration.md]
- 使用示例: [speculative_decoding_demo.py]
- 执行报告: [MIGRATION-REPORT-speculative.md]

## 审查清单
- [ ] 代码审查
- [ ] 测试验证
- [ ] 文档检查
"""

═══════════════════════════════════════════════════════════════════════════════
EOF
