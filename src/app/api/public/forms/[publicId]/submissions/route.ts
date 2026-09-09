import { NextResponse } from "next/server"

import type { FormFieldSchema } from "@/lib/forms/types"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { validateSubmissionValues, validateUuid } from "@/lib/submissions/validation"

export async function POST(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ code: "NOT_CONFIGURED", message: "Supabase 서버 환경변수가 설정되지 않았습니다." }, { status: 503 })
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body || !validateUuid(body.visitId) || !validateUuid(body.idempotencyKey)) return NextResponse.json({ code: "VALIDATION_ERROR", message: "제출 정보를 확인하세요." }, { status: 400 })
  const supabase = await createClient()
  const { publicId } = await params
  const { data: form, error: formError } = await supabase.rpc("get_public_form", { p_public_id: publicId }).maybeSingle()
  if (formError) return NextResponse.json({ code: "DATABASE_ERROR", message: "공개 폼을 확인하지 못했습니다." }, { status: 500 })
  if (!form) return NextResponse.json({ code: "NOT_FOUND", message: "공개 폼을 찾을 수 없습니다." }, { status: 404 })
  const publicForm = form as { input_schema: FormFieldSchema[] }
  const validation = validateSubmissionValues(body.values, publicForm.input_schema)
  if (!validation.ok) return NextResponse.json({ code: "VALIDATION_ERROR", message: "입력값을 확인하세요.", fieldErrors: validation.fieldErrors }, { status: 400 })
  const { data, error } = await createServiceClient().rpc("create_public_submission", { p_public_id: publicId, p_visit_id: body.visitId, p_idempotency_key: body.idempotencyKey, p_values: validation.values }).single()
  if (error?.code === "P0002") return NextResponse.json({ code: "NOT_FOUND", message: "공개 폼을 찾을 수 없습니다." }, { status: 404 })
  if (error?.code === "P0003") return NextResponse.json({ code: "INVALID_VISIT", message: "유효하지 않은 방문 정보입니다." }, { status: 400 })
  if (error?.code === "P0004") return NextResponse.json({ code: "IDEMPOTENCY_CONFLICT", message: "같은 전송 키로 다른 신청을 보낼 수 없습니다." }, { status: 409 })
  if (error || !data) return NextResponse.json({ code: "DATABASE_ERROR", message: "신청을 저장하지 못했습니다." }, { status: 500 })
  const submission = data as { submission_id: string; created_at: string; replayed: boolean }
  return NextResponse.json({ submission }, { status: submission.replayed ? 200 : 201 })
}
