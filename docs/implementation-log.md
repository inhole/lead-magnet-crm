# 구현 진행 기록

## P01 — 앱·shadcn·CI 기반

- 상태: 검증 완료
- 변경: Next.js App Router, TypeScript, Tailwind v4, shadcn Base UI `base-nova` 초기화와 공식 컴포넌트, 관리자 캠페인 목록·로그인 화면 적용, 품질 CI, ADR-001
- 검증: `shadcn info --json`, `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`
- 결과: CLI가 설치 컴포넌트를 인식하고 앱 검증 명령이 통과
- 미완료: Supabase 인증·RLS·실제 캠페인 데이터는 P02에서 구현

## P02 — DB·로그인·소유권

- 상태: 코드 검증 완료
- 변경: Supabase SSR 클라이언트, 로그인·로그아웃·현재 사용자 API, proxy 세션 갱신, 로그인 화면, .env.example, 초기 스키마·RLS 마이그레이션, ADR-002
- 검증: npm run lint, npm run typecheck, npm run build 통과
- 미실행: 실제 Supabase 프로젝트 연결·마이그레이션 적용·운영자 A/B 권한 통합 테스트 (환경변수와 DB 미제공)

## P03 — HTML 등록·격리 미리보기

- 상태: 코드 및 로컬 HTTP 검증 완료
- 변경: parse5 허용 목록 검증, 입력 스키마 추출, 검증·등록 API, 비공개 Storage 정책, shadcn 업로드 화면, CSP sandbox 미리보기, 정상 샘플과 작성 규칙, 단위 테스트 CI
- 검증: `npm run test:unit` 9건 통과, `npm run lint`, `npm run typecheck`, `npm run build`, `npm audit --audit-level=high` 통과
- HTTP 확인: `/templates/new` 200, 정상 샘플 `/api/templates/validate` 200
- 미실행: 실제 Supabase Storage 등록과 브라우저 시각 캡처 (Supabase 환경 미제공, 브라우저 자동화 런타임 초기화 실패)
- CI 후속: Linux `npm ci`에서 누락된 선택 의존성을 명시적으로 고정한 뒤 깨끗한 설치와 전체 검증 통과

## P04 — 캠페인·커스텀 폼

- 상태: 코드 및 로컬 검증 완료
- 변경: 소유 템플릿 기반 캠페인·폼 원자 생성 RPC, 목록·생성·상세·공개 조회 API, 문구 검증, shadcn 캠페인 화면과 빈·오류·로딩 상태
- 보안: RLS를 통과한 운영자 생성 함수와 제한된 공개 폼 조회 함수로 운영자 정보를 제외
- 검증: 캠페인 입력 단위 테스트 포함 npm run test:unit 13건, npm run lint, npm run typecheck, npm run build 통과
- 미실행: 실제 Supabase 마이그레이션·운영자 간 소유권 통합 테스트는 P07 환경에서 수행

## P05 — 채널 링크·방문·신청

- 상태: 코드 및 로컬 검증 완료
- 변경: 4개 채널 배포 링크, 방문·방문자·신청 스키마와 공개 RPC, 링크·방문·신청 API, 동적 공개 입력 폼, 멱등 제출과 완료·오류 상태, ADR-004
- 보안: 링크와 방문의 폼 소속을 DB 함수에서 재검증하고 공개 쓰기 RPC는 서버의 service role만 호출하도록 제한
- 검증: 신청 입력 검증 단위 테스트 포함 `npm run test:unit` 17건, `npm run lint`, `npm run typecheck`, `npm run build`, `git diff --check` 통과
- 미실행: 실제 Supabase 동시 요청·RLS 통합 테스트와 브라우저 E2E는 P07 환경에서 수행

## P06 — CRM 신청자·성과 화면

- 상태: 코드 및 로컬 검증 완료
- 변경: 소유권 기반 신청 목록·상세와 성과 RPC/API, 전체·채널별 지표, shadcn Table·Dialog 기반 신청자 명단과 입력값 상세, 로딩·빈 상태·오류 상태
- 지표: 방문, 고유 방문자, 신청, 신청한 고유 방문자 기준 전환율을 각각 집계해 JOIN 중복을 방지하고 직접 유입을 별도 표시
- 검증: 지표 정의 단위 테스트 포함 `npm run test:unit` 20건, `npm run lint`, `npm run typecheck`, `npm run build`, `git diff --check` 통과
- 미실행: 실제 Supabase RLS·집계 통합 테스트와 브라우저 E2E는 P07 환경에서 수행

## P07 — 앱 CI·전체 실패 흐름 검증

- 상태: 로컬 및 PR 실제 DB·브라우저 검증 완료
- 변경: Supabase CLI 로컬 구성, 운영자 A/B·캠페인 fixture, RLS·멱등·성과 통합 테스트, 데스크톱·모바일 Chromium 핵심 흐름과 iframe 격리 E2E, reporter 어댑터와 필수 suite CI
- 실행 검증: 새 로컬 Supabase에 전체 마이그레이션 적용, `npm run test:integration` 3건, `npm run test:e2e` 4건 통과
- 발견·수정: PostgreSQL 반환 컬럼 예약어 충돌과 공개 폼의 인증 proxy 오분류를 실제 실행에서 확인해 수정
- CI 판정: 결과 JSON 누락·0건·전체 건너뜀·실패를 한국어 Summary 단계에서 실패 처리하고 결과 artifact를 7일 보관
- 원격 검증: PR #13에서 PR 정책, lint·typecheck·build, 단위 테스트, 실제 DB 통합 테스트, Chromium E2E, 결과 집계 도구 통과

## P08 — API·ADR·실행 문서 정합성

- 상태: 로컬 및 PR 원격 검증 완료
- 변경: 인증·템플릿·캠페인·배포·공개 신청·CRM·성과 OpenAPI 3.1 계약, `/api/openapi` 원본과 공개 `/api-docs` Swagger UI, 구현 Route 정합성 테스트
- 문서: README 로컬·연결 Supabase 및 전체 테스트 실행 절차, ADR-005 JSONB·ADR-006 API 경계·ADR-007 UI 범위, 실행계획 현재 상태 갱신
- 검증: `npm run test:unit` 25건, `npm run lint`, `npm run typecheck`, `npm run build`, `npm audit --audit-level=high` 통과
- 원격 검증: PR #15에서 PR 정책, 결과 집계, lint·typecheck·build, 단위 테스트, 실제 DB 통합 테스트, Chromium E2E, Vercel Preview 통과
- 미완료: 연결된 Supabase·Vercel 환경의 전체 성공 흐름과 새 환경 재현은 P09에서 확인

## P09 — 최종 배포·새 환경 재현

- 상태: 공개 배포 경계 검증 완료, 원격 DB 쓰기 흐름 검증 진행 중
- 변경: 비인증 보호·로그인·Supabase 설정·OpenAPI·API 문서·공개 폼 DB 경계를 확인하는 비파괴 배포 스모크 명령, Supabase migration dry-run부터 Vercel 배포·운영자 A/B 전체 흐름까지의 재현 런북
- 배포 확인: Production `https://lead-magnet-crm.vercel.app`에서 루트 로그인 리다이렉트, 로그인 화면, 비인증 세션, OpenAPI 원본, API 문서, 존재하지 않는 공개 폼의 DB 오류 계약 확인
- 미완료: 로컬 Supabase CLI가 원격 프로젝트에 인증·link되지 않아 원격 migration 목록과 새 DB 적용은 미확인. 운영자 계정이 필요한 전체 성공 흐름은 검증 전용 데이터 생성 승인을 받은 뒤 실행
