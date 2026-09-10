# 배포 및 새 DB 재현 런북

이 문서는 P09 배포 검증 절차다. 운영 DB를 초기화하거나 기존 데이터를 삭제하지 않는다. 전체 성공 흐름은 `P09 검증` 접두사를 사용한 별도 데이터로 실행하고, 생성한 레코드 ID를 기록해 해당 레코드만 정리한다.

## 1. 사전 조건

- Node.js와 `npm ci`가 실행 가능한 환경
- Supabase 프로젝트 관리자 권한 및 DB 비밀번호
- Vercel 프로젝트 관리자 권한
- `.env.example`의 환경변수 3개를 Vercel Production에 설정
- 실제 이메일이 아닌 검증 전용 운영자 계정 2개

비밀값, DB 연결 문자열, service role 키는 터미널 출력·이슈·PR·문서에 남기지 않는다.

## 2. 새 Supabase DB 재현

프로젝트 루트에서 CLI 인증과 대상을 명시한다.

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase migration list --linked
npx supabase db push --linked --dry-run
npx supabase db push --linked
npx supabase migration list --linked
```

적용 전 `--dry-run` 결과가 `supabase/migrations`의 미적용 파일만 포함하는지 검토한다. 적용 후 로컬과 원격 migration 목록이 같아야 한다. Supabase Authentication에서 검증 전용 운영자 A/B를 만들고 두 계정 모두 이메일 인증 완료 상태로 준비한다.

## 3. 문구 기본값 백필

`202609090005_template_copy_defaults.sql`을 적용한 프로젝트에는 기존 템플릿의 등록 HTML을 다시 파싱해 문구 컬럼을 채우는 백필을 한 번 실행한다. `NEXT_PUBLIC_SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`가 현재 셸에 설정된 상태에서 실행한다. 이 마이그레이션 이후 등록한 템플릿은 등록 시점에 문구가 채워지므로 백필 대상이 아니다.

```bash
npm run backfill:template-copy
```

## 4. Vercel 배포

Vercel Production 환경에 아래 값을 설정하고 `main`의 검증 완료 커밋을 배포한다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

배포 URL의 비인증·문서·공개 DB 경계는 쓰기 없이 확인한다.

```bash
npm run test:deployment:smoke -- https://<production-domain>
```

6건이 모두 통과해야 한다. 이 검사는 로그인, 데이터 생성, 삭제를 수행하지 않는다.

## 5. 전체 성공 흐름

아래 순서를 실제 브라우저에서 수행하고 생성한 ID와 결과만 기록한다. 비밀번호와 신청 원문은 기록하지 않는다.

1. 운영자 A로 로그인한다.
2. 샘플 HTML을 `P09 검증 템플릿` 이름으로 등록한다.
3. `P09 검증 캠페인`을 생성하고 공개 폼과 4개 채널 링크를 확인한다.
4. 한 채널 링크를 시크릿 창에서 열어 방문을 1회 기록하고 검증용 신청을 1회 제출한다.
5. 같은 idempotency key의 재시도가 신청 건수를 늘리지 않는지 확인한다.
6. 운영자 A의 캠페인 상세에서 방문·고유 방문자·신청·전환율과 신청 상세를 확인한다.
7. 운영자 B로 로그인해 운영자 A의 캠페인·신청에 접근할 수 없는지 확인한다.
8. 기록한 ID에 해당하는 검증 데이터만 정리한다. 정리 전후 건수를 기록한다.

## 6. 완료 근거

- Supabase 원격 migration 목록
- Vercel 배포 커밋 SHA와 Production URL
- 배포 스모크 6건 결과
- 운영자 A/B 소유권 차단 및 성공 흐름 체크 결과
- 생성·정리한 검증 데이터 ID 목록

실패 시 앱 배포는 Vercel에서 직전 정상 배포로 되돌린다. DB 마이그레이션은 이미 적용된 파일을 수정하거나 임의로 되돌리지 않고, 복구용 새 migration을 코드 리뷰와 dry-run 후 적용한다.
