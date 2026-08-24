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

参考图统一放 `ComfyUI/input/`（如 `char_face_hd.png`），text_b 用 UTF-8 无 BOM。

## 关键教训（避坑）

1. **WD14 是"标签式参考"，不是图像条件**：参考图只被 WD14 反推成文字标签拼进提示词。因此参考图**必须用脸特写/高清正脸**——全身图反推出的全是衣服/场景标签，脸没被描述 → 跨图漂移（本项目最初用全身母版当参考，脸一路飘）。
2. **提示词必须写满身份词**：`young East Asian woman` + `small beauty mole at the outer corner of her right eye` + 发型/气质。三视图或全身构图里脸占比小，WD14 标签撑不住身份，必须文本点明（实测漏写 East Asian → 三视图变欧洲脸）。
3. **三视图拆独立图**：合成一张三视图每视角脸太小，身份必然丢失。
4. **Z-Image 单遍直出画质糊**：`真人-文生图.json`（832×1216 单遍 8 步）衣服质感差（"没细节"）；必须走高清版管线（1024→1536 二采 denoise 0.4），要极致细节再开 4x-UltraSharp。
5. **模型家族必须匹配**：`majicmixRealistic_v7.safetensors` 是 **SD1.5**（~2GB 大小即判据；SDXL 是 6.5GB 级），配 SDXL 的 InstantID ControlNet 报 `y is None, did you try using a controlnet for SDXL on SD1?` → 换 `sd_xl_base_1.0.safetensors`（本机已有）即通。
6. **InstantID 路线实测**（已装通，模型在 D 盘）：节点 `ComfyUI_InstantID` + insightface 1.0.1（py3-none-any wheel，Python 3.12 可装）+ onnxruntime-gpu；模型 `ip-adapter.bin`（models/instantid）、`controlnet/instantid/diffusion_pytorch_model.safetensors`、antelopev2（models/insightface/models/antelopev2）。**坑**：`folder_paths.models_dir` 指向 C 盘 → 用目录联接 `mklink /J` 把 `C:\...\models\instantid`、`models\insightface` 指到 D 盘（零数据占 C）；参考官方 CFG 4-5、weight 0.8、1016×1016 防水印。效果：脸能锁，但**丢眼角痣等细部**（身份嵌入不保）、构图偏半身、写实质感一般 → 静态换装不如 WD14 配方；适合剧情镜头需要任意姿势锁脸的场景。
7. **审片用 serve_review.js**（`references/review-panel/`）：assets/generated 按 `scene-NN_变体号_.png` 命名，4s 轮询，多版本同场景对比；改 SCENES/SCENE_META 后重启。
8. **官方提示词规范**：Z-Image 官方 6 段式（Subject / Scene / Composition / Lighting / Style / Constraints），Qwen3 编码器偏好**长句自然语言**（非逗号堆词）；majicmix 官方负词表（painting/extra fingers/mutated hands/…）可复用于 SDXL。

## 可复用产物（测试后已删，重建很快）

- 提交脚本：`submit_8188.py`（UI→API 转换、widgets_values 覆盖 `id:idx:file`、轮询、下载）——按上述工作流重建即可。
- 审片服务器：`serve_review.js` + `review.html` 模板（references/review-panel/）。
- 提示词模板：见本手册第 2 条身份块 + 官方 6 段式。
