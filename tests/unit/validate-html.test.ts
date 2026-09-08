import { describe, expect, it } from "vitest"

import { buildSandboxPreview, validateFormHtml } from "@/lib/forms/validate-html"

const validHtml = `
  <main>
    <h1 data-form-title>자료 받기</h1>
    <p data-form-description>이메일로 보내드려요.</p>
    <form>
      <label for="email">이메일</label>
      <input id="email" name="email" type="email" required>
      <label><input name="interest" type="radio" value="sales"> 영업</label>
      <label><input name="interest" type="radio" value="marketing"> 마케팅</label>
      <button type="submit" data-form-submit>신청하기</button>
    </form>
  </main>`

describe("validateFormHtml", () => {
  it("정상 HTML에서 입력 스키마를 추출한다", () => {
    const result = validateFormHtml(validHtml)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.fields).toEqual([
      { name: "email", label: "이메일", type: "email", required: true },
      { name: "interest", label: "영업", type: "radio", required: false, options: ["sales", "marketing"] },
    ])
  })

  it.each([
    ["script", validHtml.replace("</main>", "<script>alert(1)</script></main>"), "FORBIDDEN_TAG"],
    ["event handler", validHtml.replace("<form>", "<form onsubmit=\"steal()\">"), "EVENT_HANDLER"],
    ["external CSS", validHtml.replace("</main>", "<style>body{background:url(https://evil.test/x)}</style></main>"), "DANGEROUS_CSS"],
    ["form action", validHtml.replace("<form>", "<form action=\"https://evil.test\">"), "FORBIDDEN_ATTRIBUTE"],
  ])("%s 공격성 HTML을 거부한다", (_case, html, code) => {
    const result = validateFormHtml(html)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.some((error) => error.code === code)).toBe(true)
  })

  it("form이 두 개면 거부한다", () => {
    const result = validateFormHtml(validHtml.replace("</main>", "<form><input name=\"extra\"></form></main>"))
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.some((error) => error.code === "FORM_COUNT")).toBe(true)
  })

  it("라디오 외 중복 name을 거부한다", () => {
    const result = validateFormHtml(validHtml.replace("</form>", "<input name=\"email\"></form>"))
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.some((error) => error.code === "DUPLICATE_NAME")).toBe(true)
  })

  it("미리보기 문서에 외부 실행을 막는 CSP를 넣는다", () => {
    const preview = buildSandboxPreview("<p>preview</p>")
    expect(preview).toContain("default-src 'none'")
    expect(preview).toContain("form-action 'none'")
  })
})
