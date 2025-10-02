# autostop=True 服务清理修复总结

## 问题

带有服务的应用在 `env.submit(autostop=True)` 结束后，计算任务能够停止，但服务未被清理，造成资源泄漏。

根因：`dispatcher.receive_node_stop_signal` 将 `is_running` 置为 `False` 后直接返回；`LocalEnvironment._wait_for_completion` 检测到 dispatcher 停止便退出，未等待服务清理。

## 修复

### 1. `dispatcher.py`

- 在 `receive_node_stop_signal` 中，当 `self.tasks` 为空时调用 `_cleanup_services_after_batch_completion()`：

```python
if len(self.tasks) == 0:
    self.is_running = False
    if len(self.services) > 0:
        self._cleanup_services_after_batch_completion()
```

- 新增 `_cleanup_services_after_batch_completion`：本地模式逐个调用 `stop`/`cleanup`，远程模式委托 `_cleanup_ray_services`。

### 2. `local_environment.py`

- 在 `_wait_for_completion` 中，只有当 `dispatcher.tasks` 和 `dispatcher.services` 都为空时才退出，否则继续等待资源清理。

## 验证

测试脚本：`test_autostop_service_improved.py`

```
SUCCESS: Service was properly initialized, used, and cleaned up!
```

日志显示在任务结束后会继续等待服务清理，最终 `services` 被清空。

## 影响范围

- ✅ 本地模式：服务在批处理完成后自动清理
- ✅ Ray 模式：`ActorWrapper.cleanup_and_kill()` 正常释放 Actor
- ✅ 向后兼容：仅增强资源释放逻辑

## 修改文件

1. `packages/sage-kernel/src/sage/kernel/runtime/dispatcher.py`
2. `packages/sage-kernel/src/sage/core/api/local_environment.py`

## 后续改进建议

- 为远程模式补充自动化测试
- 在用户文档中说明 `autostop=True` 的清理行为
- 支持可配置的清理策略与超时
