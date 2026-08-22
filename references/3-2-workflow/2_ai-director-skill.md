# AI Director Skill

AI Director Skill 是一个面向 AI 短片创作的可复用 Codex Skill。

它能够将剧本、世界观、风格参考和用户提供的分镜，转换为完整的 AI 图片与视频 Prompt 包。

它不是一个简单的 Prompt Generator。

它更像是一个「导演层（Director Layer）」。

AI Director Skill is a reusable Codex skill for AI short-film creation. It turns scripts, story worlds, style references, and user-provided storyboards into a complete AI image and video prompt package.

It is not a simple prompt generator. It works like a director layer:


## 工作流程
项目输入
↓
Story Function Analysis（故事功能分析）
↓
Storyboard Continuity Engine（分镜连续性引擎）
↓
Style Translation（风格翻译）
↓
Character / World / Style Lock（一致性锁定）
↓
Standard Shot Cards（标准镜头卡）
↓
Prompt Generator（Prompt生成）
↓
Image Prompts（图片Prompt）
↓
Video Prompts（视频Prompt）
↓
Prompt QA（质量检查）
↓
AI短片 Prompt 包

```text
Project input
-> Story Function Analysis
-> Storyboard Continuity Engine
-> Style Translation
-> Character / World / Style Lock
-> Standard Shot Cards
-> Prompt Generator
-> Image Prompts
-> Video Prompts
-> Prompt QA
-> AI Short-Film Prompt Package
```

## 功能介绍

AI Director Skill 可以：

分析每个镜头在故事中的叙事功能
检查人物、空间、时间、道具的连续性
将抽象风格参考翻译为可执行视觉语言
在 Prompt 生成前锁定角色、世界观和风格一致性
根据用户提供的分镜生成标准镜头卡
生成中英文图片 Prompt
生成中英文视频 Prompt
将 Character Lock、World Lock、Style Lock 自动注入 Prompt
输出 Prompt Source Trace（来源追踪）
执行 Prompt QA（质量检查）

## What It Does

- Analyzes the story function of every shot.
- Maintains spatial, action, prop, character, and time continuity across storyboard shots.
- Translates abstract style references into executable visual language.
- Locks character, world, and style consistency before prompt generation.
- Generates standard shot cards from user-provided storyboards.
- Generates Chinese and English image prompts.
- Generates Chinese and English video prompts.
- Injects Character Lock, World Lock, and Style Lock into prompt bodies.
- Adds Prompt Source Trace for auditability.
- Runs Prompt QA to catch continuity, style, and generation risks.

## 不负责什么

AI Director Skill 不负责：

管理图片素材库
视频剪辑
Obsidian 数据管理
替代项目文件管理
强制复制 Skill 到每个项目

## What It Does Not Do

- It does not manage image assets or project databases.
- It does not edit video.
- It does not replace your Obsidian project files.
- It does not require copying the skill into every project.

## 安装

点绿色按钮 Code
选择 Download ZIP
解压到本地

将 Skill 文件夹放入 Codex Skills 目录：

C:\Users\<你的用户名>\.codex\skills\ai-director

目录结构应如下：

ai-director/

├── SKILL.md
├── agents/
└── references/

如果你使用 Git 管理项目，也可以通过软链接（symlink）或本地引用方式接入。

## Installation

Copy the skill folder into your Codex skills directory:

```text
C:\Users\<your-user>\.codex\skills\ai-director
```

The installed folder should contain:

```text
ai-director/
  SKILL.md
  agents/
  references/
```

If you keep this repository checked out elsewhere, copy or symlink the `ai-director` project folder into the Codex skills directory according to your local workflow.

## 快速开始

直接调用：

Use $ai-director

我要制作一个AI短片。

项目路径：

<你的项目路径>

请读取：

- 剧本
- 人设
- 世界观
- 风格参考
- 分镜

生成完整《AI短片 Prompt 包》

或者直接粘贴内容：

Use $ai-director

下面是我的故事背景、风格参考和分镜。

