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
