# 欢迎新同学 ✨

Hello，欢迎加入 IntelliStream · SAGE 项目组！这份指南汇总了第一周需要完成的事项、常用资源和日常协作守则，帮助你快速融入团队节奏。

---

## 1. 第一周待办清单

- [ ] 克隆仓库并完成 [SAGE 快速上手](quick_start.md)
- [ ] 运行 `sage doctor`、`python examples/tutorials/hello_world.py`
- [ ] 在 `.env` 中填好常用 API Key（至少 `OPENAI_API_KEY`）
- [ ] 加入 Slack `#sage-dev`、QQ群、微信群（见 [COMMUNITY.md](../COMMUNITY.md)）
- [ ] 阅读 `CONTRIBUTING.md` 与 `docs/dev-notes/README.md`
- [ ] 更新本页面的「新人登记表」（联系 mentor 认领）
- [ ] 首次周会上完成自我介绍

> 若遇到环境问题，请在 Slack/微信群 @mentor 或在 GitHub Discussion 发帖，方便后续留档。

---

## 2. 协作与沟通

| 渠道 | 用途 | 频率 |
| --- | --- | --- |
| Slack `#sage-dev` | 日常讨论、代码问题、PR 广播 | 日常 |
| QQ 群（IntelliStream 讨论群） | 快速群聊、临时会议通知 | 日常 |
| 微信群（SAGE 项目） | 现场沟通、临时协调 | 日常 |
| Trello / 飞书看板（若适用） | 任务分派与里程碑追踪 | 按项目 |

常用资料：

- 周会文档： [腾讯文档 · 组会 & 个人汇报 PPT](https://docs.qq.com/slide/DSEZKSUV5ZEdCT1Fi)
- 研究路线地图：`docs/dev-notes/COMPLETE_SUMMARY.md`
- 组件知识库：`docs/dev-notes/*` & `packages/` 下的源码

---

## 3. 周报与周会

- **周报提交**：每周日 23:00 前在腾讯文档填写「本周进展 / 下周计划 / Blockers」。
- **周会安排**：查看 [周会排班工具](weekly_meeting.md)，如需调班请提前与协调人沟通。
- **汇报模板建议**：
		1. 目标回顾（G）
		2. 关键成果（K）
		3. 下周计划（N）
		4. 风险/需求（R）

PPT 推荐包含：背景问题、实验或系统截图、下一步 TODO。若有代码 Demo，可附上仓库分支或笔记本链接。

---

## 4. 代码与文档习惯

1. **分支命名**：`feature/<topic>`、`fix/<issue>`，保持描述简洁。
2. **提交规范**：遵循 `fix(pkg): message`、`feat(core): ...`，具体见 `CONTRIBUTING.md`。
3. **PR 检查项**：
		- 通过 `ruff`, `mypy`, `pytest`（至少子集）
		- 添加/更新对应文档或示例
		- 描述问题背景、修改点、测试方式、影响面
4. **文档更新**：使用 `docs-public/docs_src`，保持中英文一致性；若引用代码片段，请确保路径在 `docs_dir` 可访问。

---

## 5. Mentor & 专题小组

| 名称 | 方向 | Mentor | 资源 |
| --- | --- | --- | --- |
| NeuroMem | 统一记忆层、向量库 | （请根据当期导师更新） | docs/dev-notes、packages/sage-middleware |
| Flow Scheduler | 执行调度、Ray 集群管理 | （请根据当期导师更新） | packages/sage-kernel、tools/cli |
| RAG/Agent | 应用层、工具链 | （请根据当期导师更新） | examples/rag、examples/agents |

> 请与导师确认加入的专题小组；如果暂未确定，可以先旁听感兴趣的讨论，或在周会上提出想尝试的方向。

---

## 6. 常见问题速查 (FAQ)

- **环境装好了但是 `sage` 命令不可用？**
	请确认当前 Shell 已激活 `conda activate sage_dev`，并且 `$PATH` 中包含 `packages/sage-tools` 的可执行入口。

- **运行示例缺少模型？**
	检查 `.env` 中的 API Key，并在首次运行前执行 `sage config env load` 或重新打开终端。

- **不确定任务优先级？**
	与 Mentor 沟通，或在 Slack `#planning`（若有）频道查询周计划。

- **需要服务器权限？**
	向管理员提交账号信息；首次登录后请在 `~/.ssh/config` 中配置别名以便后续使用。

---

我们期待与你一起构建下一代的大模型基础设施。如果你在任何环节遇到困难，请大胆发问 —— “Ask early, ask often” 是 SAGE 的文化之一。欢迎加入！
