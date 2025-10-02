# autostop=True 无法清理 Service 的修复说明

## 问题概述

开启 `autostop=True` 的批处理作业会停止所有计算任务，但注册的 service 未被清理，导致资源泄漏。

### 根因

1. `dispatcher.receive_node_stop_signal` 仅设置 `is_running=False` 并清理任务，未处理服务。
2. `LocalEnvironment._wait_for_completion` 看到 dispatcher 停止后立即返回，没有等待服务清理结束。

## 修复内容

### `dispatcher.py`

- 在任务全部结束时调用 `_cleanup_services_after_batch_completion()`
- 新增方法遍历服务并调用 `stop`／`cleanup`，远程场景则委托 `_cleanup_ray_services`
- 清理后清空 `self.services`

### `local_environment.py`

- `_wait_for_completion` 在 `tasks` 和 `services` 均为空时才结束
- 否则记录日志并继续等待

## 验证脚本

```bash
python test_autostop_service_improved.py
```

输出示例：
```
SUCCESS: Service was properly initialized, used, and cleaned up!
  ✓ Cleanup Called:    True
  ✓ Cleanup Completed: True
  ✓ Currently Running: False
```

## 覆盖场景

- 本地批处理场景
- Ray 远程服务（通过 `_cleanup_ray_services()`）
- 自定义 service（实现 `stop`/`cleanup`）

## 当前建议

保持原有调用方式：

```python
env.submit(autostop=True)  # 服务会在作业结束后自动释放
```

如需排查，可查看 `.sage/logs/jobmanager/session_*/Dispatcher.log`。
