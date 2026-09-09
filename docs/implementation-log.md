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

- 상태: 원격 migration 및 공개 배포 경계 검증 완료, 운영자 쓰기 흐름 검증 진행 중
- 변경: 비인증 보호·로그인·Supabase 설정·OpenAPI·API 문서·공개 폼 DB 경계를 확인하는 비파괴 배포 스모크 명령, Supabase migration dry-run부터 Vercel 배포·운영자 A/B 전체 흐름까지의 재현 런북
- 배포 확인: Production `https://lead-magnet-crm.vercel.app`에서 루트 로그인 리다이렉트, 로그인 화면, 비인증 세션, OpenAPI 원본, API 문서, 존재하지 않는 공개 폼의 DB 오류 계약 확인
- 원격 DB 확인: 연결된 Supabase에서 `202609080001`~`202609080005`의 로컬·원격 migration 이력이 일치하고 `db push --linked --dry-run`이 up to date로 통과
- 미완료: 운영자 계정이 필요한 Production 전체 성공 흐름과 A/B 소유권 차단은 검증 전용 데이터로 확인 필요

## P10 — 제출 검수와 접근 안내

- 상태: 제출 자료 초안 작성, 최종 수동 흐름 및 제출 커밋 확정 대기
- 변경: 저장소·데모·API 문서 주소, Supabase·Vercel·CI 근거, 평가자 계정 전달 원칙, 지원·미지원 범위, 최종 수동 체크리스트와 제출 메일 초안 정리
- 보안: 운영자 비밀번호·Supabase 키·신청자 원문은 문서화하지 않고 평가자 계정은 비공개 채널로 별도 전달
- 남은 확인: P10 병합 SHA의 CI·Production 배포, 저장소 공개 상태 의도 확인, 연결된 Production에서 운영자 A/B 전체 흐름 실행

## P10 후속 QA — 실제 사용 오류와 관리자 UX

- 상태: 로컬 코드·화면 검증 완료, 실제 DB·브라우저 전체 흐름 검증 대기
- 이슈: #20
- 변경: 채널 링크 RPC 컬럼 충돌 수정, 워크스페이스 전체 성과 RPC/API, 공통 관리자 GNB·로그아웃, 직접 유입 폼 열기·URL 복사, 템플릿 작성 규칙·AI 프롬프트, 캠페인 생성 시각 표시
- UI 수정: Input 높이와 마지막 필드 하단 여백을 보정하고 누락된 popover 테마 토큰과 모달 배경 명암을 추가
- 검증: `npm run lint`, `npm run typecheck`, `npm run test:unit` 28건, `npm run build`, 로그인 화면 브라우저 렌더링·계산 스타일·콘솔 오류 확인 통과
- 미실행: Docker Desktop 엔진이 시작되지 않아 새 마이그레이션 기반 통합 테스트와 Playwright E2E는 현재 로컬에서 실행하지 못함
- 2차 QA: 전체 성과를 `/performance`로 분리하고 GNB의 임시 가로 스크롤을 제거했으며, 캠페인의 공개/미공개 상태와 공개 폼·방문·신청 차단 경계를 추가
- 원격 DB 진단: `202609090001` 미적용으로 전체 성과·채널 링크 RPC가 없어 운영 환경에서 `DATABASE_ERROR`가 발생함을 migration list로 확인
- 적용 대기: 원격 dry-run에서 `202609090001_post_p10_qa.sql`, `202609090002_campaign_publication.sql` 두 건만 적용 대상으로 확인

## P03/P04 후속 — HTML 템플릿 기반 커스텀 폼

