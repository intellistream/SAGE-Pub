# SAGE Submodule 分支管理系统

该系统用于在不同的主仓库分支之间自动切换子模块分支，确保 `main` 与 `main-dev` 等分支的依赖一致。

## 目标

1. **开发隔离**：`main-dev` 聚焦开发，`main` 保持稳定
2. **自动同步**：切换主仓库分支时自动匹配子模块分支
3. **可视化管理**：提供脚本查看与切换当前状态

## 目录结构

```
SAGE/
├── tools/maintenance/git-hooks/post-checkout   # 可选 Git hook 示例
├── .git/hooks/post-checkout                    # 启用时复制到此处
├── tools/maintenance/manage_submodule_branches.sh
└── .gitmodules                                  # 子模块配置
```

## 快速开始

### 前置条件

- 所有子模块远程仓库均存在 `main` 与 `main-dev` 分支
- 已初始化 submodules：`git submodule update --init --recursive`

### 常用命令

```bash
# 根据当前主仓库分支自动切换子模块
./tools/maintenance/manage_submodule_branches.sh switch

# 查看当前状态
./tools/maintenance/manage_submodule_branches.sh status
```

配合 Git hook 可在 `git checkout` 时自动执行 `switch`。

## 工作流程

### 切换分支

```bash
# 切换到主分支
git checkout main
./tools/maintenance/manage_submodule_branches.sh switch

# 切换到开发分支
git checkout main-dev
./tools/maintenance/manage_submodule_branches.sh switch
```

脚本会：
1. 根据当前分支确定目标分支（`main` 或 `main-dev`）
2. 更新 `.gitmodules` 配置
3. 切换所有子模块到目标分支

### 提交 `.gitmodules` 更改

```bash
git add .gitmodules
git commit -m "chore: update submodules to main-dev branch"
```

## 输出示例

```
🚀 SAGE Submodule 分支管理
当前 SAGE 分支: main-dev

ℹ️ 在 main-dev 分支，submodules 将切换到 main-dev 分支

📦 处理 submodule: docs-public
  当前配置分支: stable
  目标分支: main-dev
  切换到 main-dev 分支...
  ✅ 已切换到 main-dev

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 成功: 3
```

## Git Hook（可选）

仓库提供了 `tools/maintenance/git-hooks/post-checkout` 示例脚本，可在 `git checkout` 时自动运行 `switch` 命令。

```bash
```bash
# 推荐：使用 helper 一键安装
./tools/maintenance/setup_hooks.sh

# 如需手动配置
cp tools/maintenance/git-hooks/post-checkout .git/hooks/post-checkout
chmod +x .git/hooks/post-checkout
```

# 禁用 hook
mv .git/hooks/post-checkout .git/hooks/post-checkout.disabled
```

## 工作场景

### 1. 新功能开发

```bash
git checkout main-dev
./tools/maintenance/manage_submodule_branches.sh switch
# 开发完成后提交
```

### 2. 准备发布

```bash
git checkout main
./tools/maintenance/manage_submodule_branches.sh switch
git merge main-dev
git push origin main
```

### 3. 功能分支开发

```bash
git checkout -b feature/new-feature main-dev
./tools/maintenance/manage_submodule_branches.sh status
```

## 高级操作

### 手动调整单个子模块

```bash
cd packages/sage-middleware/src/sage/middleware/components/sage_flow
git checkout main-dev
git pull origin main-dev
cd -
```

### 批量更新子模块

```bash
./tools/maintenance/manage_submodule_branches.sh switch
git submodule update --remote --merge
```

### CI/CD 集成

```yaml
- name: Initialize Submodules
  run: |
    ./tools/maintenance/manage_submodule_branches.sh switch
    git submodule update --init --recursive
```

## 故障排查

| 问题 | 处理方法 |
|------|-----------|
| 分支不一致 | 重新执行 `switch` |
| Submodule 未初始化 | `git submodule update --init --recursive` |
| 目标分支不存在 | 手动创建子模块对应远程分支 |
| `.gitmodules` 冲突 | 解决冲突后重新运行 `switch` |

## `.gitmodules` 示例

**main 分支：**
```gitmodules
[submodule "docs-public"]
    path = docs-public
    url = https://github.com/intellistream/SAGE-Pub.git
    branch = main
```

**main-dev 分支：**
```gitmodules
[submodule "docs-public"]
    path = docs-public
    url = https://github.com/intellistream/SAGE-Pub.git
    branch = main-dev
```

## 参考资料

- [子模块管理手册](submodule_management.md)
- [Git Submodules 官方文档](https://git-scm.com/book/en/v2/Git-Tools-Submodules)

> 最后更新：2025-10-02
