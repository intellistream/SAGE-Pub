# sage-apps 和 examples 迁移记录

## 📅 迁移日期
2026-01-08

## 🎯 迁移目标

将 SAGE 主仓库中的应用和示例代码迁移到独立仓库 `sage-examples`，简化主仓库结构，提高模块化程度。

## 📦 迁移内容

### 1. examples/ (根目录)
- **位置**: `/examples/`
- **内容**: 
  - 教程 (tutorials/)
  - 应用示例 (apps/)
  - 数据文件
- **大小**: ~1.2 MB
- **文件数**: 120+ 个 Python 文件

### 2. packages/sage-apps/
- **位置**: `/packages/sage-apps/`
- **PyPI 包名**: `isage-apps`
- **内容**:
  - 视频智能分析
  - 医疗诊断
  - 智能家居
  - 文章监控
  - 自动缩放聊天
  - 工作报告生成器
- **大小**: ~1.1 MB
- **文件数**: 50+ 个 Python 文件

## 🆕 新仓库信息

- **仓库名**: `sage-examples`
- **GitHub URL**: https://github.com/intellistream/sage-examples
- **PyPI 包名**: `isage-examples` (计划发布)
- **内容**: 合并了 examples/ 和 sage-apps/ 的所有内容
- **结构**: 
  ```
  sage-examples/
  ├── tutorials/          # 原 examples/tutorials/
  ├── apps/              # 原 examples/apps/ + packages/sage-apps/src/sage/apps/
  ├── data/              # 共享数据文件
  └── README.md          # 新的统一文档
  ```

## 🔄 SAGE 主仓库变更

### 删除的目录
- ❌ `examples/` (根目录)
- ❌ `packages/sage-apps/`

### 删除的 CI/CD workflows
- ❌ `.github/workflows/ci-pr-examples.yml`
- ❌ `.github/workflows/ci-release-examples.yml`

### 更新的文件

#### 1. README.md
- **变更**: 更新快速开始指令，指向 sage-examples 仓库
- **架构图**: 从 11 个包减少到 10 个核心包
- **文档链接**: 指向新的 sage-examples 仓库

#### 2. Makefile
- **变更**: 移除 `sage-apps` 的安装命令
- **新增**: 提示用户独立仓库的信息

#### 3. packages/sage/pyproject.toml
- **变更**: 移除 `isage-apps[sage-deps]>=0.1.0` 依赖
- **新增**: 注释说明如何安装 isage-examples

#### 4. .github/workflows/cd-publish-pypi.yml
- **变更**: 从发布列表中移除 `isage-apps`
- **新增**: 注释说明 isage-apps 已独立发布

## 📝 文档更新

### 主仓库文档
- ✅ README.md - 更新快速开始和架构说明
- ✅ Makefile - 移除 sage-apps 安装，添加提示
- ✅ .github/workflows/ - 清理 examples 相关 workflows
- ⚠️ CONTRIBUTING.md - 需要移除 `run_examples_tests.sh` 引用

### 新仓库文档（待创建）
- [ ] sage-examples/README.md - 完整的使用指南
- [ ] sage-examples/CONTRIBUTING.md - 贡献指南
- [ ] sage-examples/docs/ - 详细文档

## 🎯 迁移原因

1. **简化主仓库**: 减少主仓库的复杂度，专注于核心框架
2. **独立发布周期**: Examples 和 Apps 可以独立于核心框架发布
3. **降低安装负担**: 用户可以选择性安装示例和应用
4. **提高模块化**: 更清晰的边界和职责划分
5. **便于社区贡献**: 独立仓库降低贡献门槛

## ✅ 验证清单

- [x] 目录已从 git 删除
- [x] Makefile 已更新
- [x] README.md 已更新
- [x] pyproject.toml 依赖已移除
- [x] CI workflows 已删除
- [x] cd-publish-pypi.yml 已更新
- [ ] CONTRIBUTING.md 需要进一步清理
- [ ] 验证 quickstart.sh 仍能正常工作
- [ ] 更新 copilot-instructions.md

## 🚀 用户迁移指南

### 对于现有用户

**之前**:
```bash
git clone https://github.com/intellistream/SAGE.git
cd SAGE
./quickstart.sh --dev --yes
python examples/tutorials/hello_world.py
```

**现在**:
```bash
# 1. 安装核心框架
git clone https://github.com/intellistream/SAGE.git
cd SAGE
./quickstart.sh --dev --yes

# 2. 安装示例和应用（可选）
git clone https://github.com/intellistream/sage-examples.git
cd sage-examples
pip install -e .  # 或等待 PyPI 发布后: pip install isage-examples

# 3. 运行示例
python sage-examples/tutorials/hello_world.py
```

### 对于新用户

```bash
# 只需要核心框架
pip install isage[standard]

# 需要示例和应用
pip install isage[standard]
pip install isage-examples  # 等待 PyPI 发布
```

## 📊 影响分析

### 主仓库
- **减少代码量**: ~2.3 MB (~170 个文件)
- **简化 CI/CD**: 移除 2 个 workflow
- **减少依赖**: 移除应用相关的重依赖

### 用户体验
- **安装更快**: 核心包安装时间减少
- **选择性安装**: 可选择是否安装示例
- **更清晰的结构**: 核心框架与应用分离

### 维护成本
- **独立发布**: 可以独立发布示例更新
- **降低耦合**: 减少主仓库的测试负担
- **提高灵活性**: 示例可以快速迭代

## 🔗 相关链接

- **sage-examples 仓库**: https://github.com/intellistream/sage-examples
- **sage-benchmark 独立仓库**: https://github.com/intellistream/sage-benchmark
- **PyPI isage**: https://pypi.org/project/isage/
- **PyPI isage-examples**: (待发布)

## 📌 后续任务

1. **sage-examples 仓库完善**
   - [ ] 创建完整的 README.md
   - [ ] 添加 CI/CD workflows
   - [ ] 设置 PyPI 发布流程
   - [ ] 添加示例文档

2. **SAGE 主仓库清理**
   - [ ] 完成 CONTRIBUTING.md 更新
   - [ ] 更新 copilot-instructions.md
   - [ ] 验证所有安装脚本
   - [ ] 更新开发者文档

3. **文档同步**
   - [ ] 更新公开文档网站
   - [ ] 更新快速开始指南
   - [ ] 更新架构文档

## 🎉 结论

此次迁移成功将应用和示例从主仓库分离，使 SAGE 的核心框架更加精简和聚焦。新的 `sage-examples` 仓库将作为独立的示例和应用集合，方便用户学习和使用 SAGE。

---

**迁移执行者**: GitHub Copilot + User  
**迁移完成日期**: 2026-01-08  
**Git Commit**: (待填写)
