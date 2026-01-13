# 应用示例（已迁移到独立仓库）

!!! note "仓库迁移说明"
    SAGE 应用示例已迁移到独立仓库，以实现更好的模块化和独立发布。

## 独立仓库

| 仓库 | 描述 | 安装方式 |
|------|------|---------|
| [sage-examples](https://github.com/intellistream/sage-examples) | 应用示例和教程 | `git clone` |
| [sage-benchmark](https://github.com/intellistream/sage-benchmark) | 性能评测套件 | `pip install isage-benchmark` |
| [sage-studio](https://github.com/intellistream/sage-studio) | 可视化工作台 | `pip install isage-studio` |

## sage-examples 应用列表

以下应用现在位于 [sage-examples](https://github.com/intellistream/sage-examples) 仓库：

| 应用 | 功能概述 |
|------|---------|
| Article Monitoring | arXiv 论文监控、关键词+语义筛选 |
| Auto-scaling Chat | 弹性扩缩容的聊天会话流量模拟 |
| Smart Home | 多设备协作的智能家居自动化 |
| Video Intelligence | 多模型视频理解（CLIP + MobileNetV3） |
| Medical Diagnosis | 多智能体的医疗影像分析 |

## 快速开始

```bash
# 克隆示例仓库
git clone https://github.com/intellistream/sage-examples.git
cd sage-examples

# 安装依赖
pip install -r requirements.txt

# 运行示例
python examples/apps/run_article_monitoring.py --keywords "streaming ai"
```

## 技术架构

所有应用都基于 SAGE 框架的核心组件构建：

### SAGE 算子

- **BatchFunction**: 数据源（如 arXiv API、用户流量生成器）
- **MapFunction**: 数据转换（如过滤、处理、扩缩容决策）
- **SinkFunction**: 数据输出（如结果展示、指标收集）

### 示例管道

```python
from sage.kernel.api.local_environment import LocalEnvironment

env = LocalEnvironment("app_name")

pipeline = (
    env.from_batch(SourceOperator())
       .map(FilterOperator())
       .map(ProcessOperator())
       .sink(OutputOperator())
)

env.submit(autostop=True)
```

## 贡献

我们欢迎社区贡献新的应用示例！请到对应的独立仓库提交 PR：

- [sage-examples](https://github.com/intellistream/sage-examples) - 应用示例
- [sage-benchmark](https://github.com/intellistream/sage-benchmark) - 评测套件
- [sage-studio](https://github.com/intellistream/sage-studio) - 可视化工作台
