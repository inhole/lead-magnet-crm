import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function GET(_request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return NextResponse.json({ code: "NOT_CONFIGURED", message: "Supabase 환경변수가 설정되지 않았습니다." }, { status: 503 })
  }
  const supabase = await createClient()
  const { publicId } = await params
  const { data, error } = await supabase.rpc("get_public_form", { p_public_id: publicId }).maybeSingle()
  if (error) return NextResponse.json({ code: "DATABASE_ERROR", message: "공개 폼을 불러오지 못했습니다." }, { status: 500 })
  if (!data) return NextResponse.json({ code: "NOT_FOUND", message: "공개 폼을 찾을 수 없습니다." }, { status: 404 })
  return NextResponse.json({ form: data })
}
