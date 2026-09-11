# NTU Freshman AI Copilot：干净产品仓库迁移任务

> 文档类型：一次性 Codex CLI 执行说明  
> 状态：Ready for execution  
> 更新日期：2026-09-11

## 1. 执行目标

以 Vercel AI SDK 仓库为只读参考，直接在最终产品目录中建立独立、轻量、可运行的 NTU Freshman AI Copilot。

目标闭环：

~~~text
install
→ start development server
→ open Chat UI
→ Main ToolLoopAgent calls one Mock Tool
→ render Answer + Source + Verification
~~~

本任务只执行 Phase 0–5。不要修改任何 Git remote，不要推送代码，不要删除参考仓库，也不要执行 Phase 6。

## 2. 唯一路径定义

Workspace：

~~~text
/Users/wenxuanyuan/NTU PhD/GP Course
~~~

只读参考仓库：

~~~text
/Users/wenxuanyuan/NTU PhD/GP Course/Vercel-AI-SDK
~~~

最终产品仓库，也是本次迁移目标：

~~~text
/Users/wenxuanyuan/NTU PhD/GP Course/NTU-Freshment-Copilot
~~~

迁移前，产品目录应只包含以下三份种子文档：

~~~text
repo_AGENTS_draft.md
repo_migration_plan.md
team_development_plan.md
~~~

不要再创建 NTU-Freshment-Copilot-clean 或其他平行产品目录。

## 3. 已观察状态

执行时必须重新核验，不要假设以下信息仍然有效。

2026-09-11 观察到：

- 参考仓库 branch：main；
- 参考仓库 commit：4d1bf28a385bd32438793ddbb9ee7431fdfe40ea；
- 参考仓库 working tree：clean；
- 参考仓库 remote： https://github.com/Wenxuan52/NTU-Freshment-Copilot.git ；
- 该 remote 属于旧 Vercel AI SDK fork 状态，不是新的产品 remote；
- 参考仓库是完整的 Vercel AI SDK monorepo；
- examples/next-agent 提供 Agent、Tool、API Route 与 React UI 的最小参考；
- 当前检查环境中 node 不在 PATH，Codex CLI 执行时需要重新确认。

优先参考：

~~~text
examples/next-agent/agent/weather-agent.ts
examples/next-agent/tool/weather-tool.ts
examples/next-agent/app/api/chat/route.ts
examples/next-agent/app/page.tsx
examples/next-agent/component/chat-input.tsx
examples/next-agent/component/weather-view.tsx
examples/next-agent/package.json
packages/ai/src/agent/tool-loop-agent.ts
~~~

## 4. 已锁定决策

迁移必须遵守：

1. 产品代码只写入 NTU-Freshment-Copilot；
2. Vercel-AI-SDK 全程只读；
3. 产品通过依赖使用 Vercel AI SDK，不复制 packages/ai 或 Provider 内部实现；
4. 使用一个 Main ToolLoopAgent 加模块化 Tools；
5. 使用 Next.js App Router、React、TypeScript、Zod 与 pnpm；
6. MVP 后端使用 Next.js API Route；
7. Agent 最大循环步数设置为 4–6；
8. Tool 统一返回 Source、Location 与 Verification 数据；
9. 所有事实性 Tool 结果经过确定性 Trust Validator；
10. 第一轮只实现 Mock vertical slice，不实现完整真实 Tool、Roadmap 或地图；
11. 单元测试不得调用真实模型或外部网络；
12. 产品目录名称本轮保持 NTU-Freshment-Copilot，不做拼写修正。

## 5. 本轮未授权事项

不要自行决定或执行：

- 修改或删除 Vercel-AI-SDK；
- 修改参考仓库 remote；
- 将参考仓库旧 remote 添加给产品仓库；
- 创建产品 GitHub repository；
- 推送、force-push 或重写远程历史；
- 把 Freshment 改为 Freshman；
- 选择最终生产模型、Provider 或部署平台；
- 将 Roadmap、3D Map 或 Multi-Agent 放入第一轮迁移。

## 6. 安全边界

- 将 Vercel-AI-SDK 视为只读。
- 不要在参考仓库中编辑、生成、安装或格式化文件。
- 不要复制 .git、.env、credential、node_modules、缓存、构建产物或整个 monorepo。
- 不要运行 git reset --hard、git clean、递归删除或 force-push。
- 不要删除产品目录中的三份种子文档。
- 如果产品目录在迁移前包含三份种子文档以外的未知内容，先停止并报告。
- 如果参考仓库 working tree 不干净，先停止并报告变更路径。
- 如果 Node.js 或 pnpm 不可用，先报告缺失条件；不要使用 sudo，也不要擅自改变系统运行时。
- 安装依赖需要网络或额外权限时，按 Codex CLI 的正常审批流程请求，不要绕过权限。
- 验证阶段不得进行真实模型调用。
- 不得写入 API key、Token、密码或私人资料。

