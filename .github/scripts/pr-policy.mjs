import { appendFile, readFile } from "node:fs/promises"
import { pathToFileURL } from "node:url"

const BRANCH_PATTERN = /^(feat|fix|docs|test|refactor|chore|ci)\/(\d+)-[a-z0-9]+(?:-[a-z0-9]+)*$/
const TITLE_PATTERN = /^(feat|fix|docs|test|refactor|chore|ci): (?=[^\r\n]*[가-힣])[^'\"`\r\n]+$/
const CLOSING_PATTERN = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)\b/gi

export function validatePullRequest(pullRequest) {
  const errors = []
  const base = pullRequest?.base?.ref ?? ""
  const head = pullRequest?.head?.ref ?? ""
  const title = pullRequest?.title ?? ""
  const body = pullRequest?.body ?? ""

  if (base !== "main") errors.push("PR 대상 브랜치는 main이어야 합니다.")
  const branch = BRANCH_PATTERN.exec(head)
  if (!branch) errors.push("작업 브랜치는 type/이슈번호-slug 형식이어야 합니다.")
  if (!TITLE_PATTERN.test(title)) errors.push("PR 제목은 따옴표 없이 type: 한글 제목 형식이어야 합니다.")

  const closingIssues = [...body.matchAll(CLOSING_PATTERN)].map((match) => match[1])
  if (!closingIssues.length) {
    errors.push("PR 본문에 Closes #이슈번호 종료 참조가 필요합니다.")
  } else if (branch && !closingIssues.includes(branch[2])) {
    errors.push("브랜치의 이슈 번호와 PR 종료 참조가 일치해야 합니다.")
  }
  return errors
}

export function renderSummary(errors) {
  const result = errors.length ? "실패" : "성공"
  const detail = errors.length ? errors.map((error) => `- ${error}`).join("\n") : "- 브랜치, 제목, 이슈 연결 규칙을 충족했습니다."
  return `### PR 운영 정책\n\n| 항목 | 결과 |\n| --- | --- |\n| 브랜치·제목·이슈 연결 | ${result} |\n\n${detail}\n`
}

async function main() {
  const eventPath = process.argv[2] ?? process.env.GITHUB_EVENT_PATH
  if (!eventPath) throw new Error("GitHub event JSON 경로가 필요합니다.")
  const event = JSON.parse(await readFile(eventPath, "utf8"))
  const errors = validatePullRequest(event.pull_request)
  const summary = renderSummary(errors)
  console.log(summary)
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`, "utf8")
  if (errors.length) process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main()
