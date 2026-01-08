# sage-studio 独立仓库迁移记录

**日期**: 2026-01-08  
**类型**: 仓库拆分 (Repository Split)  
**影响**: SAGE 主仓库, sage-studio 独立仓库

## 变更概述

将 `sage-studio` 从 SAGE 主仓库拆分为独立仓库，保留完整的 git 提交历史，作为依赖 SAGE 核心的独立应用。

## 拆分原因

1. **职责分离**: sage-studio 是构建在 SAGE 之上的可视化应用，不是核心框架的一部分
2. **独立发布**: 可以独立于 SAGE 核心进行版本发布和迭代
3. **依赖关系**: 作为 PyPI 包 `isage-studio`，依赖已发布的 SAGE 核心包
4. **开发灵活性**: 前端和后端可以独立开发和部署

## 新仓库信息

- **仓库地址**: https://github.com/intellistream/sage-studio
- **PyPI 包名**: `isage-studio`
- **Python 导入**: `from sage.studio import ...`
- **文档**: https://intellistream.github.io/SAGE-Pub/ (共享主文档)

## 迁移详情

### 使用的工具

1. **git-filter-repo**: 提取 sage-studio 的完整提交历史
2. **GitHub CLI (gh)**: 创建和管理远程仓库

### 迁移步骤

```bash
# 1. 创建 GitHub 远程仓库（已存在）
gh repo create intellistream/sage-studio --public

# 2. 克隆 SAGE 仓库
git clone --no-local /home/shuhao/SAGE /tmp/sage-studio-export

# 3. 使用 git-filter-repo 提取历史
cd /tmp/sage-studio-export
git filter-repo --path packages/sage-studio --path-rename packages/sage-studio/:

# 4. 添加独立仓库必需文件
# - LICENSE (MIT)
# - CONTRIBUTING.md
# - CHANGELOG.md
# - 更新 pyproject.toml

# 5. 推送到远程
git remote add origin https://github.com/intellistream/sage-studio.git
git branch -M main
git push -u origin main --force
```

### 保留的历史

- ✅ 所有 sage-studio 相关的 commit 历史完整保留
- ✅ 作者信息和时间戳保持不变
- ✅ 提交消息完整保留
- ✅ 文件修改历史可追溯

### 新增文件

| 文件 | 说明 |
|------|------|
| `LICENSE` | MIT License |
| `CONTRIBUTING.md` | 贡献指南 |
| `CHANGELOG.md` | 变更日志 |
| `pyproject.toml` (更新) | 添加 SAGE PyPI 依赖 |

## pyproject.toml 变更

### Before (在 SAGE 主仓库中)
```toml
[project]
name = "isage-studio"
dependencies = [
    # 只列出外部依赖
    "fastapi>=0.115.0,<1.0.0",
    "pydantic>=2.10.0,<3.0.0",
    ...
]

[project.urls]
Homepage = "https://github.com/intellistream/SAGE"
Repository = "https://github.com/intellistream/SAGE.git"
```

### After (独立仓库)
```toml
[project]
name = "isage-studio"
dependencies = [
    # SAGE 核心包 (从 PyPI 安装)
    "isage-common>=0.2.0",
    "isage-llm-core>=0.2.0",
    "isage-llm-gateway>=0.2.0",
    
    # 外部依赖
    "fastapi>=0.115.0,<1.0.0",
    "pydantic>=2.10.0,<3.0.0",
    ...
]

[project.urls]
Homepage = "https://github.com/intellistream/sage-studio"
Repository = "https://github.com/intellistream/sage-studio.git"
"Parent Project" = "https://github.com/intellistream/SAGE"
```

## SAGE 主仓库的变更

### 需要更新的文件

1. **`.github/copilot-instructions.md`**
   ```markdown
   **Independent Repositories**:
   - **sage-studio**: https://github.com/intellistream/sage-studio
   - **sage-benchmark**: https://github.com/intellistream/sage-benchmark
   ```

2. **`README.md`**
   - 在 "Related Projects" 或 "Ecosystem" 部分添加 sage-studio 链接

3. **`packages/sage/pyproject.toml` (元包)**
   - 移除 sage-studio 的本地依赖
   - 添加 PyPI 依赖 `isage-studio>=0.2.0` (可选)

4. **文档 (docs-public/)**
   - 更新架构图，标注 sage-studio 为独立仓库
   - 在安装文档中说明如何安装 sage-studio

