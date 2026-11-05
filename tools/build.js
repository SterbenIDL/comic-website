#!/usr/bin/env node
/**
 * Generates the Open Graph (link preview) tags and the per-chapter share pages.
 *
 *   node tools/build.js https://your-site.com     <- first time (the URL is remembered)
 *   node tools/build.js                           <- after adding / editing chapters
 *   node tools/build.js --single                  <- ALSO writes dist/comics.html: everything in ONE file
 *                                                    (data inlined, share links use #chapterN-pageM)
 *
 * It rewrites ONLY the block between <!-- OG:START --> and <!-- OG:END --> in the main page,
 * and the files in share/. Safe to run as many times as you like.
 *
 * Also: picks .jpg when the config says .jpeg (and the other way around), adds image size/alt/type tags,
 * a canonical link, marks the share pages noindex, and (when you give a real URL) replaces the
 * placeholder https://YOUR-DOMAIN.example in every other .html/.xml/.txt/.json file in the site folder.
 */
const fs = require('fs');
const path = require('path');
const { root, loadChapters } = require('./lib');

const cfgPath = path.join(root, 'site.config.json');
const cfg = Object.assign({
  siteUrl: 'https://YOUR-DOMAIN.example',
  mainPage: 'comics.html',
  siteTitle: 'Squad Noobs - ספר הקומיקס המלא',
  siteDescription: 'ארבעה חברים, ארבעה כוחות, ספר קומיקס אחד. קראו את כל הפרקים אונליין.',
  defaultImage: 'Chapter_1.jpg',
  imageAlt: 'Squad Noobs - עטיפת ספר הקומיקס'
}, fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, 'utf8')) : {});

const urlArg = process.argv.slice(2).find(a => /^https?:\/\//.test(a));
if (urlArg) cfg.siteUrl = urlArg.replace(/\/+$/, '');
cfg.siteUrl = cfg.siteUrl.replace(/\/+$/, '');
fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const abs = (p) => `${cfg.siteUrl}/${encodeURI(p)}`;

// Use .jpg when the config says .jpeg (or the other way around), so previews never point at a missing file.
function resolveFile(p) {
  for (const t of [p, p.replace(/\.jpeg$/i, '.jpg'), p.replace(/\.jpg$/i, '.jpeg')]) {
    if (fs.existsSync(path.join(root, t))) return t;
  }
  console.warn(`! Image not found: ${p}`);
  return p;
}

// Reads width/height of a JPEG or PNG without any library (used for og:image:width/height).
function imageSize(p) {
  try {
    const b = fs.readFileSync(path.join(root, p));
    if (b[0] === 0x89 && b.toString('ascii', 1, 4) === 'PNG') return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const m = b[i + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
        i += 2 + b.readUInt16BE(i + 2);
      }
    }
  } catch (e) { /* no size tags, previews still work */ }
  return null;
}

const mime = (p) => (/\.png$/i.test(p) ? 'image/png' : 'image/jpeg');

