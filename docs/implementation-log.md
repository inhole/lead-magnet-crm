# 구현 진행 기록

## P01 — 앱·shadcn·CI 기반

- 상태: 검증 완료
- 변경: Next.js App Router, TypeScript, Tailwind v4, shadcn `components.json`, 관리자 캠페인 목록 화면, 품질 CI, ADR-001
- 검증: `npm run lint`, `npm run typecheck`, `npm run build`
- 결과: 세 명령 모두 통과
- 미완료: Supabase 인증·RLS·실제 캠페인 데이터는 P02에서 구현

## P02 — DB·로그인·소유권

- 상태: 코드 검증 완료
- 변경: Supabase SSR 클라이언트, 로그인·로그아웃·현재 사용자 API, proxy 세션 갱신, 로그인 화면, .env.example, 초기 스키마·RLS 마이그레이션, ADR-002
- 검증: npm run lint, npm run typecheck, npm run build 통과
- 미실행: 실제 Supabase 프로젝트 연결·마이그레이션 적용·운영자 A/B 권한 통합 테스트 (환경변수와 DB 미제공)
