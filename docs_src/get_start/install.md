# 安装指南 Installation

为适配不同用户的使用场景与开发需求，SAGE 提供了多种安装与部署方式，包括基于 Conda 的本地安装、Docker 容器化环境，以及一键式的自动配置脚本。所有安装方式均可通过顶层脚本 `./setup.sh` 启动，并提供如下三种模式供选择：

## 🚀 推荐方式：一键脚本安装（setup.sh）

运行以下命令以进入自动化安装流程：

```bash
./setup.sh
```

你将被提示选择以下三种安装模式之一：

### 1. Minimal Setup

仅构建最小 Conda 环境，支持运行 SAGE 的核心组件。

- 适用于初次试用、轻量部署，或资源受限场景
- 依赖项：
  - Conda（Miniconda 或 Anaconda）
  - Python ≥ 3.11
  - Hugging Face CLI

### 2. Setup with Docker

拉起预构建的 Docker 容器，并在其中初始化 Conda 环境与依赖。

- 支持跨平台统一构建
- 推荐用于隔离部署与远程服务器环境

### 3. Full Setup

安装所有核心组件 + 可选模块（如 Dashboard 和自研向量库 CANDY）：

- 安装依赖项
- 构建可视化仪表盘
- 完整支持执行图与流处理任务调度

---

## ⚙️ 手动安装方式（可选）

### 第一步：创建 Conda 环境

```bash
conda create -n sage python=3.11
conda activate sage
```

### 第二步：从源码安装

```bash
pip install .
```

> 推荐给具备 Python 环境管理经验的开发者，或需集成至已有项目流程的用户使用。

---

## 📋 系统依赖要求

| 组件             | 要求说明                               |
|------------------|----------------------------------------|
| Python           | 版本 ≥ 3.11                            |
| 操作系统         | Linux/macOS（Windows 推荐使用 Docker）|
| 可选工具         | Docker ≥ 20.10、Conda、HuggingFace CLI |

---

