import Image from "@11ty/eleventy-img";

/**
 * Build-time responsive image pipeline.
 * Re-encoding through eleventy-img/sharp intentionally does NOT carry source
 * EXIF/GPS metadata into the generated derivatives — the metadata strip is a
 * property of the pipeline, verified by test/no-forbidden-metadata.test.mjs.
 * Alt text is mandatory; a missing alt fails the build (accessibility gate).
 */
async function imageShortcode(src, alt, sizes = "100vw", className = "", eager = false) {
  if (alt === undefined || alt === null) {
    throw new Error(`Missing required alt text for image: ${src}`);
  }
  const metadata = await Image(src, {
    widths: [400, 800, 1200, 1600],
    formats: ["avif", "webp", "jpeg"],
    outputDir: "./_site/assets/img/opt/",
    urlPath: "/assets/img/opt/"
  });
  const attrs = {
    alt,
    sizes,
    class: className,
    loading: eager ? "eager" : "lazy",
    decoding: "async"
  };
  if (eager) attrs.fetchpriority = "high";
  return Image.generateHTML(metadata, attrs);
}

export default function (eleventyConfig) {
  // Static passthroughs (self-hosted only — no third-party asset origins)
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
