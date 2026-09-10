import { expect, test } from "@playwright/test"
import { ids, operator } from "../helpers/local-supabase"
test("공개 신청이 전체·캠페인 성과와 CRM에 반영된다", async ({ page }) => { await page.goto(`/f/${ids.publicId}`); const iframe = page.locator('iframe[title="자료 신청"]'); const form = page.frameLocator('iframe[title="자료 신청"]'); await expect(iframe).toHaveAttribute("sandbox", "allow-scripts allow-forms"); await expect(form.locator("html")).toHaveAttribute("data-form-bridge", "ready"); await expect.poll(() => iframe.evaluate((element) => element.clientHeight)).toBeLessThan(720); await expect(form.getByRole("heading", { name: "자료 신청" })).toBeVisible(); await form.getByLabel("이메일").fill("e2e@example.com"); await form.getByRole("button", { name: "자료 받기" }).click(); await expect(page.getByText("신청이 완료되었습니다")).toBeVisible(); await page.goto("/login"); await page.getByLabel("이메일").fill(operator.email); await page.getByLabel("비밀번호").fill(operator.password); await page.getByRole("button", { name: "로그인" }).click(); await expect(page).toHaveURL("/"); await expect(page.locator("time").first()).toContainText(":"); await page.getByRole("link", { name: "성과" }).click(); await expect(page).toHaveURL("/performance"); await expect(page.getByRole("heading", { name: "전체 성과" })).toBeVisible(); await expect(page.getByLabel(/전체 신청 [1-9]\d*/)).toBeVisible(); await page.goto(`/campaigns/${ids.campaign}`); await expect(page.getByRole("heading", { name: "성과 요약" })).toBeVisible(); const publicFormPagePromise = page.waitForEvent("popup"); await page.getByRole("link", { name: "직접 유입 폼 열기" }).click(); const publicFormPage = await publicFormPagePromise; await expect(publicFormPage).toHaveURL(new RegExp(`/f/${ids.publicId}$`)); await publicFormPage.close(); await expect(page.getByRole("button", { name: "링크 복사" })).toHaveCount(4); await expect(page.getByRole("button", { name: "4개 채널 링크 다시 만들기" })).toHaveCount(0); await expect(page.getByRole("button", { name: "직접 유입 URL 복사" })).toBeVisible(); await page.getByRole("button", { name: "입력값 보기" }).first().click(); const dialog = page.getByRole("dialog"); await expect(dialog.getByText("이메일", { exact: true })).toBeVisible(); await expect(dialog.getByText("필드명: email")).toBeVisible(); await expect(dialog.getByText("e2e@example.com")).toBeVisible(); await expect(dialog).toHaveClass(/sm:max-w-2xl/); await expect(dialog).toHaveCSS("background-color", "rgb(255, 255, 255)") })

test("템플릿 목록·상세와 캠페인 커스텀 미리보기를 제공한다", async ({ page }) => { await page.goto("/login"); await page.getByLabel("이메일").fill(operator.email); await page.getByLabel("비밀번호").fill(operator.password); await page.getByRole("button", { name: "로그인" }).click(); await page.getByRole("link", { name: "템플릿", exact: true }).click(); await expect(page).toHaveURL("/templates"); await page.getByRole("link", { name: "E2E 신청 폼" }).click(); await expect(page).toHaveURL(`/templates/${ids.template}`); await expect(page.getByText("기존 제목", { exact: true })).toBeVisible(); await expect(page.getByText("기존 설명", { exact: true })).toBeVisible(); await expect(page.frameLocator('iframe[title="E2E 신청 폼 미리보기"]').getByRole("heading", { name: "기존 제목" })).toBeVisible(); await page.goto("/campaigns/new"); await page.getByRole("combobox", { name: "HTML 템플릿" }).click(); await page.getByRole("option", { name: "E2E 신청 폼" }).click(); await expect(page.getByRole("combobox", { name: "HTML 템플릿" })).toContainText("E2E 신청 폼"); await expect(page.getByLabel("공개 폼 제목")).toHaveValue("기존 제목"); await expect(page.getByLabel("안내 문구")).toHaveValue("기존 설명"); await expect(page.getByLabel("제출 버튼 문구")).toHaveValue("기존 버튼"); await page.getByLabel("공개 폼 제목").fill("커스텀 제목"); await expect(page.frameLocator('iframe[title="커스텀 신청 폼 미리보기"]').getByRole("heading", { name: "커스텀 제목" })).toBeVisible() })

