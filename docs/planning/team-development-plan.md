# NTU Freshman AI Copilot：团队开发方案

> 状态：Draft v0.1，待团队讨论  
> 更新日期：2026-09-11  
> 面向对象：项目组全体成员  
> 文档用途：确认 MVP、技术架构、任务方向、协作方式与验收标准

## 1. 项目简介

NTU 新生在接受 Offer、办理入学和适应校园生活时，需要面对大量分散的信息、网页、Portal 和截止日期。

我们计划开发一个面向 NTU 新生的 AI Copilot，帮助用户快速理解：

- 要做什么；
- 什么时候做；
- 去哪里办理或获取服务；
- 信息来自哪个官方来源。

产品不是“知道 NTU 一切信息的万能聊天机器人”，而是一个聚焦新生 onboarding、校园资源和开学初期生活的可信 AI 助手。

## 2. 当前阶段目标

第一阶段优先完成一个简单、稳定、完整、可演示的 MVP。

核心目标：

1. 跑通 Chat → Main Agent → Tool → Result → Final Answer 的完整链路；
2. 展示可信来源，而不只给出模型生成的答案；
3. 对地点问题返回结构化地点数据，并与二维地图联动；
4. 建立统一 Tool 协议，使不同成员可以并行开发；
5. 建立可信度检查与基础评测机制。

额外目标：

- 在核心目标完成后，由感兴趣的成员继续探索 3D 校园地图；
- 探索完整自主 Roadmap Agent，为不同类型的新生生成更加个性化的入学规划。

额外目标不影响 MVP 的完成与验收，是否实现取决于成员兴趣、时间和核心功能的完成情况。

暂不追求：

- 自动登录 NTU Portal；
- 自动替用户提交表格；
- 全站大规模爬虫；
- 生产级账户系统；
- Multi-Agent 系统；
- Fine-tuning 或本地大型模型。

## 3. MVP 的三条完整 Demo 路径

以下是建议的三条 Demo，具体问题可以由团队共同调整。

### Demo 1：新生事务查询

示例问题：

> What should I complete before orientation?

预期流程：

```text
User Question
→ Main Agent 选择 Onboarding Tool
→ Tool 检索或读取已整理的 NTU 信息
→ 可信度检查
→ 返回清晰答案和官方来源
```

最低展示结果：

- 简洁回答；
- 任务或步骤；
- NTU 官方来源标题与链接；
- 信息更新时间或检索时间。

### Demo 2：校园地点查询与地图联动

示例问题：

> Where can I eat near North Spine?

预期流程：

```text
User Question
→ Main Agent 选择 Food / Location Tool
→ Tool 返回回答、来源和结构化地点
→ Context Panel 显示二维地图 Marker
```

最低展示结果：

- Chat 中的地点建议；
- 多个地图 Marker；
- 点击 Marker 查看名称、类别、简介和来源；
- 坐标来自可信数据，不由 LLM 猜测。

### Demo 3：最新信息与可信度核验

示例问题：

> What are the latest official updates for new students?

预期流程：

```text
User Question
→ Main Agent 选择 Latest Updates Tool
→ Tool 获取候选信息
→ Trust Validator 检查来源、时间和冲突
→ 返回已核验内容或明确提示需要人工确认
```

最低展示结果：

- 区分官方来源与非官方来源；
- 显示发布时间或检索时间；
- 对过期、缺少证据或互相冲突的信息给出提示；
- 无可靠信息时明确回答“不确定”，不补写不存在的结论。

## 4. Roadmap 与 3D Map 的定位

### Personalized Roadmap

Roadmap 有较高产品价值，但完整版本涉及 Profile、规则、数据、状态管理和前端展示，工作量明显高于单个 Tool。

因此建议：

- 不作为某位成员必须独立完成的核心任务；
- 由感兴趣的成员自愿探索；
- MVP 如有余力，只做 Plan Lite：模板 + Profile 规则 → Checklist；
- 完整 Roadmap Engine 放入后续增强计划。

### 3D Campus Map

3D Map 涉及建模、素材处理、网页性能与交互开发，不纳入第一版 MVP。

MVP 先使用 Leaflet + OpenStreetMap 完成二维地图、Marker 和 Chat 联动。3D Map 作为后续可选增强方向，由感兴趣的成员认领。

## 5. 推荐系统架构

项目采用一个 Main Agent 加多个模块化 Tools，不为每个方向分别搭建独立 Agent。

