# H3 长视频分段生成工作流（Impact V6 · Latent 传递 · 双采）

> 工作流作者：B站UP 南极来の企鹅 与 抖音 Theodore。版权：仅允许非商业行为与传播，分享请注明出处，禁止倒卖。交流 QQ 群：1104337287。
> 本文件是 director skill 的长视频扩展：当单段 H3（≤15s）不够、需要**连续长片**（>15s、多镜头叙事、角色跨镜一致）时使用。
> 完整资源包：`D:\dsh web 工作区\h3-segmented-workflow\`（workflows v1–v6 JSON、7 个节点 .rar、demo、文档）。

## 1. 什么时候用分段工作流

| 场景 | 用单段 r2v（2b 章节） | 用分段 V6 工作流 |
|---|---|---|
| 单镜头 ≤15s（B-roll、口播配画、单个动作） | ✅ | — |
| 总时长 >15s（30s 广告 6 镜、60s 短片 12 段） | ❌ 接不上 | ✅ |
| 多镜头叙事且要求**跨镜一致**（同角色/同场景延续） | ❌ | ✅ |
| 需要**双采高清**（RTX 1.5× 二采） | 手动两遍 | ✅ 内置 |

核心卖点：**Impact 队列控制**无内存堆积（能跑第 2 段就能跑 50 段）+ **段间 Latent 传递**（V6）保证画面/音频连续性。

## 2. 版本选择（v1 → v6）

| 版本 | 衔接方式 | 提示词规则 | 备注 |
|---|---|---|---|
| v1 For循环 | 尾帧 | 尾帧占 `<Picture 1>` | ❌ 内存堆积 |
| v2–v4 Impact队列 | 尾帧 | 同上；v4 段数/时长完全自由 | 只维护 Impact 版 |
| v5 | 尾帧 + 双采 | 同上 | 有双采 |
| **v6（当前）** | **Latent 传递** | **全部指代固定参考图** | ✅ 推荐，4 子版本 |

V6 四子版本（`workflows/6_V6/`）：
- `Impact_V6_双采_整合提示词版本.json` — **推荐**：二采 + 整段脚本一次填入
- `Impact_V6_单采_整合提示词版本.json` — 单采省时 + 整段脚本
- `Impact_V6_双采.json` — 二采 + 逐段独立提示词
- `Impact_V6_单次采样.json` — 单采 + 逐段独立提示词

## 3. V6 原理（为什么比尾帧好）

- 第 1 段：原始 Ref2VA conditioning（固定参考图）；
- 第 2 段起：读取上一段**第一采联合音视频 Latent**（`MiniMaxH3MotionContextLoadLatent`），注入 **22 帧视频 + 24 帧音频** Motion Context（约 1 秒代价）继续生成；
- 一采以基础分辨率保存 AV Latent（`MiniMaxH3MotionContextSaveLatent` → `output/.../latent_context/clip_XXXXX.safetensors`）；
- 二采改用**原始 Ref2VA 条件**做 1.5× 低降噪精修，不注入基础分辨率 keyframe（避免参考行数与高清 latent 布局失配）；
- 成片前 `MiniMaxH3MotionContextTrim` 裁掉重复上下文；上一段尾帧**不再参与生成**（ref_image_0 为可选静态参考）。

**提示词含义**：V6 提示词全部指代用户传入的固定参考图，**不写**"参考图 1 是上一段尾帧"（V5 及以前才需要）。

## 4. 依赖节点（装到 H3 实例 `D:\ComfyUI-H3\custom_nodes\`，需 ComfyUI ≥ 0.30.0）

| 节点包 | 用途 | 源 |
|---|---|---|
| ComfyUI-Impact-Pack | 队列控制（QueueTrigger/ConditionalBranch/ExecutionOrderController/SetWidgetValue） | ltdrdata |
| comfyui-h3-motion-context | **V6 Latent 传递核心**（Load/Context/Trim/Save Latent） | NikoDemon80 |
| comfyui-minimax-h3-turbo | TurboSampler / TurboLoRA | 作者打包 |
| ComfyUI-Easy-Use | easy indexAnything/mathInt/compare/convertAnything | yolain |
| ComfyUI-KJNodes | SaveImageKJ / LoadImagesFromFolderKJ / SaveVideo / Sage Attention | kijai |
| comfyui-mixlab-nodes | 辅助（UUID 索引节点） | shadowcz007 |
| comfyui_nvidia_rtx_nodes | RTXVideoSuperResolution（双采前置） | NVIDIA |

模型（`D:\download\ComfyUI_models` 已具备大部分）：ref2va diffusion、qwen3vl_32b CLIP（type=minimax）、video/audio VAE、`minimax_h3_turbo_v4_step600_ema`（一采 Turbo LoRA，需 Turbo 采样器；本机已有 turbo_v4）、`minimax_h3_fl2v_lightx2v_turbo_4step_*`（二采 LoRA）。
> 一采 LoRA（779MB）在分享包 `3_全加速节点版/lora模型/`、二采 LoRA（315MB）在 `5_Impact_v5/二采的lora/`——本地资源包未含大模型文件，需从夸克/百度分享链接下载放入 `models/loras/`。

## 5. 整段脚本格式（V6 整合提示词版本）

只在 **`一次性填入全部分段脚本`**（PrimitiveStringMultiline）填一次：

```text
## 第 01 段
& 5 &
<第 01 段完整 H3 提示词（六段式）>

