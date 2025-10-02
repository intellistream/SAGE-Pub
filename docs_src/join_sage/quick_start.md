# SAGE 快速上手（组内同学）

这份快速开始指南面向首次加入 IntelliStream · SAGE 项目的同学，帮助你在 30 分钟内完成环境初始化、跑通第一个示例、熟悉常用命令。完成本页后，你可以继续阅读 `join_sage/rookie.md` 获取更多团队协作规范。

---

## 1. 准备工作

!!! tip "先决条件"
    - 操作系统：macOS / Linux（WSL2 亦可）
    - Python 3.10+ 与 `git`
    - 推荐安装 **conda**（`miniconda` 或 `mambaforge`）以使用内置脚本创建虚拟环境
    - 可用的 GPU（选配）：仅在需要运行深度学习示例时必需

```bash title="克隆代码仓库"
git clone https://github.com/intellistream/SAGE.git
cd SAGE
git checkout main-dev   # 组内默认开发分支
```

---

## 2. 一键安装脚本（推荐）

仓库根目录提供了 `quickstart.sh`，可按场景安装不同的依赖组合：

```bash title="常用安装模式"
./quickstart.sh --dev --yes        # 开发者模式：完整依赖 + 测试工具
./quickstart.sh --standard --yes   # 标准模式：生产依赖 + CLI
./quickstart.sh --minimal --yes    # 精简模式：仅核心组件

# 需要 vLLM / GPU 加速时
./quickstart.sh --standard --vllm --yes

# 想跳过 conda，直接使用系统 Python
./quickstart.sh --minimal --pip --yes
```

运行结束后脚本会输出激活虚拟环境的命令（通常为 `conda activate sage_dev`）。如需了解所有参数，可执行 `./quickstart.sh --help`。

---

## 3. 配置环境变量与 API Key

许多示例依赖外部模型服务（OpenAI、DashScope、Jina 等）。我们建议复制根目录的模板文件：

```bash
cp .env.template .env
```

编辑 `.env`，至少填写以下常用变量：

| 变量 | 用途 |
| --- | --- |
| `OPENAI_API_KEY` | 调用 OpenAI / Azure OpenAI 模型 |
| `HF_TOKEN` | 访问 Hugging Face 权限受限模型 |
| `DASHSCOPE_API_KEY` | 阿里灵积模型服务（可选） |
| `SAGE_LOG_LEVEL` | 控制日志级别，默认 `INFO` |

使用 CLI 也可以生成和管理配置：

```bash
sage config init        # 初始化 ~/.sage/config.yaml
sage config env setup   # 交互式写入 .env 变量
```

---

## 4. 跑通第一个示例

完成安装后，你可以直接运行 `examples/tutorials/hello_world.py` 验证核心 API：

```bash
python examples/tutorials/hello_world.py
```

示例会构建一个批处理 Pipeline：

```python linenums="1" hl_lines="9 12 15"
from sage.core.api.local_environment import LocalEnvironment
from sage.core.api.function.batch_function import BatchFunction
from sage.core.api.function.map_function import MapFunction
from sage.core.api.function.sink_function import SinkFunction


class HelloBatch(BatchFunction):
    def __init__(self):
        super().__init__()
        self.counter, self.max_count = 0, 10

    def execute(self):
        if self.counter >= self.max_count:
            return None
        self.counter += 1
        return f"Hello, World! #{self.counter}"


class UpperCase(MapFunction):
    def execute(self, data):
        return data.upper()


class PrintSink(SinkFunction):
    def execute(self, data):
        print(data)


def main():
    env = LocalEnvironment("hello_world")
    env.from_batch(HelloBatch).map(UpperCase).sink(PrintSink)
    env.submit(autostop=True)


if __name__ == "__main__":
    main()
```

运行成功后，你将看到 `HELLO, WORLD! #1 ... #10` 的输出。

---

## 5. 常用诊断命令

| 命令 | 功能 | 备注 |
| --- | --- | --- |
| `sage doctor` | 检查依赖、扩展、环境变量 | 安装完成后建议执行一次 |
| `sage extensions status` | 查看 C++ 扩展（`sage_db`、`sage_flow`）安装情况 | 需要时用 `sage extensions install` 构建 |
| `sage dev quality` | 运行静态检查（ruff / mypy / format） | 需选择 `--dev` 模式安装 |
| `sage dev test` | 执行快速测试集 | PR 前跑通 |

---

## 6. 下一步去哪？

| 主题 | 文档 | 说明 |
| --- | --- | --- |
| 团队介绍 | [我们是谁](intellistream.md) | 了解 IntelliStream 的研究方向与项目愿景 |
| 协作与规范 | [欢迎进组](rookie.md) | 待办事项、周报格式、注意事项 |
| 周会安排 | [周会排班工具](weekly_meeting.md) | 通过可视化面板同步汇报计划 |
| 深入框架 | [Get Started 指南](../get_start/quickstart.md) | 面向开发者的框架文档 |

完成以上步骤后，你已经具备在本地开发与调试 SAGE 的基础环境。遇到问题请在 Slack、QQ/微信群或 GitHub Discussions 联系项目维护者。
