import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const standaloneDir = join(".next", "standalone");

if (!existsSync(standaloneDir)) {
  console.log("No standalone output found, skipping postbuild copy.");
  process.exit(0);
}

if (existsSync("public")) {
  cpSync("public", join(standaloneDir, "public"), { recursive: true });
}

const staticDir = join(standaloneDir, ".next", "static");
mkdirSync(staticDir, { recursive: true });
cpSync(".next/static", staticDir, { recursive: true });

console.log("Standalone bundle prepared with static assets.");
