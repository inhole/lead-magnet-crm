import { NextResponse } from "next/server"

import { publicFormPath, validateCampaignInput } from "@/lib/campaigns/validation"
import { createClient } from "@/lib/supabase/server"

function notConfigured() {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
}

export async function GET() {
  if (notConfigured()) return NextResponse.json({ code: "NOT_CONFIGURED", message: "Supabase 환경변수가 설정되지 않았습니다." }, { status: 503 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ code: "UNAUTHENTICATED", message: "로그인이 필요합니다." }, { status: 401 })

  const { data, error } = await supabase
    .from("campaigns")
    .select("id,name,created_at,published_at,campaign_forms(id,public_id,title,description,submit_label,template_id)")
    .order("created_at", { ascending: false })
  if (error) return NextResponse.json({ code: "DATABASE_ERROR", message: "캠페인 목록을 불러오지 못했습니다." }, { status: 500 })
  const campaigns = (data ?? []).map((campaign) => ({
    ...campaign,
    campaign_forms: campaign.campaign_forms ? [campaign.campaign_forms].flat() : [],
  }))
  return NextResponse.json({ campaigns })
}

export async function POST(request: Request) {
  if (notConfigured()) return NextResponse.json({ code: "NOT_CONFIGURED", message: "Supabase 환경변수가 설정되지 않았습니다." }, { status: 503 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ code: "UNAUTHENTICATED", message: "로그인이 필요합니다." }, { status: 401 })

  const result = validateCampaignInput(await request.json().catch(() => null))
  if (!result.ok) return NextResponse.json({ code: "VALIDATION_ERROR", message: "입력값을 확인하세요.", fieldErrors: result.fieldErrors }, { status: 400 })

  const publicId = crypto.randomUUID().replaceAll("-", "")
  const { data, error } = await supabase.rpc("create_campaign_with_form", {
    p_name: result.value.name,
    p_template_id: result.value.templateId,
    p_public_id: publicId,
    p_title: result.value.title,
    p_description: result.value.description,
    p_submit_label: result.value.submitLabel,
  }).single()

  if (error?.code === "P0002") return NextResponse.json({ code: "TEMPLATE_NOT_FOUND", message: "선택한 템플릿을 찾을 수 없습니다." }, { status: 404 })
  if (error || !data) return NextResponse.json({ code: "DATABASE_ERROR", message: "캠페인을 저장하지 못했습니다." }, { status: 500 })
  return NextResponse.json({ campaign: { ...data, publicPath: publicFormPath(publicId) } }, { status: 201 })
}
