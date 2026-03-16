const fs = require("node:fs");
const path = require("node:path");

const rootDir = __dirname ? path.resolve(__dirname, "..") : process.cwd();
const lockFiles = ["package-lock.json", "yarn.lock"];

for (const fileName of lockFiles) {
  const filePath = path.join(rootDir, fileName);

  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath, { force: true });
  }
}

const userAgent = process.env.npm_config_user_agent || "";

if (!userAgent.startsWith("pnpm/")) {
  console.error("Use pnpm instead");
  process.exit(1);
}
