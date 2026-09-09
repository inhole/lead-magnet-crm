import { createClient } from "@supabase/supabase-js"
export const localUrl = process.env.SUPABASE_URL ?? process.env.API_URL ?? "http://127.0.0.1:54321"
export const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.ANON_KEY ?? ""
export const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SERVICE_ROLE_KEY ?? ""
export const operator = { email: "operator-a@example.com", password: "Test-password-123!" }
export const otherOperator = { email: "operator-b@example.com", password: "Test-password-123!" }
export const ids = { template: "10000000-0000-4000-8000-000000000001", campaign: "20000000-0000-4000-8000-000000000001", form: "30000000-0000-4000-8000-000000000001", publicId: "e2e-public-form" }
export async function seedLocalDatabase() {
  if (!anonKey || !serviceKey) throw new Error("로컬 Supabase 키가 없습니다.")
  const admin = createClient(localUrl, serviceKey, { auth: { persistSession: false } }), listed = await admin.auth.admin.listUsers()
  for (const account of [operator, otherOperator]) if (!listed.data.users.some(user => user.email === account.email)) await admin.auth.admin.createUser({ ...account, email_confirm: true })
  const owner = (await admin.auth.admin.listUsers()).data.users.find(user => user.email === operator.email)!
  await admin.from("submissions").delete().eq("form_id", ids.form); await admin.from("visit_events").delete().eq("form_id", ids.form); await admin.from("distribution_links").delete().eq("form_id", ids.form); await admin.from("campaign_forms").delete().eq("id", ids.form); await admin.from("campaigns").delete().eq("id", ids.campaign); await admin.from("html_templates").delete().eq("id", ids.template)
  await admin.from("html_templates").insert({ id: ids.template, owner_id: owner.id, name: "E2E 신청 폼", storage_path: `${owner.id}/e2e.html`, input_schema: [{ name: "email", label: "이메일", type: "email", required: true }] })
  await admin.from("campaigns").insert({ id: ids.campaign, owner_id: owner.id, name: "E2E 캠페인", published_at: new Date().toISOString() }); await admin.from("campaign_forms").insert({ id: ids.form, campaign_id: ids.campaign, template_id: ids.template, public_id: ids.publicId, title: "자료 신청", description: "이메일을 입력하세요", submit_label: "자료 받기" })
  return { admin }
}
