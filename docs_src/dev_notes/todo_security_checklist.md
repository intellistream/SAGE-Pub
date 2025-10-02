# 安全加固待办清单

## 已完成 ✅

### 代码与配置
- [x] 清理 `examples/config/*.yaml` 明文 API key
- [x] 更新 `.env` / `.env.template`
- [x] `generator.py` 支持环境变量读取
- [x] `qa_pipeline_as_service.py` 允许 `api_key=""`
- [x] `ci.yml` / `dev-ci.yml` 生成 `.env`

### 文档与工具
- [x] [API Key 安全配置指南](../security/api_key_security.md)
- [x] [配置清理报告](config_cleanup_report.md)
- [x] [CI/CD 环境变量配置](../ci_cd/cicd_env_setup.md)
- [x] `.github/SECRETS_SETUP.md`
- [x] `tools/maintenance/check_config_security.sh`

### 测试
- [x] 运行安全检查脚本
- [x] QA Pipeline Service 运行验证

## 待执行 ⚠️

### 1. 撤销泄露的密钥
- [ ] DashScope：`sk-8298f15945af41988281d7348b008c96`
- [ ] DashScope：`sk-700a53a2a85344e09a82afa96ae072a8`
- [ ] Web Search：`sk-b21a67cf99d14ead9d1c5bf8c2eb90ef`
- [ ] Web Search：`sk-455d6a2c79464dd2959197477a908e53`

### 2. 配置 GitHub Secrets
- [ ] `OPENAI_API_KEY`
- [ ] `HF_TOKEN`
- [ ] `ALIBABA_API_KEY`
- [ ] `VLLM_API_KEY`
- [ ] `WEB_SEARCH_API_KEY`
- [ ] 其他可选密钥（如 `SILICONCLOUD_API_KEY`）

> 建议使用 GitHub CLI：
> ```bash
> gh secret set OPENAI_API_KEY -b "new-key"
> gh secret set HF_TOKEN -b "hf-..."
> ```

### 3. 更新本地 `.env`
- [ ] 复制 `.env.template`
- [ ] 填写新密钥
- [ ] 确认 `.env` 未被 git 追踪

### 4. 验证 CI/CD
- [ ] 提交测试 commit 触发 CI
- [ ] 检查日志中 `.env` 生成步骤
- [ ] 确认 pipeline 通过

### 5. 检查 git 历史（可选）
- [ ] 查找历史提交中的敏感信息
- [ ] 必要时使用 BFG 等工具清理

## 长期维护建议

- 建议每 90 天轮换密钥
- 按月检查 API 使用情况
- 定期运行 `check_config_security.sh`
- 在团队培训/文档中强调不可提交 `.env`

## 完成确认

| 项目 | 状态 | 日期 | 负责人 |
|------|------|------|--------|
| 泄露密钥撤销 | [ ] | | |
| Secrets 配置 | [ ] | | |
| `.env` 更新 | [ ] | | |
| CI/CD 验证 | [ ] | | |
| Git 历史检查 | [ ] | | |

> 完成后请更新日期与责任人，便于团队追踪。
