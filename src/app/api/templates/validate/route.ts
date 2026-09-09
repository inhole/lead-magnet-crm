import { NextResponse } from "next/server"

import { extractFormCopy } from "@/lib/forms/render-template"
import { buildSandboxPreview, validateFormHtml } from "@/lib/forms/validate-html"

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null)
  const file = formData?.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: "HTML 파일을 선택하세요." }, { status: 400 })
  }
  if (file.size > 256 * 1024) {
    return NextResponse.json({ code: "HTML_TOO_LARGE", message: "HTML 파일은 256KB 이하여야 합니다." }, { status: 413 })
  }

  const result = validateFormHtml(await file.text())
  if (!result.ok) {
    return NextResponse.json({ code: "INVALID_HTML", message: "HTML 작성 규칙을 확인하세요.", errors: result.errors }, { status: 400 })
  }
  return NextResponse.json({ html: result.html, preview: buildSandboxPreview(result.html), fields: result.fields, defaults: extractFormCopy(result.html) })
}
