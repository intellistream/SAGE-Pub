# 远程模式总览

> 相关源码：`packages/sage-kernel/src/sage/core/api/remote_environment.py`、`packages/sage-tools/src/sage/tools/cli/commands/deploy.py`

SAGE 的 **远程模式** 允许开发者在本地构建 Pipeline，但把作业提交到远程集群（Ray + JobManager）执行。该模式适合以下场景：

- 已有固定的 GPU/CPU 集群，需要把 SAGE 作业托管给集中式 JobManager；
- 希望在本地调试完 Pipeline 后一键部署到远程环境；
- 需要按需扩缩容 Worker，并通过命令行快速发现/管理运行中的作业。

```mermaid
graph LR
		A[本地开发机] -- RemoteEnvironment.submit --> B(JobManager Daemon\n默认 19001)
		B --> C[Ray Head 节点]
		C -. Ray 集群通信 .-> D[Worker 节点]
		D -->|执行 Pipeline| E[外部服务/存储]
```

---

## 核心组件

| 角色 | 说明 | 对应源码 |
| --- | --- | --- |
| RemoteEnvironment | 序列化 Pipeline，并通过 TCP 客户端提交到远程 JobManager。支持 `autostop`、`stop()`、`health_check()` | `remote_environment.py` |
| JobManager Daemon | 接收远程提交、调度作业、提供健康检查和状态查询 | `sage.kernel.jobmanager` 模块 |
| Ray Head | 负责调度 Worker，监听 Dashboard (`默认:8265`) 与 Ray 集群端口 (`默认:6379`) | `commands/head.py` |
| Worker 节点 | 实际运行算子，支持多机扩缩容 | `commands/worker.py`、`commands/cluster.py` |
| CLI 工具 | `sage deploy`, `sage job`, `sage cluster`, `sage config` 等子命令，提供系统管理能力 | `packages/sage-tools/src/sage/tools/cli/commands` |

---

## 环境准备

1. **安装 CLI 工具**（建议在远程节点与本地机器都安装）：
	 ```bash
	 pip install -e packages/sage-tools
	 ```
	 安装后可通过 `sage --help` 验证命令行是否可用。

2. **初始化配置文件**：
	 ```bash
	 sage config init
	 ```
	 该命令会在 `~/.sage/config.yaml` 中生成默认配置。关键字段如下：

	 ```yaml
	 head:
		 host: base-sage
		 head_port: 6379
		 dashboard_port: 8265
	 daemon:
		 host: base-sage
		 port: 19001
	 ssh:
		 user: sage
		 key_path: ~/.ssh/id_rsa
	 remote:
		 sage_home: /home/sage
		 python_path: /opt/conda/envs/sage/bin/python
	 ```

	 - `head.host` / `daemon.host`：请填入实际的 Head 节点地址；
	 - `workers_ssh_hosts`：支持 `host:port` 列表，供批量管理 Worker；
	 - `remote.python_path` / `remote.ray_command`：指向远程机器上已安装的 Python 与 Ray。

3. **准备远程运行环境**：
	 - 确保各节点已安装与配置中的 `python_path`、`ray` 命令；
	 - JobManager 的守护进程依赖 `sage` 包及其扩展，建议通过部署命令分发项目源码（见下文）。

---

## 启动远程集群

### 首次部署

使用 `sage deploy start` 可以按配置完成从开启 Ray Head、启动 JobManager，再到可选的 Worker 启动流程：

```bash
sage deploy start --with-workers
```

- `--ray-only`：仅启动 Ray 集群（Head + Worker）；
- `--daemon-only`：只启动 JobManager；
- `--with-workers`：在 Head 启动后，自动通过 SSH 逐个拉起 Worker 节点。

在部署前，可运行 `sage config show` 检查配置是否生效。若需要把项目源码同步到远程节点，可借助 `sage cluster deploy`（调用 `DeploymentManager` 生成打包并通过 SSH 分发）。

### 状态检查 & 日志

- `sage deploy status`：查看 Ray、JobManager 是否运行；
- `sage head status` / `sage worker status`：分别检查 Head 或所有 Worker；
- `sage head logs`：读取 Head 节点最近日志，默认展示 20 行。

### 停止服务

```bash
sage deploy stop --with-workers
```

若仅需停止 Ray，可通过 `--ray-only`；只停止 JobManager 则使用 `--daemon-only`。命令会在远端执行 `ray stop` 并终止守护进程，同时清理默认的临时目录（如 `/var/tmp/ray`）。

---

## RemoteEnvironment 工作流

1. **本地构建 Pipeline**：复用与本地模式一致的 API，只需将环境切换为 `RemoteEnvironment`。
2. **调用 `submit(autostop=True)`**：对象会通过 `JobManagerClient` 序列化并提交到 `daemon.port`（默认 19001）。
3. **监控运行状态**：可使用 `RemoteEnvironment.get_job_status()` 或命令行 `sage job list|show`。
4. **终止作业**：调用 `RemoteEnvironment.stop()` 或者在 CLI 中执行 `sage job stop <id>`。

> `RemoteEnvironment` 已支持 `autostop`。当 `submit(autostop=True)` 时，客户端会轮询 JobManager，当任务完成或资源清理后自动返回。

---

## 常见排查

- **JobManager 无法连接**：确认 `~/.sage/config.yaml` 中的 `daemon.host`/`daemon.port` 是否与远端守护进程一致，必要时执行 `sage deploy start --daemon-only` 重启。
- **Ray 集群未启动**：使用 `sage head status` 查看是否存在残留进程；若端口占用，可以改写配置里的 `head_port`。
- **Worker 未加入集群**：检查 `workers_ssh_hosts` 列表以及 SSH 密钥权限，必要时用 `sage worker start --host <ip>` 手动排查。
- **作业卡住无响应**：可以在 CLI 中 `sage job show <uuid> -v` 查看 Dispatcher 状态；若需要强制终止，可执行 `sage job delete <uuid> --force`。

---

下一节将进一步介绍如何使用命令行工具与 `RemoteEnvironment` 提交作业，并管理运行中的任务。
