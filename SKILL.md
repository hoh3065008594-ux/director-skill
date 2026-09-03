---
name: director
description: AI 导演工作流 — 拍广告/短视频/宣传片/品牌片。从创意概念、分镜脚本、本地 ComfyUI/Z-Image 出图、MiniMax H3 视频生成（含 >15s 长视频分段生成、双采高清、V7 导播台）、审片重拍定稿，到 HTML 动画成片与 Web Audio 配乐，全程单文件夹交付。已融合 cinema-dna-21x9x3 电影感镜头判断（关系压力构图/视线流量/受控随机/色彩命题/21:9 三联叙事/反 CG-AI 模板检查/可选主题海报）。| AI Director workflow: ads / short films / brand videos — concept & storyboard, local ComfyUI Z-Image stills, MiniMax H3 video clips (incl. >15s segmented long-video generation, V7 storyboard console), review & lock, animated HTML edit with synthesized audio. Merged cinema-dna-21x9x3 cinematic shot judgment (pressure-based composition, visual traffic, color thesis, 21:9 triptych, anti-CG/AI checks).
argument-hint: [时长-风格-产品] 例如 "30秒咖啡广告 极简高级感"
version: 1.17.0
user-invocable: true
allowed-tools: Read, Write, Edit, pwsh, read_image, job_output, job_kill, web_search
---

> **语言**: 默认中文沟通；分镜、字幕、文案用中文，AI 出图/出视频提示词用英文。
> **提示词铁律（2026-08-25 用户明确要求）**：每个模型的提示词必须按其**官方规范**书写——Z-Image 见 `references/z-image-prompt-guide.md`，MiniMax H3 见 `references/h3-prompt/h3-prompt-guide.md`，见 §1d-2。
> **用户硬性要求（2026-08-25 沉淀，全项目强制执行，详见避坑 49–51）**：① 画面零文字零错别字（禁字提示词 + **分镜源头不设计带字元素**，字幕/定版字后期叠加）；② 开头结尾不得黑屏（首末帧必须是实际画面）；③ 跨段角色不得漂移穿帮（每段重复完整身份描述，出错单段重跑即可）。

# AI 导演 Skill（DSH / Windows 版）

用户说"拍个 XX 广告""AI导演""做个 30 秒宣传片""出一套广告物料"时触发。
当用户说"更新导演skill"时，用最新一次拍摄的教训修订本文件，并推送到 GitHub 私人仓库（`C:\Users\Administrator\.agents\skills\director` → `git add . && git commit -m "vX.Y.Z: 摘要" && git push`；记得同步递增 frontmatter 的 `version`）。

## 工作流路由规则（用户明确要求，Z-Image 系列）
| 场景 | 工作流 | 说明 |
|---|---|---|
| 有人参与 | 《真人-文生图》 | 单段 1216×832，无参考图 |
| 有人参与 + 用户给了参考图 | 《真人-参考图生成-高清版》 | 参考图→WD14 反推→拼接"超写实人像摄影,细腻皮肤质感,自然光,高清细节"→初绘 1024×1024→1.5× 重绘→1536 |
| 风景 / 背景 | 《风景-参考图生成-高清版》 | 参考图→WD14 反推→拼接"超写实风景摄影,自然光影,高清细节,专业风光摄影"→初绘 1344×896→1.5× 重绘→2016×1344 |
| 视频（镜头动画化 / 长片分段） | MiniMax H3 分段 **V7 导播台**（本地） | 多段长视频走 V7（导播台节点，素材别名 + 每镜提示词/时长管理）；单段/兼容走 V6。均自动逐段生成 + Latent 衔接 + 双采，见 2b 章节 |

参考图一律放项目内 `assets/input/`（ComfyUI 以 `--input-directory` 指向，不落 C 盘）；无参考图时先用《真人-文生图》打底再喂参考图管线。

