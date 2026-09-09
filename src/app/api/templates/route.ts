import { NextResponse } from "next/server"

import { extractFormCopy } from "@/lib/forms/render-template"
import { validateFormHtml } from "@/lib/forms/validate-html"
import { createClient } from "@/lib/supabase/server"

function notConfigured() {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
}

export async function GET() {
  if (notConfigured()) return NextResponse.json({ code: "NOT_CONFIGURED", message: "Supabase 환경변수가 설정되지 않았습니다." }, { status: 503 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ code: "UNAUTHENTICATED", message: "로그인이 필요합니다." }, { status: 401 })
  const { data, error } = await supabase.from("html_templates").select("id,name,input_schema,created_at,default_title,default_description,default_submit_label").order("created_at", { ascending: false })
  if (error) return NextResponse.json({ code: "DATABASE_ERROR", message: "템플릿 목록을 불러오지 못했습니다." }, { status: 500 })
  return NextResponse.json({ templates: data })
}

export async function POST(request: Request) {
  if (notConfigured()) return NextResponse.json({ code: "NOT_CONFIGURED", message: "Supabase 환경변수가 설정되지 않았습니다." }, { status: 503 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ code: "UNAUTHENTICATED", message: "로그인이 필요합니다." }, { status: 401 })

  const formData = await request.formData().catch(() => null)
  const file = formData?.get("file")
  const name = formData?.get("name")
  if (!(file instanceof File) || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: "이름과 HTML 파일을 입력하세요." }, { status: 400 })
  }
  if (name.trim().length > 120) return NextResponse.json({ code: "VALIDATION_ERROR", message: "템플릿 이름은 120자 이하여야 합니다." }, { status: 400 })
  if (file.size > 256 * 1024) return NextResponse.json({ code: "HTML_TOO_LARGE", message: "HTML 파일은 256KB 이하여야 합니다." }, { status: 413 })

  const result = validateFormHtml(await file.text())
  if (!result.ok) return NextResponse.json({ code: "INVALID_HTML", message: "HTML 작성 규칙을 확인하세요.", errors: result.errors }, { status: 400 })

  const templateId = crypto.randomUUID()
  const storagePath = `${user.id}/${templateId}.html`
  const { error: uploadError } = await supabase.storage.from("html-templates").upload(storagePath, result.html, { contentType: "text/html", upsert: false })
  if (uploadError) return NextResponse.json({ code: "STORAGE_ERROR", message: "HTML 파일을 저장하지 못했습니다." }, { status: 500 })

  const copy = extractFormCopy(result.html)
  const { data, error: insertError } = await supabase.from("html_templates").insert({
    id: templateId,
    owner_id: user.id,
    name: name.trim(),
    storage_path: storagePath,
    input_schema: result.fields,
    default_title: copy.title,
    default_description: copy.description,
    default_submit_label: copy.submitLabel,
  }).select("id,name,input_schema,created_at,default_title,default_description,default_submit_label").single()
  if (insertError) {
    await supabase.storage.from("html-templates").remove([storagePath])
    return NextResponse.json({ code: "DATABASE_ERROR", message: "템플릿 정보를 저장하지 못했습니다." }, { status: 500 })
  }
  return NextResponse.json({ template: data }, { status: 201 })
}
