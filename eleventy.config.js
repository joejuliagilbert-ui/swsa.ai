import Image from "@11ty/eleventy-img";
import { assertSourceAllowed } from "./scripts/check-source-media.mjs";

/**
 * Build-time responsive image pipeline. FAIL-CLOSED: every source consumed here
 * must clear the source-media gate (manifested + metadata-clean + approved)
 * BEFORE any processing — an unmanifested or unapproved source throws and blocks
 * the build. Re-encoding then strips source EXIF/GPS as defense #2. Alt text is
 * mandatory.
 */
export async function imageShortcode(src, alt, sizes = "100vw", className = "", eager = false) {
  if (alt === undefined || alt === null) {
    throw new Error(`Missing required alt text for image: ${src}`);
  }
  await assertSourceAllowed(src, { baseDir: process.cwd() }); // fail-closed, format-aware gate
  const metadata = await Image(src, {
    widths: [400, 800, 1200, 1600],
    formats: ["avif", "webp", "jpeg"],
    outputDir: "./_site/assets/img/opt/",
    urlPath: "/assets/img/opt/"
  });
  const attrs = { alt, sizes, class: className, loading: eager ? "eager" : "lazy", decoding: "async" };
  if (eager) attrs.fetchpriority = "high";
  return Image.generateHTML(metadata, attrs);
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets/css": "assets/css" });
  eleventyConfig.addPassthroughCopy({ "src/assets/fonts": "assets/fonts" });

  eleventyConfig.addAsyncShortcode("image", imageShortcode);

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md"]
  };
}
