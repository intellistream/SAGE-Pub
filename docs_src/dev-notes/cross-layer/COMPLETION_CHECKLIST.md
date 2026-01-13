# CI 修复和文档更新完成检查清单

## ✅ 已完成的工作

### 1. CI/CD 修复
- [x] 移除过时的 "Verify C++ Extensions" 步骤
- [x] 添加新的 "Verify PyPI Packages" 步骤
- [x] 更新 4 个组件的导入逻辑（优雅降级）:
  - [x] `sage_flow/__init__.py`
  - [x] `sage_db/__init__.py`
  - [x] `sage_tsdb/__init__.py`
  - [x] `sage_refiner/__init__.py`
- [x] 创建测试工具 `tools/scripts/test_pypi_packages.py`
- [x] 创建修复文档 `ci-cpp-extensions-removal.md`

### 2. PyPI 发布文档更新
- [x] 更新主 Copilot 指令 `.github/copilot-instructions.md`
- [x] 创建 Git hook 模板 `tools/hooks/post-commit.sample`
- [x] 创建 Hooks 使用指南 `tools/hooks/README.md`
- [x] 创建文档更新脚本 `tools/scripts/update_pypi_docs.sh`
- [x] 创建迁移指南 `pypi-publisher-migration.md`
- [x] 为 6 个旧文档添加弃用通知

## 📝 受影响的文件

### 核心文件（已修改）
```
.github/
├── copilot-instructions.md         ✅ PyPI 发布章节完全重写
└── workflows/
    └── ci-build-test.yml           ✅ 验证步骤更新

packages/sage-middleware/src/sage/middleware/components/
├── sage_flow/__init__.py           ✅ 优雅降级
├── sage_db/__init__.py             ✅ 优雅降级
├── sage_tsdb/__init__.py           ✅ 优雅降级
└── sage_refiner/__init__.py        ✅ 优雅降级
```

### 新增文件
```
tools/
├── hooks/
│   ├── README.md                   ✅ Hooks 使用指南
│   └── post-commit.sample          ✅ 自动发布 hook
└── scripts/
    ├── test_pypi_packages.py       ✅ PyPI 包测试工具
    └── update_pypi_docs.sh         ✅ 文档更新脚本

docs-public/docs_src/dev-notes/cross-layer/
├── ci-cpp-extensions-removal.md    ✅ CI 修复文档
└── pypi-publisher-migration.md     ✅ PyPI 迁移指南
```

### 添加弃用通知的文件
```
packages/sage-libs/docs/amms/
├── BUILD_PUBLISH.md                ✅ 已添加
└── PYPI_PUBLISH_GUIDE.md           ✅ 已添加

tools/docs/scripts/
└── LIBAMM_MIGRATION_QUICKREF.md    ✅ 已添加

docs-public/docs_src/developers/
├── ci-cd.md                        ✅ 已添加
└── commands.md                     ✅ 已添加

docs-public/docs_src/dev-notes/l6-cli/
└── COMMAND_CHEATSHEET.md           ✅ 已添加
```

## 🚀 后续步骤

### 立即行动

1. **测试 CI 修复**:
   ```bash
   # 本地测试
   python tools/scripts/test_pypi_packages.py
   
   # 应该看到优雅降级，不会崩溃
   ```

2. **提交更改**:
   ```bash
   git add .
   git commit -m "fix(ci): remove outdated C++ extension verification and update docs
   
   - Remove C++ .so file checks (components now independent PyPI packages)
   - Add PyPI package verification step
   - Update all components to support graceful degradation
   - Migrate PyPI publishing docs to sage-pypi-publisher
   - Add Git hooks for automated publishing
   - Add deprecation notices to old PyPI docs
   "
   ```

3. **推送并验证 CI**:
   ```bash
   git push origin main-dev
   # 检查 CI 是否通过
   ```

### 可选：设置自动发布

