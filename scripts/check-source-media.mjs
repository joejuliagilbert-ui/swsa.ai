// Build-time SOURCE-media gate. FAIL-CLOSED and FORMAT-AWARE: any source image
// consumed by the image pipeline must be
//   (a) present in the approval manifest,
//   (b) a supported raster format (jpeg / png / webp),
//   (c) free of EXIF, GPS, XMP, and IPTC metadata, and
//   (d) covered by a complete, approved consent/provenance record.
// A missing/malformed manifest, an unmanifested source, an unsupported/unreadable
// format, or any embedded metadata blocks the build. Derivative metadata
// stripping remains as defense #2.
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const REQUIRED_APPROVAL_FIELDS = ["sourceId", "provenance", "publicUseApproved", "approvalDate", "privacyReview"];
const DEFAULT_MANIFEST = "src/_data/media-approvals.json";
// Raster source formats the validator is able to inspect. Anything else is
// rejected rather than silently trusted.
const SUPPORTED_FORMATS = new Set(["jpeg", "png", "webp"]);

/** JPEG-specific byte scan for a GPS IFD (tag 0x8825). Kept as extra defense. */
export function detectExifGps(buf) {
  const out = { hasExif: false, hasGps: false };
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return out;
  let off = 2;
  while (off + 4 <= buf.length) {
    if (buf[off] !== 0xff) break;
    const marker = buf[off + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    const segLen = buf.readUInt16BE(off + 2);
    const segStart = off + 4;
    if (marker === 0xe1 && buf.toString("ascii", segStart, segStart + 4) === "Exif") {
      out.hasExif = true;
      out.hasGps = tiffHasGps(buf.subarray(segStart + 6, off + 2 + segLen));
      return out;
    }
    off = segStart + segLen - 2;
  }
  return out;
}

function tiffHasGps(tiff) {
  if (tiff.length < 8) return false;
  const le = tiff.toString("ascii", 0, 2) === "II";
  const u16 = (o) => (le ? tiff.readUInt16LE(o) : tiff.readUInt16BE(o));
  const u32 = (o) => (le ? tiff.readUInt32LE(o) : tiff.readUInt32BE(o));
  const ifd0 = u32(4);
  if (ifd0 + 2 > tiff.length) return false;
  const count = u16(ifd0);
  for (let i = 0; i < count; i++) {
    const entry = ifd0 + 2 + i * 12;
    if (entry + 2 > tiff.length) break;
    if (u16(entry) === 0x8825) return true;
  }
  return false;
}

/**
 * Format-aware metadata inspection using sharp. Rejects unsupported/unreadable
 * formats and any embedded EXIF/GPS/XMP/IPTC across jpeg/png/webp.
 */
export async function inspectSourceMetadata(buffer) {
  let meta;
  try {
    meta = await sharp(buffer).metadata();
  } catch {
    return { ok: false, reasons: ["source unreadable or not a supported raster image"] };
  }
  const fmt = meta.format;
  if (!SUPPORTED_FORMATS.has(fmt)) {
    return { ok: false, reasons: [`unsupported source format: ${fmt || "unknown"}`], format: fmt };
  }
  const reasons = [];
  if (meta.exif) reasons.push("source contains EXIF metadata");
  if (meta.xmp) reasons.push("source contains XMP metadata");
  if (meta.iptc) reasons.push("source contains IPTC metadata");
  if (fmt === "jpeg" && detectExifGps(buffer).hasGps) reasons.push("source contains GPS metadata");
  return { ok: reasons.length === 0, reasons, format: fmt };
}

/** Validate one consent/provenance record. */
export function validateApproval(approval) {
  const reasons = [];
  if (!approval || typeof approval !== "object") return { ok: false, reasons: ["approval record missing"] };
  for (const f of REQUIRED_APPROVAL_FIELDS) {
    const v = approval[f];
    if (v === undefined || v === null || v === "") reasons.push(`missing ${f}`);
  }
  if (approval.publicUseApproved !== true) reasons.push("publicUseApproved is not true");
  if (approval.privacyReview !== "passed") reasons.push("privacyReview is not 'passed'");
  return { ok: reasons.length === 0, reasons };
}

/** Validate a single source file + its approval record (format-aware, async). */
export async function validateSource({ file, approval, baseDir = "." }) {
  const abs = join(baseDir, file);
  if (!existsSync(abs)) return { ok: false, reasons: [`file not found: ${file}`] };
  const reasons = [];
  reasons.push(...(await inspectSourceMetadata(readFileSync(abs))).reasons);
  reasons.push(...validateApproval(approval).reasons);
  return { ok: reasons.length === 0, reasons };
}

/** Load + structurally validate the manifest. Throws on missing/malformed. */
export function loadManifest(manifestPath) {
  if (!existsSync(manifestPath)) throw new Error(`media manifest missing: ${manifestPath}`);
  let raw;
  try { raw = readFileSync(manifestPath, "utf8"); }
  catch { throw new Error(`media manifest unreadable: ${manifestPath}`); }
  let data;
  try { data = JSON.parse(raw); }
  catch { throw new Error(`media manifest malformed JSON: ${manifestPath}`); }
  if (!Array.isArray(data)) throw new Error(`media manifest must be a JSON array: ${manifestPath}`);
  for (const e of data) {
    if (!e || typeof e !== "object" || typeof e.file !== "string" || typeof e.approval !== "object") {
      throw new Error(`media manifest entry malformed: ${JSON.stringify(e)}`);
    }
  }
  return data;
}

const normalize = (p) => p.replace(/^\.?\//, "");

/**
 * FAIL-CLOSED choke point used by the image pipeline (async). Throws unless
 * `file` is manifested, a supported metadata-clean format, and approved.
 * Manifest path may be overridden via SWSA_MEDIA_MANIFEST (negative build tests).
 */
export async function assertSourceAllowed(file, { baseDir = ".", manifestPath } = {}) {
  const mPath = join(baseDir, process.env.SWSA_MEDIA_MANIFEST || manifestPath || DEFAULT_MANIFEST);
  const manifest = loadManifest(mPath); // throws on missing/malformed
  const entry = manifest.find((e) => normalize(e.file) === normalize(file));
  if (!entry) throw new Error(`SOURCE MEDIA REJECTED (unmanifested source): ${file}`);
  const r = await validateSource({ file: entry.file, approval: entry.approval, baseDir });
  if (!r.ok) throw new Error(`SOURCE MEDIA REJECTED (${file}): ${r.reasons.join("; ")}`);
  return true;
}

export async function validateManifest(entries, baseDir = ".") {
  const out = [];
  for (const e of entries) out.push({ file: e.file, ...(await validateSource({ file: e.file, approval: e.approval, baseDir })) });
  return out;
}

// ---- CLI: load + validate the real manifest; fail the build on any issue ----
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const root = dirname(dirname(fileURLToPath(import.meta.url)));
  const entries = loadManifest(join(root, DEFAULT_MANIFEST)); // fail-closed on missing/malformed
  const results = await validateManifest(entries, root);
  let failed = 0;
  for (const r of results) {
    if (r.ok) console.log(`  OK      ${r.file}`);
    else { failed++; console.error(`  REJECT  ${r.file} — ${r.reasons.join("; ")}`); }
  }
  console.log(`Source-media gate: ${results.length - failed}/${results.length} approved.`);
  if (failed > 0) { console.error("Source-media gate FAILED — build blocked."); process.exit(1); }
}
