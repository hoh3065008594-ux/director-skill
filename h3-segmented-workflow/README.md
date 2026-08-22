# H3 分段参考生视频工作流（Impact V6）— 资源包精简说明

> 工作流版权：B站UP **南极来の企鹅** 与 抖音 **Theodore**（抖音号 q1503623946）。仅允许非商业行为与传播，分享请注明出处，禁止倒卖。技术交流 QQ 群：1104337287。
> 本目录是工作流 JSON 的版本备份 + 依赖清单；**详细使用见 SKILL.md 的「2b. 视频生成（MiniMax H3 分段 V6 · 主流程）」** 及 `references/h3-segmented/` 手册。

## 一、这是什么

解决 H3 官方模板**单次只能生成 5–15 秒**的限制：把长视频拆成多段逐段生成，用 **Impact Pack 队列控制**避免内存堆积（实测能跑 50 段 × 15s），**V6 段间 Latent 传递**（22 帧视频 + 24 帧音频上下文，约 1s 代价）保证连续性与一致性；支持参考图/视频/音频生视频与**双采**高清。

## 二、工作流版本清单（`workflows/`）

| 版本 | 文件 | 说明 |
|---|---|---|
| v1 | `1_For循环版/H3分段参考生视频模板.json` | For 循环，内存堆积，仅少量段用 |
| v2 | `2_Impact队列版/H3分段参考生视频模板(ImpackPack队列版).json` | Impact 队列控制，解决内存堆积 |
| v2 demo | `2_Impact队列版/demo_机器人与沙漠温室中的希望之种.json` | 12 段 × 5s 完整 demo（含全部六段式提示词） |
| v3 | `3_全加速节点版/*.json` | 融入 Turbo LoRA / Sage Attention / LowVRAM |
| v4 | `4_Impact_v4/*.json`（3 个） | 段数/每段时长完全自由；含整段提示词输入版 |
| v5 | `5_Impact_v5/*.json`（3 个） | 新增双采（RTX 1.5× 二采）；尾帧参考衔接 |
| **v6（当前）** | `6_V6/Impact_V6_双采_整合提示词版本.json` | **推荐**：二采 + 整段脚本一次填入（`===` 分段） |
| v6 | `6_V6/Impact_V6_单采_整合提示词版本.json` | 单采省时 + 整段脚本 |
| v6 | `6_V6/Impact_V6_双采.json` / `Impact_V6_单次采样.json` | 二采/单采 + 逐段独立提示词 |

> ⚠️ 已把所有工作流的 UNETLoader 模型名统一为 **`minimax_h3_ref2va_pruned_int8_convrot.safetensors`**（int8 变体，本机实测跑通）；如需 fp8_scaled 请自行改回。

## 三、节点依赖清单（装到 `D:\ComfyUI-H3\custom_nodes\`，ComfyUI ≥ 0.30.0）

| 节点包 | 用途 | 本机状态 |
|---|---|---|
| **ComfyUI-Impact-Pack** | 队列控制（QueueTrigger/Branch/ExecutionOrderController/SetWidgetValue） | ✅ 已装（补 piexif 等依赖） |
| **comfyui-h3-motion-context** | V6 Latent 传递核心（Load/Context/Trim/Save Latent） | ✅ 已装（作者 NikoDemon80） |
| **comfyui-minimax-h3-turbo** | TurboSampler / TurboLoRA | ✅ 已有 |
| **ComfyUI-Easy-Use** | easy indexAnything/mathInt/compare/convertAnything | ✅ 已装 |
| **ComfyUI-KJNodes** | SaveImageKJ / LoadImagesFromFolderKJ / SaveVideo / Sage Attention | ✅ 已装 |
| **comfyui-mixlab-nodes** | 辅助；TextSplitByDelimiter 已独立注册（见下） | ✅ 已装 |
| **Nvidia_RTX_Nodes_ComfyUI** | RTXVideoSuperResolution（双采前置） | ✅ 已装（pip install nvidia-vfx） |

