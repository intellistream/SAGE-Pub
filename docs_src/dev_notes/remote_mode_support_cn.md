# 远程模式支持说明

## 简要结论

- ✅ `LocalEnvironment` + `remote=True`（Ray 后端）：完全支持 `autostop`
- ✅ `LocalEnvironment`（纯本地）：完全支持
- ⚠️ `RemoteEnvironment`：暂不支持 `autostop`，需手动停止

## 推荐远程模式：Ray

```python
from sage.core.api.local_environment import LocalEnvironment

env = LocalEnvironment("my_app")
env.register_service("my_service", MyService, remote=True)
# 数据流构建...

env.submit(autostop=True)  # ✅ 会自动清理 Ray Actors
```

- Dispatcher 处理完所有任务后调用 `_cleanup_ray_services()`
- `ActorWrapper.cleanup_and_kill()` 负责终止服务
- 适用于 RAG、Memory Service 等需要持久服务的场景

## 完全远程的现状

```python
env = RemoteEnvironment("my_app", host="server", port=19001)
# ⚠️ submit 不接受 autostop 参数
env.submit()
# 需要手动 stop
env.stop()
```

- `submit()` 未实现 `autostop` 参数
- 未来计划：扩展客户端协议与 JobManager 支持

## 支持矩阵

| 场景 | 示例 | autostop | 服务清理 |
|------|------|----------|-----------|
| 本地 | `LocalEnvironment()` | ✅ | ✅ |
| Ray | `LocalEnvironment(remote=True)` | ✅ | ✅ Ray Actor |
| RemoteEnvironment | `RemoteEnvironment()` | ❌ | 手动 |

## 实战建议

1. **优先选择 Ray 方案**：在本地或远程 Ray 集群上运行
2. **RemoteEnvironment 仅作备选**：需要自行实现轮询与 stop
3. **日志排查**：`.sage/logs/jobmanager/session_*/Dispatcher.log`

配套文档：
- [autostop 功能支持矩阵](autostop_mode_support.md)
- [RemoteEnvironment autostop 实现说明](remote_autostop_implementation.md)
- [autostop 服务清理修复说明（中文）](autostop_cleanup_cn.md)