test("캠페인 공개와 미공개 상태를 전환한다", async ({ page }) => { await page.goto("/login"); await page.getByLabel("이메일").fill(operator.email); await page.getByLabel("비밀번호").fill(operator.password); await page.getByRole("button", { name: "로그인" }).click(); await expect(page).toHaveURL("/"); await page.goto(`/campaigns/${ids.campaign}`); await page.getByRole("button", { name: "비공개로 전환" }).click(); await expect(page.getByText("현재 미공개 캠페인입니다")).toBeVisible(); await expect(page.getByRole("link", { name: "직접 유입 폼 열기" })).toHaveCount(0); await page.getByRole("button", { name: "캠페인 공개하기" }).click(); await expect(page.getByRole("link", { name: "직접 유입 폼 열기" })).toBeVisible() })

test("관리자 GNB에서 로그아웃한다", async ({ page }) => { await page.goto("/login"); await page.getByLabel("이메일").fill(operator.email); await page.getByLabel("비밀번호").fill(operator.password); await page.getByRole("button", { name: "로그인" }).click(); await page.getByRole("button", { name: "로그아웃" }).click(); await expect(page).toHaveURL("/login") })
test("격리 미리보기는 원본 문구를 표시하고 상위 DOM에 접근하지 못한다", async ({ page }) => { await page.goto("/login"); await page.getByLabel("이메일").fill(operator.email); await page.getByLabel("비밀번호").fill(operator.password); await page.getByRole("button", { name: "로그인" }).click(); await expect(page).toHaveURL("/"); await page.goto("/templates/new"); await page.getByRole("tab", { name: "파일 업로드" }).click(); await page.getByLabel("템플릿 이름").fill("격리 확인"); await page.getByLabel("HTML 파일").setInputFiles({ name: "isolation.html", mimeType: "text/html", buffer: Buffer.from('<main><h1 data-form-title>자료 신청</h1><p data-form-description>이메일을 입력하세요.</p><form><label for="email">이메일</label><input id="email" name="email" type="email" required><button data-form-submit type="submit">보내기</button></form></main>') }); const frame = page.frameLocator('iframe[title="등록할 HTML 템플릿 미리보기"]'); await expect(page.getByLabel("미리보기 제목")).toHaveCount(0); await expect(frame.getByRole("heading", { name: "자료 신청" })).toBeVisible(); await expect(frame.getByRole("button", { name: "보내기" })).toBeVisible(); expect(await frame.locator("body").evaluate(() => { try { void window.parent.document.body; return false } catch { return true } })).toBe(true) })

test("라디오·체크박스 그룹 제목과 셀렉트 선택지 라벨이 신청 상세에 표시된다", async ({ page }, testInfo) => {
  const suffix = testInfo.project.name
  const templateName = `그룹 필드 템플릿 ${suffix}`
  const formTitle = `그룹 필드 신청 ${suffix}`

  await page.goto("/login")
  await page.getByLabel("이메일").fill(operator.email)
  await page.getByLabel("비밀번호").fill(operator.password)
  await page.getByRole("button", { name: "로그인" }).click()
  await expect(page).toHaveURL("/")

  const html = `<main><h1 data-form-title>${formTitle}</h1><p data-form-description>안내</p><form>
    <label for="email">이메일</label><input id="email" name="email" type="email" required>
    <label for="role">직무</label><select id="role" name="role" required><option value="marketing">마케팅</option><option value="sales">영업</option></select>
    <div data-form-group-label="관심 분야"><label><input name="interest" type="radio" value="report" required> 리포트</label><label><input name="interest" type="radio" value="webinar"> 웨비나</label></div>
    <div data-form-group-label="수신 채널"><label><input name="channels" type="checkbox" value="newsletter"> 뉴스레터</label><label><input name="channels" type="checkbox" value="sms"> 문자</label></div>
    <button data-form-submit type="submit">신청하기</button>
  </form></main>`
  await page.goto("/templates/new")
  await page.getByRole("tab", { name: "파일 업로드" }).click()
  await page.getByLabel("템플릿 이름").fill(templateName)
  await page.getByLabel("HTML 파일").setInputFiles({ name: "group-fields.html", mimeType: "text/html", buffer: Buffer.from(html) })
  await expect(page.getByText("검증을 통과했습니다")).toBeVisible()
  await page.getByRole("button", { name: "템플릿 등록" }).click()
  await expect(page.getByText("템플릿을 등록했습니다")).toBeVisible()

  await page.goto("/campaigns/new")
  await page.getByRole("combobox", { name: "HTML 템플릿" }).click()
  await page.getByRole("option", { name: templateName, exact: true }).click()
  await expect(page.getByLabel("공개 폼 제목")).toHaveValue(formTitle)
  await page.getByLabel("캠페인 이름").fill(`그룹 필드 캠페인 ${suffix}`)
  await page.getByRole("button", { name: "캠페인 만들기" }).click()
  await expect(page).toHaveURL(/\/campaigns\/[0-9a-f-]+$/)
  await page.getByRole("button", { name: "캠페인 공개하기" }).click()
  await expect(page.getByRole("link", { name: "직접 유입 폼 열기" })).toBeVisible()

  const publicFormPagePromise = page.waitForEvent("popup")
  await page.getByRole("link", { name: "직접 유입 폼 열기" }).click()
  const publicFormPage = await publicFormPagePromise
  const form = publicFormPage.frameLocator(`iframe[title="${formTitle}"]`)
  await expect(form.getByRole("heading", { name: formTitle })).toBeVisible()
  await form.getByLabel("이메일").fill("group-fields@example.com")
  await form.getByLabel("직무").selectOption("marketing")
  await form.getByLabel("리포트").check()
  await form.getByLabel("문자").check()
  await form.getByRole("button", { name: "신청하기" }).click()
  await expect(publicFormPage.getByText("신청이 완료되었습니다")).toBeVisible()
  await publicFormPage.close()

  await page.reload()
  await page.getByRole("button", { name: "입력값 보기" }).first().click()
  const dialog = page.getByRole("dialog")
  await expect(dialog.getByText("직무", { exact: true })).toBeVisible()
  await expect(dialog.getByText("마케팅", { exact: true })).toBeVisible()
  await expect(dialog.getByText("관심 분야", { exact: true })).toBeVisible()
  await expect(dialog.getByText("리포트", { exact: true })).toBeVisible()
  await expect(dialog.getByText("수신 채널", { exact: true })).toBeVisible()
  await expect(dialog.getByText("문자", { exact: true })).toBeVisible()
})