1. **克隆 publisher 工具**:
   ```bash
   git clone https://github.com/intellistream/sage-pypi-publisher.git ~/sage-pypi-publisher
   ```

2. **安装 Git hook**:
   ```bash
   cp tools/hooks/post-commit.sample .git/hooks/post-commit
   chmod +x .git/hooks/post-commit
   
   # 编辑配置（设置 AUTO_PUBLISH_ENABLED=true 以启用）
   vim .git/hooks/post-commit
   ```

3. **配置 PyPI 凭据**:
   ```bash
   # 创建或编辑 ~/.pypirc
   cat > ~/.pypirc << 'EOF'
   [distutils]
   index-servers =
       pypi
       testpypi

   [pypi]
   username = __token__
   password = pypi-your-token-here

   [testpypi]
   repository = https://test.pypi.org/legacy/
   username = __token__
   password = pypi-your-testpypi-token-here
   EOF
   
   chmod 600 ~/.pypirc
   ```

### 发布受影响的包

修复完成后，建议发布这些包：

```bash
cd ~/sage-pypi-publisher

# sage-middleware (组件导入逻辑更新)
./publish.sh sage-middleware --auto-bump patch --test-pypi  # 先测试
./publish.sh sage-middleware --auto-bump patch              # 正式发布

# 如果其他包也有变更
./publish.sh sage-common --auto-bump patch
./publish.sh sage-llm-core --auto-bump patch
```

## 🧪 验证清单

- [ ] 本地测试通过: `python tools/scripts/test_pypi_packages.py`
- [ ] CI 工作流通过（检查 GitHub Actions）
- [ ] 文档更新已提交
- [ ] Git hooks 已安装（可选）
- [ ] PyPI 凭据已配置（如需发布）
- [ ] 受影响的包已发布到 PyPI（可选）

## 📚 参考文档

- **CI 修复**: [ci-cpp-extensions-removal.md](../cross-layer/ci-cpp-extensions-removal.md)
- **PyPI 迁移**: [pypi-publisher-migration.md](../cross-layer/pypi-publisher-migration.md)
- **Hooks 指南**: [tools/hooks/README.md](../../../../tools/hooks/README.md)
- **Publisher 仓库**: https://github.com/intellistream/sage-pypi-publisher

## 🔍 测试命令

```bash
# 1. 测试组件导入（优雅降级）
python tools/scripts/test_pypi_packages.py

# 2. 测试 CI 验证步骤（模拟）
bash -c '
packages=(
  "isagedb:sagedb:SageDB 向量数据库"
  "isage-flow:sage_flow:SageFlow 流处理引擎"
  "isage-tsdb:sage_tsdb:SageTSDB 时序数据库"
  "isage-refiner:sage_refiner:SageRefiner 上下文压缩"
)
for pkg_info in "${packages[@]}"; do
  IFS=":" read -r pip_name module_name display_name <<< "$pkg_info"
  python -c "import ${module_name}" 2>/dev/null && echo "✅ ${display_name}" || echo "⚠️  ${display_name}"
done
'

# 3. 验证文档更新
grep -r "sage-pypi-publisher" .github/copilot-instructions.md

# 4. 检查 hook 权限
ls -la tools/hooks/post-commit.sample
```

## ✨ 预期结果

### CI 行为
- ✅ 不再检查 .so 文件
- ✅ 检查 PyPI 包是否可导入
- ✅ 部分包不可用时只警告，不失败
- ✅ 全部包都不可用时才失败

### 导入行为
- ✅ 包不可用时发出警告
- ✅ 返回 None/stub 而非抛出异常
- ✅ 导出 `_SAGE_XXX_AVAILABLE` 标志
- ✅ 其他代码可以检查可用性

### 文档
- ✅ 所有旧文档标记为 DEPRECATED
- ✅ 指向 sage-pypi-publisher 工具
- ✅ 提供清晰的迁移路径
- ✅ Hooks 配置示例完整

---

**状态**: ✅ 所有工作已完成，等待提交和 CI 验证
