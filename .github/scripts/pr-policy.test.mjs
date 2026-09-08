import assert from "node:assert/strict"
import test from "node:test"
import { renderSummary, validatePullRequest } from "./pr-policy.mjs"

const valid = {
  base: { ref: "main" },
  head: { ref: "feat/12-public-form" },
  title: "feat: `공개 신청 폼 추가`",
  body: "Closes #12",
}

test("올바른 PR 계약을 허용한다", () => {
  assert.deepEqual(validatePullRequest(valid), [])
})

test("main 외 대상 브랜치를 거부한다", () => {
  assert.match(validatePullRequest({ ...valid, base: { ref: "dev" } }).join("\n"), /main/)
})

test("잘못된 작업 브랜치명을 거부한다", () => {
  assert.match(validatePullRequest({ ...valid, head: { ref: "feature/public-form" } }).join("\n"), /작업 브랜치/)
})

test("한글과 백틱이 없는 PR 제목을 거부한다", () => {
  assert.match(validatePullRequest({ ...valid, title: "feat: add form" }).join("\n"), /PR 제목/)
})

test("종료 이슈 참조 누락을 거부한다", () => {
  assert.match(validatePullRequest({ ...valid, body: "관련 작업 #12" }).join("\n"), /Closes/)
})

test("브랜치와 종료 이슈 번호 불일치를 거부한다", () => {
  assert.match(validatePullRequest({ ...valid, body: "Fixes #13" }).join("\n"), /일치/)
})

test("정책 결과를 표 Summary로 만든다", () => {
  assert.match(renderSummary([]), /\| 브랜치·제목·이슈 연결 \| 성공 \|/)
})
