import { readFile, writeFile, mkdir } from "node:fs/promises"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

export function toCounts(report) {
  const stats = report.stats ?? {}
  const passed = Number(stats.expected ?? 0) + Number(stats.flaky ?? 0)
  const failed = Number(stats.unexpected ?? 0)
  const skipped = Number(stats.skipped ?? 0)
  return { total: passed + failed + skipped, passed, failed, errors: 0, skipped }
}

async function main() {
  const [, , inputPath, outputPath] = process.argv
  if (!inputPath || !outputPath) throw new Error("usage: node playwright_counts.mjs <playwright.json> <counts.json>")
  const counts = toCounts(JSON.parse(await readFile(inputPath, "utf8")))
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, JSON.stringify(counts), "utf8")
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main()