function ogBlock({ title, description, url, imagePath, alt, canonical, robots }, indent) {
  const image = abs(imagePath);
  const size = imageSize(imagePath);
  return [
    canonical ? `<link rel="canonical" href="${esc(url)}">` : null,
    robots ? `<meta name="robots" content="${robots}">` : null,
    `<meta name="description" content="${esc(description)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:locale" content="he_IL">`,
    `<meta property="og:locale:alternate" content="en_US">`,
    `<meta property="og:site_name" content="Squad Noobs">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:image" content="${esc(image)}">`,
    image.startsWith('https://') ? `<meta property="og:image:secure_url" content="${esc(image)}">` : null,
    `<meta property="og:image:type" content="${mime(imagePath)}">`,
    size ? `<meta property="og:image:width" content="${size.w}">` : null,
    size ? `<meta property="og:image:height" content="${size.h}">` : null,
    `<meta property="og:image:alt" content="${esc(alt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    `<meta name="twitter:image" content="${esc(image)}">`,
    `<meta name="twitter:image:alt" content="${esc(alt)}">`
  ].filter(Boolean).map(l => indent + l).join('\n');
}

// ---- 1) main page: default OG tags ----
const mainPath = path.join(root, cfg.mainPage);
let html = fs.readFileSync(mainPath, 'utf8');
const eol = html.includes('\r\n') ? '\r\n' : '\n';
html = html.replace(/\r\n/g, '\n');
const re = /<!-- OG:START -->[\s\S]*?<!-- OG:END -->/;
if (!re.test(html)) { console.error(`Markers <!-- OG:START --> / <!-- OG:END --> not found in ${cfg.mainPage}`); process.exit(1); }
const mainBlock = '<!-- OG:START -->\n' + ogBlock({
  title: cfg.siteTitle, description: cfg.siteDescription,
  url: `${cfg.siteUrl}/${cfg.mainPage}`, imagePath: resolveFile(cfg.defaultImage), alt: cfg.imageAlt,
  canonical: true, robots: 'index, follow, max-image-preview:large'
}, '    ') + '\n    <!-- OG:END -->';
html = html.replace(re, mainBlock);
fs.writeFileSync(mainPath, html.replace(/\n/g, eol));

// ---- 2) one share page per chapter ----
const shareDir = path.join(root, 'share');
fs.mkdirSync(shareDir, { recursive: true });
const chapters = loadChapters();
for (const ch of chapters) {
  const n = ch.number;
  const title = `${ch.meta.name} — ${ch.meta.title} | Squad Noobs`;
  const description = `${ch.meta.category}. ${ch.pages.length} עמודים. קראו עכשיו.`;
  const target = `../${cfg.mainPage}#chapter${n}-page`;
  const page = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
${ogBlock({ title, description, url: `${cfg.siteUrl}/share/chapter${n}.html`, imagePath: resolveFile(ch.meta.img), alt: `${ch.meta.name} - ${ch.meta.title}`, robots: 'noindex, follow' }, '')}
<noscript><meta http-equiv="refresh" content="0; url=${target}1"></noscript>
<script>
  // Keeps the page number: share/chapter2.html#page7 -> comics.html#chapter2-page7
  var m = location.hash.match(/(\\d+)/);
  location.replace('${target}' + (m ? m[1] : 1));
</script>
</head>
<body style="background:#030712;color:#f8fafc;font-family:sans-serif;text-align:center;padding:3rem">
  <p><a href="${target}1" style="color:#fbbf24">${esc(ch.meta.name)} — ${esc(ch.meta.title)}</a></p>
</body>
</html>
`;
  fs.writeFileSync(path.join(shareDir, `chapter${n}.html`), page);
}

// ---- 3) optional: one self-contained file ----
if (process.argv.includes('--single')) {
  let single = fs.readFileSync(mainPath, 'utf8').replace(/\r\n/g, '\n');
  const inline = chapters.map(c => fs.readFileSync(path.join(root, 'data', c.file), 'utf8').replace(/^\/\*[\s\S]*?\*\/\s*/, '')).filter((v, i, a) => a.indexOf(v) === i).join('\n');
  const tags = /( *<script src="data\/chapter\d+\.js"><\/script>\n?)+/;
  if (!tags.test(single)) { console.error('data script tags not found in main page'); process.exit(1); }
  single = single.replace(tags, () => '    <script>\n' + inline.replace(/<\/script/gi, '<\\/script') + '\n    </script>\n');
  single = single.replace('const SHARE_VIA_PAGES = true;', 'const SHARE_VIA_PAGES = false;');
  fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
  fs.writeFileSync(path.join(root, 'dist', 'comics.html'), single.replace(/\n/g, eol));
  console.log('Wrote dist/comics.html (single file).');
}

// ---- 4) replace the placeholder domain in every other file of the site folder ----
if (!cfg.siteUrl.includes('YOUR-DOMAIN')) {
  const PLACEHOLDER = 'https://YOUR-DOMAIN.example';
  let changed = 0;
  for (const f of fs.readdirSync(root)) {
    if (!/\.(html|xml|txt|webmanifest|json)$/i.test(f)) continue;
    const p = path.join(root, f);
    const t = fs.readFileSync(p, 'utf8');
    if (t.includes(PLACEHOLDER)) { fs.writeFileSync(p, t.split(PLACEHOLDER).join(cfg.siteUrl)); changed++; }
  }
  console.log(`Replaced the placeholder domain in ${changed} file(s).`);
}

console.log(`Updated OG tags in ${cfg.mainPage} and wrote ${chapters.length} share pages (site: ${cfg.siteUrl}).`);
if (cfg.siteUrl.includes('YOUR-DOMAIN')) {
  console.log('\n! Remember to run:  node tools/build.js https://your-real-site.com');
}