# ADR-004: 방문 귀속과 신청 멱등성

- 상태: 채택
- 날짜: 2026-09-08
- 도입: 이슈 #8, PR #9
- 구현: `supabase/migrations/202609080004_public_submissions.sql`, `src/app/api/public/forms/[publicId]/visits/route.ts`
- 관련 ADR: [ADR-006](006-api-boundaries-and-contract.md)

## 결정

- 공개 폼 진입마다 클라이언트가 새 `event_key`를 만들고, 브라우저별 `visitor_id`는 로컬 저장소에서 재사용한다.
- 채널은 URL의 문자열이 아니라 폼에 속한 `distribution_links.link_token`을 서버가 조회해 귀속한다. 토큰이 없으면 직접 유입으로 기록한다.
- 방문의 `(form_id, event_key)`와 신청의 `(form_id, idempotency_key)`에 데이터베이스 유일 제약을 둔다.
- 동일 신청 키의 동일 방문·입력값은 기존 결과를 반환하고, 다른 요청은 충돌로 거부한다.
- 공개 쓰기 함수는 `service_role`에만 허용하고 Route Handler가 입력 스키마와 식별자 형식을 검증한 뒤 호출한다.

## 이유

React 재실행과 네트워크 재시도로 같은 진입이나 신청이 중복 저장되는 것을 데이터베이스 수준에서 막는다.

## 영향

새로고침은 새 진입으로 기록되며 브라우저 저장소 초기화나 기기 변경은 새 방문자로 집계된다. 링크 토큰은 유입 귀속 수단이며 광고 사기 방지나 사용자 신원 증명 수단으로 간주하지 않는다. 실제 동시 요청과 공개 권한 경계는 로컬 Supabase 통합 테스트에서 검증한다.
