# 教程与示例映射一览

> **说明**：表格汇总了 Task D 要求的“源码入口 + 运行命令 + 预期日志”三件套，确保文档与 `examples/` 目录保持 1:1 对齐。若脚本依赖远程服务（LLM / JobManager / Ray 集群），请先按教程指引完成环境准备。

| 教程文档 | 示例脚本 | 运行命令 | 预期日志要点 |
| --- | --- | --- | --- |
| `tutorials/basic/streaming-101.md` | `examples/tutorials/hello_world.py` | `python examples/tutorials/hello_world.py` | 逐行打印 `HELLO, WORLD! #1~#10`，收尾 `Hello World 批处理示例结束`，JobManager 日志见 `.sage/logs/jobmanager/session_*` |
| `tutorials/basic/hello_batch.md` | `examples/tutorials/hello_world.py` （同一实现） | 同上 | 同上；该教程用于拆解批任务结构，可结合脚本定位 Batch/Map/Sink 定义 |
| `tutorials/advanced/distributed-pipeline.md` | `examples/tutorials/L3-kernel/advanced/parallelism_remote_validation.py` | `python examples/tutorials/L3-kernel/advanced/parallelism_remote_validation.py` | 终端显示 `REMOTE ENVIRONMENT - ...` 标题，多条 `⚙️ DistProcessor` / `✅ Filter` / `🎯 SINK` 行，最后输出 Ray 并行度分析 |
| `tutorials/advanced/performance-tuning.md` | `examples/tutorials/vllm_control_plane_tutorial.py` + `examples/tutorials/benchmark_control_plane_demo.py` | 先运行 `python examples/tutorials/vllm_control_plane_tutorial.py`，再运行 `python examples/tutorials/benchmark_control_plane_demo.py` | 控制面脚本打印 `Demo 1/2` 配置与实例，Benchmark 脚本输出 `Configuration is valid.`、`Generated X requests` 等校验语句 |
| `tutorials/advanced/advanced-rag.md` | `examples/tutorials/L3-libs/rag/usage_4_complete_rag.py` | `python examples/tutorials/L3-libs/rag/usage_4_complete_rag.py` | `RAGUnlearningSystem initialized` → `✓ Initialized RAG corpus` → `✅ Completed unlearning`，并可看到隐私审计日志 |
| `tutorials/advanced/custom-operators.md` | `examples/tutorials/L3-kernel/operators/hello_filter_world.py`、`hello_flatmap_world.py` 等 | 例如 `python examples/tutorials/L3-kernel/operators/hello_filter_world.py` | 控制台打印 `HELLO, WORLD!` 系列以及算子特定提示（如 `Hello Filter World 示例结束`） |
| `docs/dev-notes/l3-kernel/cpu-node-setup.md` 与教程联动 | `examples/tutorials/L3-kernel/cpu_node_demo.py` | `python examples/tutorials/L3-kernel/cpu_node_demo.py` | 多个 `✅ [CPU Node] Completed task ...`、调度策略统计与节点分布摘要 |

> 📌 **建议**：运行任何脚本前执行 `sage-dev quality --check-only` 与必要的 `sage llm status` / `sage cluster status` 检查，可提前发现依赖缺失、端口冲突等问题。
