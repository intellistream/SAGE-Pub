# 命令行速查手册

> 相关源码：`packages/sage-tools/src/sage/tools/cli/main.py`

SAGE CLI 基于 Typer 构建，主入口为 `sage`，所有子命令都可通过 `sage <command> --help` 查看实时帮助。以下内容重点整理远程模式下常用的集群、部署与作业管理指令。

---

## 总体结构

```bash
sage
├── deploy           # 系统部署（Ray + JobManager）
├── job              # 作业管理：暂停/继续/删除/查看
├── jobmanager       # 守护进程生命周期控制
├── cluster          # 集群快捷操作（head + workers）
├── head / worker    # 头节点、工作节点的独立控制
├── config           # 配置文件管理及子模块 (env / llm)
└── extensions       # C++ 扩展安装与状态检查
```

> 除上述模块外，CLI 还提供 `studio`、`dev`、`doctor` 等子命令，本文聚焦与远程运行直接相关的部分。

---

## `sage deploy`

源码：`commands/deploy.py`

| 子命令 | 作用 | 常用参数 |
| --- | --- | --- |
| `deploy start` | 根据 `~/.sage/config.yaml` 启动 Ray Head、JobManager，并可选拉起 Worker | `--ray-only` 仅启动 Ray；`--daemon-only` 仅启动 JobManager；`--with-workers` 级联启动 Worker |
| `deploy stop` | 停止 JobManager 与 Ray 服务 | 参数同上 |
| `deploy restart` | 组合执行 `stop` + `start` | - |
| `deploy status` | 检查 Ray 与 JobManager 当前状态 | - |

**快速示例**：

- 启动完整集群：`sage deploy start --with-workers`
- 仅重启 JobManager：`sage deploy stop --daemon-only && sage deploy start --daemon-only`

> `deploy` 命令会读取 `~/.sage/config.yaml`，若配置缺失，可先运行 `sage config init` 生成默认模板。

---

## `sage cluster`

源码：`commands/cluster.py`

`cluster` 子命令整合头节点与 Worker 的操作，并复用 `DeploymentManager` 完成代码同步。

| 子命令 | 说明 |
| --- | --- |
| `cluster start` | 先启动 Head，再根据配置批量 SSH 启动 Worker |
| `cluster stop` | 依次停止 Worker 与 Head |
| `cluster status` | 汇总 Head、Worker 状态及 Dashboard 访问地址 |
| `cluster deploy` | 调用 `DeploymentManager` 将当前 SAGE 项目打包并分发至所有 Worker |
| `cluster scale add host:22` | 动态新增 Worker 节点 |
| `cluster scale remove host:22` | 移除 Worker 节点 |

> 如果需要单独控制 Head 或 Worker，可直接使用 `sage head ...` 与 `sage worker ...`。这些命令支持 `start`、`stop`、`status`、`logs` 等操作，并会自动激活配置中的 Conda 环境。

---

## `sage job`

源码：`commands/job.py`

`sage job` 是远程作业的首选管理入口，内部通过 `JobManagerClient` 与守护进程通信。`job_identifier` 支持 **作业序号（list 命令显示的序号）** 或 **UUID/UUID 前缀**。

| 子命令 | 作用 | 常用选项 |
| --- | --- | --- |
| `job list` | 列出所有作业 | `--status running` 过滤状态；`--format json` 获取原始数据；`--full-uuid` 显示完整 UUID |
| `job show <id>` | 展示详情 | `--verbose/-v` 输出 Dispatcher 信息、资源统计 |
| `job status <id>` | 快速查看状态 | - |
| `job stop <id>` | 暂停/停止作业，`pause` 为别名 | `--force` 跳过确认 |
| `job continue <id>` | 恢复作业，`resume` 为别名 | `--force` 跳过确认 |
| `job delete <id>` | 删除作业记录 | `--force` 跳过确认提示 |
| `job cleanup` | 清空所有作业（谨慎使用） | `--force` 直接执行 |
| `job health` | 对守护进程做健康检查 | - |

**使用技巧**：

1. 先执行 `sage job list` 获取编号，再对特定作业执行 `stop`/`show`。
2. 当 `RemoteEnvironment.submit(autostop=True)` 返回后，可通过 `job show` 观察历史结果和日志路径。
3. 若需要批量删除暂存作业可用 `job cleanup --force`。

---

## `sage jobmanager`

源码：`commands/jobmanager.py`

当 `deploy` 无法处理特殊情况（例如端口占用或需要手动强杀）时，可使用更细粒度的 `jobmanager` 命令：

- `sage jobmanager start`：在本机后台启动守护进程；
- `sage jobmanager stop`：优雅停止，如失败则自动强制终止；
- `sage jobmanager status`：读取进程信息、监听端口及日志；
- `sage jobmanager health`：直接向守护进程发送 TCP 健康检查；
- `sage jobmanager kill`：在需要强制终止卡死进程时使用（会请求 sudo 权限）。

这些命令在需要手动排查远程 JobManager 时尤为有用，例如确认端口 `19001` 是否空闲、健康检查返回值是否为 `success`。若需查看日志，可在 `~/.sage/logs/jobmanager/`（默认路径）下手动检查最新文件。

---

## `sage config`

源码：`commands/config.py`、`cli/config_manager.py`

配置命令主要用于初始化与查看 `~/.sage/config.yaml`：

- `sage config init`：生成默认配置。使用 `--force` 可覆盖现有文件；
- `sage config show`：打印当前配置内容；
- `sage config env ...`：管理 `.env` 文件及环境变量；
- `sage config llm ...`：维护远程 LLM 服务的连接信息。

`ConfigManager` 会缓存读取结果，并提供 `get_head_config()`、`get_workers_ssh_hosts()` 等方法供 CLI 其他模块使用。因此 **更新配置后，请重新运行相关命令**，以确保最新配置被拾取。

---

## `sage extensions`

源码：`commands/extensions.py`

当远程节点需要使用 C++ 扩展（`sage_db` / `sage_flow`）时，可通过以下命令管理：

- `sage extensions install [sage_db|sage_flow|all]`：自动检查编译工具并构建扩展；
- `sage extensions status`：检测扩展模块是否可导入；
- `sage extensions clean`：清理 `build/` 目录与动态库缓存；
- `sage extensions info`：查看扩展特性和安装状态。

提示：执行安装前可通过 `sage extensions install --force` 强制重新构建，若缺少 `cmake`/`gcc`/`make` 会给出友好的安装指引。

---

## 常见排查步骤

| 问题 | 建议命令 |
| --- | --- |
| CLI 报错 "Config file not found" | `sage config init`；确认 `~/.sage/config.yaml` 存在 |
| 无法连接 JobManager | `sage job health` 或 `sage jobmanager status`，核对 `daemon.host/port` |
| Worker 未启动 | `sage cluster status`、`sage worker start --host <ip>` |
| 作业列表为空但任务仍运行 | `sage job list --full-uuid`，如需清理可执行 `sage job cleanup --force` |

结合本章节的命令行工具，你可以在本地调试 Pipeline 后，将其安全地部署到远程集群，并通过 JobManager 实时观察与控制作业生命周期。
