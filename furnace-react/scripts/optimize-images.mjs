// Shrinks images used by the site: resizes to at most MAX_WIDTH pixels wide and converts
// to WebP, then updates the references in src/ and index.html.
//
//   npm run optimize-images                         # every image referenced by the site
//   npm run optimize-images -- src/assets/images/new-photo.jpg   # specific files
//
// An image is only replaced when that saves at least MIN_SAVING_PCT and MIN_SAVING_KB,
// so small icons and already-optimized files are left alone. Originals stay in git
// history. Review the result in the browser before committing.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const MAX_WIDTH = 1920; // wider than the site's largest layout
const QUALITY = 80; // WebP quality: visually indistinguishable at screen size
const MIN_SAVING_PCT = 25;
const MIN_SAVING_KB = 20;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const SRC = path.join(ROOT, "src");
const IMAGE_RE = /\.(jpe?g|png|webp)$/i;

function walk(dir, filter) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p, filter) : filter(p) ? [p] : [];
  });
}

// Files that can reference images
const codeFiles = [...walk(SRC, (p) => /\.(jsx?|css)$/.test(p)), path.join(ROOT, "index.html")];
const code = new Map(codeFiles.map((f) => [f, fs.readFileSync(f, "utf8")]));
// "assets/images/x.jpg" matches "/src/assets/images/x.jpg" and "../../assets/images/x.jpg"
const ref = (file) => path.relative(SRC, file).split(path.sep).join("/");
const isReferenced = (file) => [...code.values()].some((c) => c.includes(ref(file)));

const args = process.argv.slice(2);
const targets = args.length
  ? args.map((a) => path.resolve(ROOT, a))
  : walk(SRC, (p) => IMAGE_RE.test(p)).filter(isReferenced);

const kb = (n) => `${Math.round(n / 1024)} KB`.padStart(8);
let before = 0;
let after = 0;

for (const file of targets) {
  const input = fs.readFileSync(file);
  const output = await sharp(input)
    .rotate() // apply camera orientation before stripping metadata
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toBuffer();
  const saved = input.length - output.length;
  before += input.length;
  if (saved < (input.length * MIN_SAVING_PCT) / 100 || saved < MIN_SAVING_KB * 1024) {
    after += input.length;
    console.log(`  keep  ${kb(input.length)}              ${ref(file)}`);
    continue;
  }
  after += output.length;
  const outFile = file.replace(IMAGE_RE, ".webp");
  if (outFile !== file && fs.existsSync(outFile)) throw new Error(`${ref(outFile)} already exists`);
  fs.writeFileSync(outFile, output);
  if (outFile !== file) {
    for (const [f, c] of code) {
      if (c.includes(ref(file))) code.set(f, c.split(ref(file)).join(ref(outFile)));
    }
    if (isReferenced(file)) throw new Error(`references to ${ref(file)} remain`);
    fs.unlinkSync(file);
  }
  console.log(`  webp  ${kb(input.length)} -> ${kb(output.length)}  ${ref(outFile)}`);
}

for (const [f, c] of code) {
  if (c !== fs.readFileSync(f, "utf8")) fs.writeFileSync(f, c);
}
console.log(`\n${targets.length} images: ${kb(before)} -> ${kb(after)}`);
