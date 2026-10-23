import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parse } from 'parse5';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const directives = [
  "default-src 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  "form-action 'none'",
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
  "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
  "img-src 'self' data:",
  "media-src 'self' data:",
  "connect-src 'self'",
  'upgrade-insecure-requests',
];

function policy(hashes = []) {
  return [...directives, `script-src 'self'${hashes.length ? ` ${hashes.join(' ')}` : ''}`].join('; ');
}

function metas(hashes = []) {
  return `<meta data-site-security="csp" http-equiv="Content-Security-Policy" content="${policy(hashes)}">\n<meta data-site-security="referrer" name="referrer" content="strict-origin-when-cross-origin">`;
}

function output(relative, expected) {
  const file = path.join(root, relative);
  if (check) {
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== expected) {
      throw new Error(`${relative} has a stale security policy. Run npm run vendor.`);
    }
  } else {
    fs.writeFileSync(file, expected);
  }
}

output('_includes/security-policy.html', `${metas()}\n`);

const document = fs.readFileSync(path.join(root, 'nakai.html'), 'utf8');
const parsed = parse(document, { sourceCodeLocationInfo: true });
const hashes = new Set();
const removals = [];
let charsetEnd;

function visit(node) {
  const attrs = Object.fromEntries((node.attrs || []).map(attr => [attr.name, attr.value]));
  const location = node.sourceCodeLocation;
  if (node.tagName === 'meta' && attrs.charset) charsetEnd = location.endOffset;
  if (node.tagName === 'meta' && attrs['data-site-security']) {
    removals.push([location.startOffset, location.endOffset]);
  }
  if (node.tagName === 'script' && !Object.hasOwn(attrs, 'src')) {
    // Hash the exact source bytes the browser uses, not a serialized DOM.
    const script = document.slice(location.startTag.endOffset, location.endTag.startOffset).replace(/\r\n?/g, '\n');
    if (script.trim()) hashes.add(`'sha256-${createHash('sha256').update(script).digest('base64')}'`);
  }
  for (const child of node.childNodes || []) visit(child);
  if (node.content) visit(node.content);
}

visit(parsed);
if (!charsetEnd) throw new Error('nakai.html is missing its charset declaration.');
const edits = removals.map(([start, end]) => ({ start, end, value: '' }));
edits.push({ start: charsetEnd, end: charsetEnd, value: `\n${metas([...hashes].sort())}` });
let secured = document;
for (const edit of edits.sort((a, b) => b.start - a.start)) {
  secured = secured.slice(0, edit.start) + edit.value + secured.slice(edit.end);
}
// Keep repeated generation byte-for-byte stable around the generated meta block.
secured = secured.replace(/(content="strict-origin-when-cross-origin">)\n+/, '$1\n');
output('nakai.html', secured);
console.log(`Security policies ${check ? 'verified' : 'updated'}; ${hashes.size} approved document scripts.`);