```text
┌─────────────────────────────────────────────┐
│                  Frontend                   │
│ Chat + Tool Status + Context Panel          │
│ Sources / 2D Map / Optional Plan Lite       │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│              Next.js API Route              │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│           Main Agent: ToolLoopAgent         │
│      Model → Tool Call → Result → Model     │
└──────────────────────┬──────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
 Onboarding Tool   Location Tool   Academic Tool ...
       │               │               │
       └───────────────┼───────────────┘
                       ▼
┌─────────────────────────────────────────────┐
│        Trust Validator + Evaluation         │
│ Source / Freshness / Conflict / Coordinate  │
└──────────────────────┬──────────────────────┘
                       ▼
           Structured Result + Evidence
```

### 推荐技术栈

- Frontend：Next.js + React + TypeScript；
- Agent：Vercel AI SDK `ToolLoopAgent`；
- Tool Schema：Zod；
- Backend：MVP 先使用 Next.js API Route；
- Map：Leaflet + OpenStreetMap；
- Stable Knowledge：经过整理的 Markdown / JSON；
- Fresh Information：受控的 NTU 官方网页检索；
- Test：Vitest，必要时增加 Playwright；
- Model：通过环境变量配置，不在代码中写死；
- Deployment：待团队确认。

如果后续的数据清洗或检索明显依赖 Python，再增加独立 Python 服务。MVP 不提前拆分微服务。

## 6. 现有 Codebase 的使用方式

Vercel AI SDK 参考 codebase 位于：

```text
/Users/wenxuanyuan/NTU PhD/GP Course/Vercel-AI-SDK
```

其中的 Agent 循环、Tool 定义、流式响应和 React UI 接入方式都很适合本项目。

特别值得复用的是 `examples/next-agent` 中的最小闭环：

```text
Agent Definition
→ Typed Tool
→ API Route
→ useChat
→ Tool-specific UI Component
```

建议采用它的架构与 API，但不直接维护完整 AI SDK 源码。正式产品只需要一个干净的 Next.js 应用，并通过依赖使用：

- `ai`；
- `@ai-sdk/react`；
- 对应的模型 Provider；
- `zod`。

仓库处理方式已经确认：

- `Vercel-AI-SDK` 只作为只读参考，不在其中开发产品功能；
- 从 `examples/next-agent` 提炼最小闭环；
- 在 `NTU-Freshment-Copilot` 中建立独立、干净的产品仓库；
- 产品通过正式依赖使用 Vercel AI SDK，不复制整个 monorepo；
- 产品 GitHub remote 需另行确认，不复用参考 fork 的 remote。

不建议直接修改 `packages/ai` 的底层实现来开发 NTU 业务功能。

## 7. Main Agent 与 Tool Loop

Main Agent 的工作方式：

1. 接收用户问题；
2. 根据 Tool 的名称、说明和输入 Schema 选择 Tool；
3. 执行 Tool；
4. 将 Tool Result 加回上下文；
5. 再次调用模型；
6. 模型不再请求 Tool，或达到停止条件时结束。

MVP 建议设置 4–6 步的最大循环次数，避免无意义循环、成本失控和响应时间过长。

Main Agent 负责选择能力，不负责凭空制造事实。事实、链接和坐标必须来自 Tool Result。

## 8. 统一 Tool Protocol

所有 Tool 使用统一输出结构，便于 Agent、前端和可信度检查器共同处理。

```json
{
  "content": "Tool 返回的事实性内容",
  "sources": [
    {
      "id": "source-1",
      "title": "NTU Official Source",
      "url": "https://www.ntu.edu.sg/...",
      "publisher": "Nanyang Technological University",
      "published_at": null,
      "retrieved_at": "2026-09-11T00:00:00Z",
      "official": true
    }
  ],
  "locations": [],
  "verification": {
    "status": "verified",
    "checks": ["official_source", "url_present", "freshness_checked"],
    "reviewed_at": "2026-09-11T00:00:00Z"
  }
}
```

每个 Tool 至少需要说明：

- 名称；
- 用途；
- 输入 Schema；
- 输出 Schema；
- 使用的数据来源；
- 适用范围；
- 失败时的返回方式；
- 基础测试问题。

## 9. Location Protocol

地点类 Tool 在统一结果的 `locations` 字段中返回：

```json
{
  "id": "north-spine-food-court",
  "name": "North Spine Food Court",
  "category": "Dining",
  "description": "Food options near North Spine.",
  "address": "NTU, Singapore",
  "latitude": 1.000000,
  "longitude": 103.000000,
  "opening_hours": null,
  "source_id": "source-1",
  "coordinate_status": "verified"
}
```