test("템플릿 선택 시 문구가 즉시 채워지고 직접 고친 문구는 다른 템플릿을 선택해도 유지된다", async ({ page }, testInfo) => {
  const suffix = testInfo.project.name
  const secondTemplateName = `두 번째 템플릿 ${suffix}`

  await page.goto("/login")
  await page.getByLabel("이메일").fill(operator.email)
  await page.getByLabel("비밀번호").fill(operator.password)
  await page.getByRole("button", { name: "로그인" }).click()
  await expect(page).toHaveURL("/")

  const html = `<main><h1 data-form-title>두 번째 제목</h1><p data-form-description>두 번째 설명</p><form><label for="email">이메일</label><input id="email" name="email" type="email" required><button data-form-submit type="submit">두 번째 버튼</button></form></main>`
  await page.goto("/templates/new")
  await page.getByRole("tab", { name: "파일 업로드" }).click()
  await page.getByLabel("템플릿 이름").fill(secondTemplateName)
  await page.getByLabel("HTML 파일").setInputFiles({ name: "second-template.html", mimeType: "text/html", buffer: Buffer.from(html) })
  await expect(page.getByText("검증을 통과했습니다")).toBeVisible()
  await expect(page.getByText("제목: 두 번째 제목")).toBeVisible()
  await page.getByRole("button", { name: "템플릿 등록" }).click()
  await expect(page.getByText("템플릿을 등록했습니다")).toBeVisible()

  await page.goto("/campaigns/new")
  await page.getByRole("combobox", { name: "HTML 템플릿" }).click()
  await page.getByRole("option", { name: "E2E 신청 폼", exact: true }).click()
  await expect(page.getByLabel("공개 폼 제목")).toHaveValue("기존 제목")
  await expect(page.getByLabel("안내 문구")).toHaveValue("기존 설명")

  await page.getByLabel("공개 폼 제목").fill("직접 고친 제목")
  await page.getByRole("combobox", { name: "HTML 템플릿" }).click()
  await page.getByRole("option", { name: secondTemplateName, exact: true }).click()
  await expect(page.getByLabel("공개 폼 제목")).toHaveValue("직접 고친 제목")
  await expect(page.getByLabel("안내 문구")).toHaveValue("두 번째 설명")
  await expect(page.getByLabel("제출 버튼 문구")).toHaveValue("두 번째 버튼")
})

