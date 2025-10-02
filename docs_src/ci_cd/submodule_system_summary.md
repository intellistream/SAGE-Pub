# Submodule 分支管理系统总结

该系统实现了 SAGE 主仓库与子模块之间的智能分支同步：

- SAGE 在 `main` 分支 → 子模块追踪 `main`
- SAGE 在其他分支（如 `main-dev`）→ 子模块追踪 `main-dev`

## 构成

1. **维护脚本**：`tools/maintenance/manage_submodule_branches.sh`
   - `switch`：根据当前分支切换所有子模块
   - `status`：查看配置分支与实际分支
   - `help`：命令说明

2. **Git Hook 示例**：`tools/maintenance/git-hooks/post-checkout`
   - 可选，复制到 `.git/hooks/post-checkout` 后可在切换分支时自动执行 `switch`

3. **文档说明**：详见 [子模块分支管理](submodule_branch_management.md)

## 设计决策

- **不自动创建分支**：子模块的 `main`/`main-dev` 需在各自仓库维护
- **简洁命令界面**：保留必要命令，降低学习成本
- **显式提交 `.gitmodules`**：保证版本控制清晰

## 典型流程

### 开发流程
```bash
git checkout main-dev
./tools/maintenance/manage_submodule_branches.sh switch
git add .gitmodules
git commit -m "chore: switch submodules to main-dev"
```

### 发布流程
```bash
git checkout main
./tools/maintenance/manage_submodule_branches.sh switch
git merge main-dev
git push origin main
```

### 状态检查
```bash
./tools/maintenance/manage_submodule_branches.sh status
```

输出示例：
```
SAGE 分支: main-dev
Submodule                                  配置分支    当前分支
docs-public                                main-dev    main-dev
sage_flow                                  main-dev    main-dev
```

## 故障排查

| 问题 | 处理方式 |
|------|-----------|
| 分支缺失 | 在子模块仓库手动创建对应分支 |
| 未初始化 | `git submodule update --init --recursive` |
| `.gitmodules` 冲突 | 解决冲突后重新执行 `switch` |

## 后续建议

1. 在所有子模块仓库创建并维护 `main-dev` 分支
2. 在 CI/CD 中调用 `switch` + `git submodule update --init --recursive`
3. 形成团队共识：切换分支后提交 `.gitmodules`

## 相关链接

- [子模块管理策略](submodule_management.md)
- [子模块分支管理系统](submodule_branch_management.md)
- [Git Submodules 官方文档](https://git-scm.com/book/en/v2/Git-Tools-Submodules)

> 最后更新：2025-10-02