## 7. Phase 0 — Preflight

先运行只读检查：

~~~bash
pwd
git -C "/Users/wenxuanyuan/NTU PhD/GP Course/Vercel-AI-SDK" status --short --branch
git -C "/Users/wenxuanyuan/NTU PhD/GP Course/Vercel-AI-SDK" remote -v
git -C "/Users/wenxuanyuan/NTU PhD/GP Course/Vercel-AI-SDK" rev-parse HEAD
find "/Users/wenxuanyuan/NTU PhD/GP Course/NTU-Freshment-Copilot" -maxdepth 1 -mindepth 1 -print
command -v node
command -v pnpm
~~~

同时确认：

- 三份种子文档可读；
- 参考文件存在；
- 产品目录中没有 .git；
- 产品目录没有未知文件；
- 本地磁盘空间足够。

只有全部安全假设成立后才进入 Phase 1。

## 8. Phase 1 — 初始化最终产品仓库

仅在以下目录操作：

~~~text
/Users/wenxuanyuan/NTU PhD/GP Course/NTU-Freshment-Copilot
~~~

要求：

- 在此目录初始化独立 Git repository，默认分支为 main；
- 建立 standalone Next.js App Router 应用；
- 启用 TypeScript strict mode；
- 使用 pnpm，并生成 pnpm-lock.yaml；
- 使用 src/ 目录；
- 将 repo_AGENTS_draft.md 的内容复制为仓库根目录 AGENTS.md；
- 创建简洁的产品 README.md；
- 创建无秘密值的 .env.example；
- 创建保护性 .gitignore；
- 如改编上游示例代码，创建 THIRD_PARTY_NOTICES.md 并保留来源说明；
- 不引入 Turborepo、Changesets、SDK Provider packages、SDK CI 或发布自动化。

参考快照中的兼容版本：

~~~text
Node.js: 22.13+ compatible
pnpm: 11.23.0
Next.js: 15.5.21
React: 18.3.1
TypeScript: 5.8.3
ai: 7.0.97
@ai-sdk/react: 4.0.100
@ai-sdk/openai: 4.0.65
zod: 3.25.76
~~~

优先固定与参考快照兼容的版本。如果某个精确版本不可获得，不要静默替换不兼容的大版本；记录差异并选择有依据的兼容组合。

## 9. Phase 2 — 最小产品结构

只创建包含真实文件的目录：

~~~text
src/
├── app/
│   ├── api/chat/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── agent/
│   ├── instructions.ts
│   └── main-agent.ts
├── components/
│   ├── chat/chat-input.tsx
│   ├── context-panel/context-panel.tsx
│   └── sources/source-list.tsx
├── config/
│   ├── ai.ts
│   └── env.ts
├── contracts/
│   ├── location.ts
│   ├── source.ts
│   ├── tool-result.ts
│   └── verification.ts
├── tools/
│   ├── mock/mock-ntu-info-tool.ts
│   └── registry.ts
└── trust/
    ├── official-domains.ts
    └── validator.ts
evals/
tests/
docs/
~~~

如果 evals/ 或 tests/ 没有真实内容，不要建立空目录；应添加实际 fixture 或测试。

## 10. Phase 3 — Mock Vertical Slice

### Main Agent

- 实例化一个 ToolLoopAgent；
- 通过 src/config/ai.ts 读取模型配置；
- 要求 OPENAI_MODEL，不在代码中写死示例模型；
- 从 src/tools/registry.ts 注册 Tools；
- stop condition 不超过六步；
- 指示 Agent 只使用 Tool 返回的来源与地点回答事实性问题。

### Mock Tool

实现一个明确标注的 NTU 信息 Mock Tool：

- 接收小型、经过 Zod 验证的查询对象；
- 返回统一 ToolResult；
- 包含可见 Source；
- 第一版 locations 返回空数组；
- 结果经过 Trust Validator；
- 不访问网络；
- 合成内容不得冒充已核验 NTU 政策；
- 未人工核验的内容必须为 needs_review。

### Trust Validator

确定性检查至少覆盖：

- 缺少来源；
- URL 格式错误；
- 非 http/https 协议；
- NTU 精确域名或安全子域名匹配；
- 缺少 retrieved_at；
- 经纬度超界；
- 坐标未核验。

必须加入回归测试，证明 ntu.edu.sg.evil.example 会被拒绝。

### API