## 文件位置铁律（用户明确要求）
- **所有项目文件、图片资产、视频资产、生成输出一律放在非 C 盘工作区**（本机：`D:\dsh web 工作区\<项目>\`）。
- ComfyUI 启动必须带 `--output-directory` / `--temp-directory` / `--input-directory` 指向项目内目录，杜绝资产落进安装目录。
- 绝不把项目文件/图片写到 C 盘；C 盘只允许系统级位置（技能目录、ComfyUI 程序本体等）。
- 视频输出：`<项目>/assets/video/clips/`；定稿母版：`<项目>/assets/master/`；剧本大纲：`<项目>/assets/script-outline.md`。

## 标准流程（五步）

### 0. 需求对齐（只问一个问题）
确认：**时长 + 风格**。风格给出 4 个候选让用户选，推荐第一个：
- 都市治愈系（暖光手冲、走心文案）
- 复古胶片感（8mm 颗粒、暖黄怀旧）
- **极简高级感**（黑白灰+单一暖金点缀、大留白、慢镜头）← 通用推荐
- 快节奏能量感（动感快剪、咖啡因能量）

### 1. 创意与分镜
- 造品牌名（如 NOIR）+ slogan（如「纯粹,是唯一的奢侈」/ "Purity Is the Only Luxury"）。
- 30 秒 = 6 镜 × 约 5 秒。写分镜表（Markdown）+ **文字版剧本大纲**（`assets/script-outline.md`，可编辑，审片面板实时显示）。

| 镜号 | 时间码 | 景别 | 画面 | 字幕 | 声音 |
|---|---|---|---|---|---|
| SC.01 | 00:00–00:05 | 黑场 | … | 安静,是一种味道 | 低频底噪 |

- 剪辑节奏：全片 0.3–0.5× 慢速、无快切、转场 0.8s 交叉溶解、无对白。

### 1b. 资产账本与人物/产品一致性（3+2 工作流 3.0 精华）
- **人物类项目硬性门槛（2026-08-24 教训）**：出任何场景前，必须先产出并确认**角色三件套**——① **角色整体图**（母版：全身/七分身，锁定服装、发型、神态与光线基调）② **三视图**（正/侧/背，基于母版垫图生成，供各镜统一视角）③ **脸特写**（正脸近景，供面部一致性）。三件套进资产账本，后续所有含人物镜头**必须以母版/三视图为参考图锚定**，禁止直接用场景草稿当人物参考（否则跨镜人物必然漂移）。用户明确要求"生成人物/角色"时同理先出三件套再谈场景。
- **角色资产生成实操（2026-08-25 实测，见 `references/character-assets.md`）**：本机做角色一致性最稳配方 = **高清正脸（身份锚点）→ 素体分视角（体型锚点）→ 换装**，用《真人-参考图生成-高清版》工作流，**参考图必须用高清正脸/脸特写**（该工作流是 WD14 标签式参考：全身图反推出的全是衣服场景标签，脸没被描述必然漂移），提示词必须写满身份词（`young East Asian woman` + 眼角痣 + 发型，否则三视图变欧洲脸）；三视图拆成每视角独立图，不要合成一张；Z-Image 单遍直出画质糊，必须走高清二采管线（1024→1536）。InstantID（SDXL）路线已装通但静态换装不如该配方，适合剧情镜头锁脸场景（模型在 D 盘，C 盘 junction，见手册）。
- **先建账本**：项目一开始就建本地账本（`assets/manifest.json` 或目录树），记录所有资产（确认/待确认）、提示词、制作状态、版本号；后续所有产出登记入账，全程无需手动找文件（本项目 `picks.json` + `script-outline.md` 即账本雏形，可扩展生成历史）。
- **资产前置**：制作资产（角色/场景/道具/风格参考）占全流程 ≥50% 精力，先做扎实再谈生成——盲目追求效率质量必降。
- **血缘/关联继承**：有强关联（血缘/同源/包含）的角色或产品：先定「母版」形象，再基于母版推演关联体（例：先定父母长相 → 再生成女儿；狼人基于男主形象）。每次继承做一次**垫图（img2img）**流程保证一致性。
- **状态图**：基于已确认角色图继续生成不同状态（开场造型、受伤、情绪等）；用户可对话式修改（"她应该戴帽子"）在同一形象上迭代。
- **三视图**：关键角色/产品确认后生成三视图，供各镜统一视角。
- **道具资产**：只保留**重复出现**的道具，单次出现的自动排除。

### 1b-2 场景资产构建（3+2 工作流 3.0 · 第 2 期精华）
- **顺序铁律**：场景清单 → 室外拓扑图 → 室外节点图 → 室内户型平面图 → 室内节点图（宫格图）→ 色卡；**顺序错了，后面每张图各画各的必然出错**。
- **场景清单**：按**剧本事件节点**列出场景（不是按地点随手列）。
- **室外拓扑图（第一张图，不是任何具体场景）**：先定死空间关系——各场景位置、彼此距离、坡向、人物整条动线；拓扑确认后再分室外/室内两路生成。
- **室外**：按节点分开出图（例：雪林下坡 / 林缘坡角 / 从坡角反打的农舍）。
- **室内户型平面图（室内一致性最关键一张）**：不直接画房间图，先做平面图——人物每次从哪个门进、哪个方向走、下一场景该出现在哪；**缺它空间关系无法保证，人物会"在自己家里迷路"**。
- **宫格图（单房间一致性解法）**：以当前室内图为基准，把房间空间关系在内部推演一遍，一次性生成各角度——正打 / 反打 / 左右侧 / 后续特写机位。
- **色卡**：室内、室外**各一套**，为视频环节光影/色调不漂移保驾护航；**人物匹配音色**也一并准备好，才算完整资产包。
- **金句**：资产决定作品上限，提示词只能决定下限。
- **参考图/算力提醒（Seedance 评论区实测）**：参考图占用单段视频算力（按时长分配），过大（4K）/过多参考图都会削减算力——**一张反打图就足够**。
- 完整笔记：`references/3-2-workflow/6_scene-assets-episode.md`（口播全文 `transcript-scene-assets.txt`）。

### 1c. 风格锁定（STYLE_TOKEN）
- 需求对齐后先锁定画风，**锁定后全程不可改**。三层结构（缺一不可，禁止"高级/有感觉/独特"等模糊词）：
  1. **风格核心**：流派标签（2-4 关键词）+ 质感等级定性 + 排除项（"杜绝网络剧廉价感"）
  2. **视觉基调**：写实 = 具体摄影机型号 + 镜头系列 + 帧率/动态参数；动画 = 渲染引擎/手绘工艺 + 笔触技术 + 帧率/运动曲线
  3. **色彩与影调**：时代/流派美学参照 + 主色辅色对比 + 布光方案（光源类型+方向+受光面）+ 高光/暗部处理 + 氛围收尾
- 8 预设画风：① 写实影视风（ARRI Alexa 35 + Zeiss Master Prime + 三点布光）② AI短剧风（索尼 FX3 + 竖屏 1080P + 自然光）③ 超写实摄影（哈苏 H6D + RAW + 自然光纪实）④ 3D国漫风（追光渲染规格 + PBR + 冷蓝墨金撞色）⑤ 3D欧美风（皮克斯 RenderMan + 高饱和暖色）⑥ 日系动漫（京都动画规格 + 赛璐珞平涂）⑦ 国风水墨（水墨宣纸 + 留白构图）⑧ 欧美漫画（美漫英雄主义 + 厚重轮廓线）。
- 自定义风格（⑨）八步推导法：识别来源类别（艺术家/导演/工作室/摄影师/游戏/时代美学）→ 提取风格核心 → 提取视觉基调 → 提取色彩影调 → 合并三层输出（40-80字）→ 合理性自检 → 输出给用户确认 → 确认后锁定。

### 1d. 提示词分层与模板参考（跨平台复用）
> ⚠️ **提示词铁律（用户明确要求，2026-08-25 起）**：**每个模型的提示词必须按其官方规范书写**——出图（Z-Image）与视频（MiniMax H3）各有独立官方格式，见下方 1d-2 分模型指南，禁止拿 A 模型习惯（SD 逗号标签 / Seedance 批次式）直接套到 B 模型。
- **图片 prompt 八层结构**：Subject → Action → Environment → Composition → Camera → Lighting → Color Palette → Style Reference（仅作内容清单，最终按 Z-Image 官方自然语言完整句组织，见 1d-2）。
- **视频批次提示词**（Seedance 式，批次≤15秒）：【资产声明】`@是[角色/场景/声音]`（同一角色只声明一次）→【氛围与画质】STYLE_TOKEN 三层完整展开 + "在[场景名]，[光影基调]"→【画面内容】逐镜独立成行：`镜头N：[景别]，[非默认角度]，[运镜词]，[角色][朝向][动作]，[微表情]。[对白][音效][约Xs]` → 结束行"全程无字幕，无配乐，仅保留同期声"。（⚠️ 仅 Seedance/国内视频平台批次用；**MiniMax H3 一律走 Ref2VA 六段式官方格式**，见 1d-2）
- **时长计算**：基准秒=ceil(台词字数÷4)（无台词0），+动作秒（简单2/中等3-4/复杂5-8/氛围空镜3-4），最低2秒、情绪特写≥4秒。（H3 台词字数硬规则另有 4.5 字/秒，见 H3 指南）
- **对白/音效格式**：`角色开口说道:"…"` / `心中涌起:"…"`（内心）/ `画外音响起:"…"`（旁白）；音效 `[音效：具体描述]` 放对白之后、时长之前，禁止在画面正文描述声音。（H3 对白语法完全不同：`<d>[语言] 原文</d>` + 画外音句式，见 1d-2）
- **运镜词库（禁止造词，除 FPV/POV 外禁用英文）**：固定/手持；平移（向前推进/向后拉远/左右横移/垂直升降/跟随主体）；旋转（左右水平旋转/快速甩镜/仰摇俯摇/滚转）；变焦（缓缓推近/拉远）；环绕（缓慢左右环绕）；航拍（垂直上升俯视/低空贴地/俯冲锁定/FPV）；特殊（POV/升格慢动作/降格快动作）。（⚠️ 此为中文项目层运镜词表；**H3 官方运镜必须用英文官方词表** Push In/Pan/Truck/Tilt/Arc/Tracking…见 1d-2）
- **导演法则**：视线法则（视线朝向目标 → 紧跟展示目标的镜头）；威胁切镜法则（威胁源与受威胁者镜头交替）；复杂动作拆解（蓄力/接近 → 接触/爆发 → 物理反馈/结果）；台词必切说话人面部；每批≥2镜、有台词批≥3镜。
- **H3 口播 B-roll 模板（T01-T21）**：T01 结论金句 / T02 概念隐喻 / T03 数字冲击 / T04 证据摘录 / T05 流程关系 / T06 用户反馈 / T07 章节概览 / T08 口播叠加转全屏 / T09 3D 空间层次 / T10 关键词条 / T11 多条件交集 / T12 组织系统 / T13 对话交锋 / T14 双边对比 / T15 证据链路 / T16 人物档案 / T17 3D 组装 / T18 地理网络 / T19 技术演进 / T20 能力树 / T21 机制原理。文字预算分级：v1 ≤12字符（准确率优先）/ v2 ≤28字符（表现力优先）/ v3 ≤18字符（平衡推荐）；每镜一个核心语义、同屏≤2组辅助信息、文字正对镜头稳定≥1.5秒。

### 1d-2. 分模型官方提示词规范（必读 · 每个模型的提示词按此书写）

| 模型 | 官方格式 | 完整指南 | 一句话核心 |
|---|---|---|---|
| **Z-Image / Z-Image Turbo**（出图） | 自然语言完整句分层：主体→环境→风格→构图→光线材质→限制 | `references/z-image-prompt-guide.md` | **无负面提示词**（无 CFG，约束全写正向）；Qwen3 编码器偏好长自然语言完整句；图内文字加引号注明语言 |
| **MiniMax H3**（视频） | Base 三字段（T2VA/I2VA/FL2VA/L2VA）或 **Ref2VA 六段式**（多参考） | `references/h3-prompt/h3-prompt-guide.md` | 六段式：subject_definitions/summary/**retention_analysis**/detailed_description/overall_soundscape/non_diegetic_music；对白 `<d>[语言] 原文</d>`；运镜英文官方词表 |

**H3 Ref2VA 六段式速记（本项目主流程，逐段必须六段齐全）**：
```
subject_definitions:    # <Picture N> 锚点 / <Subject N> 可复用角色 / <Audio N> 音色
summary:                # [reference generation + audio reference] 一句话（带对白必须 + audio reference）
retention_analysis:     # 逐项 fully_preserved / partially_preserved / weak_reference
detailed_description:   # [Shot 1] 无时间戳；后续递增；结尾半秒动作静止锚点；对白 <d>[Chinese] …</d>
overall_soundscape:     # 环境音/物理声
non_diegetic_music:     # 配乐（中间段不终止，末段收束）
```
- 对白：旁白类必须 `An [身份] voice speaks clearly in an off-screen voiceover: '<d>[Chinese] 台词</d>' while his/her lips remain completely closed.`（防火星语）
- 台词字数 ÷ 4.5 ≤ 镜头时长；画布 768×1344 竖 / 1344×768 横；帧数 17k+5 网格

### 1e. 电影感镜头判断（cinema-dna-21x9x3 融合 · v1.2.2）
用户要求"电影感""像电影截图""21:9 三联""不要广告/游戏/CG 感"，或要"随机发散选题材"时，在写分镜与出图前启用本层（完整规范见 `references/cinema-dna/`；示例三联图在工作区副本 `D:\dsh web 工作区\cinema-dna-21x9x3\examples\`）：
- **构图来自关系压力，不来自模板**：先判断——谁在看谁、谁知道得更多、谁正在离开谁还在等待、人物被什么空间结构限制、观众位于事件内部/外部/错误一侧、画面里什么比人物更有权力；再选 1 个主要构图机制（最多 1 个辅助）。禁止直接抽"远景-中景-特写/门框/居中/负空间"模板。
- **每帧先写一句"视线流量"**：`视线从 A 进入，被 B 放慢或遮挡，落到 C，最后被 D 带走，边缘/反射/失焦保留未解释信息`。一句话写不清 = 构图只是元素堆叠，必须重写；同组三帧的流量不得重复。
- **受控随机**：用户说"随机/发散"时，先做 LLM 内部分析（题材运动方向、角色-环境权力关系、观看立场、题材最独特的视线入口/阻断点/落点/出口、上一组已用套路），再受控随机——1 观看立场 + 1 视线入口 + 1 阻断/加速 + 1 落点 + 1 余韵出口 + 1 焦段；随机结果必须能被题材解释，否则重新随机；至少生成 3 套候选流量，选最不套路的一套。
- **色彩命题**：每组先定一句"色彩命题"（如"一块褪色朱红在大面积潮湿青灰中持续存在""午后奶油黄逐渐被室内病态绿色吞没"）；色彩必须来自服装/墙体/天气/实景灯/水面雪地玻璃植物反射/时代材料。不默认蓝灰阴冷，不靠后期滤镜制造高级感。
- **三联叙事节奏**：默认输出 3 张独立 21:9（或 2.39:1）单帧 → 纵向拼接成三联；黑色间隔 8–12px；不加字幕/序号/水印/装饰边框。每组必须有一个"可被推断但未完全解释"的事件（迟到但座位仍留着/仪式开始但执行人拒绝盖章/船已靠岸乘客撕掉登船凭证/战斗结束胜利者发现桌上只剩自己的旧物）。**第三张不许默认"空房间+物件+余韵"**——可以是身体压力后的喘息、群体视线或集体反应、关系站位发生变化、现场继续运行、规则被临时改写、人物没有解释但行动已变。
- **反 CG/反 AI 检查**（出图后逐帧过）：排除史诗云层、魔法裂光、大量烟雾粒子、过亮轮廓光、玻璃般皮肤、全画面锐利、青橙调色、重颗粒/重色散/重光晕；排除 CG 概念图、游戏宣传图、AI 壁纸、偶像剧/电视剧站位；可做"动画片感/手工木偶感/童话/科幻运动"等方向，但转译成材质/表情/布景/色彩/调度，不复制现成 IP。
- **与现有流程衔接**：1c 锁画风质感（STYLE_TOKEN），本层锁"叙事性构图"——先完成本层判断，再写 1d 的八层 prompt（构图/流量/色彩命题作为其中 Composition / Color Palette 的输入）；Z-Image 出 21:9 单帧时画布比例相应调整（如 1344×576 级别，拼接按上述规则）；视频三联需求逐镜走 2b（H3 画布 1344×768，三联拼接仅用于静帧/概念图交付）。
- **可选片名+主题海报阶段**（仅用户明确要求"片名/命名/海报/封面/视觉体系/发布主图"时启用）：按分镜核心冲突生成片名候选 → 选主片名+英文名+logline → 从分镜提炼主视觉符号（不是把三图拼贴）→ 判断电影气质选排版/字体/颜色系统 → 主海报固定 **3:4 竖版**（prompt 必须写 `3:4 vertical poster composition`），16:9/1:1/9:16 仅作视觉体系扩展封面；参考海报只做抽象方法分析（大留白/标题压人物/书写笔触/文字穿插景深/单色底+高饱和点睛色/胶片颗粒/旧纸感），不复用其版式、片名、IP、人物关系、字体轮廓；直接画字只用一个短片名并预留后期校正空间，准确文字优先排版工具叠加。

### 1e-2. 导演四轴视觉指纹 + Scene Master 锁（融合 zy-cinematic-realism v2.1.0 · 2026-09-04）
> 方法来源：ZY / popopo-99《造梦师 v2.1.0》（CC BY-NC 4.0，个人非商用整合，保留署名）。资料目录 `references/zy-cinematic-realism/`（入口 README.md）。**只读所需分支，禁止整库载入。**
> 启用时机：用户**点名导演** / 求导演方法、对比或推荐；或给出场景故事但想先选导演/风格方向。纯技术重拍、资产生成、H3 排障、以及用户拒绝候选时 → 本层不启用，原流程不变。

- **候选推荐规则（用户明确要求）**：用户给出场景/故事/分镜想法但**未指定**风格或导演时 → 先按场景目标从 `references/zy-cinematic-realism/references/directors/recommendation-matrix.md`（按场景选导演矩阵）与 16 张风格卡（`style-cards.md`）筛 **2–4 个候选**，每个附一句话"为什么适合这镜"，**第一个标为推荐**，等用户选定再编译；用户已点名导演/风格、要求 prompt-only、或明确赶时间 → 跳过推荐直接干活。选定后同 §1c：锁定全程不可改。
- **导演铁律（iconic 强制）**：命名任一在册导演即按 `强烈` 执行（轻微/明确/强烈/iconic 一视同仁）。四轴签名**缺一即失败输出**——`Lighting and contrast signature` / `Color and exposure signature` / `Lens and camera signature` / `Composition and spatial signature`，四行都必须是**当前场景的具体决策**，紧随场景事实之后、详细摄影机设计之前连续输出。禁止把导演名/片名/焦段数字/冷暖色互换当 shorthand；禁止复制任何具体电影画面。至少三轴发生结构性变化，并重选「时刻 / 视觉中心 / 机位 / 人物尺度 / 环境·人物·物件主导权」中至少三项；完稿后心里删掉导演名与片名，四轴仍须独立可辨（无法区分即重做）。
- **图片线路（Z-Image）落地**：四轴先产出**场景级决策** → 再按 §1d-2 Z-Image 官方规范编译为**自然语言正向完整句**（不套 GPT/MJ 语法、不用负向）；文件里的 `Reject/避免` 类指令转成 Z-Image 正向排除写法（例："reject elegant noir key light" → `light comes only from practical sources: a green tube, a red exit sign, rainy doorway spill; most of the frame stays in unlit shadow`）。与 §1e 衔接顺序：先 1e 定"这一镜在看什么"（关系压力构图/视线流量/色彩命题）→ 1e-2 定导演的光影/色调/机位/空间四轴 → 再进 §1d 八层结构编译。画面零文字禁字铁律、反 CG/AI 检查不豁免。
- **视频线路（MiniMax H3）落地**：用户要"整支片有 X 导演的调性"或点名导演拍片时 → 先出该导演**本片化四轴「视觉语言锁定」**（并入 §1c STYLE_TOKEN，全片跨段锁定，不得片中换导演），再每镜照常按 §2b / §1d-2 的 Ref2VA 六段式编译——四轴作为 detailed_description 的**画面视觉层输入**；运镜/对白/时长/音效仍走 H3 官方词表与语法，导演层不得违反用户硬性要求（画面零文字、首末帧非黑、跨段身份不漂移、对白口径）。多镜/长片一致性 = zy 的 **Base Lock + Shot Delta**（Continuity Bible，`continuity-cards.md`）：全片一份 Base Lock（角色/服装/道具/场景/光线），每段只写一条有限 Shot Delta。只改单镜用 **Prompt Doctor**（`result-repair.md`）：`CHANGE ONLY 机位/光影/动作…；PRESERVE EXACTLY 其余全部`，单段重跑即可，与避坑 51 同逻辑，禁止整链重跑。
- **Scene Master 锁（静帧/视频通用方法论）**：任何风格、导演、模型语法介入之前，先锁定场景事实——人物身份、场景、时间、天气、故事节拍、当前动作、视觉中心、机位、光源、核心道具、画幅、显式限制；`MODEL SYNTAX MAY CHANGE. SCENE LOGIC MAY NOT.`（模型语言可以改变，画面设计不能偷偷改变）。编译/转码后对照锁还原任何漂移。Schema 与 Transcode Lock 见 `references/zy-cinematic-realism/references/prompt-compiler.md`。
- **文件路由**：单导演 → `director-routing.md` + `directors/<slug>.md`（如刁亦男 = `diao-yinan.md`）恰一个文件；对比/推荐 → `recommendation-matrix.md` + 2–3 位候选文件；风格卡 → `style-cards.md`；摄影卡 → `cinematography-cards.md`；Remix → `remix.md`；生成前检查 → `prompt-check.md`；出图后 → `anti-ai-cleanup.md` + `quality-checklist.md`。
- **范围声明**：上游的**四模型原生编译器（GPT Image 2 / Midjourney V8.2 / Seedream 5.0 Pro / Nano Banana）与 model-routing / model-capability-matrix 未内置**（本机不用，避免死链与误用）。若用户明确要在这些模型生成原生 prompt，告知本机只落地 Z-Image/H3，并指向本地克隆 `D:\dsh web 工作区\zy-cinematic-realism\zy-cinematic-realism\` 或上游仓库。

### 2. 本地出图（ComfyUI + Z-Image）
探测本机环境（本机已知：ComfyUI 在 `C:\Users\Administrator\ComfyUI` 与 `D:\ComfyUI-H3`，模型库 `D:\download\ComfyUI_models`，GPU RTX 4070 SUPER 12GB + 32GB RAM）：

```powershell
Get-ChildItem C:\,D:\ -Directory | Where-Object Name -match 'comfy|webui|fooocus'
& nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
Get-Content <comfy>\extra_model_paths.yaml   # base_path 即模型库
```

**启动服务（关键！必须用常驻后台任务，不能 Start-Process 前台分离，否则随命令结束被回收）**：

```powershell
# 在 <comfy> 目录，作为 run_in_background 后台任务运行：
& 'C:\Users\Administrator\ComfyUI\venv\Scripts\python.exe' main.py --listen 127.0.0.1 --port 8188 `
  --output-directory "<项目>\assets\generated" --temp-directory "<项目>\.comfy\temp" `
  --input-directory "<项目>\assets\input" --disable-auto-launch
