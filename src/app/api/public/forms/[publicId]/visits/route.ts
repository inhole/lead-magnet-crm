import { NextResponse } from "next/server"

import { createServiceClient } from "@/lib/supabase/service"
import { validateUuid } from "@/lib/submissions/validation"

export async function POST(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ code: "NOT_CONFIGURED", message: "Supabase 서버 환경변수가 설정되지 않았습니다." }, { status: 503 })
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body || !validateUuid(body.visitorId) || !validateUuid(body.eventKey) || (body.linkToken != null && typeof body.linkToken !== "string")) return NextResponse.json({ code: "VALIDATION_ERROR", message: "방문 정보를 확인하세요." }, { status: 400 })
  const supabase = createServiceClient()
  const { publicId } = await params
  const { data, error } = await supabase.rpc("record_public_visit", { p_public_id: publicId, p_link_token: body.linkToken || null, p_visitor_id: body.visitorId, p_event_key: body.eventKey }).single()
  if (error?.code === "P0002") return NextResponse.json({ code: "NOT_FOUND", message: "공개 폼을 찾을 수 없습니다." }, { status: 404 })
  if (error?.code === "P0003") return NextResponse.json({ code: "INVALID_LINK", message: "유효하지 않은 배포 링크입니다." }, { status: 400 })
  if (error || !data) return NextResponse.json({ code: "DATABASE_ERROR", message: "방문을 기록하지 못했습니다." }, { status: 500 })
  return NextResponse.json({ visit: data }, { status: 201 })
}
