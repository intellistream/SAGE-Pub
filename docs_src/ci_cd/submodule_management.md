# SAGE 子模块管理策略

为了解决子模块频繁冲突的问题，我们采用 `stable` 分支策略并配套维护脚本。

## 分支策略

### 子模块仓库
- **`main`**：开发者日常开发分支
- **`stable`**：主仓库追踪的稳定分支，定期从 `main` 合并
- **`release/*`**：发布分支（可选）

### 主仓库
- `.gitmodules` 中统一追踪子模块的 `stable` 分支
- 减少因为 `main` 更新导致的 PR 冲突

## 工作流程

### 子模块仓库开发者

```bash
# 日常开发
git checkout main
git pull origin main

# 功能完成后推送到 stable
git checkout stable
git merge main
git push origin stable
```

完成后通知主仓库维护者同步。

### 主仓库维护者

```bash
# 检查子模块状态
./tools/maintenance/submodule_sync.sh status

# 更新子模块（交互式）
./tools/maintenance/submodule_sync.sh update

# 发布前锁定版本
./tools/maintenance/submodule_sync.sh lock
```

## 管理脚本

`tools/maintenance/submodule_sync.sh` 提供以下能力：

```bash
# 状态检查
./tools/maintenance/submodule_sync.sh status

# 交互式更新
./tools/maintenance/submodule_sync.sh update

# 锁定当前版本（生成 submodule-lock.json）
./tools/maintenance/submodule_sync.sh lock

# 帮助信息
./tools/maintenance/submodule_sync.sh help
```

## 版本管理

- **锁定版本**：重要版本发布前运行 `lock` 命令生成 `submodule-lock.json`
- **回滚支持**：根据 lock 文件恢复对应版本
  ```bash
  git submodule update --init --recursive
  ```

## 同步节奏

| 场景 | 建议操作 |
|------|-----------|
| 日常开发 | 暂不更新 |
| 每周例行同步 | 合并 stable 分支最新提交 |
| 发布前 | 统一锁定版本 |
| 紧急修复 | 按需更新关键修复 |

## 注意事项

1. 避免直接在 `main` 分支更新子模块
2. 优先使用脚本管理，减少手动操作
3. 提交信息需说明更新原因和范围
4. 大规模更新前提前沟通

## 相关文件

- `.gitmodules`
- `tools/maintenance/submodule_sync.sh`
- `submodule-versions.json`
- `submodule-lock.json`

## 常见问题

### 子模块状态不一致
```bash
git submodule update --remote --merge
```

### 分支切换失败
```bash
cd <submodule>
git fetch origin
git checkout stable
```

### 恢复追踪 `main`
```bash
# 手动修改 .gitmodules，更新 branch 字段
git submodule sync
git submodule update --remote
```
