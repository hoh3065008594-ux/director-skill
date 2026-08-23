// gen_h3_v6.js — MiniMax H3 V6 分段参考生视频（逐段 API 提交，Latent 衔接）
// 段1: Ref2VA + SaveLatent；段2..N: LoadLatent + MotionContext(22帧/24音频) + Trim(22帧)
// 用法: node gen_h3_v6.js <h3_jobs.json>
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = '127.0.0.1', PORT = 8190;
const ROOT = 'D:/dsh web 工作区/lingerie-ad-30s';
const CLIPS = ROOT + '/assets/video/clips';
const INPUT = ROOT + '/assets/input';
const UNET = 'minimax_h3_ref2va_pruned_int8_convrot.safetensors';
const LORA = 'minimax_h3_turbo_v4_step600_ema.safetensors';
const TE = 'qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors';
const VV = 'minimax_h3_video_vae_fp16.safetensors';
const AV = 'minimax_h3_audio_vae_fp32.safetensors';
const W = 1344, H = 768, LENGTH = 124, FPS = 24, STEPS = 4;

function httpReq(method, p, headers, body) {
  return new Promise((res, rej) => {
    const req = http.request({ host: HOST, port: PORT, path: p, method, headers }, r => {
      const chunks = [];
      r.on('data', c => chunks.push(c));
      r.on('end', () => {
        const buf = Buffer.concat(chunks);
        const ct = r.headers['content-type'] || '';
        if (ct.indexOf('application/json') >= 0) {
          try { res({ status: r.statusCode, json: JSON.parse(buf.toString('utf8')) }); } catch (e) { rej(new Error('bad json')); }
        } else { res({ status: r.statusCode, body: buf }); }
      });
    });
    req.on('error', rej);
    if (body) req.write(body);
    req.end();
  });
}

async function uploadImage(filePath, name) {
  const fileBuf = fs.readFileSync(filePath);
  const boundary = '----v6' + Date.now().toString(36);
  const head = Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="image"; filename="' + name + '"\r\nContent-Type: image/png\r\n\r\n');
  const tail = Buffer.from('\r\n--' + boundary + '--\r\n');
  const body = Buffer.concat([head, fileBuf, tail]);
  const r = await httpReq('POST', '/upload/image?type=input&overwrite=true', { 'Content-Type': 'multipart/form-data; boundary=' + boundary, 'Content-Length': body.length }, body);
  if (r.status >= 300) throw new Error('upload failed: ' + r.status + ' ' + name);
  return name;
}

function baseNodes(refName, pos, prefix) {
  return {
    '1': { class_type: 'UNETLoader', inputs: { unet_name: UNET, weight_dtype: 'default' } },
    '2': { class_type: 'MiniMaxH3TurboLoRA', inputs: { model: ['1', 0], lora_name: LORA, strength: 1, low_vram: false } },
    '3': { class_type: 'CLIPLoader', inputs: { clip_name: TE, type: 'minimax', device: 'default' } },
    '4': { class_type: 'VAELoader', inputs: { vae_name: VV } },
    '5': { class_type: 'VAELoader', inputs: { vae_name: AV } },
    '6': { class_type: 'LoadImage', inputs: { image: refName } },
    '7': { class_type: 'MiniMaxH3ReferenceToVideo', inputs: { clip: ['3', 0], vae: ['4', 0], audio_vae: ['5', 0], prompt: pos, width: W, height: H, length: LENGTH, ref_image_size: 'match', ref_images: { ref_image_0: ['6', 0] } } },
    '8': { class_type: 'BasicGuider', inputs: { model: ['2', 0], conditioning: ['7', 0] } },
    '9': { class_type: 'MiniMaxH3TurboSampler', inputs: {} },
    '10': { class_type: 'BasicScheduler', inputs: { model: ['2', 0], scheduler: 'simple', steps: STEPS, denoise: 1 } },
    '11': { class_type: 'RandomNoise', inputs: { noise_seed: 0 } },
    '12': { class_type: 'SamplerCustomAdvanced', inputs: { noise: ['11', 0], guider: ['8', 0], sampler: ['9', 0], sigmas: ['10', 0], latent_image: ['7', 1] } },
    '13': { class_type: 'VAEDecode', inputs: { samples: ['12', 0], vae: ['4', 0] } },
    '14': { class_type: 'VAEDecodeAudio', inputs: { samples: ['12', 0], vae: ['5', 0] } },
    '15': { class_type: 'CreateVideo', inputs: { images: ['13', 0], audio: ['14', 0], fps: FPS } },
    '16': { class_type: 'SaveVideo', inputs: { video: ['15', 0], filename_prefix: prefix, format: 'auto', codec: 'auto' } }
  };
}

function buildSegment(index, total, refName, pos, runName, seed, prefix) {
  const wf = baseNodes(refName, pos, prefix);
  wf['11'].inputs.noise_seed = seed;
  const latentDir = 'MiniMaxH3_segments/' + runName + '/latent_context';
  if (index === 1) {
    wf['17'] = { class_type: 'MiniMaxH3MotionContextSaveLatent', inputs: { latent: ['12', 0], filename_prefix: latentDir + '/clip', clip_index: 1 } };
  } else {
    wf['17'] = { class_type: 'MiniMaxH3MotionContextLoadLatent', inputs: { latent_path: latentDir, clip_index: index - 1 } };
    wf['18'] = { class_type: 'MiniMaxH3MotionContext', inputs: { conditioning: ['7', 0], vae: ['4', 0], latent: ['7', 1], context_length: '22', audio_context_length: 24, context_latent: ['17', 0], audio_vae: ['5', 0] } };
    wf['8'].inputs.conditioning = ['18', 0];
    wf['19'] = { class_type: 'MiniMaxH3MotionContextTrim', inputs: { images: ['13', 0], audio: ['14', 0], trim_frames: 22, fps: FPS, match_tail: true } };
    wf['15'].inputs.images = ['19', 0];
    wf['15'].inputs.audio = ['19', 1];
    // 中间段必须保存本段 Latent，供下一段 LoadLatent 读取（链式衔接）
    if (index < total) {
      wf['20'] = { class_type: 'MiniMaxH3MotionContextSaveLatent', inputs: { latent: ['12', 0], filename_prefix: latentDir + '/clip', clip_index: index } };
    }
  }
  return wf;
}

