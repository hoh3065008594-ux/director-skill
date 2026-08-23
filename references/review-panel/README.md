# 审片页模板（serve_review.js + review.html）

本地审片服务器模板：文件夹式浏览（图片资产 / 视频资产 / 剧本大纲），单击预览、Ctrl+单击选标准、定稿/撤销、重拍、4 秒轮询自动刷新。无需动态插件审批。

## 搭建步骤（每个新项目约 3 分钟）

1. **复制模板到项目**：把 `serve_review.js` + `review.html` 拷到 `<项目>\.comfy\`。
2. **改三处配置**（serve_review.js 顶部）：
   - `ROOT` → 本项目路径
   - `SCENES` → 场景列表（保持 `scene-01`…`scene-NN` 命名，列表正则按此分组）
   - `SCENE_META` → 每镜名称与字幕（审片页左侧文件夹显示用）
   - 需要时改 `PORT`（默认 3099）
3. **依赖脚本**（重拍按钮需要）：`.comfy\gen_zimage.js`（Z-Image 出图）+ `.comfy\jobs.json`（含各镜 prompt）。重拍时服务器自动写 `regen-jobs.json`（该镜 + 新种子）spawn `gen_zimage.js`，并以 `regen-still-<scene>.json` 标记进行中。
4. **启动**：`node .comfy/serve_review.js`（后台任务常驻）→ 浏览器开 `http://127.0.0.1:3099/review.html`。

## API 一览

| 端点 | 说明 |
|---|---|
| `GET /api/assets` | `{ stills: {scene:[{name,variant,url}]}, clips: {...}, generating: [重拍中场景], meta }` |
| `GET /api/picks` / `POST /api/pick` | 定稿读写；POST body `{scene, file|null, kind:'still'\|'clip'}` → 写 `<项目>\assets\picks.json` |
| `GET /api/prompt?scene=&file=` | 读同名 `.txt` 旁注，回退到 jobs.json 里的 prompt |
| `POST /api/regen` | body `{scene}` → 写 `regen-still-<scene>.json` + `regen-jobs.json` → spawn gen_zimage.js（子进程退出清标记） |
| `GET /api/outline` | 读 `assets/script-outline.md`（剧本大纲文件夹） |
| 静态 | 从项目 ROOT 提供文件（含 HTTP Range 206 支持，视频拖动必需） |

## 资产命名约定

- 图片：`assets/generated/<scene>_<seq>_<...>.png`（如 `scene-01_00001_.png`），分组正则 `^(scene-\d\d)_(\d+)_\.`，`_00002_` 起为重拍/多版
- 视频：`assets/video/clips/segment_<N>_*.mp4`（H3 V6 分段产物下载后的名字，`segment_1_` → scene-01）
- 定稿：`assets/picks.json` → `{ "scene-01": { "kind": "still"|"clip", "file": "..." } }`，成片阶段按此取每镜版本

## 说明

- 只绑定 `127.0.0.1`，CORS 全开（页面可从 file:// 或任意本地 iframe 打开也能 fetch）。
- 图片重拍走 Z-Image（约 30 秒）；**视频重拍**可按同样模式把 `/api/regen` 换成 spawn `gen_h3_v6.js`（需要 h3_jobs.json 与 Latent 链，见 references/h3-segmented/）。
- better-sidebar 插件版审片面板（DSH 内嵌 Tab）见 SKILL.md §3 前半段，本模板为无需审批的独立页方案。
