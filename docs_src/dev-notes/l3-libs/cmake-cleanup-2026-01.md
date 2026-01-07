# sage-libs CMakeLists.txt 清理总结

## 问题
原始的 `CMakeLists.txt` 要求 `find_package(pybind11)`，但实际上 sage-libs 已经是一个纯 Python 包，不需要编译任何 C++ 扩展。

## 根本原因
1. **LibAMM 已独立**：LibAMM (Approximate Matrix Multiplication) 已经迁移到独立的 PyPI 包 `isage-amms`
2. **ANNS 已独立**：ANNS (Approximate Nearest Neighbor Search) 算法也已迁移到 `isage-anns`
3. **历史遗留代码**：CMakeLists.txt 中保留了大量 LibAMM 编译逻辑（200+ 行），但 `src/sage/libs/libamm` 目录已不存在

## 解决方案
完全重写 `CMakeLists.txt`，移除所有 C++ 扩展相关代码：

### 删除的内容
- ❌ `find_package(pybind11)` 及其自动检测逻辑
- ❌ 整个 LibAMM 编译分支（~200 行）
- ❌ PyTorch 检测和自动安装逻辑
- ❌ CUDA 版本检测
- ❌ pybind11 版本信息显示

### 保留的内容
- ✅ Python 包查找
- ✅ 基本的 CMake 编译设置（为将来可能的扩展保留）
- ✅ Python 源文件安装逻辑（通过 `install(DIRECTORY ...)`）
- ✅ Editable 模式检测

### 新增的内容
- ℹ️ 清晰的状态消息，说明 sage-libs 是纯 Python 包
- ℹ️ 指向独立 C++ 扩展包的说明（isage-anns, isage-amms）

## 文件大小对比
- **之前**: 314 行（包含大量 LibAMM 编译逻辑）
- **之后**: 96 行（简洁的纯 Python 包配置）

## 验证
构建测试成功：
```bash
cd packages/sage-libs
python -m build --no-isolation --wheel
```

输出：
```
Successfully built isage_libs-0.2.0.7-py3-none-linux_x86_64.whl
```

## 备份
原始文件已备份到：`CMakeLists.txt.backup`

## 结论
sage-libs 现在是一个干净的**纯 Python 包**，不再需要 pybind11 或任何 C++ 编译工具链。所有 C++ 扩展已迁移到独立的 PyPI 包。
