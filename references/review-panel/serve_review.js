// ÉLYSÉE · 本地审片服务器（图片资产 + 视频资产，文件夹式浏览）
// 用法: node serve_review.js   → http://127.0.0.1:3099/review.html
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3099;
const ROOT = 'D:\\dsh web 工作区\\lingerie-ad-30s';
const GEN_DIR = path.join(ROOT, 'assets', 'generated');
const CLIP_DIR = path.join(ROOT, 'assets', 'video', 'clips');
const INPUT_DIR = path.join(ROOT, 'assets', 'input');
const PICKS_FILE = path.join(ROOT, 'assets', 'picks.json');
const SCENES = ['scene-01', 'scene-02', 'scene-03', 'scene-04', 'scene-05', 'scene-06'];
const SCENE_META = {
  'scene-01': { name: 'SC.01 晨光序幕', sub: '清晨的第一件事，是让光进来' },
  'scene-02': { name: 'SC.02 睡袍滑落', sub: '然后是睡袍，慢慢滑落' },
  'scene-03': { name: 'SC.03 蕾丝微距', sub: '指尖路过的地方，蕾丝都知道' },
  'scene-04': { name: 'SC.04 逆光转身', sub: '光沿着身体，画了一条线' },
  'scene-05': { name: 'SC.05 日常瞬间', sub: '穿在里面的温柔，不必解释' },
  'scene-06': { name: 'SC.06 收尾特写', sub: 'ÉLYSÉE · 肌肤记得的温柔' }
};

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.svg': 'image/svg+xml',
  '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
};
const CORS = {
  'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600',
};
const NO_STORE = { 'Cache-Control': 'no-store' };
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function regenMarkers() {
  try {
    return fs.readdirSync(__dirname).filter(f => /^regen-(still|video)-.*\.json$/.test(f))
      .map(f => f.replace(/^regen-(still|video)-/, '').replace(/\.json$/, ''));
  } catch (e) { return []; }
}
function readPicks() { try { return JSON.parse(fs.readFileSync(PICKS_FILE, 'utf8')); } catch (e) { return {}; } }
function writePicks(p) { fs.mkdirSync(path.dirname(PICKS_FILE), { recursive: true }); fs.writeFileSync(PICKS_FILE, JSON.stringify(p, null, 2) + '\n', 'utf8'); }

function listStills() {
  const out = {};
  for (const s of SCENES) out[s] = [];
  let files = [];
  try { files = fs.readdirSync(GEN_DIR).filter(f => /\.(png|jpg|jpeg)$/i.test(f) && f !== '_contact_sheet.png').sort(); } catch (e) {}
  for (const f of files) {
    const m = f.match(/^(scene-\d\d)_(\d+)_\.(png|jpg|jpeg)$/i);
    if (m && out[m[1]]) {
      out[m[1]].push({ name: f, variant: parseInt(m[2], 10), url: '/assets/generated/' + encodeURIComponent(f) });
    }
  }
  for (const s of SCENES) out[s].sort((a, b) => a.variant - b.variant);
  return out;
}
function listClips() {
  const out = {};
  for (const s of SCENES) out[s] = [];
  let files = [];
  try { files = fs.readdirSync(CLIP_DIR).filter(f => /\.mp4$/i.test(f)).sort(); } catch (e) {}
  for (const f of files) {
    const m = f.match(/^segment_(\d+)_/i);
    if (m && out['scene-0' + m[1]]) out['scene-0' + m[1]].push({ name: f, variant: 1, url: '/assets/video/clips/' + encodeURIComponent(f) });
  }
  for (const s of SCENES) out[s].sort((a, b) => a.variant - b.variant);
  return out;
}
function readSidecar(file) {
  try { return fs.readFileSync(file + '.txt', 'utf8').slice(0, 1200); } catch (e) { return ''; }
}

// 该镜最新生成提示词（从 jobs.json 或旁注读）
function readScenePrompt(scene) {
  try {
    const jobs = JSON.parse(fs.readFileSync(path.join(__dirname, 'jobs.json'), 'utf8'));
    const j = jobs.find(x => x.name === scene);
    if (j) return j.prompt;
  } catch (e) {}
  return '';
}

