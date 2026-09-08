import { readFile } from "node:fs/promises"
import path from "node:path"

export async function GET() {
  const sample = await readFile(path.join(process.cwd(), "samples", "lead-form.html"), "utf8")
  return new Response(sample, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": 'attachment; filename="lead-form.html"',
      "Cache-Control": "public, max-age=3600",
    },
  })
}