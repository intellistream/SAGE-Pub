# CLI 命令行工具参考

SAGE 统一命令行工具，提供完整的作业管理、系统部署和集群管理功能，是使用 SAGE 框架的主要入口。

## 🚀 快速开始

### 安装依赖
```bash
python sage/cli/setup.py
```

### 基本使用
```bash
# 查看帮助
sage --help

# 启动系统
sage deploy start

# 列出作业
sage job list

# 查看作业详情
sage job show 1

# 运行脚本
sage job run your_script.py

# 停止系统
sage deploy stop
```

## 📋 命令结构

### 作业管理 (`sage job`)
- `list` - 列出所有作业
- `show <job>` - 显示作业详情  
- `run <script>` - 运行Python脚本
- `stop <job>` - 停止作业
- `continue <job>` - 继续作业
- `delete <job>` - 删除作业
- `status <job>` - 获取作业状态
- `cleanup` - 清理所有作业
- `health` - 健康检查
- `info` - 系统信息
- `monitor` - 实时监控所有作业
- `watch <job>` - 监控特定作业

### 系统部署 (`sage deploy`)
- `start` - 启动SAGE系统
- `stop` - 停止SAGE系统
- `restart` - 重启SAGE系统
- `status` - 显示系统状态
- `health` - 健康检查
- `monitor` - 实时监控系统

### 集群管理 (`sage cluster`)
- `create` - 创建集群
- `scale` - 集群扩缩容
- `info` - 集群信息
- `destroy` - 销毁集群

## 🔧 配置

配置文件位于 `~/.sage/config.yaml`:

```yaml
daemon:
  host: "127.0.0.1"
  port: 19001

output:
  format: "table"
  colors: true

monitor:
  refresh_interval: 5

jobmanager:
  timeout: 30
  retry_attempts: 3
```

## 🔄 迁移指南

### 从旧CLI迁移

| 原来的命令 | 新命令 |
|-----------|--------|
| `sage-jm list` | `sage job list` |
| `sage-jm show 1` | `sage job show 1` |
| `sage-jm stop 1` | `sage job stop 1` |
| `sage-jm health` | `sage job health` |
| `sage-deploy start` | `sage deploy start` |

### 向后兼容
- `sage-jm` 命令仍然可用，会自动重定向到新CLI
- 所有原有参数都保持兼容

## 🆕 新特性

1. **统一入口**: 所有命令通过 `sage` 统一访问
2. **更好的帮助**: 更详细的命令帮助和示例
3. **彩色输出**: 支持彩色状态显示
4. **作业编号**: 支持使用作业编号（1,2,3...）简化操作
5. **配置管理**: 支持配置文件自定义设置

## 📚 使用示例

### 完整工作流程
```bash
# 1. 启动系统
sage deploy start

# 2. 检查健康状态
sage job health

# 3. 运行脚本
sage job run my_analysis.py --input data.csv

# 4. 监控作业
sage job monitor

# 5. 查看特定作业
sage job show 1

# 6. 停止作业（如需要）
sage job stop 1

# 7. 停止系统
sage deploy stop
```

### 批量操作
```bash
# 清理所有作业
sage job cleanup --force

# 重启系统
sage deploy restart

# 批量监控
sage job monitor --refresh 2
```

## 🏗️ 架构设计

### 命令结构
```
sage
├── job          # 作业管理
│   ├── list
│   ├── show
│   ├── run
│   ├── stop
│   ├── monitor
│   └── ...
├── deploy       # 系统部署
│   ├── start
│   ├── stop
│   ├── status
│   └── ...
├── cluster      # 集群管理
│   ├── create
│   ├── scale
│   ├── info
│   └── ...
└── config       # 配置管理
    ├── show
    ├── set
    └── ...
```

### 组件交互
```
CLI Main
    ↓
Command Router
    ↓
Specific Manager (Job/Deploy/Cluster)
    ↓
SAGE Core Services
```

## 🔍 故障排除