const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1:' + PORT);
  const p = decodeURIComponent(u.pathname);
  const base = { ...CORS };
  if (req.method === 'OPTIONS') { res.writeHead(204, base); return res.end(); }

  if (p === '/api/assets') {
    const data = { stills: listStills(), clips: listClips(), generating: regenMarkers(), meta: SCENE_META };
    res.writeHead(200, { ...base, 'Content-Type': 'application/json; charset=utf-8', ...NO_STORE });
    return res.end(JSON.stringify(data));
  }
  if (p === '/api/picks') {
    res.writeHead(200, { ...base, 'Content-Type': 'application/json; charset=utf-8', ...NO_STORE });
    return res.end(JSON.stringify(readPicks()));
  }
  if (p === '/api/pick' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => {
      try {
        const d = JSON.parse(body || '{}');
        const scene = d.scene, file = d.file, kind = d.kind || 'still';
        const list = kind === 'clip' ? listClips() : listStills();
        if (!list[scene]) { res.writeHead(400, { ...base }); return res.end(JSON.stringify({ ok: false, error: 'bad scene' })); }
        if (file !== null && !list[scene].some(c => c.name === file)) { res.writeHead(400, { ...base }); return res.end(JSON.stringify({ ok: false, error: 'bad file' })); }
        const picks = readPicks();
        if (file === null) delete picks[scene]; else picks[scene] = { kind, file };
        writePicks(picks);
        res.writeHead(200, { ...base, 'Content-Type': 'application/json; charset=utf-8', ...NO_STORE });
        res.end(JSON.stringify({ ok: true, picks }));
      } catch (e) {
        res.writeHead(500, { ...base, 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: String(e && e.message || e) }));
      }
    });
    return;
  }
  if (p === '/api/prompt') {
    const scene = u.searchParams.get('scene') || '';
    const file = u.searchParams.get('file') || '';
    let txt = '';
    if (file) txt = readSidecar(path.join(GEN_DIR, file)) || readSidecar(path.join(CLIP_DIR, file));
    if (!txt && scene) txt = readScenePrompt(scene);
    res.writeHead(200, { ...base, 'Content-Type': 'text/plain; charset=utf-8', ...NO_STORE });
    return res.end(txt);
  }
  if (p === '/api/regen' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => {
      try {
        const d = JSON.parse(body || '{}');
        const scene = d.scene;
        if (!SCENES.includes(scene)) { res.writeHead(400, { ...base }); return res.end(JSON.stringify({ ok: false, error: 'bad scene' })); }
        if (regenMarkers().indexOf(scene) >= 0) { res.writeHead(409, { ...base }); return res.end(JSON.stringify({ ok: false, error: '该镜正在重拍中' })); }
        const prompt = readScenePrompt(scene);
        if (!prompt) { res.writeHead(400, { ...base }); return res.end(JSON.stringify({ ok: false, error: '无可用提示词' })); }
        const marker = path.join(__dirname, 'regen-still-' + scene + '.json');
        fs.writeFileSync(marker, JSON.stringify({ scene, started: new Date().toISOString() }));
        // 生成单个新种子版本
        const job = { name: scene, prompt, seed: Math.floor(Math.random() * 1e9), w: 1344, h: 768 };
        fs.writeFileSync(path.join(__dirname, 'regen-jobs.json'), JSON.stringify([job]));
        const child = spawn(process.execPath, [path.join(__dirname, 'gen_zimage.js'), path.join(__dirname, 'regen-jobs.json')], {
          cwd: ROOT, detached: true, stdio: 'ignore', windowsHide: true,
        });
        child.unref();
        const t = setInterval(() => { try { if (!fs.existsSync(marker)) clearInterval(t); } catch (e) {} }, 2000);
        // 生成完成（gen_zimage 不会清标记，这里用子进程退出清理）
        child.on('exit', () => { try { fs.unlinkSync(marker); } catch (e) {} });
        res.writeHead(200, { ...base, 'Content-Type': 'application/json; charset=utf-8', ...NO_STORE });
        res.end(JSON.stringify({ ok: true, prompt: prompt.slice(0, 120) }));
      } catch (e) {
        res.writeHead(500, { ...base, 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: String(e && e.message || e) }));
      }
    });
    return;
  }
  if (p === '/api/outline') {
    try {
      const txt = fs.readFileSync(path.join(ROOT, 'assets', 'script-outline.md'), 'utf8');
      res.writeHead(200, { ...base, 'Content-Type': 'text/plain; charset=utf-8', ...NO_STORE });
      return res.end(txt);
    } catch (e) {
      res.writeHead(404, { ...base }); return res.end('no outline');
    }
  }

  // ---- 静态文件（Range 支持）----
  let fp;
  if (p === '/' || p === '/review.html') fp = path.join(__dirname, 'review.html');
  else fp = path.normalize(path.join(ROOT, p));
  if (!fp.startsWith(ROOT) && !fp.startsWith(__dirname)) { res.writeHead(403, base); return res.end('forbidden'); }
  fs.stat(fp, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404, { ...base, 'Content-Type': 'text/html; charset=utf-8', ...NO_STORE });
      return res.end('<!DOCTYPE html><meta charset="utf-8"><title>404</title><body style="background:#0B0A08;color:#E8E4DC;font-family:sans-serif;padding:40px"><p>页面不存在: <code>' + esc(p) + '</code></p><p><a href="/review.html" style="color:#C9A36B">打开审片页 → http://127.0.0.1:3099/review.html</a></p></body>');
    }
    const ct = MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream';
    const range = req.headers.range;
    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (m) {
        let start = m[1] ? parseInt(m[1], 10) : 0;
        let end = m[2] ? parseInt(m[2], 10) : st.size - 1;
        if (isNaN(start)) start = 0;
        if (isNaN(end) || end >= st.size) end = st.size - 1;
        if (start > end || start >= st.size) {
          res.writeHead(416, { ...base, 'Content-Range': 'bytes */' + st.size });
          return res.end();
        }
        res.writeHead(206, { ...base, 'Content-Type': ct, 'Content-Length': end - start + 1, 'Content-Range': 'bytes ' + start + '-' + end + '/' + st.size, 'Accept-Ranges': 'bytes', ...NO_STORE });
        return fs.createReadStream(fp, { start, end }).pipe(res);
      }
    }
    res.writeHead(200, { ...base, 'Content-Type': ct, 'Content-Length': st.size, 'Accept-Ranges': 'bytes', ...NO_STORE });
    fs.createReadStream(fp).pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('ÉLYSÉE review server: http://127.0.0.1:' + PORT + '/review.html');
});
