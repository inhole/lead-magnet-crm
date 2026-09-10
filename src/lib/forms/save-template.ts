import type { HtmlValidationError } from "@/lib/forms/types"

export type SaveTemplateResult = { ok: true } | { ok: false; message: string; errors?: HtmlValidationError[] }

export async function saveTemplateHtml(name: string, html: string): Promise<SaveTemplateResult> {
  const validateBody = new FormData()
  validateBody.set("file", new File([html], "template.html", { type: "text/html" }))
  const validateResponse = await fetch("/api/templates/validate", { method: "POST", body: validateBody })
  const validateData = await validateResponse.json()
  if (!validateResponse.ok) return { ok: false, message: validateData.message ?? "HTML 검증에 실패했습니다.", errors: validateData.errors }

  const saveBody = new FormData()
  saveBody.set("name", name)
  saveBody.set("file", new File([validateData.html], "template.html", { type: "text/html" }))
  const saveResponse = await fetch("/api/templates", { method: "POST", body: saveBody })
  const saveData = await saveResponse.json()
  if (!saveResponse.ok) return { ok: false, message: saveData.message ?? "템플릿 등록에 실패했습니다.", errors: saveData.errors }
  return { ok: true }
}
