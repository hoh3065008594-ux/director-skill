# V7 — 导播台版（ComfyUI_Theodore_Director）

> V7 = V6 分段参考生视频 + UP主自制自定义节点 **导播台（Theodore Director）**。
> 开源仓库：https://github.com/northern-penguin/ComfyUI_Theodore_Director（Apache-2.0，内测阶段）
> 版权：抖音 Theodore（抖音号 q1503623946）与 B站UP 南极来の企鹅。
> 社区网盘 demo 工作流中的提示词是照抄 v5 的，**并非完全正确、仅供参考**；本目录为仓库正式版（空模板计划，12 个占位分镜，提示词需自行填写）。

## 文件

| 文件 | 用途 |
|---|---|
| `Impact_V6_单采_Theodore导播台.json` | 单采成片（常规推荐）；仓库原名 `Impact_V6_Single_Theodore_Director.json` |
| `Impact_V6_双采_Theodore导播台.json` | 双采（RTX 1.5× 超分 + 二次采样）高清版；仓库原名 `Impact_V6_Dual_Theodore_Director.json` |

## 安装节点（必装，否则工作流缺节点）

```bash
cd D:\ComfyUI-H3\custom_nodes
git clone https://github.com/northern-penguin/ComfyUI_Theodore_Director.git
```

或下载官方网盘压缩包解压后放入 `custom_nodes\ComfyUI_Theodore_Director\`。要求 ComfyUI ≥ 0.31.x（本机 0.33.1 ✅）、Python 3.10+；重启 H3 实例后生效。依赖插件（Impact Pack / H3-Motion-Context / MiniMax-H3-Turbo / KJNodes / Easy-Use / RTX Video Nodes）与本机 V6 共用，均已装。后处理合并视频需 FFmpeg（本机 PATH 已有）。

## 模型修补（重要）

官方仓库工作流默认引用 `minimax_h3_ref2va_pruned_fp8_scaled.safetensors`；本机装的是 `minimax_h3_ref2va_pruned_int8_convrot.safetensors`（int8 变体，V6 实测跑通），**本目录两个文件已统一改为 int8_convrot**。换机器时若用 fp8 模型请自行改回 UNETLoader 的模型名。

## 与 V6 的核心区别

1. 提示词/素材/时长不再逐段填节点，全部收进 `TheodoreDirector_Project` 的 plan_json，用**可视化导播台**编辑（节点上点"打开 Theodore 导播台"）或脚本改 JSON。
2. 素材库用**别名**管理：提示词写 `{{ref:别名}}`，执行时编译成 `<Picture N>/<Video N>/<Audio N>`；素材可超过 H3 单次容量（每镜按需激活）。
3. 每镜独立时长，自动吸附 `17n+5` 帧网格；`latentRelay`（接力）、`secondSampling`（二采）逐镜开关。
4. 自带**续跑**（resume 模式按 plan/shot hash 跳过已完成分镜）与完成后自动接力下一段（CommitResult → ImpactQueueTrigger）。
5. 输出在 `output/TheodoreDirector/<项目名>_<RunID>/`，支持导播台内后处理 **FFmpeg 无损合并**成片。

完整用法见 `references/h3-segmented/theodore-director-v7.md` 与 SKILL.md 2b 章节。
