import { NextResponse } from "next/server"

import { validateCampaignPublication } from "@/lib/campaigns/validation"
import { createClient } from "@/lib/supabase/server"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return NextResponse.json({ code: "NOT_CONFIGURED", message: "Supabase 환경변수가 설정되지 않았습니다." }, { status: 503 })
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ code: "UNAUTHENTICATED", message: "로그인이 필요합니다." }, { status: 401 })

  const { id } = await params
  const { data, error } = await supabase
    .from("campaigns")
    .select("id,name,created_at,published_at,campaign_forms(id,public_id,title,description,submit_label,template_id,html_templates(name,input_schema))")
    .eq("id", id)
    .maybeSingle()
  if (error) return NextResponse.json({ code: "DATABASE_ERROR", message: "캠페인을 불러오지 못했습니다." }, { status: 500 })
  if (!data) return NextResponse.json({ code: "NOT_FOUND", message: "캠페인을 찾을 수 없습니다." }, { status: 404 })
  return NextResponse.json({ campaign: { ...data, campaign_forms: data.campaign_forms ? [data.campaign_forms].flat() : [] } })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return NextResponse.json({ code: "NOT_CONFIGURED", message: "Supabase 환경변수가 설정되지 않았습니다." }, { status: 503 })
  }
  const publication = validateCampaignPublication(await request.json().catch(() => null))
  if (!publication.ok) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: "공개 상태를 확인하세요." }, { status: 400 })
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ code: "UNAUTHENTICATED", message: "로그인이 필요합니다." }, { status: 401 })

  const { id } = await params
  const publishedAt = publication.published ? new Date().toISOString() : null
  const { data, error } = await supabase.from("campaigns").update({ published_at: publishedAt }).eq("id", id).select("id,published_at").maybeSingle()
  if (error) return NextResponse.json({ code: "DATABASE_ERROR", message: "캠페인 공개 상태를 변경하지 못했습니다." }, { status: 500 })
  if (!data) return NextResponse.json({ code: "NOT_FOUND", message: "캠페인을 찾을 수 없습니다." }, { status: 404 })
  return NextResponse.json({ campaign: data })
}
