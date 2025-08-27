const fs = require("fs");
const path = require("path");

try {
  const apiKey = process.env.YOUTUBE_API_KEY || "";
  const out = `window.ENV = ${JSON.stringify({ YOUTUBE_API_KEY: apiKey })};\n`;
  const outPath = path.join(__dirname, "..", "env.js");
  fs.writeFileSync(outPath, out, { encoding: "utf8" });
  console.log("Generated env.js at", outPath);
} catch (err) {
  console.error("Failed to generate env.js", err);
  process.exit(1);
}