**修复记录**：
- `TextSplitByDelimiter` 在 mixlab 懒注册失效（ChatGPT.py 依赖 openai/swarm）→ 已独立注册为 `custom_nodes/comfyui-mixlab-nodes/nodes/text_split_by_delimiter.py`；重装 mixlab 后需重打补丁。
- ComfyUI-Manager 启动联网超时会崩服务 → `user/__manager/config.ini` 设 `network_mode = private`。

## 四、模型清单（`D:\download\ComfyUI_models\`）

| 模型 | 放置目录 | 本机状态 |
|---|---|---|
| `minimax_h3_ref2va_pruned_int8_convrot.safetensors` | diffusion_models/ | ✅ 已有 |
| `minimax_h3_fl2va_pruned_int8_convrot.safetensors` | diffusion_models/ | ✅ 已有（T2V/I2V 用） |
| `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` | text_encoders/ | ✅ 已有（CLIP type=minimax） |
| `minimax_h3_video_vae_fp16.safetensors` | vae/ | ✅ 已有 |
| `minimax_h3_audio_vae_fp32.safetensors` | vae/ | ✅ 已有 |
| `minimax_h3_turbo_v4_step600_ema.safetensors` | loras/ | ✅ 已有（一采 Turbo，需 Turbo 采样器） |
| `minimax_h3_fl2v_lightx2v_turbo_4step_v0.1_comfy_resized_avg_rank_21_bf16.safetensors` | loras/ | ✅ 已补（二采 LoRA） |

## 五、快速使用（详见 SKILL.md 2b 十步标准操作）

1. 启动 H3 实例（`D:\ComfyUI-H3`，端口 8190）→ 浏览器开 http://127.0.0.1:8190
2. 加载 `workflows/6_V6/Impact_V6_双采_整合提示词版本.json`
3. ImagePass 传参考图 → 桥接 `ref_image_N`（demo 映射：1=主角 / 2=怪兽 / 3,4=场景）
4. `一次性填入全部分段脚本`：`## 第 NN 段` / `& 秒数 &` / 六段式提示词 / 单独一行 `===`；`分段数量` 一致
5. `运行名称` 每次必改 → **点一次 Queue** 自动逐段跑完（产物在 `output/MiniMaxH3_segments/<运行名>/`）
6. concat 无缝拼接成片（段间已 Latent 衔接）

**时长规划**：N 段实际总时长 ≈ `N×5 − 0.92×(N−1)` 秒（每段扣 22 帧上下文）。30s 广告 → 7 × 5s ≈ 30.5s。

## 六、本机实测（2026-08-23）

- 段1 124 帧 5.17s（230s，含音频）；段2 LoadLatent + MotionContext(22帧/24音频) + Trim → 102 帧 4.25s（280s）
- 产物副本：`D:\dsh web 工作区\h3-segmented-workflow\test-output\2seg_segment1_5.17s.mp4` / `2seg_segment2_4.25s.mp4`
- 坑：latent 路径约定（Save prefix 以 `/clip` 结尾、Load 传目录 `/latent_context` + `clip_index=段号`）；`context_length` 枚举必须传字符串（`"22"`）

## 七、原始资源链接（作者持续更新，当前 V6）

- RunningHub 体验页：https://www.runninghub.cn/post/2090022476851007490/?inviteCode=cfu6msiz
- 夸克网盘（工作流+skill）：https://pan.quark.cn/s/f15b100b7c31?pwd=jcvL（提取码 jcvL）
- 百度网盘（工作流+skill）：https://pan.baidu.com/s/16p88moBn8AW1C9OQvxhDTA（提取码 g3cc）
- 夸克网盘（节点包）：https://pan.quark.cn/s/061c1e9cc2b8?pwd=bx8c（提取码 bx8c）
- 百度网盘（节点包）：https://pan.baidu.com/s/1uL5eWbyr7zv7PNF4h_t7uA?pwd=5pwe（提取码 5pwe）

## 版权

工作流版权归原作者（南极来の企鹅 / Theodore），本目录仅供个人备份与使用；分享请注明出处，禁止倒卖，仅允许非商业行为与传播。**本仓库为私人仓库，请勿公开。**
