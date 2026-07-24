// Copies ONLY the specific self-hosted font files the design system uses,
// out of the installed @fontsource packages, into src/assets/fonts/.
// Inter ships as one variable (wght) latin file. Newsreader is budget-gated to
// a single weight (400) so the editorial accent cannot silently grow the payload.
import { readdirSync, mkdirSync, copyFileSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = "src/assets/fonts";
mkdirSync(OUT, { recursive: true });

const jobs = [
  {
    label: "Inter (variable wght, latin)",
    dir: "node_modules/@fontsource-variable/inter/files",
    match: /^inter-latin-wght-normal\.woff2$/
  },
  {
    label: "Newsreader 400 (latin) — budget-gated single weight",
    dir: "node_modules/@fontsource/newsreader/files",
    match: /^newsreader-latin-400-normal\.woff2$/
  }
];

let total = 0;
for (const job of jobs) {
  const found = readdirSync(job.dir).filter((f) => job.match.test(f));
  if (found.length === 0) {
    throw new Error(`copy-fonts: no file matched ${job.match} in ${job.dir}`);
  }
  for (const f of found) {
    copyFileSync(join(job.dir, f), join(OUT, f));
    const bytes = statSync(join(OUT, f)).size;
    total += bytes;
    console.log(`  ${(bytes / 1024).toFixed(1).padStart(6)} KB  ${f}  (${job.label})`);
  }
}
console.log(`Self-hosted font payload total: ${(total / 1024).toFixed(1)} KB`);