- 상태: 로컬 구현 및 전체 검증 완료
- 이슈: #24
- 변경: `/templates` 소유 템플릿 목록·상세, 템플릿 미리보기 API, 캠페인 Select 이름 표시, 업로드 HTML의 원문 문구를 캠페인 기본값으로 적용, 업로드 HTML 기반 공개 신청 폼
- UX: 템플릿 표의 좌우·행 여백과 신청 입력값 모달의 폭을 늘리고 HTML 필드 라벨을 표시함. 캠페인 등록 CTA를 캠페인 목록으로 이동하고, 공개 iframe의 테두리·외부 여백을 제거했으며 콘텐츠 높이를 메시지로 동기화해 내부 스크롤을 없앰
- 격리: 저장 HTML 재검증, sandbox iframe, CSP `form-action 'none'`, iframe window와 일회성 토큰을 함께 확인하는 시스템 제출 브리지
- 검증: lint, typecheck, 단위 테스트 35건, 실제 Supabase 통합 테스트 6건, 데스크톱·모바일 E2E 10건, 프로덕션 build 통과

## 개선 A — 캠페인 배포 링크 즉시 표시

- 상태: 로컬 구현 및 전체 검증 완료
- 이슈: #28
- 변경: `campaign_forms` 삽입 시 4개 채널 링크를 만드는 트리거와 기존 폼 백필, 읽기 전용 `get_campaign_links`, `GET /api/campaigns/[id]/links`의 읽기 전용 전환, 캠페인 상세 마운트 시 링크 조회
- UX: 링크 생성 버튼 없이 4개 채널 링크를 바로 표시하고, 조회 중에는 로딩 표시를, 링크가 비어 있을 때만 복구 버튼을 노출함
- 경계: GET은 더 이상 데이터를 쓰지 않으며 누락 복구는 POST의 `ensure_campaign_links`가 담당함. 소유자가 아닌 운영자는 `P0002`로 차단됨
- 검증: lint, typecheck, 단위 테스트 35건, 새 로컬 DB 초기화 후 통합 테스트 7건, 데스크톱·모바일 E2E 10건, 프로덕션 build 통과
- 참고: 채널 성과 표가 항상 다섯 채널을 표시하므로 E2E는 채널명 대신 링크 복사 버튼 수로 배포 링크를 확인함

## 개선 B — 신청 입력값 선택지 라벨 표시

- 상태: 로컬 구현 및 전체 검증 완료
- 이슈: #30
- 원인: 라디오 그룹 라벨이 첫 선택지의 라벨을 그대로 썼고, 셀렉트는 사람이 읽는 텍스트 없이 원시 `value`만 저장했으며, 체크박스는 같은 name을 등록 단계에서 거부해 그룹 자체를 만들 수 없었다
- 변경: `validateFormHtml`이 라디오·체크박스를 감싼 `div`의 `data-form-group-label`(없으면 그룹 앞 첫 텍스트, 그것도 없으면 name)로 그룹 제목을 정하고 각 선택지·셀렉트 옵션에 `{ value, label }`을 함께 담도록 함. 같은 name의 체크박스 그룹 등록을 허용함. `validateSubmissionValues`가 체크박스 그룹 값을 옵션 목록과 비교해 검증함. 표시 로직을 `src/lib/submissions/display.ts`로 분리해 값을 라벨로 매핑함
- 호환: 문자열 배열 `options`를 읽어 `{ value, label }`로 바꾸는 `normalizeFormFields`를 두고, 기존 `html_templates.input_schema`를 새 형태로 옮기는 마이그레이션(`202609090004_option_labels.sql`)을 추가함
- 문서: `docs/html-template-rules.md`에 그룹 제목 규칙과 예시, `src/lib/forms/ai-prompt.ts`와 `samples/lead-form.html`에 라디오·체크박스 그룹 예시, `docs/api/openapi.yaml`의 `FormField.options` 스키마를 갱신함
- 검증: lint, typecheck, 단위 테스트 48건, 새 로컬 DB 초기화 후 통합 테스트 8건(레거시 옵션 형태의 마이그레이션 SQL은 롤백 트랜잭션으로 별도 재현), 데스크톱·모바일 E2E 12건, 프로덕션 build 통과
