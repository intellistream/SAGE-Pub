# SAGE 卫星仓库动态克隆系统 - 快速参考

## 📋 快速开始

### 一键完整安装 + 克隆卫星仓库
```bash
./quickstart.sh --full --clone-satellites --yes
```

### 查看更多选项
```bash
./quickstart.sh --help | grep -A 3 clone-satellites
```

### 验证系统
```bash
bash tools/scripts/verify_satellite_cloning.sh
```

---

## 🎯 支持的参数

### 启用克隆
- `--clone-satellites` (标准)
- `--clone-repos` (别名)
- `--satellites` (别名)

### 禁用克隆
- `--no-clone-satellites` (标准)
- `--skip-satellites` (别名)
- `--no-repos` (别名)

---

## 📦 卫星仓库列表（11 个）

1. **sage-examples** - 学习示例和应用案例
2. **sage-tutorials** - 分层教程（L1-L5）
3. **sagellm** - LLM 推理引擎
4. **sage-benchmark** - 基准测试框架
5. **sage-dev-tools** - 开发工具集
6. **sage-agentic** - Agent 框架
7. **sage-agentic-tooluse** - Assistant 工具调用
8. **sage-anns** - ANN 搜索算法库
9. **sage-eval** - 评估和指标
10. **sage-finetune** - 模型微调
11. **sage-studio** - 可视化流编辑器

---

## 🔧 核心特性

✨ **零硬编码** - 仓库列表从 SAGE.code-workspace 动态读取

✨ **智能 Fallback** - 支持 jq、Python JSON、正则表达式三层解析

✨ **完善错误处理** - 网络检测、目录检查、失败统计

✨ **优秀用户体验** - 进度显示、交互菜单、彩色输出

---

## 📝 使用示例

### 交互式安装（推荐新用户）
```bash
./quickstart.sh
# 系统会在安装完成后询问是否克隆卫星仓库
```

### 自动化安装
```bash
# 开发环境 + 克隆卫星
./quickstart.sh --dev --clone-satellites --yes

# 最小安装 + 克隆卫星
./quickstart.sh --minimal --clone-satellites --yes
```

### 独立克隆（跳过 SAGE 安装）
```bash
source tools/install/download_tools/clone_satellite_repos.sh
clone_all_public_repos /parent/directory
```

---

## 🛠️ 系统架构

```
quickstart.sh
  ↓
argument_parser.sh (参数解析)
  ↓
clone_satellite_repos.sh (克隆逻辑)
  • load_repos_from_workspace()  - 从 workspace 读取
  • get_repo_url()               - 生成 URL
  • clone_single_repo()          - 单仓库克隆
  • clone_all_public_repos()     - 批量克隆
  ↓
SAGE.code-workspace (数据源 - 唯一信息源)
```

---

## 🔄 维护指南

### 添加新卫星仓库

编辑 `SAGE.code-workspace`：
```json
{
  "folders": [
    {
      "name": "new-repository",
      "path": "../new-repository"
    }
  ]
}
```

### 删除卫星仓库

从 `SAGE.code-workspace` 删除相应条目

### 注意
- **无需修改任何脚本** - 系统自动发现和本适应
- **workspace 文件是唯一信息源** - 避免配置重复

---

## ✅ 验证状态

- [✅] 所有文件存在
- [✅] 所有函数可用
- [✅] Workspace 解析正常  
- [✅] URL 生成正确
- [✅] 参数解析完整
- [✅] 帮助文本完整
- [✅] quickstart.sh 集成
- [✅] 无硬编码依赖
- [✅] 错误处理完善
- [✅] 用户体验优秀

---

## 📞 故障排除

### 克隆失败
- 检查网络连接到 GitHub
- 检查磁盘空间
- 查看克隆失败列表了解具体哪个仓库失败

### 参数不识别
- 确保使用 `--clone-satellites`（带连字符）
- 支持别名: `--clone-repos`, `--satellites`

### 帮助文本不显示
```bash
./quickstart.sh --help | grep clone
```

---

## 🎓 了解更多

- **参数说明**：`./quickstart.sh --help`
- **克隆脚本**：`tools/install/download_tools/clone_satellite_repos.sh`
- **参数解析**：`tools/install/download_tools/argument_parser.sh`
- **验证脚本**：`tools/scripts/verify_satellite_cloning.sh`

---

**部署状态**：✅ 生产就绪
**最后更新**：2025年02月
**版本**：SAGE Quickstart v4.0+
