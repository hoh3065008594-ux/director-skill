# MiniMax H3 B-roll Generator Skill

[![Release](https://img.shields.io/github/v/release/guangjun5952/minimax-h3-broll-generator)](https://github.com/guangjun5952/minimax-h3-broll-generator/releases)
[![Validate](https://github.com/guangjun5952/minimax-h3-broll-generator/actions/workflows/validate.yml/badge.svg)](https://github.com/guangjun5952/minimax-h3-broll-generator/actions/workflows/validate.yml)

一套面向知识类口播视频的 Codex Skill：既可以接收逐字稿，也可以接收口播视频并自动转写带时间戳的逐字稿；随后判断哪些段落需要 B-roll、匹配 21 种包装模板、识别缺失素材、生成可审片的 MiniMax-H3 提示词，并在明确批准后生成视频、按时间戳自动回填剪辑并输出成片。

项目内置三种提示词版本。每次调用时，Skill 会先询问使用哪一版，再开始拆解口播和生成审片计划。

> MiniMax-H3 的生成式中文排版仍然可能出现错字。Skill 会限制文字负载并要求审片，但品牌名、法律文字、引用、证据、复杂图表和必须逐字准确的内容，仍建议用 Hyperframes、AE 或其他确定性工具合成。

![逐帧分析模板](assets/gallery/01-frame-analysis.png)

## 能做什么

- 按语义拆解中文口播稿，而不是机械按标点切句。
- 可选上传口播视频，使用 Whisper 后端生成带时间戳逐字稿。
- 在 `A-roll`、真实证据、已有素材、Hyperframes、H3 文字包装和 H3 纯画面之间自动路由。
- 从 T01–T21 中选择最合适的模板。
- 主动识别需要的 Logo、产品素材、UI 录屏、论文、截图、人物、地图和技术数据。
- 对每个 H3 镜头生成包含排版、文字白名单、材质、景深、运镜曲线、时间阶段和转场锚点的提示词。
- 生成 `broll-plan.json` 与 `broll-review.md`，先审片，再付费生成。
- 支持文生视频、首帧图生视频，以及参考视频/音频的多模态生视频。
- 支持 MiniMax 官方接口及兼容 `/v2/video_generation` 的代理服务，例如秘塔 AI。
- 串行提交任务、轮询状态、下载成片并保留 `generation-manifest.json`。
- H3 镜头强制禁用背景音乐，只允许同步拟音和环境音。
- 自动按照逐字稿时间戳将 B-roll 回填到口播视频，保留原口播声音并输出 `edit-manifest.json`。

## 三种提示词版本

| 版本 | 定位 | 文字预算 | 动效密度 | 推荐场景 |
|---|---|---:|---:|---|
| v1 简洁清晰 | 准确率优先 | 1 组、最多 12 字符 | 低 | 标题、结论、品牌周边、低返工需求 |
| v2 丰富动效 | 表现力优先 | 最多 3 组、28 字符 | 高 | 空间展示、复杂流程、模型能力演示 |
| v3 平衡清晰 | 综合推荐 | 最多 2 组、18 字符 | 中 | 大多数知识类口播包装 |

三档都使用相同的 T01–T21 模板路由、素材真实性规则和付费审批门禁；区别只在提示词的阶段、元素、文字、运镜、景深和噪声预算。

新计划使用 schema `1.6`，并在顶层记录提示词版本、输入方式、声音策略和剪辑策略：

```json
"prompt_profile": "v3_balanced"
```

完整差异见 [prompt-versions.md](skill/references/prompt-versions.md)。

## v3 为什么更稳定

- 每镜只表达一个核心语义。
- 3–4 个连续阶段，累计 4–7 个有效元素，但同屏最多两组辅助信息。
- 文字优先一组、最多两组；建议不超过 12 个汉字，硬限制 18 个可见字符。
- 文字出现与阅读时最多保留两层低速运动。
- 文字正对镜头、高对比稳定至少 1.5 秒。
- 最多一个主运镜和一次回稳，只使用一种强调色。
- 超出可靠文字负载时自动拆镜、改为无字 H3 底片，或转到确定性工具。

## 画面示例

| 低多边形对话 | 数字/模板数量 | 文字材质 |
|---|---|---|
| ![](assets/gallery/02-low-poly-dialogue.png) | ![](assets/gallery/03-template-count.png) | ![](assets/gallery/04-text-fidelity.png) |

| 问题卡片 | 三维视差舞台 | 逐帧分析 |
|---|---|---|
| ![](assets/gallery/05-problem-cards.png) | ![](assets/gallery/06-parallax-stage.png) | ![](assets/gallery/01-frame-analysis.png) |

## 21 种模板

| 编号 | 模板 | 适合表达 |
|---|---|---|
| T01 | Kinetic Statement | 结论、反转、金句 |
| T02 | Concept Hero | 核心概念与单一隐喻 |
| T03 | Number Impact | 已核实数字、比例、排名 |
| T04 | Evidence Excerpt | 论文、文章、报告重点 |
| T05 | Relation Flow | 2–3 步流程、因果、关系 |
| T06 | Character Feedback | 用户、角色、反馈、案例 |
| T07 | Chapter Sequence | 章节、阶段、步骤概览 |
| T08 | Overlay to Fullscreen | 口播叠加转全屏接管 |
| T09 | 3D Parallax Stage | 空间层次、核心观点、主体英雄镜头 |
| T10 | Keyword Strips | 口播上的重点词纸条 |
| T11 | Audience Overlap Spotlight | 多条件交集、用户筛选 |
| T12 | White Diorama System | 组织、系统、工作流程 |
| T13 | Low-poly Dialogue | 对话、谈判、观点交锋 |
| T14 | Split System Comparison | 新旧、开放封闭、双边关系 |
| T15 | Evidence Desk Parallax | 多份证据、来源链路 |
| T16 | Biography Archive to Blueprint | 人物档案到系统遗产 |
| T17 | 3D Product Assembly | 模块、零件、产品组装 |
| T18 | Geospatial Intelligence Map | 地点、供应链、全球网络 |
| T19 | Technology Evolution Timeline | 产品代际、技术演进 |
| T20 | Branching Taxonomy Network | 能力树、分类、技术栈 |
| T21 | Technical Mechanism Explainer | 信号、能量、协议、产品原理 |

完整调用条件、构图、字体、动效和素材要求见 [docs/templates.md](docs/templates.md)。

## 安装

```bash
git clone https://github.com/guangjun5952/minimax-h3-broll-generator.git
cd minimax-h3-broll-generator
./install.sh
```

默认安装到：

```text
~/.codex/skills/minimax-broll-generator
```

也可以指定目录：

```bash
./install.sh /path/to/skills/minimax-broll-generator
```

## API 配置

API Key 只从环境变量读取，不能写进计划、提示词或源码。

MiniMax 官方接口：

```bash
export MINIMAX_API_KEY="your-api-key"
export MINIMAX_API_BASE="https://api.minimaxi.com"
export MINIMAX_VIDEO_MODEL="MiniMax-H3"
```

秘塔 AI 兼容接口：

```bash
export MINIMAX_API_KEY="your-metaso-key"
export MINIMAX_API_BASE="https://metaso.cn/api/minimax"
export MINIMAX_VIDEO_MODEL="MiniMax-H3"
```

建议通过系统钥匙串、密码管理器或 CI Secret 注入环境变量，不要把 Key 提交到 Git。

## 使用流程

在 Codex 中调用：

```text
使用 $minimax-broll-generator 分析以下口播，匹配模板并生成审片单：
<你的逐字稿>
```

Skill 会先询问：`v1 简洁清晰、v2 丰富动效，还是 v3 平衡清晰（推荐）？` 选择后才会输出计划和缺失素材，不会直接消费 API。用户明确批准镜头后才允许生成。

也可以直接提供口播视频：

```text
使用 $minimax-broll-generator 分析这个口播视频，生成带时间戳逐字稿，匹配模板；我批准后生成 B-roll 并自动剪辑输出成片：
/absolute/path/talking-head.mp4
```

本地转写支持 CPU 可运行的 `openai-whisper`，并兼容 `faster-whisper` 和 `mlx-whisper`；第一次使用模型时可能需要下载模型文件：

```bash
bash skill/scripts/setup_transcription.sh

python3 skill/scripts/transcribe_video.py talking-head.mp4 \
  --output timestamped-transcript.json \
  --language zh --backend auto
```

手动校验计划：

```bash
python3 skill/scripts/plan_tool.py validate broll-plan.json
python3 skill/scripts/plan_tool.py review broll-plan.json --output broll-review.md
```

查看实际请求但不联网、不付费：

```bash
python3 skill/scripts/minimax_h3.py broll-plan.json \
  --output-dir generated-broll \
  --dry-run
```

明确批准后生成：

```bash
python3 skill/scripts/plan_tool.py approve broll-plan.json \
  --shots B001,B003 \
  --confirmation CONFIRM_MINIMAX_H3_COST

python3 skill/scripts/minimax_h3.py broll-plan.json \
  --output-dir generated-broll \
  --approved
```

生成并审片通过后，自动回填剪辑：

```bash
python3 skill/scripts/assemble_edit.py broll-plan.json \
  --source talking-head.mp4 \
  --generated-dir generated-broll \
  --output final-cut.mp4 \
  --generated-audio sfx_only
```

自动剪辑始终保留原口播声音。H3 音频只允许动作拟音和环境音，并按较低音量混入；如果某条生成结果出现音乐，使用 `--generated-audio mute` 将生成音轨完全静音。

## 安全门禁

一次真实生成必须同时满足：

1. 用户在当前对话明确批准具体镜头或全部镜头。
2. 计划和镜头状态均为 `approved`。
3. 命令显式包含 `--approved`。
4. 所有关联的必需素材已经提供或明确豁免。

## 项目结构

```text
.
├── skill/                   # 可直接安装的 Codex Skill
│   ├── SKILL.md
│   ├── agents/
│   ├── references/
│   └── scripts/
├── assets/gallery/          # 项目说明配图
├── docs/templates.md        # T01–T21 完整模板目录
├── scripts/validate.sh      # 本地/CI 校验
├── .github/workflows/       # GitHub Actions
├── install.sh
└── LICENSE
```

## 验证

```bash
./scripts/validate.sh
```

## 许可证

[MIT License](LICENSE)。示例图仅用于展示本项目生成与设计方法，请勿单独打包转售。
