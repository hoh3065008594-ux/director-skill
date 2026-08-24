# 角色资产生成手册（2026-08-25 实测沉淀）

> 来源：长剧情女角色资产测试（林晚）全流程实测。结论可直接复用，勿重蹈覆辙。

## 一句话结论

本机做角色一致性最稳的配方：**高清正脸（身份锚点）→ 素体分视角（体型锚点）→ 换装**，全程用《真人-参考图生成-高清版》工作流，**参考图 = 高清正脸**，提示词写满身份词。Z-Image 系没有真·图像条件（无 IPAdapter/InstantID 生态），InstantID 路线已装通但静态换装细节不如该配方。

## 管线（先锁锚点，后换装）

| 步骤 | 产出 | 工作流 | 要点 |
|---|---|---|---|
| ① 高清正脸图 | 身份锚点 | `真人-文生图-高清版.json`（1024→1536 二采） | 正面、额头到下巴完整；提示词含全部身份特征（亚洲脸/发型/眼角痣/气质） |
| ② 素体分视角 | 体型锚点 | `真人-参考图生成-高清版.json`，参考=① | **每视角独立一张全身图**（正/侧/背），不要合成一张（脸太小撑不住身份） |
| ③ 换装 | 服装变体 | 同上，参考=① | text_b 写身份 + 服装描述；每套一个别名进导播台素材库 |

参考图统一放 `ComfyUI/input/`（如 `char_face_hd.png`），text_b 用 UTF-8 无 BOM。**每张产出配同名 `.txt` 旁注**：参考图来源 + seed + 提示词要点（防止后续忘记参考是谁）。

### 参考图描述块（text_b 开头固定加这段）

```text
The reference photo is the character's face — keep the face, hair and the mole at the right eye corner exactly the same; only change the [outfit / pose / viewing angle] described below.
```

即使参考图就是脸，也要明确写"别动脸"，否则模型可能自行改脸型/五官。

## 关键教训（避坑）

1. **WD14 是"标签式参考"，不是图像条件**：参考图只被 WD14 反推成文字标签拼进提示词。因此参考图**必须用脸特写/高清正脸**——全身图反推出的全是衣服/场景标签，脸没被描述 → 跨图漂移（本项目最初用全身母版当参考，脸一路飘）。
2. **提示词必须写满身份词**：`young East Asian woman` + `small beauty mole at the outer corner of her right eye` + 发型/气质。三视图或全身构图里脸占比小，WD14 标签撑不住身份，必须文本点明（实测漏写 East Asian → 三视图变欧洲脸）。
3. **三视图拆独立图**：合成一张三视图每视角脸太小，身份必然丢失。
4. **Z-Image 单遍直出画质糊**：`真人-文生图.json`（832×1216 单遍 8 步）衣服质感差（"没细节"）；必须走高清版管线（1024→1536 二采 denoise 0.4），要极致细节再开 4x-UltraSharp。
5. **模型家族必须匹配**：`majicmixRealistic_v7.safetensors` 是 **SD1.5**（~2GB 大小即判据；SDXL 是 6.5GB 级），配 SDXL 的 InstantID ControlNet 报 `y is None, did you try using a controlnet for SDXL on SD1?` → 换 `sd_xl_base_1.0.safetensors`（本机已有）即通。
6. **InstantID 路线实测**（已装通，模型在 D 盘）：节点 `ComfyUI_InstantID` + insightface 1.0.1（py3-none-any wheel，Python 3.12 可装）+ onnxruntime-gpu；模型 `ip-adapter.bin`（models/instantid）、`controlnet/instantid/diffusion_pytorch_model.safetensors`、antelopev2（models/insightface/models/antelopev2）。**坑**：`folder_paths.models_dir` 指向 C 盘 → 用目录联接 `mklink /J` 把 `C:\...\models\instantid`、`models\insightface` 指到 D 盘（零数据占 C）；参考官方 CFG 4-5、weight 0.8、1016×1016 防水印。效果：脸能锁，但**丢眼角痣等细部**（身份嵌入不保）、构图偏半身、写实质感一般 → 静态换装不如 WD14 配方；适合剧情镜头需要任意姿势锁脸的场景。
7. **审片用 serve_review.js**（`references/review-panel/`）：assets/generated 按 `scene-NN_变体号_.png` 命名，4s 轮询，多版本同场景对比；改 SCENES/SCENE_META 后重启。
8. **官方提示词规范**：Z-Image 官方 6 段式（Subject / Scene / Composition / Lighting / Style / Constraints），Qwen3 编码器偏好**长句自然语言**（非逗号堆词）；majicmix 官方负词表（painting/extra fingers/mutated hands/…）可复用于 SDXL。
9. **参考图必须"自我描述" + 资产标记（2026-08-25 追加）**：
   - **提示词里明确写参考图内容与不可动项**：如 `the reference photo is the character's face — keep the face, hair and mole exactly the same; only change [服装/姿势/视角]`。不要假设模型知道参考图里是什么，WD14 标签可能不全，必须文本点明"参考图 = 人物正脸，别动脸"。
   - **单出的三视图/换装图必须标记参考来源**：每张生成图配同名 `.txt` 旁注（参考图文件名、seed、提示词要点），或写进 manifest / 资产账本（`ref:` 字段）。否则后续重出/换视角时会忘记当初用的哪张参考，导致身份不一致。