# 轮询就绪：Invoke-RestMethod http://127.0.0.1:8188/system_stats
```
（D:\ComfyUI-H3 同理，端口 8190，output→`assets/video`；它写自身 user 目录需 danger-full-access 授权启动。）

**模型选择（本机主推 Z-Image 系列）**：Z-Image Turbo（`z_image_turbo_bf16.safetensors`，文本编码器 `qwen_3_4b_fp8_mixed.safetensors` type=`lumina2`，VAE 用 FLUX 的 `ae.safetensors`，8 步秒级出图）；写实备选 SDXL `majicmixRealistic_v7`；更高品质 FLUX（`flux1-dev-fp8` + `t5xxl_fp8` + `clip_l` + `ae`）。

**Z-Image 文生图 API 工作流**（用户《真人-文生图》原版复刻）：
`UNETLoader → ModelSamplingAuraFlow(shift=3) → CLIPLoader(qwen3-4b, lumina2) → CLIPTextEncode(正) + CLIPTextEncode(空)→ConditioningZeroOut(负) → EmptySD3LatentImage(横版 1216×832 / 竖版 832×1216) → KSampler(res_multistep / simple / 8步 / cfg 1) → VAEDecode(ae) → SaveImage`。单段，无高清修复。

**参考图管线（风景/真人参考图）**：`LoadImage(参考图) → WD14Tagger(wd-v1-4-moat-tagger-v2, threshold 0.35) → StringFunction(append 补充词) → 同上 Z-Image 初绘(风景 1344×896 / 真人 1024×1024) → LatentUpscaleBy(1.5) → KSampler(denoise 0.4) → 高清输出(2016×1344 / 1536×1536)`。补充词：风景「超写实风景摄影,自然光影,高清细节,专业风光摄影」；真人「超写实人像摄影,细腻皮肤质感,自然光,高清细节」。

**提示词配方**（⚠️ **必须按 Z-Image 官方规范写**，详见 `references/z-image-prompt-guide.md`）：
- **无负面提示词**：Turbo 无 CFG，negative 不生效，所有约束写进正向提示词（本机工作流里的 `ConditioningZeroOut` 空负向仅作占位）。
- **Qwen3 编码器偏好长自然语言完整句**：主体在前、细节在后，禁止 SD 式逗号标签堆叠。
- positive = 场景描述（英文为佳）；图内文字加引号注明语言；正片素材一律 `no text, no letters, no signs` 禁字。
- 分辨率：Z-Image 横版 `1216×832`、竖版 `832×1216`；视频画布 `1344×768`（H3 最大 16:9）。
- **字幕不要烧进图**（SD 渲染文字差），由成片动画层叠加。
- **每张生成图必须附提示词**（用户要求）：生成后运行 `node .comfy/attach.js`——写 PNG tEXt `noir-prompt` 块 + 同名 `.txt` 旁注；重拍脚本已自动附加。

### 2b. 视频生成（MiniMax H3 分段 · V7 导播台主流程 / V6 兼容）
- **路由（2026-08-24 起）**：多段长视频（>15s）**优先走 V7 导播台工作流**（`Impact_V6_单采/双采_Theodore导播台.json`，需装 `ComfyUI_Theodore_Director` 节点）——素材用别名管理、每镜独立时长/开关、自带续跑与后处理合并，见 `references/h3-segmented/theodore-director-v7.md`；**V6 仍为兼容主流程**（单段 ≤15s 或沿用整段脚本习惯时继续用 `Impact_V6_双采_整合提示词版本`）。原手搓 r2v 管线《minimax_h3_r2v_prompt_expand》已弃用——V6/V7 是它的超集（同 Ref2VA 引擎 + 队列控制 + Latent 衔接 + 双采）。
- **V7 与 V6 差异一句话**：提示词/参数从"每段节点"收进 `TheodoreDirector_Project` 的 plan_json（导播台可视化编辑或改 JSON）；素材库别名 `{{ref:alias}}` 编译成 `<Picture/Video/Audio N>`；每镜独立时长吸附 17n+5；resume 续跑 + CommitResult 完成后自动接力下一段；产物在 `output/TheodoreDirector/<项目名>_<RunID>/`。
- **V7 模型修补**：官方工作流默认引用 `minimax_h3_ref2va_pruned_fp8_scaled.safetensors`，本机已统一改为已装的 `minimax_h3_ref2va_pruned_int8_convrot.safetensors`（V6 同款，实测跑通）；节点 git 克隆于 `D:\ComfyUI-H3\custom_nodes\ComfyUI_Theodore_Director`（v0.1.0）。
- **工作流**（已存 H3 实例 `D:\ComfyUI-H3\user\default\workflows\`）：推荐 `Impact_V6_单采_Theodore导播台.json`（省时）或 `Impact_V6_双采_Theodore导播台.json`（高清）；V6 有 `Impact_V6_双采_整合提示词版本.json`、`Impact_V6_单采_整合提示词版本.json`（省时）、`Impact_V6_双采.json` / `Impact_V6_单次采样.json`（逐段独立提示词）及 v1–v5 存档。
- 原理：H3 是**视频+音频联合生成的打包 DiT**（NestedTensor 视频 [B,24,T,H/16,W/16] + 音频 [B,32,2,T]）；帧数吸到 **17k+5 网格**（124 帧≈5s@24fps，5–15s 训练范围）；画布 768 短边 + 768×1344 面积上限。**V6 段间 Latent 传递**（22 帧视频 + 24 帧音频上下文，约 1s 代价）替代 v1–v5 的尾帧参考，保证连续性与一致性；**Impact Pack 队列控制**避免中间产物内存堆积（能跑第 2 段就能跑 50 段）。
- **整段脚本格式**（`一次性填入全部分段脚本`）：`## 第 01 段` + `& 5 &` + 六段式提示词，段间**单独一行 `===`**；`分段数量` 与拆段数一致；每段 5–15s 自动 clamp。**时长规划**：N 段实际总时长 ≈ `N×5 − 0.92×(N−1)` 秒（每段 22 帧上下文代价）——拍 30s 广告按此反推段数与每段时长。
- **V6 提示词规则**：**全部指代用户固定参考图**，不写"参考图 1 是上一段尾帧"（v5 及以前才需要）；每段结尾最后半秒动作静止形成"锚点画面"；段间保持人物/服装/道具/空间/光线/镜头高度/动作阶段/物体状态连续；音乐中间段不终止、末段收束；对白尽量不跨段。
- **运行**：参考图经 ImagePass 桥接到 `ref_image_N` → 填整段脚本 + `运行名称`（**每次必改**）+ `分段数量` + `基础随机种子` → **点一次 Queue** 自动逐段跑完（每段 MP4 + 尾帧 + latent 落 `output/MiniMaxH3_segments/<运行名称>/`）。自动续段依赖 Impact Pack 前端事件：**保持单一页面**、不编辑画布；任一段失败段号不变，修复后重新 Queue 重试；**API 模式无法自动续段**（QueueTrigger 是前端钩子），脚本只能逐段手动提交。
- **标准操作步骤（完整用法）**：
  1. **启动并打开**：H3 实例（`D:\ComfyUI-H3`，端口 8190）后台运行 → 浏览器开 `http://127.0.0.1:8190`；ComfyUI-Manager 已切 private 模式，启动无需联网。
  2. **加载工作流**：Workflow 下拉选 `Impact_V6_双采_整合提示词版本`（或用「Open」拖入 `D:\ComfyUI-H3\user\default\workflows\Impact_V6_双采_整合提示词版本.json`）；等右下角无红色未找到节点。
  3. **传参考图**：双击各 `ImagePass`（加载图像-图像桥接）上传/选择参考图，确认桥接到 `MiniMaxH3ReferenceToVideo` 的 `ref_image_N` 对应槽位（demo 映射：1=主角、2=怪兽、3/4=场景；ref_image_0 可选静态参考）。
  4. **规划段数/时长**：按 `N段总时长 ≈ N×5 − 0.92×(N−1) s` 反推（例：30s 广告 → 7 段 × 5s ≈ 30.5s，或 6 段 × 6s）。每段 5–15s，帧数自动吸附 17k+5。
  5. **填整段脚本**：`一次性填入全部分段脚本` 里按 `## 第 NN 段` / `& 秒数 &` / 六段式提示词 / 单独一行 `===` 分隔写完；V6 提示词全部指代固定参考图，不写尾帧。
  6. **设参数**：`运行名称`（每次必改，防读旧 latent）、`分段数量`（与 `===` 拆出段数一致）、`基础随机种子`（固定可复现，改种子抽卡）、Resolution Selector（默认 0.4MP 16:9；显存足可上调）。
  7. **点一次 Queue**：自动逐段执行——每段生成 → 保存 MP4 + 尾帧 → 保存 Latent → 段号 +1 → 自动提交下一段；观察段号递增即正常，全部结束段号归零。期间保持单页面、不切工作流。
  8. **失败处理**：任一段报错段号保持不变 → 修好（改提示词/参数）→ 再点 Queue 只重试该段，不会重跑已成功的段。
  9. **取产物**：`ComfyUI/output/MiniMaxH3_segments/<运行名>/` 下每段独立 MP4（`segment_N_*.mp4`）+ 尾帧 PNG + `latent_context/clip_N.safetensors`；按段号排序，进 concat 无缝拼接（见成片章节）或逐段审片。
  10. **提速/调画质**：单采版省一半时间；Turbo LoRA 已内置；双采（RTX 1.5×）出更高清但约 2 倍耗时；LowVRAM Attention 建议 4 或 8（56 头整除）。
