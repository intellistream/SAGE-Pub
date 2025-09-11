# 加入我们 · IntelliStream SAGE 项目组

我们是华中科技大学 IntelliStream 课题组，长期致力于分布式系统与智能数据流处理方向的研究。现在，我们围绕大模型系统化落地的新范式，正在构建下一代科研基础设施——SAGE（Streaming-Augmented Generative Execution）。

---

## 🌟 我们在做什么？

SAGE 项目旨在将“大数据时代”行之有效的 Dataflow 思想，带入“大模型时代”的新挑战中：

- **任务更复杂**：从简单的数据批处理，走向多模态检索、多智能体、多阶段推理。
- **状态更难管**：Prompt、KV Cache、向量记忆……都需要可复现、可观测、可扩展的系统支撑。
- **资源更宝贵**：在 GPU 稀缺环境下，系统级调度与执行策略对吞吐与延迟影响巨大。

SAGE 正在开发：

- 🧠 **统一记忆层（NeuroMem）**：支持 KV / 向量 / 图记忆的通用接口与版本控制。
- ⚙️ **资源感知调度器**：基于 Ray Runtime 的动态扩缩与预测执行，初步实验已见 1.5×～2× 吞吐提升。
- 🕸️ **Dataflow 编排**：用 DAG 明确列出检索-推理-工具调用链，方便实验复现与优化。
- 🔍 **全链路观测支持**：计划支持 Trace + 差分回放，增强对比实验的可解释性。

---

## 🔬 我们在思考的问题

- 如何让 RAG、Agent 系统在可重复的同时支持真实在线负载？
- 如何将“记忆-检索-推理”放入一个统一的优化器？
- 编译优化在 LLM Workload 编排中的角色是什么？
- Speculative Execution 能否在小规模实验中有效降低尾延迟？
- Graph-RAG 在工业部署下的真实收益？

这些正是我们当前与未来两年关注的研究方向。

---

## 🤝 欢迎你加入！

如果你正在做如下方向，欢迎一起来探讨、做实验、写论文：

- RAG / Tool-LLM / 多智能体系统
- 系统调度、资源管理、系统可观测性
- AIOps / 多模态图神经网络 / 数据流图编译
- GPU 优化、Serverless 推理、流批一体

我们提供完善的原型代码、数据集、Benchmark 流水线，并支持开源协作与 SIG（专题小组）共建。

---

## 📬 联系方式

- 👤 团队负责人：张书豪  
    - 🧢 主页：[https://faculty.hust.edu.cn/ZHANG_SHUHAO/zh_CN/index/2608525/list/](https://faculty.hust.edu.cn/ZHANG_SHUHAO/zh_CN/index/2608525/list/)
    - 📧 邮箱：shuhao_zhang@hust.edu.cn  
    - 💬 QQ：420444843  

- 🌐 团队主页：[https://IntelliStream.github.io/](https://IntelliStream.github.io/)
- 💼 团队地址：湖北省武汉市洪山区珞喻路 1037 号  
  华中科技大学计算机学院 408 室  
- 💬 Slack 社区：[intellistream.slack.com](https://intellistream.slack.com)（欢迎留言或加入交流）

---

## 📌 开源计划路线图

| 里程碑时间 | 内容 |
|------------|------|
| 2025 H2    | 发布 Beta 版本的 Dataflow SDK + 基础记忆 API |
| 2026 H1    | 发布观测组件与调度策略论文，并同步开源实现 |

项目地址与文档持续更新中：[https://intellistream.github.io/SAGE-Pub/](https://intellistream.github.io/SAGE-Pub/)

---

我们相信未来的大模型系统，必须“能落地、可重复、可解释”。如果你也认同这条路径，欢迎加入我们，一起搭建下一个十年的智能系统基础设施！

—— IntelliStream · SAGE 项目组
