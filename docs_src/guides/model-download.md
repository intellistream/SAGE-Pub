# 模型下载与管理

## 概述

SAGE 提供了强大的模型下载和管理功能，支持断点续传、自动重试和完整性验证。

## 核心特性

### ✅ 断点续传

SAGE 使用 `huggingface_hub` 的断点续传功能，即使下载中断也能从断点继续：

```bash
# 下载模型（支持断点续传）
sage llm model download --model Qwen/Qwen2.5-1.5B-Instruct

# 如果下载中断，再次执行相同命令会从断点继续
sage llm model download --model Qwen/Qwen2.5-1.5B-Instruct
```

**断点续传如何工作**：

1. **部分文件保留**：下载中断时，已下载的文件会保留在本地
2. **自动检测**：重新下载时，系统会检测已存在的文件
3. **跳过已完成**：已完整下载的文件会被跳过
4. **继续未完成**：只下载缺失或不完整的文件

### 🔄 自动重试

下载过程中遇到网络问题会自动重试（最多 3 次）：

```python
# 内部实现（自动）
max_retries = 3
for attempt in range(max_retries):
    try:
        download_model(...)
        break  # 成功
    except Exception:
        # 指数退避：1s, 2s, 4s
        time.sleep(2 ** attempt)
```

### 🔍 完整性验证

SAGE 会自动检测模型下载是否完整：

```bash
# 启动服务时自动检测
sage studio start

# 如果检测到不完整的模型，会提示：
# ⚠️  检测到模型 'Qwen/Qwen2.5-1.5B-Instruct' 下载不完整，正在重新下载...
```

**完整性检查标准**：

- ✅ 存在 `config.json`
- ✅ 存在至少一个权重文件（`*.safetensors` 或 `*.bin`）

### 🔨 强制重新下载

如果模型损坏或需要重新下载：

```bash
# 强制重新下载（清理现有文件）
sage llm model download --model Qwen/Qwen2.5-1.5B-Instruct --force
```

## 常见场景

### 场景 1: 首次下载

```bash
# 下载 1.5B 模型（约 3GB）
sage llm model download --model Qwen/Qwen2.5-1.5B-Instruct

# 输出示例：
# Downloading model: 100%|██████████| 3.0G/3.0G [02:30<00:00, 20MB/s]
# ✅ 下载完成
# 📁 路径: /home/user/.sage/models/vllm/Qwen__Qwen2.5-1.5B-Instruct
# 📦 大小: 3072.00 MB
```

### 场景 2: 下载中断后恢复

```bash
# 第一次下载（中断）
sage llm model download --model Qwen/Qwen2.5-7B-Instruct
# Downloading: 45%|████▌     | 6.3G/14G [05:00<06:00, 21MB/s]
# ^C (Ctrl+C 中断)

# 再次执行（从断点继续）
sage llm model download --model Qwen/Qwen2.5-7B-Instruct
# Downloading: 45%|████▌     | 6.3G/14G [00:01<05:00, 25MB/s]  # 从 45% 继续
```

### 场景 3: 网络不稳定自动重试

```bash
sage llm model download --model Qwen/Qwen2.5-1.5B-Instruct

# 输出示例（网络中断）：
# Downloading: 80%|████████  | 2.4G/3.0G [02:00<00:30, 20MB/s]
# ⚠️  下载中断，1秒后重试 (尝试 2/3)...
# Downloading: 80%|████████  | 2.4G/3.0G [00:01<00:30, 20MB/s]  # 自动重试
```

### 场景 4: 检测到不完整的模型

```bash
# 启动 Studio（检测到不完整模型）
sage studio start

# 输出：
# ⚠️  检测到模型 'Qwen/Qwen2.5-1.5B-Instruct' 下载不完整，正在重新下载...
# Downloading missing files...
# ✅ 模型已完整

# 或手动修复：
sage llm model download --model Qwen/Qwen2.5-1.5B-Instruct --force
```

## 高级选项

### 指定 Revision

```bash
# 下载特定版本
sage llm model download --model Qwen/Qwen2.5-1.5B-Instruct --revision main
```

### 隐藏进度条

```bash
# 批处理脚本中使用
sage llm model download --model Qwen/Qwen2.5-1.5B-Instruct --no-progress
```

### 列出已下载的模型

```bash
# 查看本地模型
sage llm model list

# 输出示例：
# ┌─────────────────────────────┬──────────┬────────────┐
# │ Model ID                    │ Size     │ Last Used  │
# ├─────────────────────────────┼──────────┼────────────┤
# │ Qwen/Qwen2.5-1.5B-Instruct  │ 3072 MB  │ 2026-01-02 │
# │ Qwen/Qwen2.5-0.5B-Instruct  │ 1024 MB  │ 2026-01-01 │
# └─────────────────────────────┴──────────┴────────────┘
```