- **双采（v5+）**：RTX 视频超分 1.5× → 同模型二采；LoRA Strength 0.3–0.55、denoise 0.2–0.35（对口型 ≤0.30）、3 步、res_multistep+simple、shift 12/3；最终视频用第一采音频。节点已装，**未做全量双采实测**。
- **本机实测（2026-08-24 · 30s 广告全流程）**：7 段 Latent 链（段1 5.167s + 段2–7 各 4.25s = **30.7s**）完整跑通；热缓存下每段执行 271–293s，段2 中断后热重跑仅 42s；两处大坑——①双实例同开爆 RAM（见避坑 36）②中间段 SaveLatent 链断（见避坑 35）。**字幕时间轴**按 concat 累计时长推算（段1 0–5.17 → 段2 5.17–9.42 → …），收尾两段式产品特写（纯产品→上身穿着）各配一句字幕再落品牌；合成用相对路径避免中文路径（避坑 38）。工作区参考：`D:\dsh web 工作区\lingerie-ad-30s\`（.comfy 内 gen_h3_v6.js / build_final.js / subs.ass 为可复用模板）。
- **本机实测（2026-08-23）**：段1 124 帧 5.17s（230s，含音频）；段2 LoadLatent + MotionContext(22帧/24音频) + Trim → **102 帧 4.25s（280s）**，Latent 衔接链路全通。坑：latent 路径约定（Save prefix 以 `/clip` 结尾、Load 传目录 `.../latent_context` + `clip_index=段号`）；`context_length` 是 COMBO 枚举**必须传字符串**（如 `"22"`）。产物副本 `D:\dsh web 工作区\h3-segmented-workflow\test-output\2seg_segment1_5.17s.mp4` / `2seg_segment2_4.25s.mp4`（预览 `preview_2seg.html`）。完整手册 `references/h3-segmented/segmented-workflow-v6.md`，12 段 demo 提示词 `references/h3-segmented/demo_prompts_12segments.md`。
- 交互通道：用 **HTTP**（`/upload/image` 上传参考图、`/view` 取回产物）避免跨工作区文件写；若实例 `--output-directory` 已指向项目则产物直落 `assets/video/clips`。
- 重拍路由：面板 `video-*` 键 → `gen_h3_r2v.js`（带该镜提示词）；写 `regen-video-<scene>.json` 标记。
- **中断恢复（重要）**：会话被杀时 `regen-video-<scene>.json` 标记会残留（脚本走不到 finally），但 **H3 队列仍会跑完已提交任务**。恢复步骤：
  1. 先查队列：`GET http://127.0.0.1:8190/queue`（`queue_running` / `queue_pending`，每条含完整 workflow：`filename_prefix`、`prompt`、`length`，还有 `create_time`）——看该镜任务是否仍在跑/在排队。
  2. 若任务在队列：**不要重新提交**（会双份），用 `node .comfy/wait_r2v.js <prompt_id> <scene> "<prompt>"` 轮询 `/history/<id>` + `/view` 取回产物并写 `.txt` 旁注、清标记。
  3. 同场景出现两条排队 = 两个随机种子变体（产物名 `_00001_/_00002_` 区分），不是 bug——正好多一版供审片对比。