### 待处理事项

- [ ] 从 SAGE 主仓库删除 `packages/sage-studio/` 目录
- [ ] 更新 SAGE 元包的依赖配置
- [ ] 更新 CI/CD 配置（如果有 sage-studio 相关测试）
- [ ] 更新文档链接
- [ ] 在主 README 中添加 sage-studio 链接

## 安装方式变更

### Before (开发模式)
```bash
cd SAGE/packages/sage-studio
pip install -e .
```

### After (独立仓库)

**方式 1: 从 PyPI 安装**
```bash
pip install isage-studio
```

**方式 2: 从源码安装**
```bash
git clone https://github.com/intellistream/sage-studio.git
cd sage-studio
pip install -e .
```

**方式 3: 通过 SAGE 元包安装**
```bash
pip install isage  # 如果元包包含 sage-studio
```

## 依赖关系

```
sage-studio (独立)
    ├── isage-common>=0.2.0      (PyPI)
    ├── isage-llm-core>=0.2.0    (PyPI)
    ├── isage-llm-gateway>=0.2.0 (PyPI)
    └── (可选) isage-middleware>=0.2.0
```

sage-studio 不再作为 SAGE 主仓库的一部分，而是作为构建在 SAGE 之上的独立应用。

## 架构层级调整

### Before
```
L6: sage-cli, sage-studio, sage-tools, sage-llm-gateway  # 同一层级
```

### After
```
L6: sage-cli, sage-tools, sage-llm-gateway  # SAGE 核心接口

Independent Repositories:
- sage-studio (依赖 L1-L6)
- sage-benchmark (依赖 L1-L5)
```

## 破坏性变更

**是否有破坏性变更**: 是（开发环境）

**影响范围**:
- ✅ **用户侧**: 无影响（通过 PyPI 安装）
- ⚠️ **开发侧**: 需要更新本地开发环境

### 开发者迁移指南

**如果之前在 SAGE 主仓库开发 sage-studio**:

1. **克隆新仓库**:
   ```bash
   git clone https://github.com/intellistream/sage-studio.git
   cd sage-studio
   ```

2. **安装依赖**:
   ```bash
   pip install -e .  # sage-studio 本身
   pip install isage-common isage-llm-core isage-llm-gateway  # SAGE 核心
   ```

3. **前端开发**:
   ```bash
   cd src/sage/studio/frontend
   npm install
   npm run dev
   ```

**如果只是使用 sage-studio**:
```bash
pip install isage-studio  # 从 PyPI 安装
```

## 测试验证

### 验证新仓库

```bash
# 克隆并安装
git clone https://github.com/intellistream/sage-studio.git
cd sage-studio
pip install -e .

# 验证导入
python -c "from sage.studio import StudioManager; print('✅ OK')"

# 验证 CLI
sage studio --help
```

### 验证历史记录

```bash
cd sage-studio
git log --oneline | head -20  # 查看提交历史
git log --all --graph --oneline  # 查看分支历史
```

## 相关链接

- **新仓库**: https://github.com/intellistream/sage-studio
- **PyPI 页面**: https://pypi.org/project/isage-studio/ (待发布)
- **文档**: https://intellistream.github.io/SAGE-Pub/
- **主仓库**: https://github.com/intellistream/SAGE

## 审查人员

- [ ] @intellistream/sage-core
- [ ] @intellistream/sage-frontend

---

## 验证清单

- [x] 新仓库创建成功
- [x] 历史记录完整迁移
- [x] LICENSE 文件添加
- [x] CONTRIBUTING.md 添加
- [x] CHANGELOG.md 添加
- [x] pyproject.toml 更新（添加 SAGE 依赖）
- [x] copilot-instructions.md 更新
- [ ] SAGE 主仓库清理 (packages/sage-studio/)
- [ ] SAGE 元包依赖更新
- [ ] CI/CD 配置更新
- [ ] 文档更新
- [ ] PyPI 发布

## 后续步骤

1. **清理主仓库**: 删除 `packages/sage-studio/` 目录
2. **更新文档**: 在主文档中添加独立仓库说明
3. **发布 PyPI**: 发布 `isage-studio` 到 PyPI
4. **更新 CI**: 移除 sage-studio 相关的 CI 测试
5. **通知团队**: 告知开发者仓库拆分事宜
