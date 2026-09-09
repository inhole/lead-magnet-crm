import { createClient } from "@supabase/supabase-js"
import { defaultTreeAdapter, parse } from "parse5"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.")
  process.exit(1)
}

function children(node) {
  if (defaultTreeAdapter.isElementNode(node)) return node.childNodes
  if (node.nodeName === "#document" || node.nodeName === "#document-fragment") return node.childNodes
  return []
}

function textContent(node) {
  if (defaultTreeAdapter.isTextNode(node)) return node.value
  return children(node).map(textContent).join(" ").replace(/\s+/g, " ").trim()
}

function hasAttribute(element, name) {
  return element.attrs.some((attribute) => attribute.name.toLowerCase() === name)
}

function walk(node, visit) {
  if (defaultTreeAdapter.isElementNode(node)) visit(node)
  children(node).forEach((child) => walk(child, visit))
}

function extractFormCopy(html) {
  const document = parse(html)
  const copy = { title: "", description: "", submitLabel: "" }
  walk(document, (element) => {
    if (hasAttribute(element, "data-form-title")) copy.title = textContent(element)
    if (hasAttribute(element, "data-form-description")) copy.description = textContent(element)
    if (hasAttribute(element, "data-form-submit")) copy.submitLabel = textContent(element)
  })
  return copy
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

const { data: templates, error } = await admin
  .from("html_templates")
  .select("id,storage_path,default_title,default_description,default_submit_label")
if (error) {
  console.error("템플릿 목록을 불러오지 못했습니다.", error.message)
  process.exit(1)
}

const targets = templates.filter((template) => !template.default_title && !template.default_description && !template.default_submit_label)
console.log(`전체 ${templates.length}건 중 백필 대상 ${targets.length}건`)

let updated = 0
for (const template of targets) {
  const { data: file, error: downloadError } = await admin.storage.from("html-templates").download(template.storage_path)
  if (downloadError || !file) {
    console.error(`${template.id}: HTML을 내려받지 못했습니다.`, downloadError?.message)
    continue
  }
  const copy = extractFormCopy(await file.text())
  const { error: updateError } = await admin
    .from("html_templates")
    .update({ default_title: copy.title, default_description: copy.description, default_submit_label: copy.submitLabel })
    .eq("id", template.id)
  if (updateError) {
    console.error(`${template.id}: 업데이트하지 못했습니다.`, updateError.message)
    continue
  }
  updated += 1
  console.log(`${template.id}: 문구를 채웠습니다.`)
}
console.log(`완료: ${updated}/${targets.length}건 갱신`)