- **提示词进阶（对白/运镜/六段结构）**：H3 原生支持**人声对白**（本机已实测：提示词写 `an elegant female voice speaks clearly: '<d>[Chinese] 台词</d>'` 能生成清晰中文台词，funasr 转写还原≈100%）。完整规范——五种模式（T2VA/I2VA/FL2VA/L2VA/Ref2VA）、Ref2VA 六段结构（subject_definitions/summary/retention_analysis/detailed_description/overall_soundscape/non_diegetic_music）、运镜三维度（类型+幅度+速度）、对白语法 `<d>[语言]` + 说话人 `(S1)` + 画外音嘴唇闭合、防火星语（台词归属三选一、音色参考首选短音频≤8s、台词字数÷4.5≤镜头时长）、常见坑与质量自检——见 `references/h3-prompt/h3-prompt-guide.md`。

### 3. 审片重拍（better-sidebar 审片 Tab，文件夹式）
用 `read_image` 逐张检查；**若当前模型不支持读图**（deepseek-v4-flash 无视觉）：程序化质检 + 用户人工终审（见下）。
**审片面板**：动态插件客户端 `inject: ['betterSidebar']` → `ctx.betterSidebar.registerTab({ id, title, single:true, component })` 注册为 **DSH-better-sidebar 的 Tab**（非 slot 机制）；Host 提供 `webServer` 路由（`/noir-assets` 图片、`/noir-ad` 全项目含 mp4）+ `list/select/confirmScene/unconfirmScene/prompt/regen` 处理器。
- **文件夹式浏览**（资源管理器体验）：顶层「🖼 图片资产 / 🎬 视频资产 / 📦 固定资产 / 📜 剧本大纲」四个文件夹，点开见各场景子文件夹，再点开才见资产；树区独立滚动。
- **图片与视频操作完全一致**：单击=预览（原生 `<dialog>.showModal()` 屏幕居中，含提示词+复制；视频原生播放含声音）；Ctrl+单击=点选「标准」；逐镜「定稿」=只定稿当前点选（绿框标 `confirmedFile` 那张）；「撤销定稿」；「重拍」=新生成 1 个（⏳ 中，新产物带「新」徽章）；4 秒轮询自动刷新。
- 固定资产=定稿母版（4x-UltraSharp，1920×1080 / 海报 1248×1824）；剧本大纲=读 `assets/script-outline.md`。
- 定稿结果：`picks.json`（confirmed + picks{key:file}），供成片读取。

**独立审片页（推荐，无需动态插件审批）**：模板存于 `references/review-panel/`（serve_review.js + review.html + README）。搭建三步：
1. 拷模板到项目 `.comfy\`，改 serve_review.js 顶部三处：`ROOT`（项目路径）、`SCENES`（scene-01…NN）、`SCENE_META`（每镜名称/字幕）；依赖 `.comfy\gen_zimage.js` + `jobs.json`（重拍按钮用）。
2. 启动：`node .comfy/serve_review.js`（后台任务）→ 浏览器开 `http://127.0.0.1:3099/review.html`。
3. 用法：左侧「🖼 图片资产 / 🎬 视频资产 / 📜 剧本大纲」文件夹式浏览 → 场景子文件夹 → 资产；**单击=预览**（原生 `<dialog>`，含该镜提示词）、**Ctrl+单击=选「标准」**、**定稿/撤销**（绿框 + 金色徽章，写 `assets/picks.json`）、**重拍**（新种子版本约 30s，带「新」徽章）、4s 轮询自动刷新（H3 片段自动出现）。
- API：`/api/assets`（stills+clips+generating+meta）、`/api/picks`+`/api/pick`（POST `{scene,file|null,kind:'still'|'clip'}`）、`/api/prompt`（读 `.txt` 旁注）、`/api/regen`（spawn gen_zimage.js，`regen-still-<scene>.json` 标记）、`/api/outline`（剧本大纲）；静态文件带 HTTP Range 206（视频拖动必需）。
- 资产命名：图片 `assets/generated/scene-0N_0000M_.png`；视频 `assets/video/clips/segment_N_*.mp4`；定稿 `assets/picks.json` → `{scene:{kind,file}}`，成片阶段读取。

**程序化审片（模型无视觉时）**：`python .comfy/qa_video.py <clip_dir>`——对每段在各时间点提帧算亮度均值/对比度/拉普拉斯清晰度 + 帧间差运动量；音频用 `ffmpeg -af volumedetect -f null NUL` 看 `mean_volume/max_volume`、`ffprobe -select_streams a:0` 判有无音频流。按分镜预期核对（例：黑场开场亮度应低且渐升、奶花绽放镜亮度上升、白场镜亮度≈100、微距特写清晰度低属正常）。ffmpeg 提帧写临时目录会被沙箱拦（image2 I/O error），**临时帧目录必须放项目内**（如 `.comfy/temp/`）。

