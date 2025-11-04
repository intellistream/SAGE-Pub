# 具体应用示例

SAGE 提供了多个实际应用示例，展示如何使用 SAGE 框架构建端到端的 AI 应用。这些应用涵盖了不同的领域，展示了 SAGE 在各种场景下的能力。

## 概览

SAGE 应用示例位于 `packages/sage-apps` 包中，包括：

1. **文章监控系统** - 智能论文推荐和筛选
2. **分布式智能家居系统** - IoT 设备协调和自动化
3. **智能扩缩容聊天系统** - 弹性资源管理
4. **视频智能分析** - 多模型视频理解
5. **医疗诊断系统** - AI 辅助医疗影像分析

## 应用列表

### 1. 文章监控系统

智能监控 arXiv 最新论文，通过关键词和语义过滤为用户推荐相关文献。

**特点**：
- 实时数据流处理
- 多级筛选（关键词 + 语义）
- 个性化推荐

**快速开始**：
```bash
python examples/apps/run_article_monitoring.py
```

**详细文档**：[文章监控系统](article-monitoring.md)

---

### 2. 分布式智能家居系统

展示 SAGE 的互联互通能力，通过 IoT 设备网络实现智能家居自动化。

**特点**：
- IoT 设备协调
- 自动化工作流
- 环境感知

**快速开始**：
```bash
python examples/apps/run_smart_home.py
```

**详细文档**：[智能家居系统](smart-home.md)

---

### 3. 智能扩缩容聊天系统

展示 SAGE 的高资源利用能力，通过智能扩缩容实现弹性资源管理。

**特点**：
- 自动扩缩容
- 负载均衡
- 资源监控

**快速开始**：
```bash
python examples/apps/run_auto_scaling_chat.py
```

**详细文档**：[自动扩缩容系统](auto-scaling-chat.md)

---

### 4. 视频智能分析

使用 CLIP 和 MobileNetV3 进行多模型视频内容分析。

**特点**：
- 多模型推理管道
- 场景理解
- 目标检测
- 时序分析

**快速开始**：
```bash
python examples/apps/run_video_intelligence.py --video video.mp4
```

**详细文档**：参见 [sage-apps 包文档](index.md#video-intelligence)

---

### 5. 医疗诊断系统

AI 辅助的医疗影像分析系统，使用多智能体架构。

**特点**：
- 多智能体协作
- 医疗知识库
- 诊断报告生成

**快速开始**：
```bash
python examples/apps/run_medical_diagnosis.py
```

**详细文档**：参见 [sage-apps 包文档](index.md#medical-diagnosis)

---

## 安装

安装所有应用：

```bash
pip install -e packages/sage-apps[all]
```

安装特定应用：

```bash
# 仅安装文章监控
pip install -e packages/sage-apps

# 视频智能（需要额外依赖）
pip install -e packages/sage-apps[video]

# 医疗诊断
pip install -e packages/sage-apps[medical]
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

## 运行示例

所有示例都提供了命令行接口：

```bash
# 文章监控
python examples/apps/run_article_monitoring.py --keywords "machine learning" --max-articles 20

# 智能家居
python examples/apps/run_smart_home.py --cycles 3 --verbose

# 自动扩缩容
python examples/apps/run_auto_scaling_chat.py --duration 60 --peak-rate 80 --verbose
```

## 自定义应用

基于这些示例，您可以创建自己的 SAGE 应用：

1. **创建算子**: 继承 BatchFunction, MapFunction, SinkFunction
2. **构建管道**: 使用 SAGE Environment API
3. **运行测试**: 使用本地或分布式环境
4. **部署**: 集成到生产系统

参考示例代码：`packages/sage-apps/src/sage/apps/`

## 贡献

我们欢迎社区贡献新的应用示例！请参考：

- [贡献指南](../../community/community.md)
- [开发文档](../../developers/ci-cd.md)
- [包结构](../../concepts/architecture/package-structure.md)

## 下一步

- 深入了解每个应用的详细文档（点击上方链接）
- 查看 [API 参考](../../api-reference/index.md)
- 探索 [教程](../../tutorials/index.md)
- 加入 [社区讨论](../../community/community.md)
