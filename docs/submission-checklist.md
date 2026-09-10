# 최종 제출 체크리스트

작성 기준일은 2026-09-10이며, 실제 제출 직전에 `main` SHA와 CI 링크를 최종 값으로 갱신한다. 이 문서에는 운영자 비밀번호, Supabase 키, 신청자 원문을 기록하지 않는다.

## 제출 대상

| 항목 | 값 | 확인 |
| --- | --- | --- |
| 저장소 | https://github.com/inhole/lead-magnet-crm | 공개 저장소, 별도 초대 불필요 |
| 데모 | https://lead-magnet-crm.vercel.app | 비인증 루트는 `/login`으로 이동 |
| API 문서 | https://lead-magnet-crm.vercel.app/api-docs | 공개 접근 가능 |
| OpenAPI 원본 | https://lead-magnet-crm.vercel.app/api/openapi | 공개 접근 가능 |
| 제출 후보 기준 SHA | `7dbdac67798597cdfa8aacd5b343e21f29aa9690` | PR #42 merge commit. 이후 커밋은 문서 변경뿐이다 |

저장소 공개 상태가 의도된 제출 방식인지 제출 직전에 다시 확인한다. 비공개로 바꾼다면 평가자 GitHub 계정을 collaborator로 초대한 뒤 실제 접근을 확인한다.

## 검증 근거

- Supabase 원격 migration: `202609080001`~`202609090005` 10개 파일의 로컬·원격 이력이 일치한다.
- Supabase dry-run: `npx supabase db push --linked --dry-run` 결과가 `Remote database is up to date.`이다.
- Production 배포: 기준 SHA의 GitHub Production deployment `6364641144`이 성공했다.
- 배포 스모크: `npm run test:deployment:smoke -- https://lead-magnet-crm.vercel.app` 6/6건 통과.
- main CI: [앱 품질 검사](https://github.com/inhole/lead-magnet-crm/actions/runs/34437689700), [CI 결과 집계 도구 검증](https://github.com/inhole/lead-magnet-crm/actions/runs/34437689503). 두 워크플로 모두 기준 SHA에서 성공했고 앱 품질 검사는 lint·typecheck·build, 단위 52건, 통합 8건, 데스크톱·모바일 E2E 20건을 포함한다.

새 변경이 `main`에 병합되면 병합 SHA의 필수 CI와 Production 배포를 다시 확인하고 위 기준 SHA를 교체한다. 이전 SHA의 성공을 최종 제출 근거로 사용하지 않는다.

## 평가자 접근

1. 평가자 전용 운영자 계정을 Supabase Authentication에 준비한다.
2. 계정 이메일과 임시 비밀번호는 저장소·이슈·PR이 아닌 합의된 비공개 채널로 전달한다.
3. 평가자는 데모 `/login`에서 로그인한 뒤 HTML 등록 → 캠페인 생성 → 채널 링크 복사 → 공개 신청 → CRM·성과 확인 순서로 사용한다.
4. 평가 완료 후 임시 비밀번호를 폐기하거나 계정을 삭제한다.

회원가입과 비밀번호 재설정 화면은 제공하지 않으므로 평가자 계정은 사전에 준비해야 한다.

## 최종 수동 확인

- [ ] 검증 전용 운영자 A로 로그인할 수 있다.
- [ ] 샘플 HTML 등록과 sandbox 미리보기가 정상이다.
- [ ] 캠페인·폼과 4개 채널 링크가 생성된다.
- [ ] 시크릿 브라우저에서 방문과 신청을 기록할 수 있다.
- [ ] 같은 idempotency key 재시도가 신청을 중복 생성하지 않는다.
- [ ] CRM 신청 상세와 전체·채널별 성과가 일치한다.
- [ ] 운영자 B가 운영자 A의 캠페인과 신청을 조회할 수 없다.
- [ ] 생성한 검증 데이터 ID만 선별 정리했다.
- [ ] 최종 `main` SHA의 필수 CI와 Production 배포가 성공했다.
- [ ] 저장소 공개/비공개 상태와 평가자 접근 방법을 확정했다.

## 지원 범위와 남은 확인

- 지원: HTML 허용 목록 검증, 텍스트·이메일·전화·숫자·선택·체크박스·라디오 입력, 4개 채널 링크, 방문·신청·CRM·성과, OpenAPI 문서.
- 미지원: 파일 첨부, 외부 폰트·이미지·스타일시트, 업로드 HTML의 JavaScript, 셀프 회원가입·비밀번호 재설정.
- 커스터마이즈 범위: 등록한 HTML의 제목, 안내 문구, 제출 버튼 문구 세 가지다. 관리자 화면에서 입력 항목을 추가·삭제하는 폼 구조 편집은 제공하지 않으며 근거는 ADR-008에 있다. 입력 항목을 바꾸려면 새 HTML을 등록한다.
- 남은 확인: 위 수동 체크리스트의 연결된 Production 전체 성공 흐름. 자동 CI의 DB/E2E는 격리된 로컬 Supabase에서 통과했으며 운영 DB 검증을 대신하지 않는다.

## 제출 메일 초안

제목: 리드마그넷 CRM 과제 제출

안녕하세요.

리드마그넷 CRM 과제를 제출합니다.

- 저장소: https://github.com/inhole/lead-magnet-crm
- 데모: https://lead-magnet-crm.vercel.app
- API 문서: https://lead-magnet-crm.vercel.app/api-docs
- 기준 커밋: `<최종 main SHA>`
- 접근 방법: 운영자 계정 정보는 `<비공개 전달 채널>`로 별도 전달드렸습니다.

로컬 실행과 테스트 방법은 README, 배포 및 새 DB 재현 절차는 `docs/deployment-runbook.md`, 주요 의사결정은 `docs/adr/README.md` 색인, 지원·미지원 범위와 검증 근거는 `docs/submission-checklist.md`에서 확인할 수 있습니다.

감사합니다.

실제 발송 전 `<...>` 자리표시자를 모두 교체하고 링크와 계정 접근을 한 번 더 확인한다.
