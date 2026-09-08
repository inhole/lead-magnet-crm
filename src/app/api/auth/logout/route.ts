import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function POST() { if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) { const supabase = await createClient(); await supabase.auth.signOut(); } return NextResponse.json({ ok: true }); }