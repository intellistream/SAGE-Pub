# SAGE 安装指南

本文档将指导您如何安装 SAGE 及其相关依赖。请根据您的需求选择合适的安装方式。

---

## 📋 前置要求 (Prerequisites)

在开始安装之前，请确保您的开发环境满足以下要求：

* **操作系统 (OS)**:
    * Linux
    * macOS
    * Windows (推荐在 WSL2 环境下使用)
* **Python**: 版本 **≥ 3.11**。您可以通过以下命令检查：
    ```bash
    python --version
    # 或者 python3 --version
    ```
* **PIP**: Python 包管理工具。通常随 Python 一起安装。您可以通过以下命令检查：
    ```bash
    pip --version
    # 或者 pip3 --version
    ```

---

## 🚀 安装方法 (Installation Methods)

我们提供两种主要的安装方式。对于大多数用户，我们推荐直接使用 `.whl` 文件进行安装。

### 方式一：通过 Wheel 文件安装 (推荐)

这是最快捷、最简单的安装方式，无需下载源码，适合直接部署和使用 SAGE。

**第1步：下载 Wheel 文件**

前往 SAGE 的官方发布页面下载最新的 `.whl` 文件。

* **下载地址**: [https://github.com/IntelliStream/SAGE-Pub](https://github.com/LaughKing/SAGE-Pub)

请下载与项目版本对应的文件，例如 `sage-0.1.0-py3-none-any.whl`。

**第2步：使用 pip 安装**

打开您的终端（Terminal 或命令提示符），进入 `.whl` 文件所在的目录，然后执行以下命令进行安装：

```bash
# 将文件名替换为您下载的实际版本
pip install sage-0.1.0-py3-none-any.whl
```
安装命令执行完毕后，所有在 requirements.txt 中声明的依赖项也会被自动安装。

## ✅ 验证安装 (Verify Installation)
安装完成后，您可以通过以下任一方式来验证 SAGE 是否已成功安装。

### 方法1：查看包信息

运行 pip show 命令，如果能看到 SAGE 的信息，则说明安装成功。

```Bash
pip show sage
```
您应该会看到类似以下的输出：
```
Name: sage
Version: 0.1.0
Summary: 
Home-page: [https://github.com/IntelliStream/SAGE](https://github.com/IntelliStream/SAGE)
Author: IntelliStream
Author-email: intellistream@outlook.com
License: 
Location: /path/to/your/python/site-packages
Requires: ...
Required-by: 
```
### 方法2：在 Python 中导入

执行以下命令，如果没有报错，则说明安装成功。

```Python

python -c "import sage; print('✅ SAGE package imported successfully!')"
```
至此，您已成功安装 SAGE。祝您使用愉快！
