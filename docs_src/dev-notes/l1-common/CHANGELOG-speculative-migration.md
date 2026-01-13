# Speculative Decoding 架构迁移记录

**日期**: 2026-01-08  
**类型**: 重构 (Refactor)  
**影响**: sage-llm-core, sage-libs

## 变更概述

将 speculative decoding 策略从 `sage-libs` (L3 算法层) 迁移到 `sage-llm-core` (L1 引擎层)，以更好地对齐其作为引擎优化策略的本质。

## 具体变更

### 移除
- ❌ `packages/sage-libs/src/sage/libs/algorithms/speculative/` - 完全删除
- ❌ `packages/sage-libs/src/sage/libs/algorithms/speculative/dynamic_lookahead.py` - 已迁移

### 新增
- ✅ `DynamicLookaheadStrategy` 添加到 `sage.llm.engines.vllm.speculative`
- ✅ 示例文件: `packages/sage-llm-core/src/sage/llm/engines/vllm/examples/speculative_decoding_demo.py`
- ✅ 迁移文档: `docs-public/docs_src/dev-notes/l1-common/speculative-decoding-migration.md`

### 修改
- ✅ `sage.llm.engines.vllm.speculative` - 增强文档和实现
- ✅ `sage.llm.engines.vllm.__init__` - 导出新策略
- ✅ `sage.llm.__init__` - 顶层导出新策略

## 导入路径变更

### Before (Deprecated)
```python
from sage.libs.algorithms.speculative import DynamicLookaheadStrategy  # ❌
```

### After (Recommended)
```python
from sage.llm import DynamicLookaheadStrategy  # ✅
```

## 破坏性变更

**是否有破坏性变更**: 否

**原因**: 
- 旧的 `sage.libs.algorithms.speculative` 路径从未被使用或文档化
- `DynamicLookaheadStrategy` 是新实现的研究级功能
- 所有现有的 speculative 策略（`DraftModelStrategy`, `NgramStrategy`）仍在原位置

## 测试验证

```bash
# 验证导入
python -c "from sage.llm import DynamicLookaheadStrategy; print('✅ OK')"

# 验证功能
python packages/sage-llm-core/src/sage/llm/engines/vllm/examples/speculative_decoding_demo.py
```

## 架构优势

1. **职责明确**: 引擎优化归属引擎层，不再混淆为算法库
2. **依赖合理**: 消除 L3 → L1 的反向依赖
3. **管理方便**: Control Plane 可直接管理引擎策略
4. **扩展性强**: 支持不同引擎的特定实现

## 相关 Issue/PR

- Issue: #1284 (Control Plane Enhancement)
- 相关文档: `docs-public/docs_src/dev-notes/l1-common/speculative-decoding-migration.md`

## 审查人员

- [ ] @intellistream/sage-core
- [ ] @intellistream/sage-llm

---

## 验证清单

- [x] 代码迁移完成
- [x] 导入测试通过
- [x] 功能测试通过
- [x] 文档更新完成
- [x] 示例代码创建
- [x] 单元测试更新（14 个测试全部通过）
- [x] Copilot Instructions 更新
- [ ] 集成测试验证（需要实际 vLLM 环境）
- [ ] CI/CD 验证（等待 PR 合并）
