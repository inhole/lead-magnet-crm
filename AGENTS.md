# 프로젝트 작업 지침

- 범위 기준은 docs/execution-plan.md다. Next.js·Supabase·Vercel, UI는 shadcn/ui·Tailwind CSS를 사용한다.
- 이슈 분해·추적·PR 연결은 .agents/skills/crm-issue-management/SKILL.md를 읽는다.
- 테스트·GitHub Actions·실패 분석은 .agents/skills/crm-ci-testing/SKILL.md를 읽는다.
- shadcn 작업은 기존 .agents/skills/shadcn/SKILL.md를 읽는다.
- 요구사항/이슈 → 구현 → 검증 근거 → 문서/ADR을 연결한다. 사소한 수정까지 별도 이슈를 강제하지 않는다.
- 구현 작업은 기존 GitHub 이슈를 확인한 뒤 `type/이슈번호-slug` 브랜치에서 진행하고 PR로 `main`에 병합한다.
- PR 제목은 커밋과 같은 형식을 사용하고 본문에 `Closes #이슈번호`를 포함한다.
- `main` 병합 전 PR 정책, 앱 품질 검사, 단위 테스트가 모두 통과해야 하며 미구현 통합·E2E를 통과로 보고하지 않는다.
- README는 실행·테스트 방법만 담고 설계는 ADR에 둔다.
- 도구 자체 테스트 통과와 앱 기능 검증 완료를 구분한다.
- 스킬 설치는 이슈 게시·PR 댓글·푸시·배포의 포괄적 승인을 의미하지 않는다. 사용자 요청 범위 안에서 수행한다.
- Git 커밋 메시지는 Conventional Commits의 영문 type과 백틱으로 감싼 한글 제목을 사용한다. 형식은 type: `한글 제목`이며 type은 feat, fix, docs, test, refactor, chore, ci 중 변경 성격에 맞게 고른다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
