import { describe, expect, it } from "vitest"

import { HTML_TEMPLATE_AI_PROMPT } from "@/lib/forms/ai-prompt"

describe("HTML_TEMPLATE_AI_PROMPT", () => {
  it("실제 검증기가 허용하는 입력 타입만 안내한다", () => {
    expect(HTML_TEMPLATE_AI_PROMPT).toContain("text, email, tel, number, checkbox, radio")
    expect(HTML_TEMPLATE_AI_PROMPT).toContain("textarea와 select도 사용할 수 있다")
    expect(HTML_TEMPLATE_AI_PROMPT).not.toMatch(/지원 입력 타입[^\n]*\bdate\b/)
  })

  it("AI가 미지원 요소 대신 허용 요소를 사용하도록 안내한다", () => {
    expect(HTML_TEMPLATE_AI_PROMPT).toContain("meta, fieldset, legend 요소는 사용하지 않는다")
    expect(HTML_TEMPLATE_AI_PROMPT).toContain("div와 label을 사용한다")
  })
})
