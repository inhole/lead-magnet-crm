import { describe, expect, it } from "vitest"

import { buildInteractiveTemplate, buildTemplatePreview, customizeFormHtml, extractFormCopy } from "@/lib/forms/render-template"

const html = `<main><h1 data-form-title>기존 제목</h1><p data-form-description>기존 설명</p><form><label for="email">이메일</label><input id="email" name="email" type="email"><button type="submit" data-form-submit>기존 버튼</button></form></main>`
const copy = { title: "새 <제목>", description: "새 안내", submitLabel: "자료 받기" }

describe("HTML 템플릿 렌더링", () => {
  it("업로드 HTML의 기본 문구를 추출한다", () => {
    expect(extractFormCopy(html)).toEqual({ title: "기존 제목", description: "기존 설명", submitLabel: "기존 버튼" })
  })

  it("마커가 없으면 빈 문자열로 처리한다", () => {
    const withoutMarkers = `<main><form><label for="email">이메일</label><input id="email" name="email" type="email"></form></main>`
    expect(extractFormCopy(withoutMarkers)).toEqual({ title: "", description: "", submitLabel: "" })
  })

  it("마커의 문구를 텍스트로 안전하게 교체한다", () => {
    const result = customizeFormHtml(html, copy)
    expect(result).toContain("새 &lt;제목&gt;")
    expect(result).toContain("새 안내")
    expect(result).toContain("자료 받기")
    expect(result).not.toContain("기존 제목")
  })

  it("관리자 미리보기에는 스크립트 권한을 부여하지 않는다", () => {
    const result = buildTemplatePreview(html, copy)
    expect(result).toContain("default-src 'none'")
    expect(result).not.toContain("script-src")
  })

  it("공개 폼에는 재검증된 HTML과 시스템 제출 브리지만 실행하도록 제한한다", () => {
    const result = buildInteractiveTemplate(html, copy, "bridge-token")
    expect(result).toContain("script-src 'unsafe-inline'")
    expect(result).toContain('channel:"lead-magnet-form"')
    expect(result).toContain('const token="bridge-token"')
    expect(result).toContain('type:"resize"')
    expect(result).toContain("ResizeObserver")
  })
})
