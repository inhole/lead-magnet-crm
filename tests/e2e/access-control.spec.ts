import { expect, test } from "@playwright/test"

import { ids } from "../helpers/local-supabase"

const adminPaths = ["/", "/templates", "/performance", `/campaigns/${ids.campaign}`]
const operatorApiPaths = ["/api/metrics", "/api/templates", "/api/campaigns", `/api/campaigns/${ids.campaign}/metrics`, `/api/campaigns/${ids.campaign}/submissions`]

test("비인증 방문자는 관리자 화면에서 로그인으로 이동한다", async ({ page }) => {
  for (const path of adminPaths) {
    await page.goto(path)
    await expect(page).toHaveURL("/login")
    await expect(page.getByRole("button", { name: "로그인" })).toBeVisible()
  }
})

test("비인증 요청은 운영자 API에서 신청자 데이터를 받지 못한다", async ({ request }) => {
  for (const path of operatorApiPaths) {
    const response = await request.get(path, { maxRedirects: 0 })
    expect(response.status(), path).toBe(307)
    expect(response.headers().location, path).toBe("/login")
    expect(await response.text(), path).not.toContain("submission")
  }
  const session = await request.get("/api/auth/me")
  expect(session.status()).toBe(200)
  expect((await session.json()).user).toBeNull()
})

test("공개 폼과 API 문서는 로그인 없이 열린다", async ({ page, request }) => {
  await page.goto(`/f/${ids.publicId}`)
  await expect(page).toHaveURL(`/f/${ids.publicId}`)
  await expect(page.frameLocator('iframe[title="자료 신청"]').getByRole("heading", { name: "자료 신청" })).toBeVisible()

  const form = await request.get(`/api/public/forms/${ids.publicId}`)
  expect(form.status()).toBe(200)
  expect((await form.json()).form.title).toBe("자료 신청")

  const docs = await request.get("/api-docs")
  expect(docs.status()).toBe(200)
})
