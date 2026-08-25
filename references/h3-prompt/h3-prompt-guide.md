# MiniMax H3 提示词精通指南（本机实测 + 官方规范整合）

> 整合来源：官方格式规范（T2VA/I2VA/FL2VA/L2VA/Ref2VA）、h3-prompt-builder 技能 v2.2（`references/h3-prompt/06-main_SKILL.md.md`）、全参考改写指南（`04-references_ref-zh.txt.txt`）、本机 NOIR 项目实测（含对白验证）。
> 本机管线：`D:\ComfyUI-H3`（端口 8190）→ `gen_h3_r2v.js`（Ref2VA）+ 用户 r2v_prompt_expand 工作流（中文→LLM 扩写→英译）。

---

## 0. H3 基础规格

| 参数 | 值 |
|---|---|
| 时长 | **4–15 秒**（本机 r2v 124帧=5.17s@24fps；帧数须满足 17k+5 网格） |
| 分辨率 | 768p / 1440p（短边 768；0.98MP=1344×768 为本机实测） |
| 帧率 | 24fps |
| 音频 | **原生双声道**：人声/音效/音乐联合建模，单次前向生成（已实测中文对白） |
| TTS 语言 | 11 种（中/英/日/韩/法/德/西…） |
| 参考素材上限 | Ref2VA：≤9 图 + ≤3 视频 + ≤3 音频，总计 ≤12，每段 2–15s，音频不可单独作输入 |

## 1. 五种生成模式（按素材选择）

| 模式 | 素材 | 输出结构 |
|---|---|---|
| T2VA（文生视频） | 无 | 三字段 |
| I2VA（图生视频） | 1 首帧图 | 指令行 + 三字段 |
| FL2VA（首尾帧） | 首帧+尾帧 2 图 | 指令行 + 三字段 |
| L2VA（尾帧） | 1 尾帧图 | 指令行 + 三字段 |
| Ref2VA（全能参考） | 多图/视频/音频 | 六段结构（本机 r2v 用这个） |

## 2. Base 系三字段格式（T2VA/I2VA/FL2VA/L2VA）

```
[指令行]（I2VA/FL2VA/L2VA 必有且为第一行，后空一行；T2VA 无）

integrated_multimodal_description:
[Shot 1] [风格句] [景别] [画面+动作+运镜+对白+音效]
[Shot 2] At MM:SS.mmm, the camera cuts to ...

overall_soundscape:
[1-4 句环境音总结]

non_diegetic_music:
N/A（或 1-3 句配乐）
```

**关键帧指令行（必须逐字）**：
- I2VA: `For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.`
- FL2VA: `How the reference pictures align with the target video — Picture 1 (from Shot 1) aligns with the 0.00-second mark of the target video; Picture 2 (from Shot N) aligns with the S.SS-second mark of the target video.`
- L2VA: `How the reference pictures align with the target video — <Picture 1> (from [Shot N]) aligns with the S.SS-second mark of the target video.`

## 3. Ref2VA 六段格式（本机 r2v 推荐）

```
subject_definitions:      # 定义参考标签
<Subject 1> is the [角色] in <Picture 1>, with [外观细节].
<Audio 1> is the voice-timbre reference for <Subject 1> (S1).

summary:                  # [任务类型] + 一句话概述
[reference generation + audio reference] ...

retention_analysis:       # 保留/迁移/复用策略
<Subject 1> (appears in [Shot 1], [Shot 2]): fully_preserved - ...

detailed_description:     # 按播放顺序逐镜（350-500 英文词）
[风格句]. [Shot 1] ... <Subject 1> (S1) says: <d>[Chinese] 台词</d>

overall_soundscape:       # 环境音/物理声/非语言人声
non_diegetic_music:       # 仅观众可听的配乐
```

**任务类型（summary 第一行括号内）按实际素材声明，官方枚举**：
- `[reference generation]` — 纯画面参考（无音频参考）
- `[reference generation + audio reference]` — 画面 + 音频/对白参考（**本机所有带对白的段必须用这个**，只写 `[reference generation]` 属格式不完整）

