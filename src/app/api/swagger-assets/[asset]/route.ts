import { readFile } from "node:fs/promises"
import path from "node:path"

const assets = {
  "swagger-ui.css": "text/css; charset=utf-8",
  "swagger-ui-bundle.js": "text/javascript; charset=utf-8",
} as const

export async function GET(_request: Request, { params }: { params: Promise<{ asset: string }> }) {
  const { asset } = await params
  const contentType = assets[asset as keyof typeof assets]
  if (!contentType) return new Response("Not found", { status: 404 })
  const content = await readFile(path.join(process.cwd(), "node_modules", "swagger-ui-dist", asset))
  return new Response(content, { headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=31536000, immutable" } })
}
