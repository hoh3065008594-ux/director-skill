// build_final.js — 拼接 6 段 H3 V6 片段 → 30.0s 母版（淡入淡出 + 黑场收尾 + ASS 字幕烧录）
// 用法: node build_final.js
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = 'D:/dsh web 工作区/lingerie-ad-30s';
const CLIPS = path.join(ROOT, 'assets/video/clips');
const MASTER_DIR = path.join(ROOT, 'assets/master');
const FONTS = path.join(ROOT, '.comfy/fonts');
const SUBS = path.join(ROOT, '.comfy/subs.ass');
const FF = 'D:/桌面/剪辑/高帧/ffmpeg-master-latest-win64-gpl-shared/bin/ffmpeg.exe';
const FFPROBE = 'D:/桌面/剪辑/高帧/ffmpeg-master-latest-win64-gpl-shared/bin/ffprobe.exe';
const TARGET = 30.7;          // 目标总时长（7 段：5.167 + 4.25×6 ≈ 30.67）
const FADE_OUT_START = 29.4;  // 开始淡出（黑场收尾）
const FADE_OUT_DUR = 1.0;
const FADE_IN_DUR = 0.5;
const N = 7;

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) {
    console.error('CMD FAIL:', cmd, args.join(' '));
    console.error((r.stderr || '').slice(-3000));
    process.exit(1);
  }
  return r.stdout;
}
function ffprobeDur(file) {
  const out = run(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]);
  return parseFloat(out.trim());
}

// 1. 收集片段
const segs = [];
for (let i = 1; i <= N; i++) {
  const files = fs.readdirSync(CLIPS).filter(f => f.startsWith('segment_' + i + '_') && f.endsWith('.mp4'));
  if (!files.length) { console.error('缺片段 ' + i + '，先等 H3 跑完'); process.exit(1); }
  segs.push(path.join(CLIPS, files[0]));
}
console.log('片段:', segs.map(s => path.basename(s)).join(' | '));
for (const s of segs) console.log('  ' + path.basename(s) + ' = ' + ffprobeDur(s).toFixed(2) + 's');

// 2. concat（-c copy，段间 Latent 衔接天然连续）
fs.mkdirSync(path.join(ROOT, '.comfy'), { recursive: true });
const list = path.join(ROOT, '.comfy/concat.txt');
fs.writeFileSync(list, segs.map(s => "file '" + s.replace(/'/g, "'\\''") + "'").join('\n'));
const raw = path.join(ROOT, '.comfy/raw_concat.mp4');
run(FF, ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', raw]);
const rawDur = ffprobeDur(raw);
console.log('concat 总时长: ' + rawDur.toFixed(2) + 's');

// 3. 淡入淡出 + 黑场补齐到 TARGET + 字幕烧录（cwd=项目 .comfy，全部用相对路径避开中文路径解析问题）
fs.mkdirSync(MASTER_DIR, { recursive: true });
const master = path.join(MASTER_DIR, 'elysee-final-30s.mp4');
const padDur = Math.max(0, TARGET - rawDur);
const vf = 'fade=t=in:st=0:d=' + FADE_IN_DUR +
  ',fade=t=out:st=' + FADE_OUT_START + ':d=' + FADE_OUT_DUR +
  ',tpad=stop_mode=clone:stop_duration=' + padDur.toFixed(3) +
  ',subtitles=subs.ass:fontsdir=fonts';
const af = 'afade=t=in:st=0:d=' + FADE_IN_DUR +
  ',afade=t=out:st=' + FADE_OUT_START + ':d=' + FADE_OUT_DUR +
  ',apad=pad_dur=' + padDur.toFixed(3);
run(FF, ['-y', '-i', 'raw_concat.mp4', '-vf', vf, '-af', af, '-t', TARGET.toFixed(2), '-r', '24', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '../assets/master/elysee-final-30s.mp4'], path.join(ROOT, '.comfy'));

// 4. 验证
const finalDur = ffprobeDur(master);
console.log('母版: ' + master + ' = ' + finalDur.toFixed(2) + 's (目标 30.0s)');
if (Math.abs(finalDur - TARGET) > 0.5) console.warn('⚠ 时长偏差超 0.5s，检查淡出/黑场参数');
console.log('DONE');