- 添加 POST chat route；
- 使用 AI SDK 的 Agent UI stream helper；
- 验证请求结构；
- Provider 调用只在服务端；
- 返回安全错误；
- 在框架允许时支持取消与有界执行。

### Frontend

实现最小双栏：

~~~text
Chat | Context Panel
~~~

首个切片必须显示：

- 用户与助手文本；
- Tool 执行状态；
- Mock Tool 结果；
- 来源标题与链接；
- verification 状态或警告；
- Map / Sources 的 Context Panel 占位。

本轮不实现 3D Map 或完整 Roadmap。

## 11. Phase 4 — 配置与文档

.env.example 只包含空值：

~~~text
OPENAI_API_KEY=
OPENAI_MODEL=
~~~

README 至少说明：

- 产品目的与 MVP 范围；
- 前置环境；
- 安装、开发、测试与构建命令；
- 环境变量；
- 目录结构；
- 如何添加 Tool；
- 当前限制；
- Team Plan 的位置；
- 上游示例代码归属。

在 docs/decisions/ 中建立初始 ADR，说明：

- 为什么使用干净产品仓库；
- 为什么 Vercel AI SDK 作为依赖；
- 为什么使用一个 Main Agent 加模块化 Tools；
- 为什么不保留完整 SDK monorepo。

## 12. Phase 5 — 测试、整理与验收

提供脚本：

~~~bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm test:run
~~~

依次执行：

~~~bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test:run
pnpm build
~~~

自动化覆盖：

- Source schema 接受合法来源并拒绝非法 URL；
- ToolResult 必须包含明确 verification；
- Trust Validator 拒绝缺少来源；
- Trust Validator 拒绝欺骗性 NTU 相似域名；
- Location schema 拒绝超范围坐标；
- Mock Tool 返回符合协议的结果；
- 测试不依赖 API key 或网络。

如果运行环境可用，启动开发服务器并做浏览器 smoke test，但不得发起真实模型调用。

验收完成后整理种子文档：

~~~text
docs/planning/team-development-plan.md
docs/planning/repository-agents-draft.md
docs/planning/repo-migration-plan.md
~~~

对应来源：

~~~text
team_development_plan.md
repo_AGENTS_draft.md
repo_migration_plan.md
~~~

先确认根目录 AGENTS.md 已正确生成，再移动以上三份种子文档。不得丢失内容。

如 Git 用户身份已配置且所有必需检查通过，可创建一个本地 baseline commit；否则保留变更并在报告中说明。无论如何都不得添加 remote 或推送。

## 13. 完成标准

只有满足以下条件才可报告迁移完成：

- NTU-Freshment-Copilot 已成为独立产品 Git repository；
- 分支为 main；
- Vercel-AI-SDK 的状态、commit 与 remote 均未改变；
- 根目录 AGENTS.md 与仓库规范草案一致；
- Mock Tool vertical slice 已实现；
- install、typecheck、lint、tests 与 build 全部通过，或准确记录外部阻塞；
- 规划文档已进入 docs/planning/；
- 不含秘密值、原始大数据或 SDK monorepo 内容；
- 产品仓库没有 remote；
- 没有代码被推送。

## 14. 最终报告格式

完成后报告：

1. 参考仓库迁移前后状态与 commit；
2. 产品仓库路径、branch 与 remote 状态；
3. 创建后的精简文件树；
4. 实际使用的 package 版本；
5. 执行过的命令及结果；
6. 测试与 browser smoke-test 结果；
7. 是否创建本地 baseline commit；
8. 与本计划的偏差；
9. 阻塞与待用户确认事项；
10. 下一步建议。

不得把跳过的 build 或测试报告为成功。

## 15. Phase 6 — 远程连接，仅在另行授权后执行

本轮不要执行 Phase 6。

后续必须由项目负责人单独确认：

- 产品 GitHub repository URL；
- 是否修正 Freshment 拼写；
- 是否创建并推送 baseline commit；
- 参考 fork 的保留或归档方式。

不得隐式复用参考仓库 remote，不得删除参考仓库，不得 force-push。

## 16. 交给 Codex CLI 的一行 Prompt

~~~text
请完整阅读并执行 "/Users/wenxuanyuan/NTU PhD/GP Course/NTU-Freshment-Copilot/repo_migration_plan.md" 的 Phase 0–5，在 "/Users/wenxuanyuan/NTU PhD/GP Course/NTU-Freshment-Copilot" 内完成干净产品仓库迁移、测试与构建；将 "/Users/wenxuanyuan/NTU PhD/GP Course/Vercel-AI-SDK" 仅作为只读参考，不执行 Phase 6，不修改任何 remote，不推送代码，遇到明确阻塞时报告。
~~~
