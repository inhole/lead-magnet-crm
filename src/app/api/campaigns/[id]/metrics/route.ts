import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return NextResponse.json({ code: "NOT_CONFIGURED", message: "Supabase 환경변수가 설정되지 않았습니다." }, { status: 503 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ code: "UNAUTHENTICATED", message: "로그인이 필요합니다." }, { status: 401 })
  const { id } = await params
  const { data, error } = await supabase.rpc("get_campaign_metrics", { p_campaign_id: id })
  if (error?.code === "P0002") return NextResponse.json({ code: "NOT_FOUND", message: "캠페인을 찾을 수 없습니다." }, { status: 404 })
  if (error) return NextResponse.json({ code: "DATABASE_ERROR", message: "성과를 불러오지 못했습니다." }, { status: 500 })
  return NextResponse.json({ metrics: data })
}