基本规则：

- 经纬度不能由 LLM 猜测；
- 地点必须关联来源；
- 不确定的坐标标记为 `needs_review`，不直接进入正式 Demo 数据；
- 原始地图资料和清洗过程放在上层工作区；
- Git 仓库只放运行需要的精简地点数据和 Schema。

## 10. Trust Validator 与可信度规则

可信度检查是所有 Tool 共用的后台机制，不应只依赖模型判断，也不应由 Main Agent 决定是否调用。

### 最低检查规则

1. **来源检查**：事实性回答必须包含来源；
2. **官方性检查**：优先使用 NTU 官方域名和官方文件；
3. **链接检查**：链接必须存在、格式正确，并与内容相关；
4. **时间检查**：保存发布时间或检索时间，识别可能过期的信息；
5. **冲突检查**：多个来源冲突时，不自动选择其中一个作为事实；
6. **坐标检查**：地点坐标必须来自可信来源或人工核验；
7. **缺失检查**：缺少证据时明确标记 `needs_review`；
8. **引用约束**：最终回答只能引用 Tool 实际返回的来源。

### 实现原则

- 确定性规则负责基础审核；
- 可选的小型 Verifier Agent 负责发现语义冲突或可疑陈述；
- Verifier Agent 不能凭自身知识把内容直接标记为真实；
- 低可信内容应降级展示、提示用户或进入人工检查列表。

## 11. 六人任务方向

以下为六个可认领方向，不预先绑定成员姓名。成员根据兴趣和能力选择主要方向，也可以提出调整或组合方案。

| 方向 | 核心职责 | 最低可交付版本 | 可选扩展 |
| --- | --- | --- | --- |
| A. System Integration | Frontend、API、Main Agent、Tool Protocol、整体集成 | 跑通一个 Mock Tool 和来源展示 | 会话持久化、流式状态、完整 Context Panel |
| B. Freshman / Onboarding | Matriculation、Account、Orientation、常见流程 | 一个符合协议的 Tool、官方来源和测试问题 | 检索、更多 Profile、自动更新 |
| C. Student Services / Campus Life | Counselling、Wellbeing、CCA、校园服务 | 一个符合协议的 Tool、来源和测试问题 | 服务分类、相关推荐、地点联动 |
| D. Food / Location | Dining、Cafe、Canteen、地点数据 | Food Tool、可信坐标、二维 Marker | 距离筛选、营业时间、更多地点类别 |
| E. Academic / Latest Updates | Library、Academic Resources、School Updates | Academic 或 Updates Tool、来源和时间信息 | 受控网页检索、更新订阅、学院细分 |
| F. Trust & Evaluation | 来源、时效、冲突、坐标、Benchmark | 基础 Validator、测试集和核验报告 | 语义核验 Agent、自动回归测试、质量面板 |

### 分工原则

- 成员先表达兴趣，再确认方向；
- 每个方向只约定最低交付，不限制成员继续深入；
- 每位成员最好承担一个主要方向和一个测试或内容协作职责；
- 可以跨方向合作，但必须遵守统一 Tool Protocol；
- Roadmap 和 3D Map 是公开的自愿探索项；
- 系统集成人负责协议和合并，不代表包办所有功能。

## 12. 最低验收标准

### Agent

- 能根据问题选择正确 Tool；
- Tool Result 能回到模型并生成最终回答；
- 达到停止条件后正常结束；
- Tool 失败时能向用户说明，不伪造结果。

### Sources

- 事实性回答包含可访问的来源链接；
- 来源标题、URL 和发布者一致；
- 最新信息包含时间信息；
- 无可靠来源时明确说明。

### Map

- 能显示多个 Marker；
- Marker 与 Chat 返回地点一致；
- Marker 详情包含来源；
- Demo 坐标已核验。

### Team Integration

- 所有 Tool 使用统一输入输出协议；
- 每个方向至少提供基础测试问题；
- 合并前完成类型检查和相关测试；
- `main` 分支保持可运行；
- API Key、Token 和密码不进入 Git。

## 13. 推荐开发顺序

### Phase 0：团队确认

- 确认目标用户和 MVP；
- 确认三条 Demo；
- 执行并验收干净产品仓库迁移；
- 成员填写任务兴趣；
- 确认模型、部署和数据来源。

### Phase 1：最小骨架

```text
Frontend
→ API Route
→ Main Agent
→ Mock Tool
→ Answer + Sources
```