**四类标签**：`<Subject N>` 可复用内容（人/物/场景/服装/风格/动作）｜`<Picture N>` 具体帧锚｜`<Video N>` 剪辑源/续写/结构参考｜`<Audio N>` 音频信号/音色参考。标签编号 = 实际连线顺序，赋值后全文含义不变。

**官方 Ref2VA 完整段落模板（本机实测可用，2026-08-25 起全量采用）**：

```
subject_definitions:
<Picture 1> is the fixed reference image: [一句描述参考图内容].

summary:
[reference generation + audio reference] One continuous shot starting from the reference composition: [一句话概括本段动作弧线].

retention_analysis:
<Picture 1> [构图/主体/光线/风格]：fully_preserved; [关键元素2]：fully_preserved; no readable text anywhere: fully_preserved.

detailed_description:
[Shot 1] [风格句]. [主体与场景完整自然语言描述，动作+运镜按官方运镜三维度自然融入]. An [身份描述] voice speaks clearly in an off-screen voiceover: '<d>[Chinese] 台词</d>' while his lips remain completely closed. In the final half second [收尾动作] motion fully frozen, forming a clean anchor frame. no text, no letters, no signs, no subtitles.

overall_soundscape:
[1-4 句环境音，含台词外的物理声].

non_diegetic_music:
[配器/速度/情绪弧线，中间段不终止、末段收束；无配乐写 N/A].
```

## 4. 运镜三维度（唯一官方写法）

运镜 = **运动类型 + 幅度 + 速度**，写成句内自然英语，不在句尾堆标签：

| 维度 | 可选值 |
|---|---|
| 类型 | Zoom In/Out, Push In/Pull Out, Pan L/R, Truck L/R, Tilt Up/Down, Pedestal Up/Down, Arc Shot, Tracking, Static, Shake Slightly/Strongly, POV, Roll CW/CCW |
| 幅度 | with small amplitude / with large amplitude（中等省略） |
| 速度 | at slow speed / at fast speed（正常省略） |

- 例：`The camera pushes in with small amplitude at slow speed toward the letter in her hands.`
- **Push In ≠ Zoom In**（物理推进 vs 变焦）；环绕 = `truck left + pan right`
- 只变距离/角度时优先运镜而非切镜；跨场切换才用 cross-dissolve/fade/wipe（用户明确要求）

## 5. 对白与音频语法（重点：H3 真能出对白）

| 语法 | 写法 |
|---|---|
| 说话人 ID | `(S1)` `(S2)` 跨镜稳定；多人齐说 `(S1,S2)`；不发声角色不给 ID |
| 对白 | `<d>[语言] 原文内容</d>`（逐字保留原文语言，不翻译） |
| 首次出现 | 给身份信息：类型/年龄/性别/音高/音色/语速/口音 |
| 画外音 | `An [身份] voice speaks clearly in an off-screen voiceover: '<d>...</d>' while his/her lips remain completely closed.`（**官方逐字语法，双保险防火星语**；本机实测：旁白类对白必须用这个句式，否则模型可能让画面人物张嘴对白导致火星语） |
| 跨切对白 | 连接点 `<scenetrans>` + `continues seamlessly across the cut` |
| 句尾截断 | `<cutoff>` |
| 画面可见文字 | 英文双引号包裹逐字保留：`A sign reading "营业中"` |
| 音色参考 | Ref2VA 首次台词标注 `, using the voice timbre referenced from <Audio N>, says:`，后续可省 |

**台词字数硬规则**：中文语速 ~4.5 字/秒，`台词字数 ÷ 4.5 ≤ 镜头时长`（3s≤13字 / 4s≤18字 / 5s≤22字 / 6s≤27字 / 8s≤36字 / 10s≤45字）。

**音频字段分工**：台词/歌词只写 `<d>`；环境音+物理声+非语言人声 → `overall_soundscape`；仅观众可听配乐 → `non_diegetic_music`（写配器/速度/动态，不用抽象情绪词）；全程静音写 `N/A`。角色可闻的唱歌/收音机音乐是剧情内事件，写进画面描述。

