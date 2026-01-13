# Examples 测试策略

本文档说明 SAGE 项目中 examples 的测试策略和最佳实践。

## 📊 当前状态

- **总 Examples**: 75 个
- **已支持测试模式**: 16 个 (21%)
- **待添加测试模式**: 59 个 (79%)

## 🎯 测试模式设计

Examples 应支持**测试模式**（Test Mode），在 CI 环境中快速验证代码结构和配置，而不实际执行耗时操作或调用外部 API。

### 测试模式特点

- ✅ 验证配置文件加载
- ✅ 验证模块导入
- ✅ 验证依赖可用性
- ❌ 不调用真实 LLM API
- ❌ 不进行实际计算
- ⚡ 快速完成（< 30 秒）

### 环境变量

```bash
# 启用测试模式
export SAGE_TEST_MODE=true
# 或
export SAGE_EXAMPLES_MODE=test

# 运行 example
python packages/sage-libs/examples/agents/basic_agent.py
```

## 📝 编写支持测试模式的 Example

### 模板代码

```python
#!/usr/bin/env python3
"""
example_name.py

Example description.
"""

import os
import sys


def is_test_mode() -> bool:
    """Check if running in test mode."""
    return (
        os.getenv("SAGE_TEST_MODE") == "true"
        or os.getenv("SAGE_EXAMPLES_MODE") == "test"
    )


def main():
    """Main function."""
    # 测试模式逻辑
    if is_test_mode():
        print("🧪 Test mode: Validating configuration and imports...")
        
        # 1. 验证配置加载
        try:
            config = load_config("config.yaml")
            print("✅ Test mode: Configuration loaded")
        except Exception as e:
            print(f"❌ Test mode: Config load failed: {e}")
            raise
        
        # 2. 验证模块导入
        try:
            from sage.libs import SomeModule
            print("✅ Test mode: Modules imported")
        except ImportError as e:
            print(f"❌ Test mode: Import failed: {e}")
            raise
        
        # 3. 验证依赖
        try:
            # Check dependencies without actually running them
            print("✅ Test mode: Dependencies available")
        except Exception as e:
            print(f"❌ Test mode: Dependency check failed: {e}")
            raise
        
        print("✅ Test mode: Validation passed")
        return
    
    # 正常执行逻辑
    print("🚀 Running example...")
    # ... your implementation ...


if __name__ == "__main__":
    # 测试模式包装
    if is_test_mode():
        try:
            main()
            print("\n✅ Test passed: Example structure validated")
        except Exception as e:
            print(f"\n❌ Test failed: {e}")
            sys.exit(1)
    else:
        main()
```

### 关键点

1. **配置加载验证**：确保配置文件存在且格式正确
2. **模块导入验证**：确保所有依赖模块可导入
3. **快速退出**：测试模式应在 1-2 秒内完成
4. **清晰输出**：使用 emoji 和清晰的消息

## 🔧 添加测试模式支持

### 使用辅助脚本

```bash
# 1. 分析所有 examples
python tools/scripts/add_test_mode_to_examples.py

# 2. 查看特定文件的建议
python tools/scripts/add_test_mode_to_examples.py --file packages/sage-libs/examples/some_example.py

# 3. 查看模板代码
python tools/scripts/add_test_mode_to_examples.py --template
```

### 手动添加步骤

1. **添加测试模式检测函数**
   ```python
   def is_test_mode() -> bool:
       return (
           os.getenv("SAGE_TEST_MODE") == "true"
           or os.getenv("SAGE_EXAMPLES_MODE") == "test"
       )
   ```

2. **修改 main() 函数**
   ```python
   def main():
       if is_test_mode():
           print("🧪 Test mode: ...")
           # 验证逻辑
           return
       
       # 正常逻辑
       ...
   ```

3. **更新 if __name__ == "__main__" 块**
   ```python
   if __name__ == "__main__":
       if is_test_mode():
           try:
               main()
               print("\n✅ Test passed")
           except Exception as e:
               print(f"\n❌ Test failed: {e}")
               sys.exit(1)
       else:
           main()
   ```

4. **测试**
   ```bash
   SAGE_TEST_MODE=true python your_example.py
   ```

## 🧪 CI/CD 集成

### Examples 测试 Workflow

位置: `.github/workflows/ci-examples-test.yml`

