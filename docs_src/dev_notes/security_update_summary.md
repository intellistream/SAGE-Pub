# API Key 安全加固总结

## 目标

- 移除仓库中的明文 API key
- 统一使用 `.env` / 环境变量
- 更新 CI/CD 以使用 GitHub Secrets
- 增补 vLLM、本地搜索等所需变量

## 工作内容

### 配置文件

- `examples/config/new_adaptive.yaml`、`multiagent_config.yaml` 中的真实 key 移除
- `examples/config/config*.yaml` 等 15 个文件清理 `token-abc123`
- 所有 `api_key` 字段置空，由代码从环境变量读取

### 代码更新

- `packages/sage-libs/src/sage/libs/rag/generator.py`
  ```python
  api_key = (
      self.config["api_key"]
      or os.getenv("OPENAI_API_KEY")
      or os.getenv("ALIBABA_API_KEY")
  )
  ```
- `examples/service/pipeline_as_service/qa_pipeline_as_service.py` 允许 `api_key=""`

### 环境变量模板

- `.env` / `.env.template` 增加：
  - `OPENAI_BASE_URL`
  - `OPENAI_MODEL_NAME`
  - `VLLM_API_KEY` / `VLLM_BASE_URL`
  - `WEB_SEARCH_API_KEY`

### CI/CD

- `.github/workflows/ci.yml` & `dev-ci.yml` 新增“从 Secrets 生成 .env”步骤

### 文档与脚本

- [API Key 安全配置指南](../security/api_key_security.md)
- [配置清理报告](config_cleanup_report.md)
- [CI/CD 环境变量配置](../ci_cd/cicd_env_setup.md)
- `tools/maintenance/check_config_security.sh`

## 验证

```bash
cd examples/config
# 确认无明文 key
grep -E 'sk-|token-abc123' *.yaml
# 输出为空 ✔

./tools/maintenance/check_config_security.sh
# 输出：✅ 安全检查通过
```

## 后续建议

1. 立即撤销历史提交中的真实 API key
2. 确保 `.env` 不被提交并定期轮换密钥
3. 对 CI/CD Secrets 进行定期审计

> 更新时间：2025-10-01
