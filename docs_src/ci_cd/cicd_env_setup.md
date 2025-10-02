# GitHub CI/CD 环境变量配置指南

## 概述

SAGE 项目的 CI/CD 流程会通过 GitHub Secrets 创建 `.env` 文件，以便与本地开发环境保持一致并集中管理敏感信息。

## 需要配置的 GitHub Secrets

### 必需的 Secrets

| Secret 名称 | 用途 | 示例值 |
|-------------|------|--------|
| `OPENAI_API_KEY` | OpenAI/DashScope API 密钥 | `sk-xxx...` |
| `HF_TOKEN` | Hugging Face Token（用于模型下载） | `hf_xxx...` |

### 可选的 Secrets

| Secret 名称 | 用途 | 默认值 |
|-------------|------|--------|
| `ALIBABA_API_KEY` | 阿里云 DashScope API 密钥 | 空 |
| `SILICONCLOUD_API_KEY` | SiliconCloud API 密钥 | 空 |
| `JINA_API_KEY` | Jina AI API 密钥 | 空 |
| `VLLM_API_KEY` | 本地 vLLM 服务 token | `token-abc123` |
| `WEB_SEARCH_API_KEY` | Web 搜索服务 API 密钥 | 空 |

## CI/CD 工作流示例

### 1. CI Pipeline (`.github/workflows/ci.yml`)

```yaml
- name: Create .env File from Secrets
  run: |
    echo "🔐 从 GitHub Secrets 创建 .env 文件..."
    cat > .env << EOF
    OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}
    OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
    OPENAI_MODEL_NAME=qwen-turbo-2025-02-11
    
    HF_TOKEN=${{ secrets.HF_TOKEN }}
    HF_ENDPOINT=https://hf-mirror.com
    
    VLLM_API_KEY=${{ secrets.VLLM_API_KEY }}
    VLLM_BASE_URL=http://localhost:8000/v1
    VLLM_MODEL_NAME=meta-llama/Llama-2-13b-chat-hf
    
    SAGE_TEST_MODE=true
    SAGE_EXAMPLES_MODE=test
    EOF
```

### 2. Dev CI Pipeline (`.github/workflows/dev-ci.yml`)

与主分支流程相同，按需调整环境变量。

## 环境变量说明

### LLM 服务配置

```bash
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://...
OPENAI_MODEL_NAME=qwen-turbo-...
ALIBABA_API_KEY=sk-xxx
VLLM_API_KEY=token-abc123
VLLM_BASE_URL=http://localhost:8000/v1
VLLM_MODEL_NAME=meta-llama/...
```

### Hugging Face 配置

```bash
HF_TOKEN=hf_xxx
HF_ENDPOINT=https://hf-mirror.com
```

### CI/CD 专用配置

```bash
SAGE_DEBUG=false
SAGE_SKIP_CPP_EXTENSIONS=false
SAGE_LOG_LEVEL=INFO
SAGE_TEST_MODE=true
SAGE_EXAMPLES_MODE=test
```

## 配置 GitHub Secrets 的方式

### 方式一：Web 界面

1. 进入仓库 `Settings → Secrets and variables → Actions`
2. 点击 `New repository secret`
3. 输入名称和值后保存

### 方式二：GitHub CLI

```bash
# 设置单个 secret
gh secret set OPENAI_API_KEY -b "sk-xxx..."

# 批量设置（读取 .env 文件）
while IFS='=' read -r key value; do
  if [[ ! $key =~ ^#.* ]] && [[ -n $key ]]; then
    gh secret set "$key" -b "$value"
  fi
done < .env
```

## 安全最佳实践

- ✅ 定期轮换密钥：`gh secret set OPENAI_API_KEY -b "new-key"`
- ✅ 使用最小权限原则：为 CI/CD 创建专用 API key
- ✅ 监控使用情况：设置配额和告警
- ✅ 区分环境：生产与测试使用不同密钥
- ❌ 不要在日志中输出完整密钥，可用 `sed 's/=.*/=***/'` 处理
- ❌ 不要将 `.env` 提交到 git，使用 `.env.template`
- ❌ 不要在 PR 中暴露 secrets（Fork 的仓库默认无法访问 secrets）

## 本地开发 vs CI/CD

| 特性 | 本地开发 | CI/CD |
|------|-----------|-------|
| 配置来源 | `.env` 文件 | GitHub Secrets |
| 创建方式 | 手动复制 `.env.template` | Pipeline 自动生成 |
| 更新频率 | 按需更新 | 每次运行重新生成 |
| 版本控制 | `.env` 被忽略 | `.env` 临时文件 |
| 安全性 | 本地自行保护 | GitHub 加密存储 |

## 常见问题

### 无法找到 API key

- 确认 secrets 是否配置：`gh secret list`
- 检查名称是否正确（区分大小写）
- 在 CI 中调试 `.env`：
  ```yaml
  - name: Debug .env file
    run: |
      ls -la .env
      cat .env | sed 's/=.*/=***/'
  ```

### Secret 包含特殊字符

- 使用引号包裹
- 或者先 base64 编码：`echo "value" | base64 | gh secret set MY_SECRET`

### Fork 仓库 CI 失败

- 外部 PR 默认无法访问 secrets
- 可启用 mock 模式：`SAGE_TEST_MODE=true SAGE_EXAMPLES_MODE=test pytest`

## 相关文档

- [API Key 安全配置指南](../security/api_key_security.md)
- [.env.template](../../.env.template)
- [GitHub Secrets 官方文档](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

## 更新日志

- **2025-10-01**：初始版本，统一本地与 CI/CD 环境变量管理