===

## 第 02 段
& 8 &
<第 02 段完整 H3 提示词>

===
...
```

规则：
1. 段间**单独一行 `===`**；
2. 每段 = 标题行 + `& 时长秒数 &` + 提示词正文；
3. `分段数量` 必须与 `===` 拆出的段数一致；
4. 每段时长 5–15s（自动 clamp），帧数吸附 `17n+5`（24fps）；
5. 时长可逐段不同。

## 6. 运行流程（标准操作步骤）

1. **启动并打开**：H3 实例（D:\ComfyUI-H3，端口 8190）后台运行 → 浏览器开 `http://127.0.0.1:8190`；
2. **加载工作流**：Workflow 下拉选 `Impact_V6_双采_整合提示词版本`（或拖入 `D:\ComfyUI-H3\user\default\workflows\Impact_V6_双采_整合提示词版本.json`），等无红色未找到节点；
3. **传参考图**：双击各 `ImagePass` 上传/选择，确认桥接到 `MiniMaxH3ReferenceToVideo.ref_image_N` 对应槽位（demo 映射：1=主角、2=怪兽、3/4=场景；ref_image_0 可选静态参考）；
4. **规划段数/时长**：按 `N段总时长 ≈ N×5 − 0.92×(N−1) s` 反推（例：30s → 7×5s ≈ 30.5s）；每段 5–15s 自动 clamp，帧数吸附 17n+5；
5. **填整段脚本**：`一次性填入全部分段脚本` 按 `## 第 NN 段` / `& 秒数 &` / 六段式提示词 / 单独一行 `===` 分隔写完；V6 提示词全部指代固定参考图，不写尾帧；
6. **设参数**：`运行名称`（每次必改，防读旧 latent）、`分段数量`（与 === 拆段数一致）、`基础随机种子`、Resolution Selector（默认 0.4MP 16:9）；
7. **点一次 Queue**：自动逐段执行——保存 MP4+尾帧 → 保存 Latent → 更新段号 → 自动提交下一段；全部结束段号归零；期间保持单页面、不切工作流；
8. **失败处理**：任一段失败段号保持不变 → 修复后重新 Queue 只重试该段；
9. **取产物**：`ComfyUI/output/MiniMaxH3_segments/<运行名称>/`（每段独立 MP4 + 尾帧 PNG + latent_context/clip_N.safetensors）；按段号排序 → **concat 无缝拼接**（段间已 Latent 衔接，不等长直接拼；需转场才用 xfade，offset=累计时长−转场时长）；
10. **提速/调画质**：单采版省一半时间；双采（RTX 1.5×）更高清但约 2 倍耗时；LowVRAM Attention 建议 4 或 8（56 头整除）。

