# Fix: libstdc++ CI 检查问题 (#869)

## 问题

在 `./quickstart.sh --dev --pip --yes`（CI 环境）执行时，脚本尝试安装 conda 的 `libstdcxx` 并输出警告：

```
⚠️ libstdc++ 检查未通过，继续尝试构建扩展
```

原因：`libstdcxx_fix.sh` 未区分安装环境，在 pip/system 环境中仍执行 conda 相关检查。

## 解决方案

### 1. `libstdcxx_fix.sh`

- `ensure_libstdcxx_compatibility()` 新增参数 `install_environment`
- 当环境为 `pip` 或 `system` 时直接跳过检查：
  ```bash
  if [ "$install_environment" = "pip" ] || [ "$install_environment" = "system" ]; then
      echo "使用 ${install_environment} 环境，跳过 libstdc++ 检查（依赖系统库）"
      return 0
  fi
  ```

### 2. `main_installer.sh`

- 在 `standard`/`dev` 模式调用中传入 `$environment`：
  ```bash
  ensure_libstdcxx_compatibility "$log_file" "$environment"
  ```

## 验证

| 场景 | 命令 | 期待行为 |
|------|------|----------|
| CI (pip) | `./quickstart.sh --dev --pip --yes` | 输出“跳过检查”且不再尝试安装 conda 包 |
| Conda | `./quickstart.sh --dev --conda --yes` | 仍执行原检查逻辑 |
| System | `./quickstart.sh --dev --system --yes` | 与 pip 同样跳过检查 |

## 提交摘要

```
fix: skip libstdc++ check in pip/system environments (#869)
```

影响文件：
- `tools/install/fixes/libstdcxx_fix.sh`
- `tools/install/installation_table/main_installer.sh`

好处：
- 消除 CI 误导日志
- 避免不必要的 conda 操作
- 保持 conda 安装行为不变