### 删除模型

```bash
# 删除本地模型
sage llm model delete --model Qwen/Qwen2.5-0.5B-Instruct

# 或无需确认
sage llm model delete --model Qwen/Qwen2.5-0.5B-Instruct --yes
```

## 存储位置

模型默认存储在：

```bash
# XDG 标准位置
~/.sage/models/vllm/

# 或环境变量指定
export SAGE_LLM_MODEL_ROOT=/data/models
```

目录结构：

```
~/.sage/models/vllm/
├── Qwen__Qwen2.5-1.5B-Instruct/
│   ├── config.json
│   ├── model.safetensors
│   ├── tokenizer.json
│   └── ...
├── BAAI__bge-large-zh-v1.5/
│   └── ...
└── metadata.json  # 模型元数据清单
```

## 故障排查

### 下载速度慢

**问题**: 下载速度很慢（< 1MB/s）

**解决**:

```bash
# 中国大陆用户自动使用镜像
# SAGE 会自动检测网络并配置 HF_ENDPOINT=https://hf-mirror.com

# 手动设置镜像（如果自动检测失败）
export HF_ENDPOINT=https://hf-mirror.com
sage llm model download --model Qwen/Qwen2.5-1.5B-Instruct
```

### 下载一直失败

**问题**: 重试 3 次后仍然失败

**解决**:

```bash
# 1. 检查网络连接
curl -I https://huggingface.co

# 2. 清理并重新下载
sage llm model delete --model Qwen/Qwen2.5-1.5B-Instruct --yes
sage llm model download --model Qwen/Qwen2.5-1.5B-Instruct --force

# 3. 检查 HuggingFace Token（私有模型）
export HF_TOKEN=hf_xxxxxxxxxxxxx
sage llm model download --model meta-llama/Llama-2-7b-hf
```

### 模型文件损坏

**问题**: 模型下载完成但无法加载

**解决**:

```bash
# 强制重新下载
sage llm model download --model Qwen/Qwen2.5-1.5B-Instruct --force

# 或手动清理
rm -rf ~/.sage/models/vllm/Qwen__Qwen2.5-1.5B-Instruct
sage llm model download --model Qwen/Qwen2.5-1.5B-Instruct
```

### 磁盘空间不足

**问题**: 下载中途提示磁盘空间不足

**解决**:

```bash
# 清理不常用的模型
sage llm model list
sage llm model delete --model <unused-model> --yes

# 或更改存储位置
export SAGE_LLM_MODEL_ROOT=/data/models  # 更大的磁盘
sage llm model download --model Qwen/Qwen2.5-7B-Instruct
```

## 最佳实践

### 1. 预下载常用模型

在生产环境部署前预先下载模型：

```bash
# 下载常用模型列表
models=(
    "Qwen/Qwen2.5-1.5B-Instruct"
    "Qwen/Qwen2.5-7B-Instruct"
    "BAAI/bge-large-zh-v1.5"
)

for model in "${models[@]}"; do
    sage llm model download --model "$model" --no-progress
done
```

### 2. 使用 CI/CD 缓存

在 GitHub Actions 中缓存模型：

```yaml
- name: Cache models
  uses: actions/cache@v3
  with:
    path: ~/.sage/models
    key: sage-models-${{ hashFiles('config/models.json') }}
```

### 3. 监控磁盘使用

定期清理不使用的模型：

```bash
# 查看模型大小
sage llm model list

# 删除 30 天未使用的模型（示例脚本）
find ~/.sage/models/vllm -type d -mtime +30 -exec sage llm model delete --model {} --yes \;
```

### 4. 网络优化

配置下载加速：

```bash
# 中国大陆用户
export HF_ENDPOINT=https://hf-mirror.com

# 使用代理（如果需要）
export https_proxy=http://proxy.example.com:8080
export http_proxy=http://proxy.example.com:8080
```

## API 参考

### Python API

```python
from sage.common.model_registry import vllm_registry

# 下载模型
info = vllm_registry.download_model(
    "Qwen/Qwen2.5-1.5B-Instruct",
    revision="main",
    force=False,  # 强制重新下载
    progress=True,  # 显示进度
)

# 确保模型可用（自动下载）
path = vllm_registry.ensure_model_available(
    "Qwen/Qwen2.5-1.5B-Instruct",
    auto_download=True,  # 不存在时自动下载
)

# 列出已下载的模型
models = vllm_registry.list_models()
for model in models:
    print(f"{model.model_id}: {model.size_mb:.2f} MB")

# 删除模型
vllm_registry.delete_model("Qwen/Qwen2.5-0.5B-Instruct")
```

## 相关文档

- [模型配置](./configuration.md#模型配置)
- [Studio 部署](./deployment/studio.md)
- [LLM 服务管理](./llm-services.md)
- [故障排查指南](./troubleshooting.md)
