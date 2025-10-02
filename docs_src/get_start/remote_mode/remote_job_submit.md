# 远程作业提交流程

> 示例脚本：`examples/tutorials/core-api/hello_remote_batch.py`

本章节展示如何将本地编写的 Pipeline 通过 `RemoteEnvironment` 提交到远程 JobManager 执行，并配合 CLI 工具完成监控与清理。涉及的关键模块：

- `RemoteEnvironment.submit(autostop=True)`：序列化 Pipeline 并发送到守护进程（默认 `19001`）；
- `JobManagerClient`：远程调用的底层通信实现；
- `sage job ...`：通过 Typer CLI 查看/控制作业生命周期。

---

## 1. 启动远程服务

在提交作业前，请确保远程集群正常运行：

```bash
sage deploy start --with-workers
sage jobmanager status          # 确认守护进程健康
sage cluster status             # 查看 Ray Head / Worker 状态
```

如需初始化配置，请参考上一节的说明运行 `sage config init` 并填写 `daemon.host`、`head.host` 等字段。

---

## 2. 编写 RemoteEnvironment Pipeline

`RemoteEnvironment` 的编程模型与本地环境保持一致，仅需在实例化时指定远程 JobManager 的地址即可：

```python linenums="1" title="remote_batch_demo.py"
from sage.core.api.remote_environment import RemoteEnvironment
from sage.core.api.function.batch_function import BatchFunction
from sage.core.api.function.map_function import MapFunction
from sage.core.api.function.sink_function import SinkFunction


class NumberBatch(BatchFunction):
	def __init__(self, limit: int = 5):
		super().__init__()
		self.limit = limit
		self.counter = 0

	def execute(self):
		if self.counter >= self.limit:
			return None  # 返回 None 通知 JobManager 批处理结束
		value = self.counter
		self.counter += 1
		return value


class DoubleMap(MapFunction):
	def execute(self, data: int) -> int:
		return data * 2


class PrintSink(SinkFunction):
	def execute(self, data):
		print(f"[remote] {data}")
		return data


def main():
	env = RemoteEnvironment(
		name="remote_batch_demo",
		host="base-sage",  # 对应 config.yaml 中的 daemon.host
		port=19001,
	)

	env.from_batch(NumberBatch, limit=5).map(DoubleMap).sink(PrintSink)

	# autostop=True 会在 JobManager 端完成批处理后自动阻塞等待退出
	env.submit(autostop=True)

	# 可选：拉取最终状态
	status = env.get_job_status()
	print(f"Final status: {status.get('status')}")


if __name__ == "__main__":
	main()
```

要点：

- `RemoteEnvironment` 自动缓存 `env_uuid`，可在后续调用 `stop()`、`close()`；
- `autostop=True` 时客户端会轮询 JobManager，直到 Dispatcher 清理完成或超时（默认 5 分钟）；
- 若需长时间运行的流任务，可设为 `autostop=False` 并结合 CLI 手动停止。

---

## 3. 通过 CLI 监控与控制

提交作业后，使用以下命令了解执行状态：

```bash
sage job list                  # 查看所有作业编号、状态
sage job show 1 -v             # 基于序号或 UUID 查看详情
sage job status <uuid>         # 快速检查某个作业状态
```

- `job list` 会按返回顺序赋予编号，可直接使用编号作为后续命令的输入；
- `job show -v` 输出 Dispatcher 统计信息（任务数、服务数、是否运行中）；
- 若需要暂停作业，执行 `sage job stop <uuid>`；恢复则使用 `sage job continue <uuid>`。

日志位置：JobManager 会在远程节点的 `~/.sage/logs/jobmanager/` 目录生成 `session_<timestamp>` 文件，可结合 `tail -f` 进行排查。

---

## 4. 清理与善后

任务结束后，可根据场景选择自动或手动清理：

- 批处理（autostop）完成：`RemoteEnvironment` 会自动退出，但可调用 `env.close()` 释放本地状态；
- 手动终止：`env.stop()` 或 `sage job delete <uuid> --force`；
- 批量清理历史作业：`sage job cleanup --force`。

关闭远程服务时，可执行：

```bash
sage deploy stop --with-workers
```

> 如果你计划持续提交远程作业，可保持集群常驻，仅在维护窗口时停止 Ray/JobManager。

---

通过以上流程，你可以将本地调试好的 Pipeline 快速迁移到远程集群运行，实现代码即刻上线、统一监控与作业生命周期管理。后续你还可以结合 CLI 的 `cluster deploy` 功能，把最新的项目源码分发到所有 Worker 节点，确保依赖保持一致。
