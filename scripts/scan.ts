import { runMediaScan } from "../src/services/scanner";

async function main() {
  console.log("Starting media scan...");
  const result = await runMediaScan("manual");
  console.log("Scan complete:", result);
  process.exit(0);
}

main().catch((err) => {
  console.error("Scan failed:", err);
  process.exit(1);
});
