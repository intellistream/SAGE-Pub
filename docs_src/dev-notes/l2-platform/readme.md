# L2 Platform 开发文档

`sage-platform` 属于 L2（平台服务层），提供 SAGE 框架的平台级服务，包括队列、存储和服务管理。本目录记录 sage-platform 的开发文档和历史。

## 📦 主要模块

### 📬 队列模块 (`queue/`)

分布式消息队列实现：

| 模块             | 描述           |
| ---------------- | -------------- |
| `ray_queue.py`   | Ray 分布式队列 |
| `local_queue.py` | 本地队列       |
| `kafka_queue.py` | Kafka 队列集成 |

### 💾 存储模块 (`storage/`)

数据持久化服务：

| 模块                | 描述     |
| ------------------- | -------- |
| `file_storage.py`   | 文件存储 |
| `memory_storage.py` | 内存存储 |

### 🔧 服务模块 (`service/`)

平台服务管理：

| 模块                 | 描述             |
| -------------------- | ---------------- |
| `service_manager.py` | 服务生命周期管理 |
| `health_check.py`    | 健康检查         |

## 📁 文档结构

### 安装与环境

- **[checkpoint_system.md](./checkpoint_system.md)** - 安装检查点系统（断点续传、自动回滚）
- **[installation_validation.md](./installation_validation.md)** - 安装验证流程
- **[environment_and_cleanup.md](./environment_and_cleanup.md)** - 环境管理和清理

### 依赖管理

- **[dependency_optimization.md](./dependency_optimization.md)** - 依赖管理和打包优化
- **[dependency_verification.md](./dependency_verification.md)** - 依赖验证

### 故障排除

- **[troubleshooting.md](./troubleshooting.md)** - 故障排除指南
- **[performance_optimization_integration.md](./performance_optimization_integration.md)** - 性能优化集成

## 🎯 快速导航

| 想要了解...  | 查看                                                       |
| ------------ | ---------------------------------------------------------- |
| 安装问题排查 | [troubleshooting.md](./troubleshooting.md)                 |
| 断点续传安装 | [checkpoint_system.md](./checkpoint_system.md)             |
| 依赖冲突解决 | [dependency_optimization.md](./dependency_optimization.md) |
| 环境清理     | [environment_and_cleanup.md](./environment_and_cleanup.md) |

## 🔗 相关资源

- **代码位置**: `packages/sage-platform/src/sage/platform/`
- **测试**: `packages/sage-platform/tests/`
- **安装脚本**: `quickstart.sh`, `manage.sh`

______________________________________________________________________

**最后更新**: 2025-11-29
