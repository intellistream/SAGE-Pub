# PyPI Publishing Migration to sage-pypi-publisher

## 概述

PyPI 发布功能已从 SAGE 主仓库迁移到独立的 [sage-pypi-publisher](https://github.com/intellistream/sage-pypi-publisher) 工具仓库。

## 迁移原因

1. **关注点分离**: PyPI 发布是独立的运维任务，不应与主开发工作流混合
2. **简化依赖**: 避免在主仓库引入构建/发布相关依赖
3. **更好的版本控制**: 独立管理发布工具的版本和更新
4. **团队协作**: 可以独立授权发布工具的访问权限

## 迁移内容

### 移除的功能

从 SAGE 仓库中移除：
- ❌ `sage-dev package pypi build` 命令
- ❌ `sage-dev package pypi upload` 命令
- ❌ `BytecodeCompiler` 相关发布逻辑
- ❌ `packages/sage-tools/.../pypi.py` 模块

### 新增功能

在 `sage-pypi-publisher` 仓库中添加：
- ✅ 独立的 `publish.sh` 脚本
- ✅ 自动版本递增 (patch/minor/major)
- ✅ TestPyPI 和 PyPI 支持
- ✅ 智能包检测和批量发布
- ✅ Git hooks 集成支持

## 使用方法

### 手动发布

```bash
# 1. Clone publisher tool (一次性操作)
git clone https://github.com/intellistream/sage-pypi-publisher.git ~/sage-pypi-publisher

# 2. 发布包
cd ~/sage-pypi-publisher
./publish.sh sage-common --auto-bump patch  # 版本递增 0.0.1
./publish.sh sage-libs --auto-bump minor    # 版本递增 0.1.0
./publish.sh sage-llm-core --auto-bump major  # 版本递增 1.0.0
```

### 自动发布 (Git Hooks)

#### 安装

```bash
# 复制 hook 模板
cp tools/hooks/post-commit.sample .git/hooks/post-commit
chmod +x .git/hooks/post-commit

# 配置 hook (编辑文件)
vim .git/hooks/post-commit
```

#### 配置示例

**开发环境** (推荐):
```bash
AUTO_PUBLISH_ENABLED=false       # 手动控制
REQUIRE_CONFIRMATION=true        # 始终确认
TEST_PYPI_FIRST=true            # 先测试
```

**生产环境** (CI/CD):
```bash
AUTO_PUBLISH_ENABLED=true        # 自动发布
AUTO_PUBLISH_BRANCH="main"       # 仅 main 分支
REQUIRE_CONFIRMATION=false       # 无需确认
VERSION_BUMP_TYPE="patch"        # 补丁版本
```

#### 使用流程

```bash
# 1. 修改代码
vim packages/sage-common/src/sage/common/...

# 2. 提交（hook 自动触发）
git add packages/sage-common/...
git commit -m "feat(common): add new feature"

# Hook 自动检测并发布 sage-common
📦 Affected packages: sage-common
🚀 Publishing to PyPI...
✅ Successfully published sage-common v0.2.1
```

## 文档更新

### 更新的文件

1. **主配置**:
   - `.github/copilot-instructions.md` - VSCode Copilot 指令
   
2. **新增文件**:
   - `tools/hooks/post-commit.sample` - Git hook 模板
   - `tools/hooks/README.md` - Hooks 使用指南
   - `tools/scripts/update_pypi_docs.sh` - 文档更新脚本
   - `docs-public/docs_src/dev-notes/cross-layer/pypi-publisher-migration.md` - 本文档

3. **添加弃用通知** (所有旧文档):
   - `packages/sage-libs/docs/amms/BUILD_PUBLISH.md`
   - `packages/sage-libs/docs/amms/PYPI_PUBLISH_GUIDE.md`
   - `tools/docs/scripts/LIBAMM_MIGRATION_QUICKREF.md`
   - `docs-public/docs_src/developers/ci-cd.md`
   - `docs-public/docs_src/developers/commands.md`
   - `docs-public/docs_src/dev-notes/l6-cli/COMMAND_CHEATSHEET.md`

### 弃用通知内容

所有旧文档顶部添加：

> **⚠️  DEPRECATED**: The `sage-dev package pypi` command has been removed.
> Please use the standalone [sage-pypi-publisher](https://github.com/intellistream/sage-pypi-publisher) tool instead.

## 与本次 CI 修复的关系

本次文档更新是 CI 修复的后续工作：

1. **CI 修复** (已完成):
   - 移除过时的 C++ 扩展验证
   - 添加 PyPI 包验证
   - 更新组件导入逻辑（优雅降级）

2. **文档更新** (本次):
   - 更新 PyPI 发布指南
   - 添加 Git hooks 自动化
   - 统一所有文档引用

## 发布的包

SAGE 的 PyPI 包：

| 内部包名 | PyPI 包名 | 发布频率 |
|---------|----------|---------|
| `sage-common` | `isage-common` | 按需 |
| `sage-libs` | `isage-libs` | 按需 |
| `sage-llm-core` | `isage-llm-core` | 按需 |
| `sage-llm-gateway` | `isage-llm-gateway` | 按需 |
| `sage-middleware` | `isage-middleware` | 较少 |

## 受影响的包（本次 CI 修复）

本次修复影响的组件（已更新为优雅降级）：
- ✅ `sage-flow` → `sage.middleware.components.sage_flow`
- ✅ `sage-db` → `sage.middleware.components.sage_db`
- ✅ `sage-tsdb` → `sage.middleware.components.sage_tsdb`
- ✅ `sage-refiner` → `sage.middleware.components.sage_refiner`

这些组件的变更可能会触发相关包的发布。

## 发布清单

修复完成后，建议发布以下包：

```bash
cd ~/sage-pypi-publisher

# 受影响的包
./publish.sh sage-middleware --auto-bump patch  # 组件导入逻辑更新
./publish.sh sage-common --auto-bump patch      # 如有相关更新
```

## 最佳实践

1. **本地测试先行**:
   ```bash
   # 先发布到 TestPyPI
   ./publish.sh <package> --test-pypi --auto-bump patch
   
   # 验证安装
   pip install -i https://test.pypi.org/simple/ isage-<package>
   
   # 确认后发布到生产
   ./publish.sh <package> --auto-bump patch
   ```

2. **版本号规范**:
   - `patch` (0.0.1): Bug 修复、文档更新
   - `minor` (0.1.0): 新功能、向后兼容
   - `major` (1.0.0): 破坏性变更

3. **提交信息规范**:
   ```bash
   git commit -m "feat(middleware): support graceful degradation for independent packages"
   git commit -m "fix(common): resolve import errors in CI"
   git commit -m "docs: update PyPI publishing to use sage-pypi-publisher"
   ```

## 故障排查

**Hook 不工作？**
- 检查权限: `ls -la .git/hooks/post-commit`
- 检查配置: `AUTO_PUBLISH_ENABLED=true`
- 检查分支: 确保在配置的分支上

**Publisher 找不到？**
- 克隆: `git clone https://github.com/intellistream/sage-pypi-publisher.git ~/sage-pypi-publisher`
- 更新路径: 编辑 hook 中的 `PUBLISHER_PATH`

**发布失败？**
- 检查凭据: `~/.pypirc`
- 检查版本: 包的 `_version.py`
- 查看日志: Publisher 会输出详细错误

## 参考链接

- **Publisher 仓库**: https://github.com/intellistream/sage-pypi-publisher
- **CI 修复文档**: `docs-public/docs_src/dev-notes/cross-layer/ci-cpp-extensions-removal.md`
- **Copilot 指令**: `.github/copilot-instructions.md`
- **Hooks 指南**: `tools/hooks/README.md`
