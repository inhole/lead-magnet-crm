import { appendFile, readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"

export function environmentFromStatus(status) {
  const apiUrl = String(status.API_URL ?? "")
  const anonKey = String(status.ANON_KEY ?? "")
  const serviceRoleKey = String(status.SERVICE_ROLE_KEY ?? "")
  if (!/^https?:\/\//.test(apiUrl) || !anonKey || !serviceRoleKey) {
    throw new Error("Supabase status에 필수 로컬 환경값이 없습니다.")
  }
  return {
    API_URL: apiUrl,
    ANON_KEY: anonKey,
    SERVICE_ROLE_KEY: serviceRoleKey,
    SUPABASE_URL: apiUrl,
    SUPABASE_ANON_KEY: anonKey,
    SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
    NEXT_PUBLIC_SUPABASE_URL: apiUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: anonKey,
  }
}

async function main() {
  const [, , inputPath, outputPath] = process.argv
  if (!inputPath || !outputPath) throw new Error("usage: node supabase_env.mjs <status.json> <github-env>")
  const values = environmentFromStatus(JSON.parse(await readFile(inputPath, "utf8")))
  await appendFile(outputPath, `${Object.entries(values).map(([key, value]) => `${key}=${value}`).join("\n")}\n`, "utf8")
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main()
