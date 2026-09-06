import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const swPath = path.resolve(__dirname, "../dist/sw.js");

// Timestamp guarantees a byte-diff on every single build, with zero manual steps.
const version = Date.now().toString();

let content = readFileSync(swPath, "utf-8");
content = content.replace(/const VERSION = ".*?";/, `const VERSION = "${version}";`);
writeFileSync(swPath, content);

console.log(`sw.js VERSION stamped: ${version}`);
