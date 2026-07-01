import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const addFailure = (message) => failures.push(message);

const readText = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");

const walk = (relativeDir, options = {}) => {
  const absoluteDir = path.join(root, relativeDir);
  if (!existsSync(absoluteDir)) {
    return [];
  }

  const ignoredDirs = new Set(options.ignoredDirs ?? []);
  const results = [];

  for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        results.push(...walk(relativePath, options));
      }
      continue;
    }

    if (entry.isFile()) {
      results.push(relativePath);
    }
  }

  return results;
};

const checkHeaders = () => {
  const headersPath = "public/_headers";
  if (!existsSync(path.join(root, headersPath))) {
    addFailure("public/_headers is missing.");
    return;
  }

  const headers = readText(headersPath);
  const requiredSnippets = [
    "Content-Security-Policy:",
    "default-src 'self'",
    "script-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "Strict-Transport-Security:",
    "X-Content-Type-Options: nosniff",
    "Referrer-Policy:",
    "Permissions-Policy:",
    "X-Frame-Options: DENY",
  ];

  for (const snippet of requiredSnippets) {
    if (!headers.includes(snippet)) {
      addFailure(`public/_headers is missing required security header snippet: ${snippet}`);
    }
  }
};

const checkDangerousApis = () => {
  const targets = ["src", "public"];
  const files = targets.flatMap((dir) =>
    walk(dir, {
      ignoredDirs: new Set(["node_modules", "dist", "test-results", "tmp", "output", "admin"]),
    }),
  );

  const patterns = [
    { label: "dangerouslySetInnerHTML", regex: /dangerouslySetInnerHTML/ },
    { label: "direct innerHTML assignment", regex: /\.innerHTML\s*=/ },
    { label: "eval call", regex: /\beval\s*\(/ },
    { label: "Function constructor", regex: /\bnew\s+Function\s*\(/ },
    { label: "document.cookie access", regex: /\bdocument\.cookie\b/ },
    { label: "localStorage access", regex: /\blocalStorage\b/ },
    { label: "sessionStorage access", regex: /\bsessionStorage\b/ },
    { label: "network fetch", regex: /\bfetch\s*\(/ },
  ];

  for (const file of files) {
    const ext = path.extname(file);
    if (![".ts", ".tsx", ".js", ".jsx", ".html", ".md"].includes(ext)) {
      continue;
    }

    const text = readText(file);
    for (const pattern of patterns) {
      if (pattern.regex.test(text)) {
        addFailure(`${file} uses ${pattern.label}. Review or add an explicit allowlist before shipping.`);
      }
    }
  }
};

const checkPdfLeak = () => {
  const files = ["public", "dist"].flatMap((dir) =>
    walk(dir, {
      ignoredDirs: new Set(["node_modules", "test-results", "tmp", "output", "admin"]),
    }),
  );

  for (const file of files) {
    if (path.extname(file).toLowerCase() === ".pdf") {
      addFailure(`PDF must not be bundled into public/dist: ${file}`);
    }
  }
};

const checkFileSizes = () => {
  const publicFiles = walk("public", {
    ignoredDirs: new Set(["node_modules", "test-results", "tmp", "output", "admin"]),
  });
  const maxAssetBytes = 8 * 1024 * 1024;

  for (const file of publicFiles) {
    const size = statSync(path.join(root, file)).size;
    if (size > maxAssetBytes) {
      addFailure(`${file} is ${(size / 1024 / 1024).toFixed(1)}MB. Keep public assets under 8MB.`);
    }
  }
};

checkHeaders();
checkDangerousApis();
checkPdfLeak();
checkFileSizes();

if (failures.length > 0) {
  console.error("Static security check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Static security check passed.");