**注意**：
- 自动队列依赖 Impact Pack 前端事件——**只保留一个 ComfyUI 页面**、不切换工作流、不编辑画布；
- 任一段失败段号保持不变，修复后重新 Queue 重试该段；
- RunningHub 云端有 Impact 触发器 bug（每段需手动 Queue），**本地部署无此问题**。

## 7. 双采参数（v5+）

- RTX 视频超分 **1.5×（ULTRA）** → 同模型二采；
- 二采 LoRA `lightx2v_turbo_4step` Strength **0.3–0.55**（越低越接近原片，越高细节越丰满但可能漂移）；
- res_multistep + simple、**3 步**、denoise **0.2–0.35**、Sigma shift 视频 12 / 音频 3；
- 最终视频**使用第一采音频**；
- ⚠️ **对口型素材** denoise ≤ 0.30。

## 8. 加速节点（按需，可能降画质）

- Turbo LoRA **必须搭配 Turbo 采样器**；不用 LoRA 用 res-multistep K 采样器；
- 多个加速节点时 **LoRA 紧跟 UNET 加载器之后**；
- Low VRAM Attention：H3 共 **56 个注意力头**，值须整除 56，推荐 **4 或 8**。

## 9. 故障排查

| 现象 | 处理 |
|---|---|
| 显存/内存溢出 | ComfyUI 启动参数加 `--cache-classic` |
| 段间画面跳变 | 确认 V6 提示词全部指代固定参考图；检查 latent_context 是否生成 |
| 二采漂移 | 降 LoRA Strength（→0.3）/ denoise（→0.2） |
| 参考图未生效 | 检查 ImagePass 桥接 → ref_image_N 连线 |
| 读到旧数据 | 换新 `运行名称` |
| 首跑验证 | 先 3 × 5s 验证尾帧交接、段号递增、显存曲线，再跑 12 × 5s |
| `TextSplitByDelimiter` 缺失 | mixlab 懒注册坑（依赖 ChatGPT.py 的 openai/swarm）：已独立注册为 `custom_nodes/comfyui-mixlab-nodes/nodes/text_split_by_delimiter.py`；重装 mixlab 后需重打该补丁 |
| `RTXVideoSuperResolution` 缺失 | 装 `pip install nvidia-vfx --extra-index-url https://pypi.nvidia.com`（本机已装） |
| ComfyUI-Manager 启动联网超时崩溃 | `user/__manager/config.ini` 设 `network_mode = private`（本机已改） |

**本机实测（2026-08-23）**：ComfyUI-H3 0.33.1 + 全部节点 + 双 LoRA 就绪；V6 第 1 段管线（Ref2VA int8 + Turbo LoRA 4 步，1344×768 124帧带音频）API 提交 220s 生成成功（H.264+AAC 5.167s），产物见 `D:\dsh web 工作区\h3-segmented-workflow\test-output\`。

## 10. 多段提示词编写要点（长片）

- 先规划**完整故事弧线** → 再为每段定开场状态、主要动作、稳定尾帧；
- 每段**结尾最后半秒动作完全静止**，形成干净可导出的"锚点画面"（方便人工确认/二次利用）；
- 段间保持人物身份/服装/道具/空间/光线/镜头高度/动作阶段/物体状态连续；
- 音乐中间段**避免终止式**，末段收束；对白尽量不跨段；
- 六段式（subject_definitions/summary/retention_analysis/detailed_description/overall_soundscape/non_diegetic_music）写法见 `references/h3-prompt/h3-prompt-guide.md`；
- **完整 12 段 demo**（《机器人与沙漠温室中的希望之种》60s，每段 5s，含全部六段式提示词）见 `references/h3-segmented/demo_prompts_12segments.md`。
