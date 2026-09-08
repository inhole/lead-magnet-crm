import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  if (!body?.email || !body.password) return NextResponse.json({ code: "VALIDATION_ERROR", message: "이메일과 비밀번호를 입력하세요." }, { status: 400 });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return NextResponse.json({ code: "NOT_CONFIGURED", message: "Supabase 환경변수가 설정되지 않았습니다." }, { status: 503 });
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: body.email, password: body.password });
  if (error) return NextResponse.json({ code: "INVALID_CREDENTIALS", message: "이메일 또는 비밀번호를 확인하세요." }, { status: 401 });
  return NextResponse.json({ ok: true });
}