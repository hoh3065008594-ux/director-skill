# 生产脚本模板（2026-08-24 · ÉLYSÉE 30s 广告实测验证）

V6 分段 Latent 链 + 成片合成的可复用脚本，从 `D:\dsh web 工作区\lingerie-ad-30s\.comfy\` 提炼。

## gen_h3_v6.js — V6 多段参考生视频（API 逐段提交）

- 用法：`node gen_h3_v6.js <h3_jobs.json>`；配置 `{ run_name, seed_base, start, segments:[{name, ref, seed, prompt}] }`
- **链式正确性（避坑 35）**：首段挂 SaveLatent；中间段同时 LoadLatent（上一段）+ SaveLatent（当前段）；末段只 Load。`clip_index` 严格 = 段号
- 段 2+ 结构：LoadLatent → MotionContext（`context_length:"22"` 字符串、audio 24）→ 采样 → Trim(22帧) → CreateVideo
- 产物直接读实例输出目录（`assets/video/MiniMaxH3_segments/<run>/`），同名多版取数字后缀最新（避坑 40）
- 参考图自动从 `assets/generated/<ref>` 复制到 `assets/input/v6-<name>.png` 并上传

## build_final.js — 成片合成

- concat 无缝拼接（`-c copy`）→ 淡入 0.5s + 淡出（st=总长-1.3, d=1.0）+ tpad 补齐 + ASS 字幕烧录
- **cwd 必须指向项目 `.comfy`，subtitle/fontsdir 用相对路径**（避坑 38，中文绝对路径解析失败）
- 字幕时间轴按 concat 累计时长推算：段1 0–5.17 / 段2 5.17–9.42 / 段3 9.42–13.67 / 段4 13.67–17.92 / 段5 17.92–22.17 / 段6 22.17–26.42 / 段7 26.42–30.67

## subs-template.ass

- 中文用 `Microsoft YaHei`（msyh.ttc，比思源体名稳）、英文 `Georgia`；奶油色 #E8E4DC + 金色 #C9A36B，半透明黑底
- 字体复制到项目 `.comfy/fonts/`，`fontsdir=fonts`

## 使用前必改

- gen_h3_v6.js 顶部 `ROOT` / 模型名 / `CLIPS`、`INPUT` 路径
- build_final.js 顶部 `TARGET`（7 段=30.7）/ `N` / 路径
- subs.ass 时间轴与文案