### 4. 成片 + 交付
- 成片：单文件 HTML 动画 —— JS `requestAnimationFrame` 时间轴驱动：场景交叉溶解（opacity 由时间轴计算）、字幕窗口、进度条/时间码/播放-暂停-重播-静音、letterbox 与胶片颗粒；配乐用 **Web Audio API 合成**（低频 pad + 稀疏钢琴单音 + 水滴声 + 心跳低音），首次点击页面后启用（浏览器策略）。HTTP 访问：插件 `/noir-ad/ad.html` 路由（GUI 预览相对路径 404 的解法）。
- 升级路线：静帧动画版 → **真视频版**（H3 分段生成的带声片段进时间轴）。**分段产物拼接（推荐 concat 无缝）**：分段工作流每段输出独立 MP4（`output/MiniMaxH3_segments/<运行名>/segment_N_*.mp4`），段间已由 Latent 衔接天然连续，**用 concat demuxer 直接无缝拼接**（不等长也没关系，无需 xfade 交叉溶解）；需转场才用 xfade，`offset_n = 累计时长_{n-1} − 转场时长`（不能像等长单段那样固定 +4.367）。段时长不相等是正常的（段1 5.17s、段2 4.25s…，每段扣 22 帧上下文）。音轨直接用 H3 生成音频，volume 归一 + loudnorm；`picks.json` 决定每镜选哪版。
- 资产**单文件夹**：`<项目>/assets/`（generated / master / video / input）；`<项目>/storyboard.md`、`ad.html` 并列。

## 避坑清单（本机实测教训）
1. ComfyUI 必须以**常驻后台任务**方式启动；`Start-Process` 分离的子进程会在前台命令结束时被杀（表现为 `ECONNREFUSED`）。
2. `--output-directory` / `--temp-directory` / `--input-directory` 全指到项目内（D 盘），杜绝资产落 C 盘/安装目录。
3. 启动日志里 `Failed to initialize database ... Could not acquire lock` 是**非致命警告**，服务照常可用。
4. Windows 控制台显示中文路径乱码不影响实际路径。
5. 手搓 SVG 只做分镜草图/备用；正片资产一律用本地出图工具。
6. 中文文案宽字距（letter-spacing）需 `dx≈ls/2` 补偿居中；SVG/HTML 均适用。
7. 生成任务放后台跑，期间可并行写分镜/更新 skill；结束后务必 `job_output` 收结果。
8. **动态插件 define 必须同时给 host + client**——漏 host 半区会导致图片路由与所有处理器缺失（面板能开但图全 404）。
9. **注册隔离**：每个 `slots.inject` / `registerTab` 包 try/catch + console.error 留痕，单个失败不拖垮其余；客户端代码先写文件 `node --check` 再 define。
10. **better-sidebar 容器有 `contain: layout style` + `position: fixed`**：子孙 `position: fixed` 会锚定到侧栏而非视口 → 预览弹层改用**原生 `<dialog>.showModal()`**（top layer 渲染，天然屏幕居中）。
11. **插件写文件必须显式传沙箱策略**：`fs.writeText(target, content, undefined, undefined, { mode:'workspace-write', workspaceRoot:'<工作区>' })`，否则按部署级 fallback 拒绝。
12. 图片/视频供浏览器用 `webServer.register({ kind:'prefix', path:'/noir-assets'|'/noir-ad', handler(req,res) })`，handler 内 `fs.readBytes` + `res.end(bytes)`；MIME 要含 mp4。
13. **新文件不进审片列表** = Host 分组正则没覆盖该前缀（scene-\d\d / poster / bg-* / land-* / video-*）。
14. 用户明确规则：**项目文件/图片/视频一律不放 C 盘**。
15. ComfyUI API 校验失败要快报错：POST `/prompt` 无 `prompt_id` 即 throw；`TextEncodeZImageOmni` 需显式传 `auto_resize_images`。
16. **ComfyUI autogrow 输入在 API 里是对象**：`ref_images: { ref_image_0: ['node',0] }`，传单张 tensor 会报 "Boolean value of Tensor ... ambiguous"。
17. **kill 客户端脚本不会停服务端队列**——ComfyUI 会继续执行已提交的 prompt（旧批次产物继续落地）；重跑前先 `POST /interrupt` + `POST /queue {"clear":true}`。
18. **视频无声排查**：ffprobe 只显示 video 流 = 音频没接上（未接 VAEDecodeAudio→CreateVideo.audio）或跑的是旧队列产物；先确认队列干净再判。
19. H3 实例写自身 install 目录（db/日志/管理器缓存）会触发沙箱拒绝 → 启动命令申请 danger-full-access，或改用 HTTP 通道与已运行实例交互。
20. 参考图/产物跨目录：优先用 `/upload/image` + `/view` HTTP 传输，避免跨工作区文件写被沙箱拦。
21. **会话中断 ≠ 生成中断**：`regen-video-*.json` 残留标记 + H3 队列还在跑 = 任务未死。先 `GET /queue` 看 workflow（filename_prefix/prompt 可读），在队列就用 `wait_r2v.js` 续取，别急着重提交。
22. 同场景排队两条 = 双随机种子变体（`_00001_/_00002_`），用于审片对比，别当故障清理。
23. ffmpeg 提帧/临时文件别写系统 temp（沙箱拦，image2 muxer "I/O error"），用项目内 `.comfy/temp/`；本机 Python 带 PIL 可用作程序化质检。
24. **ASS 颜色是 BGR 格式** `&HAABBGGRR`：金色 C9A36B 应写 `&H006BA3C9`——写成 `&H00A36BC9` 会变成品红（R201/G107/B163），肉眼很难察觉但金检测为 0。白 E8F1F5 对称无此坑。
25. **subtitles 滤镜的 fontsdir 别指 `C:\Windows\Fonts`**：libass 扫描到旧式 `.fon` 位图字体（8514fix.fon 等）报 "Error getting metadata for embedded font"；把需要的字体复制到项目内 `.comfy/fonts/`（msyh.ttc + georgia.ttf 即可）再 `fontsdir=.comfy/fonts`（相对路径无冒号转义问题）。
26. **xfade 要求输入 timebase 一致**：mp4 片段 timebase 可能不同（1/24 vs 1/12288），报 "First input link main timebase ... do not match"；每个视频输入先 `setpts=PTS-STARTPTS,settb=1/24`。音频链统一 `aresample=48000` 再 acrossfade。
27. **真视频合成参数（实测）**：6 段 5.167s(124帧) + 0.8s xfade×5 → 27.0s；转场 offset 递推 `offset_n = offset_{n-1} + 4.367`（4.367/8.734/13.101/17.468/21.835）；尾部黑场用 `color=d=3.798` + xfade offset=26.202 → 总 30.0s。字幕用 ASS 烧录（subtitles filter）。
28. **声音只用 H3 提示词生成的音频（用户明确规则）**：不要在 ffmpeg 里混入 Python/合成音效轨（钢琴/水滴/心跳等）。想要的声音写进各镜视频提示词引导模型生成（ambient hum / soft drips / gentle piano resonance / morning ambience…），产物自带 aac。合成时音频链 = 各段 volume 归一（按 volumedetect mean 差值补 dB）→ `acrossfade=d=0.8` 链 → `loudnorm=I=-16:TP=-2:LRA=11` → 尾部 afade。H3 生成的音频是 32kHz stereo。
29. **静态预览服务器必须支持 HTTP Range（206）**：浏览器 `<video>` 播放/拖动需要 Range 请求，只返回 200 全量会导致黑屏/一直加载。静态文件处理里解析 `Range: bytes=start-end`，返回 206 + `Content-Range` + `Accept-Ranges: bytes`（用 `fs.createReadStream(fp,{start,end})`）。
30. **H3 分段 latent 路径约定**：`SaveLatent` 的 filename_prefix 末尾要带 `/clip`（保存为 `<dir>/clip_<段号>.safetensors` 固定槽位），`LoadLatent` 的 latent_path 传**目录** `.../latent_context` + `clip_index=段号`——传成 `.../latent_context/clip` 会报 "is neither a file nor a folder"（clip 不是目录名）。
31. **H3 COMBO 枚举输入必须传字符串**：`MiniMaxH3MotionContext` 的 `context_length` 是 `["22","5","39","56"]` 枚举，API 提交传数字 `22` 会校验失败（`value_not_in_list`），必须传 `"22"`。
32. **API 模式不自动续段**：ImpactQueueTrigger 是前端钩子（依赖浏览器事件），纯 `/prompt` API 提交不会触发下一段——脚本自动化只能逐段手动提交（改段号/换 prompt 依次 POST）；GUI 页面才能点一次 Queue 自动跑完。
33. **同 seed 同输入命中节点缓存**：复现/测试时相同节点输入会缓存（`execution_cached`），SaveLatent 等"秒回成功"不代表重新生成——看 `history` 里 `execution_cached` 的节点列表区分。
34. **ComfyUI-Manager 启动联网超时会崩服务**：受限网络下 Manager 启动 fetch `custom-node-list.json` 等反复超时甚至拖垮进程；`user/__manager/config.ini` 设 `network_mode = private` 规避。
35. **V6 分段 API 模式：中间段必须保存本段 Latent**（2026-08-24 实测踩坑）：API 逐段提交时，**首段**挂 SaveLatent、**末段**不用挂；但**中间段（第 2..N-1 段）必须同时挂 SaveLatent（`clip_index=当前段号`）+ LoadLatent（`clip_index=上一段号`）**——只抄 build_2seg_test 的两段模式会导致中间段不存 latent，下一段 LoadLatent 找不到 `clip_0000N` 报错，整链断裂。本机每段模型重载（TE 14.9GB + UNET 19.9GB CPU 量化 + TurboLoRA 208 模块合并）约 35–60 分钟，**链断重跑代价极高**——先想清楚再提交。
36. **双 ComfyUI 实例同开会爆内存（2026-08-24 实测）**：H3 实例（常驻 ~15GB RAM）+ 主实例（Z-Image ~8GB）同开 → 空闲 RAM 跌破 5GB → H3 采样报 `SamplerCustomAdvanced: HostBuffer.read_file_slice failed`、主实例报 `os error 1455 页面文件太小`，任务白跑 5-10 分钟才报错。**出图与视频必须错峰**：Z-Image 出图时停 H3；H3 分段生成期间关掉主实例（出完图立刻 kill，宁可之后重启）。
37. **H3 冷热加载差异巨大（2026-08-24 实测）**：冷加载（TE 14.9GB 量化 + UNET 19.9GB staging + TurboLoRA 208 模块合并）约 35–60 分钟/段；**热缓存**（模型常驻 RAM，如刚跑完上一段）下段执行仅 42s–5min（实测：段2 中断后热重跑 42s；段4–7 各 271–293s）。**分段生成不要中断、连续跑完最省时**；中断后再启 = 60 分钟级冷加载。
38. **libass/filter 路径禁中文**：subtitles/fontsdir 传含中文的绝对路径 → `No option name near ...` 解析失败；解法：ffmpeg `cwd` 指向项目 `.comfy`，用**相对路径**（`subtitles=subs.ass:fontsdir=fonts`）；字体复制到项目 `.comfy/fonts/`（msyh.ttc 等），ASS 里字体名用"Microsoft YaHei"比思源体名稳。
39. **审片门禁（2026-08-24 教训）**：关键帧/片段生成后**必须先过审片页定稿（picks.json）再进入下一阶段**；跳过用户确认直接开跑 → 返工代价高（本会话 SC.06 脸部→产品特写改了两轮、重跑 2 段视频 + 重拼母版）。
40. **重跑同名产物递增**：同前缀重跑 SaveVideo 会生成 `_00002_`（不覆盖）；脚本取文件必须按数字后缀取**最新**，或先清理旧产物（`segment_6_00001_` 与 `00002_` 同时存在时 `readdir` 排序取错会用到旧版）。
41. **人物类项目先出角色三件套**（整体母版/三视图/脸特写）再谈场景——见 §1b 硬性门槛；跳过它必然跨镜人物漂移，返工成本远高于先做资产。
42. **参考图工作流（真人-参考图生成-高清版）是 WD14 标签式参考**：参考图只被反推成文字标签，不是图像条件。参考图必须用**脸特写/高清正脸**（反推出面部标签）；用全身图当参考反推出的全是衣服场景标签 → 脸漂移。
43. **换装/三视图提示词必须写满身份词**（`young East Asian woman`、`small beauty mole at the outer corner of her right eye`、发型）；漏写 `East Asian` 三视图直接变欧洲脸（2026-08-25 实测）。三视图拆成每视角独立图，合成一张脸太小撑不住身份。
44. **Z-Image 单遍直出画质糊**（`真人-文生图` 832×1216 单遍 8 步衣服"没细节"）；出图默认走高清版管线（1024→1536 二采 denoise 0.4），要极致细节加 4x-UltraSharp。
45. **模型家族匹配**：`majicmixRealistic_v7` 是 **SD1.5**（~2GB 判据），配 SDXL InstantID 控制网报 `y is None, did you try using a controlnet for SDXL on SD1?` → 换 `sd_xl_base_1.0`。InstantID 丢眼角痣等细部、偏半身构图，静态换装不如 WD14 配方，仅剧情镜头锁脸用。角色资产生成完整手册见 `references/character-assets.md`。
46. **参考图必须"自我描述" + 资产标记**：换装/三视图提示词开头写 `the reference photo is the character's face — keep the face, hair and mole exactly the same; only change [服装/姿势/视角]`（别假设模型知道参考图内容）；单出的三视图/换装图配同名 `.txt` 旁注（参考来源+seed+要点），防止后续忘记用哪张参考导致身份不一致。
47. **FLUX 提示词写法（BFL 官方）**：FLUX.1-dev 是自然语言模型——写完整句别堆关键词、**主体在前细节在后**、**不用负面词**（CFG 1.0 + FluxGuidance 3.5）、不要 SD1.5 那套 `masterpiece/best quality` 标签。参考图一致性用 Flux Kontext（原生参考图，提示词写 `the same character as in the reference image, keeping face/hair/mole exactly the same, now ...`）。12GB 低显存用 GGUF 量化（dev/kontext Q5_K_S 各 ~7.7GB 放 unet/），nunchaku 在 ComfyUI 0.24 跑不了别折腾。详见 `references/character-assets.md`「FLUX 提示词写法」。
48. **本机出图用 Z-Image 高清管线，不要上 FLUX（2026-08-25 实测）**：12GB 显存上 FLUX Q5 GGUF 皮肤/布料细节软（量化损失）、fp8 跑不稳出图"花了"、Kontext 二采链参考尺寸不匹配崩图（只能原生 1536 无二采）。**出图生产继续用 Z-Image 高清二采管线**（`真人-参考图生成-高清版` + 高清正脸参考 + 1536 二采 + 可选 4x）；FLUX 等 24GB+ 显存再考虑。
49. **画面零文字·零错别字（用户硬性要求，2026-08-25 沉淀）**：正片画面**不得出现任何可读文字**（模型渲染中英文极易出乱码错别字）。**组合策略（禁字提示词 + 源头杜绝，二者缺一不可）**：① **提示词禁字（必要但不充分）**：Z-Image 出图 prompt 末尾必须写 `no text, no letters, no signs, no words`；H3 六段式 retention_analysis 必须含 `no readable text anywhere: fully_preserved`，detailed_description 末尾写 `no text, no letters, no signs, no subtitles`；② **分镜源头杜绝带字元素（更关键，2026-08-25 实测结论）**：分镜设计时**刻意避免**门联、横幅、招牌、电子屏幕、路牌、书本、印刷品、衣服 logo 等"天然含字"道具——画面里没有可画的字，模型就画不出错别字（本片 scene-03 门联出字即反例）；必须出现屏幕/牌子时明确写 `blank screen` / `plain signboard without any text`；③ **审片门禁**：出图选版优先无字版，有字版本直接弃用或重跑（换种子），不进下一阶段。字幕/定版字一律后期 ffmpeg 叠加（用户可要求出无字版）。
50. **开头/结尾不得黑屏（用户硬性要求，2026-08-25 沉淀）**：成片**第一帧与最后一帧必须是实际画面**，不得黑场（含 fade in/out 造成的纯黑过渡）。处理：① H3 提示词段1 开头、末段结尾避免纯黑构图（写清主体+光线）；② 成片合成后程序化检测首末帧亮度（`qa_video.py` 提帧，亮度均值过低即黑屏），黑屏则裁掉黑帧或缩短 fade（fade in/out ≤0.3s）；③ 需要黑场过渡的镜头设计应改为灰场/暗场或直接切。
51. **多段角色漂移/穿帮（用户硬性要求，2026-08-25 沉淀）**：跨段人物身份漂移（如"干部背着的 3 岁小孩"在下段变成"老人"）是 V6 多段生成常见问题。预防：① 出图阶段把关键人物特征画清楚（年龄/服装/体态鲜明），作为 `<Subject N>` 写进 subject_definitions；② 每段提示词**重复完整身份描述**（年龄+服装+特征），不缩写、不省略（H3 不看参考图默认漂移）；③ **修复成本低**：只重跑出错段（`gen_h3_v6.js` 支持 `start`/`end` 参数单段重跑，热缓存约 4–5 分钟/段），改该段提示词更明确后重跑即可，无需整链重跑。

