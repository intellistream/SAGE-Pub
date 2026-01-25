# 团队分工

本文档记录 SAGE 生态系统各仓库的团队分工情况。

> **注意**：以下分工为当前安排，可能会根据项目发展和团队情况进行调整。

## SAGE 核心仓库分工

| 姓名 | 角色类别 | 仓库类别 | 仓库层级 |
|------|----------|----------|----------|
| / | / | isage-common | L1 基础 |
| 刘沛林 | 负责人 | isage-platform | L2 平台 |
| 刘俊 | 负责人 | isage-kernel | L3 核心 |
| 陈彦博 | 负责人 | isage-libs | L3 算法库 |
| 张睿诚 | 负责人 | isage-middleware | L4 中间件 |
| 徐天翊 | 科研 | isage-middleware | L4 中间件 |
| 王子澳 | 技术骨干 | isage-middleware | L4 中间件 |
| 朱鑫材 | 科研 | isage-middleware | L4 中间件 |
| 高鸿儒 | 科研 | isage-middleware | L4 中间件 |
| 张澹潇 | 科研 | isage-middleware | L4 中间件 |
| 陈德斌 | 技术骨干 | isage-middleware | L4 中间件 |
| / | / | isage-cli | L5 开发工具 |
| / | / | isage-tools | L5 开发工具 |
| / | / | isage | 元包 |
| / | / | isage-benchmark | 独立包 |
| 张森磊 | 负责人 | sage-examples（未发布到 PyPI） | 独立包 |
| / | / | isage-studio | 独立包 |
| / | / | isage-edge | 独立包 |
| / | / | isagellm | 独立包 |

## isagellm 独立仓库分工

isagellm 是独立的 LLM 推理引擎仓库，内部有进一步的模块分工：

| 姓名 | 角色类别 | 仓库模块 |
|------|----------|----------|
| 张睿诚 | 负责人 | sagellm-docs |
| 王明琪 | 负责人 | sagellm-kv-cache |
| 高西岭 | 技术骨干 | sagellm-kv-cache |
| 刘沛林 | 技术骨干 | sagellm-kv-cache |
| 朱鑫材 | 技术骨干 | sagellm |
| 杨锦昀 | 负责人 | sagellm-backend; sagellm-comm |
| 刘俊 | 负责人 | sagellm-control-plane; sagellm-gateway |
| 张森磊 | 负责人 | sagellm-compression |
| 李昶吾 | 科研 | sagellm-compression |
| 陈彦博 | 技术骨干 | sagellm-compression |

## 特别贡献者

以下同学虽非正式组员，但对 SAGE 生态系统做出了卓越贡献：

| 姓名 | 贡献内容 |
|------|----------|
| 田景远 | isage-common、isage-platform、isage-kernel 的改造 |
| 郭宇悦 | isage-studio |
| 周宇童 | 新 RAG 应用和系统探索（sage-examples） |
| 李新毅 | isage-middleware |
| 万睿朋 | isage-middleware |
| 雷昕延 | isage-middleware |