## FLUX 提示词写法（BFL 官方，2026-08 沉淀）

FLUX.1-dev 是**自然语言模型**（T5-XXL 编码器），官方提示词原则：

1. **自然语言完整句**，不要逗号关键词堆砌，**不要** SD1.5 那套 `masterpiece / best quality / 8K` 标签堆叠。
2. **主体在前、细节在后**（词序重要）：先说"谁/什么"，再依次说服装、动作、场景、镜头、画质。例：`A professional photograph of a young East Asian woman with long golden hair and a mole at the eye corner, wearing [服装], standing in [场景], soft window light, 85mm lens, shallow depth of field, full body shot, highly detailed and photorealistic.`
3. **dev 版不用负面词**：CFG 1.0 + FluxGuidance 3.5，负面提示词留空（rectified flow，不是 SD 的 classifier-free 负词机制）。
4. **参考图一致性用 Flux Kontext**（FLUX 原生参考图机制，比 IPAdapter 更适合角色，无需额外 vision 模型）：提示词写 `the same [角色] as in the reference image, keeping face/hair/mole exactly the same, now [改动]`。
5. **12GB 低显存跑 FLUX 用 GGUF 量化**：`flux1-dev-Q5_K_S.gguf`（文生图）与 `flux1-kontext-dev-Q5_K_S.gguf`（参考图），各 ~7.7GB，放 `models/unet/`；本机 ComfyUI-GGUF 的 `UnetLoaderGGUF` 已可用。**nunchaku 在 ComfyUI 0.24 跑不了**（需 0.3x），别折腾，用 GGUF 代替。

### 本机实测结论（2026-08-25，重要）

**12GB 显卡 + 出图质量 → 放弃 FLUX，用回 Z-Image 高清二采管线**：

- FLUX dev **Q5_K_S**（GGUF）：能跑，但**皮肤/布料细节软**（量化损失，RAW+纹理词+28 步也救不回）。
- FLUX dev **fp8**（16GB）：12GB 显存跑不稳，出图"花了"，弃。
- **Kontext 参考图**：1024 生成 + latent 二采 → 参考 latent 尺寸不匹配**崩图**；改原生 1536 生成（无二采）+ 4x 才正常，但皮肤细节仍不如 Z-Image。
- **结论**：本机出图生产流程继续用 **Z-Image 高清二采管线**（`真人-参考图生成-高清版` + 高清正脸参考 + 1536 二采 + 可选 4x），FLUX 等有 24GB+ 显存再考虑。已下载的 GGUF 模型（dev/kontext Q5）与 fp8 保留在 D 盘，未删，暂不使用。

## 可复用产物（测试后已删，重建很快）

- 提交脚本：`submit_8188.py`（UI→API 转换、widgets_values 覆盖 `id:idx:file`、轮询、下载）——按上述工作流重建即可。
- 审片服务器：`serve_review.js` + `review.html` 模板（references/review-panel/）。
- 提示词模板：见本手册第 2 条身份块 + 官方 6 段式。
