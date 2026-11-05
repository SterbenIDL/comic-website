// Shared helpers for tools/build.js and tools/check.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');

function loadChapters() {
  const dir = path.join(root, 'data');
  const files = fs.readdirSync(dir)
    .filter(f => /^chapter\d+\.js$/.test(f))
    .sort((a, b) => parseInt(a.replace(/\D/g, ''), 10) - parseInt(b.replace(/\D/g, ''), 10));
  const chapters = [];
  for (const f of files) {
    const sandbox = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(dir, f), 'utf8'), sandbox, { filename: f });
    const data = sandbox.window.COMIC_DATA || {};
    for (const key of Object.keys(data)) {
      chapters.push({ key, number: parseInt(key.replace(/\D/g, ''), 10), file: f, meta: data[key].meta, pages: data[key].pages });
    }
  }
  return chapters;
}

module.exports = { root, loadChapters };
