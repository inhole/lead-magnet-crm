import { NextResponse } from "next/server"

import { buildInteractiveTemplate } from "@/lib/forms/render-template"
import { validateFormHtml } from "@/lib/forms/validate-html"
import { createServiceClient } from "@/lib/supabase/service"
import { createClient } from "@/lib/supabase/server"

export async function GET(_request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ code: "NOT_CONFIGURED", message: "Supabase 환경변수가 설정되지 않았습니다." }, { status: 503 })
  }
  const supabase = await createClient()
  const { publicId } = await params
  const { data: rawData, error } = await supabase.rpc("get_public_form", { p_public_id: publicId }).maybeSingle()
  if (error) return NextResponse.json({ code: "DATABASE_ERROR", message: "공개 폼을 불러오지 못했습니다." }, { status: 500 })
  if (!rawData) return NextResponse.json({ code: "NOT_FOUND", message: "공개 폼을 찾을 수 없습니다." }, { status: 404 })
  const data = rawData as { title: string; description: string; submit_label: string; input_schema: unknown }

  const service = createServiceClient()
  const { data: formRecord, error: formError } = await service
    .from("campaign_forms")
    .select("template_id")
    .eq("public_id", publicId)
    .maybeSingle()
  if (formError || !formRecord) return NextResponse.json({ code: "DATABASE_ERROR", message: "폼 템플릿을 확인하지 못했습니다." }, { status: 500 })
  const { data: template, error: templateError } = await service
    .from("html_templates")
    .select("storage_path")
    .eq("id", formRecord.template_id)
    .maybeSingle()
  if (templateError || !template) return NextResponse.json({ code: "DATABASE_ERROR", message: "폼 템플릿을 확인하지 못했습니다." }, { status: 500 })
  const { data: file, error: downloadError } = await service.storage.from("html-templates").download(template.storage_path)
  if (downloadError || !file) return NextResponse.json({ code: "STORAGE_ERROR", message: "폼 HTML을 불러오지 못했습니다." }, { status: 500 })
  const validation = validateFormHtml(await file.text())
  if (!validation.ok) return NextResponse.json({ code: "INVALID_HTML", message: "저장된 폼 HTML이 유효하지 않습니다." }, { status: 500 })

  const bridgeToken = crypto.randomUUID()
  const html = buildInteractiveTemplate(validation.html, {
    title: data.title,
    description: data.description,
    submitLabel: data.submit_label,
  }, bridgeToken)
  return NextResponse.json({ form: { ...data, html, bridge_token: bridgeToken } })
}
