# RemoteEnvironment autostop 实现说明

远程执行环境已经支持 `env.submit(autostop=True)`，作业完成后会自动等待并清理远程服务。

## 关键改动

| 文件 | 作用 |
|------|------|
| `packages/sage-kernel/src/sage/core/api/remote_environment.py` | `submit` 新增 `autostop` 参数，并实现 `_wait_for_completion()` 轮询远程状态 |
| `packages/sage-kernel/src/sage/kernel/jobmanager/jobmanager_client.py` | 向 JobManager 发送 `autostop` 标志 |
| `packages/sage-kernel/src/sage/kernel/jobmanager/server.py` | 解析请求并将 `autostop` 传递到 JobManager |
| `packages/sage-kernel/src/sage/kernel/jobmanager/jobmanager.py` | 在 `submit_job` 中记录 `autostop` 状态 |
| `packages/sage-kernel/src/sage/kernel/jobmanager/job_info.py` | `JobInfo` 持有 `autostop` 字段，`get_summary/get_status` 输出该信息 |

## 提交流程

```
RemoteEnvironment.submit(autostop=True)
    ↓
JobManagerClient.submit_job(..., autostop=True)
    ↓
JobManagerServer._handle_submit_job → JobManager.submit_job(..., autostop=True)
    ↓
JobInfo(autostop=True) + Dispatcher 启动
    ↓
客户端调用 _wait_for_completion()，轮询 get_job_status()
```

`_wait_for_completion` 在以下条件之一满足时返回：
- `status` 为 `stopped` / `failed` / `completed`
- `is_running=False` 且 `tasks == services == 0`
- 超时达到 `max_wait_time`（默认 5 分钟）

## 使用示例

```python
from sage.core.api.remote_environment import RemoteEnvironment

env = RemoteEnvironment("app", host="127.0.0.1", port=19001)
env.register_service("rag_service", RAGService)
# 构建数据流...

env.submit(autostop=True)  # 会阻塞直到作业完成并清理资源
```

## 支持矩阵

| 模式 | 环境类 | `autostop` 支持 | 资源清理 |
|------|--------|----------------|-----------|
| 本地 | `LocalEnvironment` | ✅ | ✅ 本地服务 |
| Ray | `LocalEnvironment` + `remote=True` | ✅ | ✅ Ray Actor |
| 远程 | `RemoteEnvironment` | ✅ | ✅ 远程服务 |

## 轮询与容错

- 默认每 0.5s 轮询一次状态
- 网络错误会记录日志并重试
- 如果 JobManager 返回 `success=false` 或作业不存在，将视为已结束

## 已知问题

- 需要 JobManager 在服务端实现服务清理逻辑（已通过 `autostop` 同步）
- 尚未提供可配置的轮询间隔与超时（可在未来版本加入）

## 测试建议

```bash
# 启动 JobManager
dice jobmanager start --host 127.0.0.1 --port 19001

# 运行集成测试（示例）
python tests/integration/test_remote_autostop.py

# 停止 JobManager
sage jobmanager stop
```

更多背景请参考：
- [Autostop 功能支持矩阵](autostop_mode_support.md)
- [autostop 服务清理修复总结](autostop_service_fix_summary.md)
- [远程模式支持说明（中文）](remote_mode_support_cn.md)