请生成完整《AI短片 Prompt 包》。

## Quick Start

Use a direct invocation:

```text
Use $ai-director. 我要制作一个AI短片。
项目文件在：<你的 Obsidian 项目路径>
请读取剧本、人设、世界观、风格参考和分镜，生成完整《AI短片 Prompt 包》。
```

Or paste your material directly:

```text
Use $ai-director. 下面是我的故事背景、风格参考和分镜，请生成完整《AI短片 Prompt 包》。
```

## 推荐项目结构（Obsidian）
AI短片项目/

└── 闲庭几度秋/

    ├── 00_project-overview.md
    ├── 01_story-background.md
    ├── 02_characters.md
    ├── 03_world.md
    ├── 04_style-reference.md
    ├── 05_storyboard.md

    └── assets/
    
## Recommended Obsidian Project Layout

```text
AI短片项目/
  闲庭几度秋/
    00_project-overview.md
    01_story-background.md
    02_characters.md
    03_world.md
    04_style-reference.md
    05_storyboard.md
    assets/
```

See [`docs/obsidian-workflow.md`](docs/obsidian-workflow.md) and [`examples/project-template/`](examples/project-template/) for a reusable template.

## 输出内容

Skill 最终会输出一份完整的：

《AI短片 Prompt 包》

包含：

项目概览
故事与风格分析
分镜连续性报告
Character Lock
World Lock
Style Lock
标准镜头卡
图片 Prompt 包
视频 Prompt 包
QA 质量报告

## Output

The final output is an `AI短片 Prompt 包` containing:

1. Project overview
2. Story and style analysis
3. Storyboard Continuity Report
4. Character Lock, World Lock, Style Lock
5. Standard shot cards
6. Image prompt package
7. Video prompt package
8. QA report

See [`docs/prompt-package-format.md`](docs/prompt-package-format.md) for the full output structure.

## 核心模块

Skill 由多个独立模块组成：

references/

├── input-schema.md
├── story-function-analysis.md
├── storyboard-continuity.md
├── style-translation.md
├── consistency-lock.md
├── shot-card.md
├── prompt-generator.md
├── image-prompt.md
├── video-prompt.md
├── prompt-qa.md
└── output-package.md

## Core Modules

The skill logic is split into small reference modules:

- [`references/input-schema.md`](references/input-schema.md)
- [`references/story-function-analysis.md`](references/story-function-analysis.md)
- [`references/storyboard-continuity.md`](references/storyboard-continuity.md)
- [`references/style-translation.md`](references/style-translation.md)
- [`references/consistency-lock.md`](references/consistency-lock.md)
- [`references/shot-card.md`](references/shot-card.md)
- [`references/prompt-generator.md`](references/prompt-generator.md)
- [`references/image-prompt.md`](references/image-prompt.md)
- [`references/video-prompt.md`](references/video-prompt.md)
- [`references/prompt-qa.md`](references/prompt-qa.md)
- [`references/output-package.md`](references/output-package.md)

For a higher-level explanation, read [`docs/module-overview.md`](docs/module-overview.md).

## Examples

- [`examples/iron-box-letter/`](examples/iron-box-letter/) is a minimal complete sample project.
- [`examples/project-template/`](examples/project-template/) is a blank project template for creators.

## Tests

Manual test cases are in [`tests/`](tests/):

- `minimal-test-case.md`
- `continuity-test-case.md`
- `lock-injection-test-case.md`

These are designed for forward-testing the skill behavior after edits.

## Repository Layout

```text
ai-director/
  SKILL.md
  agents/
  references/
  docs/
  examples/
  tests/
  README.md
  LICENSE
  CONTRIBUTING.md
  CHANGELOG.md
  .gitignore
```

## 开源协议

详见 LICENSE 文件。

## License

MIT License. See [`LICENSE`](LICENSE).


## 致谢

本项目在开发过程中参考了多个公开 Skill、Prompt Workflow 和 AI 视频创作流程。

感谢所有开源贡献者。
