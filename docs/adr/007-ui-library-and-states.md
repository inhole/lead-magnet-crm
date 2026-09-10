# ADR-007: shadcn/ui와 상태 중심 화면 범위

- 상태: 채택
- 날짜: 2026-09-09
- 도입: 이슈 #14, PR #15
- 구현: `src/components/ui`, `src/components/campaigns`, `src/components/forms`
- 관련 ADR: [ADR-001](001-next-app-admin-first.md), [ADR-003](003-html-contract-and-sandbox.md)

## 결정

관리자 화면은 Tailwind CSS와 shadcn/ui Base UI 컴포넌트로 구성한다. 캠페인 목록·생성·상세, 템플릿 등록, CRM 신청 상세는 숫자·표·대화상자와 명확한 로딩·빈 상태·오류 상태를 우선한다. 공개 폼은 모바일 우선으로 구성하고 업로드 HTML의 디자인은 sandbox iframe 안에서만 표시한다.

## 이유

좁은 시간 범위에서는 새로운 디자인 시스템이나 장식용 차트보다 일관된 접근성 기본값과 핵심 흐름의 상태 표현이 중요하다. 관리자 DOM과 업로드 HTML을 분리해야 스타일 충돌과 인증 문맥 노출도 줄일 수 있다.

## 영향

- 복잡한 차트, 고급 검색, 애니메이션과 범용 폼 빌더는 제외한다.
- 입력 레이블, 키보드 흐름, 모바일 가로 넘침, 제출 중 중복 방지를 완료 기준으로 유지한다.
- Swagger UI는 API 문서 전용 경로에서만 사용하며 관리자 컴포넌트 체계와 분리한다.
