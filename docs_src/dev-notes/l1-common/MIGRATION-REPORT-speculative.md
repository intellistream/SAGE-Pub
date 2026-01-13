# Speculative Decoding 架构迁移 - 执行报告

**执行日期**: 2026-01-08  
**执行状态**: ✅ 完成  
**影响范围**: sage-llm-core (L1), sage-libs (L3)

---

## 执行摘要

成功将 Speculative Decoding 策略从 L3 算法层迁移到 L1 引擎层，消除了架构违规依赖，提升了代码组织的合理性和可维护性。

## 执行步骤

### 1. ✅ 代码迁移
- **移除**: `packages/sage-libs/src/sage/libs/algorithms/speculative/` 目录
- **增强**: `packages/sage-llm-core/src/sage/llm/engines/vllm/speculative.py`
  - 添加 `DynamicLookaheadStrategy` 类
  - 完善文档和类型注解
  - 保留原有 `DraftModelStrategy` 和 `NgramStrategy`

### 2. ✅ 导出配置
- 更新 `sage.llm.engines.vllm.__init__` 导出
- 更新 `sage.llm.__init__` 顶层导出
- 用户可直接使用 `from sage.llm import DynamicLookaheadStrategy`

### 3. ✅ 单元测试
创建全面的测试套件: `packages/sage-llm-core/tests/engines/test_speculative_strategies.py`

**测试覆盖**:
- ✅ 抽象接口测试（不可实例化）
- ✅ DraftModelStrategy 初始化和配置修改
- ✅ NgramStrategy 初始化、配置修改、参数保留
- ✅ DynamicLookaheadStrategy 计算逻辑、参数范围
- ✅ 策略对比和接口一致性

**测试结果**: 14/14 passed (3.00s)

```bash
pytest packages/sage-llm-core/tests/engines/test_speculative_strategies.py -v
# ✅ All 14 tests passed
```

### 4. ✅ 文档创建

#### 迁移指南
- `docs-public/docs_src/dev-notes/l1-common/speculative-decoding-migration.md`
- 详细说明架构问题、迁移步骤、使用示例

#### 使用示例
- `packages/sage-llm-core/src/sage/llm/engines/vllm/examples/speculative_decoding_demo.py`
- 展示 3 种策略的使用方法
- 提供 Control Plane 集成示例

#### CHANGELOG
- `docs-public/docs_src/dev-notes/l1-common/CHANGELOG-speculative-migration.md`
- 记录所有变更和破坏性分析

### 5. ✅ Copilot Instructions 更新
- 更新 `.github/copilot-instructions.md`
- 在 "Inference Components Map" 中添加 Speculative Decoding 说明
- 标记旧路径为已移除

---

## 架构改进

### Before (有问题)
```
L3: sage-libs/algorithms/speculative/
    └── dynamic_lookahead.py
        └── import from sage.llm.speculative  # ❌ L3 → L1 反向依赖

L1: sage-llm-core/engines/vllm/
    └── speculative.py (DraftModelStrategy, NgramStrategy)
```

### After (正确)
```
L1: sage-llm-core/engines/vllm/
    └── speculative.py
        ├── SpeculativeStrategy (Abstract)
        ├── DraftModelStrategy
        ├── NgramStrategy
        └── DynamicLookaheadStrategy  # ✅ 所有策略统一在引擎层
```

### 优势
1. **职责明确**: 引擎优化属于引擎层，不再混淆为算法库
2. **依赖合理**: 消除 L3 → L1 反向依赖
3. **管理方便**: Control Plane 可直接管理和配置
4. **扩展性强**: 支持不同引擎的特定实现

---

## 导入路径变更

### ❌ Deprecated (Never Released)
```python
from sage.libs.algorithms.speculative import DynamicLookaheadStrategy
```

### ✅ Recommended
```python
from sage.llm import DynamicLookaheadStrategy

# 或显式导入
from sage.llm.engines.vllm.speculative import DynamicLookaheadStrategy
```

---

## 破坏性变更分析

**结论**: ✅ **无破坏性变更**

**原因**:
1. `sage.libs.algorithms.speculative` 路径从未被公开文档化
2. `DynamicLookaheadStrategy` 是新实现的研究功能，未在外部使用
3. 原有的 `DraftModelStrategy` 和 `NgramStrategy` 保持在原位置
4. 所有现有代码无需修改

---

## 测试验证

### 单元测试
```bash
cd /home/shuhao/SAGE
python -m pytest packages/sage-llm-core/tests/engines/test_speculative_strategies.py -v
# ✅ 14 passed in 3.00s
```

### 导入测试
```bash
python -c "from sage.llm import DynamicLookaheadStrategy; print('✅ OK')"
# ✅ OK
```

### 功能演示
```bash
python packages/sage-llm-core/src/sage/llm/engines/vllm/examples/speculative_decoding_demo.py
# ✅ All strategies initialized successfully
```

---

## 文件清单

### 新增文件
- ✅ `packages/sage-llm-core/tests/engines/test_speculative_strategies.py`
- ✅ `packages/sage-llm-core/src/sage/llm/engines/vllm/examples/speculative_decoding_demo.py`
- ✅ `docs-public/docs_src/dev-notes/l1-common/speculative-decoding-migration.md`
- ✅ `docs-public/docs_src/dev-notes/l1-common/CHANGELOG-speculative-migration.md`
- ✅ `docs-public/docs_src/dev-notes/l1-common/MIGRATION-REPORT-speculative.md` (本文件)

### 修改文件
- ✅ `packages/sage-llm-core/src/sage/llm/engines/vllm/speculative.py`
- ✅ `packages/sage-llm-core/src/sage/llm/engines/vllm/__init__.py`
- ✅ `packages/sage-llm-core/src/sage/llm/__init__.py`
- ✅ `.github/copilot-instructions.md`

### 删除文件
- ✅ `packages/sage-libs/src/sage/libs/algorithms/speculative/` (整个目录)

---

## 后续工作

### 集成测试（可选）
如需验证与实际 vLLM 引擎的集成，可运行：
```bash
# 启动 Control Plane
sage gateway start

# 启动带 speculative decoding 的引擎
sage llm engine start Qwen/Qwen2.5-7B-Instruct \
    --engine-kind llm \
    --speculative-strategy ngram

# 测试推理
curl -X POST http://localhost:8889/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-7B-Instruct",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### CI/CD 验证
- PR 合并后，GitHub Actions 会自动运行所有测试
- 检查 `build-test.yml` 工作流是否通过

### 文档发布
- 迁移文档将随 docs-public 一起发布到文档站点
- 用户可通过官方文档了解新的导入路径

---

## 审查建议

### Code Review Checklist
- [ ] 检查导入路径是否正确更新
- [ ] 验证单元测试覆盖率
- [ ] 确认文档描述准确
- [ ] 检查是否有遗漏的引用

### 测试建议
- [ ] 在干净环境中测试安装
- [ ] 验证 `sage-dev project test` 通过
- [ ] 运行 `sage-dev quality --check-only` 检查代码质量

---

## 总结

✅ **迁移成功完成！**

本次迁移不仅修复了架构违规问题，还建立了更清晰的代码组织结构。Speculative Decoding 现在正确归属于引擎层，方便未来扩展和维护。

**关键成果**:
- ✅ 消除 L3 → L1 反向依赖
- ✅ 14 个单元测试全部通过
- ✅ 完善的文档和示例
- ✅ 无破坏性变更
- ✅ Control Plane 就绪

**影响**: 仅限内部重构，对用户透明（新功能未对外发布）

---

**执行人**: GitHub Copilot  
**审查**: 待审核  
**状态**: ✅ 可合并
