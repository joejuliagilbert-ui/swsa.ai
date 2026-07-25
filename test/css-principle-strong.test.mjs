// C4A micro-correction: the built stylesheet must keep the navy emphasis on
// principle-list strong text (Navy, not Slate).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

test("built stylesheet keeps .principle-list li strong { color: var(--navy) }", () => {
  const css = readFileSync(join(process.cwd(), "_site", "assets", "css", "style.css"), "utf8");
  assert.match(css, /\.principle-list li strong\s*\{[^}]*color:\s*var\(--navy\)/, "principle-list strong must be navy");
});
