# Z-Image / Z-Image Turbo 官方提示词书写规范（本机落地）

> 来源：阿里 Tongyi-MAI 官方模型卡 + [zimage.design 上手指南](https://zimage.design/zh/blog/getting-started-with-z-image/) + [zimageturbo.ai 提示词指南](https://zimageturbo.ai/zh/z-image-turbo-prompts) + [fal.ai Prompt Guide](https://fal.ai/learn/devs/z-image-turbo-prompt-guide) + HuggingFace Qwen3-encoder 实测文档。
> 本机：ComfyUI 主实例(8188) `z_image_turbo_bf16.safetensors` + `qwen_3_4b_fp8_mixed`(type=`lumina2`) + `ae.safetensors`，8 步 res_multistep/simple/cfg=1。

## 0. 与 SD/FLUX 最关键的三个差异（写提示词前必读）

1. **无 CFG → 没有负面提示词**。Turbo 是 few-step 蒸馏模型，推理不用 classifier-free guidance，negative prompt 不生效。**所有约束必须写进正向提示词**（"不想要什么"改写成"要什么"，或用简短负面句：`no extra fingers`）。
2. **Qwen3 LLM 编码器偏好长自然语言**：完整句子 > 关键词堆叠。像给 LLM 写 brief 一样写描述，主体在前、细节在后，而不是 SD 那种逗号标签流。
3. **原生中英双语图内文字渲染**：需要图内文字时把**准确文字加英文双引号**并注明语言（`large readable title text "AI DESIGN WEEK", small Chinese subtitle "智能设计周"`），文字保持简短，版式漂移更少。

## 1. 官方分层结构（六类组件，按序组织）

| 组件 | 作用 | 示例 |
|---|---|---|
| Subject Specification | 定义主体（谁/什么） | `An elderly gardener with weathered hands` |
| Environmental Context | 建立环境/场景 | `in a Victorian garden at morning, dappled sunlight` |
| Visual Style | 风格/媒介/镜头 | `shot on Leica M6 with Kodak Portra 400 film grain` |
| Composition | 构图/焦点/视角 | `centered product, rule of thirds, three-quarter view` |
| Light & Material | 光线与材质（只写真影响画面的） | `soft morning window light, warm stone, subtle water droplets` |
| Constraints & Localization | 负面限制 + 图内文字 | `no extra fingers` / `title text "…", Chinese subtitle "…"` |

> 组织顺序建议（zimageturbo 版）：**先主体与构图 → 再光线/媒介/材质 → 最后文字与限制**。每轮只改少量变量便于对比；多数生产提示词一个聚焦段落即可，不堆多个互不相关的想法。

## 2. 本机 ComfyUI 工作流对照（`gen_zimage.js` 八层 prompt 的官方化改写）

本机八层结构（Subject→Action→Environment→Composition→Camera→Lighting→Color Palette→Style Reference）**与官方分层兼容**，但必须按官方习惯写成**自然语言完整句**，禁止纯逗号标签：

- ✅ 官方式（完整句 + 主体在前）：
  `A village cadre in an orange emergency vest points at a cracked hillside and shouts, villagers with luggage hurry past on a dry stone lane, overcast overcast daylight, shot on 35mm documentary photography with fine grain, vertical 9:16 composition, no text, no letters, no signs.`
- ❌ SD 式（关键词堆叠）：
  `orange vest cadre, shouting, cracked hillside, villagers, luggage, stone lane, overcast, documentary, 35mm, grain, 9:16, no text`

要点：
- 主体与关键动作放句首；环境/光线/风格随后；限制词收尾。
- 负面限制写**具体简短**（`no extra fingers` / `no readable text` / `no signs`），不堆长串泛化词。
- 本机竖版画布 832×1216 / 横版 1216×832；视频锚图 768×1344（H3 短边 768 面积上限）。
- 本机惯例：`Vertical 9:16 documentary realism still frame.` 作为开篇风格句可保留（等价官方 Visual Style 层），后面必须接完整自然语言主体句。

## 3. 图内文字（需要时才写）

- 准确文字加双引号 + 注明语言；文字尽量短、高对比、位置明确；不要大段文字。
- 宣传片铁律（本机 director 项目）：**正片素材一律 `no text, no letters, no signs` 禁字**，定版字/字幕后期 ffmpeg 叠加（SD 系渲染文字差，且防错字）。

## 4. 参数（官方 + 本机）

| 参数 | 值 |
|---|---|
| 步数 | Turbo 8 步（res_multistep / simple / cfg=1） |
| 分辨率 | 512–2048 任意宽高比；本机 832×1216（竖）/ 1216×832（横） |
| 参考图管线 | WD14 标签式参考（反推为文字标签）：参考图必须高清正脸/特征清晰，提示词写满身份词 |

## 5. 自检清单

- [ ] 无负面提示词（约束全部在正向里）
- [ ] 自然语言完整句，主体在前、细节在后
- [ ] 一个主体 + 一个主要视觉目标
- [ ] 图内文字加了引号并注明语言（或明确禁字）
- [ ] 负面限制具体简短
- [ ] 竖版/横版画布与目标一致
