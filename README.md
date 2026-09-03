# Director Skill — AI 导演工作流（DSH / Windows 版）

> 私人仓库 · 仅自己使用与更新

AI 导演工作流 Skill：拍广告/短视频/宣传片/品牌片。从创意概念、分镜脚本、本地 ComfyUI/Z-Image 出图、**MiniMax H3 视频生成（分段 V7 导播台主流程 / V6 兼容）**、审片重拍定稿，到 HTML 动画成片与 Web Audio 配乐，全程单文件夹交付。

## 目录结构

```
director/
├── SKILL.md                  # 主 Skill（当前 v1.17.0）
├── references/
│   ├── 3-2-workflow/         # 3+2 导演工作流学习材料（超哥分镜导演 SD2.0 等）
│   ├── h3-prompt/            # H3 提示词规范（官方指南、prompt-builder、精通指南）
│   ├── h3-segmented/         # H3 分段长视频扩展（V6 手册 + V7 导播台手册 + 12 段 demo 提示词）
│   ├── cinema-dna/           # Cinema DNA 电影感镜头判断（1e 章节源材料：全文/完整规范/反 AI 补丁）
│   ├── zy-cinematic-realism/ # ZY 造梦师 38 导演四轴指纹库 + Scene Master 方法论（1e-2 章节源材料，CC BY-NC 4.0 精选整合）
│   └── review-panel/         # 审片页模板（serve_review.js + review.html + 搭建说明）
└── .gitignore
```

## 版本历史

| 版本 | 内容 |
|---|---|
| 1.5.2 | 单段 H3 r2v 手搓管线（minimax_h3_r2v_prompt_expand） |
| 1.6.0 | 引入 H3 分段参考生视频（Impact V6）作为长视频扩展（2c 章节） |
| **1.7.0** | **V6 分段替换为主流程**（2b 重写：单段/多段统一走 V6）；标准操作步骤 10 步；避坑清单 30–34；成片改 concat 无缝拼接；本机两段 Latent 衔接实测 |
| **1.9.0** | **融合 cinema-dna-21x9x3（v1.2.2）**：新增 1e 电影感镜头判断——关系压力构图/视线流量/受控随机/色彩命题/21:9 三联叙事/反 CG-AI 模板检查/可选片名+主题海报阶段；源材料入 `references/cinema-dna/`（全文+完整规范+反 AI 补丁） |
| **1.10.0** | **审片页模板入 skill**：`references/review-panel/`（serve_review.js + review.html + README）——文件夹式浏览（图片/视频/剧本大纲）、单击预览+提示词、Ctrl+单击选标准、定稿/撤销、重拍、4s 轮询、HTTP Range；§3 升级为三步搭建说明 |
| **1.11.0** | **1b 人物类硬性门槛**：出场景前必须先产出并确认角色三件套（整体母版/三视图/脸特写），以母版/三视图锚定人物一致性 |
| **1.12.0** | **30s 广告全流程实测沉淀**：避坑 36–41（双实例爆 RAM/HostBuffer-1455、H3 冷热加载 60min vs 42s、libass 中文路径、审片门禁、重跑产物递增、角色三件套）；§2b 新增 7 段 30.7s 实测 + 字幕时间轴算法 + 可复用模板路径 |
| **1.13.0** | **引入 V7 导播台（ComfyUI_Theodore_Director 开源节点）**：工作流入 `h3-segmented-workflow/workflows/7_V7/`（单采/双采，模型已补丁为 int8_convrot）；§2b 改为 V7 主流程 / V6 兼容路由；新增 `references/h3-segmented/theodore-director-v7.md` 手册（节点安装、plan_json 编辑、别名规范、H3 限制、续跑、后处理合并） |
| **1.14.0** | **角色资产生成实测沉淀**：新增 `references/character-assets.md`（身份锚点管线：高清正脸→素体分视角→换装；WD14 参考图配方、提示词身份块、三视图拆独立图、Z-Image 高清二采、InstantID 实测与 SD1.5/SDXL 家族坑）；§1b 补充实操；避坑 42–45 |
| **1.17.0** | **融合 zy-cinematic-realism v2.1.0（精选子集，CC BY-NC 4.0 个人整合·保留署名）**：新增 §1e-2 导演四轴视觉指纹 + Scene Master 锁——38 位导演四轴库（iconic 强制、删名可辨、禁抄电影画面）、风格/导演候选推荐规则（用户给场景未定调性时先给 2–4 候选+推荐位）、Z-Image 正向落地与 H3 视频「视觉语言锁定」双线路、Base Lock + Shot Delta / Prompt Doctor / One Variable Remix 方法论；源材料入 `references/zy-cinematic-realism/`（四模型编译器未内置）；SKILL.md.bak-1.16.1 留档 |

## 更新流程（重要）

每次用后把新教训/新功能更新进 skill，然后推送到本仓库：

```powershell
cd C:\Users\Administrator\.agents\skills\director

# 1. 查看改动
git status
git diff --stat

# 2. 提交（版本号建议同步递增：SKILL.md frontmatter 的 version 字段）
git add .
git commit -m "vX.Y.Z: <本次更新摘要>"

# 3. 推送
git push
```

> 自动推送脚本可选：`git add . && git commit -m "update $(Get-Date -Format 'yyyy-MM-dd HH:mm')" && git push`（慎用，避免垃圾提交）。

## 注意

- Skill 内包含**本机路径**（`D:\ComfyUI-H3`、`C:\Users\Administrator\ComfyUI`、`D:\download\ComfyUI_models` 等）与实测参数——私人仓库可接受，**勿公开**。
- 第三方资料（MiniMax 官方提示词指南、超哥分镜导演 SD2.0、南极来の企鹅 H3 分段工作流说明）仅作个人参考，未获再分发授权，勿将本仓库设为 public。
- H3 分段工作流（Impact V6）版权归 B站UP 南极来の企鹅 与 抖音 Theodore，仅允许非商业行为与传播，分享请注明出处，禁止倒卖。
