# autostop 功能在不同模式下的支持情况

`autostop=True` 能在作业完成后自动清理服务资源。本文档总结当前各运行模式的支持状态。

## 支持矩阵

| 模式 | 环境类 | `autostop` 支持 | 服务清理 | 状态 |
|------|--------|----------------|---------|------|
| 本地模式 | `LocalEnvironment` | ✅ | ✅ 本地服务 | 已验证 |
| Ray 模式 | `LocalEnvironment` + `remote=True` | ✅ | ✅ Ray Actors | 已验证 |
| 完全远程 | `RemoteEnvironment` | ⚠️ | ⚠️ 需手动 | 待增强 |

## 1. 本地模式（`LocalEnvironment`）

完全支持。任务完成后会触发 `receive_node_stop_signal`，继而执行 `_cleanup_services_after_batch_completion` 清理所有服务。

```python
from sage.core.api.local_environment import LocalEnvironment

env = LocalEnvironment("my_app")
env.register_service("my_service", MyService)
env.from_batch(MyBatch).sink(MySink)

env.submit(autostop=True)
```

## 2. Ray 模式（`LocalEnvironment` + `remote=True`）

同样支持，且会使用 `_cleanup_ray_services()` 调用 `ActorWrapper.cleanup_and_kill()` 释放 Ray Actor。

```python
from sage.core.api.local_environment import LocalEnvironment

env = LocalEnvironment("my_app")
env.register_service("my_service", MyService, remote=True)
env.submit(autostop=True)
```

核心逻辑：
```python
def _cleanup_ray_services(self):
    for service_name, service_task in self.services.items():
        if hasattr(service_task, "cleanup_and_kill"):
            service_task.cleanup_and_kill(cleanup_timeout=5.0, no_restart=True)
```

## 3. 完全远程模式（`RemoteEnvironment`）

暂不支持 `autostop` 参数：

```python
env = RemoteEnvironment("my_app", host="remote_host", port=19001)
env.submit()  # submit() 暂无 autostop 参数
```

需要手动调用 `env.stop()`；后续计划扩展 `RemoteEnvironment.submit(autostop=True)` 并让远程 JobManager 执行相同清理逻辑。

## Dispatcher 清理流程

```python
def receive_node_stop_signal(self, node_name: str):
    if len(self.tasks) == 0:
        self.is_running = False
        if len(self.services) > 0:
            self._cleanup_services_after_batch_completion()

def _cleanup_services_after_batch_completion(self):
    if self.remote:
        self._cleanup_ray_services()
    else:
        for service_task in self.services.values():
            if hasattr(service_task, "stop"):
                service_task.stop()
            if hasattr(service_task, "cleanup"):
                service_task.cleanup()
    self.services.clear()
```

`LocalEnvironment._wait_for_completion` 会等待服务完全清理后才退出，从而保证资源释放。

## 测试覆盖

```bash
# 本地模式测试
python test_autostop_service_improved.py
```

预期输出：
```
SUCCESS: Service was properly initialized, used, and cleaned up!
```

Ray 模式需在启用 Ray 环境下手动验证。

## 后续路线图

1. 在 `RemoteEnvironment` 中加入 `autostop` 支持
2. 通过客户端协议传递参数给远程 JobManager
3. 引入清理策略与超时配置

> 参考文件：`packages/sage-kernel/src/sage/kernel/runtime/dispatcher.py`
