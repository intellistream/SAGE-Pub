# 根目录清理总结（Issue #876）

## 概述

- 目标：整理文档与测试文件，提升根目录可读性
- 日期：2025-10-02
- 成果：文档分类、测试归档、日志存档

## 文档迁移

| 原路径 | 新路径 |
|--------|--------|
| `AUTOSTOP_MODE_SUPPORT.md` 等开发文档 | `docs-public/docs_src/dev_notes/` |
| 安全文档 (`API_KEY_SECURITY.md`) | `docs-public/docs_src/security/` |
| CI/CD 文档 | `docs-public/docs_src/ci_cd/` |

## 测试迁移

| 原路径 | 新路径 |
|--------|--------|
| `test_autostop_api_verification.py` 等 | `packages/sage-kernel/tests/integration/services/` |
| `test_qa_service.py` | `packages/sage-libs/tests/integration/` |

## 归档

- `docs/archived/install.log`

## 保留在根目录的文件

- `README.md`
- `LICENSE`
- `CONTRIBUTING.md`
- `quickstart.sh`
- `pytest.ini`
- `submodule-versions.json`

## 清理原则

1. 文档分类：用户文档 → `docs-public/`，内部记录 → `dev_notes/`
2. 测试归位：按 package 与层级划分
3. 根目录保持关键入口与配置
4. 目录提供 `README` 说明

## 建议后续工作

- 在贡献指南中补充项目结构说明
- 为 PR 追加模板

> 相关文档：
> - [配置清理报告](config_cleanup_report.md)
> - [安全更新摘要](security_update_summary.md)
> - [CI/CD 文档](../ci_cd/README.md)