## 本机环境速查
- ComfyUI 主实例：`C:\Users\Administrator\ComfyUI`（0.24.0，端口 8188，Z-Image/SDXL/FLUX）；**H3 实例：`D:\ComfyUI-H3`（0.33.1，端口 8190，MiniMax H3 视频）**
- 用户工作流：`C:\Users\Administrator\ComfyUI\user\default\workflows\`（真人-文生图 / 真人-参考图生成-高清版 / 风景-参考图生成-高清版 / Z-Image-Turbo-GGUF 等）；H3 工作流：`D:\ComfyUI-H3\user\default\workflows\`（**V7 导播台 `Impact_V6_单采/双采_Theodore导播台.json`** + **Impact_V6_双采_整合提示词版本**（V6 主流程）+ V6 其余 3 版 + v1–v5 存档 + minimax_h3_t2v_turbo / minimax_h3_r2v_prompt_expand 旧版）
- 模型库：`D:\download\ComfyUI_models`（diffusion_models: z_image_turbo_bf16、flux1-dev-fp8、**minimax_h3_fl2va/ref2va**；text_encoders: qwen_3_4b_fp8 / **qwen3vl_32b_minimax_h3** / clip_l / t5xxl_fp8；vae: ae / minimax_h3_video_vae_fp16 / minimax_h3_audio_vae_fp32；loras: minimax_h3_turbo_v4 / **minimax_h3_fl2v_lightx2v_turbo_4step**（分段二采，2026-08-23 已补）/ minimax_h3_fl2v_turbo_8step；upscale: 4x-UltraSharp）
- H3 分段工作流节点（2026-08-24 已装 `D:\ComfyUI-H3\custom_nodes\`）：Impact-Pack、ComfyUI-H3-Motion-Context、ComfyUI-Easy-Use、ComfyUI-KJNodes、comfyui-mixlab-nodes（TextSplitByDelimiter 已独立注册）、Nvidia_RTX_Nodes_ComfyUI（nvidia-vfx 已装）、**ComfyUI_Theodore_Director（V7 导播台，v0.1.0，需 ComfyUI ≥0.31.x）**；ComfyUI-Manager 已切 private 模式避免启动联网超时
- WD14 反推：`C:\Users\Administrator\ComfyUI\custom_nodes\ComfyUI-WD14-Tagger\models\wd-v1-4-moat-tagger-v2.onnx`；LLM 扩写 GGUF：`D:\download\LM-Studio\lmstudio-community\Qwen3.5-9B-GGUF\Qwen3.5-9B-Q4_K_M.gguf`（comfyui_LLM_party）
- GPU：RTX 4070 SUPER 12GB（cuda 可用）；RAM 32GB；Node：`D:\node.exe`
- ffmpeg/ffprobe：`D:\桌面\剪辑\高帧\ffmpeg-master-latest-win64-gpl-shared\bin\`；Python（含 PIL）可用
- DSH-better-sidebar 已装：`C:\Users\Administrator\.dsh\profiles\web\node_modules\dsh-better-sidebar`（`registerTab` 服务）
- 技能目录：`C:\Users\Administrator\.agents\skills\`

## 学习参考（3+2 工作流 3.0，存于 `references/3-2-workflow/`）
- `LEARN-NOTES.md` — 学习笔记总览：两期视频核心提炼（角色资产 + 场景资产）+ 五个开源材料摘要 + 已融入本 skill 的点 + 待跟进
- `transcript.txt` — 第 1 期（角色资产）原视频口播全文（funasr 转写，329s）
- `6_scene-assets-episode.md` — **第 2 期（场景资产）要点**：场景清单→室外拓扑图→室外节点图→户型平面图→室内宫格图→色卡的六步流程 + 金句 + 评论区算力技术点（已融入 1b-2）
- `transcript-scene-assets.txt` — 第 2 期（场景资产）口播全文（funasr 转写 + 校对，150s）
- `1_tvc-ai-director.md` — TVC 广告导演 Skill Suite 全文（brief→创意→阐述→PPM→分镜→prompt→统筹→剪辑→审片→路由）
- `2_ai-director-skill.md` — AI 短片「导演层」全文（故事功能分析→连续性→风格翻译→三锁→镜头卡→QA）
- `3_minimax-h3-broll.md` — MiniMax-H3 口播 B-roll 全文（T01-T21 模板、v1/v2/v3、安全门禁）
- `4_bilibili.json` — 原视频信息（UP主 超级AI客，5分30秒竖屏）
- `5_coze-skill.md` + `5a_coze-skill-detail.json` — 虾评平台「超哥」分镜导演 SD2.0 指南/详情
- `5d_skill.zip` + `coze-skill-extracted/` — 超哥分镜导演 SD2.0 完整技能包：SKILL.md（8 预设 STYLE_TOKEN 三层 + 八步推导 + Task0-2 流程 + 批次规则）+ 4 references（camera-movements / format-rules / shot-types / style-tokens）
- 原始视频：B站 `BV1zKgj6zEGj`；抖音 `https://v.douyin.com/i9zKVSKIm4o/`（作者「超级AI客」，评论区可领完整 skill）

