# lead-magnet-crm

## 요구 환경

- Node.js 22
- Docker Desktop
- npm

## 로컬 실행

```bash
npm ci
npx supabase start
npx supabase status
```

`npx supabase status`에 출력된 값을 사용해 `.env.example`을 `.env.local`로 복사하고 아래 항목을 채웁니다.

- `NEXT_PUBLIC_SUPABASE_URL`: API URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: anon key
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key
- `APP_URL`: `http://localhost:3000`

로컬 Supabase Studio(`http://127.0.0.1:54323`)의 Authentication / Users에서 이메일·비밀번호 운영자를 하나 생성합니다. `npx supabase start`는 `supabase/migrations`의 마이그레이션을 새 로컬 DB에 순서대로 적용합니다.

```bash
npm run dev
```

- 앱: `http://localhost:3000`
- API 문서: `http://localhost:3000/api-docs`
- OpenAPI 원본: `http://localhost:3000/api/openapi`

작업 후 로컬 서비스를 종료합니다.

```bash
npx supabase stop --no-backup
```

## 연결된 Supabase 사용

Supabase 프로젝트 설정의 Project URL, Publishable key, Service role key를 같은 환경변수 이름으로 등록합니다. Service role key는 서버 전용이며 브라우저 환경변수나 클라이언트 코드에 넣지 않습니다. 마이그레이션 적용은 연결된 프로젝트를 확인한 뒤 수행합니다.

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

운영자는 Supabase Dashboard의 Authentication / Users에서 사전 생성합니다. 회원가입 화면과 API는 제공하지 않습니다.

`202609090005_template_copy_defaults.sql` 적용 후에는 기존 템플릿의 등록 HTML을 다시 파싱해 문구 컬럼을 채우는 백필을 한 번 실행합니다. `NEXT_PUBLIC_SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`가 현재 셸에 설정된 상태에서 실행합니다.

```bash
npm run backfill:template-copy
```

## 검사

단위·정적·프로덕션 빌드는 Supabase 없이 실행할 수 있습니다.

```bash
npm run test:unit
npm run lint
npm run typecheck
npm run build
```

실제 DB 통합 테스트와 브라우저 E2E는 로컬 Supabase를 시작하고 위 환경변수를 현재 셸에도 설정한 상태에서 실행합니다.

```bash
npm run test:integration
npx playwright install chromium
npm run build
npm run test:e2e
```

CI는 `npm ci` 후 lint·typecheck·build, 단위 테스트, 새 로컬 Supabase 통합 테스트, 데스크톱·모바일 Chromium E2E를 각각 실행합니다.

배포 후에는 데이터를 변경하지 않는 공개 경로 스모크 검사를 실행합니다. 원격 migration 적용과 운영자 A/B 전체 흐름은 [배포 및 새 DB 재현 런북](docs/deployment-runbook.md)을 따릅니다.

```bash
npm run test:deployment:smoke -- https://<production-domain>
```
