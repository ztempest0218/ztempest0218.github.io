const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const libraries = [
  ['jquery/dist/jquery.min.js', 'js/jquery.js'],
  ['bootstrap/dist/js/bootstrap.bundle.min.js', 'js/bootstrap.min.js'],
];
const check = process.argv.includes('--check');
let mismatch = false;
let document = fs.readFileSync(path.join(root, 'nakai.html'), 'utf8');

function embedded(tag, name, content) {
  const pattern = new RegExp(`<${tag} data-site-library="${name}">[\\s\\S]*?</${tag}>`, 'g');
  const expected = `<${tag} data-site-library="${name}">\n${content}\n</${tag}>`;
  const matches = [...document.matchAll(pattern)];
  if (matches.length !== 1) throw new Error(`Expected one ${name} block in nakai.html`);
  if (check) {
    if (matches[0][0] !== expected) {
      console.error(`nakai.html contains an outdated ${name} block. Run npm run vendor.`);
      mismatch = true;
    }
  } else {
    document = document.replace(pattern, () => expected);
  }
}

for (const [source, destination] of libraries) {
  const expected = fs.readFileSync(path.join(root, 'node_modules', source));
  const output = path.join(root, destination);
  if (check) {
    if (!fs.existsSync(output) || !expected.equals(fs.readFileSync(output))) {
      console.error(`${destination} differs from the locked dependency. Run npm run vendor.`);
      mismatch = true;
    }
  } else {
    fs.writeFileSync(output, expected);
    console.log(`Updated ${destination}`);
  }
  embedded('script', source.startsWith('jquery/') ? 'jquery' : 'bootstrap', expected.toString('utf8'));
}

embedded('script', 'rmarkdown-compat', fs.readFileSync(path.join(root, 'js/rmarkdown-bootstrap.js'), 'utf8'));
embedded('style', 'bootstrap-compat', fs.readFileSync(path.join(root, 'css/bootstrap-compat.css'), 'utf8'));
if (!check) fs.writeFileSync(path.join(root, 'nakai.html'), document);

if (mismatch) process.exitCode = 1;
execFileSync(process.execPath, [path.join(root, 'scripts/security-policy.mjs'), ...(check ? ['--check'] : [])], { stdio: 'inherit' });