## H3 提示词参考（存于 `references/h3-prompt/`）
- `h3-prompt-guide.md` — **精通指南**（本机实测+官方规范整合）：五种模式、Base 三字段 / Ref2VA 六段、运镜三维度+词表、对白/画外音/群体发言语法、防火星语（台词归属三选一、短音频音色参考、字数÷4.5表）、常见坑速查、质量自检、本机落地
- `06-main_SKILL.md.md` — h3-prompt-builder v2.2 全文（8 风格模板、多主体压缩、30+ 坑与对策、完整自检清单）
- `04-references_ref-zh.txt.txt` — 全参考（Ref2VA）六段改写官方规范（四类标签、任务类型、retention 标记、完整示例）
- `02-references_prompt-engineering.md.md` / `01-references_prompt-framework.md.md` — awesome-minimax-h3 / prompt-framework 提示词工程
- `03-main_SKILL.md.md` — minimax-h3-prompt-skill（六段骨架+逐字指令行）
- `05-main_README.md.md` / `07-main_README.md.md` — 本地/ComfyUI 提示词方案与完整示例（咖啡店场景等）
- `official-spec-example-h3-jobs.json` — **官方规范整段示例**（2026-08-25 实测，7 段竖屏 Ref2VA 六段式全量：含 `+ audio reference` summary、off-screen voiceover 画外音、retention_analysis、结尾锚点）——新项目照此模板改
- **实测结论**：H3 原生生成中文对白（voice-test：提示词写女声念「这一杯，属于你。纯粹，是唯一的奢侈。」，funasr 转写还原≈100%）

## H3 分段参考（长视频扩展，存于 `references/h3-segmented/`）
- `segmented-workflow-v6.md` — **Impact V6 分段工作流完整手册**：何时用分段、v1–v6 版本对比、Latent 传递原理、依赖节点/模型、整段脚本格式、运行流程、双采参数、加速节点、故障排查
- `character-assets.md` — **角色资产生成手册（2026-08-25）**：身份锚点管线（高清正脸→素体分视角→换装）、WD14 参考图配方、提示词身份块、InstantID 实测与模型家族坑、Z-Image 高清二采必要性
- `theodore-director-v7.md` — **V7 导播台（ComfyUI_Theodore_Director）使用手册**：节点安装/模型修补、plan_json 编辑、别名规范与 H3 限制、节点速查、续跑与后处理合并
- `demo_prompts_12segments.md` — **12 段 × 5s 完整 demo**《机器人与沙漠温室中的希望之种》(60s)：六段式提示词逐段全量范例（v2 尾帧编号格式；V6/V7 使用时应去掉尾帧指代、全部指代固定参考图）
- 资源包：`D:\dsh web 工作区\h3-segmented-workflow\`（workflows v1–v7 JSON、7 节点 .rar、demo、官方提示词指南）；V7 官方仓库 https://github.com/northern-penguin/ComfyUI_Theodore_Director ；RunningHub 体验页 https://www.runninghub.cn/post/2090022476851007490/

## Cinema DNA 电影感参考（融合自 cinema-dna-21x9x3 v1.2.2，存于 `references/cinema-dna/`）
- `SKILL.md` — 原技能全文（1218 行）：关系压力构图、视线流量、受控随机、色彩命题、三联剪辑节奏、反 CG/AI/模板化检查、片名与主题海报阶段完整规则（已提炼进 1e）
- `cinema-dna-full-spec.md` — 完整电影语法规范（48KB）
- `cinema-dna-v4-anti-ai.md` — 反 AI 电影帧补丁（10.9KB）
- 来源：GitHub `dacnay816y62-hub/cinema-dna-21x9x3`（公开）；本地工作区副本 `D:\dsh web 工作区\cinema-dna-21x9x3\`（含 examples/ 精选三联示例图，约 87MB，未随本仓库分发）

## ZY 造梦师导演库参考（融合 zy-cinematic-realism v2.1.0，存于 `references/zy-cinematic-realism/`）
- `README.md` — 整合入口：来源/版本/授权（CC BY-NC 4.0）/文件索引/升级回滚
- `references/director-routing.md` — **导演层使用规则（入口）**：iconic 强制模式、四轴签名完整性、混合/对比/推荐路由、输出块格式
- `references/directors/` — **38 位导演四轴指纹库**（`index.md` 总索引 + `recommendation-matrix.md` 按场景推荐矩阵 + 每位一个 `<slug>.md`，含 Identity/四轴指纹/常见误读/最近邻对比/Default Iconic Anchor）
- `references/style-cards.md`（16 风格卡）、`references/cinematography-cards.md`（8 摄影卡）、`references/creative-cards.md` / `creative-shuffle.md`（三卡组合与受控重组）
- `references/prompt-compiler.md` — Scene Master Schema + Transcode Lock（方法论核心，§1e-2 的锁来源）
- `references/continuity-cards.md`（Base Lock + Shot Delta）、`prompt-check.md`（生成前检查）、`result-repair.md`（Prompt Doctor）、`remix.md`（One Variable Remix）、`anti-ai-cleanup.md`、`quality-checklist.md`、`cinematic-principles.md`、`camera-and-light.md`、`negative-prompts.md`（⚠️ Z-Image 无负向，须转正向）、`examples.md`
- 来源：GitHub `popopo-99/zy-cinematic-realism`（公开，v2.1.0，CC BY-NC 4.0）；本地克隆 `D:\dsh web 工作区\zy-cinematic-realism\`（含未内置的四模型编译器与顶层 SKILL.md）
