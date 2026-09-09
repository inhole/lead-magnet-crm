import { createClient } from "@supabase/supabase-js"
export const localUrl = process.env.SUPABASE_URL ?? process.env.API_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321"
export const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ""
export const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SERVICE_ROLE_KEY ?? ""
export const operator = { email: "operator-a@example.com", password: "Test-password-123!" }
export const otherOperator = { email: "operator-b@example.com", password: "Test-password-123!" }
export const ids = { template: "10000000-0000-4000-8000-000000000001", campaign: "20000000-0000-4000-8000-000000000001", form: "30000000-0000-4000-8000-000000000001", publicId: "e2e-public-form" }
const templateHtml = `<main><style>body{background:#f5f5f4}main{max-width:480px;margin:auto;padding:32px}form{display:grid;gap:16px}</style><h1 data-form-title>기존 제목</h1><p data-form-description>기존 설명</p><form><label for="email">이메일</label><input id="email" name="email" type="email" required><button data-form-submit type="submit">기존 버튼</button></form></main>`
export async function seedLocalDatabase() {
  if (!anonKey || !serviceKey) throw new Error("로컬 Supabase 키가 없습니다.")
  const admin = createClient(localUrl, serviceKey, { auth: { persistSession: false } }), listed = await admin.auth.admin.listUsers()
  for (const account of [operator, otherOperator]) if (!listed.data.users.some(user => user.email === account.email)) await admin.auth.admin.createUser({ ...account, email_confirm: true })
  const owner = (await admin.auth.admin.listUsers()).data.users.find(user => user.email === operator.email)!
  await admin.from("submissions").delete().eq("form_id", ids.form); await admin.from("visit_events").delete().eq("form_id", ids.form); await admin.from("distribution_links").delete().eq("form_id", ids.form); await admin.from("campaign_forms").delete().eq("id", ids.form); await admin.from("campaigns").delete().eq("id", ids.campaign); await admin.from("html_templates").delete().eq("id", ids.template)
  await admin.from("html_templates").insert({ id: ids.template, owner_id: owner.id, name: "E2E 신청 폼", storage_path: `${owner.id}/e2e.html`, input_schema: [{ name: "email", label: "이메일", type: "email", required: true }], default_title: "기존 제목", default_description: "기존 설명", default_submit_label: "기존 버튼" })
  const upload = await admin.storage.from("html-templates").upload(`${owner.id}/e2e.html`, new Blob([templateHtml], { type: "text/html" }), { contentType: "text/html", upsert: true }); if (upload.error) throw upload.error
  await admin.from("campaigns").insert({ id: ids.campaign, owner_id: owner.id, name: "E2E 캠페인", published_at: new Date().toISOString() }); await admin.from("campaign_forms").insert({ id: ids.form, campaign_id: ids.campaign, template_id: ids.template, public_id: ids.publicId, title: "자료 신청", description: "이메일을 입력하세요", submit_label: "자료 받기" })
  return { admin }
}
