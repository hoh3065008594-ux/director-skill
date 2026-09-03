# ZY 造梦师 · Cinematic Realism(精选整合版)

> **整合说明**:本目录是上游开源技能 [zy-cinematic-realism v2.1.0](https://github.com/popopo-99/zy-cinematic-realism) 的**精选子集**,按用户要求只纳入「38 位导演四轴指纹库 + 静帧/视频方法论」,整合进本机 director skill(v1.17.0 起),对应 SKILL.md **§1e-2** 章节。
>
> 作者:ZY / popopo-99 ｜ License: **CC BY-NC 4.0**(个人非商业使用,保留署名;勿公开/勿商用/勿二次分发)
> 上游方法:Scene Master → Creative Grammar → Model Compiler → Result Repair;`MODEL SYNTAX MAY CHANGE. SCENE LOGIC MAY NOT.`

## 目录

```
references/zy-cinematic-realism/
├── README.md                      # 本入口文件
├── LICENSE / NOTICE.md            # 上游版权与许可(原样保留)
└── references/
    ├── directors/                 # 38 位导演四轴指纹(每位一个文件)+ index + recommendation-matrix
    ├── director-routing.md        # ★ 导演层使用规则(入口):iconic 强制模式、四轴完整性、混合/对比/推荐规则
    ├── anti-ai-cleanup.md         # 反 AI 通病清单(director-routing 硬依赖)
    ├── style-cards.md             # 16 张风格卡(冷峻写实/潮湿黑色电影/静默日常/制度压迫…)
    ├── cinematography-cards.md    # 8 张摄影卡(门框外观察/近距遮挡/负空间/程序性固定机位…)
    ├── creative-cards.md          # 创意卡:三卡组合(因果故事卡+摄影卡+风格卡)总入口
    ├── creative-shuffle.md        # 受控边界内重组风格/摄影/调度
    ├── continuity-cards.md        # Continuity Bible(Base Lock)+ Shot Delta 跨镜锁定
    ├── prompt-compiler.md         # Scene Master Schema + Transcode Lock + 编译工序(方法论核心)
    ├── cinematic-principles.md    # 电影感基础原理(时间/空间/光线/材质)
    ├── camera-and-light.md        # 机位与光线决策速查
    ├── prompt-check.md            # 生成前检查:冲突/空泛/物理不成立
    ├── result-repair.md           # Prompt Doctor:CHANGE ONLY / PRESERVE EXACTLY
    ├── remix.md                   # One Variable Remix:锁全部核心事实只改一个变量
    ├── negative-prompts.md        # 场景级排除词库(⚠️ Z-Image 无负向,须转正向约束)
    ├── examples.md                # 校准用示例(仅需要时读)
    └── quality-checklist.md       # 出图前质量自检
```

## 用法(对 agent)

见主 SKILL.md **§1e-2**。要点:

1. **触发才读**:用户点名导演 / 求导演方法、对比、推荐;或给出场景但想先选导演/风格方向(给 2–4 候选+推荐,不轰炸)。纯技术重拍/资产/H3 排障不触发。
2. **只读所需分支,不读整库**:单导演 → `director-routing.md` + `directors/<slug>.md` 一个文件;对比/推荐 → `directors/recommendation-matrix.md` + 2–3 位;风格卡 → `style-cards.md`;摄影卡 → `cinematography-cards.md`。
3. **四轴铁律**:光影反差 / 色彩曝光 / 镜头机位 / 构图空间四行签名必须产出、缺一失败;删掉导演名后仍可辨;禁止复制具体电影画面。
4. **落地模型**:本机图片 = Z-Image(自然语言正向,禁字等铁律见主 SKILL.md §1d-2);视频 = MiniMax H3(Ref2VA 六段式,主 SKILL.md §2b)——zy 只贡献"画面视觉层决策",不改变模型官方提示词格式。
5. **范围声明**:上游的**四模型原生编译器(GPT Image 2 / Midjourney V8.2 / Seedream 5.0 Pro / Nano Banana)与 model-routing / model-capability-matrix 未内置**(本机不常用,且避免死链)。如未来需要:本地克隆 `D:\dsh web 工作区\zy-cinematic-realism\zy-cinematic-realism\`(上游 `references/models/`、顶层 `SKILL.md` 等),或直接读上游仓库。

## 升级 / 回滚

- **升级**:从上游新版本仓库按本 README 的文件清单整体替换本目录,再按需校对 §1e-2 引用(不改文件名的话无需改 SKILL.md)。
- **回滚**:删除本目录 + 删除主 SKILL.md §1e-2 + 还原 `SKILL.md.bak-1.16.1`,即可回到 v1.16.1。
