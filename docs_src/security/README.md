# 安全文档

本目录包含 SAGE 项目的安全实践和配置相关文档。

## 内容

- [API Key 安全配置指南](api_key_security.md) - API 密钥管理和安全配置的完整指南

## 安全最佳实践

1. **永远不要提交敏感信息到代码仓库**
   - API keys
   - 密码
   - 访问令牌
   - 数据库凭证

2. **使用环境变量**
   - 本地开发使用 `.env` 文件（确保 `.env` 在 `.gitignore` 中）
   - CI/CD 环境使用 GitHub Secrets
   - 生产环境使用安全的密钥管理服务

3. **遵循最小权限原则**
   - 只授予必要的 API 权限
   - 设置合理的使用限额
   - 定期审查和更新权限

4. **定期轮换密钥**
   - 定期更新 API keys
   - 立即撤销泄露或不再使用的密钥
   - 保留密钥轮换记录

5. **代码审查**
   - 提交前检查是否包含敏感信息
   - 使用自动化工具扫描敏感数据
   - 团队成员互相审查代码

## 相关文档

- [配置指南](../kernel/config/config.md)
- [开发者模式安装](../get_start/developer.md)
- [CI/CD 配置说明](../../docs/ci-cd/) (在主仓库 docs/ 目录下)

## 报告安全问题

如果您发现了安全漏洞，请通过以下方式报告：

1. **不要**在公开的 GitHub Issues 中报告安全漏洞
2. 发送邮件至项目维护者（邮箱地址请查看 [README](../../README.md)）
3. 包含详细的漏洞描述和复现步骤
4. 我们会在 48 小时内响应

## 安全更新

项目的安全更新和修复记录可以在以下位置查看：

- [安全更新摘要](../../docs/dev-notes/SECURITY_UPDATE_SUMMARY.md)
- [GitHub Security Advisories](https://github.com/intellistream/SAGE/security/advisories)
