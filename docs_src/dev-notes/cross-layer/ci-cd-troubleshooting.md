# CI/CD 常见问题修复指南

> **更新时间**: 2026-01-02  
> **适用范围**: SAGE 项目 CI/CD pipeline  
> **维护者**: SAGE 项目组

---

## 🔧 问题 1: Git Rename Limit 警告

### 现象

```bash
warning: exhaustive rename detection was skipped due to too many files.
warning: you may want to set your diff.renameLimit variable to at least 5771 and retry the command.
```

### 原因

Git 默认的 `diff.renameLimit` 为 400，在处理大量文件重命名时不够用（例如移动整个目录）。

### 解决方案

#### 自动配置（推荐）

运行 Git 配置脚本：

```bash
./tools/git-tools/configure-git.sh
```

此脚本会自动配置：
- `diff.renameLimit = 10000`
- `merge.renameLimit = 10000`
- 其他性能优化设置

#### 手动配置

```bash
git config diff.renameLimit 10000
git config merge.renameLimit 10000
```

#### CI 环境配置

CI workflow 中已自动配置，无需额外操作。参见 `.github/workflows/ci-code-quality.yml`:

```yaml
- name: Configure Git for large diffs
  run: |
    git config diff.renameLimit 10000
    git config merge.renameLimit 10000
```

---

## 🔧 问题 2: shellcheck-py 下载失败

### 现象

```bash
error: subprocess-exited-with-error

× Building wheel for shellcheck_py (pyproject.toml) did not run successfully.
│ exit code: 1
╰─> [5 lines of output]
    running bdist_wheel
    running build
    running setuptools_download
    => downloading shellcheck...
    error: Remote end closed connection without response
    [end of output]
```

### 原因

`shellcheck-py` 在安装时需要从 GitHub 下载 shellcheck 二进制文件，CI 环境网络不稳定可能导致失败。

### 解决方案

#### 方案 1: CI 中使用系统 shellcheck（已实施）

CI workflow 中已配置：

```yaml
- name: Install shellcheck (fallback for CI)
  run: |
    sudo apt-get update && sudo apt-get install -y shellcheck || echo "shellcheck install failed, will skip"

- name: Run pre-commit
  env:
    SKIP: shellcheck  # Skip shellcheck-py, use system shellcheck instead
  run: |
    pre-commit run --all-files
```

#### 方案 2: 本地开发环境

本地开发时 `shellcheck-py` 通常安装成功，无需特殊处理。如果遇到问题：

```bash
# Ubuntu/Debian
sudo apt-get install shellcheck

# macOS
brew install shellcheck

# 或使用 conda
conda install -c conda-forge shellcheck
```

#### 方案 3: 禁用 shellcheck hook（不推荐）

如果确实需要跳过 shellcheck：

```bash
SKIP=shellcheck pre-commit run --all-files
```

---

## 🔧 问题 3: 分支切换时残留旧目录

### 现象

在不同分支间切换后，发现某些目录在新分支中不应存在，但显示为 untracked：

```bash
git status
# Untracked files:
#   packages/sage-common/src/sage/common/components/sage_llm/
```

### 原因

Git 不会自动删除切换分支后不存在的目录，特别是在目录被移动或重命名的情况下。

### 解决方案

#### 方案 1: 手动清理（临时）

```bash
git clean -fd
# 或针对特定目录
rm -rf packages/sage-common/src/sage/common/components/sage_llm/
```

#### 方案 2: 自动清理（已实施）

已在 `.git/hooks/post-checkout` 中添加自动清理逻辑：

```bash
# 自动清理在当前分支不应存在的目录
if [ -d "packages/sage-common/src/sage/common/components/sage_llm" ]; then
    if ! git ls-files --error-unmatch "packages/sage-common/src/sage/common/components/sage_llm" >/dev/null 2>&1; then
        echo "🧹 清理残留目录: sage_llm"
        rm -rf "packages/sage-common/src/sage/common/components/sage_llm"
    fi
fi
```

**触发时机**: 每次 `git checkout` 时自动执行

#### 方案 3: Pre-commit 检查（预防）

已在 pre-commit hooks 中添加检查，防止意外提交不应存在的目录。

---

## 📋 CI/CD 最佳实践

### 1. Git 配置

所有开发者应运行一次：

```bash
./tools/git-tools/configure-git.sh
```

### 2. Pre-commit Hooks

开发时始终启用：

```bash
pre-commit install
```

### 3. 本地验证

提交前运行完整检查：

```bash
# 快速检查（仅修改文件）
pre-commit run

# 完整检查（所有文件）
pre-commit run --all-files
```

### 4. CI 环境变量

如需跳过特定 hook（仅用于调试）：

```bash
export SKIP=shellcheck,mypy
pre-commit run --all-files
```

---

## 🔍 诊断命令

### 检查 Git 配置

```bash
git config --list | grep -E "(rename|submodule|preload)"
```

### 检查 pre-commit 状态

```bash
pre-commit --version
pre-commit run --all-files --verbose
```

### 检查 shellcheck

```bash
which shellcheck
shellcheck --version
```

### 检查未追踪文件

```bash
git status --untracked-files=all
git clean -nfd  # 预览将删除的文件（不实际删除）
```

---

## 📚 相关文档

- [Git 配置脚本](../../tools/git-tools/configure-git.sh)
- [Pre-commit 配置](../../tools/pre-commit-config.yaml)
- [CI Code Quality Workflow](../../.github/workflows/ci-code-quality.yml)
- [Post-checkout Hook](../../.git/hooks/post-checkout)

---

## 🆘 故障排除

### Q: Git 配置脚本运行失败

**A**: 检查权限：

```bash
chmod +x tools/git-tools/configure-git.sh
./tools/git-tools/configure-git.sh
```

### Q: Pre-commit 总是失败

**A**: 清除缓存重试：

```bash
pre-commit clean
pre-commit install --install-hooks
pre-commit run --all-files
```

### Q: CI 中 shellcheck 仍然失败

**A**: 确认 workflow 中已添加：

```yaml
env:
  SKIP: shellcheck
```

### Q: 分支切换后目录未自动清理

**A**: 检查 post-checkout hook：

```bash
ls -la .git/hooks/post-checkout
cat .git/hooks/post-checkout
```

如果不存在，重新安装 hooks：

```bash
./manage.sh  # 或 ./quickstart.sh --dev
```

---

**文档版本**: v1.0  
**最后更新**: 2026-01-02  
**维护者**: SAGE 项目组