**特点**:
- 自动发现所有支持测试模式的 examples
- 并行测试，快速完成（< 15 分钟）
- 测试失败时阻断 PR
- 上传测试日志

**触发条件**:
- Push 到 main/main-dev
- PR 到 main/main-dev
- `packages/*/examples/**` 文件变更

### 本地测试

```bash
# 测试单个 example
SAGE_TEST_MODE=true python packages/sage-libs/examples/agents/basic_agent.py

# 测试所有支持测试模式的 examples
for file in $(grep -r "SAGE_TEST_MODE" packages/*/examples --include="*.py" -l); do
    echo "Testing: $file"
    SAGE_TEST_MODE=true python "$file" || echo "Failed: $file"
done
```

## 📊 优先级指南

### 高优先级（Easy - 42 个）

简单的 examples，只需要基本的配置和导入验证：

- `packages/sage-libs/examples/agent_sft_demo.py`
- `packages/sage-libs/examples/amms_example.py`
- `packages/sage-middleware/examples/hello_service_world.py`
- 等...

**特点**:
- ✅ 已有 main 块
- ✅ 无复杂依赖
- ✅ 可快速添加

### 中优先级（Medium - 15 个）

需要 API key 处理的 examples：

- `packages/sage-libs/examples/llm/pipeline_builder_llm_demo.py`
- `packages/sage-libs/examples/rag/usage_1_direct_library.py`
- 等...

**特点**:
- ⚠️  使用 LLM API
- ⚠️  需要 mock API 或跳过 API 调用
- 💡 需要仔细设计测试逻辑

### 低优先级（Hard - 2 个）

需要重构的 examples：

- `packages/sage-libs/examples/agents/arxiv_search_tool.py`
- `packages/sage-kernel/examples/advanced/pipeline_as_service/pipeline_bridge.py`

**特点**:
- ❌ 无 main 块
- ❌ 代码结构需要调整
- 🔧 需要较大改动

## 📈 路线图

### Phase 1: 基础覆盖（当前）

- ✅ 创建 examples 测试 workflow
- ✅ 创建辅助工具和文档
- 🎯 目标: 50% 覆盖率（38/75）

### Phase 2: 扩展覆盖

- 📝 为所有 Easy 类别添加测试模式（42 个）
- 📝 为部分 Medium 类别添加测试模式（5-10 个）
- 🎯 目标: 70% 覆盖率（53/75）

### Phase 3: 完整覆盖

- 📝 处理所有 Medium 类别
- 🔧 重构 Hard 类别
- 🧹 清理不再维护的 examples
- 🎯 目标: 90%+ 覆盖率

## 🔍 常见问题

### Q: 为什么不直接在测试中运行真实的 examples？

**A**: 真实运行需要：
- LLM API keys（成本问题）
- 长时间执行（CI 超时）
- 外部服务依赖（可靠性问题）

测试模式可以快速验证代码结构和配置，发现大部分问题。

### Q: 测试模式应该验证什么？

**A**: 主要验证：
1. 配置文件格式正确
2. 所有依赖模块可导入
3. 数据文件存在
4. 基本的代码逻辑不会崩溃

### Q: 如何处理需要 API key 的 examples？

**A**: 在测试模式中：
1. 跳过实际 API 调用
2. 只验证 API key 配置格式
3. Mock 关键组件
4. 使用测试数据

### Q: Examples 应该放在哪里？

**A**: 
- ✅ `packages/<package>/examples/` - 包级别的 examples
- ✅ Examples 可以有自己的 README.md
- ❌ 不要放在 `src/` 目录下

## 📚 参考

- **CI Workflow**: `.github/workflows/ci-examples-test.yml`
- **辅助脚本**: `tools/scripts/add_test_mode_to_examples.py`
- **已有示例**:
  - `packages/sage-libs/examples/agents/basic_agent.py` - 完整的测试模式实现
  - `packages/sage-common/examples/unified_inference_client_example.py` - API 处理示例
  - `packages/sage-llm-core/examples/vllm_control_plane_tutorial.py` - 配置验证示例

## 🤝 贡献

添加新 example 时，**必须**支持测试模式：

1. 使用模板代码
2. 验证配置和导入
3. 本地测试: `SAGE_TEST_MODE=true python your_example.py`
4. 确保 CI 通过

**不支持测试模式的 examples 将不会被接受合并。**
