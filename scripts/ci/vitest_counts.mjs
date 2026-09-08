import { readFile, writeFile, mkdir } from "node:fs/promises"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

export function toCounts(report) {
  const total = Number(report.numTotalTests ?? 0)
  const passed = Number(report.numPassedTests ?? 0)
  const skipped = Number(report.numPendingTests ?? 0)
  const failed = Number(report.numFailedTests ?? 0)
  return { total, passed, failed, errors: 0, skipped }
}

async function main() {
  const [, , inputPath, outputPath] = process.argv
  if (!inputPath || !outputPath) throw new Error("usage: node vitest_counts.mjs <vitest.json> <counts.json>")
  const counts = toCounts(JSON.parse(await readFile(inputPath, "utf8")))
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, JSON.stringify(counts), "utf8")
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main()