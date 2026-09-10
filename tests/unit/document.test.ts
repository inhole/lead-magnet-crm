import { describe, expect, it } from "vitest"

import { buildFormHtml, parseFormDocument, type FormDocument, type FormDocumentField } from "@/lib/forms/document"
import { validateFormHtml } from "@/lib/forms/validate-html"

function withoutId(field: FormDocumentField) {
  const rest: Partial<FormDocumentField> = { ...field }
  delete rest.id
  return rest
}

const doc: FormDocument = {
  title: "제목 <script>",
  description: "안내 문구",
  submitLabel: "신청하기",
  fields: [
    { id: "1", name: "email", label: "이메일", type: "email", required: true },
    { id: "2", name: "role", label: "직무", type: "select", required: true, options: [{ value: "marketing", label: "마케팅" }, { value: "sales", label: "영업" }] },
    { id: "3", name: "interest", label: "관심 분야", type: "radio", required: true, options: [{ value: "a", label: "옵션A" }, { value: "b", label: "옵션B" }] },
    { id: "4", name: "channels", label: "수신 채널", type: "checkbox", required: false, options: [{ value: "x", label: 'X"채널' }, { value: "y", label: "Y채널" }] },
  ],
}

describe("buildFormHtml", () => {
  it("생성한 HTML이 validateFormHtml을 통과한다", () => {
    const html = buildFormHtml(doc)
    const result = validateFormHtml(html)
    expect(result.ok).toBe(true)
  })

  it("텍스트를 안전하게 이스케이프한다", () => {
    const html = buildFormHtml(doc)
    expect(html).not.toContain("<script>")
    expect(html).toContain("&lt;script&gt;")
  })

  it("지원하지 않는 입력 타입을 거부한다", () => {
    const invalid: FormDocument = { ...doc, fields: [{ id: "x", name: "x", label: "x", type: "date" as never, required: false }] }
    expect(() => buildFormHtml(invalid)).toThrow()
  })
})

describe("parseFormDocument", () => {
  it("생성과 파싱의 왕복이 필드·문구를 보존한다", () => {
    const html = buildFormHtml(doc)
    const parsed = parseFormDocument(html)
    expect(parsed.title).toBe(doc.title)
    expect(parsed.description).toBe(doc.description)
    expect(parsed.submitLabel).toBe(doc.submitLabel)
    expect(parsed.fields.map(withoutId)).toEqual(doc.fields.map(withoutId))
  })
})
