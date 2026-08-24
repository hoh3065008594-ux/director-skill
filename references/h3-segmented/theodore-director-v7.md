# Theodore 导播台（V7）使用手册

> V7 = 原 H3 分段参考生视频 Impact V6 工作流 + UP主自制自定义节点 **ComfyUI_Theodore_Director**（"导播台"）。
> 开源仓库：https://github.com/northern-penguin/ComfyUI_Theodore_Director（Apache-2.0，内测阶段）
> 版权：抖音 Theodore（抖音号 q1503623946）与 B站UP 南极来の企鹅。
> 社区网盘 demo 工作流的提示词是照抄 v5 的，**并非完全正确、仅供参考**；本机/本仓库用的是官方正式版（空模板计划）。

## 一、本机安装状态（2026-08-24 已核实 ✅）

| 项 | 状态 |
|---|---|
| 节点安装位置 | `D:\ComfyUI-H3\custom_nodes\ComfyUI_Theodore_Director`（v0.1.0） |
| 要求 | ComfyUI ≥ 0.31.x（本机 v0.33.1 ✅）、Python 3.10+；仓库已含构建好的前端 `web/dist`（无需 Node 构建） |
| 第三方依赖 | Impact Pack、MiniMax-H3-Turbo、H3-Motion-Context、KJNodes、Easy-Use、RTX Video Nodes 全部已装（与 V6 共用） |
| 工作流 | `D:\ComfyUI-H3\user\default\workflows\` 下 `Impact_V6_单采_Theodore导播台.json`、`Impact_V6_双采_Theodore导播台.json`（备份在仓库 `h3-segmented-workflow/workflows/7_V7/`） |
| 模型修补 | UNETLoader 已从仓库默认 `minimax_h3_ref2va_pruned_fp8_scaled.safetensors` 改为本机已装的 `minimax_h3_ref2va_pruned_int8_convrot.safetensors` |
| FFmpeg | 已就绪（PATH 含 ffmpeg.exe；"后处理→合并视频"需要，无损流复制） |
| 端口 | H3 实例 8190（仓库统一约定） |

升级节点：`cd D:\ComfyUI-H3\custom_nodes\ComfyUI_Theodore_Director && git pull`（git 克隆方式）或重新下载覆盖，然后重启 H3 实例。

## 二、与 V6 的核心差异（应对方式）

1. **提示词与参数不再在 CLIPTextEncode / 每段节点里**，全部收进 `TheodoreDirector_Project` 节点的隐藏 `plan_json`（项目名、素材库、分镜、时长、启用、latent 接力、二次采样、seed、连续性设置）。改提示词 = 改 plan_json 或开导播台。
2. **参考素材用别名管理**：素材库可超过 H3 单次容量（>9 图 / >3 视频 / >3 音频都没关系），每镜按别名激活本轮素材；提示词写 `{{ref:alias}}`，执行时编译成 `<Picture N>` / `<Video N>` / `<Audio N>`。素材上传到 `ComfyUI/input/theodore_director/<项目名>/`。
3. **每镜独立成片时长**，自动吸附 H3 的 `17n+5` 帧网格并做段间上下文补偿；`latentRelay`（接力）控制是否消费上一段 AV latent，`secondSampling`（二采）控制双采分支。
4. **续跑（resume）**：从 Impact 当前索引向后扫描结果清单，plan hash + shot hash + 文件完整匹配才跳过；修改任何提示词/素材/开关会令旧结果失效。生产建议 `resume_mode=resume`。
5. **完成后自动触发下一段**：`TheodoreDirector_CommitResult` 原子写入分镜结果 JSON 与 manifest，之后 `ImpactSetWidgetValue + ImpactQueueTrigger` 链式入队下一段（队列机制与 V6 相同）。
6. **后处理合并**：全部镜头出完后，在导播台"后处理"页逐镜头选结果 → 合并所选视频（FFmpeg concat 无损，不重新编码），输出 `merged_video_00001_.mp4`。

## 三、使用流程

### 方式 A：浏览器导播台（最稳，推荐需要可视化/传素材的场景）
1. 浏览器打开 `http://127.0.0.1:8190`，加载 `Impact_V6_单采_Theodore导播台.json`。
2. 双击绿色区域 `① Theodore 项目与可视化导播台` 节点 → 点"打开 Theodore 导播台"。
3. 项目设置：Project name、Run ID（新一轮生产换 Run ID 避免混文件）、FPS、提示词前缀/后缀。
4. 素材库：`+ image / + video / + audio` 上传或填 input 相对路径，给稳定别名（如 `hero_front`、`location_night`），视频可勾选"启用视频伴音"。
5. 分镜：填每段时长（最终成片秒数）、提示词（用 `{{ref:别名}}`）、latent 接力开关、二次采样开关；右侧 H3 编译预览实时检查错误。
6. "保存到工作流" → 在 ComfyUI 里保存工作流文件 → 确认 Impact 当前索引与 `resume_mode` → Queue。
7. 全部生成完后，"后处理" → 逐镜头选结果 → "合并所选视频"。