## 6. 数字人对口型 · 防火星语（涉及人物台词必读）

**台词归属三选一，禁止缺省**：
1. 口型同步：角色露脸、嘴部清晰 → `speaks to the camera` + `<d>`；手持产品用胸前持物中近景（嘴入镜），不用纯手部特写
2. 明确画外音：`off-screen voiceover` + `lips remain completely closed`
3. 无台词：纯产品 B-roll 不放 `<d>` 标签

配套规则：
- **音色参考首选短音频（≤8s）**：只提取音色，`<d>` 时间线唯一主导，零冲突；长参考（≈视频时长）会映射时间结构引发双重起音/音节杂交/吞字
- 嘴部约束只用正面描述：`lips barely parting for each word` / `lips rest softly together`；负面句式（never showing teeth）会被反向聚焦导致呲牙
- CTA 避免四字连读（"限时抢购"易口胡）→ 改"抢购吧"等短促词
- 特效字：medium-weight elegant sans-serif + subtle semi-transparent dark stroke + 低饱和莫兰迪色（柔金 #BFAA82 / 暖白 #E8E2D8 / 灰绿 #9AAA9C / 柔砖红 #BC7A68）

## 7. 常见坑速查（本机 + 官方精选）

1. 只写一段话没分段 → 按三字段/六段拆
2. 上传素材没说用途 → 补标签定义（`<Picture 1>` 是 XX）
3. 纯文生提示词太短 → 写齐主体外观+场景+动作+风格
4. 台词超长口型崩 → 字数÷4.5≤时长
5. 用了 `@图片1` → 官方标签 `<Picture N>`/`<Subject N>`/`<Audio N>`
6. 想保持主角一致没传图 → 必须上传人物参考图
7. 循环视频没收尾 → 加 `The final action returns to the starting pose, allowing seamless looping.`
8. 数字人火星语 → 台词归属三选一写清楚
9. 音色杂交/双起音 → 短音频参考（≤8s）根治
10. 音频超 15s 口胡 → 控制在 14–15s，重录不补救
11. 参考音频必须与 `<d>` 内容一致（长参考时），否则混读
12. 本机实测：直接写"an elegant female voice speaks clearly: '<d>…</d>'"，H3 5s 段正确生成中文台词（funasr 转写还原率≈100%）

## 8. 质量自检清单（写完逐项过）

- [ ] 模式正确（素材 ↔ 模式匹配）
- [ ] 格式完整（Base 三字段 / Ref2VA 六段）
- [ ] 指令行第一行且逐字正确
- [ ] `[Shot 1]` 无时间戳，后续递增且在总时长内
- [ ] 运镜只用官方词表 + 三维度自然融入
- [ ] `<d>[语言] 原文</d>`，说话人 ID 稳定
- [ ] 画外音含嘴唇闭合说明
- [ ] 音色来源首次标注
- [ ] 台词字数 ÷4.5 ≤ 镜头时长
- [ ] overall_soundscape / non_diegetic_music 有内容或 N/A
- [ ] 无 BGM 写 `non_diegetic_music: N/A`（不写"无背景音乐"）
- [ ] 台词归属三选一，无缺省；reference 模式台词覆盖全程无空档

## 9. 本机落地

- 现有 `gen_h3_r2v.js <scene> <prompt>`：prompt 即上文的 detailed_description（可含 `<d>` 对白）
- 提示词可以超长多行（含六段结构），脚本原样传入
- 环境声广告（无对白）：提示词写 ambient hum/drips 等即可；连续剧：写 `<Subject N> (S1) says, <d>[Chinese] …</d>`
- 英文为主体描述，对白保留中文原文字语言
- **官方规范整段示例**（2026-08-25 实测通过，7 段竖屏宣传片全量 Ref2VA 六段式）：`official-spec-example-h3-jobs.json`（含 summary `[reference generation + audio reference]`、off-screen voiceover 画外音句式、retention_analysis 逐项 fully_preserved、结尾半秒静止锚点）——新项目照此模板改主体/场景/台词即可