### Phase 2：并行 Tool 开发

- 各方向根据统一协议独立开发；
- Trust & Evaluation 同时建立基础测试；
- Integration 保持 Mock 与真实 Tool 都能运行。

### Phase 3：二维地图与可信度联动

- Location Tool 返回结构化地点；
- Frontend 渲染 Marker；
- Validator 检查来源和坐标。

### Phase 4：集成与 Demo

- 跑通三条完整 Demo；
- 修复 Tool 选择、来源、地图和异常处理问题；
- 准备展示脚本与备用 Demo 数据。

### Phase 5：可选增强

- Plan Lite / Personalized Roadmap；
- 3D Campus Map；
- 更复杂的 RAG；
- 更多学院和信息类别。

具体日期在课程截止时间和成员可用时间确认后填写。

## 14. 工作区与 Git 仓库边界

上层工作区：

```text
/Users/wenxuanyuan/NTU PhD/GP Course
```

用于团队规划、会议记录、研究、原始数据、地图清洗和 Demo 素材。

正式代码目录：

```text
/Users/wenxuanyuan/NTU PhD/GP Course/NTU-Freshment-Copilot
```

只保留需要版本控制和团队协作的核心代码、测试、Schema、精简数据和技术文档。

只读参考仓库：

```text
/Users/wenxuanyuan/NTU PhD/GP Course/Vercel-AI-SDK
```

当前本地产品目录已确定为 `NTU-Freshment-Copilot`。如果未来要把 `Freshment` 修正为 `Freshman`，仍需在连接远程仓库前单独确认。

## 15. 成员兴趣收集

这张表用于了解每位成员感兴趣的方向、想实现的内容和合作偏好，不直接作为强制分工结果。

可选方向：

- A. System Integration；
- B. Freshman / Onboarding；
- C. Student Services / Campus Life；
- D. Food / Location；
- E. Academic / Latest Updates；
- F. Trust & Evaluation；
- 额外方向：Plan Lite / Personalized Roadmap；
- 额外方向：3D Campus Map。

| 组员 | 第一兴趣方向 | 备选兴趣方向 | 想实现的功能或思路 | 期望难度 | 合作偏好 |
| --- | --- | --- | --- | --- | --- |
| Member 1 |  |  |  |  |  |
| Member 2 |  |  |  |  |  |
| Member 3 |  |  |  |  |  |
| Member 4 |  |  |  |  |  |
| Member 5 |  |  |  |  |  |
| Member 6 |  |  |  |  |  |

填写与分工原则：

- 每位成员选择一个第一兴趣方向，并可填写一个或多个备选方向；
- `期望难度` 可以填写“基础版本”“标准版本”或“挑战版本”；
- 多人选择同一方向时，可以合作、拆分子功能，或探索不同实现思路；
- 无人选择的核心方向可以缩小范围、与相近方向合并，或由团队共同完成最低版本；
- 兴趣收集完成后，再通过团队讨论确认最终负责人和模块边界。

写入 Notion 时，本节将转换为可编辑的内联数据库表格，方便成员自行填写和汇总。

## 16. 待团队讨论的问题

- [ ] MVP 的主要目标用户是谁？
- [ ] 是否确认三条 Demo 路径？
- [ ] 是否采用 Next.js + Vercel AI SDK 的技术方案？
- [x] 仓库整理方式：保留 `Vercel-AI-SDK` 为只读参考，迁移到干净产品仓库。
- [ ] 使用哪个模型 Provider，预算是多少？
- [ ] Stable Knowledge 第一版覆盖哪些主题？
- [ ] Latest Updates 允许检索哪些官方域名？
- [ ] 六位成员分别对哪些任务方向感兴趣？
- [ ] 是否有人愿意探索 Plan Lite？
- [ ] 是否有人愿意在核心任务完成后探索 3D Map？
- [ ] 项目部署位置和课程截止时间是什么？

## 17. 团队确认后的立即行动

1. 汇总成员兴趣并确认主要负责人；
2. 执行并验收干净产品仓库迁移；
3. 在正式产品仓库内创建专用 `AGENTS.md`；
4. 跑通 Main Agent + Mock Tool + Sources；
5. 冻结 Tool、Source、Location 和 Verification Schema；
6. 创建第一批测试问题；
7. 各模块进入并行开发。

---

本方案是团队讨论草案，不代表最终强制分工。任何成员都可以提出替代功能、调整难度或组合任务；只要最终能够接入统一系统，并满足最低验收标准即可。
