# 配置文件 API Key 清理报告

## 摘要

- 已移除 `examples/config/*.yaml` 中所有明文 API key
- 统一改为通过 `.env` 读取，配置文件填空字符串
- 更新 `.env.template`，补充所需变量

## 清理范围

### 实际密钥（`sk-` 前缀）
- `new_adaptive.yaml`
- `multiagent_config.yaml`

涉及字段：`refiner.api_key`、`agent.api_key`、`search_api_key`、`question_bot.api_key` 等。

### 测试 token（`token-abc123`）
- `config.yaml`
- `config_adaptive.yaml`
- `config_agent_min.yaml`
- `config_batch.yaml`
- `config_bm25s.yaml`
- `config_dense_milvus.yaml`
- `config_enhanced.yaml`
- `config_evaluate.yaml`
- `config_for_qa.yaml`
- `config_mixed.yaml`
- `config_multiplex.yaml`
- `config_qa_chroma.yaml`
- `config_ray.yaml`
- `config_refiner.yaml`
- `config_rerank.yaml`
- `config_sparse_milvus.yaml`

### 环境变量格式统一
- `config_agent_min.yaml` 等文件中的 `api_key` 字段改为 `""`

## 代码支持

- `packages/sage-libs/src/sage/libs/rag/generator.py`：
  ```python
  api_key = (
      self.config["api_key"]
      or os.getenv("OPENAI_API_KEY")
      or os.getenv("ALIBABA_API_KEY")
  )
  ```
- `examples/service/.../qa_pipeline_as_service.py` 允许 `api_key=""`

## `.env` 模板

```bash
OPENAI_API_KEY=
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
OPENAI_MODEL_NAME=qwen-turbo-2025-02-11
ALIBABA_API_KEY=
WEB_SEARCH_API_KEY=
```

团队操作步骤：
1. `cp .env.template .env`
2. 填写真实密钥
3. `.env` 已在 `.gitignore` 中

## 验证命令

```bash
cd examples/config
# 检查是否还有明文 key
grep -E 'api_key.*sk-|search_api_key.*sk-' *.yaml
# 检查是否还有测试 token
grep -E 'token-abc123' *.yaml
```

## 最佳实践

- 不在仓库中存储密钥
- 使用 `.env`/环境变量管理敏感信息
- 根据环境设置不同 key，并定期轮换
- 通过 GitHub Secrets 支持 CI/CD（见 `ci_cd/cicd_env_setup.md`）

## 相关文档

- [API Key 安全配置指南](../security/api_key_security.md)
- [CI/CD 环境变量配置](../ci_cd/cicd_env_setup.md)
- `.env.template`

> 清理日期：2025-10-01，涉及 27 个配置文件
