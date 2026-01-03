# SAGE 包依赖冲突解决方案

## 问题描述

如果你在安装 SAGE 包时遇到 transformers 版本冲突错误：

```
ERROR: Cannot install isage-benchmark and isage-libs
因为这些包的依赖版本冲突。

冲突原因：
├─ isage-middleware 0.1.5.1 要求：transformers >= 4.54.1
├─ isage-libs 0.2.0.6 要求：transformers < 4.54.0, >= 4.52.0  ⚠️ 冲突！
└─ sentence-transformers 3.1.0 要求：transformers < 5.0.0, >= 4.38.0
```

## 问题根源

`isage-benchmark 0.2.4` 的依赖声明为 `isage-middleware>=0.1.5`，这会允许 pip 安装旧版本的 `isage-middleware 0.1.5.1`（包含错误的 transformers 依赖要求）。

**已修复版本**：
- ✅ `isage-middleware 0.2.3`：正确的依赖 `transformers>=4.52.0,<4.54.0`
- ✅ `isage-libs 0.2.0.6`：依赖 `transformers>=4.52.0,<4.54.0`
- ⚠️ `isage-benchmark 0.2.4`：依赖 `isage-middleware>=0.1.5`（应该是 `>=0.2.3`）

## 解决方案

### ✅ 方案 1：明确指定版本（推荐）

安装时明确指定 `isage-middleware` 的版本：

```bash
pip install isage-libs==0.2.0.6 isage-middleware==0.2.3 isage-benchmark==0.2.4
```

### ✅ 方案 2：先安装 middleware

先安装 middleware 的正确版本，再安装其他包：

```bash
pip install isage-middleware==0.2.3
pip install isage-libs isage-benchmark
```

### ✅ 方案 3：使用约束文件

创建 `constraints.txt`:

```txt
isage-middleware>=0.2.3
transformers>=4.52.0,<4.54.0
```

然后安装：

```bash
pip install isage-libs isage-benchmark -c constraints.txt
```

## 验证安装

安装后验证 transformers 版本：

```bash
pip show transformers | grep Version
# 应该输出: Version: 4.52.x 或 4.53.x（在 4.52.0-4.54.0 范围内）
```

验证各包版本：

```bash
pip list | grep isage
# 应该输出:
# isage-libs           0.2.0.6
# isage-middleware     0.2.3    (不是 0.1.5.1)
# isage-benchmark      0.2.4
```

## 长期解决方案

我们已经在 `sage-benchmark` 仓库提交 issue，要求更新依赖声明为：

```toml
dependencies = [
    "isage-middleware>=0.2.3",  # 强制使用修复后的版本
]
```

## 相关链接

- sage-benchmark 独立仓库：https://github.com/intellistream/sage-benchmark
- 依赖规范文档：[package-architecture.md](../dev-notes/package-architecture.md)

## 更新日期

- 2026-01-04：发布 `isage-middleware 0.2.3` 修复依赖冲突
- 待更新：`sage-benchmark` 仓库更新依赖要求
