import { NextResponse } from "next/server"

import { buildTemplatePreview } from "@/lib/forms/render-template"
import { validateFormHtml } from "@/lib/forms/validate-html"
import { createClient } from "@/lib/supabase/server"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return NextResponse.json({ code: "NOT_CONFIGURED", message: "Supabase 환경변수가 설정되지 않았습니다." }, { status: 503 })
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ code: "UNAUTHENTICATED", message: "로그인이 필요합니다." }, { status: 401 })

  const { id } = await params
  const { data: template, error } = await supabase.from("html_templates").select("storage_path").eq("id", id).maybeSingle()
  if (error) return NextResponse.json({ code: "DATABASE_ERROR", message: "템플릿을 불러오지 못했습니다." }, { status: 500 })
  if (!template) return NextResponse.json({ code: "NOT_FOUND", message: "템플릿을 찾을 수 없습니다." }, { status: 404 })

  const { data: file, error: downloadError } = await supabase.storage.from("html-templates").download(template.storage_path)
  if (downloadError || !file) return NextResponse.json({ code: "STORAGE_ERROR", message: "HTML 파일을 불러오지 못했습니다." }, { status: 500 })
  const result = validateFormHtml(await file.text())
  if (!result.ok) return NextResponse.json({ code: "INVALID_HTML", message: "저장된 HTML이 작성 규칙을 통과하지 못했습니다." }, { status: 500 })
  return NextResponse.json({ preview: buildTemplatePreview(result.html) })
}
