# ADR-006: 공개 쓰기 경계와 OpenAPI 계약

## 상태

채택

## 결정

운영자 API는 Supabase 세션과 RLS를 모두 요구한다. 공개 폼 조회는 제한된 DB 함수만 사용하고, 방문·신청 쓰기는 서버 Route Handler가 식별자와 입력 스키마를 검증한 뒤 service role 전용 RPC를 호출한다. 구현된 HTTP 경로·요청·응답·오류는 `docs/api/openapi.yaml`을 단일 계약으로 관리하고 `/api-docs`에서 제공한다.

## 이유

브라우저에 공개 DB 쓰기 권한을 주면 링크·방문·신청 관계 검증을 우회할 수 있다. service role은 RLS를 우회하므로 서버 경계에서 공개 식별자, 링크 소속, 방문 소속과 payload를 재검증해야 한다. 또한 동적 Route Handler만으로는 평가자와 클라이언트가 상태 코드와 재시도 동작을 알기 어렵다.

## 영향

- service role 키는 서버 환경에만 존재하며 응답·Summary·artifact에 포함하지 않는다.
- 공개 신청은 새 저장 시 201, 동일 요청 재전송 시 200, 같은 키의 다른 payload는 409를 반환한다.
- OpenAPI 경로·메서드 누락과 성공·실패 응답 누락을 단위 테스트로 차단한다.