async function submit(workflow) {
  const r = await httpReq('POST', '/prompt', { 'Content-Type': 'application/json' }, Buffer.from(JSON.stringify({ prompt: workflow })));
  if (!r.json || !r.json.prompt_id) throw new Error('validation error: ' + JSON.stringify(r.json || {}).slice(0, 800));
  return r.json.prompt_id;
}

async function collect(promptId, label) {
  for (let i = 0; i < 9000; i++) {
    await new Promise(res => setTimeout(res, 3000));
    const h = await httpReq('GET', '/history/' + promptId);
    const hh = h.json || {};
    if (!hh[promptId]) continue;
    const st = hh[promptId].status && hh[promptId].status.status_str;
    if (st === 'error') throw new Error('comfy error: ' + JSON.stringify(hh[promptId].status).slice(0, 1500));
    const files = [];
    for (const out of Object.values(hh[promptId].outputs || {})) {
      if (out.videos) for (const v of out.videos) files.push(v.filename);
      if (out.images) for (const im of out.images) files.push(im.filename);
    }
    if (files.length) return files;
  }
  throw new Error('timeout ' + label);
}

// 直接从实例输出目录复制产物（SaveVideo 前缀 MiniMaxH3_segments/<run>/segment_N）
// 注意：实例以 --output-directory 指向项目 assets/video，产物即落在此处，无需经 /view
// 同名多版时取数字后缀最大者（最新）
function grabSegments(runName, index, destDir) {
  const segDir = path.join(ROOT, 'assets/video/MiniMaxH3_segments', runName);
  const fs2 = fs.readdirSync(segDir).filter(f => f.startsWith('segment_' + index + '_') && f.endsWith('.mp4'));
  if (!fs2.length) throw new Error('磁盘未找到 segment_' + index + ' 的 mp4: ' + segDir);
  const variant = (f) => { const m = f.match(/_(\d+)_\.mp4$/); return m ? parseInt(m[1], 10) : 0; };
  fs2.sort((a, b) => variant(b) - variant(a));
  fs.mkdirSync(destDir, { recursive: true });
  const dst = path.join(destDir, fs2[0]);
  fs.copyFileSync(path.join(segDir, fs2[0]), dst);
  return dst;
}

async function downloadTo(fname, destDir) {
  const parts = fname.split('/');
  const base = parts.pop();
  const sub = parts.join('/');
  const q = 'filename=' + encodeURIComponent(base) + '&subfolder=' + encodeURIComponent(sub) + '&type=output';
  const r = await httpReq('GET', '/view?' + q);
  if (r.status !== 200) throw new Error('view failed ' + r.status + ' ' + fname);
  fs.mkdirSync(destDir, { recursive: true });
  const dst = path.join(destDir, base);
  fs.writeFileSync(dst, r.body);
  return dst;
}

(async () => {
  const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const runName = cfg.run_name;
  const total = cfg.segments.length;
  const start = cfg.start || 1;
  const results = [];
  for (let i = start - 1; i < total; i++) {
    const seg = cfg.segments[i];
    const idx = i + 1;
    const refName = 'v6-' + seg.name + '.png';
    const localRef = path.join(INPUT, refName);
    if (!fs.existsSync(localRef)) {
      // copy from generated if needed
      const src = path.join(ROOT, 'assets/generated', seg.ref || (seg.name + '_00001_.png'));
      if (!fs.existsSync(src)) throw new Error('missing ref for ' + seg.name + ': ' + src);
      fs.copyFileSync(src, localRef);
    }
    await uploadImage(localRef, refName);
    const prefix = 'MiniMaxH3_segments/' + runName + '/segment_' + idx;
    const wf = buildSegment(idx, total, refName, seg.prompt, runName, seg.seed || (cfg.seed_base + idx * 1000), prefix);
    const t0 = Date.now();
    console.log('[' + idx + '/' + total + '] 提交 ' + seg.name + ' ref=' + refName);
    const pid = await submit(wf);
    const files = await collect(pid, seg.name);
    const secs = Math.round((Date.now() - t0) / 1000);
    const downloaded = [];
    for (const f of files) {
      if (f.toLowerCase().endsWith('.mp4')) {
        const dst = grabSegments(runName, idx, CLIPS);
        downloaded.push(dst);
        try { fs.writeFileSync(dst + '.txt', 'Prompt: ' + seg.prompt + '\nWorkflow: H3 V6 segmented (ref2va + TurboLoRA 4step, ' + LENGTH + '帧@24fps, latent chain ' + idx + '/' + total + ')\nRef: ' + refName + '\n', 'utf8'); } catch (e) {}
      }
    }
    results.push({ idx, name: seg.name, files, downloaded, secs });
    console.log('[OK] ' + seg.name + ' ' + secs + 's -> ' + downloaded.join(','));
  }
  console.log('ALL SEGMENTS DONE: ' + runName);
})().catch(e => { console.error('FATAL: ' + e.message); process.exit(1); });
