# sage-studio 独立仓库拆分 - 待完成任务

**创建日期**: 2026-01-08  
**迁移文档**: `docs-public/docs_src/dev-notes/cross-layer/CHANGELOG-sage-studio-independence.md`

## ✅ 已完成

- [x] 创建 GitHub 远程仓库: https://github.com/intellistream/sage-studio
- [x] 使用 git-filter-repo 提取完整历史记录
- [x] 添加独立仓库必需文件 (LICENSE, CONTRIBUTING.md, CHANGELOG.md)
- [x] 更新 pyproject.toml，添加 SAGE PyPI 依赖
- [x] 推送到远程仓库
- [x] 更新 `.github/copilot-instructions.md`
- [x] 更新主 README.md，添加 Ecosystem 部分
- [x] 创建迁移文档

## 🔄 进行中

### 1. SAGE 主仓库清理

**优先级**: 高  
**负责人**: 待分配

- [ ] **删除本地 sage-studio 目录**
  ```bash
  cd /home/shuhao/SAGE
  git rm -rf packages/sage-studio
  git commit -m "chore: remove sage-studio (moved to independent repository)"
  ```

- [ ] **更新 quickstart.sh**
  - 移除 sage-studio 的安装步骤（如果有）
  - 更新帮助文档

- [ ] **更新 manage.sh**
  - 移除 sage-studio 相关的子模块管理（如果有）

### 2. 元包依赖更新

**优先级**: 中  
**负责人**: 待分配

- [ ] **更新 `packages/sage/pyproject.toml`**
  - 移除对本地 `sage-studio` 的依赖
  - 添加可选的 PyPI 依赖:
    ```toml
    [project.optional-dependencies]
    studio = [
        "isage-studio>=0.2.0",
    ]
    ```

- [ ] **决策**: 是否在 `all` optional-dependencies 中包含 sage-studio
  - 建议: 不包含（作为独立应用，用户按需安装）

### 3. CI/CD 配置更新

**优先级**: 高  
**负责人**: 待分配

- [ ] **`.github/workflows/` 检查**
  - 搜索所有 workflow 文件中的 `sage-studio` 引用
  - 移除或注释掉相关测试

  ```bash
  cd .github/workflows
  grep -r "sage-studio" .
  ```

- [ ] **更新的 workflow 文件** (示例):
  - `build-test.yml` - 移除 sage-studio 包测试
  - `examples-test.yml` - 移除 studio 相关示例（如果有）
  - `installation-test.yml` - 更新安装测试

### 4. 文档更新

**优先级**: 中  
**负责人**: 待分配

#### 4.1 架构文档

- [ ] **更新架构图**
  - 位置: `docs-public/docs_src/dev-notes/package-architecture.md`
  - 修改: 将 sage-studio 标记为独立仓库

- [ ] **更新层级文档**
  - 位置: `docs-public/docs_src/dev-notes/l6-*/`
  - 移除 sage-studio 相关内容
  - 添加指向独立仓库的链接

#### 4.2 安装文档

- [ ] **更新快速开始文档**
  - 位置: `docs-public/docs_src/getting-started/`
  - 说明 sage-studio 需要单独安装:
    ```bash
    pip install isage-studio
    ```

- [ ] **更新开发者文档**
  - 位置: `DEVELOPER.md`, `CONTRIBUTING.md`
  - 说明 sage-studio 已独立

#### 4.3 API 文档

- [ ] **更新 API 参考**
  - 位置: `docs-public/docs_src/api-reference/`
  - 移除或标注 sage-studio API 已迁移

### 5. Examples 和 Tutorials 更新

**优先级**: 低  
**负责人**: 待分配

- [ ] **检查 `examples/` 目录**
  ```bash
  cd examples
  grep -r "sage.studio" .
  ```
  - 移除直接依赖 sage-studio 的示例
  - 或添加安装说明

- [ ] **更新 tutorials**
  - 位置: `docs-public/docs_src/tutorials/`
  - 添加独立安装 sage-studio 的说明

### 6. PyPI 发布

**优先级**: 中  
**负责人**: 待分配

- [ ] **发布 isage-studio 到 PyPI**
  ```bash
  cd /path/to/sage-studio
  python -m build
  twine upload dist/*
  ```

- [ ] **验证 PyPI 安装**
  ```bash
  pip install isage-studio
  python -c "from sage.studio import StudioManager; print('✅ OK')"
  ```

### 7. 通知和沟通

**优先级**: 高  
**负责人**: 待分配

- [ ] **团队通知**
  - 发送邮件/消息通知团队成员
  - 说明仓库拆分和迁移指南

- [ ] **更新公告**
  - 在 GitHub Discussions 发布公告
  - 在社区群（微信/QQ/Slack）通知

- [ ] **Release Notes**
  - 在下一个 SAGE 版本的 Release Notes 中说明变更

### 8. 测试验证

**优先级**: 高  
**负责人**: 待分配

- [ ] **本地测试**
  - 克隆清理后的 SAGE 主仓库
  - 验证安装流程
  - 确认不再包含 sage-studio 代码

- [ ] **CI 测试**
  - 触发完整的 CI/CD 流程
  - 确认所有测试通过

- [ ] **独立仓库测试**
  - 克隆 sage-studio 独立仓库
  - 安装依赖并运行测试
  - 验证前端和后端正常工作

## 📝 注意事项

### 破坏性变更

**影响**: 开发者工作流

**迁移指南**:

1. **如果之前在 SAGE 主仓库开发 sage-studio**:
   ```bash
   # 克隆新仓库
   git clone https://github.com/intellistream/sage-studio.git
   cd sage-studio
   pip install -e .
   ```

2. **如果只是使用 sage-studio**:
   ```bash
   pip install isage-studio
   ```

### 依赖关系

sage-studio 现在依赖以下 SAGE PyPI 包:
- `isage-common>=0.2.0`
- `isage-llm-core>=0.2.0`
- `isage-llm-gateway>=0.2.0`
- (可选) `isage-middleware>=0.2.0`

确保这些包已发布到 PyPI。

## 🔗 相关链接

- **新仓库**: https://github.com/intellistream/sage-studio
- **迁移文档**: `docs-public/docs_src/dev-notes/cross-layer/CHANGELOG-sage-studio-independence.md`
- **主仓库**: https://github.com/intellistream/SAGE
- **PyPI**: https://pypi.org/project/isage-studio/ (待发布)

## 📅 时间线

| 阶段 | 预计完成时间 | 状态 |
|------|-------------|------|
| 仓库拆分 | 2026-01-08 | ✅ 完成 |
| 主仓库清理 | 2026-01-09 | ⏳ 待完成 |
| CI/CD 更新 | 2026-01-09 | ⏳ 待完成 |
| 文档更新 | 2026-01-10 | ⏳ 待完成 |
| PyPI 发布 | 2026-01-10 | ⏳ 待完成 |
| 团队通知 | 2026-01-11 | ⏳ 待完成 |

---

**更新**: 请在完成任务后更新此文件，勾选相应的复选框。
