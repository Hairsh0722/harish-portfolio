/**
 * FTP deploy for InfinityFree.
 *
 * Reads FTP credentials from .env.deploy (gitignored) and uploads the compiled
 * ./build folder into the remote web root (htdocs). Run via: npm run deploy
 * (the "predeploy" script builds first).
 *
 * Credentials never live in git or in source — only in .env.deploy on your machine.
 */
const fs = require("fs");
const path = require("path");
const ftp = require("basic-ftp");

const ROOT = path.join(__dirname, "..");
const BUILD_DIR = path.join(ROOT, "build");
const ENV_FILE = path.join(ROOT, ".env.deploy");

function loadEnv(file) {
  if (!fs.existsSync(file)) {
    console.error(`\n✖ Missing ${path.basename(file)}.`);
    console.error("  Copy your InfinityFree FTP details into it, then re-run.\n");
    process.exit(1);
  }
  const env = {};
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    // strip surrounding quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

async function main() {
  if (!fs.existsSync(BUILD_DIR) || !fs.existsSync(path.join(BUILD_DIR, "index.html"))) {
    console.error("\n✖ No build/ found. Run `npm run build` first (or use `npm run deploy`).\n");
    process.exit(1);
  }

  const env = loadEnv(ENV_FILE);
  const host = env.FTP_HOST;
  const user = env.FTP_USER;
  const password = env.FTP_PASSWORD;
  const remoteDir = (env.FTP_REMOTE_DIR || "htdocs").trim();
  const secure = String(env.FTP_SECURE || "false").toLowerCase() === "true";
  const clearRemote = String(env.CLEAR_REMOTE || "true").toLowerCase() === "true";

  const missing = ["FTP_HOST", "FTP_USER", "FTP_PASSWORD"].filter((k) => !env[k] || env[k].includes("your-"));
  if (missing.length) {
    console.error(`\n✖ Fill in these values in .env.deploy: ${missing.join(", ")}\n`);
    process.exit(1);
  }

  // Safety guard: never clear the account root.
  if (clearRemote && (remoteDir === "/" || remoteDir === "" || remoteDir === ".")) {
    console.error("\n✖ Refusing to clear the account root. Set FTP_REMOTE_DIR to a folder like 'htdocs'.\n");
    process.exit(1);
  }

  const client = new ftp.Client(30000); // 30s timeout
  client.ftp.verbose = false;

  console.log(`\n→ Connecting to ${host} as ${user} (${secure ? "FTPS" : "FTP"})…`);
  try {
    await client.access({ host, user, password, secure, secureOptions: { rejectUnauthorized: false } });
    console.log("✓ Connected.");

    console.log(`→ Target remote dir: /${remoteDir}`);
    await client.ensureDir(remoteDir); // creates + cd's into it

    if (clearRemote) {
      console.log("→ Clearing old files in remote dir (stale hashed chunks)…");
      await client.clearWorkingDir();
      console.log("✓ Cleared.");
    }

    console.log("→ Uploading build/ …");
    client.trackProgress((info) => {
      if (info.name) process.stdout.write(`  ↑ ${info.name}\r`);
    });
    await client.uploadFromDir(BUILD_DIR);
    client.trackProgress();
    console.log("\n✓ Upload complete.");
    console.log("\n✅ Deployed. Open your site and hard-refresh (Ctrl+F5).\n");
  } catch (err) {
    console.error("\n✖ Deploy failed:", err.message);
    console.error(
      "\nCommon InfinityFree fixes:\n" +
        "  • Double-check FTP_HOST / FTP_USER / FTP_PASSWORD in the vPanel → FTP Details.\n" +
        "  • Free hosting uses plain FTP (FTP_SECURE=false) on port 21, passive mode.\n" +
        "  • If it stalls on many files, re-run — InfinityFree throttles connections.\n" +
        "  • If it still fails, upload build/ manually with FileZilla to /htdocs.\n"
    );
    process.exitCode = 1;
  } finally {
    client.close();
  }
}

main();