### 方式 B：脚本/API 驱动（DSH 会话内）
1. 读工作流 JSON（`D:\ComfyUI-H3\user\default\workflows\` 或仓库 `workflows/7_V7/`），定位 `TheodoreDirector_Project` 节点。
2. 该节点 `widgets_values[0]` 是 plan_json 字符串：`ConvertFrom-Json` 后改 `project.name`、`project.runId`、`assets[]`（素材：alias/kind/path/duration/fixed/限定分镜/启用/伴音）、`shots[]`（id/title/durationSeconds/enabled/prompt/negativePrompt/latentRelay/secondSampling/可选 seed）。
   - 素材路径：优先用 ComfyUI input 相对路径；已上传素材在 `ComfyUI/input/theodore_director/<项目名>/`。
   - 提示词里用 `{{ref:alias}}` 引用素材；视频伴音用 `{{ref:alias.audio}}`。
3. 写回后保存为 UI 格式 JSON，用 `python "D:\download\comfyui-h3-staging\submit_workflow.py" <json>` 提交（自动转换 API 格式、POST 8189、轮询 /history）。
4. **链式接力注意**：提交一次后 `ImpactQueueTrigger` 会把下一段作为新 prompt 自动入队（首段完成后 `ImpactSetWidgetValue` 把索引写入 `PrimitiveInt`"当前片段序号"，节点写着"请勿手动递增"）。submit_workflow.py 只等首个 prompt 的 history；后续段在队列中继续，用 `GET /queue` 或导播台"生成结果"页监控。全部完成后到 `D:\ComfyUI-H3\output\TheodoreDirector\<项目名>_<RunID>\` 取片。
5. 可选：在导播台"生成结果"页刷新查看每镜历史结果。

> 双采工作流：`secondSampling=true` 走 RTX 1.5× 超分 + 二次 H3 采样；`false` 惰性跳过整条二采计算链（省显存、更快）。

## 四、别名规范与 H3 硬限制（预检通过才能保存）

- 别名：项目内唯一、不区分大小写、不能含空白或 `{}`、不能以 `.audio` 结尾。
- 激活顺序：`fixed=true` 素材按 fixedOrder/别名 → 提示词（前缀+正文+后缀）首次出现顺序；重复引用不重复占槽。
- 编号规则：图片 `<Picture N>`；视频 `<Video N>`；有效视频伴音先占 `<Audio N>`，随后独立音频。**建议只写别名，不手写原生编号**。
- 单分镜上限：参考图 ≤9；参考视频 ≤3（每个 2–15s，总 ≤15s）；有效音频 ≤3 路（每路 2–15s，总 ≤15s）；混合输入文件 ≤12；音频不能单独作参考（必须同时有图或视频）；视频伴音只有勾选启用才计入音频上限。

## 五、节点速查（6 个，均以 TheodoreDirector_ 开头）

| 节点 | 职责 | 关键输入/输出 |
|---|---|---|
| `TheodoreDirector_Project` | 计划入口，内置可视化导播台；隐藏 `plan_json` widget | 输出 PLAN、plan hash、project name、active shots |
| `TheodoreDirector_SelectShot` | Impact 索引选段、禁用分镜、seed、续跑 | `queue_index`、`base_seed`、`resume_mode`(fresh/resume/retry_failed/overwrite_current)；输出 SHOT、seed、shot_id、latent relay、second sampling、next_index、has_next |
| `TheodoreDirector_H3Adapter` | 别名编译 `<Picture/Video/Audio N>`、上限校验、17n+5 帧网格、只加载当前素材 | 输入 PLAN+SHOT；输出 H3 prompt、H3 frames、9图/3视频/3伴音/3音频端口 |
| `TheodoreDirector_OutputPaths` | 稳定输出路径（项目名_RunID） | video_prefix、latent 目录、tail_prefix、manifest 路径 |
| `TheodoreDirector_CommitResult` | 完成清单原子提交，之后才触发下一段 | 必须接 plan/shot/paths/completion_signal/tail_path；`latent_required` |
| `TheodoreDirector_LegacyImport` | 导入旧版 `===` 分段、`& 时长 &` 脚本 | 输出 imported plan JSON、PLAN |

注意：成品工作流已接好线，不要随意断开 PLAN/SHOT/PATHS/保存完成信号。SelectShot 的数值 `base_seed` 输入优先于导播台界面里的 Base seed（界面字段目前只保存进计划并参与 hash，不直接控制 seed）。

## 六、输出目录与续跑

```text
D:\ComfyUI-H3\output\TheodoreDirector\<Project name>_<Run ID>\
├─ 001_<shot-id>_video_*.mp4
├─ latent_context\clip_00001.safetensors     # AV 联合 latent（接力用）
├─ tail_frames\001_<shot-id>_tail_*.png
├─ shot_results\001_<shot-id>_result.json    # 分镜结果清单
├─ merged_video_00001_.mp4                   # 后处理合并结果
└─ manifest.json
```

- `resume`：从 Impact 当前索引向后跳过完整完成的分镜（plan/shot hash + 视频 + 尾帧 + 必要时 latent 全部匹配）。
- `fresh`：强制当前索引；`retry_failed`/`overwrite_current` 目前行为分别等同 resume/fresh。
- 修改计划后 hash 变化，旧结果不再算作有效完成；保留多套输出请换 Run ID。

## 七、常见问题

| 症状 | 处理 |
|---|---|
| 保存按钮拒绝保存 | 按弹窗分镜列表逐项修别名/文件/时长/容量错误（H3 上限见第四节） |
| 提示词仍有 `{{ref:...}}` | 别名不存在、素材被禁用、路径为空或不适配当前镜头 |
| 伴音报错 | 素材类型是 video、勾了启用伴音、文件确有音轨、时长元数据 2–15s |
| 找不到 FFmpeg / 合并失败 | 把 ffmpeg 加入 PATH 或设 `THEODORE_DIRECTOR_FFMPEG` 后重启；只做无损 concat，各片段编码/分辨率/帧率/音频参数需一致 |
| 旧输出没被跳过 | 查 Run ID、路径结构、plan/shot hash、shot_results JSON；只有尾帧不足以通过 resume 校验 |
| 上传后找不到文件 | Project name 与上传时一致；文件在 `input/theodore_director/<项目名>/`；受环境变量影响的改动需重启 |
| 改 Base seed 没效果 | 正常：SelectShot 数值输入优先，成品还外接整数节点 |

## 八、环境变量（可选）

- `THEODORE_DIRECTOR_FFMPEG`：ffmpeg 可执行文件完整路径（未设则用 PATH / imageio-ffmpeg）。
- `THEODORE_DIRECTOR_ALLOW_EXTERNAL_PATHS=1`：允许素材使用任意绝对路径（默认只允许 input 相对路径；可信单用户环境可开）。

## 九、仓库/本地文档位置

- 官方仓库：https://github.com/northern-penguin/ComfyUI_Theodore_Director（README + docs/ 导播台说明.md + 节点参数讲解.md + H3_ADAPTER.zh-CN.md + ARCHITECTURE.md）
- 本机安装副本：`D:\ComfyUI-H3\custom_nodes\ComfyUI_Theodore_Director\`（含全部 docs）
- 本仓库工作流备份：`h3-segmented-workflow/workflows/7_V7/`
- 版权与 V6 相同：南极来の企鹅 / Theodore；仅个人使用，勿公开、勿倒卖。