test("구조 편집기만으로 템플릿을 만들어 등록하고 공개 폼 신청까지 완료한다", async ({ page }, testInfo) => {
  const suffix = testInfo.project.name
  const templateName = `구조 편집기 템플릿 ${suffix}`
  const formTitle = `구조 편집기 신청 ${suffix}`

  await page.goto("/login")
  await page.getByLabel("이메일").fill(operator.email)
  await page.getByLabel("비밀번호").fill(operator.password)
  await page.getByRole("button", { name: "로그인" }).click()
  await expect(page).toHaveURL("/")

  await page.goto("/templates/new")
  await page.getByRole("tab", { name: "구조로 만들기" }).click()
  await page.getByLabel("템플릿 이름").fill(templateName)

  await page.getByRole("button", { name: "입력 항목 추가" }).click()
  const firstField = page.getByText("입력 항목 1").locator("../..")
  await firstField.getByLabel("라벨").fill("이메일")
  await firstField.getByLabel("name").fill("email")

  const editorFrame = page.frameLocator('iframe[title="구조 편집기 미리보기"]')
  await editorFrame.locator("[data-form-title]").click()
  await page.keyboard.type(formTitle)
  await editorFrame.locator("[data-form-description]").click()
  await page.keyboard.type("구조 편집기로 만든 안내 문구")
  await editorFrame.locator("[data-form-submit]").click()
  await page.keyboard.press("Control+a")
  await page.keyboard.press("Delete")
  await page.keyboard.type("신청 보내기")

  await expect(editorFrame.getByRole("heading", { name: formTitle })).toBeVisible()

  await page.getByRole("button", { name: "템플릿 등록" }).click()
  await expect(page).toHaveURL("/templates")
  await expect(page.getByRole("link", { name: templateName })).toBeVisible()

  await page.goto("/campaigns/new")
  await page.getByRole("combobox", { name: "HTML 템플릿" }).click()
  await page.getByRole("option", { name: templateName, exact: true }).click()
  await expect(page.getByLabel("공개 폼 제목")).toHaveValue(formTitle)
  await page.getByLabel("캠페인 이름").fill(`구조 편집기 캠페인 ${suffix}`)
  await page.getByRole("button", { name: "캠페인 만들기" }).click()
  await expect(page).toHaveURL(/\/campaigns\/[0-9a-f-]+$/)
  await page.getByRole("button", { name: "캠페인 공개하기" }).click()
  await expect(page.getByRole("link", { name: "직접 유입 폼 열기" })).toBeVisible()

  const publicFormPagePromise = page.waitForEvent("popup")
  await page.getByRole("link", { name: "직접 유입 폼 열기" }).click()
  const publicFormPage = await publicFormPagePromise
  const publicForm = publicFormPage.frameLocator(`iframe[title="${formTitle}"]`)
  await expect(publicForm.getByRole("heading", { name: formTitle })).toBeVisible()
  await publicForm.getByLabel("이메일").fill("document-editor@example.com")
  await publicForm.getByRole("button", { name: "신청 보내기" }).click()
  await expect(publicFormPage.getByText("신청이 완료되었습니다")).toBeVisible()
  await publicFormPage.close()

  await page.reload()
  await page.getByRole("button", { name: "입력값 보기" }).first().click()
  const dialog = page.getByRole("dialog")
  await expect(dialog.getByText("document-editor@example.com")).toBeVisible()
})

test("에디터 미리보기 iframe은 동일 출처 권한 없이 토큰이 맞는 브리지 메시지만 반영한다", async ({ page }) => {
  await page.goto("/login")
  await page.getByLabel("이메일").fill(operator.email)
  await page.getByLabel("비밀번호").fill(operator.password)
  await page.getByRole("button", { name: "로그인" }).click()
  await expect(page).toHaveURL("/")

  await page.goto("/templates/new")
  await page.getByRole("tab", { name: "구조로 만들기" }).click()
  await page.getByRole("button", { name: "입력 항목 추가" }).click()
  const firstField = page.getByText("입력 항목 1").locator("../..")
  await firstField.getByLabel("라벨").fill("이메일")
  await firstField.getByLabel("name").fill("email")

  const iframe = page.locator('iframe[title="구조 편집기 미리보기"]')
  await expect(iframe).toHaveAttribute("sandbox", "allow-scripts")

  const isCrossOrigin = await iframe.evaluate((element) => {
    const frame = element as HTMLIFrameElement
    return frame.contentDocument === null
  })
  expect(isCrossOrigin).toBe(true)

  const editorFrame = page.frameLocator('iframe[title="구조 편집기 미리보기"]')
  await expect(editorFrame.locator("[data-form-title]")).toHaveText("")
  await iframe.evaluate((element) => {
    const frame = element as HTMLIFrameElement
    frame.contentWindow?.postMessage({ channel: "lead-magnet-editor", token: "wrong-token", type: "copy", field: "title", value: "위조된 제목" }, "*")
  })
  await page.waitForTimeout(300)
  await expect(editorFrame.locator("[data-form-title]")).toHaveText("")
})