### 命令不存在
```bash
# 重新安装CLI
pip install -e .

# 或手动设置
python sage/cli/setup.py
```

### 连接失败
```bash
# 检查系统状态
sage deploy status

# 启动系统
sage deploy start

# 检查健康状态
sage job health
```

### 配置问题
```bash
# 查看当前配置
sage config

# 手动编辑配置
vi ~/.sage/config.yaml
```

## ⚡ 性能优化

### 响应速度
- 命令缓存机制
- 异步操作支持
- 批量操作优化
- 智能状态更新

### 资源效率
- 内存使用优化
- 网络请求合并
- 连接池管理
- 后台任务处理

## 🔧 扩展开发

### 自定义命令
```python
from sage.cli.base import BaseCommand

class CustomCommand(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--option', help='Custom option')
    
    def handle(self, args):
        # 实现自定义逻辑
        return result
```

### 插件系统
- 支持第三方命令插件
- 动态加载和注册
- 插件依赖管理
- 插件配置和参数

## 🌐 多环境支持

### 环境配置
- 开发、测试、生产环境
- 环境隔离和切换
- 配置继承和覆盖
- 环境特定的默认值

### 部署模式
- 本地单机部署
- 分布式集群部署
- 容器化部署
- 云端部署

## LLM 服务自动配置

SAGE 提供了自动检测和配置本地 LLM 服务的功能，简化了 Ollama、vLLM 等服务的配置过程。

### 支持的服务

| 服务类型 | 默认端口 | API端点 | 检测方式 |
|---------|----------|---------|----------|
| Ollama | 11434 | `/api/tags` | HTTP GET |
| vLLM | 8000 | `/v1/models` | HTTP GET |

### 使用方法

#### 自动检测配置
```bash
# 交互式配置，自动检测所有可用服务
sage config llm auto --config-path config/config.yaml

# 全自动模式，无需交互
sage config llm auto --config-path config/config.yaml --yes

# 优先检测特定服务类型
sage config llm auto --prefer ollama --yes

# 指定使用特定模型
sage config llm auto --model-name llama2 --yes
```

#### 命令选项
- `--config-path, -c`: 指定配置文件路径
- `--prefer`: 优先检测的服务类型 (ollama/vllm)
- `--model-name, -m`: 指定模型名称
- `--section, -s`: 目标配置节
- `--yes, -y`: 自动模式，无需交互确认
- `--backup/--no-backup`: 是否创建配置文件备份

#### 交互式示例
```
检测到以下LLM服务：
1. Ollama (http://localhost:11434)
   模型: llama2, codellama, mistral
2. vLLM (http://localhost:8000) 
   模型: microsoft/DialoGPT-medium, gpt2

请选择要使用的服务 [1]: 1
请选择模型 [llama2]: llama2
✅ 配置已更新
✅ 备份已创建: config/config.yaml.backup
```

### 配置更新示例

自动配置功能会智能更新配置文件中的 generator 部分：

**更新前**:
```yaml
generator:
  type: remote
  url: "http://old-api-server:8080/v1/chat/completions"
  model: "old-model"
  api_key: "${OPENAI_API_KEY}"
  temperature: 0.7
  max_tokens: 2000
```

**更新后**:
```yaml
generator:
  type: remote
  url: "http://localhost:11434/v1/chat/completions"  # 自动更新
  model: "llama2"                                     # 自动更新
  api_key: "${OPENAI_API_KEY}"                       # 保持不变
  temperature: 0.7                                    # 保持不变
  max_tokens: 2000                                    # 保持不变
```

### 特性
- **自动检测**: 自动发现本地运行的 LLM 服务
- **智能配置**: 仅更新必要的配置项，保留其他设置
- **安全备份**: 自动创建配置文件备份
- **容错处理**: 网络连接和服务异常的优雅处理
- **用户友好**: 支持交互式和自动化两种模式

## 相关文档

- [Kernel 概念](../kernel/concepts.md)
- [作业管理](../kernel/jobmanager.md)
- [配置指南](../get_start/quickstart.md)