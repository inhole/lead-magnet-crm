# 프로젝트 작업 지침

- 범위 기준은 docs/execution-plan.md다. Next.js·Supabase·Vercel, UI는 shadcn/ui·Tailwind CSS를 사용한다.
- 이슈 분해·추적·PR 연결은 .agents/skills/crm-issue-management/SKILL.md를 읽는다.
- 테스트·GitHub Actions·실패 분석은 .agents/skills/crm-ci-testing/SKILL.md를 읽는다.
- shadcn 작업은 기존 .agents/skills/shadcn/SKILL.md를 읽는다.
- 요구사항/이슈 → 구현 → 검증 근거 → 문서/ADR을 연결한다. 사소한 수정까지 별도 이슈를 강제하지 않는다.
- README는 실행·테스트 방법만 담고 설계는 ADR에 둔다.
- 도구 자체 테스트 통과와 앱 기능 검증 완료를 구분한다.
- 스킬 설치는 이슈 게시·PR 댓글·푸시·배포의 포괄적 승인을 의미하지 않는다. 사용자 요청 범위 안에서 수행한다.
- 이 프로젝트의 Git 커밋 메시지는 한글로 작성한다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
